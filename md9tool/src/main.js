import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DDSLoader } from "three/addons/loaders/DDSLoader.js";

const el = {
  app: document.querySelector("#app"),
  viewport: document.querySelector("#viewport"),
  fileInput: document.querySelector("#fileInput"),
  folderInput: document.querySelector("#folderInput"),
  modelSelect: document.querySelector("#modelSelect"),
  animationSelect: document.querySelector("#animationSelect"),
  clearModels: document.querySelector("#clearModels"),
  clearAnimations: document.querySelector("#clearAnimations"),
  autoPlay: document.querySelector("#autoPlay"),
  animationFrame: document.querySelector("#animationFrame"),
  frameLabel: document.querySelector("#frameLabel"),
  missingBlock: document.querySelector("#missingBlock"),
  missingTextures: document.querySelector("#missingTextures"),
  showTextures: document.querySelector("#showTextures"),
  showWireframe: document.querySelector("#showWireframe"),
  showSkeleton: document.querySelector("#showSkeleton"),
  showNormals: document.querySelector("#showNormals"),
  showBounds: document.querySelector("#showBounds"),
  showGrid: document.querySelector("#showGrid"),
  normalScale: document.querySelector("#normalScale"),
  submeshList: document.querySelector("#submeshList"),
  status: document.querySelector("#status"),
  statFile: document.querySelector("#statFile"),
  statMaterials: document.querySelector("#statMaterials"),
  statSubmeshes: document.querySelector("#statSubmeshes"),
  statVertices: document.querySelector("#statVertices"),
  statFaces: document.querySelector("#statFaces")
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111316);

const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
camera.position.set(0, 90, 220);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
el.viewport.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 45, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x2c3540, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(80, 150, 110);
scene.add(keyLight);

const grid = new THREE.GridHelper(220, 22, 0x3a4652, 0x242b33);
scene.add(grid);

const ddsLoader = new DDSLoader();
const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
const ANIMATION_FPS = 60;
const state = {
  md9Files: [],
  aniFiles: [],
  root: null,
  skeletonLines: null,
  bounds: null,
  normalVisualizers: [],
  normalLength: 0,
  meshEntries: [],
  textureFiles: new Map(),
  objectUrls: [],
  currentModel: null,
  currentMd9Id: "",
  currentAnimation: null,
  currentAniId: "",
  animationStartTime: 0,
  animationFrame: 0,
  boneNodes: new Map(),
  missingTextures: new Set()
};

el.fileInput.addEventListener("change", () => {
  addFiles([...el.fileInput.files]);
  el.fileInput.value = "";
});
el.folderInput.addEventListener("change", () => {
  addFiles([...el.folderInput.files]);
  el.folderInput.value = "";
});
el.modelSelect.addEventListener("change", () => loadSelectedModel(el.modelSelect.value));
el.animationSelect.addEventListener("change", () => loadSelectedAnimation(el.animationSelect.value));
el.clearModels.addEventListener("click", clearModels);
el.clearAnimations.addEventListener("click", clearAnimations);
el.animationFrame.addEventListener("input", () => {
  el.autoPlay.checked = false;
  state.animationFrame = Number(el.animationFrame.value);
  applyAnimation(state.animationFrame);
  updateFrameControls();
});
el.autoPlay.addEventListener("change", () => {
  if (el.autoPlay.checked) {
    state.animationStartTime = getNow() - state.animationFrame / ANIMATION_FPS;
  }
});

for (const input of [
  el.showTextures,
  el.showWireframe,
  el.showSkeleton,
  el.showNormals,
  el.showBounds,
  el.showGrid,
  el.normalScale
]) {
  input.addEventListener("input", applyOptions);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(el.viewport);
window.addEventListener("resize", resize);
installDropHandlers();
resize();
animate();

async function addFiles(files) {
  const md9Files = files.filter((file) => file.name.toLowerCase().endsWith(".md9"));
  const aniFiles = files.filter((file) => file.name.toLowerCase().endsWith(".ani"));
  const textureFiles = files.filter((file) => isTextureFile(file.name));

  for (const file of md9Files) addMd9File(file);
  for (const file of aniFiles) addAniFile(file);
  for (const file of textureFiles) {
    state.textureFiles.set(textureKey(file.webkitRelativePath || file.name), file);
  }

  if (md9Files.length > 0 || aniFiles.length > 0) {
    updateModelSelect();
    updateAnimationSelect();
    if (md9Files.length > 0) {
      await loadSelectedModel(fileKey(md9Files[0]));
    }
    if (aniFiles.length > 0) {
      await loadSelectedAnimation(fileKey(aniFiles[0]));
    } else if (state.currentModel && state.currentAnimation) {
      applyAnimation(0);
    }
    return;
  }

  const beforeMissing = new Set(state.missingTextures);
  for (const file of textureFiles) {
    state.textureFiles.set(textureKey(file.webkitRelativePath || file.name), file);
  }

  if (state.currentMd9Id && textureFiles.length > 0 && hasNewTextureForMissing(beforeMissing)) {
    await loadSelectedModel(state.currentMd9Id);
  } else if (textureFiles.length > 0) {
    updateMissingTextures(state.currentModel);
    setStatus(`已加入 ${textureFiles.length} 个贴图文件`);
  } else {
    setStatus("没有可用的 md9、ani 或贴图文件");
  }
}

function isTextureFile(name) {
  return /\.(dds|png|jpe?g|webp)$/i.test(name);
}

function resetOpenedFiles() {
  disposeCurrent();
  state.md9Files = [];
  state.aniFiles = [];
  state.textureFiles = new Map();
  state.currentModel = null;
  state.currentMd9Id = "";
  state.currentAnimation = null;
  state.currentAniId = "";
  state.missingTextures = new Set();
  el.submeshList.replaceChildren();
  updateModelSelect();
  updateAnimationSelect();
  updateMissingTextures(null);
}

function addMd9File(file) {
  const id = fileKey(file);
  const existingIndex = state.md9Files.findIndex((item) => item.id === id);
  const item = {
    id,
    file,
    label: file.webkitRelativePath || file.name
  };
  if (existingIndex >= 0) {
    state.md9Files[existingIndex] = item;
    return;
  }
  state.md9Files.push(item);
}

function addAniFile(file) {
  const id = fileKey(file);
  const existingIndex = state.aniFiles.findIndex((item) => item.id === id);
  const item = {
    id,
    file,
    label: file.webkitRelativePath || file.name
  };
  if (existingIndex >= 0) {
    state.aniFiles[existingIndex] = item;
    return;
  }
  state.aniFiles.push(item);
}

async function loadSelectedModel(id) {
  const item = state.md9Files.find((candidate) => candidate.id === id);
  if (!item) return;
  state.currentMd9Id = id;
  el.modelSelect.value = id;
  setStatus(`加载 ${item.label}`);
  try {
    const model = parseMd9(await item.file.arrayBuffer(), item.label, "");
    await showModel(model, item.label);
    if (state.currentAnimation) applyAnimation(0);
  } catch (error) {
    console.error(error);
    setStatus(`加载失败: ${item.label}`);
  }
}

async function loadSelectedAnimation(id) {
  if (!id) {
    state.currentAnimation = null;
    state.currentAniId = "";
    state.animationFrame = 0;
    el.animationSelect.value = "";
    resetPose();
    updateFrameControls();
    setStatus("已切换到默认姿势");
    return;
  }
  const item = state.aniFiles.find((candidate) => candidate.id === id);
  if (!item) return;
  state.currentAniId = id;
  el.animationSelect.value = id;
  try {
    state.currentAnimation = parseAni(await item.file.arrayBuffer(), item.label);
    state.animationStartTime = getNow();
    state.animationFrame = 0;
    applyAnimation(0);
    updateFrameControls();
    setStatus(`已加载动画 ${item.label}`);
  } catch (error) {
    console.error(error);
    setStatus(`动画加载失败: ${item.label}`);
  }
}

async function showModel(model, label) {
  disposeCurrent();
  state.currentModel = model;
  state.root = new THREE.Group();
  state.root.name = model.name;
  scene.add(state.root);

  state.meshEntries = [];
  const materials = await Promise.all(model.materials.map((material) => createMaterial(material, model.baseDir)));
  createBoneNodes(model);

  for (const part of model.submeshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
    geometry.setIndex(new THREE.Uint16BufferAttribute(part.indices, 1));
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, materials[part.materialId] || materials[0]);
    mesh.name = part.name;
    mesh.userData.part = part;
    const boneNode = state.boneNodes.get(part.name) || state.root;
    boneNode.add(mesh);
    state.meshEntries.push({ mesh, material: mesh.material, part });
  }

  rebuildNormalVisualizers();
  state.skeletonLines = createSkeletonLines(model);
  state.root.add(state.skeletonLines);

  state.bounds = new THREE.Box3Helper(model.bounds, 0xe5b85b);
  state.root.add(state.bounds);

  populateSubmeshList(model);
  updateStats(model, label);
  frameModel(model.bounds);
  applyOptions();
  updateMissingTextures(model);
  setStatus(`已加载 ${label}`);
}

function parseMd9(buffer, name, baseDir) {
  const view = new DataView(buffer);
  let offset = 0;
  const readInt = () => {
    const value = view.getInt32(offset, true);
    offset += 4;
    return value;
  };
  const readFloat = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const readName = (length = 32) => {
    const bytes = new Uint8Array(buffer, offset, length);
    offset += length;
    let text = "";
    for (const byte of bytes) {
      if (byte === 0 || byte === 0xcd) break;
      if (byte >= 32 && byte < 127) text += String.fromCharCode(byte);
    }
    return text.trim();
  };

  const first = readInt();
  const newFormat = first === -1;
  const materialCount = newFormat ? readInt() : first;
  const materials = [];
  for (let i = 0; i < materialCount; i++) {
    const diffuse = [readFloat(), readFloat(), readFloat(), readFloat()];
    const ambient = [readFloat(), readFloat(), readFloat(), readFloat()];
    const specular = [readFloat(), readFloat(), readFloat(), readFloat()];
    const emissive = [readFloat(), readFloat(), readFloat(), readFloat()];
    const power = readFloat();
    const textureName = readName(32);
    materials.push({ diffuse, ambient, specular, emissive, power, textureName });
    if (newFormat) offset += 16;
  }

  const submeshCount = readInt();
  const headers = [];
  for (let i = 0; i < submeshCount; i++) {
    const partName = readName(32) || `Submesh ${i}`;
    const matrix = Array.from({ length: 16 }, readFloat);
    const vertexCount = readInt();
    const faceCount = readInt();
    const materialId = readInt();
    const parentId = readInt();
    const boundingBox = Array.from({ length: 6 }, readFloat);
    headers.push({ partName, matrix, vertexCount, faceCount, materialId, parentId, boundingBox });
  }

  const totalVertices = readInt();
  const totalFaces = readInt();
  const initialPositions = headers.map((_, index) => {
    const position = new THREE.Vector3();
    let parentId = index;
    while (parentId !== -1) {
      const matrix = headers[parentId].matrix;
      position.x += matrix[12];
      position.y += matrix[13];
      position.z -= matrix[14];
      parentId = headers[parentId].parentId;
    }
    return position;
  });

  const vertices = [];
  for (let i = 0; i < totalVertices; i++) {
    vertices.push({
      position: [readFloat(), readFloat(), -readFloat()],
      normal: [readFloat(), readFloat(), -readFloat()],
      uv: [readFloat(), readFloat()]
    });
  }

  const allIndices = new Uint16Array(totalFaces * 3);
  for (let i = 0; i < allIndices.length; i++) {
    allIndices[i] = view.getUint16(offset, true);
    offset += 2;
  }

  const submeshes = [];
  let vertexCursor = 0;
  let indexCursor = 0;
  const bounds = new THREE.Box3();
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const positions = new Float32Array(header.vertexCount * 3);
    const normals = new Float32Array(header.vertexCount * 3);
    const uvs = new Float32Array(header.vertexCount * 2);
    const initial = initialPositions[i];

    for (let v = 0; v < header.vertexCount; v++) {
      const source = vertices[vertexCursor + v];
      positions[v * 3] = source.position[0] + initial.x;
      positions[v * 3 + 1] = source.position[1] + initial.y;
      positions[v * 3 + 2] = source.position[2] + initial.z;
      normals[v * 3] = source.normal[0];
      normals[v * 3 + 1] = source.normal[1];
      normals[v * 3 + 2] = source.normal[2];
      uvs[v * 2] = source.uv[0];
      uvs[v * 2 + 1] = source.uv[1];
      bounds.expandByPoint(new THREE.Vector3(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]));
    }

    const indexCount = header.faceCount * 3;
    const indices = allIndices.slice(indexCursor, indexCursor + indexCount);
    submeshes.push({
      name: header.partName,
      positions,
      localPositions: makeLocalPositions(positions, initial),
      normals,
      uvs,
      indices,
      materialId: header.materialId,
      parentId: header.parentId,
      bonePosition: new THREE.Vector3(header.matrix[12], header.matrix[13], -header.matrix[14]),
      worldBonePosition: initial,
      vertexCount: header.vertexCount,
      faceCount: header.faceCount
    });
    vertexCursor += header.vertexCount;
    indexCursor += indexCount;
  }

  if (vertexCursor !== totalVertices || indexCursor !== allIndices.length) {
    throw new Error("MD9 顶点或索引计数不一致");
  }

  return { name, baseDir, materials, submeshes, totalVertices, totalFaces, bounds };
}

function makeLocalPositions(positions, origin) {
  const local = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    local[i] = positions[i] - origin.x;
    local[i + 1] = positions[i + 1] - origin.y;
    local[i + 2] = positions[i + 2] - origin.z;
  }
  return local;
}

function parseAni(buffer, name) {
  const view = new DataView(buffer);
  let offset = 0;
  const readInt = () => {
    const value = view.getInt32(offset, true);
    offset += 4;
    return value;
  };
  const readFloat = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const boneCount = readInt();
  const duration = readFloat();
  const tracks = new Map();
  for (let i = 0; i < boneCount; i++) {
    const nameLength = view.getUint8(offset);
    offset += 1;
    let boneName = "";
    for (let j = 0; j < nameLength; j++) {
      boneName += String.fromCharCode(view.getUint8(offset++));
    }
    const positionCount = readInt();
    const rotationCount = readInt();
    const unknown = readInt();
    const positions = [];
    const rotations = [];
    for (let j = 0; j < positionCount; j++) {
      positions.push({
        time: readFloat(),
        value: new THREE.Vector3(readFloat(), readFloat(), -readFloat())
      });
    }
    for (let j = 0; j < rotationCount; j++) {
      rotations.push({
        time: readFloat(),
        value: convertQuaternion(readFloat(), readFloat(), readFloat(), readFloat())
      });
    }
    tracks.set(boneName, { boneName, positions, rotations, unknown });
  }
  if (offset !== buffer.byteLength) {
    throw new Error("ANI 数据长度不匹配");
  }
  return { name, duration, tracks };
}

function convertQuaternion(x, y, z, w) {
  return new THREE.Quaternion(-x, -y, z, w).normalize();
}

async function createMaterial(material, baseDir) {
  const fallbackColor = new THREE.Color(
    material.diffuse[0] || 0.72,
    material.diffuse[1] || 0.72,
    material.diffuse[2] || 0.72
  );
  const params = {
    color: fallbackColor,
    side: THREE.DoubleSide,
    transparent: material.diffuse[3] < 0.999,
    opacity: material.diffuse[3] || 1
  };
  const threeMaterial = new THREE.MeshBasicMaterial(params);
  threeMaterial.name = material.textureName || "Material";

  const textureUrl = resolveTextureUrl(material.textureName, baseDir);
  if (textureUrl) {
    try {
      const texture = await loadTexture(textureUrl, material.textureName);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      threeMaterial.map = texture;
      threeMaterial.color.set(0xffffff);
      threeMaterial.needsUpdate = true;
    } catch (error) {
      console.warn(`Texture load failed: ${material.textureName}`, error);
    }
  }
  return threeMaterial;
}

function loadTexture(url, textureName) {
  if (textureName.toLowerCase().endsWith(".dds")) return ddsLoader.loadAsync(url);
  return textureLoader.loadAsync(url).then((texture) => {
    texture.flipY = false;
    return texture;
  });
}

function resolveTextureUrl(textureName, baseDir) {
  if (!textureName) return "";
  const key = textureKey(`${baseDir}${textureName}`);
  const fileOrUrl = state.textureFiles.get(key) || state.textureFiles.get(textureKey(textureName));
  if (fileOrUrl instanceof File) {
    const url = URL.createObjectURL(fileOrUrl);
    state.objectUrls.push(url);
    return url;
  }
  if (typeof fileOrUrl === "string") return fileOrUrl;
  return "";
}

function textureKey(path) {
  return path.split(/[\\/]/).pop().toLowerCase();
}

function fileKey(file) {
  const path = file.webkitRelativePath || file.name;
  return `${path.toLowerCase()}::${file.size}::${file.lastModified}`;
}

function createSkeletonLines(model) {
  const positions = [];
  for (const [index, part] of model.submeshes.entries()) {
    if (part.parentId < 0) continue;
    const parent = model.submeshes[part.parentId];
    if (!parent) continue;
    positions.push(
      parent.worldBonePosition.x,
      parent.worldBonePosition.y,
      parent.worldBonePosition.z,
      model.submeshes[index].worldBonePosition.x,
      model.submeshes[index].worldBonePosition.y,
      model.submeshes[index].worldBonePosition.z
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffd36a, depthTest: false }));
}

function createBoneNodes(model) {
  state.boneNodes = new Map();
  for (const part of model.submeshes) {
    const node = new THREE.Group();
    node.name = `${part.name} bone`;
    node.position.copy(part.bonePosition);
    node.userData.defaultPosition = part.bonePosition.clone();
    node.userData.defaultQuaternion = new THREE.Quaternion();
    state.boneNodes.set(part.name, node);
  }
  for (const [index, part] of model.submeshes.entries()) {
    const node = state.boneNodes.get(part.name);
    const parent = model.submeshes[part.parentId];
    if (parent && state.boneNodes.has(parent.name)) {
      state.boneNodes.get(parent.name).add(node);
    } else {
      state.root.add(node);
    }
  }
}

function populateSubmeshList(model) {
  el.submeshList.replaceChildren();
  for (const [index, part] of model.submeshes.entries()) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("input", () => {
      state.meshEntries[index].mesh.visible = checkbox.checked;
      state.normalVisualizers[index].visible = checkbox.checked && el.showNormals.checked;
    });
    const name = document.createElement("span");
    name.textContent = part.name;
    const count = document.createElement("small");
    count.textContent = `${part.vertexCount}/${part.faceCount}`;
    label.append(checkbox, name, count);
    el.submeshList.append(label);
  }
}

function updateStats(model, label) {
  el.statFile.textContent = label.split("/").pop();
  el.statMaterials.textContent = model.materials.length.toLocaleString();
  el.statSubmeshes.textContent = model.submeshes.length.toLocaleString();
  el.statVertices.textContent = model.totalVertices.toLocaleString();
  el.statFaces.textContent = model.totalFaces.toLocaleString();
}

function updateModelSelect() {
  el.modelSelect.replaceChildren();
  if (!state.md9Files.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "尚未加载 md9";
    el.modelSelect.append(option);
    el.modelSelect.disabled = true;
    el.clearModels.disabled = true;
    return;
  }
  el.modelSelect.disabled = false;
  el.clearModels.disabled = false;
  for (const item of state.md9Files) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    el.modelSelect.append(option);
  }
  el.modelSelect.value = state.currentMd9Id || state.md9Files[0].id;
}

function updateAnimationSelect() {
  el.animationSelect.replaceChildren();
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "默认姿势";
  el.animationSelect.append(defaultOption);
  for (const item of state.aniFiles) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    el.animationSelect.append(option);
  }
  el.animationSelect.disabled = state.aniFiles.length === 0;
  el.clearAnimations.disabled = state.aniFiles.length === 0;
  el.animationSelect.value = state.currentAniId || "";
}

function clearModels() {
  disposeCurrent();
  state.md9Files = [];
  state.currentModel = null;
  state.currentMd9Id = "";
  state.missingTextures = new Set();
  el.submeshList.replaceChildren();
  updateStatsEmpty();
  updateModelSelect();
  updateMissingTextures(null);
  setStatus("已清空模型");
}

function clearAnimations() {
  state.aniFiles = [];
  state.currentAnimation = null;
  state.currentAniId = "";
  state.animationFrame = 0;
  updateAnimationSelect();
  updateFrameControls();
  resetPose();
  setStatus("已清空动画");
}

function updateStatsEmpty() {
  el.statFile.textContent = "-";
  el.statMaterials.textContent = "0";
  el.statSubmeshes.textContent = "0";
  el.statVertices.textContent = "0";
  el.statFaces.textContent = "0";
}

function updateFrameControls() {
  const duration = state.currentAnimation?.duration || 0;
  el.animationFrame.disabled = !state.currentAnimation;
  el.animationFrame.max = Math.max(duration, 1);
  el.animationFrame.value = Math.min(state.animationFrame, duration);
  el.frameLabel.textContent = `${Math.round(state.animationFrame)} / ${Math.round(duration)}`;
}

function updateMissingTextures(model) {
  state.missingTextures = collectMissingTextures(model);
  el.missingTextures.replaceChildren();
  el.missingBlock.hidden = false;
  if (!model) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = "尚未加载模型";
    row.append(name);
    el.missingTextures.append(row);
    return;
  }
  if (state.missingTextures.size === 0) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = "贴图文件完整";
    row.append(name);
    el.missingTextures.append(row);
    return;
  }
  for (const textureName of state.missingTextures) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = textureName;
    const hint = document.createElement("small");
    hint.textContent = "拖入或打开补充";
    row.append(name, hint);
    el.missingTextures.append(row);
  }
}

function collectMissingTextures(model) {
  const missing = new Set();
  if (!model) return missing;
  for (const material of model.materials) {
    if (!material.textureName) continue;
    const key = textureKey(material.textureName);
    if (!state.textureFiles.has(key)) missing.add(material.textureName);
  }
  return missing;
}

function hasNewTextureForMissing(previousMissing) {
  for (const textureName of previousMissing) {
    if (state.textureFiles.has(textureKey(textureName))) return true;
  }
  return false;
}

function installDropHandlers() {
  let dragDepth = 0;
  window.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth++;
    el.app.classList.add("dragging");
  });
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  window.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) el.app.classList.remove("dragging");
  });
  window.addEventListener("drop", async (event) => {
    event.preventDefault();
    dragDepth = 0;
    el.app.classList.remove("dragging");
    const files = await getDroppedFiles(event.dataTransfer);
    await addFiles(files);
  });
}

async function getDroppedFiles(dataTransfer) {
  if (!dataTransfer) return [];
  const entries = [...dataTransfer.items]
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean);
  if (!entries.length) return [...dataTransfer.files];
  const files = [];
  for (const entry of entries) {
    files.push(...(await readEntryFiles(entry)));
  }
  return files;
}

async function readEntryFiles(entry) {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => resolve([file]), () => resolve([]));
    });
  }
  if (!entry.isDirectory) return [];
  const reader = entry.createReader();
  const files = [];
  while (true) {
    const entries = await new Promise((resolve) => {
      reader.readEntries(resolve, () => resolve([]));
    });
    if (!entries.length) break;
    for (const child of entries) {
      files.push(...(await readEntryFiles(child)));
    }
  }
  return files;
}

function applyOptions() {
  grid.visible = el.showGrid.checked;
  if (state.skeletonLines) state.skeletonLines.visible = el.showSkeleton.checked;
  if (state.bounds) state.bounds.visible = el.showBounds.checked;
  for (const entry of state.meshEntries) {
    entry.material.wireframe = el.showWireframe.checked;
    if (entry.material.userData.baseMap === undefined) entry.material.userData.baseMap = entry.material.map || null;
    entry.material.map = el.showTextures.checked ? entry.material.userData.baseMap : null;
    entry.material.needsUpdate = true;
  }
  const normalLength = Number(el.normalScale.value);
  if (state.root && normalLength !== state.normalLength) {
    rebuildNormalVisualizers();
  }
  for (const [index, visualizer] of state.normalVisualizers.entries()) {
    visualizer.visible = el.showNormals.checked && state.meshEntries[index].mesh.visible;
  }
}

function resetPose() {
  for (const node of state.boneNodes.values()) {
    node.position.copy(node.userData.defaultPosition);
    node.quaternion.copy(node.userData.defaultQuaternion);
  }
  if (state.skeletonLines) updateSkeletonLines();
}

function applyAnimation(time) {
  resetPose();
  if (!state.currentAnimation || !state.currentModel) return;
  const duration = Math.max(state.currentAnimation.duration, 0.0001);
  const sampleTime = time % duration;
  state.animationFrame = sampleTime;
  for (const [boneName, track] of state.currentAnimation.tracks) {
    const node = state.boneNodes.get(boneName);
    if (!node) continue;
    const position = sampleVectorKey(track.positions, sampleTime);
    const rotation = sampleQuaternionKey(track.rotations, sampleTime);
    if (position) node.position.copy(position);
    if (rotation) node.quaternion.copy(rotation);
  }
  if (state.skeletonLines) updateSkeletonLines();
}

function sampleVectorKey(keys, time) {
  if (!keys.length) return null;
  if (keys.length === 1 || time <= keys[0].time) return keys[0].value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (time <= b.time) {
      const t = (time - a.time) / Math.max(b.time - a.time, 0.0001);
      return new THREE.Vector3().lerpVectors(a.value, b.value, t);
    }
  }
  return keys[keys.length - 1].value;
}

function sampleQuaternionKey(keys, time) {
  if (!keys.length) return null;
  if (keys.length === 1 || time <= keys[0].time) return keys[0].value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (time <= b.time) {
      const t = (time - a.time) / Math.max(b.time - a.time, 0.0001);
      return new THREE.Quaternion().slerpQuaternions(a.value, b.value, t);
    }
  }
  return keys[keys.length - 1].value;
}

function updateSkeletonLines() {
  if (!state.currentModel || !state.skeletonLines) return;
  const attribute = state.skeletonLines.geometry.getAttribute("position");
  let cursor = 0;
  const parentWorld = new THREE.Vector3();
  const childWorld = new THREE.Vector3();
  for (const part of state.currentModel.submeshes) {
    if (part.parentId < 0) continue;
    const parent = state.currentModel.submeshes[part.parentId];
    const parentNode = state.boneNodes.get(parent.name);
    const childNode = state.boneNodes.get(part.name);
    if (!parentNode || !childNode) continue;
    parentNode.getWorldPosition(parentWorld);
    childNode.getWorldPosition(childWorld);
    attribute.setXYZ(cursor++, parentWorld.x, parentWorld.y, parentWorld.z);
    attribute.setXYZ(cursor++, childWorld.x, childWorld.y, childWorld.z);
  }
  attribute.needsUpdate = true;
  state.skeletonLines.geometry.computeBoundingSphere();
}

function rebuildNormalVisualizers() {
  for (const visualizer of state.normalVisualizers) {
    visualizer.parent?.remove(visualizer);
    disposeObject(visualizer);
  }
  state.normalVisualizers = [];
  state.normalLength = Number(el.normalScale.value);
  for (const entry of state.meshEntries) {
    const visualizer = createNormalVisualizer(entry.mesh, state.normalLength);
    visualizer.visible = el.showNormals.checked && entry.mesh.visible;
    entry.mesh.parent.add(visualizer);
    state.normalVisualizers.push(visualizer);
  }
}

function createNormalVisualizer(mesh, length) {
  const color = 0x54c6a6;
  const group = new THREE.Group();
  group.name = `${mesh.name} normals`;

  const position = mesh.geometry.getAttribute("position");
  const normal = mesh.geometry.getAttribute("normal");
  const linePositions = new Float32Array(position.count * 6);
  const direction = new THREE.Vector3();
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    start.fromBufferAttribute(position, i);
    direction.fromBufferAttribute(normal, i).normalize();
    end.copy(start).addScaledVector(direction, length);
    linePositions.set([start.x, start.y, start.z, end.x, end.y, end.z], i * 6);
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color, depthTest: false });
  group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  const coneHeight = Math.max(length * 0.16, 0.08);
  const coneRadius = Math.max(length * 0.045, 0.025);
  const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8, 1);
  const coneMaterial = new THREE.MeshBasicMaterial({ color, depthTest: false });
  const cones = new THREE.InstancedMesh(coneGeometry, coneMaterial, position.count);
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(1, 1, 1);
  const center = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    start.fromBufferAttribute(position, i);
    direction.fromBufferAttribute(normal, i).normalize();
    end.copy(start).addScaledVector(direction, length);
    center.copy(end).addScaledVector(direction, -coneHeight * 0.5);
    quaternion.setFromUnitVectors(up, direction);
    matrix.compose(center, quaternion, scale);
    cones.setMatrixAt(i, matrix);
  }
  cones.instanceMatrix.needsUpdate = true;
  group.add(cones);
  return group;
}

function frameModel(bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z, 1);
  controls.target.copy(center);
  camera.near = Math.max(radius / 1000, 0.01);
  camera.far = radius * 20;
  camera.position.set(center.x, center.y + radius * 0.35, center.z + radius * 1.8);
  camera.updateProjectionMatrix();
  controls.update();
}

function disposeCurrent() {
  if (state.root) {
    scene.remove(state.root);
    disposeObject(state.root);
  }
  for (const url of state.objectUrls) URL.revokeObjectURL(url);
  state.objectUrls = [];
  state.root = null;
  state.skeletonLines = null;
  state.bounds = null;
  state.normalVisualizers = [];
  state.normalLength = 0;
  state.meshEntries = [];
  state.boneNodes = new Map();
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
        if (material.userData?.baseMap) textures.add(material.userData.baseMap);
      }
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}

function setStatus(message) {
  el.status.textContent = message;
}

function resize() {
  const rect = el.viewport.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, true);
}

function animate() {
  requestAnimationFrame(animate);
  if (state.currentAnimation && el.autoPlay.checked) {
    applyAnimation((getNow() - state.animationStartTime) * ANIMATION_FPS);
    updateFrameControls();
  }
  controls.update();
  renderer.render(scene, camera);
}

function getNow() {
  return clock.getElapsedTime();
}
