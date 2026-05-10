import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DDSLoader } from "three/addons/loaders/DDSLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { TGALoader } from "three/addons/loaders/TGALoader.js";
import { readPakFromBuffer } from "./pak.js";

const el = {
  app: document.querySelector("#app"),
  viewport: document.querySelector("#viewport"),
  panelResizer: document.querySelector("#panelResizer"),
  highlightInfo: document.querySelector("#highlightInfo"),
  meshNameOverlay: document.querySelector("#meshNameOverlay"),
  helpButton: document.querySelector("#helpButton"),
  helpDialog: document.querySelector("#helpDialog"),
  helpClose: document.querySelector("#helpClose"),
  helpContent: document.querySelector("#helpContent"),
  languageButtons: document.querySelector("#languageButtons"),
  fileInput: document.querySelector("#fileInput"),
  folderInput: document.querySelector("#folderInput"),
  skinImportInput: document.querySelector("#skinImportInput"),
  skinVertexMode: document.querySelector("#skinVertexMode"),
  skinFaceMode: document.querySelector("#skinFaceMode"),
  skinCleanRemote: document.querySelector("#skinCleanRemote"),
  skinRemoteK: document.querySelector("#skinRemoteK"),
  skinJointSleeves: document.querySelector("#skinJointSleeves"),
  skinSleeveLength: document.querySelector("#skinSleeveLength"),
  saveModel: document.querySelector("#saveModel"),
  modelSelect: document.querySelector("#modelSelect"),
  animationSelect: document.querySelector("#animationSelect"),
  clearModels: document.querySelector("#clearModels"),
  clearAnimations: document.querySelector("#clearAnimations"),
  autoPlay: document.querySelector("#autoPlay"),
  animationFrame: document.querySelector("#animationFrame"),
  frameLabel: document.querySelector("#frameLabel"),
  missingBlock: document.querySelector("#missingBlock"),
  missingTextures: document.querySelector("#missingTextures"),
  textureAddInput: document.querySelector("#textureAddInput"),
  showTextures: document.querySelector("#showTextures"),
  showWireframe: document.querySelector("#showWireframe"),
  showSkeleton: document.querySelector("#showSkeleton"),
  showMeshNames: document.querySelector("#showMeshNames"),
  targetModelHeight: document.querySelector("#targetModelHeight"),
  scaleModelHeight: document.querySelector("#scaleModelHeight"),
  resetModelPosition: document.querySelector("#resetModelPosition"),
  undoEdit: document.querySelector("#undoEdit"),
  redoEdit: document.querySelector("#redoEdit"),
  showNormals: document.querySelector("#showNormals"),
  showBounds: document.querySelector("#showBounds"),
  showGrid: document.querySelector("#showGrid"),
  normalScale: document.querySelector("#normalScale"),
  addPart: document.querySelector("#addPart"),
  duplicatePart: document.querySelector("#duplicatePart"),
  exportSelectedParts: document.querySelector("#exportSelectedParts"),
  batchExportParts: document.querySelector("#batchExportParts"),
  batchReplaceInput: document.querySelector("#batchReplaceInput"),
  batchEditToggle: document.querySelector("#batchEditToggle"),
  batchGroupTransform: document.querySelector("#batchGroupTransform"),
  batchEditReset: document.querySelector("#batchEditReset"),
  batchEditPanel: document.querySelector("#batchEditPanel"),
  batchTransformEditor: document.querySelector("#batchTransformEditor"),
  submeshList: document.querySelector("#submeshList"),
  partFilter: document.querySelector("#partFilter"),
  editorBlock: document.querySelector("#editorBlock"),
  editorName: document.querySelector("#editorName"),
  restorePart: document.querySelector("#restorePart"),
  clearPartMesh: document.querySelector("#clearPartMesh"),
  deletePart: document.querySelector("#deletePart"),
  editName: document.querySelector("#editName"),
  editMaterial: document.querySelector("#editMaterial"),
  editParent: document.querySelector("#editParent"),
  keepWorldOnParentChange: document.querySelector("#keepWorldOnParentChange"),
  matrixMode: document.querySelector("#matrixMode"),
  transformEditor: document.querySelector("#transformEditor"),
  replaceMeshInput: document.querySelector("#replaceMeshInput"),
  replaceKeepSize: document.querySelector("#replaceKeepSize"),
  replaceHint: document.querySelector("#replaceHint"),
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

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const pointerDown = new THREE.Vector2();

scene.add(new THREE.HemisphereLight(0xffffff, 0x2c3540, 2.2));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(80, 150, 110);
scene.add(keyLight);

const grid = new THREE.GridHelper(2200, 22, 0x3a4652, 0x242b33);
scene.add(grid);

const ddsLoader = new DDSLoader();
const textureLoader = new THREE.TextureLoader();
const tgaLoader = new TGALoader();
const clock = new THREE.Clock();
const ANIMATION_FPS = 90;
// Highlight color candidates:
// 0xffd36a warm amber, clear on dark/gray models.
// 0x48d6ff cyan, strong contrast on warm textures.
// 0x7cff8a green, good for dark or red/brown textures.
// 0xff6aa8 pink, visible on skin/cloth but more playful.
// 0xffffff white, neutral but weaker on pale textures.
const PART_HIGHLIGHT_COLOR = 0xff6aa8;
const PART_PICK_DRAG_THRESHOLD = 4;
const DDS_BLOCK_SIZE = 4;
const DDS_SAFE_UPSCALE_LIMIT = 128;
const DDS_PALETTE_UPSCALE_MAX_PIXELS = 65536;
const DDS_PALETTE_UNIQUE_COLOR_LIMIT = 256;
const DDS_SAFE_UPSCALE_FACTOR = 4;
const TEXTURE_FILE_PATTERN = /\.(dds|png|jpe?g|webp|bmp|gif|avif|tga)$/i;
const SQUISH_DXT3 = 1 << 1;
const SQUISH_COLOUR_METRIC_UNIFORM = 1 << 6;
const SQUISH_WEIGHT_COLOUR_BY_ALPHA = 1 << 7;
const SQUISH_COLOUR_ITERATIVE_CLUSTER_FIT = 1 << 8;
const PANEL_WIDTH_STORAGE_KEY = "md9tool.panelWidth";
const MIN_PANEL_WIDTH = 340;
const MAX_PANEL_WIDTH = 760;
const I18N = {
  en: {
    openFiles: "Open model / textures / animations",
    openFolder: "Open folder",
    saveMd9: "Save MD9",
    currentModel: "Current model",
    noMd9Loaded: "No MD9 loaded",
    clear: "Clear",
    currentAnimation: "Current animation",
    defaultPose: "Default pose",
    autoPlay: "Auto play",
    globalOptions: "Global options",
    targetHeight: "Target height",
    scaleToHeight: "Scale",
    resetPosition: "Reset position",
    undo: "Undo",
    redo: "Redo",
    connections: "Links",
    filterParts: "Filter",
    missingTextures: "Texture list",
    addTexture: "Add",
    deleteTexture: "Delete",
    textureAdded: "Added {count} textures",
    textureDeleted: "Texture deleted",
    textures: "Textures",
    wireframe: "Wireframe",
    skeleton: "Skeleton",
    meshNames: "Mesh names",
    normals: "Normals",
    bounds: "Bounds",
    grid: "Grid",
    normalLength: "Normal length",
    file: "File",
    materials: "Materials",
    parts: "Parts",
    vertices: "Vertices",
    faces: "Faces",
    verts: "Vtx",
    facesShort: "Tri",
    exportSelected: "Export selected",
    exportIntegrated: "Export GLB",
    addPart: "Add part",
    duplicatePart: "Duplicate",
    importSkinnedGltf: "Import skinned GLB / GLTF",
    vertexOwner: "Vertex",
    faceOwner: "Triangle",
    ownerMaxWeight: "Max weight",
    ownerFirstWeight: "First weight",
    faceMaxTotalWeight: "Max total weight",
    faceMajorityVertex: "Vertex majority",
    faceFirstVertex: "First vertex",
    cleanRemoteFaces: "Clean remote",
    jointSleeves: "Smooth joints",
    sleeveLength: "Length",
    importGltfButton: "Import GLB / GLTF as MD9",
    partName: "Name",
    batchExport: "Export ZIP",
    batchReplace: "Batch Replace",
    batchEdit: "Batch Edit",
    groupTransform: "As group",
    visible: "Show",
    selected: "Edit",
    batchReplaced: "Batch replaced {count} parts",
    batchReplaceNoMatch: "No matching part names for selected models",
    editPart: "Edit part",
    restore: "Restore",
    reset: "Reset",
    clearMesh: "Clear Mesh",
    deletePart: "Delete part",
    material: "Material",
    parentPart: "Parent",
    keepWorldPosition: "Keep position",
    transform: "Transform",
    matrixMode: "Matrix",
    replaceModel: "Replace model",
    replaceKeepSize: "Keep size",
    replaceHint: "Drop obj/mtl or glb/gltf/bin with textures here",
    chooseMd9: "Choose an MD9 file",
    dropOverlay: "Drop md9 / ani / obj / glb / gltf / texture files",
    helpTitle: "Help",
    loading: "Loading...",
    edit: "Edit",
    export: "Export",
    noTexture: "No texture",
    rootNode: "Root",
    noSelectedParts: "No selected parts to export",
    exported: "Exported {name}",
    exportFailed: "GLB export failed: {message}",
    updatedPart: "Updated part {name}",
    restoredPart: "Restored part {name}",
    clearedMesh: "Cleared part {name} with a tiny triangle",
    cannotDeleteLast: "Cannot delete the last part",
    deletedPart: "Deleted part {name}",
    selectPartFirst: "Select a part first",
    invalidHeight: "Enter a valid target height",
    scaledModelHeight: "Scaled model height to {height}",
    resetModelPositionDone: "Reset model position",
    undoDone: "Undone",
    redoDone: "Redone",
    importedSkinnedGltf: "Imported {name} as MD9 with {parts} bone parts",
    importNeedsGltf: "Import needs a glb or gltf file",
    importNeedsSkin: "No skinned mesh with bones found",
    replacementNeedsModel: "Replacement needs an obj, glb, or gltf file",
    replacementNoMesh: "Replacement failed: no usable mesh in the model",
    replacementTooLarge: "Replacement failed: one part has more than 65535 vertices",
    replacedPart: "Replaced part {name}{mtl}",
    readMtl: ", read MTL",
    addedTextures: "Added {count} texture files",
    noSupportedFiles: "No usable md9, ani, or texture files",
    loadingModel: "Loading {name}",
    loadFailed: "Load failed: {name}",
    switchedDefaultPose: "Switched to default pose",
    animationLoaded: "Loaded animation {name}",
    animationLoadFailed: "Animation load failed: {name}",
    modelLoaded: "Loaded {name}",
    md9CountMismatch: "MD9 vertex or index count mismatch",
    aniLengthMismatch: "ANI data length mismatch",
    modelsCleared: "Models cleared",
    animationsCleared: "Animations cleared",
    noModelLoaded: "No model loaded",
    texturesComplete: "All texture files are present",
    textureMissing: "Missing",
    dropOrOpen: "Drop or open",
    savedMd9: "Saved {name}",
    saveFailed: "Save failed: {message}",
    pngEncodeFailed: "PNG atlas encoding failed",
    textureNamePrompt: "Enter the DDS texture filename to write into the MD9",
    modelNamePrompt: "Enter the model filename",
    cannotReadTexture: "Cannot read replacement texture",
    ddsPngUnsupported: "PNG atlas saving cannot re-encode DDS in this version. Use png/jpg/webp for replacement mesh textures.",
    helpLoadFailed: "Failed to load help: {message}"
  },
  zh: {
    openFiles: "打开 模型 / 贴图 / 动画",
    openFolder: "打开目录",
    saveMd9: "保存 MD9",
    currentModel: "当前模型",
    noMd9Loaded: "尚未加载 md9",
    clear: "清空",
    currentAnimation: "当前动画",
    defaultPose: "默认姿势",
    autoPlay: "自动播放",
    globalOptions: "全局选项",
    targetHeight: "目标高度",
    scaleToHeight: "缩放",
    resetPosition: "重置位置",
    undo: "撤销",
    redo: "重做",
    connections: "连接",
    filterParts: "过滤",
    missingTextures: "贴图列表",
    addTexture: "添加",
    deleteTexture: "删除",
    textureAdded: "已添加 {count} 个贴图",
    textureDeleted: "已删除贴图",
    textures: "贴图",
    wireframe: "线框",
    skeleton: "骨骼",
    meshNames: "显示 Mesh 名称",
    normals: "法线",
    bounds: "包围盒",
    grid: "网格",
    normalLength: "法线长度",
    file: "文件",
    materials: "材质",
    parts: "部件",
    vertices: "顶点",
    faces: "面",
    verts: "顶点",
    facesShort: "面",
    exportSelected: "导出选中",
    exportIntegrated: "整合导出",
    addPart: "添加部件",
    duplicatePart: "复制部件",
    importSkinnedGltf: "导入蒙皮 GLB / GLTF",
    vertexOwner: "顶点",
    faceOwner: "三角面",
    ownerMaxWeight: "最大权重",
    ownerFirstWeight: "首个权重",
    faceMaxTotalWeight: "权重总和最大",
    faceMajorityVertex: "顶点多数",
    faceFirstVertex: "首顶点",
    cleanRemoteFaces: "清理远面",
    jointSleeves: "平滑连接",
    sleeveLength: "长度",
    importGltfButton: "导入 GLB / GLTF 为 MD9",
    partName: "名称",
    batchExport: "批量导出",
    batchReplace: "批量替换",
    batchEdit: "批量编辑",
    groupTransform: "整体变换",
    visible: "展示",
    selected: "编辑",
    batchReplaced: "已批量替换 {count} 个部件",
    batchReplaceNoMatch: "选择的模型没有匹配到同名部件",
    editPart: "编辑部件",
    restore: "还原",
    reset: "重置",
    clearMesh: "清空 Mesh",
    deletePart: "删除部件",
    material: "材质",
    parentPart: "父部件",
    keepWorldPosition: "保持位置",
    transform: "变换",
    matrixMode: "矩阵",
    replaceModel: "替换模型",
    replaceKeepSize: "保持大小",
    replaceHint: "可把 obj/mtl 或 glb/gltf/bin 和贴图一起拖入页面",
    chooseMd9: "选择一个 md9 文件",
    dropOverlay: "拖入 md9 / ani / obj / glb / gltf / 贴图文件",
    helpTitle: "使用说明",
    loading: "加载中...",
    edit: "编辑",
    export: "导出",
    noTexture: "无贴图",
    rootNode: "根节点",
    noSelectedParts: "没有选中的部件可导出",
    exported: "已导出 {name}",
    exportFailed: "导出 GLB 失败: {message}",
    updatedPart: "已更新部件 {name}",
    restoredPart: "已还原部件 {name}",
    clearedMesh: "已用极小三角形清空部件 {name}",
    cannotDeleteLast: "不能删除最后一个部件",
    deletedPart: "已删除部件 {name}",
    selectPartFirst: "请先选择一个部件",
    invalidHeight: "请输入有效的目标高度",
    scaledModelHeight: "已将模型高度缩放到 {height}",
    resetModelPositionDone: "已重置模型位置",
    undoDone: "已撤销",
    redoDone: "已重做",
    importedSkinnedGltf: "已将 {name} 导入为 MD9，共 {parts} 个骨骼部件",
    importNeedsGltf: "导入需要 glb 或 gltf 文件",
    importNeedsSkin: "没有找到带骨骼的蒙皮 mesh",
    replacementNeedsModel: "替换部件需要 obj、glb 或 gltf 文件",
    replacementNoMesh: "替换失败: 模型中没有可用 mesh",
    replacementTooLarge: "替换失败: 单个部件顶点数超过 65535",
    replacedPart: "已替换部件 {name}{mtl}",
    readMtl: "，已读取 MTL",
    addedTextures: "已加入 {count} 个贴图文件",
    noSupportedFiles: "没有可用的 md9、ani 或贴图文件",
    loadingModel: "加载 {name}",
    loadFailed: "加载失败: {name}",
    switchedDefaultPose: "已切换到默认姿势",
    animationLoaded: "已加载动画 {name}",
    animationLoadFailed: "动画加载失败: {name}",
    modelLoaded: "已加载 {name}",
    md9CountMismatch: "MD9 顶点或索引计数不一致",
    aniLengthMismatch: "ANI 数据长度不匹配",
    modelsCleared: "已清空模型",
    animationsCleared: "已清空动画",
    noModelLoaded: "尚未加载模型",
    texturesComplete: "贴图文件完整",
    textureMissing: "缺失",
    dropOrOpen: "拖入或打开",
    savedMd9: "已保存 {name}",
    saveFailed: "保存失败: {message}",
    pngEncodeFailed: "PNG atlas 编码失败",
    textureNamePrompt: "请输入写入 MD9 的 DDS 贴图文件名",
    modelNamePrompt: "请输入模型文件名",
    cannotReadTexture: "无法读取替换贴图",
    ddsPngUnsupported: "第一版保存 PNG atlas 不支持把 DDS 重新编码进 PNG，请为替换 mesh 使用 png/jpg/webp 贴图",
    helpLoadFailed: "使用说明加载失败: {message}"
  },
  es: {
    openFiles: "Abrir modelo / texturas / animaciones",
    openFolder: "Abrir carpeta",
    saveMd9: "Guardar MD9",
    currentModel: "Modelo actual",
    noMd9Loaded: "No hay MD9 cargado",
    clear: "Limpiar",
    currentAnimation: "Animacion actual",
    defaultPose: "Pose predeterminada",
    autoPlay: "Reproduccion automatica",
    globalOptions: "Opciones globales",
    targetHeight: "Altura obj.",
    scaleToHeight: "Escalar",
    resetPosition: "Restablecer pos.",
    undo: "Deshacer",
    redo: "Rehacer",
    connections: "Enlaces",
    filterParts: "Filtrar",
    missingTextures: "Lista texturas",
    addTexture: "Agregar",
    deleteTexture: "Borrar",
    textureAdded: "{count} texturas agregadas",
    textureDeleted: "Textura borrada",
    textures: "Texturas",
    wireframe: "Malla",
    skeleton: "Esqueleto",
    meshNames: "Nombres mesh",
    normals: "Normales",
    bounds: "Caja",
    grid: "Cuadricula",
    normalLength: "Longitud de normales",
    file: "Archivo",
    materials: "Materiales",
    parts: "Partes",
    vertices: "Vertices",
    faces: "Caras",
    verts: "Vert.",
    facesShort: "Tri",
    exportSelected: "Exportar seleccion",
    exportIntegrated: "Exportar GLB",
    addPart: "Agregar parte",
    duplicatePart: "Duplicar",
    importSkinnedGltf: "Importar GLB / GLTF con skin",
    vertexOwner: "Vertice",
    faceOwner: "Triangulo",
    ownerMaxWeight: "Peso max.",
    ownerFirstWeight: "Primer peso",
    faceMaxTotalWeight: "Peso total max.",
    faceMajorityVertex: "Mayoria vert.",
    faceFirstVertex: "Primer vert.",
    cleanRemoteFaces: "Limpiar remoto",
    jointSleeves: "Suavizar juntas",
    sleeveLength: "Longitud",
    importGltfButton: "Importar GLB / GLTF a MD9",
    partName: "Nombre",
    batchExport: "Exportar ZIP",
    batchReplace: "Reempl. lote",
    batchEdit: "Editar lote",
    groupTransform: "Como grupo",
    visible: "Ver",
    selected: "Editar",
    batchReplaced: "Reemplazadas {count} partes",
    batchReplaceNoMatch: "Ningun modelo coincide con partes por nombre",
    editPart: "Editar parte",
    restore: "Restaurar",
    reset: "Restablecer",
    clearMesh: "Limpiar Mesh",
    deletePart: "Eliminar parte",
    material: "Material",
    parentPart: "Padre",
    keepWorldPosition: "Mantener pos.",
    transform: "Transformacion",
    matrixMode: "Matriz",
    replaceModel: "Reemplazar modelo",
    replaceKeepSize: "Mantener tamano",
    replaceHint: "Suelta obj/mtl o glb/gltf/bin con texturas aqui",
    chooseMd9: "Elige un archivo MD9",
    dropOverlay: "Suelta archivos md9 / ani / obj / glb / gltf / texturas",
    helpTitle: "Ayuda",
    loading: "Cargando...",
    edit: "Editar",
    export: "Exportar",
    noTexture: "Sin textura",
    rootNode: "Raiz",
    noSelectedParts: "No hay partes seleccionadas para exportar",
    exported: "Exportado {name}",
    exportFailed: "Error al exportar GLB: {message}",
    updatedPart: "Parte actualizada {name}",
    restoredPart: "Parte restaurada {name}",
    clearedMesh: "Parte {name} limpiada con un triangulo diminuto",
    cannotDeleteLast: "No se puede eliminar la ultima parte",
    deletedPart: "Parte eliminada {name}",
    selectPartFirst: "Selecciona una parte primero",
    invalidHeight: "Introduce una altura valida",
    scaledModelHeight: "Modelo escalado a altura {height}",
    resetModelPositionDone: "Posicion del modelo restablecida",
    undoDone: "Deshecho",
    redoDone: "Rehecho",
    importedSkinnedGltf: "Importado {name} como MD9 con {parts} partes de hueso",
    importNeedsGltf: "La importacion necesita un archivo glb o gltf",
    importNeedsSkin: "No se encontro mesh con skin y huesos",
    replacementNeedsModel: "El reemplazo necesita un archivo obj, glb o gltf",
    replacementNoMesh: "Fallo el reemplazo: el modelo no tiene mesh usable",
    replacementTooLarge: "Fallo el reemplazo: una parte supera 65535 vertices",
    replacedPart: "Parte reemplazada {name}{mtl}",
    readMtl: ", MTL leido",
    addedTextures: "Se agregaron {count} texturas",
    noSupportedFiles: "No hay archivos md9, ani o texturas utilizables",
    loadingModel: "Cargando {name}",
    loadFailed: "Fallo la carga: {name}",
    switchedDefaultPose: "Cambiado a pose predeterminada",
    animationLoaded: "Animacion cargada {name}",
    animationLoadFailed: "Fallo al cargar animacion: {name}",
    modelLoaded: "Cargado {name}",
    md9CountMismatch: "Conteo de vertices o indices MD9 inconsistente",
    aniLengthMismatch: "Longitud de datos ANI no coincide",
    modelsCleared: "Modelos limpiados",
    animationsCleared: "Animaciones limpiadas",
    noModelLoaded: "No hay modelo cargado",
    texturesComplete: "Todas las texturas estan presentes",
    textureMissing: "Falta",
    dropOrOpen: "Soltar o abrir",
    savedMd9: "Guardado {name}",
    saveFailed: "Error al guardar: {message}",
    pngEncodeFailed: "Error al codificar PNG atlas",
    textureNamePrompt: "Introduce el nombre DDS para escribir en MD9",
    modelNamePrompt: "Introduce el nombre del modelo",
    cannotReadTexture: "No se puede leer la textura de reemplazo",
    ddsPngUnsupported: "Esta version no puede recodificar DDS en el atlas PNG. Usa png/jpg/webp para texturas de reemplazo.",
    helpLoadFailed: "Error al cargar ayuda: {message}"
  }
};
const FLIP_Z_MATRIX = new THREE.Matrix4().makeScale(1, 1, -1);
const TRANSFORM_CONTROLS = [
  { label: "X", transform: "position", axis: "x", min: -500, max: 500, step: 0.1 },
  { label: "Y", transform: "position", axis: "y", min: -500, max: 500, step: 0.1 },
  { label: "Z", transform: "position", axis: "z", min: -500, max: 500, step: 0.1 },
  { label: "RX", transform: "rotation", axis: "x", min: -180, max: 180, step: 1 },
  { label: "RY", transform: "rotation", axis: "y", min: -180, max: 180, step: 1 },
  { label: "RZ", transform: "rotation", axis: "z", min: -180, max: 180, step: 1 },
  { label: "SX", transform: "scale", axis: "x", min: 0.01, max: 10, step: 0.01 },
  { label: "SY", transform: "scale", axis: "y", min: 0.01, max: 10, step: 0.01 },
  { label: "SZ", transform: "scale", axis: "z", min: 0.01, max: 10, step: 0.01 }
];
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < CRC32_TABLE.length; i++) {
  let value = i;
  for (let bit = 0; bit < 8; bit++) {
    value = (value & 1) ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC32_TABLE[i] = value >>> 0;
}
const state = {
  language: "en",
  md9Files: [],
  aniFiles: [],
  root: null,
  skeletonLines: null,
  bounds: null,
  normalVisualizers: [],
  normalLength: 0,
  meshEntries: [],
  editIndex: -1,
  highlightedPartIndex: -1,
  highlightedMaterial: null,
  highlightedHelper: null,
  meshNameLabels: [],
  cameraKeys: new Set(),
  lastFrameTime: performance.now(),
  textureFiles: new Map(),
  objectUrls: [],
  currentModel: null,
  currentMd9Id: "",
  currentAnimation: null,
  currentAniId: "",
  animationStartTime: 0,
  animationFrame: 0,
  batchTransformMatrix: new THREE.Matrix4(),
  batchSelectedParts: new Set(),
  undoStack: [],
  redoStack: [],
  restoringHistory: false,
  boneNodes: new Map(),
  missingTextures: new Set()
};

el.fileInput.addEventListener("change", () => {
  addFiles([...el.fileInput.files]);
  el.fileInput.value = "";
});
el.helpButton.addEventListener("click", showHelpDialog);
el.helpClose.addEventListener("click", () => el.helpDialog.close());
el.languageButtons.addEventListener("click", (event) => {
  const button = event.target.closest("[data-language]");
  if (button) setLanguage(button.dataset.language);
});
el.folderInput.addEventListener("change", () => {
  addFiles([...el.folderInput.files]);
  el.folderInput.value = "";
});
el.skinImportInput.addEventListener("change", async () => {
  await importSkinnedGltfFiles([...el.skinImportInput.files]);
  el.skinImportInput.value = "";
});
el.modelSelect.addEventListener("change", () => loadSelectedModel(el.modelSelect.value));
el.animationSelect.addEventListener("change", () => loadSelectedAnimation(el.animationSelect.value));
el.clearModels.addEventListener("click", clearModels);
el.clearAnimations.addEventListener("click", clearAnimations);
el.saveModel.addEventListener("click", saveCurrentModel);
el.scaleModelHeight.addEventListener("click", scaleCurrentModelToHeight);
el.resetModelPosition.addEventListener("click", resetCurrentModelPosition);
el.undoEdit.addEventListener("click", undoEdit);
el.redoEdit.addEventListener("click", redoEdit);
el.textureAddInput.addEventListener("change", async () => {
  await addTextureMaterials([...el.textureAddInput.files]);
  el.textureAddInput.value = "";
});
el.partFilter.addEventListener("input", () => {
  if (state.currentModel) populateSubmeshList(state.currentModel);
});
el.addPart.addEventListener("click", addPart);
el.duplicatePart.addEventListener("click", duplicateHighlightedPart);
el.exportSelectedParts.addEventListener("click", exportSelectedPartsGlb);
el.batchExportParts.addEventListener("click", batchExportSelectedPartsGlb);
el.batchReplaceInput.addEventListener("change", async () => {
  await batchReplaceSelectedPartsFromFiles([...el.batchReplaceInput.files]);
  el.batchReplaceInput.value = "";
});
el.batchEditToggle.addEventListener("click", toggleBatchEditor);
el.batchEditReset.addEventListener("click", resetBatchEditor);
el.restorePart.addEventListener("click", restoreEditedPart);
el.clearPartMesh.addEventListener("click", clearEditedPartMesh);
el.deletePart.addEventListener("click", deleteEditedPart);
el.editName.addEventListener("input", applyEditorValues);
el.editMaterial.addEventListener("input", applyEditorValues);
el.editParent.addEventListener("input", applyEditorValues);
el.matrixMode.addEventListener("change", () => {
  if (!state.currentModel || state.editIndex < 0) return;
  buildTransformEditor(state.currentModel.submeshes[state.editIndex]);
});
el.replaceMeshInput.addEventListener("change", async () => {
  await replaceEditedPartFromFiles([...el.replaceMeshInput.files]);
  el.replaceMeshInput.value = "";
});
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
  el.showMeshNames,
  el.showNormals,
  el.showBounds,
  el.showGrid,
  el.normalScale
]) {
  input.addEventListener("input", applyOptions);
}

el.editorBlock.addEventListener("input", (event) => {
  if (event.target.matches("[data-transform]")) {
    syncTransformInputPair(event.target);
    applyEditorValues();
  }
});
el.batchEditPanel.addEventListener("input", (event) => {
  if (event.target.matches("[data-transform]")) {
    syncBatchTransformInputPair(event.target);
    applyBatchEditorDelta();
  }
});

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(el.viewport);
window.addEventListener("resize", resize);
restorePanelWidth();
installPanelResize();
installCameraKeyboardControls();
installViewportPicking();
installDropHandlers();
populateEditorForNoSelection();
setEditorEnabled(false);
updateHistoryButtons();
resize();
setLanguage(detectInitialLanguage());
animate();

function t(key, values = {}) {
  const template = I18N[state.language]?.[key] || I18N.en[key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem("md9tool.language");
    if (I18N[saved]) return saved;
  } catch (error) {
    console.warn("Language preference read failed", error);
  }
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const language of languages) {
    const base = String(language || "").toLowerCase().split("-")[0];
    if (I18N[base]) return base;
  }
  return "en";
}

function setLanguage(language) {
  state.language = I18N[language] ? language : "en";
  try {
    localStorage.setItem("md9tool.language", state.language);
  } catch (error) {
    console.warn("Language preference save failed", error);
  }
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : state.language;
  for (const button of el.languageButtons.querySelectorAll("[data-language]")) {
    const active = button.dataset.language === state.language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  }
  el.helpButton.title = t("helpTitle");
  el.helpButton.setAttribute("aria-label", t("helpTitle"));
  el.helpClose.setAttribute("aria-label", state.language === "es" ? "Cerrar" : state.language === "zh" ? "关闭" : "Close");
  if (!state.currentModel) setStatus(t("chooseMd9"));
  updateModelSelect();
  updateAnimationSelect();
  if (state.currentModel) {
    populateSubmeshList(state.currentModel);
    updateMissingTextures(state.currentModel);
    if (state.editIndex >= 0) openPartEditor(state.editIndex);
    else {
      populateEditorForNoSelection();
      setEditorEnabled(false);
    }
  } else {
    populateEditorForNoSelection();
    setEditorEnabled(false);
    updateMissingTextures(null);
  }
  if (el.helpDialog.open) showHelpDialog();
}

async function addFiles(files) {
  const zipFiles = files.filter((file) => /\.zip$/i.test(file.name));
  const pakFiles = files.filter((file) => /\.pak$/i.test(file.name));
  if (zipFiles.length || pakFiles.length) {
    const expanded = [];
    for (const file of zipFiles) expanded.push(...(await unzipFile(file)));
    for (const file of pakFiles) expanded.push(...(await unpackPakFile(file)));
    files = [...files.filter((file) => !/\.(zip|pak)$/i.test(file.name)), ...expanded];
  }
  const md9Files = files.filter((file) => file.name.toLowerCase().endsWith(".md9"));
  const aniFiles = files.filter((file) => file.name.toLowerCase().endsWith(".ani"));
  const textureFiles = files.filter((file) => isTextureFile(file.name));
  const replacementModelFiles = files.filter((file) => isReplacementModelFile(file.name));

  if (!md9Files.length && !aniFiles.length && replacementModelFiles.length && state.editIndex >= 0) {
    await replaceEditedPartFromFiles(files);
    return;
  }

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
    setStatus(t("addedTextures", { count: textureFiles.length }));
  } else {
    setStatus(t("noSupportedFiles"));
  }
}

function isTextureFile(name) {
  return TEXTURE_FILE_PATTERN.test(name);
}

function isReplacementModelFile(name) {
  return /\.(obj|glb|gltf)$/i.test(name);
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
  state.undoStack = [];
  state.redoStack = [];
  state.editIndex = -1;
  state.batchSelectedParts = new Set();
  el.saveModel.disabled = true;
  el.scaleModelHeight.disabled = true;
  el.resetModelPosition.disabled = true;
  el.partFilter.disabled = true;
  el.partFilter.value = "";
  el.addPart.disabled = true;
  el.duplicatePart.disabled = true;
  el.deletePart.disabled = true;
  el.exportSelectedParts.disabled = true;
  el.batchExportParts.disabled = true;
  el.batchEditToggle.disabled = true;
  populateEditorForNoSelection();
  setEditorEnabled(false);
  el.batchEditPanel.hidden = true;
  setBatchEditToggleActive(false);
  el.submeshList.replaceChildren();
  updateModelSelect();
  updateAnimationSelect();
  updateMissingTextures(null);
  updateHistoryButtons();
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
  setStatus(t("loadingModel", { name: item.label }));
  try {
    const model = item.model || parseMd9(await item.file.arrayBuffer(), item.label, "");
    await showModel(model, item.label);
    if (state.currentAnimation) applyAnimation(0);
  } catch (error) {
    console.error(error);
    setStatus(t("loadFailed", { name: item.label }));
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
    setStatus(t("switchedDefaultPose"));
    return;
  }
  const item = state.aniFiles.find((candidate) => candidate.id === id);
  if (!item) return;
  state.currentAniId = id;
  el.animationSelect.value = id;
  try {
    if (!item.animation) item.animation = parseAni(await item.file.arrayBuffer(), item.label);
    state.currentAnimation = item.animation;
    state.animationStartTime = getNow();
    state.animationFrame = 0;
    applyAnimation(0);
    updateFrameControls();
    setStatus(t("animationLoaded", { name: item.label }));
  } catch (error) {
    console.error(error);
    setStatus(t("animationLoadFailed", { name: item.label }));
  }
}

async function showModel(model, label) {
  disposeCurrent();
  state.currentModel = model;
  state.editIndex = -1;
  state.highlightedPartIndex = -1;
  state.batchSelectedParts = new Set();
  if (!state.restoringHistory) {
    state.undoStack = [];
    state.redoStack = [];
  }
  el.saveModel.disabled = false;
  el.scaleModelHeight.disabled = false;
  el.resetModelPosition.disabled = false;
  el.partFilter.disabled = false;
  el.addPart.disabled = false;
  el.duplicatePart.disabled = true;
  el.deletePart.disabled = true;
  populateEditorForNoSelection();
  setEditorEnabled(false);
  el.batchEditPanel.hidden = true;
  setBatchEditToggleActive(false);
  updateHistoryButtons();
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

  rebuildMeshNameLabels();
  populateSubmeshList(model);
  updateStats(model, label);
  frameModel(model.bounds);
  applyOptions();
  updateHighlightInfo();
  updateMissingTextures(model);
  setStatus(t("modelLoaded", { name: label }));
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
    const extra = newFormat ? Array.from(new Uint8Array(buffer, offset, 16)) : [];
    materials.push({ diffuse, ambient, specular, emissive, power, textureName, extra });
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

  const declaredTotalVertices = readInt();
  const declaredTotalFaces = readInt();
  const headerTotalVertices = headers.reduce((sum, header) => sum + header.vertexCount, 0);
  const headerTotalFaces = headers.reduce((sum, header) => sum + header.faceCount, 0);
  const totalVertices = headerTotalVertices || declaredTotalVertices;
  const totalFaces = headerTotalFaces || declaredTotalFaces;
  if (declaredTotalVertices !== totalVertices || declaredTotalFaces !== totalFaces) {
    console.warn(
      `MD9 count mismatch in ${name}: declared vertices/faces ${declaredTotalVertices}/${declaredTotalFaces}, `
      + `header vertices/faces ${headerTotalVertices}/${headerTotalFaces}. Using header counts.`
    );
  }
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
      matrix: [...header.matrix],
      boundingBox: [...header.boundingBox],
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

  if (vertexCursor !== headerTotalVertices || indexCursor !== allIndices.length) {
    throw new Error(t("md9CountMismatch"));
  }

  const model = { name, baseDir, newFormat, materials, submeshes, totalVertices, totalFaces, bounds };
  captureInitialModelState(model);
  return model;
}

function captureInitialModelState(model) {
  for (const part of model.submeshes) {
    part.initialState = clonePartState(part);
    part.replacement = null;
  }
}

function clonePartState(part) {
  return {
    name: part.name,
    matrix: [...part.matrix],
    boundingBox: [...part.boundingBox],
    localPositions: new Float32Array(part.localPositions),
    normals: new Float32Array(part.normals),
    uvs: new Float32Array(part.uvs),
    indices: new Uint16Array(part.indices),
    materialId: part.materialId,
    parentId: part.parentId,
    vertexCount: part.vertexCount,
    faceCount: part.faceCount
  };
}

function cloneModelSnapshot(model) {
  return {
    name: model.name,
    baseDir: model.baseDir,
    newFormat: model.newFormat,
    materials: model.materials.map(cloneMaterialState),
    submeshes: model.submeshes.map(clonePartForSnapshot),
    generatedAnimations: model.generatedAnimations || [],
    highlightedPartIndex: state.highlightedPartIndex,
    batchSelectedParts: [...state.batchSelectedParts]
  };
}

function cloneMaterialState(material) {
  return {
    ...material,
    diffuse: material.diffuse ? [...material.diffuse] : [1, 1, 1, 1],
    ambient: material.ambient ? [...material.ambient] : [0, 0, 0, 1],
    specular: material.specular ? [...material.specular] : [0, 0, 0, 1],
    emissive: material.emissive ? [...material.emissive] : [0, 0, 0, 1],
    extra: material.extra ? [...material.extra] : undefined
  };
}

function clonePartForSnapshot(part) {
  const clone = {
    ...clonePartState(part),
    bonePosition: part.bonePosition?.clone?.() || new THREE.Vector3(),
    worldBonePosition: part.worldBonePosition?.clone?.() || new THREE.Vector3(),
    replacement: part.replacement ? { ...part.replacement } : null
  };
  clone.initialState = part.initialState ? clonePartState(part.initialState) : clonePartState(part);
  return clone;
}

function pushUndoSnapshot() {
  if (!state.currentModel || state.restoringHistory) return;
  state.undoStack.push(cloneModelSnapshot(state.currentModel));
  if (state.undoStack.length > 60) state.undoStack.shift();
  state.redoStack = [];
  updateHistoryButtons();
}

async function undoEdit() {
  if (!state.undoStack.length || !state.currentModel) return;
  state.redoStack.push(cloneModelSnapshot(state.currentModel));
  const snapshot = state.undoStack.pop();
  await restoreModelSnapshot(snapshot);
  setStatus(t("undoDone"));
}

async function redoEdit() {
  if (!state.redoStack.length || !state.currentModel) return;
  state.undoStack.push(cloneModelSnapshot(state.currentModel));
  const snapshot = state.redoStack.pop();
  await restoreModelSnapshot(snapshot);
  setStatus(t("redoDone"));
}

async function restoreModelSnapshot(snapshot) {
  state.restoringHistory = true;
  try {
    const model = state.currentModel;
    model.name = snapshot.name;
    model.baseDir = snapshot.baseDir;
    model.newFormat = snapshot.newFormat;
    model.materials = snapshot.materials.map(cloneMaterialState);
    model.submeshes = snapshot.submeshes.map(clonePartForSnapshot);
    model.generatedAnimations = snapshot.generatedAnimations || [];
    updateGeneratedModelCounts(model);
    await showModel(model, model.name);
    state.batchSelectedParts = new Set(snapshot.batchSelectedParts || []);
    populateSubmeshList(model);
    if (snapshot.highlightedPartIndex >= 0 && model.submeshes[snapshot.highlightedPartIndex]) {
      setHighlightedPart(snapshot.highlightedPartIndex);
    } else {
      clearHighlightedPart();
    }
  } finally {
    state.restoringHistory = false;
    updateHistoryButtons();
  }
}

function updateHistoryButtons() {
  el.undoEdit.disabled = !state.currentModel || !state.undoStack.length;
  el.redoEdit.disabled = !state.currentModel || !state.redoStack.length;
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
    const scaleCount = readInt();
    const positions = [];
    const rotations = [];
    const scales = [];
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
    for (let j = 0; j < scaleCount; j++) {
      scales.push({
        time: readFloat(),
        value: new THREE.Vector3(readFloat(), readFloat(), readFloat())
      });
    }
    tracks.set(boneName, { boneName, positions, rotations, scales });
  }
  if (offset !== buffer.byteLength) {
    throw new Error(t("aniLengthMismatch"));
  }
  return { name, duration, tracks };
}

function serializeAni(animation) {
  const tracks = [...animation.tracks.values()];
  let byteLength = 8;
  for (const track of tracks) {
    byteLength += 1 + Math.min(255, track.boneName.length) + 12;
    byteLength += track.positions.length * 16;
    byteLength += track.rotations.length * 20;
    byteLength += track.scales.length * 16;
  }
  const buffer = new ArrayBuffer(byteLength);
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
  writeInt(tracks.length);
  writeFloat(animation.duration || 0);
  for (const track of tracks) {
    const name = String(track.boneName || "").slice(0, 255);
    view.setUint8(offset++, name.length);
    for (let i = 0; i < name.length; i++) view.setUint8(offset++, name.charCodeAt(i) & 0x7f);
    writeInt(track.positions.length);
    writeInt(track.rotations.length);
    writeInt(track.scales.length);
    for (const key of track.positions) {
      writeFloat(key.time);
      writeFloat(key.value.x);
      writeFloat(key.value.y);
      writeFloat(-key.value.z);
    }
    for (const key of track.rotations) {
      writeFloat(key.time);
      writeFloat(-key.value.x);
      writeFloat(-key.value.y);
      writeFloat(key.value.z);
      writeFloat(key.value.w);
    }
    for (const key of track.scales) {
      writeFloat(key.time);
      writeFloat(key.value.x);
      writeFloat(key.value.y);
      writeFloat(key.value.z);
    }
  }
  return buffer;
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

  if (material.atlasSourceImage) {
    const texture = new THREE.CanvasTexture(material.atlasSourceImage);
    texture.name = material.textureName || "";
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    texture.userData.hasAlpha = material.atlasHasAlpha || false;
    threeMaterial.map = texture;
    threeMaterial.userData.baseMap = texture;
    threeMaterial.color.set(0xffffff);
    applyTextureAlphaToMaterial(threeMaterial, texture);
    return threeMaterial;
  }

  const resolvedTexture = resolveTextureUrl(material.textureName, baseDir);
  if (resolvedTexture) {
    try {
      const texture = await loadTexture(resolvedTexture.url, resolvedTexture.name);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      threeMaterial.map = texture;
      threeMaterial.color.set(0xffffff);
      applyTextureAlphaToMaterial(threeMaterial, texture);
      threeMaterial.needsUpdate = true;
    } catch (error) {
      console.warn(`Texture load failed: ${material.textureName}`, error);
    }
  }
  return threeMaterial;
}

async function loadTexture(url, textureName) {
  if (textureName.toLowerCase().endsWith(".dds")) return loadDdsAsCanvasTexture(url, textureName);
  if (textureName.toLowerCase().endsWith(".tga")) {
    return tgaLoader.loadAsync(url).then((texture) => {
      texture.flipY = false;
      return texture;
    });
  }
  return textureLoader.loadAsync(url).then((texture) => {
    texture.flipY = false;
    return texture;
  });
}

function applyTextureAlphaToMaterial(material, texture) {
  if (!texture?.userData?.hasAlpha) return;
  material.transparent = true;
  material.alphaTest = Math.max(material.alphaTest || 0, 0.01);
}

async function loadDdsAsCanvasTexture(url, textureName) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const canvas = decodeDdsToCanvas(await response.arrayBuffer());
    const texture = new THREE.CanvasTexture(canvas);
    texture.name = textureName || "";
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.userData.hasAlpha = canvas.userData?.hasAlpha || false;
    texture.needsUpdate = true;
    return texture;
  } catch (error) {
    console.warn(`DDS alpha decode failed, falling back to DDSLoader: ${textureName}`, error);
    const texture = await ddsLoader.loadAsync(url);
    texture.userData.hasAlpha = true;
    return texture;
  }
}

function decodeDdsToCanvas(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x20534444 || view.getUint32(4, true) !== 124) {
    throw new Error("Invalid DDS file");
  }
  const height = view.getUint32(12, true);
  const width = view.getUint32(16, true);
  const pixelFlags = view.getUint32(80, true);
  const fourCc = String.fromCharCode(
    view.getUint8(84),
    view.getUint8(85),
    view.getUint8(86),
    view.getUint8(87)
  );
  const data = new Uint8Array(buffer);
  const pixels = new Uint8ClampedArray(width * height * 4);
  let hasAlpha = false;

  if (pixelFlags & 0x4) {
    const decoder = fourCc === "DXT1"
      ? decodeDxt1Block
      : fourCc === "DXT3"
        ? decodeDxt3Block
        : fourCc === "DXT5"
          ? decodeDxt5Block
          : null;
    if (!decoder) throw new Error(`Unsupported DDS format ${fourCc}`);
    const blockSize = fourCc === "DXT1" ? 8 : 16;
    let offset = 128;
    for (let blockY = 0; blockY < Math.ceil(height / 4); blockY++) {
      for (let blockX = 0; blockX < Math.ceil(width / 4); blockX++) {
        hasAlpha = decoder(data, offset, pixels, width, height, blockX * 4, blockY * 4) || hasAlpha;
        offset += blockSize;
      }
    }
  } else {
    hasAlpha = decodeUncompressedDds(view, data, pixels, width, height);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
  canvas.userData = { hasAlpha };
  return canvas;
}

function decodeDxt1Block(data, offset, pixels, width, height, startX, startY) {
  const colors = decodeDxtColors(data[offset] | (data[offset + 1] << 8), data[offset + 2] | (data[offset + 3] << 8), true);
  const codes = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
  let hasAlpha = false;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const color = colors[(codes >>> (2 * (y * 4 + x))) & 3];
      hasAlpha = writeDdsPixel(pixels, width, height, startX + x, startY + y, color[0], color[1], color[2], color[3]) || hasAlpha;
    }
  }
  return hasAlpha;
}

function decodeDxt3Block(data, offset, pixels, width, height, startX, startY) {
  const colors = decodeDxtColors(data[offset + 8] | (data[offset + 9] << 8), data[offset + 10] | (data[offset + 11] << 8), false);
  const codes = data[offset + 12] | (data[offset + 13] << 8) | (data[offset + 14] << 16) | (data[offset + 15] << 24);
  let hasAlpha = false;
  for (let y = 0; y < 4; y++) {
    const alphaRow = data[offset + y * 2] | (data[offset + y * 2 + 1] << 8);
    for (let x = 0; x < 4; x++) {
      const color = colors[(codes >>> (2 * (y * 4 + x))) & 3];
      const alpha = ((alphaRow >>> (x * 4)) & 0xf) * 17;
      hasAlpha = writeDdsPixel(pixels, width, height, startX + x, startY + y, color[0], color[1], color[2], alpha) || hasAlpha;
    }
  }
  return hasAlpha;
}

function decodeDxt5Block(data, offset, pixels, width, height, startX, startY) {
  const alphas = decodeDxt5Alphas(data[offset], data[offset + 1]);
  let alphaBits = 0n;
  for (let i = 0; i < 6; i++) alphaBits |= BigInt(data[offset + 2 + i]) << BigInt(i * 8);
  const colors = decodeDxtColors(data[offset + 8] | (data[offset + 9] << 8), data[offset + 10] | (data[offset + 11] << 8), false);
  const codes = data[offset + 12] | (data[offset + 13] << 8) | (data[offset + 14] << 16) | (data[offset + 15] << 24);
  let hasAlpha = false;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const index = y * 4 + x;
      const color = colors[(codes >>> (2 * index)) & 3];
      const alpha = alphas[Number((alphaBits >> BigInt(index * 3)) & 0x7n)];
      hasAlpha = writeDdsPixel(pixels, width, height, startX + x, startY + y, color[0], color[1], color[2], alpha) || hasAlpha;
    }
  }
  return hasAlpha;
}

function decodeDxtColors(color0, color1, allowTransparent) {
  const c0 = decodeRgb565(color0);
  const c1 = decodeRgb565(color1);
  const colors = [
    [c0[0], c0[1], c0[2], 255],
    [c1[0], c1[1], c1[2], 255],
    [0, 0, 0, 255],
    [0, 0, 0, 255]
  ];
  if (allowTransparent && color0 <= color1) {
    colors[2] = [Math.round((c0[0] + c1[0]) / 2), Math.round((c0[1] + c1[1]) / 2), Math.round((c0[2] + c1[2]) / 2), 255];
    colors[3] = [0, 0, 0, 0];
  } else {
    colors[2] = [
      Math.round((2 * c0[0] + c1[0]) / 3),
      Math.round((2 * c0[1] + c1[1]) / 3),
      Math.round((2 * c0[2] + c1[2]) / 3),
      255
    ];
    colors[3] = [
      Math.round((c0[0] + 2 * c1[0]) / 3),
      Math.round((c0[1] + 2 * c1[1]) / 3),
      Math.round((c0[2] + 2 * c1[2]) / 3),
      255
    ];
  }
  return colors;
}

function decodeRgb565(value) {
  return [
    Math.round(((value >> 11) & 0x1f) * 255 / 31),
    Math.round(((value >> 5) & 0x3f) * 255 / 63),
    Math.round((value & 0x1f) * 255 / 31)
  ];
}

function decodeDxt5Alphas(alpha0, alpha1) {
  const alphas = [alpha0, alpha1, 0, 0, 0, 0, 0, 0];
  if (alpha0 > alpha1) {
    for (let i = 1; i <= 6; i++) alphas[i + 1] = Math.round(((7 - i) * alpha0 + i * alpha1) / 7);
  } else {
    for (let i = 1; i <= 4; i++) alphas[i + 1] = Math.round(((5 - i) * alpha0 + i * alpha1) / 5);
    alphas[6] = 0;
    alphas[7] = 255;
  }
  return alphas;
}

function writeDdsPixel(pixels, width, height, x, y, r, g, b, a) {
  if (x >= width || y >= height) return false;
  const index = (y * width + x) * 4;
  pixels[index] = r;
  pixels[index + 1] = g;
  pixels[index + 2] = b;
  pixels[index + 3] = a;
  return a < 255;
}

function decodeUncompressedDds(view, data, pixels, width, height) {
  const rgbBitCount = view.getUint32(88, true);
  const rMask = view.getUint32(92, true);
  const gMask = view.getUint32(96, true);
  const bMask = view.getUint32(100, true);
  const aMask = view.getUint32(104, true);
  if (rgbBitCount !== 32) throw new Error(`Unsupported DDS bit depth ${rgbBitCount}`);
  let hasAlpha = false;
  let offset = 128;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = view.getUint32(offset, true);
      const a = aMask ? extractMaskedByte(value, aMask) : 255;
      hasAlpha = writeDdsPixel(
        pixels,
        width,
        height,
        x,
        y,
        extractMaskedByte(value, rMask),
        extractMaskedByte(value, gMask),
        extractMaskedByte(value, bMask),
        a
      ) || hasAlpha;
      offset += 4;
    }
  }
  return hasAlpha;
}

function extractMaskedByte(value, mask) {
  if (!mask) return 0;
  const shift = Math.log2(mask & -mask);
  const max = mask >>> shift;
  return Math.round(((value & mask) >>> shift) * 255 / max);
}

function resolveTextureUrl(textureName, baseDir) {
  if (!textureName) return "";
  const resolved = findCompatibleTexture(textureName, baseDir);
  if (!resolved) return "";
  if (resolved.fileOrUrl instanceof File) {
    const url = URL.createObjectURL(resolved.fileOrUrl);
    state.objectUrls.push(url);
    return { url, name: resolved.name };
  }
  if (typeof resolved.fileOrUrl === "string") return { url: resolved.fileOrUrl, name: resolved.name };
  return "";
}

function findCompatibleTexture(textureName, baseDir = "") {
  if (!textureName) return null;
  const candidates = [
    textureKey(`${baseDir}${textureName}`),
    textureKey(textureName)
  ];
  for (const key of candidates) {
    if (!state.textureFiles.has(key)) continue;
    const fileOrUrl = state.textureFiles.get(key);
    return { name: textureNameFromFileOrKey(fileOrUrl, key), fileOrUrl };
  }

  const base = textureBaseKey(textureName);
  for (const [key, fileOrUrl] of state.textureFiles) {
    if (textureBaseKey(key) !== base) continue;
    return { name: textureNameFromFileOrKey(fileOrUrl, key), fileOrUrl };
  }
  return null;
}

function textureNameFromFileOrKey(fileOrUrl, key) {
  return fileOrUrl instanceof File ? fileOrUrl.name : key;
}

function textureKey(path) {
  return path.split(/[\\/]/).pop().toLowerCase();
}

function textureBaseKey(path) {
  return textureKey(path).replace(/\.[^.]*$/, "");
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
    const transform = getPartTransform(part);
    node.name = `${part.name} bone`;
    node.position.copy(transform.position);
    node.quaternion.copy(transform.quaternion);
    node.scale.copy(transform.scale);
    node.userData.defaultPosition = transform.position.clone();
    node.userData.defaultQuaternion = transform.quaternion.clone();
    node.userData.defaultScale = transform.scale.clone();
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

function rebuildMeshNameLabels() {
  state.meshNameLabels = [];
  el.meshNameOverlay.replaceChildren();
  if (!state.currentModel) return;
  for (const [index, part] of state.currentModel.submeshes.entries()) {
    const label = document.createElement("div");
    label.className = "mesh-name-label";
    label.dataset.partIndex = String(index);
    label.textContent = part.name;
    el.meshNameOverlay.append(label);
    state.meshNameLabels.push({ label, partIndex: index });
  }
  updateMeshNameLabels();
}

function updateMeshNameLabels() {
  if (!state.currentModel || !el.showMeshNames.checked) return;
  const rect = el.viewport.getBoundingClientRect();
  const world = new THREE.Vector3();
  const projected = new THREE.Vector3();
  for (const entry of state.meshNameLabels) {
    const part = state.currentModel.submeshes[entry.partIndex];
    const node = part ? state.boneNodes.get(part.name) : null;
    if (!part || !node) {
      entry.label.hidden = true;
      continue;
    }
    if (entry.label.textContent !== part.name) entry.label.textContent = part.name;
    node.getWorldPosition(world);
    projected.copy(world).project(camera);
    const visible = projected.z >= -1 && projected.z <= 1;
    entry.label.hidden = !visible;
    if (!visible) continue;
    entry.label.style.left = `${(projected.x * 0.5 + 0.5) * rect.width}px`;
    entry.label.style.top = `${(-projected.y * 0.5 + 0.5) * rect.height}px`;
  }
}

function populateSubmeshList(model) {
  el.submeshList.replaceChildren();
  const filteredIndices = getFilteredPartIndices(model);
  const header = document.createElement("div");
  header.className = "submesh-row submesh-table-head";
  const visibleAll = document.createElement("input");
  visibleAll.type = "checkbox";
  visibleAll.checked = filteredIndices.length > 0 && filteredIndices.every((index) => state.meshEntries[index]?.mesh?.visible);
  visibleAll.addEventListener("input", () => setAllPartsVisible(visibleAll.checked, filteredIndices));
  const editAll = document.createElement("input");
  editAll.type = "checkbox";
  editAll.checked = filteredIndices.length > 0 && filteredIndices.every((index) => state.batchSelectedParts.has(index));
  editAll.addEventListener("input", () => setAllPartsSelected(editAll.checked, filteredIndices));
  const visibleHead = createHeaderCheckboxCell(visibleAll, t("visible"));
  const editHead = createHeaderCheckboxCell(editAll, t("selected"));
  const idHead = document.createElement("span");
  idHead.textContent = "ID";
  const nameHead = document.createElement("span");
  nameHead.textContent = t("parts");
  const countHead = document.createElement("span");
  countHead.textContent = `${t("verts")}/${t("facesShort")}`;
  header.append(visibleHead, editHead, idHead, nameHead, countHead, document.createElement("span"));
  el.submeshList.append(header);
  updateBatchActionState();
  for (const index of filteredIndices) {
    const part = model.submeshes[index];
    const row = document.createElement("div");
    row.className = "submesh-row";
    row.dataset.partIndex = String(index);
    row.classList.toggle("highlighted", state.highlightedPartIndex === index);
    row.addEventListener("click", (event) => {
      if (event.target.closest("button,input,label")) return;
      setHighlightedPart(index);
    });
    const visibleCheckbox = document.createElement("input");
    visibleCheckbox.type = "checkbox";
    visibleCheckbox.checked = state.meshEntries[index]?.mesh.visible ?? true;
    visibleCheckbox.addEventListener("input", () => {
      state.meshEntries[index].mesh.visible = visibleCheckbox.checked;
      state.normalVisualizers[index].visible = visibleCheckbox.checked && el.showNormals.checked;
    });
    const editCheckbox = document.createElement("input");
    editCheckbox.type = "checkbox";
    editCheckbox.checked = state.batchSelectedParts.has(index);
    editCheckbox.addEventListener("input", () => {
      if (editCheckbox.checked) {
        state.batchSelectedParts.add(index);
      } else {
        state.batchSelectedParts.delete(index);
      }
      updateBatchActionState();
    });
    const name = document.createElement("span");
    name.textContent = part.name;
    name.dataset.partNameIndex = String(index);
    const id = document.createElement("small");
    id.textContent = String(index);
    const count = document.createElement("small");
    count.textContent = `${part.vertexCount}/${part.faceCount}`;
    const exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.textContent = t("export");
    exportButton.addEventListener("click", () => exportPartGlb(index));
    row.append(visibleCheckbox, editCheckbox, id, name, count, exportButton);
    el.submeshList.append(row);
  }
}

function getFilteredPartIndices(model) {
  const query = el.partFilter.value.trim().toLowerCase();
  const indices = [];
  for (const [index, part] of model.submeshes.entries()) {
    if (!query || part.name.toLowerCase().includes(query)) indices.push(index);
  }
  return indices;
}

function createHeaderCheckboxCell(input, text) {
  const cell = document.createElement("label");
  cell.className = "header-check";
  const span = document.createElement("span");
  span.textContent = text;
  cell.append(input, span);
  return cell;
}

function setHighlightedPart(index) {
  if (!state.currentModel || !state.meshEntries[index]?.mesh) {
    clearHighlightedPart();
    return;
  }
  if (state.highlightedPartIndex === index) {
    clearHighlightedPart();
    return;
  }
  restoreHighlightedMaterial();
  state.highlightedPartIndex = index;
  applyHighlightedMaterial();
  updateHighlightedRows();
  updateHighlightInfo();
  el.duplicatePart.disabled = false;
  el.deletePart.disabled = false;
  openPartEditor(index);
}

function clearHighlightedPart() {
  restoreHighlightedMaterial();
  state.highlightedPartIndex = -1;
  updateHighlightedRows();
  updateHighlightInfo();
  el.duplicatePart.disabled = true;
  el.deletePart.disabled = true;
  state.editIndex = -1;
  populateEditorForNoSelection();
  setEditorEnabled(false);
}

function setEditorEnabled(enabled) {
  el.editorBlock.classList.toggle("disabled", !enabled);
  for (const control of el.editorBlock.querySelectorAll("input, select, button")) {
    control.disabled = !enabled;
  }
}

function populateEditorForNoSelection() {
  el.editorName.textContent = "-";
  el.editName.value = "";
  populateEditorMaterialOptions(-1);
  populateEditorParentOptions(-1);
  el.keepWorldOnParentChange.checked = true;
  buildTransformEditor(createEmptyEditorPart());
}

function createEmptyEditorPart() {
  return {
    matrix: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    materialId: 0,
    parentId: -1
  };
}

function populateEditorMaterialOptions(selectedMaterialId) {
  el.editMaterial.replaceChildren();
  const materials = state.currentModel?.materials || [];
  if (!materials.length) {
    const option = document.createElement("option");
    option.value = "0";
    option.textContent = `0: ${t("noTexture")}`;
    el.editMaterial.append(option);
    return;
  }
  for (const [materialIndex, material] of materials.entries()) {
    const option = document.createElement("option");
    option.value = String(materialIndex);
    option.textContent = `${materialIndex}: ${material.textureName || t("noTexture")}`;
    el.editMaterial.append(option);
  }
  el.editMaterial.value = String(Math.max(0, selectedMaterialId));
}

function populateEditorParentOptions(editIndex) {
  el.editParent.replaceChildren();
  const rootOption = document.createElement("option");
  rootOption.value = "-1";
  rootOption.textContent = `-1: ${t("rootNode")}`;
  el.editParent.append(rootOption);
  const parts = state.currentModel?.submeshes || [];
  for (const [partIndex, candidate] of parts.entries()) {
    if (partIndex === editIndex) continue;
    const option = document.createElement("option");
    option.value = String(partIndex);
    option.textContent = `${partIndex}: ${candidate.name}`;
    el.editParent.append(option);
  }
  el.editParent.value = "-1";
}

function restoreHighlightedMaterial() {
  if (state.highlightedPartIndex >= 0) {
    const entry = state.meshEntries[state.highlightedPartIndex];
    if (entry?.mesh && entry.material) entry.mesh.material = entry.material;
  }
  if (state.highlightedHelper) {
    scene.remove(state.highlightedHelper);
    disposeObject(state.highlightedHelper);
  }
  state.highlightedMaterial?.dispose?.();
  state.highlightedMaterial = null;
  state.highlightedHelper = null;
}

function applyHighlightedMaterial() {
  const entry = state.meshEntries[state.highlightedPartIndex];
  if (!entry?.mesh || !entry.material) return;
  const material = entry.material.clone();
  material.name = `${entry.material.name || entry.part?.name || "part"} highlight`;
  material.color = material.color?.clone?.() || new THREE.Color(0xffffff);
  material.color.lerp(new THREE.Color(PART_HIGHLIGHT_COLOR), 0.65);
  material.wireframe = el.showWireframe.checked;
  material.map = el.showTextures.checked ? (entry.material.userData.baseMap ?? entry.material.map ?? null) : null;
  material.needsUpdate = true;
  entry.mesh.material = material;
  state.highlightedMaterial = material;
  state.highlightedHelper = new THREE.BoxHelper(entry.mesh, PART_HIGHLIGHT_COLOR);
  state.highlightedHelper.name = `${entry.part?.name || entry.mesh.name || "part"} highlight bounds`;
  state.highlightedHelper.renderOrder = 999;
  state.highlightedHelper.material.depthTest = false;
  scene.add(state.highlightedHelper);
}

function refreshHighlightedMaterial() {
  const index = state.highlightedPartIndex;
  if (index < 0) return;
  restoreHighlightedMaterial();
  state.highlightedPartIndex = index;
  applyHighlightedMaterial();
  updateHighlightInfo();
}

function updateHighlightedRows() {
  for (const row of el.submeshList.querySelectorAll("[data-part-index]")) {
    row.classList.toggle("highlighted", Number(row.dataset.partIndex) === state.highlightedPartIndex);
  }
}

function updateHighlightInfo() {
  const entry = state.meshEntries[state.highlightedPartIndex];
  if (!entry?.mesh || !entry.part) {
    updateModelInfo();
    return;
  }
  const box = new THREE.Box3().setFromObject(entry.mesh);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const material = state.currentModel?.materials?.[entry.part.materialId];
  const degree = getPartConnectionCount(state.highlightedPartIndex);
  el.highlightInfo.hidden = false;
  el.highlightInfo.innerHTML = `
    <strong>${escapeHtml(entry.part.name)}</strong>
    <div>ID: ${state.highlightedPartIndex} | ${t("connections")}: ${degree} | ${t("vertices")}: ${entry.part.vertexCount} | ${t("faces")}: ${entry.part.faceCount}</div>
    <div>${t("material")}: ${entry.part.materialId}${material?.textureName ? ` (${escapeHtml(material.textureName)})` : ""}</div>
    <div>Size: ${formatNumber(size.x)} / ${formatNumber(size.y)} / ${formatNumber(size.z)}</div>
    <div>Pos: ${formatNumber(center.x)} / ${formatNumber(center.y)} / ${formatNumber(center.z)}</div>
  `;
}

function getPartConnectionCount(index) {
  const model = state.currentModel;
  if (!model?.submeshes[index]) return 0;
  let count = model.submeshes[index].parentId >= 0 ? 1 : 0;
  for (const part of model.submeshes) {
    if (part.parentId === index) count++;
  }
  return count;
}

function updateModelInfo() {
  if (!state.currentModel) {
    el.highlightInfo.hidden = true;
    el.highlightInfo.replaceChildren();
    return;
  }
  const box = state.currentModel.bounds || new THREE.Box3();
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  el.highlightInfo.hidden = false;
  el.highlightInfo.innerHTML = `
    <strong>${escapeHtml(state.currentModel.name || "Model")}</strong>
    <div>${t("parts")}: ${state.currentModel.submeshes.length} | ${t("materials")}: ${state.currentModel.materials.length}</div>
    <div>${t("vertices")}: ${state.currentModel.totalVertices} | ${t("faces")}: ${state.currentModel.totalFaces}</div>
    <div>Size: ${formatNumber(size.x)} / ${formatNumber(size.y)} / ${formatNumber(size.z)}</div>
    <div>Center: ${formatNumber(center.x)} / ${formatNumber(center.y)} / ${formatNumber(center.z)}</div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function setAllPartsVisible(visible, indices = state.meshEntries.map((_, index) => index)) {
  for (const index of indices) {
    const entry = state.meshEntries[index];
    if (!entry?.mesh) continue;
    entry.mesh.visible = visible;
    if (state.normalVisualizers[index]) {
      state.normalVisualizers[index].visible = visible && el.showNormals.checked;
    }
  }
  populateSubmeshList(state.currentModel);
}

function setAllPartsSelected(selected, indices = state.currentModel.submeshes.map((_, index) => index)) {
  if (selected) {
    for (const index of indices) state.batchSelectedParts.add(index);
  } else {
    for (const index of indices) state.batchSelectedParts.delete(index);
  }
  populateSubmeshList(state.currentModel);
}

function getSelectedPartIndices() {
  return [...state.batchSelectedParts]
    .filter((index) => state.meshEntries[index]?.mesh)
    .sort((a, b) => a - b);
}

function updateBatchActionState() {
  const hasSelection = Boolean(state.currentModel && getSelectedPartIndices().length);
  el.exportSelectedParts.disabled = !hasSelection;
  el.batchExportParts.disabled = !hasSelection;
  el.batchEditToggle.disabled = !state.currentModel;
}

function openPartEditor(index) {
  if (!state.currentModel || !state.meshEntries[index]) return;
  state.editIndex = index;
  const part = state.currentModel.submeshes[index];
  setEditorEnabled(true);
  el.editorName.textContent = part.name;
  el.editName.value = part.name;

  populateEditorMaterialOptions(part.materialId);
  el.editMaterial.value = String(part.materialId);

  populateEditorParentOptions(index);
  el.editParent.value = String(part.parentId);
  el.keepWorldOnParentChange.checked = true;

  buildTransformEditor(part);
}

async function exportPartGlb(index) {
  if (!state.currentModel || !state.meshEntries[index]) return;
  const part = state.currentModel.submeshes[index];
  await exportPartsGlb([index], `${sanitizeFilename(part.name || `part_${index}`)}.glb`);
}

async function exportSelectedPartsGlb() {
  if (!state.currentModel) return;
  const indices = getSelectedPartIndices();
  if (!indices.length) {
    setStatus(t("noSelectedParts"));
    return;
  }
  const baseName = state.currentModel.name.split(/[\\/]/).pop().replace(/\.[^.]+$/, "") || "model";
  const group = await createAnimatedGlbExportGroup(indices);
  const clips = await createLoadedAniClips();
  await exportPartsGlb(indices, `${sanitizeFilename(baseName)}_integrated.glb`, { group, animations: clips });
}

async function batchExportSelectedPartsGlb() {
  const indices = getSelectedPartIndices();
  if (!indices.length) {
    setStatus(t("noSelectedParts"));
    return;
  }
  const entries = [];
  for (const index of indices) {
    const part = state.currentModel.submeshes[index];
    const filename = `${sanitizeFilename(part.name || `part_${index}`)}.glb`;
    const blob = await exportPartsGlb([index], filename, { download: false });
    if (blob) entries.push({ name: filename, data: blob });
  }
  const baseName = state.currentModel.name.split(/[\\/]/).pop().replace(/\.[^.]+$/, "") || "model";
  const zip = await createZipBlob(entries);
  downloadBlob(zip, `${sanitizeFilename(baseName)}.zip`);
}

async function exportPartsGlb(indices, filename, options = {}) {
  try {
    const group = options.group || await createGlbExportGroup(indices);
    const exporter = new GLTFExporter();
    const result = await new Promise((resolve, reject) => {
      exporter.parse(group, resolve, reject, {
        binary: true,
        embedImages: true,
        animations: options.animations || []
      });
    });
    const blob = result instanceof ArrayBuffer
      ? new Blob([result], { type: "model/gltf-binary" })
      : new Blob([JSON.stringify(result)], { type: "model/gltf+json" });
    if (options.download !== false) downloadBlob(blob, filename);
    disposeObject(group);
    setStatus(t("exported", { name: filename }));
    return blob;
  } catch (error) {
    console.error(error);
    setStatus(t("exportFailed", { message: error.message }));
    return null;
  }
}

async function createAnimatedGlbExportGroup(indices) {
  const selected = new Set(indices);
  const group = new THREE.Group();
  group.name = "md9_export";
  const exportNodes = new Map();

  for (const [index, part] of state.currentModel.submeshes.entries()) {
    const node = new THREE.Group();
    const transform = getPartTransform(part);
    node.name = part.name || `part_${index}`;
    node.position.copy(transform.position);
    node.quaternion.copy(transform.quaternion);
    node.scale.copy(transform.scale);
    exportNodes.set(index, node);
  }

  for (const [index, part] of state.currentModel.submeshes.entries()) {
    const node = exportNodes.get(index);
    const parentNode = exportNodes.get(part.parentId);
    (parentNode || group).add(node);
  }

  for (const index of selected) {
    const entry = state.meshEntries[index];
    const node = exportNodes.get(index);
    if (!entry?.mesh || !node) continue;
    const mesh = new THREE.Mesh(entry.mesh.geometry.clone(), await cloneExportMaterial(entry.mesh.material));
    mesh.name = entry.part?.name || entry.mesh.name || `part_${index}`;
    node.add(mesh);
  }

  return group;
}

async function createLoadedAniClips() {
  const clips = [];
  for (const item of state.aniFiles) {
    try {
      if (!item.animation) item.animation = parseAni(await item.file.arrayBuffer(), item.label);
      clips.push(createAnimationClipFromAni(item.animation));
    } catch (error) {
      console.warn(`ANI export skipped: ${item.label}`, error);
    }
  }
  return clips;
}

function createAnimationClipFromAni(animation) {
  const tracks = [];
  for (const [boneName, track] of animation.tracks) {
    if (track.positions.length) {
      tracks.push(new THREE.VectorKeyframeTrack(
        `${boneName}.position`,
        track.positions.map((key) => key.time / ANIMATION_FPS),
        track.positions.flatMap((key) => [key.value.x, key.value.y, key.value.z])
      ));
    }
    if (track.rotations.length) {
      tracks.push(new THREE.QuaternionKeyframeTrack(
        `${boneName}.quaternion`,
        track.rotations.map((key) => key.time / ANIMATION_FPS),
        track.rotations.flatMap((key) => [key.value.x, key.value.y, key.value.z, key.value.w])
      ));
    }
    if (track.scales.length) {
      tracks.push(new THREE.VectorKeyframeTrack(
        `${boneName}.scale`,
        track.scales.map((key) => key.time / ANIMATION_FPS),
        track.scales.flatMap((key) => [key.value.x, key.value.y, key.value.z])
      ));
    }
  }
  return new THREE.AnimationClip(sanitizeFilename(animation.name).replace(/\.ani$/i, ""), animation.duration / ANIMATION_FPS, tracks);
}

async function createGlbExportGroup(indices) {
  const group = new THREE.Group();
  group.name = "md9_export";
  state.root?.updateWorldMatrix(true, true);
  const inverseRoot = state.root
    ? new THREE.Matrix4().copy(state.root.matrixWorld).invert()
    : new THREE.Matrix4();
  for (const index of indices) {
    const entry = state.meshEntries[index];
    if (!entry?.mesh) continue;
    const geometry = entry.mesh.geometry.clone();
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, entry.mesh.matrixWorld);
    geometry.applyMatrix4(matrix);
    const material = await cloneExportMaterial(entry.mesh.material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = entry.part?.name || entry.mesh.name || `part_${index}`;
    group.add(mesh);
  }
  return group;
}

async function cloneExportMaterial(material) {
  const source = Array.isArray(material) ? material[0] : material;
  const clone = source?.clone?.() || new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  clone.side = THREE.DoubleSide;
  clone.wireframe = false;
  if (clone.map) {
    const converted = await createAlphaPngTexture(clone.map);
    clone.map = converted.texture || clone.map.clone();
    clone.map.needsUpdate = true;
    if (converted.hasAlpha || clone.opacity < 1) {
      clone.transparent = true;
      clone.alphaTest = Math.min(clone.alphaTest || 0.001, 0.001);
    }
  }
  return clone;
}

async function createAlphaPngTexture(sourceTexture) {
  const image = sourceTexture?.image;
  const width = getImageWidth(image);
  const height = getImageHeight(image);
  if (!image || !width || !height || typeof document === "undefined") {
    return { texture: null, hasAlpha: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) return { texture: null, hasAlpha: false };
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.warn("Texture PNG conversion skipped", error);
    return { texture: null, hasAlpha: false };
  }

  let hasAlpha = false;
  try {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 255) {
        hasAlpha = true;
        break;
      }
    }
  } catch (error) {
    console.warn("Texture alpha scan skipped", error);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = sourceTexture.name || "";
  texture.colorSpace = sourceTexture.colorSpace || THREE.SRGBColorSpace;
  texture.flipY = sourceTexture.flipY;
  texture.wrapS = sourceTexture.wrapS;
  texture.wrapT = sourceTexture.wrapT;
  texture.minFilter = sourceTexture.minFilter;
  texture.magFilter = sourceTexture.magFilter;
  texture.generateMipmaps = sourceTexture.generateMipmaps;
  texture.offset.copy(sourceTexture.offset);
  texture.repeat.copy(sourceTexture.repeat);
  texture.center.copy(sourceTexture.center);
  texture.rotation = sourceTexture.rotation;
  texture.needsUpdate = true;
  return { texture, hasAlpha };
}

function buildTransformEditor(part) {
  el.transformEditor.replaceChildren();
  if (el.matrixMode.checked) {
    buildMatrixEditor(part);
    return;
  }
  const transform = getPartTransform(part);
  for (const control of TRANSFORM_CONTROLS) {
    const row = document.createElement("div");
    row.className = "transform-row";
    const label = document.createElement("span");
    label.textContent = control.label;
    const range = createTransformInput("range", control, transform);
    const number = createTransformInput("number", control, transform);
    row.append(label, range, number);
    el.transformEditor.append(row);
  }
}

function toggleBatchEditor() {
  if (!state.currentModel) return;
  const enabled = el.batchEditToggle.getAttribute("aria-pressed") !== "true";
  setBatchEditToggleActive(enabled);
  el.batchEditPanel.hidden = !enabled;
  if (enabled) {
    state.batchTransformMatrix.identity();
    buildBatchTransformEditor();
  }
}

function setBatchEditToggleActive(active) {
  el.batchEditToggle.classList.toggle("active", active);
  el.batchEditToggle.setAttribute("aria-pressed", active ? "true" : "false");
}

function resetBatchEditor() {
  if (el.batchEditPanel.hidden) return;
  setBatchTransformInputsToIdentity();
  applyBatchEditorDelta();
}

function buildBatchTransformEditor() {
  el.batchTransformEditor.replaceChildren();
  const transform = {
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  };
  for (const control of TRANSFORM_CONTROLS) {
    const row = document.createElement("div");
    row.className = "transform-row";
    const label = document.createElement("span");
    label.textContent = control.label;
    const range = createBatchTransformInput("range", control, transform);
    const number = createBatchTransformInput("number", control, transform);
    row.append(label, range, number);
    el.batchTransformEditor.append(row);
  }
}

function createBatchTransformInput(type, control, transform) {
  const input = createTransformInput(type, control, transform);
  if (control.transform === "scale") {
    input.min = "0.01";
    input.max = "10";
  }
  return input;
}

function setBatchTransformInputsToIdentity() {
  for (const input of el.batchTransformEditor.querySelectorAll("[data-transform]")) {
    input.value = input.dataset.transform === "scale" ? "1" : "0";
  }
}

function buildMatrixEditor(part) {
  const grid = document.createElement("div");
  grid.className = "matrix-editor";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = col * 4 + row;
      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.0001";
      input.value = formatNumber(part.matrix[index] ?? (row === col ? 1 : 0));
      input.dataset.matrixIndex = String(index);
      input.setAttribute("aria-label", `m${row}${col}`);
      input.addEventListener("input", applyEditorValues);
      grid.append(input);
    }
  }
  el.transformEditor.append(grid);
}

function createTransformInput(type, control, transform) {
  const input = document.createElement("input");
  input.type = type;
  input.step = String(control.step);
  input.dataset.transform = control.transform;
  input.dataset.axis = control.axis;
  input.dataset.inputKind = type;
  const rawValue = control.transform === "rotation"
    ? THREE.MathUtils.radToDeg(transform.rotation[control.axis])
    : transform[control.transform][control.axis];
  const min = Math.min(control.min, rawValue);
  const max = Math.max(control.max, rawValue);
  input.min = String(min);
  input.max = String(max);
  input.value = formatNumber(rawValue);
  return input;
}

function applyEditorValues() {
  if (!state.currentModel || state.editIndex < 0) return;
  pushUndoSnapshot();
  const part = state.currentModel.submeshes[state.editIndex];
  const previousParentId = part.parentId;
  const previousWorldMatrix = getPartWorldRenderMatrix(state.editIndex);
  const oldName = part.name;
  const newName = normalizePartName(el.editName.value, state.editIndex);
  part.name = newName;
  if (oldName !== newName) {
    const node = state.boneNodes.get(oldName);
    if (node) {
      state.boneNodes.delete(oldName);
      node.name = `${newName} bone`;
      state.boneNodes.set(newName, node);
    }
    const entry = state.meshEntries[state.editIndex];
    if (entry?.mesh) entry.mesh.name = newName;
    el.editorName.textContent = newName;
    const nameNode = el.submeshList.querySelector(`[data-part-name-index="${state.editIndex}"]`);
    if (nameNode) nameNode.textContent = newName;
  }
  const previousMaterialId = part.materialId;
  part.materialId = Number(el.editMaterial.value) || 0;
  part.parentId = Number(el.editParent.value);
  if (part.materialId !== previousMaterialId) {
    const material = findRenderedMaterial(part.materialId, state.editIndex);
    if (material) {
      const entry = state.meshEntries[state.editIndex];
      entry.material = entry.mesh.material = material;
    }
  }

  if (el.keepWorldOnParentChange.checked && part.parentId !== previousParentId) {
    const parentWorld = part.parentId >= 0 ? getPartWorldRenderMatrix(part.parentId) : new THREE.Matrix4();
    const nextLocal = new THREE.Matrix4().copy(parentWorld).invert().multiply(previousWorldMatrix);
    part.matrix = renderMatrixToMd9Array(nextLocal);
    buildTransformEditor(part);
  } else {
    part.matrix = el.matrixMode.checked ? matrixInputsToMd9Matrix() : transformInputsToMd9Matrix();
  }

  syncPartBone(part);
  updateModelDerivedData();
  updateHighlightInfo();
  setStatus(t("updatedPart", { name: part.name }));
}

function normalizePartName(name, selfIndex = -1) {
  const base = String(name || "").trim() || makeUniquePartName();
  const used = new Set(state.currentModel.submeshes
    .map((part, index) => (index === selfIndex ? "" : part.name.toLowerCase()))
    .filter(Boolean));
  if (!used.has(base.toLowerCase())) return base;
  let suffix = 2;
  while (used.has(`${base}_${suffix}`.toLowerCase())) suffix++;
  return `${base}_${suffix}`;
}

function makeUniquePartName() {
  const used = new Set(state.currentModel?.submeshes.map((part) => part.name.toLowerCase()) || []);
  let index = state.currentModel?.submeshes.length || 0;
  let name = `part_${index}`;
  while (used.has(name.toLowerCase())) name = `part_${++index}`;
  return name;
}

function getPartWorldRenderMatrix(index, cache = new Map()) {
  if (cache.has(index)) return cache.get(index).clone();
  const part = state.currentModel?.submeshes[index];
  if (!part) return new THREE.Matrix4();
  const local = md9ArrayToRenderMatrix(part.matrix);
  const parentWorld = part.parentId >= 0 ? getPartWorldRenderMatrix(part.parentId, cache) : new THREE.Matrix4();
  const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
  cache.set(index, world.clone());
  return world;
}

function syncTransformInputPair(source) {
  const selector = `[data-transform="${source.dataset.transform}"][data-axis="${source.dataset.axis}"]`;
  for (const input of el.transformEditor.querySelectorAll(selector)) {
    if (input !== source) input.value = source.value;
  }
}

function syncBatchTransformInputPair(source) {
  const selector = `[data-transform="${source.dataset.transform}"][data-axis="${source.dataset.axis}"]`;
  for (const input of el.batchTransformEditor.querySelectorAll(selector)) {
    if (input !== source) input.value = source.value;
  }
}

function applyBatchEditorDelta() {
  const indices = getSelectedPartIndices();
  if (!state.currentModel) return;
  pushUndoSnapshot();
  const next = batchInputsToRenderMatrix();
  const previousInverse = state.batchTransformMatrix.clone().invert();
  const delta = new THREE.Matrix4().multiplyMatrices(next, previousInverse);
  if (el.batchGroupTransform.checked) {
    applyGroupBatchDelta(indices, delta);
  } else {
    applyIndependentBatchDelta(indices, delta);
  }
  state.batchTransformMatrix.copy(next);
  updateModelDerivedData();
  if (state.editIndex >= 0) buildTransformEditor(state.currentModel.submeshes[state.editIndex]);
}

function applyIndependentBatchDelta(indices, delta) {
  const previousPosition = new THREE.Vector3().setFromMatrixPosition(state.batchTransformMatrix);
  const nextPosition = new THREE.Vector3().setFromMatrixPosition(batchInputsToRenderMatrix());
  const translationDelta = nextPosition.sub(previousPosition);
  delta.setPosition(0, 0, 0);
  for (const index of indices) {
    const part = state.currentModel.submeshes[index];
    const renderMatrix = md9ArrayToRenderMatrix(part.matrix);
    const updated = new THREE.Matrix4().multiplyMatrices(renderMatrix, delta);
    part.matrix = renderMatrixToMd9Array(updated);
    part.matrix[12] += translationDelta.x;
    part.matrix[13] += translationDelta.y;
    part.matrix[14] -= translationDelta.z;
    syncPartBone(part);
  }
}

function applyGroupBatchDelta(indices, delta) {
  const selected = new Set(indices);
  const originalLocal = state.currentModel.submeshes.map((part) => md9ArrayToRenderMatrix(part.matrix));
  const originalWorld = new Map();
  const actualWorld = new Map();
  const desiredWorld = new Map();

  const getOriginalWorld = (index) => {
    if (originalWorld.has(index)) return originalWorld.get(index);
    const part = state.currentModel.submeshes[index];
    const parentWorld = part.parentId >= 0 ? getOriginalWorld(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, originalLocal[index]);
    originalWorld.set(index, world);
    return world;
  };

  const getDesiredWorld = (index) => {
    if (desiredWorld.has(index)) return desiredWorld.get(index);
    const world = selected.has(index)
      ? new THREE.Matrix4().multiplyMatrices(delta, getOriginalWorld(index))
      : getOriginalWorld(index).clone();
    desiredWorld.set(index, world);
    return world;
  };

  const getActualWorld = (index) => {
    if (actualWorld.has(index)) return actualWorld.get(index);
    if (selected.has(index)) {
      const world = getDesiredWorld(index).clone();
      actualWorld.set(index, world);
      return world;
    }
    const part = state.currentModel.submeshes[index];
    const parentWorld = part.parentId >= 0 ? getActualWorld(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, originalLocal[index]);
    actualWorld.set(index, world);
    return world;
  };

  for (const index of indices) {
    const part = state.currentModel.submeshes[index];
    const parentWorld = part.parentId >= 0 ? getActualWorld(part.parentId) : new THREE.Matrix4();
    const local = new THREE.Matrix4().multiplyMatrices(parentWorld.clone().invert(), getDesiredWorld(index));
    part.matrix = renderMatrixToMd9Array(local);
  }
  for (const index of indices) {
    syncPartBone(state.currentModel.submeshes[index]);
  }
}

function batchInputsToRenderMatrix() {
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const scale = new THREE.Vector3(1, 1, 1);
  for (const input of el.batchTransformEditor.querySelectorAll("[data-input-kind='number']")) {
    const value = Number(input.value) || 0;
    const axis = input.dataset.axis;
    if (input.dataset.transform === "position") position[axis] = value;
    if (input.dataset.transform === "rotation") rotation[axis] = THREE.MathUtils.degToRad(value);
    if (input.dataset.transform === "scale") scale[axis] = value || 1;
  }
  return new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
}

function transformInputsToMd9Matrix() {
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const scale = new THREE.Vector3(1, 1, 1);
  for (const input of el.transformEditor.querySelectorAll("[data-input-kind='number']")) {
    const value = Number(input.value) || 0;
    const axis = input.dataset.axis;
    if (input.dataset.transform === "position") position[axis] = value;
    if (input.dataset.transform === "rotation") rotation[axis] = THREE.MathUtils.degToRad(value);
    if (input.dataset.transform === "scale") scale[axis] = value || 1;
  }
  const renderMatrix = new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
  return renderMatrixToMd9Array(renderMatrix);
}

function matrixInputsToMd9Matrix() {
  const matrix = new Array(16).fill(0);
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  for (const input of el.transformEditor.querySelectorAll("[data-matrix-index]")) {
    matrix[Number(input.dataset.matrixIndex)] = Number(input.value) || 0;
  }
  return matrix;
}

function findRenderedMaterial(materialId, excludeIndex = -1) {
  const match = state.meshEntries.find((entry, index) => index !== excludeIndex && entry.part.materialId === materialId && entry.material);
  if (match) return match.material;
  const material = state.currentModel?.materials[materialId];
  if (!material) return null;
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(material.diffuse[0] || 0.72, material.diffuse[1] || 0.72, material.diffuse[2] || 0.72),
    side: THREE.DoubleSide
  });
}

function syncPartBone(part) {
  const transform = getPartTransform(part);
  part.bonePosition.copy(transform.position);
  const node = state.boneNodes.get(part.name);
  if (node) {
    reparentPartNode(part, node);
    node.position.copy(transform.position);
    node.quaternion.copy(transform.quaternion);
    node.scale.copy(transform.scale);
    node.userData.defaultPosition.copy(transform.position);
    node.userData.defaultQuaternion.copy(transform.quaternion);
    node.userData.defaultScale = transform.scale.clone();
  }
}

function reparentPartNode(part, node) {
  const parent = state.currentModel?.submeshes[part.parentId];
  const targetParent = parent ? state.boneNodes.get(parent.name) : state.root;
  if (targetParent && node.parent !== targetParent && !isDescendantOf(targetParent, node)) {
    targetParent.add(node);
  }
}

function isDescendantOf(object, possibleAncestor) {
  let parent = object.parent;
  while (parent) {
    if (parent === possibleAncestor) return true;
    parent = parent.parent;
  }
  return false;
}

function getPartTransform(part) {
  const renderMatrix = md9ArrayToRenderMatrix(part.matrix);
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  renderMatrix.decompose(position, quaternion, scale);
  return {
    position,
    quaternion,
    rotation: new THREE.Euler().setFromQuaternion(quaternion, "XYZ"),
    scale
  };
}

function md9ArrayToRenderMatrix(matrixArray) {
  const md9Matrix = new THREE.Matrix4().fromArray(matrixArray);
  return new THREE.Matrix4().multiplyMatrices(FLIP_Z_MATRIX, md9Matrix).multiply(FLIP_Z_MATRIX);
}

function renderMatrixToMd9Array(renderMatrix) {
  return new THREE.Matrix4().multiplyMatrices(FLIP_Z_MATRIX, renderMatrix).multiply(FLIP_Z_MATRIX).toArray();
}

function addPart() {
  if (!state.currentModel || !state.root) return;
  pushUndoSnapshot();
  const name = makeUniqueNewPartName();
  const parentId = state.editIndex >= 0 ? state.editIndex : -1;
  const parentPart = state.currentModel.submeshes[parentId];
  const size = getAveragePartSize();
  const half = size * 0.5;
  const cube = createCubeMeshData(half);
  const part = {
    name,
    matrix: new THREE.Matrix4().identity().toArray(),
    boundingBox: [-half, -half, -half, half, half, half],
    localPositions: cube.positions,
    normals: cube.normals,
    uvs: cube.uvs,
    indices: cube.indices,
    materialId: 0,
    parentId,
    vertexCount: cube.positions.length / 3,
    faceCount: cube.indices.length / 3,
    bonePosition: new THREE.Vector3(),
    worldBonePosition: parentPart?.worldBonePosition?.clone?.() || new THREE.Vector3(),
    replacement: null
  };
  part.initialState = clonePartState(part);
  state.currentModel.submeshes.push(part);

  const node = new THREE.Group();
  node.name = `${part.name} bone`;
  node.userData.defaultPosition = new THREE.Vector3();
  node.userData.defaultQuaternion = new THREE.Quaternion();
  node.userData.defaultScale = new THREE.Vector3(1, 1, 1);
  state.boneNodes.set(part.name, node);
  (parentPart ? state.boneNodes.get(parentPart.name) : state.root)?.add(node);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.setIndex(new THREE.Uint16BufferAttribute(part.indices, 1));
  geometry.computeBoundingSphere();
  const material = state.meshEntries[0]?.material || new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = part.name;
  mesh.userData.part = part;
  node.add(mesh);
  state.meshEntries.push({ mesh, material, part });

  state.editIndex = state.currentModel.submeshes.length - 1;
  rebuildSceneHelpers();
  updateModelDerivedData();
  populateSubmeshList(state.currentModel);
  setHighlightedPart(state.editIndex);
}

function duplicateHighlightedPart() {
  const sourceIndex = state.highlightedPartIndex;
  if (!state.currentModel || sourceIndex < 0 || !state.meshEntries[sourceIndex]) return;
  pushUndoSnapshot();
  const sourcePart = state.currentModel.submeshes[sourceIndex];
  const sourceEntry = state.meshEntries[sourceIndex];
  const part = {
    name: makeUniqueCopyPartName(sourcePart.name),
    matrix: [...sourcePart.matrix],
    boundingBox: [...sourcePart.boundingBox],
    localPositions: new Float32Array(sourcePart.localPositions),
    normals: new Float32Array(sourcePart.normals),
    uvs: new Float32Array(sourcePart.uvs),
    indices: new Uint16Array(sourcePart.indices),
    materialId: sourcePart.materialId,
    parentId: sourcePart.parentId,
    vertexCount: sourcePart.vertexCount,
    faceCount: sourcePart.faceCount,
    bonePosition: sourcePart.bonePosition?.clone?.() || new THREE.Vector3(),
    worldBonePosition: sourcePart.worldBonePosition?.clone?.() || new THREE.Vector3(),
    replacement: null
  };
  part.initialState = clonePartState(part);
  state.currentModel.submeshes.push(part);

  const transform = getPartTransform(part);
  const node = new THREE.Group();
  node.name = `${part.name} bone`;
  node.position.copy(transform.position);
  node.quaternion.copy(transform.quaternion);
  node.scale.copy(transform.scale);
  node.userData.defaultPosition = transform.position.clone();
  node.userData.defaultQuaternion = transform.quaternion.clone();
  node.userData.defaultScale = transform.scale.clone();
  state.boneNodes.set(part.name, node);
  const parentPart = state.currentModel.submeshes[part.parentId];
  (parentPart ? state.boneNodes.get(parentPart.name) : state.root)?.add(node);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.setIndex(new THREE.Uint16BufferAttribute(part.indices, 1));
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, sourceEntry.material);
  mesh.name = part.name;
  mesh.userData.part = part;
  node.add(mesh);
  state.meshEntries.push({ mesh, material: sourceEntry.material, part });

  const newIndex = state.currentModel.submeshes.length - 1;
  rebuildSceneHelpers();
  updateModelDerivedData();
  populateSubmeshList(state.currentModel);
  setHighlightedPart(newIndex);
}

function makeUniqueNewPartName() {
  const used = new Set(state.currentModel?.submeshes.map((part) => part.name.toLowerCase()) || []);
  let index = 1;
  while (used.has(`new_${index}`)) index++;
  return `new_${index}`;
}

function makeUniqueCopyPartName(baseName) {
  const used = new Set(state.currentModel?.submeshes.map((part) => part.name.toLowerCase()) || []);
  const base = String(baseName || "part").replace(/_copy_\d+$/i, "") || "part";
  let index = 1;
  while (used.has(`${base}_copy_${index}`.toLowerCase())) index++;
  return `${base}_copy_${index}`;
}

function getAveragePartSize() {
  let total = 0;
  let count = 0;
  const size = new THREE.Vector3();
  for (const part of state.currentModel?.submeshes || []) {
    const box = computeArrayBox(part.localPositions);
    if (box.isEmpty()) continue;
    box.getSize(size);
    const max = Math.max(size.x, size.y, size.z);
    if (max > 0.0001) {
      total += max;
      count++;
    }
  }
  return count ? total / count : 1;
}

function createCubeMeshData(half) {
  const faces = [
    [[-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half], [0, 0, 1]],
    [[half, -half, -half], [-half, -half, -half], [-half, half, -half], [half, half, -half], [0, 0, -1]],
    [[-half, half, half], [half, half, half], [half, half, -half], [-half, half, -half], [0, 1, 0]],
    [[-half, -half, -half], [half, -half, -half], [half, -half, half], [-half, -half, half], [0, -1, 0]],
    [[half, -half, half], [half, -half, -half], [half, half, -half], [half, half, half], [1, 0, 0]],
    [[-half, -half, -half], [-half, -half, half], [-half, half, half], [-half, half, -half], [-1, 0, 0]]
  ];
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  for (const face of faces) {
    const start = positions.length / 3;
    for (let i = 0; i < 4; i++) {
      positions.push(...face[i]);
      normals.push(...face[4]);
    }
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices)
  };
}

async function restoreEditedPart() {
  if (!state.currentModel || state.editIndex < 0) return;
  pushUndoSnapshot();
  const part = state.currentModel.submeshes[state.editIndex];
  const oldName = part.name;
  restorePartFromState(part, part.initialState);
  if (oldName !== part.name) {
    const node = state.boneNodes.get(oldName);
    if (node) {
      state.boneNodes.delete(oldName);
      node.name = `${part.name} bone`;
      state.boneNodes.set(part.name, node);
    }
  }
  const entry = state.meshEntries[state.editIndex];
  if (entry.mesh) entry.mesh.name = part.name;
  entry.material = entry.mesh.material = await createMaterial(state.currentModel.materials[part.materialId], state.currentModel.baseDir);
  syncPartBone(part);
  updatePartGeometry(state.editIndex);
  updateModelDerivedData();
  openPartEditor(state.editIndex);
  setStatus(t("restoredPart", { name: part.name }));
}

function restorePartFromState(part, snapshot) {
  part.name = snapshot.name;
  part.matrix = [...snapshot.matrix];
  part.boundingBox = [...snapshot.boundingBox];
  part.localPositions = new Float32Array(snapshot.localPositions);
  part.normals = new Float32Array(snapshot.normals);
  part.uvs = new Float32Array(snapshot.uvs);
  part.indices = new Uint16Array(snapshot.indices);
  part.materialId = snapshot.materialId;
  part.parentId = snapshot.parentId;
  part.vertexCount = snapshot.vertexCount;
  part.faceCount = snapshot.faceCount;
  part.replacement = null;
}

function clearEditedPartMesh() {
  if (!state.currentModel || state.editIndex < 0) return;
  pushUndoSnapshot();
  const part = state.currentModel.submeshes[state.editIndex];
  const size = 0.0001;
  part.localPositions = new Float32Array([
    0, 0, 0,
    size, 0, 0,
    0, size, 0
  ]);
  part.normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
  ]);
  part.uvs = new Float32Array([
    0, 0,
    0, 0,
    0, 0
  ]);
  part.indices = new Uint16Array([0, 1, 2]);
  part.vertexCount = 3;
  part.faceCount = 1;
  part.boundingBox = [0, 0, -size, size, size, 0];
 
  part.replacement = null;
  updatePartGeometry(state.editIndex);
  updateModelDerivedData();
  populateSubmeshList(state.currentModel);
  openPartEditor(state.editIndex);
  setStatus(t("clearedMesh", { name: part.name }));
}

function deleteEditedPart() {
  if (!state.currentModel || state.editIndex < 0) return;
  if (state.currentModel.submeshes.length <= 1) {
    setStatus(t("cannotDeleteLast"));
    return;
  }
  pushUndoSnapshot();
  const deleteIndex = state.editIndex;
  const highlightedIndex = state.highlightedPartIndex;
  if (highlightedIndex === deleteIndex) clearHighlightedPart();
  const deleted = state.currentModel.submeshes[deleteIndex];
  const deletedParentId = deleted.parentId;
  const deletedNode = state.boneNodes.get(deleted.name);
  const targetParentPart = state.currentModel.submeshes[deletedParentId];
  const targetParentNode = targetParentPart ? state.boneNodes.get(targetParentPart.name) : state.root;

  for (const part of state.currentModel.submeshes) {
    if (part.parentId === deleteIndex) part.parentId = deletedParentId;
  }
  for (const child of [...(deletedNode?.children || [])]) {
    if (child !== state.meshEntries[deleteIndex]?.mesh) targetParentNode?.add(child);
  }

  const entry = state.meshEntries[deleteIndex];
  entry?.mesh.parent?.remove(entry.mesh);
  if (entry?.mesh) disposeObject(entry.mesh);
  deletedNode?.parent?.remove(deletedNode);

  state.currentModel.submeshes.splice(deleteIndex, 1);
  state.meshEntries.splice(deleteIndex, 1);
  state.boneNodes.delete(deleted.name);
  state.batchSelectedParts = new Set([...state.batchSelectedParts]
    .filter((index) => index !== deleteIndex)
    .map((index) => (index > deleteIndex ? index - 1 : index)));
  if (highlightedIndex > deleteIndex) {
    state.highlightedPartIndex = highlightedIndex - 1;
  }
  for (const part of state.currentModel.submeshes) {
    if (part.parentId > deleteIndex) part.parentId--;
  }

  state.editIndex = -1;
  populateEditorForNoSelection();
  setEditorEnabled(false);
  rebuildSceneHelpers();
  updateModelDerivedData();
  populateSubmeshList(state.currentModel);
  setStatus(t("deletedPart", { name: deleted.name }));
}

async function replaceEditedPartFromFiles(files) {
  if (!state.currentModel || state.editIndex < 0) {
    setStatus(t("selectPartFirst"));
    return;
  }
  const modelFile = files.find((file) => isReplacementModelFile(file.name));
  if (!modelFile) {
    setStatus(t("replacementNeedsModel"));
    return;
  }
  pushUndoSnapshot();
  try {
    await replacePartWithModelFiles(state.editIndex, modelFile, files, { keepSize: el.replaceKeepSize.checked });
    populateSubmeshList(state.currentModel);
    openPartEditor(state.editIndex);
    setStatus(t("replacedPart", { name: state.currentModel.submeshes[state.editIndex].name, mtl: modelFile.name.toLowerCase().endsWith(".obj") && files.some((file) => file.name.toLowerCase().endsWith(".mtl")) ? t("readMtl") : "" }));
  } catch (error) {
    console.error(error);
    setStatus(error.message);
  }
}

async function importSkinnedGltfFiles(files) {
  const modelFile = files.find((file) => /\.(glb|gltf)$/i.test(file.name));
  if (!modelFile) {
    setStatus(t("importNeedsGltf"));
    return;
  }
  try {
    setStatus(t("loadingModel", { name: modelFile.name }));
    const model = await createMd9FromSkinnedGltf(modelFile, files, {
      vertexMode: el.skinVertexMode.value,
      faceMode: el.skinFaceMode.value,
      cleanRemoteFaces: el.skinCleanRemote.checked,
      remoteK: Number(el.skinRemoteK.value) || 3,
      remoteVolumeRatio: 0.15,
      jointSleeves: el.skinJointSleeves.checked,
      sleeveLength: Number(el.skinSleeveLength.value) || 0.12
    });
    const id = `generated:${model.name}:${Date.now()}`;
    state.md9Files.push({ id, label: model.name, model });
    state.currentMd9Id = id;
    updateModelSelect();
    await showModel(model, model.name);
    addGeneratedAnimationsToState(model);
    updateAnimationSelect();
    if (model.generatedAnimations?.length) {
      const first = state.aniFiles.find((item) => item.modelId === id);
      if (first) await loadSelectedAnimation(first.id);
    }
    setStatus(t("importedSkinnedGltf", { name: modelFile.name, parts: model.submeshes.length }));
  } catch (error) {
    console.error(error);
    setStatus(error.message || String(error));
  }
}

function addGeneratedAnimationsToState(model) {
  state.aniFiles = state.aniFiles.filter((item) => item.modelId !== state.currentMd9Id);
  for (const animation of model.generatedAnimations || []) {
    state.aniFiles.push({
      id: `${state.currentMd9Id}:ani:${animation.name}`,
      label: `${model.name}/${animation.name}`,
      animation,
      modelId: state.currentMd9Id
    });
  }
}

async function replacePartWithModelFiles(partIndex, modelFile, files, options = {}) {
  const textureFile = files.find((file) => isTextureFile(file.name));
  const mtlFile = files.find((file) => file.name.toLowerCase().endsWith(".mtl"));
  const part = state.currentModel.submeshes[partIndex];
  const replacement = await parseReplacementModel(modelFile, mtlFile, files);
  if (replacement.positions.length === 0) {
    throw new Error(t("replacementNoMesh"));
  }
  if (replacement.positions.length / 3 > 65535) {
    throw new Error(t("replacementTooLarge"));
  }
  const materialTextureFile = replacement.textureFile || (replacement.textureImage ? null : textureFile) || null;
  const materialTextureImage = replacement.textureImage || null;
  const sourceMd9Material = state.currentModel.materials[part.materialId] || null;
  if (replacement.textureSources?.length) {
    await bakeReplacementTextures(replacement);
  }
  normalizeReplacementToPart(replacement, part, { keepSize: options.keepSize });

  part.replacement = {
    sourcePositions: replacement.positions,
    sourceNormals: replacement.normals,
    sourceUvs: replacement.uvs,
    textureFile: materialTextureFile,
    textureImage: materialTextureImage
  };
  if (replacement.atlasImage) {
    const textureName = makePartTextureName(part.name);
    const material = createMd9MaterialFromThree(replacement.material, textureName, sourceMd9Material);
    material.atlasSourceImage = replacement.atlasImage;
    state.currentModel.materials.push(material);
    part.materialId = state.currentModel.materials.length - 1;
    const entry = state.meshEntries[partIndex];
    entry.material = entry.mesh.material = replacement.previewMaterial;
  } else if (materialTextureFile || materialTextureImage) {
    if (materialTextureFile) state.textureFiles.set(textureKey(materialTextureFile.name), materialTextureFile);
    const textureName = makePartTextureName(part.name);
    const material = createMd9MaterialFromThree(replacement.material, textureName, sourceMd9Material);
    material.atlasSourceFile = materialTextureFile;
    material.atlasSourceImage = materialTextureImage;
    state.currentModel.materials.push(material);
    part.materialId = state.currentModel.materials.length - 1;
    const entry = state.meshEntries[partIndex];
    entry.material = entry.mesh.material = materialTextureFile
      ? await createMaterialFromFile(material, materialTextureFile)
      : clonePreviewMaterial(replacement.material);
  } else if (replacement.material) {
    const material = createMd9MaterialFromThree(replacement.material, "");
    state.currentModel.materials.push(material);
    part.materialId = state.currentModel.materials.length - 1;
    const entry = state.meshEntries[partIndex];
    entry.material = entry.mesh.material = replacement.material;
  } else {
    const material = createMd9MaterialFromThree(null, "");
    state.currentModel.materials.push(material);
    part.materialId = state.currentModel.materials.length - 1;
    const entry = state.meshEntries[partIndex];
    entry.material = entry.mesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  }
  part.localPositions = replacement.positions;
  part.normals = replacement.normals;
  part.uvs = replacement.uvs;
  part.indices = replacement.indices;
  part.vertexCount = replacement.positions.length / 3;
  part.faceCount = Math.floor(replacement.indices.length / 3);
  updatePartGeometry(partIndex);
  updateModelDerivedData();
}

async function batchReplaceSelectedPartsFromFiles(files) {
  if (!state.currentModel) return;
  const selected = new Set(getSelectedPartIndices());
  if (!selected.size) {
    setStatus(t("noSelectedParts"));
    return;
  }
  const modelFiles = files.filter((file) => /\.(glb|gltf)$/i.test(file.name));
  if (!modelFiles.length) {
    setStatus(t("replacementNeedsModel"));
    return;
  }
  const partByName = new Map();
  for (const index of selected) {
    partByName.set(normalizeMatchName(state.currentModel.submeshes[index].name), index);
  }
  let replaced = 0;
  pushUndoSnapshot();
  for (const modelFile of modelFiles) {
    const index = partByName.get(normalizeMatchName(modelFile.name.replace(/\.[^.]+$/, "")));
    if (index === undefined) continue;
    try {
      await replacePartWithModelFiles(index, modelFile, files);
      replaced++;
    } catch (error) {
      console.warn(`Batch replacement skipped: ${modelFile.name}`, error);
    }
  }
  if (!replaced) {
    state.undoStack.pop();
    updateHistoryButtons();
    setStatus(t("batchReplaceNoMatch"));
    return;
  }
  populateSubmeshList(state.currentModel);
  if (state.editIndex >= 0) openPartEditor(state.editIndex);
  setStatus(t("batchReplaced", { count: replaced }));
}

function normalizeMatchName(name) {
  return String(name || "").trim().toLowerCase().replace(/\.[^.]+$/, "");
}

async function parseReplacementModel(modelFile, mtlFile, files) {
  const lowerName = modelFile.name.toLowerCase();
  if (lowerName.endsWith(".obj")) {
    return parseObjReplacement(await modelFile.text(), mtlFile ? await mtlFile.text() : "", files);
  }
  const data = lowerName.endsWith(".gltf") ? await modelFile.text() : await modelFile.arrayBuffer();
  return parseGltfReplacement(data, files);
}

function createMd9MaterialFromThree(threeMaterial, textureName, templateMaterial = null, options = {}) {
  if (textureName && templateMaterial) {
    return {
      diffuse: [...templateMaterial.diffuse],
      ambient: [...templateMaterial.ambient],
      specular: [...templateMaterial.specular],
      emissive: [...templateMaterial.emissive],
      power: templateMaterial.power,
      textureName,
      extra: templateMaterial.extra ? [...templateMaterial.extra] : []
    };
  }
  const color = threeMaterial?.color || new THREE.Color(1, 1, 1);
  const opacity = threeMaterial?.opacity ?? 1;
  return {
    diffuse: [color.r, color.g, color.b, opacity],
    ambient: [color.r, color.g, color.b, opacity],
    specular: [0, 0, 0, 1],
    emissive: [0, 0, 0, 1],
    power: 0,
    textureName,
    extra: (options.newFormat ?? state.currentModel?.newFormat ?? true) ? new Array(16).fill(0) : []
  };
}

function clonePreviewMaterial(material) {
  if (!material) return new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const clone = material.clone();
  clone.side = THREE.DoubleSide;
  if (clone.map) {
    clone.map.wrapS = THREE.RepeatWrapping;
    clone.map.wrapT = THREE.RepeatWrapping;
  }
  return clone;
}

async function parseObjReplacement(text, mtlText, files) {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) => {
    const file = files.find((candidate) => textureKey(candidate.name) === textureKey(url));
    if (!file) return url;
    const objectUrl = URL.createObjectURL(file);
    state.objectUrls.push(objectUrl);
    return objectUrl;
  });
  const objLoader = new OBJLoader(loadingManager);
  let firstMaterial = null;
  let textureFile = null;
  if (mtlText) {
    const mtlLoader = new MTLLoader(loadingManager);
    const materialCreator = mtlLoader.parse(mtlText, "");
    materialCreator.preload();
    objLoader.setMaterials(materialCreator);
    firstMaterial = Object.values(materialCreator.materials)[0] || null;
    textureFile = findMtlDiffuseTexture(mtlText, files);
  }

  const root = objLoader.parse(text);
  const positions = [];
  const normals = [];
  const uvs = [];
  const zeroUv = new THREE.Vector2();
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < position.count; i++) {
      positions.push(position.getX(i), position.getY(i), position.getZ(i));
      normals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
      uvs.push(uv ? uv.getX(i) : zeroUv.x, uv ? uv.getY(i) : zeroUv.y);
    }
    geometry.dispose();
  });
  const indices = new Uint16Array(positions.length / 3);
  for (let i = 0; i < indices.length; i++) indices[i] = i;
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices,
    material: firstMaterial,
    textureFile
  };
}

async function parseGltfReplacement(buffer, files) {
  const loadingManager = createReplacementLoadingManager(files);
  const loader = new GLTFLoader(loadingManager);
  const gltf = await new Promise((resolve, reject) => {
    loader.parse(buffer, "", resolve, reject);
  });
  const positions = [];
  const normals = [];
  const uvs = [];
  const zeroUv = new THREE.Vector2();
  let firstMaterial = null;
  let textureImage = null;
  let textureFile = null;
  const textureSources = [];
  const uvSourceIds = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    if (object.isSkinnedMesh) object.skeleton?.update();
    if (!firstMaterial) {
      firstMaterial = Array.isArray(object.material) ? object.material[0] : object.material;
      textureImage = firstMaterial?.map?.image || null;
      textureFile = findTextureFileForMaterial(firstMaterial, files);
    }
    appendGltfMesh(object, files, positions, normals, uvs, uvSourceIds, textureSources, zeroUv);
  });
  const indices = new Uint16Array(positions.length / 3);
  for (let i = 0; i < indices.length; i++) indices[i] = i;
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices,
    material: firstMaterial,
    textureFile,
    textureImage,
    textureSources,
    uvSourceIds
  };
}

async function createMd9FromSkinnedGltf(modelFile, files, options) {
  const data = modelFile.name.toLowerCase().endsWith(".gltf") ? await modelFile.text() : await modelFile.arrayBuffer();
  const loader = new GLTFLoader(createReplacementLoadingManager(files));
  const gltf = await new Promise((resolve, reject) => loader.parse(data, "", resolve, reject));
  gltf.scene.updateMatrixWorld(true);
  const skinnedMeshes = [];
  const boneSet = new Set();
  gltf.scene.traverse((object) => {
    if (!object.isSkinnedMesh || !object.geometry || !object.skeleton?.bones?.length) return;
    object.skeleton.update();
    skinnedMeshes.push(object);
    for (const bone of object.skeleton.bones) boneSet.add(bone);
  });
  if (!skinnedMeshes.length || !boneSet.size) throw new Error(t("importNeedsSkin"));

  let bones = [...boneSet];
  let boneIndex = new Map(bones.map((bone, index) => [bone, index]));
  const partBuckets = bones.map(() => createPartBucket());
  const textureSources = [];
  const vertexRefSources = [];
  const zeroUv = new THREE.Vector2();

  for (const mesh of skinnedMeshes) {
    appendSkinnedMeshAsRigidParts(mesh, files, bones, boneIndex, partBuckets, textureSources, vertexRefSources, zeroUv, options);
  }
  if (options.cleanRemoteFaces) {
    filterRemoteIsolatedTriangles(bones, partBuckets, vertexRefSources, options);
  }
  const pruned = pruneEmptyBones(bones, partBuckets);
  bones = pruned.bones;
  boneIndex = new Map(bones.map((bone, index) => [bone, index]));
  const activeBuckets = pruned.buckets;
  for (const ref of vertexRefSources) ref.partIndex = pruned.indexMap.get(ref.partIndex);
  if (options.jointSleeves) {
    addJointSleeves(bones, activeBuckets, vertexRefSources, options, pruned.parentIds);
  }
  const activeVertexRefs = vertexRefSources.filter((ref) => ref.partIndex !== undefined);

  let material = createMd9MaterialFromThree(null, "", null, { newFormat: true });
  let previewTexture = null;
  if (textureSources.length) {
    const atlas = await buildTextureAtlas(textureSources);
    material = createMd9MaterialFromThree(null, makePartTextureName(modelFile.name.replace(/\.[^.]+$/, "")), null, { newFormat: true });
    material.atlasSourceImage = atlas.canvas;
    material.atlasHasAlpha = atlas.hasAlpha;
    for (const ref of activeVertexRefs) {
      const source = textureSources[ref.sourceId];
      if (!source?.rect) continue;
      const remapped = remapSourceUvToAtlas(source, ref.u, ref.v, atlas.canvas.width, atlas.canvas.height);
      activeBuckets[ref.partIndex].uvs[ref.uvOffset] = remapped.u;
      activeBuckets[ref.partIndex].uvs[ref.uvOffset + 1] = remapped.v;
    }
    previewTexture = new THREE.CanvasTexture(atlas.canvas);
    previewTexture.colorSpace = THREE.SRGBColorSpace;
    previewTexture.flipY = false;
    previewTexture.wrapS = THREE.ClampToEdgeWrapping;
    previewTexture.wrapT = THREE.ClampToEdgeWrapping;
    previewTexture.userData.hasAlpha = atlas.hasAlpha;
  }

  const materials = [material];
  const submeshes = bones.map((bone, index) => createMd9PartFromBone(bone, index, pruned.parentIds[index], bones, activeBuckets[index]));
  promoteImportedRootPart(submeshes);
  const model = {
    name: `${modelFile.name.replace(/\.[^.]+$/, "")}.md9`,
    baseDir: "",
    newFormat: true,
    materials,
    submeshes,
    totalVertices: 0,
    totalFaces: 0,
    bounds: new THREE.Box3(),
    generatedAnimations: createAniAnimationsFromGltf(gltf, bones)
  };
  captureInitialModelState(model);
  updateGeneratedModelCounts(model);
  if (previewTexture) {
    model.materials[0].atlasSourceImage = material.atlasSourceImage;
    model.materials[0].atlasHasAlpha = material.atlasHasAlpha;
  }
  return model;
}

function createPartBucket() {
  return { positions: [], normals: [], uvs: [], indices: [], uvSourceIds: [], triangleInfluences: [], triangleSourceIds: [] };
}

function appendSkinnedMeshAsRigidParts(mesh, files, bones, boneIndex, partBuckets, textureSources, vertexRefSources, zeroUv, options) {
  const geometry = mesh.geometry.getAttribute("normal") ? mesh.geometry : mesh.geometry.clone();
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  const skinIndex = geometry.getAttribute("skinIndex");
  const skinWeight = geometry.getAttribute("skinWeight");
  if (!position || !skinIndex || !skinWeight) return;
  const index = geometry.getIndex();
  const drawCount = index ? index.count : position.count;
  const materialForDraw = buildMaterialDrawLookup(geometry, mesh.material);
  const vertex = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();
  const inverseBoneWorld = new THREE.Matrix4();
  const localNormal = new THREE.Vector3();

  for (let drawIndex = 0; drawIndex < drawCount; drawIndex += 3) {
    const vertexIndices = [
      index ? index.getX(drawIndex) : drawIndex,
      index ? index.getX(drawIndex + 1) : drawIndex + 1,
      index ? index.getX(drawIndex + 2) : drawIndex + 2
    ];
    const owner = chooseTriangleOwner(mesh, skinIndex, skinWeight, vertexIndices, boneIndex, options);
    const bucket = partBuckets[owner];
    const sourceId = registerTextureSource(textureSources, materialForDraw(drawIndex), files);
    const start = bucket.positions.length / 3;
    const influenceTotals = getTriangleInfluenceTotals(mesh, skinIndex, skinWeight, vertexIndices, boneIndex);
    inverseBoneWorld.copy(bones[owner].matrixWorld).invert();
    for (const vertexIndex of vertexIndices) {
      getGltfWorldVertex(mesh, geometry, position, vertexIndex, vertex).applyMatrix4(inverseBoneWorld);
      getGltfWorldNormal(mesh, geometry, normal, vertexIndex, vertexNormal);
      localNormal.copy(vertexNormal).transformDirection(inverseBoneWorld).normalize();
      bucket.positions.push(vertex.x, vertex.y, vertex.z);
      bucket.normals.push(localNormal.x, localNormal.y, localNormal.z);
      const u = uv ? uv.getX(vertexIndex) : zeroUv.x;
      const v = uv ? uv.getY(vertexIndex) : zeroUv.y;
      const uvOffset = bucket.uvs.length;
      bucket.uvs.push(u, v);
      if (sourceId >= 0) vertexRefSources.push({ partIndex: owner, uvOffset, sourceId, u: wrapUv(u), v: wrapUv(v) });
    }
    bucket.indices.push(start, start + 1, start + 2);
    bucket.triangleInfluences.push(influenceTotals);
    bucket.triangleSourceIds.push(sourceId);
  }
  if (geometry !== mesh.geometry) geometry.dispose();
}

function pruneEmptyBones(bones, buckets) {
  const kept = [];
  const keptBuckets = [];
  const indexMap = new Map();
  for (const [index, bone] of bones.entries()) {
    if (!buckets[index].positions.length) continue;
    indexMap.set(index, kept.length);
    kept.push(bone);
    keptBuckets.push(buckets[index]);
  }
  if (!kept.length) throw new Error(t("replacementNoMesh"));
  const originalIndex = new Map(bones.map((bone, index) => [bone, index]));
  const parentIds = kept.map((bone) => {
    let parent = bone.parent;
    while (parent) {
      const parentIndex = originalIndex.get(parent);
      if (parentIndex === undefined) break;
      if (indexMap.has(parentIndex)) return indexMap.get(parentIndex);
      parent = parent.parent;
    }
    return -1;
  });
  return { bones: kept, buckets: keptBuckets, indexMap, parentIds };
}

function filterRemoteIsolatedTriangles(bones, buckets, vertexRefSources, options) {
  const k = Math.max(0.1, options.remoteK || 3);
  for (const [partIndex, bucket] of buckets.entries()) {
    const triangleCount = bucket.indices.length / 3;
    if (triangleCount <= 1) continue;
    const components = getBucketTriangleComponents(bucket);
    if (components.length <= 1) continue;
    const totalVolume = components.reduce((sum, component) => sum + component.measure, 0);
    const d = Math.cbrt(Math.max(totalVolume, 1e-9));
    const closest = components.reduce((best, component) => (component.distance < best.distance ? component : best), components[0]);
    const keepTriangles = new Set();
    for (const component of components) {
      const tooFar = component.distance > k * d;
      if (component === closest || !tooFar) {
        for (const triangleIndex of component.triangles) keepTriangles.add(triangleIndex);
      } else {
        reassignRemoteComponent(component, partIndex, bones, buckets, vertexRefSources);
      }
    }
    if (keepTriangles.size !== triangleCount) {
      rebuildBucketTriangles(bucket, keepTriangles, vertexRefSources, partIndex);
    }
  }
}

function reassignRemoteComponent(component, sourceIndex, bones, buckets, vertexRefSources) {
  const targetIndex = chooseRemoteComponentTarget(component, sourceIndex, bones, buckets);
  if (targetIndex < 0 || targetIndex === sourceIndex) return;
  for (const triangleIndex of component.triangles) {
    appendTriangleToTargetBucket(buckets[sourceIndex], triangleIndex, sourceIndex, buckets[targetIndex], targetIndex, bones, vertexRefSources);
  }
}

function chooseRemoteComponentTarget(component, sourceIndex, bones, buckets) {
  const center = component.box.getCenter(new THREE.Vector3()).applyMatrix4(bones[sourceIndex].matrixWorld);
  const candidates = new Set();
  for (const triangleIndex of component.triangles) {
    for (const index of buckets[sourceIndex].triangleInfluences[triangleIndex]?.keys?.() || []) {
      if (index !== sourceIndex && buckets[index]?.positions.length) candidates.add(index);
    }
  }
  const primary = chooseNearestBoneIndex(center, candidates, bones);
  if (primary >= 0) return primary;
  return chooseNearestBoneIndex(center, buckets.map((bucket, index) => (index !== sourceIndex && bucket.positions.length ? index : -1)).filter((index) => index >= 0), bones);
}

function chooseNearestBoneIndex(worldPoint, candidateIndices, bones) {
  let bestIndex = -1;
  let bestDistance = Infinity;
  const bonePosition = new THREE.Vector3();
  for (const index of candidateIndices) {
    bonePosition.setFromMatrixPosition(bones[index].matrixWorld);
    const distance = bonePosition.distanceToSquared(worldPoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function appendTriangleToTargetBucket(sourceBucket, triangleIndex, sourceIndex, targetBucket, targetIndex, bones, vertexRefSources) {
  const sourceWorld = bones[sourceIndex].matrixWorld;
  const targetInverseWorld = new THREE.Matrix4().copy(bones[targetIndex].matrixWorld).invert();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(new THREE.Matrix4().multiplyMatrices(targetInverseWorld, sourceWorld));
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const start = targetBucket.positions.length / 3;
  const sourceId = sourceBucket.triangleSourceIds[triangleIndex];
  for (let corner = 0; corner < 3; corner++) {
    const vertexIndex = sourceBucket.indices[triangleIndex * 3 + corner];
    point
      .set(sourceBucket.positions[vertexIndex * 3], sourceBucket.positions[vertexIndex * 3 + 1], sourceBucket.positions[vertexIndex * 3 + 2])
      .applyMatrix4(sourceWorld)
      .applyMatrix4(targetInverseWorld);
    normal
      .set(sourceBucket.normals[vertexIndex * 3], sourceBucket.normals[vertexIndex * 3 + 1], sourceBucket.normals[vertexIndex * 3 + 2])
      .applyMatrix3(normalMatrix)
      .normalize();
    targetBucket.positions.push(point.x, point.y, point.z);
    targetBucket.normals.push(normal.x, normal.y, normal.z);
    const u = sourceBucket.uvs[vertexIndex * 2];
    const v = sourceBucket.uvs[vertexIndex * 2 + 1];
    const uvOffset = targetBucket.uvs.length;
    targetBucket.uvs.push(u, v);
    if (sourceId >= 0) vertexRefSources.push({ partIndex: targetIndex, uvOffset, sourceId, u: wrapUv(u), v: wrapUv(v) });
  }
  targetBucket.indices.push(start, start + 1, start + 2);
  targetBucket.triangleInfluences.push(sourceBucket.triangleInfluences[triangleIndex]);
  targetBucket.triangleSourceIds.push(sourceId);
}

function getBucketTriangleComponents(bucket) {
  const triangleCount = bucket.indices.length / 3;
  const parent = Array.from({ length: triangleCount }, (_, index) => index);
  const find = (value) => {
    while (parent[value] !== value) {
      parent[value] = parent[parent[value]];
      value = parent[value];
    }
    return value;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  const vertexToTriangles = new Map();
  for (let tri = 0; tri < triangleCount; tri++) {
    for (let corner = 0; corner < 3; corner++) {
      const vertexIndex = bucket.indices[tri * 3 + corner];
      const key = positionKey(bucket.positions, vertexIndex);
      const previous = vertexToTriangles.get(key);
      if (previous !== undefined) union(tri, previous);
      vertexToTriangles.set(key, tri);
    }
  }
  const groups = new Map();
  for (let tri = 0; tri < triangleCount; tri++) {
    const root = find(tri);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(tri);
  }
  const origin = new THREE.Vector3();
  return [...groups.values()].map((triangles) => {
    const box = new THREE.Box3();
    const point = new THREE.Vector3();
    for (const tri of triangles) {
      for (let corner = 0; corner < 3; corner++) {
        const vertexIndex = bucket.indices[tri * 3 + corner];
        point.set(bucket.positions[vertexIndex * 3], bucket.positions[vertexIndex * 3 + 1], bucket.positions[vertexIndex * 3 + 2]);
        box.expandByPoint(point);
      }
    }
    const size = box.getSize(new THREE.Vector3());
    const volume = size.x * size.y * size.z;
    const maxSize = Math.max(size.x, size.y, size.z, 1e-6);
    const measure = Math.max(volume, Math.pow(maxSize, 3) * 0.02);
    const closest = box.clampPoint(origin, new THREE.Vector3());
    return { triangles, box, measure, distance: closest.distanceTo(origin) };
  });
}

function positionKey(positions, vertexIndex) {
  const scale = 100000;
  return `${Math.round(positions[vertexIndex * 3] * scale)}:${Math.round(positions[vertexIndex * 3 + 1] * scale)}:${Math.round(positions[vertexIndex * 3 + 2] * scale)}`;
}

function rebuildBucketTriangles(bucket, keepTriangles, vertexRefSources, partIndex) {
  const oldUvToNew = new Map();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const triangleInfluences = [];
  const triangleSourceIds = [];
  for (let oldTri = 0; oldTri < bucket.indices.length / 3; oldTri++) {
    if (!keepTriangles.has(oldTri)) continue;
    const start = positions.length / 3;
    for (let corner = 0; corner < 3; corner++) {
      const oldVertex = bucket.indices[oldTri * 3 + corner];
      const newVertex = start + corner;
      positions.push(bucket.positions[oldVertex * 3], bucket.positions[oldVertex * 3 + 1], bucket.positions[oldVertex * 3 + 2]);
      normals.push(bucket.normals[oldVertex * 3], bucket.normals[oldVertex * 3 + 1], bucket.normals[oldVertex * 3 + 2]);
      uvs.push(bucket.uvs[oldVertex * 2], bucket.uvs[oldVertex * 2 + 1]);
      oldUvToNew.set(oldVertex * 2, newVertex * 2);
    }
    indices.push(start, start + 1, start + 2);
    triangleInfluences.push(bucket.triangleInfluences[oldTri]);
    triangleSourceIds.push(bucket.triangleSourceIds[oldTri]);
  }
  for (const ref of vertexRefSources) {
    if (ref.partIndex !== partIndex) continue;
    const nextOffset = oldUvToNew.get(ref.uvOffset);
    if (nextOffset === undefined) {
      ref.partIndex = undefined;
    } else {
      ref.uvOffset = nextOffset;
    }
  }
  bucket.positions = positions;
  bucket.normals = normals;
  bucket.uvs = uvs;
  bucket.indices = indices;
  bucket.triangleInfluences = triangleInfluences;
  bucket.triangleSourceIds = triangleSourceIds;
}

function addJointSleeves(bones, buckets, vertexRefSources, options, parentIds = null) {
  for (const [childIndex, bone] of bones.entries()) {
    const parentIndex = parentIds ? parentIds[childIndex] : bones.indexOf(bone.parent);
    if (parentIndex < 0) continue;
    addSleeveTowardBone(buckets[childIndex], childIndex, parentIndex, bones, buckets, vertexRefSources, options);
    addSleeveTowardBone(buckets[parentIndex], parentIndex, childIndex, bones, buckets, vertexRefSources, options);
  }
}

function addSleeveTowardBone(bucket, bucketIndex, targetBoneIndex, bones, buckets, vertexRefSources, options) {
  if (!bucket?.positions.length) return;
  const targetBucket = buckets[targetBoneIndex];
  if (!targetBucket?.positions.length) return;
  const edges = getBoundaryEdges(bucket);
  if (!edges.length) return;
  const bucketWorldInverse = new THREE.Matrix4().copy(bones[bucketIndex].matrixWorld).invert();
  const targetLocal = new THREE.Vector3()
    .setFromMatrixPosition(bones[targetBoneIndex].matrixWorld)
    .applyMatrix4(bucketWorldInverse);
  const partLength = computeDirectionalPartLength(bucket, targetLocal);
  const radius = partLength * 0.12;
  const extensionLength = partLength * Math.max(0.01, Math.min(1, options.sleeveLength ?? 0.12));
  const targetBoxLocal = computeBucketBoxInLocal(targetBucket, bones[targetBoneIndex], bucketWorldInverse);
  const padding = Math.max(partLength * 0.03, extensionLength * 0.25, 0.001);
  targetBoxLocal.expandByScalar(padding);
  for (const edge of selectNearestBoundaryEdges(edges, bucket, targetLocal, radius)) {
    appendSleeveForBoundaryEdge(bucket, edge, targetLocal, extensionLength, targetBoxLocal, vertexRefSources, bucketIndex);
  }
}

function computeDirectionalPartLength(bucket, targetLocal) {
  const direction = targetLocal.clone();
  if (direction.lengthSq() <= 1e-8) {
    return Math.max(...computeArrayBox(new Float32Array(bucket.positions)).getSize(new THREE.Vector3()).toArray(), 1e-6);
  }
  direction.normalize();
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < bucket.positions.length; i += 3) {
    const projection = bucket.positions[i] * direction.x + bucket.positions[i + 1] * direction.y + bucket.positions[i + 2] * direction.z;
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }
  const projectedLength = max - min;
  if (projectedLength > 1e-6) return projectedLength;
  return Math.max(...computeArrayBox(new Float32Array(bucket.positions)).getSize(new THREE.Vector3()).toArray(), 1e-6);
}

function computeBucketBoxInLocal(bucket, bone, targetLocalInverse) {
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  const transform = new THREE.Matrix4().multiplyMatrices(targetLocalInverse, bone.matrixWorld);
  for (let i = 0; i < bucket.positions.length; i += 3) {
    point.set(bucket.positions[i], bucket.positions[i + 1], bucket.positions[i + 2]).applyMatrix4(transform);
    box.expandByPoint(point);
  }
  return box;
}

function getBoundaryEdges(bucket) {
  const edges = new Map();
  for (let tri = 0; tri < bucket.indices.length / 3; tri++) {
    const ids = [bucket.indices[tri * 3], bucket.indices[tri * 3 + 1], bucket.indices[tri * 3 + 2]];
    for (const [a, b] of [[ids[0], ids[1]], [ids[1], ids[2]], [ids[2], ids[0]]]) {
      const key = [positionKey(bucket.positions, a), positionKey(bucket.positions, b)].sort().join("|");
      const existing = edges.get(key);
      if (existing) {
        existing.count++;
      } else {
        edges.set(key, { a, b, triangleIndex: tri, count: 1 });
      }
    }
  }
  return [...edges.values()].filter((edge) => edge.count === 1);
}

function selectNearestBoundaryEdges(edges, bucket, targetLocal, radius) {
  const midpoint = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const ranked = edges.map((edge) => {
    a.set(
      bucket.positions[edge.a * 3],
      bucket.positions[edge.a * 3 + 1],
      bucket.positions[edge.a * 3 + 2]
    );
    b.set(
      bucket.positions[edge.b * 3],
      bucket.positions[edge.b * 3 + 1],
      bucket.positions[edge.b * 3 + 2]
    );
    midpoint
      .set(
        (a.x + b.x) * 0.5,
        (a.y + b.y) * 0.5,
        (a.z + b.z) * 0.5
      );
    return { edge, distance: midpoint.distanceTo(targetLocal), length: a.distanceTo(b) };
  }).sort((a, b) => a.distance - b.distance);
  if (!ranked.length) return [];
  const averageLength = ranked.reduce((sum, item) => sum + item.length, 0) / ranked.length;
  const threshold = ranked[0].distance + Math.max(radius * 0.35, averageLength * 2, 0.001);
  return ranked.filter((item) => item.distance <= threshold).slice(0, 48).map((item) => item.edge);
}

function appendSleeveForBoundaryEdge(bucket, edge, targetLocal, extensionLength, targetBoxLocal, vertexRefSources, bucketIndex) {
  const sourceId = bucket.triangleSourceIds[edge.triangleIndex];
  const base = bucket.positions.length / 3;
  const addVertex = (sourceVertex, offsetScale, shrinkScale) => {
    const source = new THREE.Vector3(
      bucket.positions[sourceVertex * 3],
      bucket.positions[sourceVertex * 3 + 1],
      bucket.positions[sourceVertex * 3 + 2]
    );
    const direction = targetLocal.clone().sub(source);
    if (direction.lengthSq() > 1e-8) direction.normalize();
    const point = source.addScaledVector(direction, extensionLength * offsetScale);
    if (shrinkScale < 1) {
      point.sub(targetLocal).multiplyScalar(shrinkScale).add(targetLocal);
    }
    const normal = new THREE.Vector3(
      bucket.normals[sourceVertex * 3],
      bucket.normals[sourceVertex * 3 + 1],
      bucket.normals[sourceVertex * 3 + 2]
    ).normalize();
    const uvOffset = bucket.uvs.length;
    bucket.positions.push(point.x, point.y, point.z);
    bucket.normals.push(normal.x, normal.y, normal.z);
    const u = bucket.uvs[sourceVertex * 2];
    const v = bucket.uvs[sourceVertex * 2 + 1];
    bucket.uvs.push(u, v);
    if (sourceId >= 0) vertexRefSources.push({ partIndex: bucketIndex, uvOffset, sourceId, u: wrapUv(u), v: wrapUv(v) });
  };
  addVertex(edge.a, 0.45, 0.9);
  addVertex(edge.b, 0.45, 0.9);
  addVertex(edge.a, 1, 0.62);
  addVertex(edge.b, 1, 0.62);
  appendHiddenSleeveTriangle(bucket, [edge.a, edge.b, base + 1], targetBoxLocal, sourceId);
  appendHiddenSleeveTriangle(bucket, [edge.a, base + 1, base], targetBoxLocal, sourceId);
  appendHiddenSleeveTriangle(bucket, [base, base + 1, base + 3], targetBoxLocal, sourceId);
  appendHiddenSleeveTriangle(bucket, [base, base + 3, base + 2], targetBoxLocal, sourceId);
}

function appendHiddenSleeveTriangle(bucket, ids, targetBoxLocal, sourceId) {
  const centroid = new THREE.Vector3();
  for (const id of ids) {
    centroid.x += bucket.positions[id * 3];
    centroid.y += bucket.positions[id * 3 + 1];
    centroid.z += bucket.positions[id * 3 + 2];
  }
  centroid.multiplyScalar(1 / 3);
  if (!targetBoxLocal.containsPoint(centroid)) return;
  bucket.indices.push(...ids);
  bucket.triangleInfluences.push(null);
  bucket.triangleSourceIds.push(sourceId);
}

function chooseTriangleOwner(mesh, skinIndex, skinWeight, vertexIndices, boneIndex, options) {
  const owners = vertexIndices.map((vertexIndex) => chooseVertexOwner(mesh, skinIndex, skinWeight, vertexIndex, boneIndex, options.vertexMode));
  if (options.faceMode === "firstVertex") return owners[0];
  const totals = new Map();
  for (const vertexIndex of vertexIndices) {
    for (const influence of getVertexInfluences(mesh, skinIndex, skinWeight, vertexIndex, boneIndex)) {
      totals.set(influence.index, (totals.get(influence.index) || 0) + influence.weight);
    }
  }
  if (options.faceMode === "majorityVertex") {
    const counts = new Map();
    for (const owner of owners) counts.set(owner, (counts.get(owner) || 0) + 1);
    let best = owners[0];
    for (const owner of counts.keys()) {
      if (counts.get(owner) > counts.get(best) || (counts.get(owner) === counts.get(best) && (totals.get(owner) || 0) > (totals.get(best) || 0))) {
        best = owner;
      }
    }
    return best;
  }
  let best = owners[0];
  for (const [index, weight] of totals) {
    if (weight > (totals.get(best) || 0)) best = index;
  }
  return best;
}

function getTriangleInfluenceTotals(mesh, skinIndex, skinWeight, vertexIndices, boneIndex) {
  const totals = new Map();
  for (const vertexIndex of vertexIndices) {
    for (const influence of getVertexInfluences(mesh, skinIndex, skinWeight, vertexIndex, boneIndex)) {
      totals.set(influence.index, (totals.get(influence.index) || 0) + influence.weight);
    }
  }
  return totals;
}

function chooseVertexOwner(mesh, skinIndex, skinWeight, vertexIndex, boneIndex, mode) {
  const influences = getVertexInfluences(mesh, skinIndex, skinWeight, vertexIndex, boneIndex);
  if (!influences.length) return 0;
  if (mode === "firstWeight") return influences[0].index;
  return influences.reduce((best, item) => (item.weight > best.weight ? item : best), influences[0]).index;
}

function getVertexInfluences(mesh, skinIndex, skinWeight, vertexIndex, boneIndex) {
  const influences = [];
  for (let i = 0; i < skinIndex.itemSize; i++) {
    const skeletonBone = mesh.skeleton.bones[skinIndex.getComponent(vertexIndex, i)];
    const mapped = boneIndex.get(skeletonBone);
    const weight = skinWeight.getComponent(vertexIndex, i);
    if (mapped !== undefined && weight > 0) influences.push({ index: mapped, weight });
  }
  return influences;
}

function createMd9PartFromBone(bone, index, parentId, bones, bucket) {
  const importWasEmpty = bucket.positions.length === 0;
  ensureNonEmptyBucket(bucket);
  if (bucket.positions.length / 3 > 65535) throw new Error(t("replacementTooLarge"));
  const parentWorld = parentId >= 0 ? bones[parentId].matrixWorld : new THREE.Matrix4();
  const localMatrix = parentId >= 0
    ? new THREE.Matrix4().copy(parentWorld).invert().multiply(bone.matrixWorld)
    : new THREE.Matrix4().copy(bone.matrixWorld);
  const positions = new Float32Array(bucket.positions);
  const normals = new Float32Array(bucket.normals);
  const uvs = new Float32Array(bucket.uvs);
  const indices = new Uint16Array(bucket.indices);
  const box = computeArrayBox(positions);
  return {
    name: makeUniqueImportedBoneName(bone.name || `bone_${index}`, index),
    matrix: renderMatrixToMd9Array(localMatrix),
    boundingBox: box.isEmpty() ? [0, 0, 0, 0, 0, 0] : [box.min.x, box.min.y, -box.max.z, box.max.x, box.max.y, -box.min.z],
    localPositions: positions,
    normals,
    uvs,
    indices,
    materialId: 0,
    parentId,
    vertexCount: positions.length / 3,
    faceCount: indices.length / 3,
    bonePosition: new THREE.Vector3().setFromMatrixPosition(localMatrix),
    worldBonePosition: new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld),
    importWasEmpty,
    replacement: null
  };
}

function promoteImportedRootPart(submeshes) {
  if (submeshes.length <= 1) return;
  const worldMatrices = buildPartWorldMatrices(submeshes);
  const boxes = submeshes.map((part, index) => computePartWorldBox(part, worldMatrices[index]));
  const rootIndex = chooseImportedRootIndexByGraph(submeshes, boxes);
  if (rootIndex < 0) return;

  const adjacency = buildPartAdjacency(submeshes);
  const visited = new Set();
  rerootImportedComponent(rootIndex, -1, submeshes, adjacency, worldMatrices, visited);
  for (let index = 0; index < submeshes.length; index++) {
    if (visited.has(index)) continue;
    rerootImportedComponent(index, rootIndex, submeshes, adjacency, worldMatrices, visited);
  }
  moveImportedRootToFirst(submeshes, rootIndex);
}

function buildPartWorldMatrices(submeshes) {
  const cache = new Map();
  const getWorld = (index) => {
    if (cache.has(index)) return cache.get(index);
    const part = submeshes[index];
    const local = md9ArrayToRenderMatrix(part.matrix);
    const parentWorld = part.parentId >= 0 ? getWorld(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
    cache.set(index, world);
    return world;
  };
  return submeshes.map((_, index) => getWorld(index).clone());
}

function computePartWorldBox(part, worldMatrix) {
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  for (let i = 0; i < part.localPositions.length; i += 3) {
    point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2]).applyMatrix4(worldMatrix);
    box.expandByPoint(point);
  }
  return box;
}

function chooseImportedRootIndexByGraph(submeshes, boxes) {
  let bestIndex = -1;
  let bestDegree = -1;
  let bestVolume = -1;
  const size = new THREE.Vector3();
  const hasNonEmptyCandidate = submeshes.some((part) => !part.importWasEmpty);
  for (const [index, box] of boxes.entries()) {
    if (hasNonEmptyCandidate && submeshes[index].importWasEmpty) continue;
    const degree = getImportedPartDegree(submeshes, index);
    box.getSize(size);
    const volume = size.x * size.y * size.z;
    if (degree > bestDegree || (degree === bestDegree && volume > bestVolume)) {
      bestDegree = degree;
      bestVolume = volume;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function getImportedPartDegree(submeshes, index) {
  let degree = submeshes[index].parentId >= 0 ? 1 : 0;
  for (const part of submeshes) {
    if (part.parentId === index) degree++;
  }
  return degree;
}

function buildPartAdjacency(submeshes) {
  const adjacency = submeshes.map(() => []);
  for (const [index, part] of submeshes.entries()) {
    if (part.parentId < 0 || !adjacency[part.parentId]) continue;
    adjacency[index].push(part.parentId);
    adjacency[part.parentId].push(index);
  }
  return adjacency;
}

function rerootImportedComponent(startIndex, parentIndex, submeshes, adjacency, worldMatrices, visited) {
  const stack = [{ index: startIndex, parentIndex }];
  while (stack.length) {
    const current = stack.pop();
    if (visited.has(current.index)) continue;
    visited.add(current.index);

    const world = worldMatrices[current.index];
    const local = current.parentIndex >= 0
      ? new THREE.Matrix4().copy(worldMatrices[current.parentIndex]).invert().multiply(world)
      : world.clone();
    const part = submeshes[current.index];
    part.parentId = current.parentIndex;
    part.matrix = renderMatrixToMd9Array(local);
    part.bonePosition = new THREE.Vector3().setFromMatrixPosition(local);
    part.worldBonePosition = new THREE.Vector3().setFromMatrixPosition(world);

    for (const neighbor of adjacency[current.index]) {
      if (!visited.has(neighbor)) stack.push({ index: neighbor, parentIndex: current.index });
    }
  }
}

function moveImportedRootToFirst(submeshes, rootIndex) {
  if (rootIndex <= 0) return;
  const order = [rootIndex];
  for (let index = 0; index < submeshes.length; index++) {
    if (index !== rootIndex) order.push(index);
  }
  const oldToNew = new Map(order.map((oldIndex, newIndex) => [oldIndex, newIndex]));
  const reordered = order.map((oldIndex) => submeshes[oldIndex]);
  for (const part of reordered) {
    part.parentId = part.parentId >= 0 ? oldToNew.get(part.parentId) : -1;
  }
  submeshes.splice(0, submeshes.length, ...reordered);
}

function ensureNonEmptyBucket(bucket) {
  if (bucket.positions.length) return;
  const s = 0.001;
  bucket.positions.push(0, 0, 0, s, 0, 0, 0, s, 0);
  bucket.normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
  bucket.uvs.push(0, 0, 1, 0, 0, 1);
  bucket.indices.push(0, 1, 2);
}

function makeUniqueImportedBoneName(name, index) {
  return sanitizeFilename(`${name || "bone"}_${index}`).slice(0, 31) || `bone_${index}`;
}

function updateGeneratedModelCounts(model) {
  model.totalVertices = model.submeshes.reduce((sum, part) => sum + part.vertexCount, 0);
  model.totalFaces = model.submeshes.reduce((sum, part) => sum + part.faceCount, 0);
  model.bounds = new THREE.Box3();
  const point = new THREE.Vector3();
  const worldMatrices = new Map();
  const getWorldMatrix = (index) => {
    if (worldMatrices.has(index)) return worldMatrices.get(index);
    const part = model.submeshes[index];
    const local = md9ArrayToRenderMatrix(part.matrix);
    const parentWorld = part.parentId >= 0 ? getWorldMatrix(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
    worldMatrices.set(index, world);
    return world;
  };
  for (const part of model.submeshes) {
    const world = getWorldMatrix(model.submeshes.indexOf(part));
    for (let i = 0; i < part.localPositions.length; i += 3) {
      point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2]).applyMatrix4(world);
      model.bounds.expandByPoint(point);
    }
  }
  if (model.bounds.isEmpty()) model.bounds.set(new THREE.Vector3(), new THREE.Vector3());
}

function createAniAnimationsFromGltf(gltf, bones) {
  const boneNames = new Set(bones.map((bone, index) => makeUniqueImportedBoneName(bone.name || `bone_${index}`, index)));
  const nodeNameToBoneName = new Map(bones.map((bone, index) => [bone.name, makeUniqueImportedBoneName(bone.name || `bone_${index}`, index)]));
  return (gltf.animations || []).map((clip) => {
    const tracks = new Map();
    let duration = 0;
    for (const keyTrack of clip.tracks) {
      const parsed = parseGltfTrackName(keyTrack.name);
      const boneName = nodeNameToBoneName.get(parsed.nodeName);
      if (!boneName || !boneNames.has(boneName)) continue;
      if (!tracks.has(boneName)) tracks.set(boneName, { boneName, positions: [], rotations: [], scales: [] });
      const track = tracks.get(boneName);
      const itemSize = keyTrack.getValueSize();
      for (let i = 0; i < keyTrack.times.length; i++) {
        const time = keyTrack.times[i] * ANIMATION_FPS;
        duration = Math.max(duration, time);
        const offset = i * itemSize;
        if (parsed.property === "position") {
          track.positions.push({ time, value: new THREE.Vector3(keyTrack.values[offset], keyTrack.values[offset + 1], keyTrack.values[offset + 2]) });
        } else if (parsed.property === "quaternion") {
          track.rotations.push({ time, value: new THREE.Quaternion(keyTrack.values[offset], keyTrack.values[offset + 1], keyTrack.values[offset + 2], keyTrack.values[offset + 3]).normalize() });
        } else if (parsed.property === "scale") {
          track.scales.push({ time, value: new THREE.Vector3(keyTrack.values[offset], keyTrack.values[offset + 1], keyTrack.values[offset + 2]) });
        }
      }
    }
    return { name: `${sanitizeFilename(clip.name || "animation")}.ani`, duration, tracks };
  }).filter((animation) => animation.tracks.size);
}

function parseGltfTrackName(name) {
  try {
    const parsed = THREE.PropertyBinding.parseTrackName(name);
    return { nodeName: parsed.nodeName, property: parsed.propertyName };
  } catch {
    const match = String(name).match(/^(.*)\.(position|quaternion|scale)$/);
    return { nodeName: match?.[1] || "", property: match?.[2] || "" };
  }
}

function appendGltfMesh(object, files, positions, normals, uvs, uvSourceIds, textureSources, zeroUv) {
  const geometry = object.geometry.getAttribute("normal") ? object.geometry : object.geometry.clone();
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  const index = geometry.getIndex();
  const drawCount = index ? index.count : position.count;
  const materialForDraw = buildMaterialDrawLookup(geometry, object.material);
  const vertex = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();

  for (let drawIndex = 0; drawIndex < drawCount; drawIndex++) {
    const vertexIndex = index ? index.getX(drawIndex) : drawIndex;
    getGltfWorldVertex(object, geometry, position, vertexIndex, vertex);
    getGltfWorldNormal(object, geometry, normal, vertexIndex, vertexNormal);
    positions.push(vertex.x, vertex.y, vertex.z);
    normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
    uvs.push(uv ? uv.getX(vertexIndex) : zeroUv.x, uv ? uv.getY(vertexIndex) : zeroUv.y);
    uvSourceIds.push(registerTextureSource(textureSources, materialForDraw(drawIndex), files));
  }

  if (geometry !== object.geometry) geometry.dispose();
}

function buildMaterialDrawLookup(geometry, material) {
  const materials = Array.isArray(material) ? material : [material];
  if (!geometry.groups.length) return () => materials[0] || null;
  return (drawIndex) => {
    const group = geometry.groups.find((candidate) => drawIndex >= candidate.start && drawIndex < candidate.start + candidate.count);
    return materials[group?.materialIndex || 0] || materials[0] || null;
  };
}

function registerTextureSource(textureSources, material, files) {
  const image = material?.map?.image || null;
  const file = findTextureFileForMaterial(material, files);
  if (!image && !file) return -1;
  const key = file
    ? `file:${textureKey(file.name)}`
    : `texture:${material?.map?.uuid || material?.uuid || image?.src || textureSources.length}`;
  let index = textureSources.findIndex((source) => source.key === key);
  if (index >= 0) return index;
  textureSources.push({ key, material, image, file });
  return textureSources.length - 1;
}

function getGltfWorldVertex(object, geometry, positionAttribute, index, target) {
  target.fromBufferAttribute(positionAttribute, index);
  if (object.isSkinnedMesh) {
    skinGltfVertex(object, geometry, index, target);
  }
  return target.applyMatrix4(object.matrixWorld);
}

function getGltfWorldNormal(object, geometry, normalAttribute, index, target) {
  target.fromBufferAttribute(normalAttribute, index);
  if (object.isSkinnedMesh) {
    skinGltfNormal(object, geometry, index, target);
  }
  return target.transformDirection(object.matrixWorld);
}

function skinGltfVertex(object, geometry, index, target) {
  const skinIndex = geometry.getAttribute("skinIndex");
  const skinWeight = geometry.getAttribute("skinWeight");
  if (!skinIndex || !skinWeight || !object.skeleton) return target;
  const base = target.clone().applyMatrix4(object.bindMatrix);
  const skinned = new THREE.Vector3();
  const temp = new THREE.Vector3();
  const boneMatrix = new THREE.Matrix4();
  for (let i = 0; i < 4; i++) {
    const weight = skinWeight.getComponent(index, i);
    if (weight === 0) continue;
    const boneIndex = skinIndex.getComponent(index, i);
    boneMatrix.fromArray(object.skeleton.boneMatrices, boneIndex * 16);
    temp.copy(base).applyMatrix4(boneMatrix).multiplyScalar(weight);
    skinned.add(temp);
  }
  if (skinned.lengthSq() > 0) {
    target.copy(skinned).applyMatrix4(object.bindMatrixInverse);
  }
  return target;
}

function skinGltfNormal(object, geometry, index, target) {
  const skinIndex = geometry.getAttribute("skinIndex");
  const skinWeight = geometry.getAttribute("skinWeight");
  if (!skinIndex || !skinWeight || !object.skeleton) return target;
  const base = target.clone().transformDirection(object.bindMatrix);
  const skinned = new THREE.Vector3();
  const temp = new THREE.Vector3();
  const boneMatrix = new THREE.Matrix4();
  for (let i = 0; i < 4; i++) {
    const weight = skinWeight.getComponent(index, i);
    if (weight === 0) continue;
    const boneIndex = skinIndex.getComponent(index, i);
    boneMatrix.fromArray(object.skeleton.boneMatrices, boneIndex * 16);
    temp.copy(base).transformDirection(boneMatrix).multiplyScalar(weight);
    skinned.add(temp);
  }
  if (skinned.lengthSq() > 0) {
    target.copy(skinned).transformDirection(object.bindMatrixInverse);
  }
  return target;
}

function createReplacementLoadingManager(files) {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) => {
    const file = files.find((candidate) => textureKey(candidate.name) === textureKey(url));
    if (!file) return url;
    const objectUrl = URL.createObjectURL(file);
    state.objectUrls.push(objectUrl);
    return objectUrl;
  });
  return loadingManager;
}

function findTextureFileForMaterial(material, files) {
  const src = material?.map?.image?.src || "";
  if (!src) return null;
  return files.find((file) => src.includes(file.name) || src.includes(textureKey(file.name))) || null;
}

async function bakeReplacementTextures(replacement) {
  const activeSources = replacement.textureSources.filter(Boolean);
  if (!activeSources.length) return;
  if (activeSources.length > 64) {
    console.warn(`GLTF texture atlas has ${activeSources.length} sources; check material texture keys`, activeSources);
  }
  const atlas = await buildTextureAtlas(activeSources);

  for (let vertexIndex = 0; vertexIndex < replacement.uvSourceIds.length; vertexIndex++) {
    const source = replacement.textureSources[replacement.uvSourceIds[vertexIndex]];
    if (!source?.rect) continue;
    const uvIndex = vertexIndex * 2;
    const u = wrapUv(replacement.uvs[uvIndex]);
    const v = wrapUv(replacement.uvs[uvIndex + 1]);
    const remapped = remapSourceUvToAtlas(source, u, v, atlas.canvas.width, atlas.canvas.height);
    replacement.uvs[uvIndex] = remapped.u;
    replacement.uvs[uvIndex + 1] = remapped.v;
  }

  const texture = new THREE.CanvasTexture(atlas.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  replacement.atlasImage = atlas.canvas;
  replacement.previewMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: atlas.hasAlpha,
    alphaTest: atlas.hasAlpha ? 0.001 : 0
  });
}

async function buildTextureAtlas(sources) {
  const prepared = [];
  const uniqueSources = [];
  const seen = new Map();
  let totalArea = 0;
  let maxSourceWidth = 0;
  for (const source of sources) {
    const image = await loadImageBitmapSource(source.file || source.image);
    const imageWidth = getImageWidth(image);
    const imageHeight = getImageHeight(image);
    const fingerprint = createImageFingerprint(image, imageWidth, imageHeight);
    const existing = findMatchingAtlasSource(seen.get(fingerprint.key), fingerprint);
    if (existing) {
      source.imageWidth = existing.imageWidth;
      source.imageHeight = existing.imageHeight;
      source.rect = existing.rect;
      source.image = existing.image;
      source.hasAlpha = existing.hasAlpha;
      prepared.push(source);
      continue;
    }

    source.imageWidth = imageWidth;
    source.imageHeight = imageHeight;
    source.rect = {
      x: 0,
      y: 0,
      w: imageWidth,
      h: imageHeight
    };
    source.image = image;
    source.fingerprint = fingerprint;
    source.hasAlpha = fingerprint.hasAlpha;
    if (!seen.has(fingerprint.key)) seen.set(fingerprint.key, []);
    seen.get(fingerprint.key).push(source);
    uniqueSources.push(source);
    prepared.push(source);
    totalArea += imageWidth * imageHeight;
    maxSourceWidth = Math.max(maxSourceWidth, imageWidth);
  }

  packAtlasSources(uniqueSources, totalArea, maxSourceWidth);
  let width = 0;
  let height = 0;
  for (const source of uniqueSources) {
    width = Math.max(width, source.rect.x + source.rect.w);
    height = Math.max(height, source.rect.y + source.rect.h);
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d", { alpha: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const source of uniqueSources) {
    ctx.drawImage(source.image, source.rect.x, source.rect.y, source.rect.w, source.rect.h);
  }
  for (const source of prepared) delete source.fingerprint;
  return { canvas, hasAlpha: prepared.some((source) => source.hasAlpha) };
}

function createImageFingerprint(image, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return {
    width,
    height,
    pixels,
    hasAlpha: hasTransparentPixels(pixels),
    key: `${width}x${height}:${hashBytes(pixels)}`
  };
}

function hasTransparentPixels(pixels) {
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 255) return true;
  }
  return false;
}

function findMatchingAtlasSource(candidates, fingerprint) {
  if (!candidates) return null;
  for (const source of candidates) {
    const other = source.fingerprint;
    if (!other || other.width !== fingerprint.width || other.height !== fingerprint.height) continue;
    if (bytesEqual(other.pixels, fingerprint.pixels)) return source;
  }
  return null;
}

function packAtlasSources(sources, totalArea, maxSourceWidth) {
  const targetWidth = Math.max(maxSourceWidth, Math.ceil(Math.sqrt(Math.max(1, totalArea))));
  const sorted = [...sources].sort((a, b) => {
    const heightDelta = b.imageHeight - a.imageHeight;
    return heightDelta || b.imageWidth - a.imageWidth;
  });
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const source of sorted) {
    if (x > 0 && x + source.imageWidth > targetWidth) {
      y += rowHeight;
      x = 0;
      rowHeight = 0;
    }
    source.rect.x = x;
    source.rect.y = y;
    source.rect.w = source.imageWidth;
    source.rect.h = source.imageHeight;
    x += source.imageWidth;
    rowHeight = Math.max(rowHeight, source.imageHeight);
  }
}

function hashBytes(bytes) {
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function remapSourceUvToAtlas(source, u, v, atlasWidth, atlasHeight) {
  if (!source.rect) return { u, v };
  return {
    u: (source.rect.x + u * source.rect.w) / atlasWidth,
    v: (source.rect.y + v * source.rect.h) / atlasHeight
  };
}

function getImageWidth(image) {
  return image.naturalWidth || image.videoWidth || image.width;
}

function getImageHeight(image) {
  return image.naturalHeight || image.videoHeight || image.height;
}

function isCanvasLike(value) {
  return (typeof HTMLCanvasElement !== "undefined" && value instanceof HTMLCanvasElement)
    || (typeof OffscreenCanvas !== "undefined" && value instanceof OffscreenCanvas);
}

function findMtlDiffuseTexture(mtlText, files) {
  for (const line of mtlText.split(/\r?\n/)) {
    const match = line.trim().match(/^map_Kd\s+(.+)$/i);
    if (!match) continue;
    const tokens = match[1].trim().split(/\s+/);
    const filename = tokens[tokens.length - 1];
    const file = files.find((candidate) => textureKey(candidate.name) === textureKey(filename));
    if (file) return file;
  }
  return null;
}

function normalizeReplacementToPart(replacement, part, options = {}) {
  const sourceBox = computeArrayBox(replacement.positions);
  const targetSource = part.initialState?.localPositions?.length ? part.initialState.localPositions : part.localPositions;
  const targetBox = computeArrayBox(targetSource);
  if (sourceBox.isEmpty() || targetBox.isEmpty()) return;

  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  const targetSize = targetBox.getSize(new THREE.Vector3());
  const sourceMax = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
  const targetMax = Math.max(targetSize.x, targetSize.y, targetSize.z);
  if (sourceMax <= 0 || targetMax <= 0) return;

  const scale = options.keepSize ? 1 : targetMax / sourceMax;
  const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
  const targetCenter = targetBox.getCenter(new THREE.Vector3());
  for (let i = 0; i < replacement.positions.length; i += 3) {
    replacement.positions[i] = (replacement.positions[i] - sourceCenter.x) * scale + targetCenter.x;
    replacement.positions[i + 1] = (replacement.positions[i + 1] - sourceCenter.y) * scale + targetCenter.y;
    replacement.positions[i + 2] = (replacement.positions[i + 2] - sourceCenter.z) * scale + targetCenter.z;
  }
}

function computeArrayBox(positions) {
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    point.set(positions[i], positions[i + 1], positions[i + 2]);
    box.expandByPoint(point);
  }
  return box;
}

function updatePartGeometry(index) {
  const entry = state.meshEntries[index];
  const part = state.currentModel.submeshes[index];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.setIndex(new THREE.Uint16BufferAttribute(part.indices, 1));
  geometry.computeBoundingSphere();
  entry.mesh.geometry.dispose();
  entry.mesh.geometry = geometry;
  entry.part = part;
  rebuildNormalVisualizers();
  applyOptions();
}

function updateAllPartGeometries() {
  for (const [index, part] of state.currentModel.submeshes.entries()) {
    const entry = state.meshEntries[index];
    if (!entry?.mesh) continue;
    const geometry = entry.mesh.geometry;
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
    geometry.computeBoundingSphere();
    geometry.attributes.position.needsUpdate = true;
    entry.part = part;
  }
  rebuildNormalVisualizers();
  applyOptions();
}

function scaleCurrentModelToHeight() {
  const model = state.currentModel;
  if (!model) return;
  const targetHeight = Number(el.targetModelHeight.value);
  if (!Number.isFinite(targetHeight) || targetHeight <= 0) {
    setStatus(t("invalidHeight"));
    return;
  }

  const { box: modelBox } = computeModelWorldBox(model);
  const size = modelBox.getSize(new THREE.Vector3());
  if (modelBox.isEmpty() || size.y <= 0) {
    setStatus(t("invalidHeight"));
    return;
  }

  const scale = targetHeight / size.y;
  const center = modelBox.getCenter(new THREE.Vector3());
  const transform = new THREE.Matrix4()
    .makeTranslation(center.x, center.y, center.z)
    .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  pushUndoSnapshot();
  applyWorldTransformToModelGeometry(transform);
  setStatus(t("scaledModelHeight", { height: formatNumber(targetHeight) }));
}

function resetCurrentModelPosition() {
  const model = state.currentModel;
  if (!model) return;
  const { box } = computeModelWorldBox(model);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const transform = new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z);
  pushUndoSnapshot();
  applyWorldTransformToModelGeometry(transform);
  setStatus(t("resetModelPositionDone"));
}

function computeModelWorldBox(model) {
  const worldMatrices = buildPartWorldMatrices(model.submeshes);
  const box = new THREE.Box3();
  for (const [index, part] of model.submeshes.entries()) {
    box.union(computePartWorldBox(part, worldMatrices[index]));
  }
  return { box, worldMatrices };
}

function applyWorldTransformToModelGeometry(transform) {
  const model = state.currentModel;
  if (!model) return;
  const oldWorldMatrices = buildPartWorldMatrices(model.submeshes);
  const newWorldMatrices = oldWorldMatrices.map((world) => {
    const position = new THREE.Vector3().setFromMatrixPosition(world).applyMatrix4(transform);
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    world.decompose(new THREE.Vector3(), quaternion, scale);
    return new THREE.Matrix4().compose(position, quaternion, scale);
  });
  const desiredWorld = new THREE.Vector3();
  const localPoint = new THREE.Vector3();
  const inverseNewWorld = new THREE.Matrix4();
  for (const [index, part] of model.submeshes.entries()) {
    inverseNewWorld.copy(newWorldMatrices[index]).invert();
    for (let i = 0; i < part.localPositions.length; i += 3) {
      desiredWorld
        .set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2])
        .applyMatrix4(oldWorldMatrices[index])
        .applyMatrix4(transform);
      localPoint.copy(desiredWorld).applyMatrix4(inverseNewWorld);
      part.localPositions[i] = localPoint.x;
      part.localPositions[i + 1] = localPoint.y;
      part.localPositions[i + 2] = localPoint.z;
    }
  }
  for (const [index, part] of model.submeshes.entries()) {
    const parentWorld = part.parentId >= 0 ? newWorldMatrices[part.parentId] : null;
    const localMatrix = parentWorld
      ? new THREE.Matrix4().copy(parentWorld).invert().multiply(newWorldMatrices[index])
      : newWorldMatrices[index].clone();
    part.matrix = renderMatrixToMd9Array(localMatrix);
    part.bonePosition = new THREE.Vector3().setFromMatrixPosition(localMatrix);
    part.worldBonePosition = new THREE.Vector3().setFromMatrixPosition(newWorldMatrices[index]);
  }
  for (const part of model.submeshes) syncPartBone(part);
  updateAllPartGeometries();
  updateModelDerivedData();
  frameModel(model.bounds);
  updateHighlightInfo();
}

function rebuildSceneHelpers() {
  if (!state.currentModel || !state.root) return;
  if (state.skeletonLines) {
    state.root.remove(state.skeletonLines);
    disposeObject(state.skeletonLines);
  }
  if (state.bounds) {
    state.root.remove(state.bounds);
    disposeObject(state.bounds);
    state.bounds = null;
  }
  state.skeletonLines = createSkeletonLines(state.currentModel);
  state.root.add(state.skeletonLines);
  rebuildNormalVisualizers();
  applyOptions();
}

function updateModelDerivedData() {
  const model = state.currentModel;
  if (!model) return;
  model.totalVertices = 0;
  model.totalFaces = 0;
  model.bounds = new THREE.Box3();
  const point = new THREE.Vector3();
  state.root?.updateWorldMatrix(true, true);
  for (const part of model.submeshes) {
    model.totalVertices += part.vertexCount;
    model.totalFaces += part.faceCount;
    const box = new THREE.Box3();
    const node = state.boneNodes.get(part.name);
    for (let i = 0; i < part.localPositions.length; i += 3) {
      point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2]);
      box.expandByPoint(point);
      model.bounds.expandByPoint(node ? point.clone().applyMatrix4(node.matrixWorld) : point);
    }
    part.boundingBox = box.isEmpty()
      ? [0, 0, 0, 0, 0, 0]
      : [
          box.min.x,
          box.min.y,
          -box.max.z,
          box.max.x,
          box.max.y,
          -box.min.z
        ];
  }
  if (model.bounds.isEmpty()) model.bounds.set(new THREE.Vector3(), new THREE.Vector3());
  if (state.bounds) {
    state.root.remove(state.bounds);
    state.bounds = new THREE.Box3Helper(model.bounds, 0xe5b85b);
    state.root.add(state.bounds);
  }
  if (state.skeletonLines) updateSkeletonLines();
  if (state.meshNameLabels.length !== model.submeshes.length) rebuildMeshNameLabels();
  updateStats(model, model.name);
  applyOptions();
}

async function createMaterialFromFile(material, file) {
  const url = URL.createObjectURL(file);
  state.objectUrls.push(url);
  const threeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  threeMaterial.name = material.textureName || file.name;
  const texture = await loadTexture(url, file.name);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  threeMaterial.map = texture;
  threeMaterial.userData.baseMap = texture;
  applyTextureAlphaToMaterial(threeMaterial, texture);
  return threeMaterial;
}

function makeAtlasTextureName() {
  const base = state.currentModel?.name?.split(/[\\/]/).pop()?.replace(/\.[^.]+$/, "") || "model";
  return `${base}_atlas`.slice(0, 27);
}

function makePartTextureName(partName) {
  const base = String(partName || "texture");
  return normalizeMd9TextureName(base.toLowerCase().startsWith("Nocull_") ? base : `Nocull_${base}`);
}

function sanitizeFilename(name) {
  return String(name || "export").replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, "_").slice(0, 80) || "export";
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
    option.textContent = t("noMd9Loaded");
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
  defaultOption.textContent = t("defaultPose");
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
  state.undoStack = [];
  state.redoStack = [];
  state.editIndex = -1;
  state.batchSelectedParts = new Set();
  el.saveModel.disabled = true;
  el.scaleModelHeight.disabled = true;
  el.resetModelPosition.disabled = true;
  el.partFilter.disabled = true;
  el.partFilter.value = "";
  el.addPart.disabled = true;
  el.duplicatePart.disabled = true;
  el.deletePart.disabled = true;
  el.exportSelectedParts.disabled = true;
  el.batchExportParts.disabled = true;
  el.batchEditToggle.disabled = true;
  populateEditorForNoSelection();
  setEditorEnabled(false);
  el.batchEditPanel.hidden = true;
  setBatchEditToggleActive(false);
  el.submeshList.replaceChildren();
  updateStatsEmpty();
  updateModelSelect();
  updateMissingTextures(null);
  updateHistoryButtons();
  setStatus(t("modelsCleared"));
}

function clearAnimations() {
  state.aniFiles = [];
  state.currentAnimation = null;
  state.currentAniId = "";
  state.animationFrame = 0;
  updateAnimationSelect();
  updateFrameControls();
  resetPose();
  setStatus(t("animationsCleared"));
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
    name.textContent = t("noModelLoaded");
    row.append(name);
    el.missingTextures.append(row);
    return;
  }
  if (!model.materials.length) {
    const row = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = t("noTexture");
    row.append(name);
    el.missingTextures.append(row);
    return;
  }
  for (const [materialIndex, material] of model.materials.entries()) {
    const row = document.createElement("div");
    row.className = state.missingTextures.has(material.textureName) ? "missing-texture-row" : "";
    const id = document.createElement("small");
    id.textContent = String(materialIndex);
    const input = document.createElement("input");
    input.type = "text";
    input.value = material.textureName || "";
    input.placeholder = t("noTexture");
    input.addEventListener("change", () => renameMaterialTexture(materialIndex, input.value));
    const status = document.createElement("small");
    status.textContent = material.textureName && state.missingTextures.has(material.textureName)
      ? t("textureMissing")
      : "";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = t("deleteTexture");
    deleteButton.addEventListener("click", () => deleteMaterialTexture(materialIndex));
    row.append(id, input, status, deleteButton);
    el.missingTextures.append(row);
  }
}

async function renameMaterialTexture(materialIndex, value) {
  const material = state.currentModel?.materials[materialIndex];
  if (!material) return;
  const oldTextureName = material.textureName || "";
  const newTextureName = value.trim() ? normalizeMd9TextureName(value) : "";
  if (oldTextureName === newTextureName) {
    updateMissingTextures(state.currentModel);
    return;
  }
  pushUndoSnapshot();
  if (oldTextureName && newTextureName && oldTextureName !== newTextureName) {
    renameLoadedTextureResource(oldTextureName, newTextureName, materialIndex);
  }
  material.textureName = newTextureName;
  if (oldTextureName && !newTextureName) removeLoadedTextureResourceIfUnused(oldTextureName);
  await refreshCurrentModelView();
}

async function addTextureMaterials(files) {
  if (!state.currentModel || !files.length) return;
  const textureFiles = files.filter((file) => isTextureFile(file.name));
  if (!textureFiles.length) return;
  pushUndoSnapshot();
  for (const file of textureFiles) {
    state.textureFiles.set(textureKey(file.webkitRelativePath || file.name), file);
    state.currentModel.materials.push(createMd9MaterialFromThree(null, normalizeMd9TextureName(file.name)));
  }
  await refreshCurrentModelView();
  setStatus(t("textureAdded", { count: textureFiles.length }));
}

async function deleteMaterialTexture(materialIndex) {
  const model = state.currentModel;
  const material = model?.materials?.[materialIndex];
  if (!material) return;
  pushUndoSnapshot();
  const oldTextureName = material.textureName || "";
  if (model.materials.length <= 1) {
    model.materials = [createMd9MaterialFromThree(null, "")];
    for (const part of model.submeshes) part.materialId = 0;
  } else {
    model.materials.splice(materialIndex, 1);
    for (const part of model.submeshes) {
      if (part.materialId === materialIndex) {
        part.materialId = 0;
      } else if (part.materialId > materialIndex) {
        part.materialId--;
      }
    }
  }
  removeLoadedTextureResourceIfUnused(oldTextureName, materialIndex);
  await refreshCurrentModelView();
  setStatus(t("textureDeleted"));
}

async function refreshCurrentModelView() {
  const model = state.currentModel;
  if (!model) return;
  const editIndex = state.editIndex;
  const highlightedIndex = state.highlightedPartIndex;
  const batchSelected = new Set(state.batchSelectedParts);
  state.restoringHistory = true;
  try {
    await showModel(model, model.name);
  } finally {
    state.restoringHistory = false;
  }
  state.batchSelectedParts = new Set([...batchSelected].filter((index) => model.submeshes[index]));
  populateSubmeshList(model);
  if (highlightedIndex >= 0 && model.submeshes[highlightedIndex]) {
    setHighlightedPart(highlightedIndex);
  }
  if (editIndex >= 0 && model.submeshes[editIndex]) {
    openPartEditor(editIndex);
  }
}

function renameLoadedTextureResource(oldTextureName, newTextureName, materialIndex) {
  const match = findCompatibleTexture(oldTextureName);
  if (!match) return;
  const newKey = textureKey(newTextureName);
  const renamed = match.fileOrUrl instanceof File
    ? new File([match.fileOrUrl], newTextureName, {
        type: match.fileOrUrl.type || "application/octet-stream",
        lastModified: match.fileOrUrl.lastModified
      })
    : match.fileOrUrl;
  state.textureFiles.set(newKey, renamed);

  const oldKeys = [
    textureKey(oldTextureName),
    textureKey(match.name)
  ];
  for (const oldKey of oldKeys) {
    if (oldKey === newKey || !state.textureFiles.has(oldKey)) continue;
    if (!isTextureKeyUsedByOtherMaterial(oldKey, materialIndex)) state.textureFiles.delete(oldKey);
  }
}

function removeLoadedTextureResourceIfUnused(textureName) {
  if (!textureName) return;
  const match = findCompatibleTexture(textureName);
  if (!match) return;
  const keys = new Set([textureKey(textureName), textureKey(match.name)]);
  for (const key of keys) {
    if (!state.textureFiles.has(key)) continue;
    if (!isTextureKeyUsedByAnyMaterial(key)) state.textureFiles.delete(key);
  }
}

function isTextureKeyUsedByOtherMaterial(key, excludeMaterialIndex) {
  const base = textureBaseKey(key);
  return state.currentModel?.materials.some((material, index) => (
    index !== excludeMaterialIndex
      && material.textureName
      && (textureKey(material.textureName) === key || textureBaseKey(material.textureName) === base)
  )) || false;
}

function isTextureKeyUsedByAnyMaterial(key) {
  const base = textureBaseKey(key);
  return state.currentModel?.materials.some((material) => (
    material.textureName
      && (textureKey(material.textureName) === key || textureBaseKey(material.textureName) === base)
  )) || false;
}

function collectMissingTextures(model) {
  const missing = new Set();
  if (!model) return missing;
  for (const material of model.materials) {
    if (!material.textureName) continue;
    if (material.atlasSourceImage || material.atlasSourceFile) continue;
    if (!findCompatibleTexture(material.textureName)) missing.add(material.textureName);
  }
  return missing;
}

function hasNewTextureForMissing(previousMissing) {
  for (const textureName of previousMissing) {
    if (findCompatibleTexture(textureName)) return true;
  }
  return false;
}

function restorePanelWidth() {
  try {
    const saved = parseFloat(localStorage.getItem(PANEL_WIDTH_STORAGE_KEY) || "");
    if (Number.isFinite(saved)) setPanelWidth(saved);
  } catch (error) {
    console.warn("Panel width read failed", error);
  }
}

function installPanelResize() {
  let resizing = false;
  el.panelResizer.addEventListener("pointerdown", (event) => {
    resizing = true;
    el.panelResizer.classList.add("dragging");
    el.panelResizer.setPointerCapture(event.pointerId);
  });
  el.panelResizer.addEventListener("pointermove", (event) => {
    if (!resizing) return;
    setPanelWidth(window.innerWidth - event.clientX);
  });
  const finishResize = (event) => {
    if (!resizing) return;
    resizing = false;
    el.panelResizer.classList.remove("dragging");
    if (el.panelResizer.hasPointerCapture(event.pointerId)) el.panelResizer.releasePointerCapture(event.pointerId);
    try {
      localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, getComputedStyle(document.documentElement).getPropertyValue("--panel-width").trim());
    } catch (error) {
      console.warn("Panel width save failed", error);
    }
  };
  el.panelResizer.addEventListener("pointerup", finishResize);
  el.panelResizer.addEventListener("pointercancel", finishResize);
}

function setPanelWidth(width) {
  const clamped = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, Number(width) || MIN_PANEL_WIDTH));
  document.documentElement.style.setProperty("--panel-width", `${Math.round(clamped)}px`);
  resize();
}

function installCameraKeyboardControls() {
  window.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      state.cameraKeys.add(key);
      event.preventDefault();
    } else if (key === "f") {
      if (state.currentModel) frameModel(state.currentModel.bounds);
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => {
    state.cameraKeys.delete(event.key.toLowerCase());
  });
}

function isTypingTarget(target) {
  return target?.matches?.("input, textarea, select, [contenteditable='true']");
}

function installViewportPicking() {
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerDown.set(event.clientX, event.clientY);
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > PART_PICK_DRAG_THRESHOLD) return;
    pickPartFromViewport(event);
  });
}

function pickPartFromViewport(event) {
  if (!state.currentModel || !state.meshEntries.length) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  );
  raycaster.setFromCamera(pointerNdc, camera);
  const meshes = state.meshEntries
    .filter((entry) => entry?.mesh?.visible)
    .map((entry) => entry.mesh);
  const hit = raycaster.intersectObjects(meshes, false)[0];
  if (!hit) return;
  const index = state.meshEntries.findIndex((entry) => entry?.mesh === hit.object);
  if (index >= 0) setHighlightedPart(index);
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
  el.meshNameOverlay.hidden = !state.currentModel || !el.showMeshNames.checked;
  if (!el.meshNameOverlay.hidden) updateMeshNameLabels();
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
  refreshHighlightedMaterial();
}

function resetPose() {
  for (const node of state.boneNodes.values()) {
    node.position.copy(node.userData.defaultPosition);
    node.quaternion.copy(node.userData.defaultQuaternion);
    if (node.userData.defaultScale) node.scale.copy(node.userData.defaultScale);
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
    const scale = sampleVectorKey(track.scales, sampleTime);
    if (position) node.position.copy(position);
    if (rotation) node.quaternion.copy(rotation);
    if (scale) node.scale.copy(scale);
  }
  if (state.skeletonLines) updateSkeletonLines();
  updateBoundsFromRenderedMeshes();
}

function updateBoundsFromRenderedMeshes() {
  if (!state.bounds || !state.root || !state.meshEntries.length) return;
  const bounds = new THREE.Box3();
  const meshBox = new THREE.Box3();
  state.root.updateWorldMatrix(true, true);
  for (const entry of state.meshEntries) {
    const geometry = entry.mesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    meshBox.copy(geometry.boundingBox).applyMatrix4(entry.mesh.matrixWorld);
    bounds.union(meshBox);
  }
  if (!bounds.isEmpty()) {
    state.bounds.box.copy(bounds);
    state.bounds.updateMatrixWorld(true);
  }
  state.bounds.visible = el.showBounds.checked;
}

function sampleVectorKey(keys, time) {
  if (!keys.length) return null;
  if (time < keys[0].time) return null;
  if (keys.length === 1 || time === keys[0].time) return keys[0].value;
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
  if (time < keys[0].time) return null;
  if (keys.length === 1 || time === keys[0].time) return keys[0].value;
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

async function saveCurrentModel() {
  if (!state.currentModel) return;
  const saveSnapshot = captureSaveMutationSnapshot(state.currentModel);
  try {
    const zipEntries = [];
    await bakeReplacementAtlas(state.currentModel, zipEntries);
    const md9 = serializeMd9(createBakedModelForSave(state.currentModel));
    const originalName = state.currentModel.name.split(/[\\/]/).pop() || "model.md9";
    const defaultBaseName = originalName.replace(/\.[^.]+$/, "") || "model";
    const baseName = normalizeModelBaseName(window.prompt(t("modelNamePrompt"), defaultBaseName) || defaultBaseName);
    for (const animation of state.currentModel.generatedAnimations || []) {
      zipEntries.push({ name: sanitizeFilename(animation.name || "animation.ani"), data: new Blob([serializeAni(animation)], { type: "application/octet-stream" }) });
    }
    zipEntries.unshift({ name: `${baseName}.md9`, data: new Blob([md9], { type: "application/octet-stream" }) });
    zipEntries.push(...getSaveDependencyEntries(state.currentModel, zipEntries));
    const zip = await createZipBlob(zipEntries);
    downloadBlob(zip, `${sanitizeFilename(baseName)}.zip`);
    setStatus(t("savedMd9", { name: `${baseName}.zip` }));
  } catch (error) {
    console.error(error);
    setStatus(t("saveFailed", { message: error.message }));
  } finally {
    restoreSaveMutationSnapshot(state.currentModel, saveSnapshot);
  }
}

function normalizeModelBaseName(name) {
  return sanitizeFilename(String(name || "model").replace(/\.md9$/i, "").trim() || "model");
}

function createBakedModelForSave(model) {
  const context = createBakeHierarchyContext(model);
  return {
    ...model,
    materials: model.materials.map((material) => ({
      ...material,
      diffuse: [...material.diffuse],
      ambient: [...material.ambient],
      specular: [...material.specular],
      emissive: [...material.emissive],
      extra: material.extra ? [...material.extra] : []
    })),
    submeshes: model.submeshes.map((part, index) => createBakedPartForSave(part, index, context))
  };
}

function createBakeHierarchyContext(model) {
  const localMatrices = model.submeshes.map((part) => md9ArrayToRenderMatrix(part.matrix));
  const worldMatrices = new Map();
  const savedWorldPositions = new Map();
  const getWorldMatrix = (index) => {
    if (worldMatrices.has(index)) return worldMatrices.get(index);
    const part = model.submeshes[index];
    const parentWorld = part.parentId >= 0 ? getWorldMatrix(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, localMatrices[index]);
    worldMatrices.set(index, world);
    return world;
  };
  const getSavedWorldPosition = (index) => {
    if (savedWorldPositions.has(index)) return savedWorldPositions.get(index);
    const position = new THREE.Vector3().setFromMatrixPosition(getWorldMatrix(index));
    savedWorldPositions.set(index, position);
    return position;
  };
  return { getWorldMatrix, getSavedWorldPosition };
}

function createBakedPartForSave(part, index, context) {
  const worldMatrix = context.getWorldMatrix(index);
  const savedWorldPosition = context.getSavedWorldPosition(index);
  const parentSavedWorldPosition = part.parentId >= 0
    ? context.getSavedWorldPosition(part.parentId)
    : new THREE.Vector3();
  const savedLocalPosition = savedWorldPosition.clone().sub(parentSavedWorldPosition);

  const bakedPositions = new Float32Array(part.localPositions.length);
  const point = new THREE.Vector3();
  const box = new THREE.Box3();
  for (let i = 0; i < part.localPositions.length; i += 3) {
    point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2])
      .applyMatrix4(worldMatrix)
      .sub(savedWorldPosition);
    bakedPositions[i] = point.x;
    bakedPositions[i + 1] = point.y;
    bakedPositions[i + 2] = point.z;
    box.expandByPoint(point);
  }

  const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix);
  const bakedNormals = new Float32Array(part.normals.length);
  const normal = new THREE.Vector3();
  for (let i = 0; i < part.normals.length; i += 3) {
    normal.set(part.normals[i], part.normals[i + 1], part.normals[i + 2]).applyMatrix3(normalMatrix).normalize();
    bakedNormals[i] = normal.x;
    bakedNormals[i + 1] = normal.y;
    bakedNormals[i + 2] = normal.z;
  }

  const identityLinearMatrix = new THREE.Matrix4().makeTranslation(savedLocalPosition.x, savedLocalPosition.y, savedLocalPosition.z);
  return {
    ...part,
    matrix: renderMatrixToMd9Array(identityLinearMatrix),
    boundingBox: box.isEmpty()
      ? [0, 0, 0, 0, 0, 0]
      : [
          box.min.x,
          box.min.y,
          -box.max.z,
          box.max.x,
          box.max.y,
          -box.min.z
        ],
    localPositions: bakedPositions,
    normals: bakedNormals,
    uvs: new Float32Array(part.uvs),
    indices: new Uint16Array(part.indices)
  };
}

function captureSaveMutationSnapshot(model) {
  return {
    uvs: model.submeshes.map((part) => new Float32Array(part.uvs)),
    materials: model.materials.map((material) => ({
      atlasBaked: material.atlasBaked,
      textureName: material.textureName
    }))
  };
}

function getSaveDependencyEntries(model, existingEntries) {
  const existing = new Set(existingEntries.map((entry) => textureKey(entry.name)));
  const entries = [];
  for (const material of model.materials) {
    if (!material.textureName) continue;
    const key = textureKey(material.textureName);
    if (existing.has(key)) continue;
    const file = state.textureFiles.get(key);
    if (!file) continue;
    entries.push({ name: material.textureName, data: file });
    existing.add(key);
  }
  return entries;
}

async function createZipBlob(entries) {
  const encoder = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const usedNames = new Map();
  for (const entry of entries) {
    const nameBytes = encoder.encode(makeUniqueZipPath(entry.name, usedNames));
    const dataBytes = new Uint8Array(await blobLikeToArrayBuffer(entry.data));
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    chunks.push(local, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);
    offset += local.length + dataBytes.length;
  }

  const centralOffset = offset;
  let centralSize = 0;
  for (const chunk of central) {
    chunks.push(chunk);
    centralSize += chunk.length;
  }
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  chunks.push(end);
  return new Blob(chunks, { type: "application/zip" });
}

async function unzipFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findZipEndOfCentralDirectory(bytes);
  if (eocdOffset < 0) return [];
  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);
  const files = [];
  for (let i = 0; i < entryCount; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
    if (!name || name.endsWith("/")) continue;

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    const data = method === 0
      ? compressed
      : method === 8
        ? await inflateRaw(compressed)
        : null;
    if (!data) continue;
    const safeName = name.split(/[\\/]/).pop();
    files.push(new File([data.slice(0, uncompressedSize)], safeName, { lastModified: file.lastModified }));
  }
  return files;
}

async function unpackPakFile(file) {
  const entries = readPakFromBuffer(await file.arrayBuffer(), { fileNameEncoding: "gbk", cacheData: false });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const safeName = String(entry.name || "").split(/[\\/]/).pop();
    if (!safeName) continue;
    files.push(new File([entry.data], safeName, { lastModified: file.lastModified }));
  }
  return files;
}

function findZipEndOfCentralDirectory(bytes) {
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset--) {
    if (bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x05 && bytes[offset + 3] === 0x06) {
      return offset;
    }
  }
  return -1;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch (error) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
}

async function blobLikeToArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  if (value instanceof Blob) return value.arrayBuffer();
  return new Blob([value]).arrayBuffer();
}

function normalizeZipPath(path) {
  return String(path || "file").replace(/^[\\/]+/, "").replace(/\\/g, "/");
}

function makeUniqueZipPath(path, usedNames) {
  const normalized = normalizeZipPath(path);
  const lower = normalized.toLowerCase();
  const count = usedNames.get(lower) || 0;
  usedNames.set(lower, count + 1);
  if (!count) return normalized;
  const slash = normalized.lastIndexOf("/");
  const dir = slash >= 0 ? normalized.slice(0, slash + 1) : "";
  const file = slash >= 0 ? normalized.slice(slash + 1) : normalized;
  const dot = file.lastIndexOf(".");
  const stem = dot > 0 ? file.slice(0, dot) : file;
  const ext = dot > 0 ? file.slice(dot) : "";
  return `${dir}${stem}_${count + 1}${ext}`;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function restoreSaveMutationSnapshot(model, snapshot) {
  if (!model || !snapshot) return;
  for (const [index, uvs] of snapshot.uvs.entries()) {
    if (!model.submeshes[index]) continue;
    model.submeshes[index].uvs = new Float32Array(uvs);
    if (state.meshEntries[index]) updatePartGeometry(index);
  }
  for (const [index, materialSnapshot] of snapshot.materials.entries()) {
    if (!model.materials[index]) continue;
    model.materials[index].textureName = materialSnapshot.textureName;
    if (materialSnapshot.atlasBaked === undefined) {
      delete model.materials[index].atlasBaked;
    } else {
      model.materials[index].atlasBaked = materialSnapshot.atlasBaked;
    }
  }
  updateModelDerivedData();
}

async function bakeReplacementAtlas(model, zipEntries = null) {
  const handled = new Set();
  for (const part of model.submeshes) {
    const material = model.materials[part.materialId];
    if (!material || handled.has(material)) continue;
    if (!material.atlasSourceFile && !material.atlasSourceImage) continue;
    handled.add(material);
    const textureName = material.textureName ? normalizeMd9TextureName(material.textureName) : makePartTextureName(part.name);
    const canvas = isCanvasLike(material.atlasSourceImage)
      ? material.atlasSourceImage
      : (await buildTextureAtlas([{
          key: `save:${part.name}`,
          material,
          file: material.atlasSourceFile || null,
          image: material.atlasSourceImage || null
        }])).canvas;
    material.textureName = textureName;
    if (zipEntries) {
      zipEntries.push({ name: textureName, data: await canvasToDxt3DdsBlob(canvas) });
    } else {
      downloadBlob(await canvasToDxt3DdsBlob(canvas), textureName);
    }
  }
}

async function downloadCanvasPng(canvas, filename) {
  downloadBlob(await canvasToPngBlob(canvas), filename);
}

async function downloadTextureAndAskName(canvas, defaultName) {
  const chosen = window.prompt(t("textureNamePrompt"), defaultName);
  const textureName = normalizeMd9TextureName(chosen || defaultName);
  downloadBlob(await canvasToDxt3DdsBlob(canvas), textureName);
  return textureName;
}

async function collectTextureAndAskName(canvas, defaultName, zipEntries) {
  if (!zipEntries) return downloadTextureAndAskName(canvas, defaultName);
  const chosen = window.prompt(t("textureNamePrompt"), defaultName);
  const textureName = normalizeMd9TextureName(chosen || defaultName);
  zipEntries.push({ name: textureName, data: await canvasToDxt3DdsBlob(canvas) });
  return textureName;
}

async function canvasToPngBlob(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error(t("pngEncodeFailed"));
  return blob;
}

function normalizeMd9TextureName(name) {
  const cleaned = String(name || "texture").split(/[\\/]/).pop().trim().replace(/\.dds$/i, "") || "texture";
  return `${cleaned.slice(0, 27)}.dds`;
}

async function canvasToDxt3DdsBlob(canvas) {
  const squish = await getSquish();
  const scale = getDdsEncodeScale(canvas);
  const sourceWidth = Math.max(1, Math.round(canvas.width * scale));
  const sourceHeight = Math.max(1, Math.round(canvas.height * scale));
  const width = alignToDdsBlock(sourceWidth);
  const height = alignToDdsBlock(sourceHeight);
  const padded = document.createElement("canvas");
  padded.width = width;
  padded.height = height;
  const ctx = padded.getContext("2d", { alpha: true, willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight);
  const rgba = new Uint8Array(ctx.getImageData(0, 0, width, height).data.buffer);
  const compressed = compressDxt3(rgba, width, height, squish);
  return createDdsBlob(sourceWidth, sourceHeight, compressed);
}

function getDdsEncodeScale(canvas) {
  const longestEdge = Math.max(canvas.width || 1, canvas.height || 1);
  if (longestEdge <= DDS_SAFE_UPSCALE_LIMIT) return DDS_SAFE_UPSCALE_FACTOR;
  return isPaletteLikeTexture(canvas) ? DDS_SAFE_UPSCALE_FACTOR : 1;
}

function isPaletteLikeTexture(canvas) {
  const pixelCount = (canvas.width || 0) * (canvas.height || 0);
  if (!pixelCount || pixelCount > DDS_PALETTE_UPSCALE_MAX_PIXELS) return false;
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const colors = new Set();
  for (let i = 0; i < pixels.length; i += 4) {
    colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3]}`);
    if (colors.size > DDS_PALETTE_UNIQUE_COLOR_LIMIT) return false;
  }
  return true;
}

function alignToDdsBlock(value) {
  return Math.ceil(value / DDS_BLOCK_SIZE) * DDS_BLOCK_SIZE;
}

function getSquish() {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const wait = () => {
      const squish = window.Module;
      if (squish?.cwrap && squish?._malloc && squish?._free) {
        resolve({
          module: squish,
          getStorageRequirements: squish.cwrap("GetStorageRequirements", "number", ["number", "number", "number"]),
          compressImage: squish.cwrap("CompressImage", "void", ["number", "number", "number", "number", "number"])
        });
        return;
      }
      if (Date.now() - started > 10000) {
        reject(new Error("DDS encoder is not ready"));
        return;
      }
      setTimeout(wait, 50);
    };
    wait();
  });
}

function compressDxt3(rgba, width, height, squish) {
  const flags = SQUISH_DXT3
    | SQUISH_COLOUR_ITERATIVE_CLUSTER_FIT
    | SQUISH_COLOUR_METRIC_UNIFORM
    | SQUISH_WEIGHT_COLOUR_BY_ALPHA;
  const source = squish.module._malloc(rgba.length);
  squish.module.HEAPU8.set(rgba, source);
  const targetSize = squish.getStorageRequirements(width, height, flags);
  const target = squish.module._malloc(targetSize);
  squish.compressImage(source, width, height, target, flags);
  const output = new Uint8Array(squish.module.HEAPU8.buffer, target, targetSize).slice();
  squish.module._free(source);
  squish.module._free(target);
  return output;
}

function createDdsBlob(width, height, compressedData) {
  const headerSize = 128;
  const buffer = new ArrayBuffer(headerSize + compressedData.length);
  const view = new DataView(buffer);
  view.setUint32(0, 0x20534444, true);
  view.setUint32(4, 124, true);
  view.setUint32(8, 0x1 | 0x2 | 0x4 | 0x1000 | 0x80000, true);
  view.setUint32(12, height, true);
  view.setUint32(16, width, true);
  view.setUint32(20, compressedData.length, true);
  view.setUint32(28, 1, true);
  view.setUint32(76, 32, true);
  view.setUint32(80, 0x4, true);
  view.setUint32(84, 0x33545844, true);
  view.setUint32(108, 0x1000, true);
  new Uint8Array(buffer).set(compressedData, headerSize);
  return new Blob([buffer], { type: "application/octet-stream" });
}

function remapUvsForMaterial(model, materialId, source, atlasWidth, atlasHeight) {
  for (const part of model.submeshes) {
    if (part.materialId !== materialId) continue;
    for (let i = 0; i < part.uvs.length; i += 2) {
      const u = wrapUv(part.uvs[i]);
      const v = wrapUv(part.uvs[i + 1]);
      const remapped = remapSourceUvToAtlas(source, u, v, atlasWidth, atlasHeight);
      part.uvs[i] = remapped.u;
      part.uvs[i + 1] = remapped.v;
    }
    updatePartGeometry(model.submeshes.indexOf(part));
  }
}

function wrapUv(value) {
  return value - Math.floor(value);
}

function serializeMd9(model) {
  const materialBytes = model.newFormat ? 4 + model.materials.length * 116 : model.materials.length * 100;
  const headerBytes = model.submeshes.length * 136;
  const vertexCount = model.submeshes.reduce((sum, part) => sum + part.vertexCount, 0);
  const faceCount = model.submeshes.reduce((sum, part) => sum + part.faceCount, 0);
  const byteLength = 4 + materialBytes + 4 + headerBytes + 8 + vertexCount * 32 + faceCount * 3 * 2;
  const buffer = new ArrayBuffer(byteLength);
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
    const bytes = new Uint8Array(buffer, offset, length);
    const text = String(value || "");
    for (let i = 0; i < Math.min(text.length, length - 1); i++) {
      bytes[i] = text.charCodeAt(i) & 0x7f;
    }
    offset += length;
  };
  const writeBytes = (bytes, length) => {
    new Uint8Array(buffer, offset, length).set(bytes.slice(0, length));
    offset += length;
  };

  if (model.newFormat) {
    writeInt(-1);
    writeInt(model.materials.length);
  } else {
    writeInt(model.materials.length);
  }
  for (const material of model.materials) {
    for (const value of material.diffuse) writeFloat(value);
    for (const value of material.ambient) writeFloat(value);
    for (const value of material.specular) writeFloat(value);
    for (const value of material.emissive) writeFloat(value);
    writeFloat(material.power);
    writeName(material.textureName, 32);
    if (model.newFormat) writeBytes(material.extra || [], 16);
  }

  writeInt(model.submeshes.length);
  for (const part of model.submeshes) {
    writeName(part.name, 32);
    for (const value of part.matrix) writeFloat(value);
    writeInt(part.vertexCount);
    writeInt(part.faceCount);
    writeInt(part.materialId);
    writeInt(part.parentId);
    for (const value of part.boundingBox) writeFloat(value);
  }
  writeInt(vertexCount);
  writeInt(faceCount);

  for (const part of model.submeshes) {
    for (let i = 0; i < part.vertexCount; i++) {
      writeFloat(part.localPositions[i * 3]);
      writeFloat(part.localPositions[i * 3 + 1]);
      writeFloat(-part.localPositions[i * 3 + 2]);
      writeFloat(part.normals[i * 3]);
      writeFloat(part.normals[i * 3 + 1]);
      writeFloat(-part.normals[i * 3 + 2]);
      writeFloat(part.uvs[i * 2]);
      writeFloat(part.uvs[i * 2 + 1]);
    }
  }
  for (const part of model.submeshes) {
    for (const index of part.indices) {
      view.setUint16(offset, index, true);
      offset += 2;
    }
  }
  return buffer;
}

async function loadImageBitmapSource(source) {
  if (source instanceof File || source instanceof Blob) {
    const name = source.name?.toLowerCase() || "";
    if (name.endsWith(".dds")) return decodeDdsToCanvas(await source.arrayBuffer());
    if (name.endsWith(".tga")) return decodeTgaToCanvas(await source.arrayBuffer());
    return loadImageBitmap(source);
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) return source;
  if (typeof HTMLCanvasElement !== "undefined" && source instanceof HTMLCanvasElement) return source;
  if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) return source;
  if (typeof OffscreenCanvas !== "undefined" && source instanceof OffscreenCanvas) return source;
  throw new Error(t("cannotReadTexture"));
}

function decodeTgaToCanvas(buffer) {
  const texture = tgaLoader.parse(buffer);
  const image = texture.image;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.putImageData(new ImageData(new Uint8ClampedArray(image.data), image.width, image.height), 0, 0);
  texture.dispose?.();
  return canvas;
}

async function loadImageBitmap(file) {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  state.objectUrls.push(url);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatNumber(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)).toString() : "0";
}

function disposeCurrent() {
  restoreHighlightedMaterial();
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
  state.editIndex = -1;
  state.highlightedPartIndex = -1;
  state.highlightedMaterial = null;
  state.highlightedHelper = null;
  state.meshNameLabels = [];
  el.meshNameOverlay.replaceChildren();
  el.meshNameOverlay.hidden = true;
  updateHighlightInfo();
  state.boneNodes = new Map();
  if (el.duplicatePart) el.duplicatePart.disabled = true;
  if (el.deletePart) el.deletePart.disabled = true;
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
  for (const geometry of geometries) geometry.dispose?.();
  for (const texture of textures) texture.dispose?.();
  for (const material of materials) material.dispose?.();
}

function setStatus(message) {
  el.status.textContent = message;
}

async function showHelpDialog() {
  if (!el.helpDialog.open) el.helpDialog.showModal();
  el.helpContent.textContent = t("loading");
  try {
    const response = await fetch(`./src/help.${state.language}.txt`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    el.helpContent.textContent = await response.text();
  } catch (error) {
    el.helpContent.textContent = t("helpLoadFailed", { message: error.message });
  }
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
  const now = performance.now();
  const deltaSeconds = Math.min((now - state.lastFrameTime) / 1000, 0.1);
  state.lastFrameTime = now;
  if (state.currentAnimation && el.autoPlay.checked) {
    applyAnimation((getNow() - state.animationStartTime) * ANIMATION_FPS);
    updateFrameControls();
  }
  updateKeyboardCamera(deltaSeconds);
  updateMeshNameLabels();
  if (state.highlightedHelper) {
    state.highlightedHelper.visible = state.meshEntries[state.highlightedPartIndex]?.mesh?.visible ?? false;
    state.highlightedHelper.update();
    updateHighlightInfo();
  }
  controls.update();
  renderer.render(scene, camera);
}

function updateKeyboardCamera(deltaSeconds) {
  if (!state.cameraKeys.size) return;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const move = new THREE.Vector3();
  if (state.cameraKeys.has("w")) move.add(forward);
  if (state.cameraKeys.has("s")) move.sub(forward);
  if (state.cameraKeys.has("d")) move.add(right);
  if (state.cameraKeys.has("a")) move.sub(right);
  if (move.lengthSq() < 0.0001) return;
  const distance = Math.max(camera.position.distanceTo(controls.target), 1);
  move.normalize().multiplyScalar(distance * 0.9 * deltaSeconds);
  camera.position.add(move);
  controls.target.add(move);
}

function getNow() {
  return clock.getElapsedTime();
}
