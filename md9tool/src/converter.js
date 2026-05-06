import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import JSZip from "jszip";

const defaultParts = [
  ["Hip", ""],
  ["LeftLeg1", "Hip"],
  ["LeftLeg2", "LeftLeg1"],
  ["LeftFoot", "LeftLeg2"],
  ["RightLeg1", "Hip"],
  ["RightLeg2", "RightLeg1"],
  ["RightFoot", "RightLeg2"],
  ["Waist", "Hip"],
  ["Neck", "Waist"],
  ["Face", "Neck"],
  ["Hair", "Face"],
  ["LeftArm1", "Waist"],
  ["LeftArm2", "LeftArm1"],
  ["LeftHand", "LeftArm2"],
  ["RightArm1", "Waist"],
  ["RightArm2", "RightArm1"],
  ["RightHand", "RightArm2"],
  ["Skirt", "Hip"],
  ["LeftShoe", "LeftFoot"],
  ["RightShoe", "RightFoot"]
];

const el = {
  app: document.querySelector("#converter"),
  fileInput: document.querySelector("#fileInput"),
  folderInput: document.querySelector("#folderInput"),
  exportButton: document.querySelector("#exportButton"),
  addPart: document.querySelector("#addPart"),
  autoMap: document.querySelector("#autoMap"),
  previewButton: document.querySelector("#previewButton"),
  workspace: document.querySelector("#workspace"),
  treeResizer: document.querySelector("#treeResizer"),
  sourceViewport: document.querySelector("#sourceViewport"),
  previewViewport: document.querySelector("#previewViewport"),
  tree: document.querySelector("#tree"),
  sourceList: document.querySelector("#sourceList"),
  partList: document.querySelector("#partList"),
  status: document.querySelector("#status")
};

const state = {
  files: new Map(),
  objectUrls: [],
  gltf: null,
  scene: null,
  sourceRoot: null,
  sourceSelectionRoot: null,
  previewRoot: null,
  selectedObject: null,
  selectedSourceIds: new Set(),
  previewHighlightBox: null,
  sources: [],
  parts: defaultParts.map(([name, parent]) => ({ name, parent, enabled: true, sourceIds: [] }))
};

const view = createViewports();
renderParts();
installFileHandlers();
installDropHandlers();
installResizer();
animate();

function installFileHandlers() {
  el.fileInput.addEventListener("change", () => {
    addFiles([...el.fileInput.files]);
    el.fileInput.value = "";
  });
  el.folderInput.addEventListener("change", () => {
    addFiles([...el.folderInput.files]);
    el.folderInput.value = "";
  });
  el.addPart.addEventListener("click", () => {
    state.parts.push({ name: `Part${state.parts.length + 1}`, parent: "", enabled: true, sourceIds: [] });
    renderParts();
  });
  el.autoMap.addEventListener("click", autoMapParts);
  el.previewButton.addEventListener("click", refreshPreview);
  el.exportButton.addEventListener("click", exportZip);
}

function createViewports() {
  const source = createViewport(el.sourceViewport);
  const preview = createViewport(el.previewViewport);
  const grid = new THREE.GridHelper(4, 8, 0x3a4652, 0x242b33);
  source.scene.add(grid);
  preview.scene.add(grid.clone());
  syncControls(source, preview);
  syncControls(preview, source);
  const observer = new ResizeObserver(() => {
    resizeViewport(source, el.sourceViewport);
    resizeViewport(preview, el.previewViewport);
  });
  observer.observe(el.sourceViewport);
  observer.observe(el.previewViewport);
  resizeViewport(source, el.sourceViewport);
  resizeViewport(preview, el.previewViewport);
  return { source, preview };
}

function createViewport(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111316);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2c3540, 2.2));
  const light = new THREE.DirectionalLight(0xffffff, 1.6);
  light.position.set(2, 4, 3);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  camera.position.set(0, 1.2, 3);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  return { scene, camera, renderer, controls, syncing: false };
}

function syncControls(source, target) {
  source.controls.addEventListener("change", () => {
    if (source.syncing) return;
    target.syncing = true;
    target.camera.position.copy(source.camera.position);
    target.camera.quaternion.copy(source.camera.quaternion);
    target.camera.zoom = source.camera.zoom;
    target.camera.near = source.camera.near;
    target.camera.far = source.camera.far;
    target.camera.updateProjectionMatrix();
    target.controls.target.copy(source.controls.target);
    target.controls.update();
    target.syncing = false;
  });
}

function resizeViewport(item, container) {
  const rect = container.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  item.camera.aspect = width / height;
  item.camera.updateProjectionMatrix();
  item.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  item.renderer.setSize(width, height, true);
}

async function addFiles(files) {
  for (const file of files) {
    const key = pathKey(file.webkitRelativePath || file.name);
    state.files.set(key, file);
    state.files.set(file.name.toLowerCase(), file);
  }
  const gltfFile = files.find((file) => /\.(gltf|glb)$/i.test(file.name));
  if (gltfFile) await loadGltf(gltfFile);
}

async function loadGltf(file) {
  clearObjectUrls();
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    const clean = pathKey(decodeURIComponent(url));
    const file = state.files.get(clean) || state.files.get(clean.split("/").pop());
    if (!file) return url;
    const objectUrl = URL.createObjectURL(file);
    state.objectUrls.push(objectUrl);
    return objectUrl;
  });
  const loader = new GLTFLoader(manager);
  const url = URL.createObjectURL(file);
  state.objectUrls.push(url);
  try {
    state.gltf = await loader.loadAsync(url);
    state.scene = state.gltf.scene;
    state.scene.updateMatrixWorld(true);
    showSourceScene(state.scene);
    collectSources();
    renderTree();
    renderSources();
    renderParts();
    el.exportButton.disabled = false;
    el.autoMap.disabled = false;
    el.previewButton.disabled = false;
    setStatus(`已加载 ${file.webkitRelativePath || file.name}，发现 ${state.sources.length} 个 mesh/primitive`);
  } catch (error) {
    console.error(error);
    setStatus(`glTF 加载失败: ${file.name}`);
  }
}

function showSourceScene(scene) {
  if (state.sourceRoot) view.source.scene.remove(state.sourceRoot);
  if (state.sourceSelectionRoot) {
    view.source.scene.remove(state.sourceSelectionRoot);
    disposeObject(state.sourceSelectionRoot);
    state.sourceSelectionRoot = null;
  }
  state.sourceRoot = scene;
  view.source.scene.add(state.sourceRoot);
  frameObject(state.sourceRoot);
}

function frameObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z, 1);
  for (const item of [view.source, view.preview]) {
    item.controls.target.copy(center);
    item.camera.near = Math.max(radius / 1000, 0.01);
    item.camera.far = radius * 20;
    item.camera.position.set(center.x, center.y + radius * 0.25, center.z + radius * 1.8);
    item.camera.updateProjectionMatrix();
    item.controls.update();
  }
}

function collectSources() {
  state.sources = [];
  let id = 0;
  state.scene.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return;
    const geometry = object.geometry;
    const groups = geometry.groups?.length ? geometry.groups : [{ start: 0, count: geometry.index?.count || geometry.getAttribute("position").count, materialIndex: 0 }];
    for (const group of groups) {
      const material = Array.isArray(object.material) ? object.material[group.materialIndex] : object.material;
      state.sources.push({
        id: String(id++),
        type: "primitive",
        object,
        geometry,
        group,
        materialIndex: group.materialIndex || 0,
        material,
        originalMaterial: material,
        wireMaterial: makeWireMaterial(),
        label: `${object.name || "Mesh"} / ${material?.name || "Material"}`
      });
    }
    if (object.isSkinnedMesh) {
      const virtualSources = buildBoneSources(object, () => String(id++));
      state.sources.push(...virtualSources);
    }
  });
  updateSourceMaterials();
}

function buildBoneSources(object, nextId) {
  const geometry = object.geometry;
  const skinIndex = geometry.getAttribute("skinIndex");
  const skinWeight = geometry.getAttribute("skinWeight");
  const position = geometry.getAttribute("position");
  if (!skinIndex || !skinWeight || !position || !object.skeleton) return [];

  const sourcesByBone = new Map();
  const groups = geometry.groups?.length ? geometry.groups : [{ start: 0, count: geometry.index?.count || position.count, materialIndex: 0 }];
  const indexAttr = geometry.index;
  const threshold = 0.1;

  for (const group of groups) {
    const material = Array.isArray(object.material) ? object.material[group.materialIndex] : object.material;
    const unassignedKey = `unassigned:${group.materialIndex || 0}`;
    for (let i = group.start; i < group.start + group.count; i += 3) {
      const vertexIndices = [0, 1, 2].map((offset) => (indexAttr ? indexAttr.getX(i + offset) : i + offset));
      const { boneIndices, hasThresholdHit } = collectTriangleBones(vertexIndices, skinIndex, skinWeight, threshold);
      if (!hasThresholdHit) {
        if (!sourcesByBone.has(unassignedKey)) {
          sourcesByBone.set(unassignedKey, {
            id: nextId(),
            type: "bone",
            object,
            bone: null,
            boneUuid: "",
            geometry,
            material,
            materialIndex: group.materialIndex || 0,
            originalMaterial: material,
            wireMaterial: makeWireMaterial(),
            label: `${object.name || "SkinnedMesh"} / Unassigned`
          });
        }
        const unassigned = sourcesByBone.get(unassignedKey);
        if (!unassigned.triangles) unassigned.triangles = [];
        addTriangleToSource(unassigned, vertexIndices);
      }
      for (const boneIndex of boneIndices) {
        const bone = object.skeleton.bones[boneIndex];
        if (!bone) continue;
        const key = `${bone.uuid}:${group.materialIndex || 0}`;
        if (!sourcesByBone.has(key)) {
          sourcesByBone.set(key, {
            id: nextId(),
            type: "bone",
            object,
            bone,
            boneUuid: bone.uuid,
            geometry,
            material,
            materialIndex: group.materialIndex || 0,
            originalMaterial: material,
            wireMaterial: makeWireMaterial(),
            label: `${object.name || "SkinnedMesh"} / ${bone.name || "Bone"}`
          });
        }
        const source = sourcesByBone.get(key);
        if (!source.triangles) source.triangles = [];
        addTriangleToSource(source, vertexIndices);
      }
    }
  }
  return buildRemainderBoneSources([...sourcesByBone.values()], nextId);
}

function addTriangleToSource(source, vertexIndices) {
  if (!source.triangles) source.triangles = [];
  if (!source.triangleKeys) source.triangleKeys = new Set();
  const key = triangleKey(vertexIndices);
  if (source.triangleKeys.has(key)) return;
  source.triangleKeys.add(key);
  source.triangles.push(vertexIndices);
}

function buildRemainderBoneSources(rawSources, nextId) {
  const result = [];
  for (const source of rawSources) {
    if (!source.triangles?.length) continue;
    if (!source.bone) {
      result.push(source);
      continue;
    }
    const descendantKeys = new Set();
    for (const candidate of rawSources) {
      if (!candidate.bone || candidate.materialIndex !== source.materialIndex) continue;
      if (!isDescendantBone(candidate.bone, source.bone)) continue;
      for (const key of candidate.triangleKeys || []) descendantKeys.add(key);
    }
    const remainder = source.triangles.filter((triangle) => !descendantKeys.has(triangleKey(triangle)));
    if (!remainder.length) continue;
    result.push({
      ...source,
      id: nextId(),
      isRemainder: true,
      triangles: remainder,
      triangleKeys: new Set(remainder.map(triangleKey)),
      label: `${source.object.name || "SkinnedMesh"} / ${source.bone.name || "Bone"} self`
    });
  }
  return result;
}

function isDescendantBone(candidate, ancestor) {
  let parent = candidate.parent;
  while (parent) {
    if (parent === ancestor) return true;
    parent = parent.parent;
  }
  return false;
}

function triangleKey(vertexIndices) {
  return vertexIndices.join("/");
}

function collectTriangleBones(vertexIndices, skinIndex, skinWeight, threshold) {
  const result = new Set();
  const scores = new Map();
  let hasThresholdHit = false;
  for (const vertexIndex of vertexIndices) {
    for (let i = 0; i < 4; i++) {
      const boneIndex = skinIndex.getComponent(vertexIndex, i);
      const weight = skinWeight.getComponent(vertexIndex, i);
      if (weight <= 0) continue;
      scores.set(boneIndex, (scores.get(boneIndex) || 0) + weight);
      if (weight >= threshold) {
        result.add(boneIndex);
        hasThresholdHit = true;
      }
    }
  }
  if (!result.size && scores.size) {
    let bestIndex = -1;
    let bestScore = -Infinity;
    for (const [boneIndex, score] of scores) {
      if (score > bestScore) {
        bestIndex = boneIndex;
        bestScore = score;
      }
    }
    if (bestIndex !== -1) result.add(bestIndex);
  }
  return { boneIndices: result, hasThresholdHit };
}

function renderTree() {
  el.tree.classList.remove("empty");
  el.tree.replaceChildren(renderNode(state.scene));
}

function renderNode(object, depth = 0) {
  const container = document.createElement("div");
  const row = document.createElement("button");
  row.type = "button";
  row.className = `tree-row${state.selectedObject === object ? " selected" : ""}`;
  row.style.setProperty("--depth", depth);
  const marker = object.isMesh || object.isSkinnedMesh ? " [mesh]" : "";
  row.textContent = `${object.name || object.type}${marker}`;
  row.addEventListener("click", (event) => {
    selectObject(object, event.ctrlKey || event.metaKey);
  });
  container.append(row);
  if (object.isBone) {
    for (const source of state.sources.filter((item) => item.type === "bone" && item.bone === object && item.isRemainder)) {
      const virtualRow = document.createElement("button");
      virtualRow.type = "button";
      virtualRow.className = `tree-row virtual${state.selectedSourceIds.has(source.id) ? " selected" : ""}`;
      virtualRow.style.setProperty("--depth", depth + 1);
      virtualRow.textContent = `${object.name || "Bone"} self [virtual]`;
      virtualRow.addEventListener("click", (event) => {
        event.stopPropagation();
        selectSource(source.id, event.ctrlKey || event.metaKey);
      });
      container.append(virtualRow);
    }
  }
  if (object.children.length) {
    for (const child of object.children) container.append(renderNode(child, depth + 1));
  }
  return container;
}

function renderSources() {
  el.sourceList.classList.remove("empty");
  el.sourceList.replaceChildren();
  for (const source of state.sources) {
    const item = document.createElement("div");
    item.className = `source-item${state.selectedSourceIds.has(source.id) ? " selected" : ""}`;
    item.addEventListener("click", (event) => selectSource(source.id, event.ctrlKey || event.metaKey));
    const title = document.createElement("div");
    title.textContent = source.label;
    const small = document.createElement("small");
    small.textContent =
      source.type === "bone"
        ? `id ${source.id}, bone split, faces ${source.triangles.length}`
        : `id ${source.id}, mesh primitive, vertices ${source.geometry.getAttribute("position")?.count || 0}`;
    const input = document.createElement("input");
    input.type = "text";
    input.value = source.label;
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("input", () => {
      source.label = input.value.trim() || source.label;
      title.textContent = source.label;
      renderParts();
    });
    item.append(title, small, input);
    el.sourceList.append(item);
  }
}

function renderParts() {
  el.partList.replaceChildren();
  for (const [index, part] of state.parts.entries()) {
    const row = document.createElement("div");
    row.className = "part-row";

    const enabled = document.createElement("input");
    enabled.type = "checkbox";
    enabled.checked = part.enabled;
    enabled.addEventListener("input", () => (part.enabled = enabled.checked));

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "部件名";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = part.name;
    nameInput.maxLength = 31;
    nameInput.addEventListener("input", () => {
      part.name = nameInput.value.trim();
      renderParts();
    });
    nameLabel.append(nameInput);

    const parentLabel = document.createElement("label");
    parentLabel.textContent = "父部件";
    const parentSelect = document.createElement("select");
    parentSelect.append(new Option("(root)", ""));
    for (const candidate of state.parts) {
      if (candidate === part) continue;
      parentSelect.append(new Option(candidate.name, candidate.name));
    }
    parentSelect.value = part.parent;
    parentSelect.addEventListener("change", () => (part.parent = parentSelect.value));
    parentLabel.append(parentSelect);

    const sourceBox = document.createElement("div");
    sourceBox.className = "mapped-sources";
    const sourceTitle = document.createElement("div");
    sourceTitle.className = "field-title";
    sourceTitle.textContent = "源 mesh / material";
    const chips = document.createElement("div");
    chips.className = "source-chips";
    for (const sourceId of part.sourceIds) {
      const source = state.sources.find((item) => item.id === sourceId);
      if (!source) continue;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `source-chip${state.selectedSourceIds.has(source.id) ? " selected" : ""}`;
      chip.textContent = source.label;
      chip.title = "点击高亮，右侧 x 删除";
      chip.addEventListener("click", (event) => selectSource(source.id, event.ctrlKey || event.metaKey));
      const removeSource = document.createElement("span");
      removeSource.textContent = "x";
      removeSource.addEventListener("click", (event) => {
        event.stopPropagation();
        part.sourceIds = part.sourceIds.filter((id) => id !== source.id);
        renderParts();
      });
      chip.append(removeSource);
      chips.append(chip);
    }
    if (!part.sourceIds.length) {
      const empty = document.createElement("div");
      empty.className = "source-empty";
      empty.textContent = "未添加源 mesh";
      chips.append(empty);
    }
    const addSelected = document.createElement("button");
    addSelected.type = "button";
    addSelected.textContent = "添加选中源";
    const selectedIds = [...state.selectedSourceIds].filter((id) => !part.sourceIds.includes(id));
    addSelected.disabled = selectedIds.length === 0;
    addSelected.addEventListener("click", () => {
      const ids = [...state.selectedSourceIds].filter((id) => !part.sourceIds.includes(id));
      if (!ids.length) return;
      part.sourceIds.push(...ids);
      renderParts();
    });
    sourceBox.append(sourceTitle, chips, addSelected);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => {
      state.parts.splice(index, 1);
      renderParts();
    });

    row.append(enabled, nameLabel, parentLabel, sourceBox, remove);
    el.partList.append(row);
  }
}

function autoMapParts() {
  for (const part of state.parts) {
    const key = simplifyName(part.name);
    part.sourceIds = state.sources
      .filter((source) => simplifyName(source.object.name).includes(key) || simplifyName(source.material?.name || "").includes(key))
      .map((source) => source.id);
  }
  renderParts();
}

function selectObject(object, additive = false) {
  state.selectedObject = object;
  const ids = collectSourceIdsForObject(object);
  updateSelection(ids, additive);
  if (!ids.length) setStatus(`节点 ${object.name || object.type} 没有可映射 mesh`);
  renderTree();
  renderSources();
  renderParts();
}

function selectSource(id, additive = false) {
  const source = state.sources.find((item) => item.id === id);
  if (!source) return;
  state.selectedObject = source.object;
  updateSelection([id], additive);
  renderTree();
  renderSources();
  renderParts();
}

function updateSelection(ids, additive) {
  if (!additive) state.selectedSourceIds.clear();
  for (const id of ids) {
    if (additive && state.selectedSourceIds.has(id)) state.selectedSourceIds.delete(id);
    else state.selectedSourceIds.add(id);
  }
  updateSourceMaterials();
  updateSelectedSourceOverlay();
  updatePreviewHighlight();
}

function collectSourceIdsForObject(object) {
  const objects = new Set();
  const bones = new Set();
  object.traverse((child) => objects.add(child));
  object.traverse((child) => {
    if (child.isBone) bones.add(child);
  });
  return state.sources
    .filter((source) => {
      if (source.type === "primitive") return objects.has(source.object);
      if (source.type === "bone") return (source.bone && bones.has(source.bone)) || (!source.bone && objects.has(source.object));
      return false;
    })
    .map((source) => source.id);
}

function updateSourceMaterials() {
  const byObject = new Map();
  for (const source of state.sources) {
    if (!byObject.has(source.object)) byObject.set(source.object, []);
    byObject.get(source.object).push(source);
  }
  for (const [object, sources] of byObject) {
    const original = object.userData.originalMaterial ?? object.material;
    object.userData.originalMaterial = original;
    if (Array.isArray(original)) {
      object.material = original.map(() => sources[0]?.wireMaterial || makeWireMaterial());
    } else {
      object.material = sources[0]?.wireMaterial || makeWireMaterial();
    }
  }
}

function updateSelectedSourceOverlay() {
  if (state.sourceSelectionRoot) {
    view.source.scene.remove(state.sourceSelectionRoot);
    disposeObject(state.sourceSelectionRoot);
  }
  state.sourceSelectionRoot = new THREE.Group();
  state.sourceSelectionRoot.name = "Selected source overlay";
  for (const source of state.sources) {
    if (!state.selectedSourceIds.has(source.id)) continue;
    const mesh = buildSourceOverlayMesh(source);
    if (!mesh) continue;
    mesh.name = source.label;
    state.sourceSelectionRoot.add(mesh);
  }
  view.source.scene.add(state.sourceSelectionRoot);
}

function buildSourceOverlayMesh(source) {
  if (source.object.isSkinnedMesh) return buildSkinnedSourceOverlayMesh(source);
  const geometry = buildWorldSourceOverlayGeometry(source);
  if (!geometry) return null;
  return new THREE.Mesh(geometry, makeOverlayMaterial(source.material));
}

function buildSkinnedSourceOverlayMesh(source) {
  const sourceGeometry = source.geometry;
  const positionAttr = sourceGeometry.getAttribute("position");
  const normalAttr = sourceGeometry.getAttribute("normal");
  const uvAttr = sourceGeometry.getAttribute("uv");
  const skinIndexAttr = sourceGeometry.getAttribute("skinIndex");
  const skinWeightAttr = sourceGeometry.getAttribute("skinWeight");
  if (!positionAttr || !skinIndexAttr || !skinWeightAttr) return null;
  const indexAttr = sourceGeometry.index;
  const sequence = source.type === "bone" ? source.triangles.flat() : makePrimitiveIndexSequence(source, indexAttr);
  const positions = [];
  const normals = [];
  const uvs = [];
  const skinIndices = [];
  const skinWeights = [];
  const indices = [];
  const vector = new THREE.Vector3();
  for (const vertexIndex of sequence) {
    vector.fromBufferAttribute(positionAttr, vertexIndex);
    positions.push(vector.x, vector.y, vector.z);
    if (normalAttr) vector.fromBufferAttribute(normalAttr, vertexIndex);
    else vector.set(0, 1, 0);
    normals.push(vector.x, vector.y, vector.z);
    uvs.push(uvAttr ? uvAttr.getX(vertexIndex) : 0.5, uvAttr ? uvAttr.getY(vertexIndex) : 0.5);
    skinIndices.push(
      skinIndexAttr.getComponent(vertexIndex, 0),
      skinIndexAttr.getComponent(vertexIndex, 1),
      skinIndexAttr.getComponent(vertexIndex, 2),
      skinIndexAttr.getComponent(vertexIndex, 3)
    );
    skinWeights.push(
      skinWeightAttr.getComponent(vertexIndex, 0),
      skinWeightAttr.getComponent(vertexIndex, 1),
      skinWeightAttr.getComponent(vertexIndex, 2),
      skinWeightAttr.getComponent(vertexIndex, 3)
    );
    indices.push(indices.length);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new THREE.Float32BufferAttribute(skinWeights, 4));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const mesh = new THREE.SkinnedMesh(geometry, makeOverlayMaterial(source.material));
  mesh.bind(source.object.skeleton, source.object.bindMatrix);
  mesh.bindMatrix.copy(source.object.bindMatrix);
  mesh.bindMatrixInverse.copy(source.object.bindMatrixInverse);
  mesh.matrix.copy(source.object.matrixWorld);
  mesh.matrixAutoUpdate = false;
  return mesh;
}

function buildWorldSourceOverlayGeometry(source) {
  const geometry = source.geometry;
  const positionAttr = geometry.getAttribute("position");
  if (!positionAttr) return null;
  const normalAttr = geometry.getAttribute("normal");
  const uvAttr = geometry.getAttribute("uv");
  const indexAttr = geometry.index;
  const sequence = source.type === "bone" ? source.triangles.flat() : makePrimitiveIndexSequence(source, indexAttr);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const pos = new THREE.Vector3();
  const normal = new THREE.Vector3();
  for (const vertexIndex of sequence) {
    readWorldVertex(source, vertexIndex, pos, normal);
    positions.push(pos.x, pos.y, pos.z);
    normals.push(normal.x, normal.y, normal.z);
    uvs.push(uvAttr ? uvAttr.getX(vertexIndex) : 0.5, uvAttr ? uvAttr.getY(vertexIndex) : 0.5);
    indices.push(indices.length);
  }
  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  result.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  result.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  result.setIndex(indices);
  result.computeBoundingSphere();
  return result;
}

function readWorldVertex(source, vertexIndex, positionTarget, normalTarget) {
  const geometry = source.geometry;
  const positionAttr = geometry.getAttribute("position");
  const normalAttr = geometry.getAttribute("normal");
  if (source.type === "bone" && source.object.isSkinnedMesh) {
    source.object.boneTransform(vertexIndex, positionTarget);
    positionTarget.applyMatrix4(source.object.matrixWorld);
    if (normalAttr) {
      normalTarget.fromBufferAttribute(normalAttr, vertexIndex);
      const skinnedNormalEnd = new THREE.Vector3().fromBufferAttribute(positionAttr, vertexIndex).add(normalTarget);
      source.object.boneTransform(vertexIndex, skinnedNormalEnd);
      skinnedNormalEnd.applyMatrix4(source.object.matrixWorld);
      normalTarget.copy(skinnedNormalEnd.sub(positionTarget)).normalize();
    } else {
      normalTarget.set(0, 1, 0);
    }
    return;
  }
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(source.object.matrixWorld);
  positionTarget.fromBufferAttribute(positionAttr, vertexIndex).applyMatrix4(source.object.matrixWorld);
  if (normalAttr) normalTarget.fromBufferAttribute(normalAttr, vertexIndex).applyMatrix3(normalMatrix).normalize();
  else normalTarget.set(0, 1, 0);
}

function makeOverlayMaterial(sourceMaterial) {
  const material = new THREE.MeshBasicMaterial({
    color: sourceMaterial?.color || new THREE.Color(1, 1, 1),
    map: sourceMaterial?.map || null,
    side: THREE.DoubleSide,
    transparent: sourceMaterial?.transparent || false,
    opacity: sourceMaterial?.opacity ?? 1
  });
  if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
  return material;
}

function makeWireMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0x7f8a96,
    wireframe: true,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });
}

function updatePreviewHighlight() {
  if (state.previewHighlightBox) {
    view.preview.scene.remove(state.previewHighlightBox);
    state.previewHighlightBox.geometry?.dispose?.();
    state.previewHighlightBox.material?.dispose?.();
    state.previewHighlightBox = null;
  }
  if (!state.previewRoot) return;
  const meshes = [];
  state.previewRoot.traverse((object) => {
    if (object.isMesh && object.userData.sourceIds?.some((id) => state.selectedSourceIds.has(id))) meshes.push(object);
  });
  if (!meshes.length) return;
  const box = new THREE.Box3();
  for (const mesh of meshes) box.expandByObject(mesh);
  state.previewHighlightBox = new THREE.Box3Helper(box, 0xe5b85b);
  view.preview.scene.add(state.previewHighlightBox);
}

async function exportZip() {
  try {
    const result = await buildMd9();
    const zip = new JSZip();
    zip.file("model.md9", result.md9);
    for (const texture of result.textures) zip.file(texture.name, texture.blob);
    zip.file("mapping.json", JSON.stringify(state.parts, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "md9_export.zip");
    setStatus(`已导出 ${result.parts.length} 个部件，${result.textures.length} 张 PNG`);
  } catch (error) {
    console.error(error);
    setStatus(`导出失败: ${error.message}`);
  }
}

async function refreshPreview() {
  try {
    const data = await buildExportData();
    showPreview(data);
    setStatus(`预览已刷新: ${data.partBuilds.length} 个部件`);
  } catch (error) {
    console.error(error);
    setStatus(`预览失败: ${error.message}`);
  }
}

async function showPreview(data) {
  if (state.previewRoot) {
    view.preview.scene.remove(state.previewRoot);
    disposeObject(state.previewRoot);
  }
  state.previewRoot = new THREE.Group();
  state.previewRoot.name = "MD9 Preview";

  for (const build of data.partBuilds) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(build.positions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(build.normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(build.uvs, 2));
    geometry.setIndex(new THREE.Uint16BufferAttribute(build.indices, 1));
    geometry.computeBoundingSphere();

    const texture = await textureFromBlob(build.atlas.blob);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = build.part.name;
    mesh.userData.sourceIds = build.part.sourceIds.slice();
    state.previewRoot.add(mesh);
  }

  view.preview.scene.add(state.previewRoot);
  updatePreviewHighlight();
}

function textureFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        URL.revokeObjectURL(url);
        resolve(texture);
      },
      undefined,
      (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      }
    );
  });
}

async function buildMd9() {
  const data = await buildExportData();
  const { partBuilds, materials, origins, totalVertices, totalFaces } = data;
  const size =
    4 +
    materials.length * 100 +
    4 +
    partBuilds.length * 136 +
    8 +
    totalVertices * 8 * 4 +
    totalFaces * 3 * 2;
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  let offset = 0;
  const writeInt = (value) => {
    view.setInt32(offset, value, true);
    offset += 4;
  };
  const writeFloat = (value) => {
    view.setFloat32(offset, value, true);
    offset += 4;
  };
  const writeName = (value, length = 32) => {
    for (let i = 0; i < length; i++) view.setUint8(offset + i, 0);
    const text = String(value).slice(0, length - 1);
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i) & 0x7f);
    offset += length;
  };

  writeInt(materials.length);
  for (const material of materials) {
    for (let i = 0; i < 4; i++) writeFloat(material.color[i]);
    for (let i = 0; i < 4; i++) writeFloat(i === 3 ? 1 : 1);
    for (let i = 0; i < 4; i++) writeFloat(i === 3 ? 1 : 0);
    for (let i = 0; i < 4; i++) writeFloat(0);
    writeFloat(20);
    writeName(material.textureName);
  }

  writeInt(partBuilds.length);
  for (const [index, build] of partBuilds.entries()) {
    const origin = origins.get(build.part.name) || new THREE.Vector3();
    const parentOrigin = origins.get(build.part.parent) || new THREE.Vector3();
    const local = origin.clone().sub(parentOrigin);
    writeName(build.part.name);
    const matrixOffset = offset;
    for (let i = 0; i < 16; i++) writeFloat(i % 5 === 0 ? 1 : 0);
    view.setFloat32(matrixOffset + 12 * 4, local.x, true);
    view.setFloat32(matrixOffset + 13 * 4, local.y, true);
    view.setFloat32(matrixOffset + 14 * 4, -local.z, true);
    writeInt(build.positions.length / 3);
    writeInt(build.indices.length / 3);
    writeInt(index);
    writeInt(partBuilds.findIndex((candidate) => candidate.part.name === build.part.parent));
    const localBounds = computeLocalBounds(build.positions, origin);
    for (const value of localBounds) writeFloat(value);
  }

  writeInt(totalVertices);
  writeInt(totalFaces);
  for (const build of partBuilds) {
    const origin = origins.get(build.part.name) || new THREE.Vector3();
    for (let i = 0; i < build.positions.length; i += 3) {
      writeFloat(build.positions[i] - origin.x);
      writeFloat(build.positions[i + 1] - origin.y);
      writeFloat(-(build.positions[i + 2] - origin.z));
      writeFloat(build.normals[i]);
      writeFloat(build.normals[i + 1]);
      writeFloat(-build.normals[i + 2]);
      writeFloat(build.uvs[(i / 3) * 2]);
      writeFloat(build.uvs[(i / 3) * 2 + 1]);
    }
  }
  for (const build of partBuilds) {
    for (const index of build.indices) {
      view.setUint16(offset, index, true);
      offset += 2;
    }
  }

  return {
    ...data,
    md9: buffer,
    parts: partBuilds,
    textures: materials.map((material, index) => ({ name: material.textureName, blob: partBuilds[index].atlas.blob }))
  };
}

async function buildExportData() {
  const enabledParts = state.parts.filter((part) => part.enabled && part.name && part.sourceIds.length);
  if (!enabledParts.length) throw new Error("没有启用且完成映射的 MD9 部件");

  const partBuilds = [];
  for (const part of enabledParts) {
    const sources = part.sourceIds.map((id) => state.sources.find((source) => source.id === id)).filter(Boolean);
    const atlas = await buildAtlas(part, sources);
    const geometry = extractPartGeometry(sources, atlas.rects);
    partBuilds.push({ part, atlas, ...geometry });
  }

  const origins = computeOrigins(enabledParts, partBuilds);
  const materials = partBuilds.map((build, index) => ({
    textureName: safeTextureName(`${index}_${build.part.name}.png`),
    color: [1, 1, 1, 1],
    blob: build.atlas.blob
  }));

  const totalVertices = partBuilds.reduce((sum, build) => sum + build.positions.length / 3, 0);
  const totalFaces = partBuilds.reduce((sum, build) => sum + build.indices.length / 3, 0);
  if (totalVertices > 65535) throw new Error("总顶点数超过 65535，当前 MD9 writer 使用 uint16 索引");
  return { enabledParts, partBuilds, origins, materials, totalVertices, totalFaces };
}

function extractPartGeometry(sources, rects) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const pos = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let vertexBase = 0;

  for (const source of sources) {
    const geometry = source.geometry;
    const uvAttr = geometry.getAttribute("uv");
    const indexAttr = geometry.index;
    const group = source.group;
    const sourceIndexMap = new Map();
    const rect = rects.get(source.id);

    const sequence = source.type === "bone" ? source.triangles.flat() : makePrimitiveIndexSequence(source, indexAttr);
    for (const vertexIndex of sequence) {
      if (!sourceIndexMap.has(vertexIndex)) {
        sourceIndexMap.set(vertexIndex, vertexBase++);
        readWorldVertex(source, vertexIndex, pos, normal);
        positions.push(pos.x, pos.y, pos.z);
        normals.push(normal.x, normal.y, normal.z);
        const u = uvAttr ? uvAttr.getX(vertexIndex) : 0.5;
        const v = uvAttr ? uvAttr.getY(vertexIndex) : 0.5;
        uvs.push(rect.x + u * rect.w, rect.y + v * rect.h);
      }
      indices.push(sourceIndexMap.get(vertexIndex));
    }
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

function makePrimitiveIndexSequence(source, indexAttr) {
  const sequence = [];
  for (let i = source.group.start; i < source.group.start + source.group.count; i++) {
    sequence.push(indexAttr ? indexAttr.getX(i) : i);
  }
  return sequence;
}

async function buildAtlas(part, sources) {
  const tiles = [];
  for (const source of sources) {
    const image = source.material?.map?.image || makeColorCanvas(source.material?.color);
    tiles.push({ source, image, width: image.width || 64, height: image.height || 64 });
  }
  const padding = 4;
  const width = nextPowerOfTwo(tiles.reduce((sum, tile) => sum + tile.width + padding * 2, 0));
  const height = nextPowerOfTwo(Math.max(...tiles.map((tile) => tile.height + padding * 2), 64));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  const rects = new Map();
  let x = padding;
  for (const tile of tiles) {
    ctx.drawImage(tile.image, x, padding, tile.width, tile.height);
    rects.set(tile.source.id, {
      x: x / width,
      y: padding / height,
      w: tile.width / width,
      h: tile.height / height
    });
    x += tile.width + padding * 2;
  }
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return { blob, rects };
}

function makeColorCanvas(color = new THREE.Color(0.75, 0.75, 0.75)) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.fillRect(0, 0, 64, 64);
  return canvas;
}

function computeOrigins(parts, builds) {
  const origins = new Map();
  for (const build of builds) {
    const box = new THREE.Box3();
    for (let i = 0; i < build.positions.length; i += 3) {
      box.expandByPoint(new THREE.Vector3(build.positions[i], build.positions[i + 1], build.positions[i + 2]));
    }
    origins.set(build.part.name, box.getCenter(new THREE.Vector3()));
  }
  for (const part of parts) {
    if (!origins.has(part.name)) origins.set(part.name, new THREE.Vector3());
  }
  return origins;
}

function computeLocalBounds(positions, origin) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < positions.length; i += 3) {
    min.min(new THREE.Vector3(positions[i] - origin.x, positions[i + 1] - origin.y, positions[i + 2] - origin.z));
    max.max(new THREE.Vector3(positions[i] - origin.x, positions[i + 1] - origin.y, positions[i + 2] - origin.z));
  }
  return [min.x, min.y, -max.z, max.x, max.y, -min.z];
}

function installDropHandlers() {
  let dragDepth = 0;
  window.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth++;
    el.app.classList.add("dragging");
  });
  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) el.app.classList.remove("dragging");
  });
  window.addEventListener("drop", async (event) => {
    event.preventDefault();
    dragDepth = 0;
    el.app.classList.remove("dragging");
    addFiles(await getDroppedFiles(event.dataTransfer));
  });
}

async function getDroppedFiles(dataTransfer) {
  const entries = [...dataTransfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return [...dataTransfer.files];
  const files = [];
  for (const entry of entries) files.push(...(await readEntryFiles(entry)));
  return files;
}

async function readEntryFiles(entry) {
  if (entry.isFile) return new Promise((resolve) => entry.file((file) => resolve([file]), () => resolve([])));
  if (!entry.isDirectory) return [];
  const reader = entry.createReader();
  const files = [];
  while (true) {
    const entries = await new Promise((resolve) => reader.readEntries(resolve, () => resolve([])));
    if (!entries.length) break;
    for (const child of entries) files.push(...(await readEntryFiles(child)));
  }
  return files;
}

function pathKey(path) {
  return path.replaceAll("\\", "/").toLowerCase();
}

function simplifyName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function safeTextureName(name) {
  const clean = name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return clean.length <= 31 ? clean : `${clean.slice(0, 27)}.png`;
}

function nextPowerOfTwo(value) {
  return 2 ** Math.ceil(Math.log2(Math.max(1, value)));
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function clearObjectUrls() {
  for (const url of state.objectUrls) URL.revokeObjectURL(url);
  state.objectUrls = [];
}

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of objectMaterials) {
        materials.add(material);
        if (material.map) textures.add(material.map);
      }
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}

function installResizer() {
  let resizing = false;
  el.treeResizer.addEventListener("pointerdown", (event) => {
    resizing = true;
    el.treeResizer.setPointerCapture(event.pointerId);
  });
  el.treeResizer.addEventListener("pointermove", (event) => {
    if (!resizing) return;
    const rect = el.workspace.getBoundingClientRect();
    const width = Math.max(220, Math.min(560, event.clientX - rect.left));
    el.app.style.setProperty("--tree-width", `${width}px`);
  });
  el.treeResizer.addEventListener("pointerup", (event) => {
    resizing = false;
    el.treeResizer.releasePointerCapture(event.pointerId);
  });
}

function animate() {
  requestAnimationFrame(animate);
  view.source.controls.update();
  view.preview.controls.update();
  view.source.renderer.render(view.source.scene, view.source.camera);
  view.preview.renderer.render(view.preview.scene, view.preview.camera);
}

function setStatus(message) {
  el.status.textContent = message;
}
