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
  viewerCanvas: document.querySelector("#viewerCanvas"),
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
  skinFreshImport: document.querySelector("#skinFreshImport"),
  saveModel: document.querySelector("#saveModel"),
  saveAnimation: document.querySelector("#saveAnimation"),
  modelSelect: document.querySelector("#modelSelect"),
  animationSelect: document.querySelector("#animationSelect"),
  clearModels: document.querySelector("#clearModels"),
  clearAnimations: document.querySelector("#clearAnimations"),
  autoPlay: document.querySelector("#autoPlay"),
  aniTimelinePanel: document.querySelector("#aniTimelinePanel"),
  aniTimelineResizeHandle: document.querySelector("#aniTimelineResizeHandle"),
  aniTimeline: document.querySelector("#aniTimeline"),
  aniTimelineCanvas: document.querySelector("#aniTimelineCanvas"),
  aniTimelineProgress: document.querySelector("#aniTimelineProgress"),
  aniTimelineCursor: document.querySelector("#aniTimelineCursor"),
  aniSliderTrack: document.querySelector("#aniSliderTrack"),
  aniSliderThumb: document.querySelector("#aniSliderThumb"),
  aniTimeSlider: document.querySelector("#aniTimeSlider"),
  aniRangeBar: document.querySelector("#aniRangeBar"),
  aniRangeFill: document.querySelector("#aniRangeFill"),
  aniRangeStartHandle: document.querySelector("#aniRangeStartHandle"),
  aniRangeEndHandle: document.querySelector("#aniRangeEndHandle"),
  aniKeyLayer: document.querySelector("#aniKeyLayer"),
  aniSnapKeys: document.querySelector("#aniSnapKeys"),
  aniSnapStep: document.querySelector("#aniSnapStep"),
  aniSelectTracks: document.querySelector("#aniSelectTracks"),
  aniBatchEdit: document.querySelector("#aniBatchEdit"),
  aniTrackDialog: document.querySelector("#aniTrackDialog"),
  aniTrackList: document.querySelector("#aniTrackList"),
  aniKeyEditor: document.querySelector("#aniKeyEditor"),
  aniKeyTransform: document.querySelector(".ani-key-transform"),
  aniDeleteKey: document.querySelector("#aniDeleteKey"),
  aniPrevKey: document.querySelector("#aniPrevKey"),
  aniNextKey: document.querySelector("#aniNextKey"),
  aniKeyInterval: document.querySelector("#aniKeyInterval"),
  aniInsertKeyAfter: document.querySelector("#aniInsertKeyAfter"),
  aniCloseKeyEditor: document.querySelector("#aniCloseKeyEditor"),
  aniBatchEditor: document.querySelector("#aniBatchEditor"),
  aniBatchClose: document.querySelector("#aniBatchClose"),
  aniBatchTrackList: document.querySelector("#aniBatchTrackList"),
  aniBatchStartTime: document.querySelector("#aniBatchStartTime"),
  aniBatchEndTime: document.querySelector("#aniBatchEndTime"),
  aniBatchSelectAll: document.querySelector("#aniBatchSelectAll"),
  aniBatchSelectNone: document.querySelector("#aniBatchSelectNone"),
  aniBatchCopy: document.querySelector("#aniBatchCopy"),
  aniBatchCut: document.querySelector("#aniBatchCut"),
  aniBatchDelete: document.querySelector("#aniBatchDelete"),
  aniBatchPasteTime: document.querySelector("#aniBatchPasteTime"),
  aniBatchPasteMode: document.querySelector("#aniBatchPasteMode"),
  aniBatchPaste: document.querySelector("#aniBatchPaste"),
  aniKeyTransformTitle: document.querySelector("#aniKeyTransformTitle"),
  aniKeyTimeInput: document.querySelector("#aniKeyTimeInput"),
  aniTransformEditor: document.querySelector("#aniTransformEditor"),
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
  modelScaleFactor: document.querySelector("#modelScaleFactor"),
  scaleModelFactor: document.querySelector("#scaleModelFactor"),
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
  editParentLabel: document.querySelector("#editParentLabel"),
  editParentControl: document.querySelector("#editParentControl"),
  editParent: document.querySelector("#editParent"),
  keepWorldOnParentChange: document.querySelector("#keepWorldOnParentChange"),
  trackBinInfo: document.querySelector("#trackBinInfo"),
  matrixModeControl: document.querySelector("#matrixModeControl"),
  matrixMode: document.querySelector("#matrixMode"),
  keepMatrixControl: document.querySelector("#keepMatrixControl"),
  keepMatrix: document.querySelector("#keepMatrix"),
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
el.viewerCanvas.append(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = false;
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
const POINTER_LOCK_ROTATE_SPEED = 0.005;
const DDS_BLOCK_SIZE = 4;
const DDS_SAFE_UPSCALE_LIMIT = 128;
const DDS_PALETTE_UPSCALE_MAX_PIXELS = 65536;
const DDS_PALETTE_UNIQUE_COLOR_LIMIT = 256;
const DDS_SAFE_UPSCALE_FACTOR = 4;
const TEXTURE_FILE_PATTERN = /\.(dds|png|jpe?g|webp|bmp|gif|avif|tga)$/i;
const TRACK_BIN_FORMAT = "track-bin";
const MD9_FORMAT = "md9";
const TRACK_BIN_RANGE_SENTINEL = 0xcccccc00;
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
    saveMd9: "Save",
    saveAni: "Save",
    currentModel: "Current model",
    noMd9Loaded: "No model loaded",
    clear: "Clear",
    currentAnimation: "Current animation",
    defaultPose: "Default pose",
    autoPlay: "Auto play",
    snapKeys: "Snap",
    rangeStart: "Start",
    rangeEnd: "End",
    selectAll: "Select all",
    selectNone: "Select none",
    copy: "Copy",
    cut: "Cut",
    paste: "Paste",
    pasteTime: "Paste at",
    pasteMerge: "Merge",
    pasteOverwrite: "Overwrite",
    pasteInsert: "Insert",
    addKey: "Add key",
    selectTracks: "Select tracks",
    time: "Time",
    keyParts: "Key parts",
    deleteKey: "Delete key",
    animationSaved: "Saved {name}",
    globalOptions: "Global options",
    targetHeight: "Target height",
    scaleToHeight: "Scale",
    scaleFactor: "Reference scale",
    applyScale: "Apply",
    resetPosition: "Reset position",
    undo: "Undo",
    redo: "Redo",
    connections: "Links",
    filterParts: "Filter",
    missingTextures: "Texture list",
    addTexture: "Add",
    add: "Add",
    delete: "Delete",
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
    freshImport: "Fresh import",
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
    keepMatrix: "Keep matrix",
    trackBinDetails: "Section {section}, angle {angle} deg, index {index}",
    trackBinFlags: "Vertex start {vertexStart}",
    replaceModel: "Replace model",
    replaceKeepSize: "Keep size",
    replaceHint: "Drop obj/mtl or glb/gltf/bin with textures here",
    chooseMd9: "Choose an MD9 or track bin file",
    dropOverlay: "Drop md9 / bin / ani / obj / glb / gltf / texture files",
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
    scaledModelFactor: "Reference scale set to {factor}",
    resetModelPositionDone: "Reset model position",
    undoDone: "Undone",
    redoDone: "Redone",
    importedSkinnedGltf: "Imported {name} as MD9 with {parts} bone parts",
    importNeedsGltf: "Import needs a glb or gltf file",
    importNeedsSkin: "No skinned or rigid mesh found",
    replacementNeedsModel: "Replacement needs an obj, glb, or gltf file",
    replacementNoMesh: "Replacement failed: no usable mesh in the model",
    replacementTooLarge: "Replacement failed: one part has more than 65535 vertices",
    replacedPart: "Replaced part {name}{mtl}",
    readMtl: ", read MTL",
    addedTextures: "Added {count} texture files",
    noSupportedFiles: "No usable model, ani, or texture files",
    loadingModel: "Loading {name}",
    loadFailed: "Load failed: {name}",
    switchedDefaultPose: "Switched to default pose",
    animationLoaded: "Loaded animation {name}",
    animationLoadFailed: "Animation load failed: {name}",
    modelLoaded: "Loaded {name}",
    md9CountMismatch: "MD9 vertex or index count mismatch",
    trackBinLengthMismatch: "Track bin length mismatch",
    trackBinCountMismatch: "Track bin index counts are inconsistent",
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
    textureNamePrompt: "Enter the DDS texture filename to write into the model",
    modelNamePrompt: "Enter the model filename",
    cannotReadTexture: "Cannot read replacement texture",
    ddsPngUnsupported: "PNG atlas saving cannot re-encode DDS in this version. Use png/jpg/webp for replacement mesh textures.",
    helpLoadFailed: "Failed to load help: {message}"
  },
  zh: {
    openFiles: "打开 模型 / 贴图 / 动画",
    openFolder: "打开目录",
    saveMd9: "保存",
    saveAni: "保存",
    currentModel: "当前模型",
    noMd9Loaded: "尚未加载模型",
    clear: "清空",
    currentAnimation: "当前动画",
    defaultPose: "默认姿势",
    autoPlay: "自动播放",
    snapKeys: "吸附",
    rangeStart: "起点",
    rangeEnd: "终点",
    selectAll: "全选",
    selectNone: "全不选",
    copy: "复制",
    cut: "剪切",
    paste: "粘贴",
    pasteTime: "粘贴到",
    pasteMerge: "合并",
    pasteOverwrite: "覆盖",
    pasteInsert: "插入",
    addKey: "添加关键帧",
    selectTracks: "选择轨道",
    time: "时间",
    keyParts: "关键帧部件",
    deleteKey: "删除关键帧",
    animationSaved: "已保存 {name}",
    globalOptions: "全局选项",
    targetHeight: "目标高度",
    scaleToHeight: "缩放",
    scaleFactor: "参考比例",
    applyScale: "应用",
    resetPosition: "重置位置",
    undo: "撤销",
    redo: "重做",
    connections: "连接",
    filterParts: "过滤",
    missingTextures: "贴图列表",
    addTexture: "添加",
    add: "添加",
    delete: "删除",
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
    freshImport: "全新导入",
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
    keepMatrix: "保持 matrix",
    trackBinDetails: "Section {section}，角度 {angle}°，Index {index}",
    trackBinFlags: "顶点起点 {vertexStart}",
    replaceModel: "替换模型",
    replaceKeepSize: "保持大小",
    replaceHint: "可把 obj/mtl 或 glb/gltf/bin 和贴图一起拖入页面",
    chooseMd9: "选择一个 MD9 或赛道 bin 文件",
    dropOverlay: "拖入 md9 / bin / ani / obj / glb / gltf / 贴图文件",
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
    scaledModelFactor: "参考比例已设为 {factor}",
    resetModelPositionDone: "已重置模型位置",
    undoDone: "已撤销",
    redoDone: "已重做",
    importedSkinnedGltf: "已将 {name} 导入为 MD9，共 {parts} 个骨骼部件",
    importNeedsGltf: "导入需要 glb 或 gltf 文件",
    importNeedsSkin: "没有找到蒙皮或刚性 mesh",
    replacementNeedsModel: "替换部件需要 obj、glb 或 gltf 文件",
    replacementNoMesh: "替换失败: 模型中没有可用 mesh",
    replacementTooLarge: "替换失败: 单个部件顶点数超过 65535",
    replacedPart: "已替换部件 {name}{mtl}",
    readMtl: "，已读取 MTL",
    addedTextures: "已加入 {count} 个贴图文件",
    noSupportedFiles: "没有可用的模型、ani 或贴图文件",
    loadingModel: "加载 {name}",
    loadFailed: "加载失败: {name}",
    switchedDefaultPose: "已切换到默认姿势",
    animationLoaded: "已加载动画 {name}",
    animationLoadFailed: "动画加载失败: {name}",
    modelLoaded: "已加载 {name}",
    md9CountMismatch: "MD9 顶点或索引计数不一致",
    trackBinLengthMismatch: "Track bin 文件长度不匹配",
    trackBinCountMismatch: "Track bin index 计数不一致",
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
    textureNamePrompt: "请输入写入模型的 DDS 贴图文件名",
    modelNamePrompt: "请输入模型文件名",
    cannotReadTexture: "无法读取替换贴图",
    ddsPngUnsupported: "第一版保存 PNG atlas 不支持把 DDS 重新编码进 PNG，请为替换 mesh 使用 png/jpg/webp 贴图",
    helpLoadFailed: "使用说明加载失败: {message}"
  },
  es: {
    openFiles: "Abrir modelo / texturas / animaciones",
    openFolder: "Abrir carpeta",
    saveMd9: "Guardar",
    saveAni: "Guardar",
    currentModel: "Modelo actual",
    noMd9Loaded: "No hay modelo cargado",
    clear: "Limpiar",
    currentAnimation: "Animacion actual",
    defaultPose: "Pose predeterminada",
    autoPlay: "Reproduccion automatica",
    snapKeys: "Ajustar",
    rangeStart: "Inicio",
    rangeEnd: "Fin",
    selectAll: "Todo",
    selectNone: "Nada",
    copy: "Copiar",
    cut: "Cortar",
    paste: "Pegar",
    pasteTime: "Pegar en",
    pasteMerge: "Combinar",
    pasteOverwrite: "Sobrescribir",
    pasteInsert: "Insertar",
    addKey: "Agregar key",
    selectTracks: "Elegir pistas",
    time: "Tiempo",
    keyParts: "Partes key",
    deleteKey: "Borrar key",
    animationSaved: "Guardado {name}",
    globalOptions: "Opciones globales",
    targetHeight: "Altura obj.",
    scaleToHeight: "Escalar",
    scaleFactor: "Escala de referencia",
    applyScale: "Aplicar",
    resetPosition: "Restablecer pos.",
    undo: "Deshacer",
    redo: "Rehacer",
    connections: "Enlaces",
    filterParts: "Filtrar",
    missingTextures: "Lista texturas",
    addTexture: "Agregar",
    add: "Agregar",
    delete: "Borrar",
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
    freshImport: "Importar nuevo",
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
    keepMatrix: "Mantener matriz",
    trackBinDetails: "Section {section}, angulo {angle} deg, index {index}",
    trackBinFlags: "Inicio vert. {vertexStart}",
    replaceModel: "Reemplazar modelo",
    replaceKeepSize: "Mantener tamano",
    replaceHint: "Suelta obj/mtl o glb/gltf/bin con texturas aqui",
    chooseMd9: "Elige un archivo MD9 o bin de pista",
    dropOverlay: "Suelta archivos md9 / bin / ani / obj / glb / gltf / texturas",
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
    scaledModelFactor: "Escala de referencia: {factor}",
    resetModelPositionDone: "Posicion del modelo restablecida",
    undoDone: "Deshecho",
    redoDone: "Rehecho",
    importedSkinnedGltf: "Importado {name} como MD9 con {parts} partes de hueso",
    importNeedsGltf: "La importacion necesita un archivo glb o gltf",
    importNeedsSkin: "No se encontro mesh con skin o rigido",
    replacementNeedsModel: "El reemplazo necesita un archivo obj, glb o gltf",
    replacementNoMesh: "Fallo el reemplazo: el modelo no tiene mesh usable",
    replacementTooLarge: "Fallo el reemplazo: una parte supera 65535 vertices",
    replacedPart: "Parte reemplazada {name}{mtl}",
    readMtl: ", MTL leido",
    addedTextures: "Se agregaron {count} texturas",
    noSupportedFiles: "No hay modelos, ani o texturas utilizables",
    loadingModel: "Cargando {name}",
    loadFailed: "Fallo la carga: {name}",
    switchedDefaultPose: "Cambiado a pose predeterminada",
    animationLoaded: "Animacion cargada {name}",
    animationLoadFailed: "Fallo al cargar animacion: {name}",
    modelLoaded: "Cargado {name}",
    md9CountMismatch: "Conteo de vertices o indices MD9 inconsistente",
    trackBinLengthMismatch: "Longitud de track bin no coincide",
    trackBinCountMismatch: "Conteos de index en track bin inconsistentes",
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
    textureNamePrompt: "Introduce el nombre DDS para escribir en el modelo",
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
  cameraDragPointerId: null,
  cameraDragStart: new THREE.Vector2(),
  cameraPointerLocked: false,
  cameraPointerMoved: false,
  lastFrameTime: performance.now(),
  textureFiles: new Map(),
  objectUrls: [],
  currentModel: null,
  currentMd9Id: "",
  currentAnimation: null,
  currentAniId: "",
  animationStartTime: 0,
  animationFrame: 0,
  aniRangeStart: 0,
  aniRangeEnd: 0,
  selectedAniKeyTime: null,
  selectedAniPartName: "",
  draggingAniKeyTime: null,
  draggingAniPartName: "",
  visibleAniTracks: null,
  aniTrackSelectionTouched: false,
  aniTimelineKeyHits: [],
  aniPartKeyTimeCache: new Map(),
  aniTimelineDrawRequest: 0,
  draggingAniEditor: false,
  draggingAniRangeHandle: "",
  draggingAniRangeMove: false,
  aniRangeMoveStartTime: 0,
  aniRangeMoveStartRange: { start: 0, end: 0 },
  aniBatchSelectedTracks: new Set(),
  aniBatchClipboard: null,
  draggingAniBatchEditor: false,
  draggingAniTimelineHeight: false,
  draggingAniSlider: false,
  aniTimelineResizeStartY: 0,
  aniTimelineResizeStartHeight: 0,
  aniEditorDragOffset: { x: 0, y: 0 },
  batchTransformMatrix: new THREE.Matrix4(),
  keepMatrixEditorMatrix: new THREE.Matrix4(),
  keepMatrixEditorPartIndex: -1,
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
el.saveAnimation.addEventListener("click", saveCurrentAnimation);
el.scaleModelHeight.addEventListener("click", scaleCurrentModelToHeight);
el.scaleModelFactor.addEventListener("click", scaleCurrentModelByFactor);
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
el.keepMatrix.addEventListener("change", () => {
  if (!state.currentModel || state.editIndex < 0) return;
  resetKeepMatrixEditor(state.editIndex);
  buildTransformEditor(state.currentModel.submeshes[state.editIndex]);
});
el.replaceMeshInput.addEventListener("change", async () => {
  await replaceEditedPartFromFiles([...el.replaceMeshInput.files]);
  el.replaceMeshInput.value = "";
});
el.autoPlay.addEventListener("change", () => {
  if (el.autoPlay.checked) {
    state.animationStartTime = getNow() - state.animationFrame / ANIMATION_FPS;
  }
});
el.aniSelectTracks.addEventListener("click", openAniTrackDialog);
el.aniBatchEdit.addEventListener("click", openAniBatchEditor);
el.aniBatchClose.addEventListener("click", closeAniBatchEditor);
el.aniBatchSelectAll.addEventListener("click", selectAllAniBatchTracks);
el.aniBatchSelectNone.addEventListener("click", clearAniBatchTracks);
el.aniBatchCopy.addEventListener("click", () => handleAniBatchRangeOperation("copy"));
el.aniBatchCut.addEventListener("click", () => handleAniBatchRangeOperation("remove"));
el.aniBatchDelete.addEventListener("click", () => handleAniBatchRangeOperation("delete"));
el.aniBatchPaste.addEventListener("click", pasteAniBatchClipboard);
el.aniDeleteKey.addEventListener("click", deleteSelectedAniKey);
el.aniPrevKey.addEventListener("click", () => selectAdjacentAniKey(-1));
el.aniNextKey.addEventListener("click", () => selectAdjacentAniKey(1));
el.aniInsertKeyAfter.addEventListener("click", insertAniKeyAfterSelected);
el.aniCloseKeyEditor.addEventListener("click", clearSelectedAniKey);
el.aniTransformEditor.addEventListener("input", handleAniTransformEditorInput);
el.aniKeyTimeInput.addEventListener("change", applyAniKeyTimeInput);
el.aniSnapKeys.addEventListener("input", updateAniSnapGrid);
el.aniSnapStep.addEventListener("input", updateAniSnapGrid);
el.aniTimeline.addEventListener("scroll", scheduleAniTimelineCanvasDraw);
el.aniTimeline.addEventListener("pointermove", updateAniTimelineHoverCursor);
el.aniTimeline.addEventListener("pointerleave", () => {
  el.aniTimeline.style.cursor = "";
});
el.aniTimeSlider.addEventListener("input", () => {
  if (!state.currentAnimation) return;
  el.autoPlay.checked = false;
  applyAnimation(Number(el.aniTimeSlider.value));
  updateAniTimelinePlayback();
});
installAniTimelineHandlers();
installAniKeyEditorDrag();
installAniBatchEditorDrag();
installAniTimelineResize();
installAniSliderHandlers();
installAniRangeBarHandlers();

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
el.trackBinInfo.addEventListener("input", handleTrackBinInfoInput);
el.trackBinInfo.addEventListener("change", handleTrackBinInfoInput);
el.batchEditPanel.addEventListener("input", (event) => {
  if (event.target.matches("[data-transform]")) {
    syncBatchTransformInputPair(event.target);
    applyBatchEditorDelta();
  }
});

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(el.viewport);
resizeObserver.observe(el.viewerCanvas);
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
  const sceneModelFiles = files.filter((file) => isReplacementModelFile(file.name));
  const md9ModelFiles = files.filter((file) => file.name.toLowerCase().endsWith(".md9"));
  const binModelFiles = sceneModelFiles.length ? [] : files.filter((file) => file.name.toLowerCase().endsWith(".bin"));
  const modelFiles = [...md9ModelFiles, ...binModelFiles];
  const aniFiles = files.filter((file) => file.name.toLowerCase().endsWith(".ani"));
  const textureFiles = files.filter((file) => isTextureFile(file.name));
  const replacementModelFiles = sceneModelFiles;

  if (!modelFiles.length && !aniFiles.length && replacementModelFiles.length && state.editIndex >= 0) {
    await replaceEditedPartFromFiles(files);
    return;
  }

  for (const file of modelFiles) addMd9File(file);
  for (const file of aniFiles) addAniFile(file);
  for (const file of textureFiles) {
    state.textureFiles.set(textureKey(file.webkitRelativePath || file.name), file);
  }

  if (modelFiles.length > 0 || aniFiles.length > 0) {
    updateModelSelect();
    updateAnimationSelect();
    if (modelFiles.length > 0) {
      await loadSelectedModel(fileKey(modelFiles[0]));
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
  state.animationFrame = 0;
  state.aniRangeStart = 0;
  state.aniRangeEnd = 0;
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  state.missingTextures = new Set();
  state.undoStack = [];
  state.redoStack = [];
  state.editIndex = -1;
  state.batchSelectedParts = new Set();
  el.saveModel.disabled = true;
  el.saveAnimation.disabled = true;
  el.scaleModelHeight.disabled = true;
  el.scaleModelFactor.disabled = true;
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
  updateModelFormatUi();
  updateReferenceScale();
  el.batchEditPanel.hidden = true;
  setBatchEditToggleActive(false);
  el.submeshList.replaceChildren();
  updateModelSelect();
  updateAnimationSelect();
  updateFrameControls();
  updateMissingTextures(null);
  updateHistoryButtons();
}

function addMd9File(file) {
  const id = fileKey(file);
  const existingIndex = state.md9Files.findIndex((item) => item.id === id);
  const item = {
    id,
    file,
    label: file.webkitRelativePath || file.name,
    format: getModelFileFormat(file.name)
  };
  if (existingIndex >= 0) {
    state.md9Files[existingIndex] = item;
    return;
  }
  state.md9Files.push(item);
}

function getModelFileFormat(name) {
  return String(name || "").toLowerCase().endsWith(".bin") ? TRACK_BIN_FORMAT : MD9_FORMAT;
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
    const model = item.model || parseModelBuffer(await item.file.arrayBuffer(), item.label, "", item.format);
    item.model = model;
    await showModel(model, item.label);
    if (state.currentAnimation && !isTrackBinModel(model)) applyAnimation(0);
  } catch (error) {
    console.error(error);
    setStatus(t("loadFailed", { name: item.label }));
  }
}

function parseModelBuffer(buffer, name, baseDir, format = getModelFileFormat(name)) {
  if (format === TRACK_BIN_FORMAT) return parseTrackBin(buffer, name, baseDir);
  return parseMd9(buffer, name, baseDir);
}

async function loadSelectedAnimation(id) {
  if (isTrackBinModel()) {
    clearActiveAnimationForStaticModel();
    updateAnimationSelect();
    updateFrameControls();
    return;
  }
  if (!id) {
    state.currentAnimation = null;
    state.currentAniId = "";
    state.animationFrame = 0;
    state.selectedAniKeyTime = null;
    state.selectedAniPartName = "";
    state.draggingAniPartName = "";
    state.visibleAniTracks = null;
    state.aniTrackSelectionTouched = false;
    state.aniBatchSelectedTracks = new Set();
    invalidateAniKeyTimeCache();
    el.aniBatchEditor.hidden = true;
    el.animationSelect.value = "";
    el.saveAnimation.disabled = true;
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
    invalidateAniKeyTimeCache();
    state.animationStartTime = getNow();
    state.animationFrame = 0;
    state.aniRangeStart = 0;
    state.aniRangeEnd = item.animation.duration || 0;
    state.selectedAniKeyTime = null;
    state.selectedAniPartName = "";
    state.draggingAniPartName = "";
    state.aniBatchSelectedTracks = new Set();
    el.aniBatchEditor.hidden = true;
    initializeVisibleAniTracks();
    el.saveAnimation.disabled = false;
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
  if (isTrackBinModel(model)) clearActiveAnimationForStaticModel();
  state.editIndex = -1;
  state.highlightedPartIndex = -1;
  state.batchSelectedParts = new Set();
  if (!state.restoringHistory) {
    state.undoStack = [];
    state.redoStack = [];
  }
  el.saveModel.disabled = false;
  el.scaleModelHeight.disabled = false;
  el.scaleModelFactor.disabled = false;
  el.resetModelPosition.disabled = false;
  el.partFilter.disabled = false;
  el.addPart.disabled = false;
  el.duplicatePart.disabled = true;
  el.deletePart.disabled = true;
  populateEditorForNoSelection();
  setEditorEnabled(false);
  updateModelFormatUi();
  updateReferenceScale();
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

    const baseMaterial = materials[part.materialId] || materials[0];
    const meshMaterial = isTrackBinModel(model) && baseMaterial
      ? cloneRenderableMaterial(baseMaterial)
      : baseMaterial;
    if (isTrackBinModel(model) && meshMaterial) {
      meshMaterial.side = part.trackCullFlag === 0 ? THREE.DoubleSide : THREE.FrontSide;
      meshMaterial.transparent = meshMaterial.transparent || part.trackAlphaFlag === 1;
      meshMaterial.alphaTest = part.trackAlphaFlag === 1 ? Math.max(meshMaterial.alphaTest || 0, 0.1) : meshMaterial.alphaTest;
    }
    const mesh = new THREE.Mesh(geometry, meshMaterial);
    mesh.name = part.name;
    mesh.userData.part = part;
    const boneNode = state.boneNodes.get(part.name) || state.root;
    boneNode.add(mesh);
    state.meshEntries.push({ mesh, material: mesh.material, part });
    if (isTrackBinModel(model)) syncTrackPartMeshTransform(state.meshEntries.length - 1);
  }

  rebuildNormalVisualizers();
  state.skeletonLines = isTrackBinModel(model) ? null : createSkeletonLines(model);
  if (state.skeletonLines) state.root.add(state.skeletonLines);

  state.bounds = new THREE.Box3Helper(model.bounds, 0xe5b85b);
  state.root.add(state.bounds);

  rebuildMeshNameLabels();
  populateSubmeshList(model);
  updateStats(model, label);
  updateAnimationSelect();
  updateFrameControls();
  updateReferenceScale();
  frameModel(model.bounds);
  applyOptions();
  updateHighlightInfo();
  updateMissingTextures(model);
  setStatus(t("modelLoaded", { name: label }));
}

function isTrackBinModel(model = state.currentModel) {
  return model?.format === TRACK_BIN_FORMAT;
}

function clearActiveAnimationForStaticModel() {
  state.currentAnimation = null;
  state.currentAniId = "";
  state.animationFrame = 0;
  state.aniRangeStart = 0;
  state.aniRangeEnd = 0;
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  state.draggingAniPartName = "";
  state.visibleAniTracks = null;
  state.aniTrackSelectionTouched = false;
  state.aniBatchSelectedTracks = new Set();
  state.aniBatchClipboard = null;
  invalidateAniKeyTimeCache();
  if (el.aniBatchEditor) el.aniBatchEditor.hidden = true;
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

  const model = { name, baseDir, format: MD9_FORMAT, newFormat, materials, submeshes, totalVertices, totalFaces, bounds, transformSliderScale: 1 };
  captureInitialModelState(model);
  return model;
}

function parseTrackBin(buffer, name, baseDir) {
  const view = new DataView(buffer);
  let offset = 0;
  const readInt = () => {
    const value = view.getInt32(offset, true);
    offset += 4;
    return value;
  };
  const readUint16 = () => {
    const value = view.getUint16(offset, true);
    offset += 2;
    return value;
  };
  const readFloat = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const readTrackTextureName = (length = 64) => {
    const bytes = new Uint8Array(buffer, offset, length);
    const rawBytes = Array.from(bytes);
    offset += length;
    let text = "";
    for (const byte of bytes) {
      if (byte === 0 || byte === 0xcc) break;
      if (byte >= 32 && byte < 127) text += String.fromCharCode(byte);
    }
    return { textureName: text.trim(), rawBytes };
  };

  const materialCount = readInt();
  const materials = [];
  for (let i = 0; i < materialCount; i++) {
    const diffuse = [readFloat(), readFloat(), readFloat(), readFloat()];
    const ambient = [readFloat(), readFloat(), readFloat(), readFloat()];
    const specular = [readFloat(), readFloat(), readFloat(), readFloat()];
    const emissive = [readFloat(), readFloat(), readFloat(), readFloat()];
    const power = readFloat();
    const texture = readTrackTextureName(64);
    materials.push({
      diffuse,
      ambient,
      specular,
      emissive,
      power,
      textureName: texture.textureName,
      trackTextureBytes: texture.rawBytes
    });
  }

  const sectionCount = readInt();
  const sections = [];
  const submeshes = [];
  const bounds = new THREE.Box3();
  const identity = new THREE.Matrix4().identity().toArray();
  let totalVertices = 0;
  let totalFaces = 0;

  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
    const angleRadians = readFloat();
    const vertexCount = readInt();
    const faceCount = readInt();
    totalVertices += vertexCount;
    totalFaces += faceCount;

    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      vertices.push({
        position: [readFloat(), readFloat(), -readFloat()],
        normal: [readFloat(), readFloat(), -readFloat()],
        uv: [readFloat(), readFloat()]
      });
    }

    const allIndices = new Uint16Array(faceCount * 3);
    for (let i = 0; i < allIndices.length; i++) allIndices[i] = readUint16();

    const trackIndexCount = readInt();
    const trackIndices = [];
    let faceCursor = 0;
    let expectedVertexStart = 0;
    for (let trackIndex = 0; trackIndex < trackIndexCount; trackIndex++) {
      const materialId = readInt();
      const trackVertexCount = readInt();
      const trackFaceCount = readInt();
      const vertexStart = readInt();
      const alphaFlag = readInt();
      const cullFlag = readInt();
      const sentinel = readInt();
      if (vertexStart !== expectedVertexStart) throw new Error(t("trackBinCountMismatch"));

      const positions = new Float32Array(trackVertexCount * 3);
      const normals = new Float32Array(trackVertexCount * 3);
      const uvs = new Float32Array(trackVertexCount * 2);
      for (let v = 0; v < trackVertexCount; v++) {
        const source = vertices[vertexStart + v];
        if (!source) throw new Error(t("trackBinCountMismatch"));
        positions[v * 3] = source.position[0];
        positions[v * 3 + 1] = source.position[1];
        positions[v * 3 + 2] = source.position[2];
        normals[v * 3] = source.normal[0];
        normals[v * 3 + 1] = source.normal[1];
        normals[v * 3 + 2] = source.normal[2];
        uvs[v * 2] = source.uv[0];
        uvs[v * 2 + 1] = source.uv[1];
        bounds.expandByPoint(new THREE.Vector3(source.position[0], source.position[1], source.position[2]));
      }

      const indices = new Uint16Array(trackFaceCount * 3);
      for (let i = 0; i < indices.length; i++) {
        const index = allIndices[faceCursor * 3 + i];
        if (index < vertexStart || index >= vertexStart + trackVertexCount) throw new Error(t("trackBinCountMismatch"));
        indices[i] = index - vertexStart;
      }

      const partBox = computeArrayBox(positions);
      const part = {
        name: makeTrackPartName(sectionIndex, trackIndex),
        matrix: [...identity],
        boundingBox: boxToTrackBoundingArray(partBox),
        positions,
        localPositions: positions,
        normals,
        uvs,
        indices,
        materialId,
        parentId: -1,
        bonePosition: new THREE.Vector3(),
        worldBonePosition: new THREE.Vector3(),
        vertexCount: trackVertexCount,
        faceCount: trackFaceCount,
        trackSectionId: sectionIndex,
        trackIndexId: trackIndex,
        trackAngleRadians: angleRadians,
        trackVertexStart: vertexStart,
        trackAlphaFlag: alphaFlag,
        trackCullFlag: cullFlag,
        trackSentinel: sentinel
      };
      submeshes.push(part);
      trackIndices.push(part);
      faceCursor += trackFaceCount;
      expectedVertexStart += trackVertexCount;
    }
    if (faceCursor !== faceCount || expectedVertexStart !== vertexCount) throw new Error(t("trackBinCountMismatch"));
    sections.push({ angleRadians, vertexCount, faceCount, trackIndexCount, trackIndices });
  }

  if (offset !== buffer.byteLength) throw new Error(t("trackBinLengthMismatch"));
  if (bounds.isEmpty()) bounds.set(new THREE.Vector3(), new THREE.Vector3());
  const model = {
    name,
    baseDir,
    format: TRACK_BIN_FORMAT,
    materials,
    submeshes,
    totalVertices,
    totalFaces,
    bounds,
    trackSections: sections,
    transformSliderScale: 1
  };
  captureInitialModelState(model);
  return model;
}

function boxToTrackBoundingArray(box) {
  if (!box || box.isEmpty()) return [0, 0, 0, 0, 0, 0];
  return [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z];
}

function makeTrackPartName(sectionId, trackIndexId) {
  return `section${String(Math.max(0, sectionId | 0)).padStart(2, "0")}_${String(Math.max(0, trackIndexId | 0)).padStart(2, "0")}`;
}

function getNextTrackIndexId(sectionId, excludePart = null) {
  const model = state.currentModel;
  if (!model) return 0;
  let maxIndex = -1;
  for (const part of model.submeshes) {
    if (part === excludePart) continue;
    if (part.trackSectionId === sectionId && Number.isFinite(part.trackIndexId)) {
      maxIndex = Math.max(maxIndex, part.trackIndexId);
    }
  }
  return maxIndex + 1;
}

function captureInitialModelState(model) {
  for (const part of model.submeshes) {
    part.initialState = clonePartState(part);
    part.replacement = null;
  }
}

function clonePartState(part) {
  const clone = {
    name: part.name,
    matrix: part.matrix ? [...part.matrix] : new THREE.Matrix4().identity().toArray(),
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
  copyTrackPartMetadata(part, clone);
  return clone;
}

function copyTrackPartMetadata(source, target) {
  for (const key of [
    "trackSectionId",
    "trackIndexId",
    "trackAngleRadians",
    "trackVertexStart",
    "trackAlphaFlag",
    "trackCullFlag",
    "trackSentinel"
  ]) {
    if (source[key] !== undefined) target[key] = source[key];
  }
}

function cloneModelSnapshot(model) {
  return {
    name: model.name,
    baseDir: model.baseDir,
    format: model.format,
    newFormat: model.newFormat,
    transformSliderScale: model.transformSliderScale || 1,
    materials: model.materials.map(cloneMaterialState),
    submeshes: model.submeshes.map(clonePartForSnapshot),
    trackSections: model.trackSections?.map((section) => ({
      angleRadians: section.angleRadians,
      vertexCount: section.vertexCount,
      faceCount: section.faceCount,
      trackIndexCount: section.trackIndexCount
    })),
    generatedAnimations: model.generatedAnimations || [],
    highlightedPartIndex: state.highlightedPartIndex,
    batchSelectedParts: [...state.batchSelectedParts]
  };
}

function cloneMaterialState(material) {
  const clone = {
    ...material,
    diffuse: material.diffuse ? [...material.diffuse] : [1, 1, 1, 1],
    ambient: material.ambient ? [...material.ambient] : [0, 0, 0, 1],
    specular: material.specular ? [...material.specular] : [0, 0, 0, 1],
    emissive: material.emissive ? [...material.emissive] : [0, 0, 0, 1],
    extra: material.extra ? [...material.extra] : undefined
  };
  if (material.trackTextureBytes) clone.trackTextureBytes = [...material.trackTextureBytes];
  return clone;
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
    model.format = snapshot.format;
    model.newFormat = snapshot.newFormat;
    model.transformSliderScale = snapshot.transformSliderScale || 1;
    model.materials = snapshot.materials.map(cloneMaterialState);
    model.submeshes = snapshot.submeshes.map(clonePartForSnapshot);
    model.trackSections = snapshot.trackSections;
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
    ensureTextureMatrix(texture);
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
      const texture = ensureTextureMatrix(await loadTexture(resolvedTexture.url, resolvedTexture.name));
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

function ensureTextureMatrix(texture) {
  if (texture?.isTexture && !texture.matrix?.elements) texture.matrix = new THREE.Matrix3();
  return texture;
}

async function loadDdsAsCanvasTexture(url, textureName) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const canvas = decodeDdsToCanvas(await response.arrayBuffer());
    const texture = new THREE.CanvasTexture(canvas);
    ensureTextureMatrix(texture);
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
  const worldMatrices = computeModelPartWorldRenderMatrices(model);
  const worldPosition = new THREE.Vector3();
  const parentWorldPosition = new THREE.Vector3();
  for (const [index, part] of model.submeshes.entries()) {
    if (part.parentId < 0) continue;
    const parent = model.submeshes[part.parentId];
    if (!parent) continue;
    parentWorldPosition.setFromMatrixPosition(worldMatrices[part.parentId] || new THREE.Matrix4());
    worldPosition.setFromMatrixPosition(worldMatrices[index] || new THREE.Matrix4());
    positions.push(
      parentWorldPosition.x,
      parentWorldPosition.y,
      parentWorldPosition.z,
      worldPosition.x,
      worldPosition.y,
      worldPosition.z
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffd36a, depthTest: false }));
}

function computeModelPartWorldRenderMatrices(model) {
  const localMatrices = model.submeshes.map((part) => md9ArrayToRenderMatrix(part.matrix));
  const worldMatrices = [];
  const visiting = new Set();
  const getWorld = (index) => {
    if (worldMatrices[index]) return worldMatrices[index];
    if (visiting.has(index)) return new THREE.Matrix4();
    visiting.add(index);
    const part = model.submeshes[index];
    const parentWorld = part?.parentId >= 0 ? getWorld(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, localMatrices[index] || new THREE.Matrix4());
    worldMatrices[index] = world;
    visiting.delete(index);
    return world;
  };
  for (let i = 0; i < model.submeshes.length; i++) getWorld(i);
  return worldMatrices;
}

function createBoneNodes(model) {
  state.boneNodes = new Map();
  for (const part of model.submeshes) {
    const node = new THREE.Group();
    const transform = isTrackBinModel(model)
      ? { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) }
      : getPartTransform(part);
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
  scrollHighlightedPartIntoView(index);
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
  updateModelFormatUi();
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
    state.highlightedHelper.parent?.remove(state.highlightedHelper);
    disposeObject(state.highlightedHelper);
  }
  state.highlightedMaterial?.dispose?.();
  state.highlightedMaterial = null;
  state.highlightedHelper = null;
}

function applyHighlightedMaterial() {
  const entry = state.meshEntries[state.highlightedPartIndex];
  if (!entry?.mesh || !entry.material) return;
  const material = cloneRenderableMaterial(entry.material);
  material.name = `${entry.material.name || entry.part?.name || "part"} highlight`;
  material.color = material.color?.clone?.() || new THREE.Color(0xffffff);
  material.color.lerp(new THREE.Color(PART_HIGHLIGHT_COLOR), 0.65);
  material.wireframe = el.showWireframe.checked;
  material.map = el.showTextures.checked ? getMaterialBaseMap(entry.material) : null;
  material.needsUpdate = true;
  entry.mesh.material = material;
  state.highlightedMaterial = material;
  state.highlightedHelper = isTrackBinModel()
    ? createTrackLocalBoundingBoxHelper(entry.mesh, entry.part, PART_HIGHLIGHT_COLOR)
    : new THREE.BoxHelper(entry.mesh, PART_HIGHLIGHT_COLOR);
  state.highlightedHelper.name = `${entry.part?.name || entry.mesh.name || "part"} highlight bounds`;
  state.highlightedHelper.renderOrder = 999;
  state.highlightedHelper.material.depthTest = false;
  if (isTrackBinModel()) {
    entry.mesh.add(state.highlightedHelper);
  } else {
    scene.add(state.highlightedHelper);
  }
}

function createLocalBoundingBoxHelper(mesh, color) {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox || new THREE.Box3();
  return createBoxLineHelper(box, color);
}

function createTrackLocalBoundingBoxHelper(mesh, part, color) {
  const frame = getTrackPartFrameMatrix(part);
  const inverseFrame = frame.clone().invert();
  const box = new THREE.Box3();
  const position = mesh.geometry.getAttribute("position");
  const point = new THREE.Vector3();
  for (let index = 0; index < position.count; index++) {
    point.fromBufferAttribute(position, index).applyMatrix4(inverseFrame);
    box.expandByPoint(point);
  }
  if (box.isEmpty()) box.set(new THREE.Vector3(), new THREE.Vector3());
  return createBoxLineHelper(box, color, frame);
}

function createBoxLineHelper(box, color, frame = null) {
  const min = box.min;
  const max = box.max;
  const points = [
    min.x, min.y, min.z, max.x, min.y, min.z,
    max.x, min.y, min.z, max.x, max.y, min.z,
    max.x, max.y, min.z, min.x, max.y, min.z,
    min.x, max.y, min.z, min.x, min.y, min.z,
    min.x, min.y, max.z, max.x, min.y, max.z,
    max.x, min.y, max.z, max.x, max.y, max.z,
    max.x, max.y, max.z, min.x, max.y, max.z,
    min.x, max.y, max.z, min.x, min.y, max.z,
    min.x, min.y, min.z, min.x, min.y, max.z,
    max.x, min.y, min.z, max.x, min.y, max.z,
    max.x, max.y, min.z, max.x, max.y, max.z,
    min.x, max.y, min.z, min.x, max.y, max.z
  ];
  if (frame) {
    const point = new THREE.Vector3();
    for (let i = 0; i < points.length; i += 3) {
      point.set(points[i], points[i + 1], points[i + 2]).applyMatrix4(frame);
      points[i] = point.x;
      points[i + 1] = point.y;
      points[i + 2] = point.z;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color, depthTest: false });
  return new THREE.LineSegments(geometry, material);
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

function scrollHighlightedPartIntoView(index = state.highlightedPartIndex) {
  const row = el.submeshList.querySelector(`[data-part-index="${index}"]`);
  row?.scrollIntoView?.({ block: "nearest" });
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
  const detailLine = isTrackBinModel()
    ? `Section: ${entry.part.trackSectionId ?? "-"} | Angle: ${formatNumber(THREE.MathUtils.radToDeg(entry.part.trackAngleRadians || 0))} | Index: ${entry.part.trackIndexId ?? "-"}`
    : `ID: ${state.highlightedPartIndex} | ${t("connections")}: ${degree}`;
  el.highlightInfo.hidden = false;
  el.highlightInfo.innerHTML = `
    <strong>${escapeHtml(entry.part.name)}</strong>
    <div>${escapeHtml(detailLine)} | ${t("vertices")}: ${entry.part.vertexCount} | ${t("faces")}: ${entry.part.faceCount}</div>
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
  updateModelFormatUi(part);
  el.editorName.textContent = part.name;
  el.editName.value = part.name;

  populateEditorMaterialOptions(part.materialId);
  el.editMaterial.value = String(part.materialId);

  populateEditorParentOptions(index);
  el.editParent.value = String(part.parentId);
  el.keepWorldOnParentChange.checked = true;
  if (isTrackBinModel()) {
    el.matrixMode.checked = false;
    el.keepMatrix.checked = false;
  }
  resetKeepMatrixEditor(index);

  buildTransformEditor(part);
}

function updateModelFormatUi(part = null) {
  const track = isTrackBinModel();
  el.editParentLabel.hidden = track;
  el.editParentControl.hidden = track;
  el.matrixModeControl.hidden = track;
  el.keepMatrixControl.hidden = track;
  el.trackBinInfo.hidden = !track || !part;
  el.showSkeleton.disabled = track || !state.currentModel;
  if (track) {
    el.showSkeleton.checked = false;
    if (part) {
      const sectionOptions = buildTrackSectionOptions(part.trackSectionId ?? 0);
      el.trackBinInfo.innerHTML = `
        <div>${escapeHtml(t("trackBinDetails", {
          section: part.trackSectionId ?? "-",
          angle: formatNumber(THREE.MathUtils.radToDeg(part.trackAngleRadians || 0)),
          index: part.trackIndexId ?? "-"
        }))}</div>
        <div>${escapeHtml(t("trackBinFlags", { vertexStart: part.trackVertexStart ?? 0 }))}</div>
        <div class="track-bin-edit-row">
          <label>Section <select data-track-field="section">${sectionOptions}</select></label>
          <label>Alpha <input type="number" min="0" max="1" step="1" value="${Number(part.trackAlphaFlag ?? 0)}" data-track-field="alpha" /></label>
          <label>Cull <input type="number" min="0" max="1" step="1" value="${Number(part.trackCullFlag ?? 1)}" data-track-field="cull" /></label>
        </div>
      `;
    }
  } else if (!state.currentModel) {
    el.showSkeleton.disabled = true;
  } else {
    el.showSkeleton.disabled = false;
  }
}

function buildTrackSectionOptions(selectedSectionId) {
  const maxSectionId = Math.max(31, selectedSectionId, ...((state.currentModel?.submeshes || []).map((part) => part.trackSectionId ?? 0)));
  let html = "";
  for (let index = 0; index <= maxSectionId; index++) {
    html += `<option value="${index}"${index === selectedSectionId ? " selected" : ""}>${index}</option>`;
  }
  return html;
}

function handleTrackBinInfoInput(event) {
  const input = event.target.closest("[data-track-field]");
  if (!input || !isTrackBinModel() || state.editIndex < 0) return;
  const part = state.currentModel.submeshes[state.editIndex];
  if (!part) return;
  pushUndoSnapshot();
  const value = Math.max(0, Math.floor(Number(input.value) || 0));
  if (input.dataset.trackField === "section") {
    const previousSectionId = part.trackSectionId;
    if (previousSectionId !== value) part.trackIndexId = getNextTrackIndexId(value, part);
    part.trackSectionId = value;
    part.trackAngleRadians = state.currentModel.trackSections?.[value]?.angleRadians ?? THREE.MathUtils.degToRad(5.625 + value * 11.25);
    const oldName = part.name;
    part.name = makeTrackPartName(part.trackSectionId, part.trackIndexId);
    const node = state.boneNodes.get(oldName);
    if (node) {
      state.boneNodes.delete(oldName);
      node.name = `${part.name} bone`;
      state.boneNodes.set(part.name, node);
    }
    state.meshEntries[state.editIndex].mesh.name = part.name;
    syncTrackPartNode(part);
    el.editorName.textContent = part.name;
    el.editName.value = part.name;
    const nextIndex = sortTrackPartsForDisplay(part);
    populateSubmeshList(state.currentModel);
    state.editIndex = nextIndex;
    state.highlightedPartIndex = nextIndex;
    updateHighlightedRows();
    scrollHighlightedPartIntoView(nextIndex);
  } else if (input.dataset.trackField === "alpha") {
    part.trackAlphaFlag = value ? 1 : 0;
    applyTrackPartRenderFlags(state.editIndex);
  } else if (input.dataset.trackField === "cull") {
    part.trackCullFlag = value ? 1 : 0;
    applyTrackPartRenderFlags(state.editIndex);
  }
  updateModelFormatUi(part);
  updateHighlightInfo();
}

function sortTrackPartsForDisplay(selectedPart = null) {
  if (!isTrackBinModel() || !state.currentModel) return state.editIndex;
  const pairs = state.currentModel.submeshes.map((part, oldIndex) => ({
    part,
    entry: state.meshEntries[oldIndex],
    oldIndex
  }));
  pairs.sort((a, b) => {
    const sectionDelta = (a.part.trackSectionId ?? 0) - (b.part.trackSectionId ?? 0);
    if (sectionDelta) return sectionDelta;
    const indexDelta = (a.part.trackIndexId ?? 0) - (b.part.trackIndexId ?? 0);
    return indexDelta || a.oldIndex - b.oldIndex;
  });
  let changed = false;
  const oldToNew = new Map();
  for (const [newIndex, pair] of pairs.entries()) {
    oldToNew.set(pair.oldIndex, newIndex);
    if (pair.oldIndex !== newIndex) changed = true;
  }
  if (!changed) return selectedPart ? pairs.findIndex((pair) => pair.part === selectedPart) : state.editIndex;

  state.currentModel.submeshes = pairs.map((pair) => pair.part);
  state.meshEntries = pairs.map((pair) => pair.entry);
  state.batchSelectedParts = new Set([...state.batchSelectedParts]
    .map((oldIndex) => oldToNew.get(oldIndex))
    .filter((index) => Number.isInteger(index)));
  if (state.editIndex >= 0) state.editIndex = oldToNew.get(state.editIndex) ?? -1;
  if (state.highlightedPartIndex >= 0) state.highlightedPartIndex = oldToNew.get(state.highlightedPartIndex) ?? -1;
  rebuildNormalVisualizers();
  rebuildMeshNameLabels();
  return selectedPart ? state.currentModel.submeshes.indexOf(selectedPart) : state.editIndex;
}

function applyTrackPartRenderFlags(index) {
  const part = state.currentModel?.submeshes[index];
  const entry = state.meshEntries[index];
  if (!part || !entry?.material) return;
  entry.material.side = part.trackCullFlag === 0 ? THREE.DoubleSide : THREE.FrontSide;
  entry.material.transparent = entry.material.transparent || part.trackAlphaFlag === 1;
  entry.material.alphaTest = part.trackAlphaFlag === 1 ? Math.max(entry.material.alphaTest || 0, 0.1) : 0;
  entry.material.needsUpdate = true;
}

function cloneRenderableMaterial(material) {
  const clone = material?.clone?.() || new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const sourceBaseMap = getMaterialBaseMap(material);
  if (sourceBaseMap) clone.map = sourceBaseMap;
  clone.userData = { ...(material?.userData || {}) };
  clone.userData.baseMap = sourceBaseMap || getRenderableTexture(clone.map);
  sanitizeMaterialTextures(clone);
  return clone;
}

function sanitizeMaterialTextures(material) {
  if (!material) return;
  const textureSlots = [
    "map",
    "alphaMap",
    "aoMap",
    "bumpMap",
    "displacementMap",
    "emissiveMap",
    "envMap",
    "lightMap",
    "metalnessMap",
    "normalMap",
    "roughnessMap",
    "specularMap"
  ];
  for (const slot of textureSlots) {
    if (slot in material) material[slot] = getRenderableTexture(material[slot]);
  }
  material.userData ||= {};
  material.userData.baseMap = getRenderableTexture(material.userData.baseMap) || material.map || null;
}

function getMaterialBaseMap(material) {
  return getRenderableTexture(material?.userData?.baseMap) || getRenderableTexture(material?.map) || null;
}

function getRenderableTexture(texture) {
  if (!texture || !texture.isTexture) return null;
  return ensureTextureMatrix(texture);
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
    const animations = filterAnimationClipsForGroup(options.animations || [], group);
    const exporter = new GLTFExporter();
    const exportOptions = {
      binary: true,
      embedImages: true
    };
    if (animations.length) exportOptions.animations = animations;
    const result = await new Promise((resolve, reject) => {
      exporter.parse(group, resolve, reject, exportOptions);
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
      const clip = createAnimationClipFromAni(item.animation);
      if (clip?.tracks.length) clips.push(clip);
    } catch (error) {
      console.warn(`ANI export skipped: ${item.label}`, error);
    }
  }
  return clips;
}

function filterAnimationClipsForGroup(clips, group) {
  if (!clips.length) return [];
  const nodeNames = new Set();
  group.traverse((object) => {
    if (object.name) nodeNames.add(object.name);
  });
  const filtered = [];
  for (const clip of clips) {
    const tracks = clip.tracks.filter((track) => {
      const target = parseGltfTrackName(track.name);
      return target.nodeName && nodeNames.has(target.nodeName) && track.times.length > 0 && track.values.length > 0;
    });
    if (!tracks.length) continue;
    filtered.push(new THREE.AnimationClip(clip.name || "animation", clip.duration, tracks));
  }
  return filtered;
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
  ensureTextureMatrix(texture);
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
  const keepMatrix = canKeepMatrixEdit();
  if (el.matrixMode.checked) {
    buildMatrixEditor(keepMatrix ? getKeepMatrixEditorMatrix(part).toArray() : part.matrix);
    return;
  }
  const transform = keepMatrix
    ? decomposeRenderMatrix(getKeepMatrixEditorMatrix(part))
    : getEditorTransform(part);
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

function buildMatrixEditor(matrixArray) {
  const grid = document.createElement("div");
  grid.className = "matrix-editor";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = col * 4 + row;
      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.0001";
      input.value = formatNumber(matrixArray?.[index] ?? (row === col ? 1 : 0));
      input.dataset.matrixIndex = String(index);
      input.setAttribute("aria-label", `m${row}${col}`);
      input.addEventListener("input", applyEditorValues);
      grid.append(input);
    }
  }
  el.transformEditor.append(grid);
}

function canKeepMatrixEdit() {
  return Boolean(el.keepMatrix?.checked && state.currentModel && !isTrackBinModel());
}

function resetKeepMatrixEditor(partIndex = state.editIndex) {
  state.keepMatrixEditorMatrix.identity();
  state.keepMatrixEditorPartIndex = partIndex;
}

function getKeepMatrixEditorMatrix(part) {
  const index = state.currentModel?.submeshes.indexOf(part) ?? state.editIndex;
  if (state.keepMatrixEditorPartIndex !== index) resetKeepMatrixEditor(index);
  return state.keepMatrixEditorMatrix.clone();
}

function getEditorTransform(part) {
  if (!isTrackBinModel() || !part) return getPartTransform(part);
  return decomposeRenderMatrix(new THREE.Matrix4().fromArray(part.matrix || createIdentityMatrixArray()));
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
  const sliderScale = control.transform === "position" ? getTransformPositionScale() : 1;
  const rangeMin = isTrackBinModel() && control.transform === "rotation" ? -720 : control.min;
  const rangeMax = isTrackBinModel() && control.transform === "rotation" ? 720 : control.max;
  const min = Math.min(rangeMin * sliderScale, rawValue);
  const max = Math.max(rangeMax * sliderScale, rawValue);
  input.min = String(min);
  input.max = String(max);
  input.step = String(control.step * sliderScale);
  input.value = formatNumber(rawValue);
  return input;
}

function getTransformPositionScale() {
  return Math.max(0.0001, state.currentModel?.transformSliderScale || 1);
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
  const nextParentId = isTrackBinModel() ? -1 : Number(el.editParent.value);
  if (!isTrackBinModel() && wouldCreateParentCycle(state.editIndex, nextParentId)) {
    part.parentId = previousParentId;
    el.editParent.value = String(previousParentId);
    setStatus("Invalid parent: parent hierarchy cannot contain a cycle.");
    return;
  }
  part.parentId = nextParentId;
  if (part.materialId !== previousMaterialId) {
    const material = findRenderedMaterial(part.materialId, state.editIndex);
    if (material) {
      const entry = state.meshEntries[state.editIndex];
      if (isTrackBinModel()) {
        material.side = part.trackCullFlag === 0 ? THREE.DoubleSide : THREE.FrontSide;
        material.transparent = material.transparent || part.trackAlphaFlag === 1;
        material.alphaTest = part.trackAlphaFlag === 1 ? Math.max(material.alphaTest || 0, 0.1) : material.alphaTest;
      }
      entry.material = entry.mesh.material = material;
    }
  }

  if (el.keepWorldOnParentChange.checked && part.parentId !== previousParentId) {
    const parentWorld = part.parentId >= 0 ? getPartWorldRenderMatrix(part.parentId) : new THREE.Matrix4();
    const nextLocal = new THREE.Matrix4().copy(parentWorld).invert().multiply(previousWorldMatrix);
    part.matrix = renderMatrixToMd9Array(nextLocal);
    buildTransformEditor(part);
  } else if (isTrackBinModel()) {
    applyTrackTransformInputs(part);
    syncTrackPartNode(part);
    syncTrackPartMeshTransform(state.editIndex);
  } else if (canKeepMatrixEdit()) {
    applyKeepMatrixEditorDelta(part, state.editIndex);
    syncPartBone(part);
  } else {
    part.matrix = el.matrixMode.checked ? matrixInputsToMd9Matrix() : transformInputsToMd9Matrix();
    syncPartBone(part);
  }

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

function wouldCreateParentCycle(index, parentId) {
  if (parentId < 0) return false;
  const parts = state.currentModel?.submeshes || [];
  const visited = new Set([index]);
  let cursor = parentId;
  while (cursor >= 0) {
    if (visited.has(cursor)) return true;
    visited.add(cursor);
    const parent = parts[cursor];
    if (!parent) return true;
    cursor = parent.parentId;
  }
  return false;
}

function getPartWorldRenderMatrix(index, cache = new Map(), visiting = new Set()) {
  if (cache.has(index)) return cache.get(index).clone();
  const part = state.currentModel?.submeshes[index];
  if (!part) return new THREE.Matrix4();
  if (visiting.has(index)) throw new Error("Parent hierarchy contains a cycle.");
  visiting.add(index);
  const local = md9ArrayToRenderMatrix(part.matrix);
  const parentWorld = part.parentId >= 0 ? getPartWorldRenderMatrix(part.parentId, cache, visiting) : new THREE.Matrix4();
  const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
  cache.set(index, world.clone());
  visiting.delete(index);
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
  if (isTrackBinModel()) {
    applyIndependentBatchDelta(indices, delta);
  } else if (el.batchGroupTransform.checked) {
    applyGroupBatchDelta(indices, delta);
  } else {
    applyIndependentBatchDelta(indices, delta);
  }
  state.batchTransformMatrix.copy(next);
  updateModelDerivedData();
  if (state.editIndex >= 0) buildTransformEditor(state.currentModel.submeshes[state.editIndex]);
}

function applyIndependentBatchDelta(indices, delta) {
  if (isTrackBinModel()) {
    for (const index of indices) {
      const part = state.currentModel.submeshes[index];
      const current = new THREE.Matrix4().fromArray(part.matrix || createIdentityMatrixArray());
      const updated = new THREE.Matrix4().multiplyMatrices(current, delta);
      part.matrix = updated.toArray();
      syncTrackPartNode(part);
      syncTrackPartMeshTransform(index);
    }
    return;
  }
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
  return renderMatrixToMd9Array(transformInputsToRenderMatrix());
}

function transformInputsToRenderMatrix() {
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
  return new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
}

function trackTransformInputsToMatrix() {
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
  return new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);
}

function applyTrackTransformInputs(part) {
  const editorMatrix = trackTransformInputsToMatrix();
  part.matrix = editorMatrix.toArray();
}

function applyKeepMatrixEditorDelta(part, index) {
  if (!part) return;
  if (state.keepMatrixEditorPartIndex !== index) resetKeepMatrixEditor(index);
  const nextEditorMatrix = el.matrixMode.checked ? matrixInputsToRenderMatrix() : transformInputsToRenderMatrix();
  const previousInverse = state.keepMatrixEditorMatrix.clone().invert();
  const delta = new THREE.Matrix4().multiplyMatrices(nextEditorMatrix, previousInverse);
  if (!isApproximatelyIdentityMatrix(delta)) {
    bakePartLocalTransform(part, delta);
    updatePartGeometryAttributes(index);
  }
  state.keepMatrixEditorMatrix.copy(nextEditorMatrix);
}

function bakePartLocalTransform(part, transform) {
  const point = new THREE.Vector3();
  for (let i = 0; i < part.localPositions.length; i += 3) {
    point
      .set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2])
      .applyMatrix4(transform);
    part.localPositions[i] = point.x;
    part.localPositions[i + 1] = point.y;
    part.localPositions[i + 2] = point.z;
  }

  const normalMatrix = new THREE.Matrix3().getNormalMatrix(transform);
  const normal = new THREE.Vector3();
  for (let i = 0; i < part.normals.length; i += 3) {
    normal
      .set(part.normals[i], part.normals[i + 1], part.normals[i + 2])
      .applyMatrix3(normalMatrix)
      .normalize();
    part.normals[i] = normal.x;
    part.normals[i + 1] = normal.y;
    part.normals[i + 2] = normal.z;
  }
}

function isApproximatelyIdentityMatrix(matrix, epsilon = 1e-10) {
  const identity = createIdentityMatrixArray();
  const elements = matrix.elements;
  for (let i = 0; i < 16; i++) {
    if (Math.abs(elements[i] - identity[i]) > epsilon) return false;
  }
  return true;
}

function updatePartGeometryAttributes(index) {
  const entry = state.meshEntries[index];
  const part = state.currentModel?.submeshes[index];
  const geometry = entry?.mesh?.geometry;
  if (!part || !geometry) return;
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  geometry.computeBoundingSphere();
  if (el.showNormals.checked) rebuildNormalVisualizers();
  if (index === state.highlightedPartIndex) refreshHighlightedMaterial();
}

function getTrackPartWorldTransform(part, editorMatrix = null) {
  const frame = getTrackPartFrameMatrix(part);
  const inverseFrame = frame.clone().invert();
  return new THREE.Matrix4()
    .multiplyMatrices(frame, editorMatrix || new THREE.Matrix4().fromArray(part.matrix || createIdentityMatrixArray()))
    .multiply(inverseFrame);
}

function syncTrackPartMeshTransform(index) {
  const part = state.currentModel?.submeshes[index];
  const entry = state.meshEntries[index];
  if (!part || !entry?.mesh) return;
  entry.mesh.matrixAutoUpdate = false;
  entry.mesh.matrix.copy(getTrackPartWorldTransform(part));
  entry.mesh.matrixWorldNeedsUpdate = true;
}

function matrixInputsToMd9Matrix() {
  return matrixInputsToRenderMatrix().toArray();
}

function matrixInputsToRenderMatrix() {
  const matrix = createIdentityMatrixArray();
  matrix[0] = 1;
  matrix[5] = 1;
  matrix[10] = 1;
  matrix[15] = 1;
  for (const input of el.transformEditor.querySelectorAll("[data-matrix-index]")) {
    matrix[Number(input.dataset.matrixIndex)] = Number(input.value) || 0;
  }
  return new THREE.Matrix4().fromArray(matrix);
}

function findRenderedMaterial(materialId, excludeIndex = -1) {
  const match = state.meshEntries.find((entry, index) => index !== excludeIndex && entry.part.materialId === materialId && entry.material);
  if (match) return isTrackBinModel() ? cloneRenderableMaterial(match.material) : match.material;
  const material = state.currentModel?.materials[materialId];
  if (!material) return null;
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(material.diffuse[0] || 0.72, material.diffuse[1] || 0.72, material.diffuse[2] || 0.72),
    side: THREE.DoubleSide
  });
}

function syncPartBone(part) {
  const transform = isTrackBinModel()
    ? { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) }
    : getPartTransform(part);
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

function syncTrackPartNode(part) {
  part.bonePosition.set(0, 0, 0);
  part.worldBonePosition.set(0, 0, 0);
  const node = state.boneNodes.get(part.name);
  if (!node) return;
  reparentPartNode(part, node);
  node.matrixAutoUpdate = true;
  node.position.set(0, 0, 0);
  node.quaternion.identity();
  node.scale.set(1, 1, 1);
  node.userData.defaultPosition.set(0, 0, 0);
  node.userData.defaultQuaternion.identity();
  node.userData.defaultScale.set(1, 1, 1);
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
  return decomposeRenderMatrix(renderMatrix);
}

function decomposeRenderMatrix(renderMatrix) {
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

function getTrackPartFrameMatrix(part) {
  const angle = part?.trackAngleRadians || 0;
  const axis = new THREE.Vector3(1, 0, 0);
  const radial = new THREE.Vector3(0, Math.cos(angle), -Math.sin(angle));
  const tangent = new THREE.Vector3(0, -Math.sin(angle), -Math.cos(angle));
  return new THREE.Matrix4().makeBasis(axis, radial, tangent);
}

function createTrackNewPartMatrix(part, sourcePart = null) {
  const sourceBox = sourcePart ? computeArrayBox(sourcePart.localPositions) : null;
  const sourceCenter = sourceBox && !sourceBox.isEmpty()
    ? sourceBox.getCenter(new THREE.Vector3()).applyMatrix4(getTrackPartWorldTransform(sourcePart))
    : new THREE.Vector3();
  const localCenter = sourceCenter.applyMatrix4(getTrackPartFrameMatrix(part).clone().invert());
  return new THREE.Matrix4().setPosition(localCenter).toArray();
}

function md9ArrayToRenderMatrix(matrixArray) {
  if (!matrixArray || matrixArray.length < 16) return new THREE.Matrix4();
  const md9Matrix = new THREE.Matrix4().fromArray(matrixArray);
  return new THREE.Matrix4().multiplyMatrices(FLIP_Z_MATRIX, md9Matrix).multiply(FLIP_Z_MATRIX);
}

function renderMatrixToMd9Array(renderMatrix) {
  if (!renderMatrix || !renderMatrix.elements) return new THREE.Matrix4().identity().toArray();
  return new THREE.Matrix4().multiplyMatrices(FLIP_Z_MATRIX, renderMatrix).multiply(FLIP_Z_MATRIX).toArray();
}

function createIdentityMatrixArray() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function addPart() {
  if (!state.currentModel || !state.root) return;
  pushUndoSnapshot();
  const sourceIndex = state.highlightedPartIndex >= 0 ? state.highlightedPartIndex : state.editIndex;
  const sourcePart = state.currentModel.submeshes[sourceIndex];
  const trackSectionId = isTrackBinModel() ? (sourcePart?.trackSectionId ?? 0) : -1;
  const trackIndexId = isTrackBinModel() ? getNextTrackIndexId(trackSectionId) : -1;
  const name = isTrackBinModel() ? makeTrackPartName(trackSectionId, trackIndexId) : makeUniqueNewPartName();
  const parentId = isTrackBinModel() ? -1 : (state.editIndex >= 0 ? state.editIndex : -1);
  const parentPart = state.currentModel.submeshes[parentId];
  const size = getAveragePartSize();
  const half = size * 0.5;
  const cube = createCubeMeshData(half);
  const part = {
    name,
    matrix: createIdentityMatrixArray(),
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
  if (isTrackBinModel()) {
    part.trackSectionId = trackSectionId;
    part.trackIndexId = trackIndexId;
    part.trackAngleRadians = sourcePart?.trackAngleRadians ?? state.currentModel.trackSections?.[part.trackSectionId]?.angleRadians ?? THREE.MathUtils.degToRad(5.625);
    part.matrix = createTrackNewPartMatrix(part, sourcePart);
    part.trackVertexStart = 0;
    part.trackAlphaFlag = 0;
    part.trackCullFlag = 1;
    part.trackSentinel = TRACK_BIN_RANGE_SENTINEL;
  }
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
  const baseMaterial = state.meshEntries[0]?.material || new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const material = isTrackBinModel() ? cloneRenderableMaterial(baseMaterial) : baseMaterial;
  if (isTrackBinModel()) material.side = THREE.FrontSide;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = part.name;
  mesh.userData.part = part;
  node.add(mesh);
  state.meshEntries.push({ mesh, material, part });
  if (isTrackBinModel()) syncTrackPartMeshTransform(state.meshEntries.length - 1);

  state.editIndex = isTrackBinModel() ? sortTrackPartsForDisplay(part) : state.currentModel.submeshes.length - 1;
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
  const duplicateTrackIndexId = isTrackBinModel() ? getNextTrackIndexId(sourcePart.trackSectionId ?? 0) : -1;
  const part = {
    name: isTrackBinModel() ? makeTrackPartName(sourcePart.trackSectionId ?? 0, duplicateTrackIndexId) : makeUniqueCopyPartName(sourcePart.name),
    matrix: isTrackBinModel() ? createIdentityMatrixArray() : (sourcePart.matrix ? [...sourcePart.matrix] : createIdentityMatrixArray()),
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
  copyTrackPartMetadata(sourcePart, part);
  if (isTrackBinModel()) {
    part.parentId = -1;
    part.trackIndexId = duplicateTrackIndexId;
  }
  part.initialState = clonePartState(part);
  state.currentModel.submeshes.push(part);

  const transform = isTrackBinModel()
    ? { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) }
    : getPartTransform(part);
  const node = new THREE.Group();
  node.name = `${part.name} bone`;
  node.position.copy(transform.position);
  node.quaternion.copy(transform.quaternion);
  node.scale.copy(transform.scale);
  node.userData.defaultPosition = transform.position.clone();
  node.userData.defaultQuaternion = transform.quaternion.clone();
  node.userData.defaultScale = transform.scale.clone();
  state.boneNodes.set(part.name, node);
  const parentPart = isTrackBinModel() ? null : state.currentModel.submeshes[part.parentId];
  (parentPart ? state.boneNodes.get(parentPart.name) : state.root)?.add(node);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(part.localPositions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(part.normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.setIndex(new THREE.Uint16BufferAttribute(part.indices, 1));
  geometry.computeBoundingSphere();
  const sourceMaterial = sourceEntry.material || sourceEntry.mesh?.material || state.meshEntries[0]?.material || new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const material = isTrackBinModel() ? cloneRenderableMaterial(sourceMaterial) : sourceMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = part.name;
  mesh.userData.part = part;
  node.add(mesh);
  state.meshEntries.push({ mesh, material, part });
  if (isTrackBinModel()) syncTrackPartMeshTransform(state.meshEntries.length - 1);

  const newIndex = isTrackBinModel() ? sortTrackPartsForDisplay(part) : state.currentModel.submeshes.length - 1;
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
  if (isTrackBinModel()) {
    syncTrackPartNode(part);
  } else {
    syncPartBone(part);
  }
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
  copyTrackPartMetadata(snapshot, part);
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
    if (state.currentModel && !isTrackBinModel() && !el.skinFreshImport.checked) {
      await appendImportedMd9Model(model);
      setStatus(t("importedSkinnedGltf", { name: modelFile.name, parts: model.submeshes.length }));
      return;
    }
    const id = `generated:${model.name}:${Date.now()}`;
    state.md9Files.push({ id, label: model.name, model, format: MD9_FORMAT });
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

async function appendImportedMd9Model(importedModel) {
  const target = state.currentModel;
  if (!target || isTrackBinModel(target)) return;
  pushUndoSnapshot();
  const materialOffset = target.materials.length;
  const partOffset = target.submeshes.length;
  const usedNames = new Set(target.submeshes.map((part) => part.name.toLowerCase()));
  const nameMap = new Map();

  for (const material of importedModel.materials) {
    target.materials.push(cloneMaterialState(material));
  }
  for (const part of importedModel.submeshes) {
    const clone = clonePartForSnapshot(part);
    const uniqueName = makeUniqueAppendedPartName(part.name, usedNames);
    usedNames.add(uniqueName.toLowerCase());
    nameMap.set(part.name, uniqueName);
    clone.name = uniqueName;
    clone.materialId = materialOffset + (part.materialId || 0);
    clone.parentId = part.parentId >= 0 ? partOffset + part.parentId : -1;
    clone.initialState = clonePartState(clone);
    target.submeshes.push(clone);
  }

  const usedAnimationNames = new Set((target.generatedAnimations || []).map((animation) => String(animation.name || "").toLowerCase()));
  const importedAnimations = cloneImportedAnimations(importedModel.generatedAnimations || [], nameMap, usedAnimationNames);
  target.generatedAnimations = [...(target.generatedAnimations || []), ...importedAnimations];
  updateGeneratedModelCounts(target);
  addGeneratedAnimationsToState(target);
  state.restoringHistory = true;
  try {
    await showModel(target, target.name);
  } finally {
    state.restoringHistory = false;
    updateHistoryButtons();
  }
  state.editIndex = partOffset < target.submeshes.length ? partOffset : -1;
  if (state.editIndex >= 0) {
    setHighlightedPart(state.editIndex);
    buildTransformEditor(target.submeshes[state.editIndex]);
    setEditorEnabled(true);
  }
  if (state.currentAnimation) applyAnimation(state.animationFrame);
}

function makeUniqueAppendedPartName(name, usedNames) {
  const base = sanitizeFilename(name || "imported_part").slice(0, 31) || "imported_part";
  let candidate = base;
  let suffix = 1;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = sanitizeFilename(`${base}_${suffix++}`).slice(0, 31) || `imported_${suffix}`;
  }
  return candidate;
}

function cloneImportedAnimations(animations, nameMap, usedNames = new Set()) {
  return animations.map((animation) => ({
    name: makeUniqueAnimationName(animation.name || "animation.ani", usedNames),
    duration: animation.duration,
    tracks: new Map([...animation.tracks.entries()].map(([partName, track]) => [
      nameMap.get(partName) || partName,
      {
        boneName: nameMap.get(track.boneName) || nameMap.get(partName) || track.boneName,
        positions: cloneAniKeyArray(track.positions),
        rotations: cloneAniKeyArray(track.rotations),
        scales: cloneAniKeyArray(track.scales)
      }
    ]))
  }));
}

function makeUniqueAnimationName(name, usedNames) {
  const hasExtension = /\.ani$/i.test(name);
  const base = sanitizeFilename(String(name || "animation").replace(/\.ani$/i, "")) || "animation";
  let candidate = hasExtension ? `${base}.ani` : base;
  let suffix = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${base}_${suffix++}${hasExtension ? ".ani" : ""}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function cloneAniKeyArray(keys = []) {
  return keys.map((key) => ({ time: key.time, value: cloneAniKeyValue(key.value) }));
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
  if (isTrackBinModel()) {
    normalizeTrackReplacementToPart(replacement, part, { keepSize: options.keepSize });
  } else {
    normalizeReplacementToPart(replacement, part, { keepSize: options.keepSize });
  }

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
  part.boundingBox = isTrackBinModel()
    ? boxToTrackBoundingArray(computeArrayBox(part.localPositions))
    : part.boundingBox;
  if (isTrackBinModel()) {
    const entry = state.meshEntries[partIndex];
    if (entry?.material) {
      entry.material.side = part.trackCullFlag === 0 ? THREE.DoubleSide : THREE.FrontSide;
      entry.material.transparent = entry.material.transparent || part.trackAlphaFlag === 1;
      entry.material.alphaTest = part.trackAlphaFlag === 1 ? Math.max(entry.material.alphaTest || 0, 0.1) : entry.material.alphaTest;
    }
  }
  updatePartGeometry(partIndex);
  if (isTrackBinModel()) syncTrackPartMeshTransform(partIndex);
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
  const builder = createIndexedGeometryBuilder();
  const zeroUv = new THREE.Vector2();
  root.updateMatrixWorld(true);
  root.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    const geometry = object.geometry.getAttribute("normal") ? object.geometry : object.geometry.clone();
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    appendIndexedMeshGeometry(object, geometry, builder, null, null, files, zeroUv);
    if (geometry !== object.geometry) geometry.dispose();
  });
  const replacementGeometry = finalizeIndexedGeometryBuilder(builder);
  return {
    positions: replacementGeometry.positions,
    normals: replacementGeometry.normals,
    uvs: replacementGeometry.uvs,
    indices: replacementGeometry.indices,
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
  const builder = createIndexedGeometryBuilder();
  const zeroUv = new THREE.Vector2();
  let firstMaterial = null;
  let textureImage = null;
  let textureFile = null;
  const textureSources = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;
    if (object.isSkinnedMesh) object.skeleton?.update();
    if (!firstMaterial) {
      firstMaterial = Array.isArray(object.material) ? object.material[0] : object.material;
      textureImage = firstMaterial?.map?.image || null;
      textureFile = findTextureFileForMaterial(firstMaterial, files);
    }
    appendGltfMesh(object, files, builder, textureSources, zeroUv);
  });
  const replacementGeometry = finalizeIndexedGeometryBuilder(builder);
  return {
    positions: replacementGeometry.positions,
    normals: replacementGeometry.normals,
    uvs: replacementGeometry.uvs,
    indices: replacementGeometry.indices,
    material: firstMaterial,
    textureFile,
    textureImage,
    textureSources,
    uvSourceIds: replacementGeometry.uvSourceIds
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
  if (!skinnedMeshes.length || !boneSet.size) return createMd9FromRigidGltf(gltf, modelFile, files);

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
    ensureTextureMatrix(previewTexture);
    previewTexture.colorSpace = THREE.SRGBColorSpace;
    previewTexture.flipY = false;
    previewTexture.wrapS = THREE.ClampToEdgeWrapping;
    previewTexture.wrapT = THREE.ClampToEdgeWrapping;
    previewTexture.userData.hasAlpha = atlas.hasAlpha;
  }
  for (const bucket of activeBuckets) compactPartBucketVertices(bucket);

  const materials = [material];
  const submeshes = bones.map((bone, index) => createMd9PartFromBone(bone, index, pruned.parentIds[index], bones, activeBuckets[index]));
  promoteImportedRootPart(submeshes);
  const model = {
    name: `${modelFile.name.replace(/\.[^.]+$/, "")}.md9`,
    baseDir: "",
    format: MD9_FORMAT,
    newFormat: true,
    materials,
    submeshes,
    totalVertices: 0,
    totalFaces: 0,
    bounds: new THREE.Box3(),
    transformSliderScale: 1,
    generatedAnimations: createAniAnimationsFromGltf(gltf, bones)
  };
  captureInitialModelState(model);
  updateGeneratedModelCounts(model);
  if (previewTexture) {
    ensureTextureMatrix(previewTexture);
    model.materials[0].atlasSourceImage = material.atlasSourceImage;
    model.materials[0].atlasHasAlpha = material.atlasHasAlpha;
  }
  return model;
}

async function createMd9FromRigidGltf(gltf, modelFile, files) {
  const meshObjects = [];
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((object) => {
    if (object.isMesh && object.geometry) meshObjects.push(object);
  });
  if (!meshObjects.length) throw new Error(t("importNeedsSkin"));

  const partNodes = collectRigidImportPartNodes(gltf.scene, meshObjects);
  const nodeToIndex = new Map(partNodes.map((node, index) => [node, index]));
  const buckets = partNodes.map(() => createPartBucket());
  const textureSources = [];
  const vertexRefSources = [];
  const zeroUv = new THREE.Vector2();

  for (const mesh of meshObjects) {
    const partNode = getRigidImportPartNode(mesh);
    const partIndex = nodeToIndex.get(partNode);
    if (partIndex === undefined) continue;
    appendRigidMeshToPartBucket(mesh, partNode, buckets[partIndex], partIndex, files, textureSources, vertexRefSources, zeroUv);
  }

  let material = createMd9MaterialFromThree(null, "", null, { newFormat: true });
  let previewTexture = null;
  if (textureSources.length) {
    const atlas = await buildTextureAtlas(textureSources);
    material = createMd9MaterialFromThree(null, makePartTextureName(modelFile.name.replace(/\.[^.]+$/, "")), null, { newFormat: true });
    material.atlasSourceImage = atlas.canvas;
    material.atlasHasAlpha = atlas.hasAlpha;
    for (const ref of vertexRefSources) {
      const source = textureSources[ref.sourceId];
      if (!source?.rect) continue;
      const remapped = remapSourceUvToAtlas(source, ref.u, ref.v, atlas.canvas.width, atlas.canvas.height);
      buckets[ref.partIndex].uvs[ref.uvOffset] = remapped.u;
      buckets[ref.partIndex].uvs[ref.uvOffset + 1] = remapped.v;
    }
    previewTexture = new THREE.CanvasTexture(atlas.canvas);
    ensureTextureMatrix(previewTexture);
    previewTexture.colorSpace = THREE.SRGBColorSpace;
    previewTexture.flipY = false;
    previewTexture.wrapS = THREE.ClampToEdgeWrapping;
    previewTexture.wrapT = THREE.ClampToEdgeWrapping;
    previewTexture.userData.hasAlpha = atlas.hasAlpha;
  }
  for (const bucket of buckets) compactPartBucketVertices(bucket);

  const usedNames = new Set();
  const rigidParts = buildRigidImportParts(partNodes, buckets, usedNames);
  const submeshes = rigidParts.map((part) => part.submesh);
  const nodeNameToPartName = new Map(rigidParts.map((part) => [part.node.name, part.submesh.name]));
  const model = {
    name: `${modelFile.name.replace(/\.[^.]+$/, "")}.md9`,
    baseDir: "",
    format: MD9_FORMAT,
    newFormat: true,
    materials: [material],
    submeshes,
    totalVertices: 0,
    totalFaces: 0,
    bounds: new THREE.Box3(),
    transformSliderScale: 1,
    generatedAnimations: createAniAnimationsFromGltf(gltf, partNodes, nodeNameToPartName)
  };
  captureInitialModelState(model);
  updateGeneratedModelCounts(model);
  if (previewTexture) {
    ensureTextureMatrix(previewTexture);
    model.materials[0].atlasSourceImage = material.atlasSourceImage;
    model.materials[0].atlasHasAlpha = material.atlasHasAlpha;
  }
  return model;
}

function buildRigidImportParts(partNodes, buckets, usedNames) {
  const keptNodeToNewIndex = new Map();
  const kept = [];
  for (const [oldIndex, node] of partNodes.entries()) {
    if (!buckets[oldIndex]?.positions?.length) continue;
    keptNodeToNewIndex.set(node, kept.length);
    kept.push({ oldIndex, node });
  }
  if (!kept.length) throw new Error(t("importNeedsSkin"));
  const keptNodes = kept.map((item) => item.node);
  return kept.map((item, newIndex) => {
    const parentId = getRigidImportNearestKeptParentId(item.node, keptNodeToNewIndex);
    return {
      node: item.node,
      submesh: createMd9PartFromRigidNode(
        item.node,
        newIndex,
        parentId,
        keptNodes,
        buckets[item.oldIndex],
        usedNames
      )
    };
  });
}

function getRigidImportNearestKeptParentId(node, keptNodeToNewIndex) {
  let parent = node.parent;
  while (parent) {
    const index = keptNodeToNewIndex.get(parent);
    if (index !== undefined) return index;
    parent = parent.parent;
  }
  return -1;
}

function collectRigidImportPartNodes(sceneRoot, meshObjects) {
  const meshPartNodes = new Set(meshObjects.map(getRigidImportPartNode));
  const candidateRoots = findRigidImportCandidateRoots(meshPartNodes);
  const partNodes = [];
  const add = (node) => {
    if (!node || node.isScene || partNodes.includes(node)) return;
    partNodes.push(node);
  };
  for (const root of candidateRoots) {
    root.traverse((node) => {
      if (node === root && root.name === "md9_export") return;
      if (node.isScene) return;
      const hasPartMesh = !node.isMesh && node.children.some((child) => child.isMesh && meshPartNodes.has(node));
      const hasPartDescendant = !node.isMesh && node.children.some((child) => !child.isMesh);
      if (hasPartMesh || hasPartDescendant || meshPartNodes.has(node)) add(node);
    });
  }
  for (const node of meshPartNodes) add(node);
  if (partNodes.length) return partNodes;
  return meshObjects.map((mesh) => mesh);
}

function findRigidImportCandidateRoots(meshPartNodes) {
  const roots = new Set();
  for (const node of meshPartNodes) {
    let root = node;
    while (root.parent && !root.parent.isScene) {
      if (root.parent.name === "md9_export") break;
      root = root.parent;
    }
    if (root.name === "md9_export") {
      for (const child of root.children) {
        if (!child.isMesh) roots.add(child);
      }
    } else {
      roots.add(root);
    }
  }
  return [...roots];
}

function getRigidImportPartNode(mesh) {
  const parent = mesh.parent;
  if (parent && !parent.isScene && !parent.isMesh && parent.name !== "md9_export") {
    return parent;
  }
  return mesh;
}

function getRigidImportParentId(node, nodeToIndex) {
  let parent = node.parent;
  while (parent) {
    const index = nodeToIndex.get(parent);
    if (index !== undefined) return index;
    parent = parent.parent;
  }
  return -1;
}

function appendRigidMeshToPartBucket(mesh, partNode, bucket, partIndex, files, textureSources, vertexRefSources, zeroUv) {
  const geometry = mesh.geometry.getAttribute("normal") ? mesh.geometry : mesh.geometry.clone();
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  if (!position || !normal) return;
  const index = geometry.getIndex();
  const drawCount = index ? index.count : position.count;
  const materialForDraw = buildMaterialDrawLookup(geometry, mesh.material);
  const inversePartWorld = new THREE.Matrix4().copy(partNode.matrixWorld).invert();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(new THREE.Matrix4().multiplyMatrices(inversePartWorld, mesh.matrixWorld));
  const vertex = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();
  for (let drawIndex = 0; drawIndex < drawCount; drawIndex += 3) {
    const start = bucket.positions.length / 3;
    const sourceId = registerTextureSource(textureSources, materialForDraw(drawIndex), files);
    for (let corner = 0; corner < 3; corner++) {
      const vertexIndex = index ? index.getX(drawIndex + corner) : drawIndex + corner;
      vertex
        .fromBufferAttribute(position, vertexIndex)
        .applyMatrix4(mesh.matrixWorld)
        .applyMatrix4(inversePartWorld);
      vertexNormal
        .fromBufferAttribute(normal, vertexIndex)
        .applyMatrix3(normalMatrix)
        .normalize();
      bucket.positions.push(vertex.x, vertex.y, vertex.z);
      bucket.normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
      const u = uv ? uv.getX(vertexIndex) : zeroUv.x;
      const v = uv ? uv.getY(vertexIndex) : zeroUv.y;
      const uvOffset = bucket.uvs.length;
      bucket.uvs.push(u, v);
      if (sourceId >= 0) vertexRefSources.push({ partIndex, uvOffset, sourceId, u: wrapUv(u), v: wrapUv(v) });
    }
    bucket.indices.push(start, start + 1, start + 2);
    bucket.triangleInfluences.push(null);
    bucket.triangleSourceIds.push(sourceId);
  }
  if (geometry !== mesh.geometry) geometry.dispose();
}

function createMd9PartFromRigidNode(node, index, parentId, nodes, bucket, usedNames) {
  ensureNonEmptyBucket(bucket);
  if (bucket.positions.length / 3 > 65535) throw new Error(t("replacementTooLarge"));
  const parentWorld = parentId >= 0 ? nodes[parentId].matrixWorld : new THREE.Matrix4();
  const localMatrix = parentId >= 0
    ? new THREE.Matrix4().copy(parentWorld).invert().multiply(node.matrixWorld)
    : new THREE.Matrix4().copy(node.matrixWorld);
  const positions = new Float32Array(bucket.positions);
  const normals = new Float32Array(bucket.normals);
  const uvs = new Float32Array(bucket.uvs);
  const indices = new Uint16Array(bucket.indices);
  const box = computeArrayBox(positions);
  return {
    name: makeUniqueImportedPartName(node.name || `part_${index}`, index, usedNames),
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
    worldBonePosition: new THREE.Vector3().setFromMatrixPosition(node.matrixWorld),
    importWasEmpty: false,
    replacement: null
  };
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

function compactPartBucketVertices(bucket) {
  if (!bucket?.positions?.length || !bucket?.indices?.length) return;
  const vertexMap = new Map();
  const oldToNew = new Map();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const getNewIndex = (oldVertex) => {
    const key = [
      quantizeVertexValue(bucket.positions[oldVertex * 3]),
      quantizeVertexValue(bucket.positions[oldVertex * 3 + 1]),
      quantizeVertexValue(bucket.positions[oldVertex * 3 + 2]),
      quantizeVertexValue(bucket.normals[oldVertex * 3]),
      quantizeVertexValue(bucket.normals[oldVertex * 3 + 1]),
      quantizeVertexValue(bucket.normals[oldVertex * 3 + 2]),
      quantizeVertexValue(bucket.uvs[oldVertex * 2]),
      quantizeVertexValue(bucket.uvs[oldVertex * 2 + 1])
    ].join("|");
    const existing = vertexMap.get(key);
    if (existing !== undefined) return existing;
    const next = positions.length / 3;
    vertexMap.set(key, next);
    positions.push(bucket.positions[oldVertex * 3], bucket.positions[oldVertex * 3 + 1], bucket.positions[oldVertex * 3 + 2]);
    normals.push(bucket.normals[oldVertex * 3], bucket.normals[oldVertex * 3 + 1], bucket.normals[oldVertex * 3 + 2]);
    uvs.push(bucket.uvs[oldVertex * 2], bucket.uvs[oldVertex * 2 + 1]);
    return next;
  };
  for (const oldVertex of bucket.indices) {
    if (!oldToNew.has(oldVertex)) oldToNew.set(oldVertex, getNewIndex(oldVertex));
    indices.push(oldToNew.get(oldVertex));
  }
  bucket.positions = positions;
  bucket.normals = normals;
  bucket.uvs = uvs;
  bucket.indices = indices;
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
  validateParentHierarchy(submeshes);
  const cache = new Map();
  const visiting = new Set();
  const getWorld = (index) => {
    if (cache.has(index)) return cache.get(index);
    if (visiting.has(index)) throw new Error("Parent hierarchy contains a cycle.");
    visiting.add(index);
    const part = submeshes[index];
    const local = md9ArrayToRenderMatrix(part.matrix);
    const parentWorld = part.parentId >= 0 ? getWorld(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
    cache.set(index, world);
    visiting.delete(index);
    return world;
  };
  return submeshes.map((_, index) => getWorld(index).clone());
}

function validateParentHierarchy(submeshes) {
  const stateByIndex = new Uint8Array(submeshes.length);
  const visit = (index) => {
    if (index < 0) return;
    if (!submeshes[index]) throw new Error("Parent hierarchy references a missing part.");
    if (stateByIndex[index] === 1) throw new Error("Parent hierarchy contains a cycle.");
    if (stateByIndex[index] === 2) return;
    stateByIndex[index] = 1;
    const parentId = submeshes[index].parentId;
    if (parentId >= submeshes.length) throw new Error("Parent hierarchy references a missing part.");
    if (parentId >= 0) visit(parentId);
    stateByIndex[index] = 2;
  };
  for (let index = 0; index < submeshes.length; index++) visit(index);
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

function makeUniqueImportedPartName(name, index, usedNames) {
  const base = sanitizeFilename(name || `part_${index}`).slice(0, 31) || `part_${index}`;
  let candidate = base;
  let suffix = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    const tail = `_${suffix++}`;
    candidate = `${base.slice(0, Math.max(1, 31 - tail.length))}${tail}`;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function updateGeneratedModelCounts(model) {
  validateParentHierarchy(model.submeshes);
  model.totalVertices = model.submeshes.reduce((sum, part) => sum + part.vertexCount, 0);
  model.totalFaces = model.submeshes.reduce((sum, part) => sum + part.faceCount, 0);
  model.bounds = new THREE.Box3();
  const point = new THREE.Vector3();
  const worldMatrices = new Map();
  const visiting = new Set();
  const getWorldMatrix = (index) => {
    if (worldMatrices.has(index)) return worldMatrices.get(index);
    if (visiting.has(index)) throw new Error("Parent hierarchy contains a cycle.");
    visiting.add(index);
    const part = model.submeshes[index];
    const local = md9ArrayToRenderMatrix(part.matrix);
    const parentWorld = part.parentId >= 0 ? getWorldMatrix(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, local);
    worldMatrices.set(index, world);
    visiting.delete(index);
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

function createAniAnimationsFromGltf(gltf, bones, nodeNameToBoneName = null) {
  const nameMap = nodeNameToBoneName || new Map(bones.map((bone, index) => [bone.name, makeUniqueImportedBoneName(bone.name || `bone_${index}`, index)]));
  const boneNames = new Set(nameMap.values());
  return (gltf.animations || []).map((clip) => {
    const tracks = new Map();
    let duration = 0;
    for (const keyTrack of clip.tracks) {
      const parsed = parseGltfTrackName(keyTrack.name);
      const boneName = nameMap.get(parsed.nodeName);
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

function appendGltfMesh(object, files, builder, textureSources, zeroUv) {
  const geometry = object.geometry.getAttribute("normal") ? object.geometry : object.geometry.clone();
  if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
  appendIndexedMeshGeometry(object, geometry, builder, object.material, textureSources, files, zeroUv);
  if (geometry !== object.geometry) geometry.dispose();
}

function createIndexedGeometryBuilder() {
  return {
    positions: [],
    normals: [],
    uvs: [],
    indices: [],
    uvSourceIds: [],
    vertexMap: new Map()
  };
}

function finalizeIndexedGeometryBuilder(builder) {
  if (builder.positions.length / 3 > 65535) throw new Error(t("replacementTooLarge"));
  return {
    positions: new Float32Array(builder.positions),
    normals: new Float32Array(builder.normals),
    uvs: new Float32Array(builder.uvs),
    indices: new Uint16Array(builder.indices),
    uvSourceIds: builder.uvSourceIds
  };
}

function appendIndexedMeshGeometry(object, geometry, builder, material, textureSources, files, zeroUv) {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  if (!position || !normal) return;
  const index = geometry.getIndex();
  const drawCount = index ? index.count : position.count;
  const materialForDraw = textureSources ? buildMaterialDrawLookup(geometry, material ?? object.material) : () => null;
  const vertex = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();

  for (let drawIndex = 0; drawIndex < drawCount; drawIndex++) {
    const vertexIndex = index ? index.getX(drawIndex) : drawIndex;
    const sourceId = textureSources ? registerTextureSource(textureSources, materialForDraw(drawIndex), files) : -1;
    getGltfWorldVertex(object, geometry, position, vertexIndex, vertex);
    getGltfWorldNormal(object, geometry, normal, vertexIndex, vertexNormal);
    builder.indices.push(addIndexedReplacementVertex(
      builder,
      vertex,
      vertexNormal,
      uv ? uv.getX(vertexIndex) : zeroUv.x,
      uv ? uv.getY(vertexIndex) : zeroUv.y,
      sourceId
    ));
  }
}

function addIndexedReplacementVertex(builder, position, normal, u, v, sourceId) {
  const key = [
    quantizeVertexValue(position.x),
    quantizeVertexValue(position.y),
    quantizeVertexValue(position.z),
    quantizeVertexValue(normal.x),
    quantizeVertexValue(normal.y),
    quantizeVertexValue(normal.z),
    quantizeVertexValue(u),
    quantizeVertexValue(v),
    sourceId
  ].join("|");
  const existing = builder.vertexMap.get(key);
  if (existing !== undefined) return existing;
  const index = builder.positions.length / 3;
  builder.vertexMap.set(key, index);
  builder.positions.push(position.x, position.y, position.z);
  builder.normals.push(normal.x, normal.y, normal.z);
  builder.uvs.push(u, v);
  builder.uvSourceIds.push(sourceId);
  return index;
}

function quantizeVertexValue(value) {
  return Math.round((Number.isFinite(value) ? value : 0) * 1000000);
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
  ensureTextureMatrix(texture);
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

function normalizeTrackReplacementToPart(replacement, part, options = {}) {
  const sourceBox = computeArrayBox(replacement.positions);
  const targetBox = computeArrayBox(part.localPositions);
  if (sourceBox.isEmpty() || targetBox.isEmpty()) return;

  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  const targetSize = targetBox.getSize(new THREE.Vector3());
  const sourceMax = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
  const targetMax = Math.max(targetSize.x, targetSize.y, targetSize.z);
  if (sourceMax <= 0 || targetMax <= 0) return;

  const scale = options.keepSize ? 1 : targetMax / sourceMax;
  const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
  for (let i = 0; i < replacement.positions.length; i += 3) {
    replacement.positions[i] = (replacement.positions[i] - sourceCenter.x) * scale;
    replacement.positions[i + 1] = (replacement.positions[i + 1] - sourceCenter.y) * scale;
    replacement.positions[i + 2] = (replacement.positions[i + 2] - sourceCenter.z) * scale;
  }

  const targetCenter = targetBox
    .getCenter(new THREE.Vector3())
    .applyMatrix4(getTrackPartWorldTransform(part))
    .applyMatrix4(getTrackPartFrameMatrix(part).clone().invert());
  const matrix = new THREE.Matrix4().fromArray(part.matrix || createIdentityMatrixArray());
  matrix.setPosition(targetCenter);
  part.matrix = matrix.toArray();
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
  if (isTrackBinModel()) syncTrackPartMeshTransform(index);
  rebuildNormalVisualizers();
  applyOptions();
  if (index === state.highlightedPartIndex) refreshHighlightedMaterial();
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
    if (isTrackBinModel()) syncTrackPartMeshTransform(index);
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

function scaleCurrentModelByFactor() {
  const model = state.currentModel;
  if (!model) return;
  const factor = Number(el.modelScaleFactor.value);
  if (!Number.isFinite(factor) || factor <= 0) {
    setStatus(t("invalidHeight"));
    return;
  }
  model.transformSliderScale = Math.max(0.0001, factor);
  updateReferenceScale();
  if (state.editIndex >= 0) buildTransformEditor(model.submeshes[state.editIndex]);
  setStatus(t("scaledModelFactor", { factor: formatNumber(factor) }));
}

function updateReferenceScale() {
  const scale = Math.max(0.0001, state.currentModel?.transformSliderScale || 1);
  grid.scale.setScalar(scale);
  if (el.modelScaleFactor && document.activeElement !== el.modelScaleFactor) {
    el.modelScaleFactor.value = formatNumber(scale);
  }
  grid.updateMatrixWorld(true);
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
  state.skeletonLines = isTrackBinModel() ? null : createSkeletonLines(state.currentModel);
  if (state.skeletonLines) state.root.add(state.skeletonLines);
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
  const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  state.root?.updateWorldMatrix(true, true);
  for (const part of model.submeshes) {
    model.totalVertices += part.vertexCount;
    model.totalFaces += part.faceCount;
    const box = isTrackBinModel(model) ? trackBoundingArrayToBox(part.boundingBox) : new THREE.Box3();
    if (box.isEmpty()) {
      for (let i = 0; i < part.localPositions.length; i += 3) {
        point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2]);
        box.expandByPoint(point);
      }
    }
    const worldBox = isTrackBinModel(model)
      ? transformBoxByMatrix(box, getTrackPartWorldTransform(part), corners)
      : box;
    const node = state.boneNodes.get(part.name);
    if (node && !isTrackBinModel(model)) {
      model.bounds.union(transformBoxByMatrix(worldBox, node.matrixWorld, corners));
    } else {
      model.bounds.union(worldBox);
    }
    part.boundingBox = isTrackBinModel(model)
      ? boxToTrackBoundingArray(box)
      : box.isEmpty()
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

function transformBoxByMatrix(box, matrix, corners = Array.from({ length: 8 }, () => new THREE.Vector3())) {
  if (!box || box.isEmpty()) return new THREE.Box3();
  const min = box.min;
  const max = box.max;
  corners[0].set(min.x, min.y, min.z);
  corners[1].set(max.x, min.y, min.z);
  corners[2].set(min.x, max.y, min.z);
  corners[3].set(max.x, max.y, min.z);
  corners[4].set(min.x, min.y, max.z);
  corners[5].set(max.x, min.y, max.z);
  corners[6].set(min.x, max.y, max.z);
  corners[7].set(max.x, max.y, max.z);
  const transformed = new THREE.Box3();
  for (const corner of corners) transformed.expandByPoint(corner.applyMatrix4(matrix));
  return transformed;
}

function trackBoundingArrayToBox(boundingBox) {
  if (!boundingBox || boundingBox.length < 6) return new THREE.Box3();
  const box = new THREE.Box3(
    new THREE.Vector3(boundingBox[0], boundingBox[1], boundingBox[2]),
    new THREE.Vector3(boundingBox[3], boundingBox[4], boundingBox[5])
  );
  return box.min.x <= box.max.x && box.min.y <= box.max.y && box.min.z <= box.max.z ? box : new THREE.Box3();
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
  if (isTrackBinModel()) return normalizeModelTextureName(base, { defaultExt: ".dds", maxLength: 63 });
  return normalizeModelTextureName(base.toLowerCase().startsWith("nocull_") ? base : `Nocull_${base}`, { defaultExt: ".dds", maxLength: 31 });
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
  const disabledForModel = isTrackBinModel();
  for (const item of state.aniFiles) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    el.animationSelect.append(option);
  }
  el.animationSelect.disabled = disabledForModel || state.aniFiles.length === 0;
  el.clearAnimations.disabled = state.aniFiles.length === 0;
  el.saveAnimation.disabled = disabledForModel || !state.currentAnimation;
  el.autoPlay.disabled = disabledForModel;
  el.animationSelect.value = disabledForModel ? "" : (state.currentAniId || "");
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
  el.scaleModelFactor.disabled = true;
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
  updateModelFormatUi();
  el.batchEditPanel.hidden = true;
  setBatchEditToggleActive(false);
  el.submeshList.replaceChildren();
  updateStatsEmpty();
  updateModelSelect();
  updateAnimationSelect();
  updateReferenceScale();
  updateMissingTextures(null);
  updateHistoryButtons();
  setStatus(t("modelsCleared"));
}

function clearAnimations() {
  state.aniFiles = [];
  state.currentAnimation = null;
  state.currentAniId = "";
  state.animationFrame = 0;
  state.aniRangeStart = 0;
  state.aniRangeEnd = 0;
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  state.aniBatchSelectedTracks = new Set();
  state.aniBatchClipboard = null;
  invalidateAniKeyTimeCache();
  el.aniBatchEditor.hidden = true;
  el.saveAnimation.disabled = true;
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
  ensureAniRange();
  const current = Math.min(state.animationFrame, duration);
  const range = getAniRange();
  const percent = range.length > 0 ? (current - range.start) / range.length * 100 : 0;
  el.frameLabel.textContent = `${formatNumber(current)} / ${formatNumber(duration)}`;
  el.aniTimelinePanel.hidden = !state.currentAnimation;
  el.aniTimelinePanel.classList.toggle("disabled", !state.currentAnimation);
  el.aniSelectTracks.disabled = !state.currentAnimation;
  el.aniBatchEdit.disabled = !state.currentAnimation;
  el.aniTimeSlider.disabled = !state.currentAnimation;
  el.aniTimeSlider.min = formatNumber(range.start);
  el.aniTimeSlider.max = formatNumber(Math.max(range.end, range.start + 0.0001));
  el.aniTimeSlider.value = formatNumber(current);
  updateAniSliderVisual(current);
  updateAniRangeBar();
  updateAniSnapGrid();
  renderAniTimelineKeys();
  updateAniTimelineCursor(percent);
  renderAniKeyEditor();
  updateStatusPosition();
}

function updateAniTimelinePlayback() {
  const duration = state.currentAnimation?.duration || 0;
  ensureAniRange();
  const current = Math.min(state.animationFrame, duration);
  const range = getAniRange();
  const percent = range.length > 0 ? (current - range.start) / range.length * 100 : 0;
  el.frameLabel.textContent = `${formatNumber(current)} / ${formatNumber(duration)}`;
  el.aniTimeSlider.min = formatNumber(range.start);
  el.aniTimeSlider.max = formatNumber(Math.max(range.end, range.start + 0.0001));
  el.aniTimeSlider.value = formatNumber(current);
  updateAniSliderVisual(current);
  updateAniRangeBar();
  updateAniTimelineCursor(percent, false);
  updateStatusPosition();
}

function updateAniSnapGrid() {
  const range = getAniRange();
  if (!state.currentAnimation || !el.aniSnapKeys.checked || range.length <= 0) {
    el.aniTimeline.style.removeProperty("--snap-step");
    drawAniTimelineCanvas();
    return;
  }
  const step = getAniSnapStep();
  const percent = Math.max(0.2, Math.min(100, step / range.length * 100));
  el.aniTimeline.style.setProperty("--snap-step", `${percent}%`);
  drawAniTimelineCanvas();
}

function updateAniTimelineCursor(percent, syncOverlays = true) {
  const clamped = Math.max(0, Math.min(100, percent));
  el.aniTimelineProgress.style.width = `calc((100% - var(--ani-track-label-width)) * ${clamped / 100})`;
  el.aniTimelineCursor.style.left = `calc(var(--ani-track-label-width) + (100% - var(--ani-track-label-width)) * ${clamped / 100})`;
  if (!syncOverlays) return;
  clampAniTimelinePanelHeight();
  syncAniTimelineOverlayHeight();
}

function updateAniSliderVisual(time) {
  const range = getAniRange();
  const percent = range.length > 0 ? Math.max(0, Math.min(100, (time - range.start) / range.length * 100)) : 0;
  el.aniSliderThumb.style.left = `${percent}%`;
  el.aniSliderTrack.setAttribute("aria-valuemin", formatNumber(range.start));
  el.aniSliderTrack.setAttribute("aria-valuemax", formatNumber(range.end));
  el.aniSliderTrack.setAttribute("aria-valuenow", formatNumber(time));
}

function syncAniTimelineOverlayHeight() {
  const height = Math.max(el.aniTimeline.clientHeight, el.aniKeyLayer.scrollHeight);
  const value = `${height}px`;
  el.aniTimelineProgress.style.height = value;
  el.aniTimelineCursor.style.height = value;
  drawAniTimelineCanvas();
}

function getAniTimelinePanelMaxHeight() {
  const viewportHeight = el.viewport.getBoundingClientRect().height;
  const viewportCap = Math.max(160, Math.min(640, viewportHeight * 0.72));
  const panelStyle = getComputedStyle(el.aniTimelinePanel);
  const paddingY = parseFloat(panelStyle.paddingTop) + parseFloat(panelStyle.paddingBottom);
  const borderY = parseFloat(panelStyle.borderTopWidth) + parseFloat(panelStyle.borderBottomWidth);
  const gap = parseFloat(panelStyle.rowGap) || 0;
  const headHeight = el.aniTimelinePanel.querySelector(".ani-timeline-head")?.getBoundingClientRect().height || 0;
  const sliderHeight = el.aniTimelinePanel.querySelector(".ani-slider-row")?.getBoundingClientRect().height || 0;
  const timelineStyle = getComputedStyle(el.aniTimeline);
  const timelineBorderY = parseFloat(timelineStyle.borderTopWidth) + parseFloat(timelineStyle.borderBottomWidth);
  const rowHeight = parseFloat(panelStyle.getPropertyValue("--ani-track-row-height")) || 28;
  const timelineHeight = Math.max(rowHeight + timelineBorderY, Math.ceil(el.aniKeyLayer.children.length * rowHeight + timelineBorderY));
  const contentHeight = Math.ceil(borderY + paddingY + headHeight + sliderHeight + timelineHeight + gap * 2);
  return Math.max(120, Math.min(viewportCap, contentHeight));
}

function clampAniTimelinePanelHeight() {
  if (!state.currentAnimation || el.aniTimelinePanel.hidden) return;
  const maxHeight = getAniTimelinePanelMaxHeight();
  const currentHeight = el.aniTimelinePanel.getBoundingClientRect().height;
  if (Math.abs(currentHeight - maxHeight) > 1 && currentHeight > maxHeight) {
    el.aniTimelinePanel.style.setProperty("--ani-timeline-panel-height", `${maxHeight}px`);
    updateStatusPosition();
  } else if (!el.aniTimelinePanel.style.getPropertyValue("--ani-timeline-panel-height")) {
    el.aniTimelinePanel.style.setProperty("--ani-timeline-panel-height", `${Math.min(currentHeight || maxHeight, maxHeight)}px`);
    updateStatusPosition();
  }
  const nextHeight = Math.min(currentHeight || maxHeight, maxHeight);
  el.aniTimelineResizeHandle.classList.toggle("disabled", nextHeight >= maxHeight - 1);
}

function initializeVisibleAniTracks() {
  state.visibleAniTracks = new Set(getDefaultVisibleAniTrackNames());
  state.aniTrackSelectionTouched = false;
}

function getDefaultVisibleAniTrackNames() {
  const names = getAnimatedPartNames();
  if (names.length) return names;
  return state.currentModel?.submeshes?.map((part) => part.name) || [];
}

function getAnimatedPartNames() {
  if (!state.currentAnimation) return [];
  const names = [];
  for (const [partName, track] of state.currentAnimation.tracks) {
    if ((track.positions?.length || 0) || (track.rotations?.length || 0) || (track.scales?.length || 0)) names.push(partName);
  }
  return names.sort((a, b) => a.localeCompare(b));
}

function getVisibleAniTrackNames() {
  if (!state.currentModel) return [];
  if (!state.visibleAniTracks) initializeVisibleAniTracks();
  return state.currentModel.submeshes
    .map((part) => part.name)
    .filter((partName) => state.visibleAniTracks.has(partName));
}

function ensureAniRange() {
  if (!state.currentAnimation) {
    state.aniRangeStart = 0;
    state.aniRangeEnd = 0;
    return;
  }
  const duration = Math.max(state.currentAnimation.duration || 0, 0);
  if (!Number.isFinite(state.aniRangeEnd) || state.aniRangeEnd <= state.aniRangeStart) state.aniRangeEnd = duration;
  state.aniRangeStart = Math.max(0, Math.min(duration, state.aniRangeStart || 0));
  state.aniRangeEnd = Math.max(state.aniRangeStart + 0.0001, Math.min(duration, state.aniRangeEnd || duration));
}

function getAniRange() {
  ensureAniRange();
  return {
    start: state.aniRangeStart,
    end: state.aniRangeEnd,
    length: Math.max(0.0001, state.aniRangeEnd - state.aniRangeStart)
  };
}

function updateAniRangeBar() {
  const duration = Math.max(state.currentAnimation?.duration || 0, 0.0001);
  const startPercent = Math.max(0, Math.min(100, state.aniRangeStart / duration * 100));
  const endPercent = Math.max(0, Math.min(100, state.aniRangeEnd / duration * 100));
  el.aniRangeStartHandle.style.left = `${startPercent}%`;
  el.aniRangeEndHandle.style.left = `${endPercent}%`;
  el.aniRangeFill.style.left = `${startPercent}%`;
  el.aniRangeFill.style.width = `${Math.max(0, endPercent - startPercent)}%`;
}

function installAniRangeBarHandlers() {
  el.aniRangeStartHandle.addEventListener("pointerdown", (event) => startAniRangeDrag(event, "start"));
  el.aniRangeEndHandle.addEventListener("pointerdown", (event) => startAniRangeDrag(event, "end"));
  el.aniRangeFill.addEventListener("pointerdown", startAniRangeMove);
  el.aniRangeBar.addEventListener("pointerdown", (event) => {
    if (event.target === el.aniRangeStartHandle || event.target === el.aniRangeEndHandle || event.target === el.aniRangeFill) return;
    startAniRangeDrag(event, getNearestAniRangeHandle(event));
  });
  window.addEventListener("pointermove", (event) => {
    if (state.draggingAniRangeMove && state.currentAnimation) {
      moveAniRangeSelection(rangeBarTimeFromEvent(event));
      return;
    }
    if (!state.draggingAniRangeHandle || !state.currentAnimation) return;
    setAniRangeHandleFromTime(state.draggingAniRangeHandle, rangeBarTimeFromEvent(event));
  });
  window.addEventListener("pointerup", () => {
    stopAniRangeDrag();
  });
  window.addEventListener("pointercancel", () => {
    stopAniRangeDrag();
  });
}

function startAniRangeDrag(event, handle) {
  if (!state.currentAnimation) return;
  event.preventDefault();
  event.stopPropagation();
  state.draggingAniRangeHandle = handle;
  el.aniRangeStartHandle.classList.toggle("active", handle === "start");
  el.aniRangeEndHandle.classList.toggle("active", handle === "end");
  setAniRangeHandleFromTime(handle, rangeBarTimeFromEvent(event));
}

function stopAniRangeDrag() {
  const wasDragging = Boolean(state.draggingAniRangeHandle || state.draggingAniRangeMove);
  state.draggingAniRangeHandle = "";
  state.draggingAniRangeMove = false;
  el.aniRangeStartHandle.classList.remove("active");
  el.aniRangeEndHandle.classList.remove("active");
  el.aniRangeFill.classList.remove("dragging");
  if (wasDragging) updateFrameControls();
}

function startAniRangeMove(event) {
  if (!state.currentAnimation) return;
  event.preventDefault();
  event.stopPropagation();
  state.draggingAniRangeMove = true;
  state.aniRangeMoveStartTime = rangeBarTimeFromEvent(event);
  state.aniRangeMoveStartRange = { start: state.aniRangeStart, end: state.aniRangeEnd };
  el.aniRangeFill.classList.add("dragging");
}

function moveAniRangeSelection(time) {
  const duration = Math.max(state.currentAnimation?.duration || 0, 0);
  const length = state.aniRangeMoveStartRange.end - state.aniRangeMoveStartRange.start;
  const delta = time - state.aniRangeMoveStartTime;
  let start = state.aniRangeMoveStartRange.start + delta;
  start = Math.max(0, Math.min(Math.max(0, duration - length), start));
  state.aniRangeStart = Number(start.toFixed(6));
  state.aniRangeEnd = Number((start + length).toFixed(6));
  if (state.animationFrame < state.aniRangeStart || state.animationFrame > state.aniRangeEnd) {
    el.autoPlay.checked = false;
    applyAnimation(state.aniRangeStart);
  }
  updateAniRangeInteraction();
}

function getNearestAniRangeHandle(event) {
  const time = rangeBarTimeFromEvent(event);
  return Math.abs(time - state.aniRangeStart) <= Math.abs(time - state.aniRangeEnd) ? "start" : "end";
}

function setAniRangeHandleFromTime(handle, time) {
  const duration = Math.max(state.currentAnimation?.duration || 0, 0);
  if (handle === "start") {
    state.aniRangeStart = Math.max(0, Math.min(time, state.aniRangeEnd - 0.0001));
  } else {
    state.aniRangeEnd = Math.min(duration, Math.max(time, state.aniRangeStart + 0.0001));
  }
  if (state.animationFrame < state.aniRangeStart || state.animationFrame > state.aniRangeEnd) {
    el.autoPlay.checked = false;
    applyAnimation(handle === "end" ? state.aniRangeEnd : state.aniRangeStart);
  }
  updateAniRangeInteraction();
}

function updateAniRangeInteraction() {
  const range = getAniRange();
  const percent = range.length > 0 ? (state.animationFrame - range.start) / range.length * 100 : 0;
  el.frameLabel.textContent = `${formatNumber(state.animationFrame)} / ${formatNumber(state.currentAnimation?.duration || 0)}`;
  el.aniTimeSlider.min = formatNumber(range.start);
  el.aniTimeSlider.max = formatNumber(Math.max(range.end, range.start + 0.0001));
  el.aniTimeSlider.value = formatNumber(Math.max(range.start, Math.min(range.end, state.animationFrame)));
  updateAniSliderVisual(state.animationFrame);
  updateAniRangeBar();
  updateAniTimelineCursor(percent, false);
  scheduleAniTimelineCanvasDraw();
}

function rangeBarTimeFromEvent(event) {
  const duration = Math.max(state.currentAnimation?.duration || 0, 0);
  const rect = el.aniRangeBar.getBoundingClientRect();
  const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
  return Number(Math.max(0, Math.min(duration, ratio * duration)).toFixed(6));
}

function saveCurrentAnimation() {
  if (!state.currentAnimation) return;
  const item = state.aniFiles.find((candidate) => candidate.id === state.currentAniId);
  const name = sanitizeFilename(item?.label?.split(/[\\/]/).pop() || state.currentAnimation.name || "animation.ani");
  const filename = name.toLowerCase().endsWith(".ani") ? name : `${name}.ani`;
  downloadBlob(new Blob([serializeAni(state.currentAnimation)], { type: "application/octet-stream" }), filename);
  setStatus(t("animationSaved", { name: filename }));
}

function installAniTimelineHandlers() {
  window.addEventListener("pointermove", (event) => {
    if (state.draggingAniKeyTime == null || !state.currentAnimation) return;
    const nextTime = timelineTimeFromEvent(event, true);
    if (isSameAniTime(nextTime, state.draggingAniKeyTime)) return;
    moveAniPartKeyTime(state.draggingAniPartName, state.draggingAniKeyTime, nextTime);
    state.draggingAniKeyTime = nextTime;
    state.selectedAniKeyTime = nextTime;
    applyAnimation(nextTime);
    updateAniTimelinePlayback();
    scheduleAniTimelineCanvasDraw();
    renderAniKeyEditor();
  });
  window.addEventListener("pointerup", () => {
    const wasDragging = state.draggingAniKeyTime != null;
    state.draggingAniKeyTime = null;
    state.draggingAniPartName = "";
    if (wasDragging) updateFrameControls();
  });
  window.addEventListener("pointercancel", () => {
    state.draggingAniKeyTime = null;
    state.draggingAniPartName = "";
  });
}

function installAniKeyEditorDrag() {
  el.aniKeyEditor.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, button, select, textarea, label")) return;
    state.draggingAniEditor = true;
    const panelRect = el.aniTimelinePanel.getBoundingClientRect();
    const editorRect = el.aniKeyEditor.getBoundingClientRect();
    state.aniEditorDragOffset = {
      x: event.clientX - editorRect.left,
      y: event.clientY - editorRect.top
    };
    el.aniKeyEditor.style.left = `${editorRect.left - panelRect.left}px`;
    el.aniKeyEditor.style.top = `${editorRect.top - panelRect.top}px`;
    el.aniKeyEditor.setPointerCapture(event.pointerId);
  });
  el.aniKeyEditor.addEventListener("pointermove", (event) => {
    if (!state.draggingAniEditor) return;
    const panelRect = el.aniTimelinePanel.getBoundingClientRect();
    const x = event.clientX - panelRect.left - state.aniEditorDragOffset.x;
    const y = event.clientY - panelRect.top - state.aniEditorDragOffset.y;
    el.aniKeyEditor.style.left = `${x}px`;
    el.aniKeyEditor.style.top = `${y}px`;
  });
  const stopDrag = () => {
    state.draggingAniEditor = false;
  };
  el.aniKeyEditor.addEventListener("pointerup", stopDrag);
  el.aniKeyEditor.addEventListener("pointercancel", stopDrag);
}

function installAniBatchEditorDrag() {
  el.aniBatchEditor.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, button, select, textarea, label")) return;
    state.draggingAniBatchEditor = true;
    const panelRect = el.aniTimelinePanel.getBoundingClientRect();
    const editorRect = el.aniBatchEditor.getBoundingClientRect();
    state.aniEditorDragOffset = {
      x: event.clientX - editorRect.left,
      y: event.clientY - editorRect.top
    };
    el.aniBatchEditor.style.left = `${editorRect.left - panelRect.left}px`;
    el.aniBatchEditor.style.top = `${editorRect.top - panelRect.top}px`;
    el.aniBatchEditor.style.bottom = "auto";
    el.aniBatchEditor.setPointerCapture(event.pointerId);
  });
  el.aniBatchEditor.addEventListener("pointermove", (event) => {
    if (!state.draggingAniBatchEditor) return;
    const panelRect = el.aniTimelinePanel.getBoundingClientRect();
    const x = event.clientX - panelRect.left - state.aniEditorDragOffset.x;
    const y = event.clientY - panelRect.top - state.aniEditorDragOffset.y;
    el.aniBatchEditor.style.left = `${x}px`;
    el.aniBatchEditor.style.top = `${y}px`;
  });
  const stopDrag = () => {
    state.draggingAniBatchEditor = false;
  };
  el.aniBatchEditor.addEventListener("pointerup", stopDrag);
  el.aniBatchEditor.addEventListener("pointercancel", stopDrag);
}

function installAniTimelineResize() {
  if (!el.aniTimelineResizeHandle) return;
  el.aniTimelineResizeHandle.addEventListener("pointerdown", (event) => {
    state.draggingAniTimelineHeight = true;
    state.aniTimelineResizeStartY = event.clientY;
    state.aniTimelineResizeStartHeight = el.aniTimelinePanel.getBoundingClientRect().height;
    el.aniTimelineResizeHandle.classList.add("dragging");
    el.aniTimelineResizeHandle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  el.aniTimelineResizeHandle.addEventListener("pointermove", (event) => {
    if (!state.draggingAniTimelineHeight) return;
    const maxHeight = getAniTimelinePanelMaxHeight();
    const nextHeight = Math.max(120, Math.min(maxHeight, state.aniTimelineResizeStartHeight + state.aniTimelineResizeStartY - event.clientY));
    el.aniTimelinePanel.style.setProperty("--ani-timeline-panel-height", `${nextHeight}px`);
    updateStatusPosition();
  });
  const stopResize = () => {
    state.draggingAniTimelineHeight = false;
    el.aniTimelineResizeHandle.classList.remove("dragging");
    updateStatusPosition();
  };
  el.aniTimelineResizeHandle.addEventListener("pointerup", stopResize);
  el.aniTimelineResizeHandle.addEventListener("pointercancel", stopResize);
}

function installAniSliderHandlers() {
  const setTimeFromEvent = (event) => {
    if (!state.currentAnimation) return;
    const rect = el.aniSliderTrack.getBoundingClientRect();
    const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    const range = getAniRange();
    const time = Number(Math.max(range.start, Math.min(range.end, range.start + Math.max(0, Math.min(1, ratio)) * range.length)).toFixed(6));
    el.autoPlay.checked = false;
    applyAnimation(time);
    updateAniTimelinePlayback();
  };
  el.aniSliderTrack.addEventListener("pointerdown", (event) => {
    state.draggingAniSlider = true;
    el.aniSliderTrack.setPointerCapture(event.pointerId);
    setTimeFromEvent(event);
    event.preventDefault();
  });
  el.aniSliderTrack.addEventListener("pointermove", (event) => {
    if (!state.draggingAniSlider) return;
    setTimeFromEvent(event);
  });
  const stopDrag = () => {
    state.draggingAniSlider = false;
  };
  el.aniSliderTrack.addEventListener("pointerup", stopDrag);
  el.aniSliderTrack.addEventListener("pointercancel", stopDrag);
}

function timelineTimeFromEvent(event, snap) {
  const range = getAniRange();
  const rect = el.aniTimeline.getBoundingClientRect();
  const labelWidth = getAniTrackLabelWidth();
  const timelineLeft = rect.left + labelWidth;
  const timelineWidth = Math.max(1, rect.width - labelWidth);
  const ratio = (event.clientX - timelineLeft) / timelineWidth;
  let time = Math.max(range.start, Math.min(range.end, range.start + ratio * range.length));
  if (snap && el.aniSnapKeys.checked) {
    const step = getAniSnapStep();
    time = Math.round(time / step) * step;
  }
  return Number(time.toFixed(6));
}

function getAniTrackLabelWidth() {
  return parseFloat(getComputedStyle(el.aniTimeline).getPropertyValue("--ani-track-label-width")) || 142;
}

function getAniSnapStep() {
  return Math.max(0.0001, Number(el.aniSnapStep.value) || 0.01);
}

function drawAniTimelineCanvas() {
  if (state.aniTimelineDrawRequest) {
    cancelAnimationFrame(state.aniTimelineDrawRequest);
    state.aniTimelineDrawRequest = 0;
  }
  const canvas = el.aniTimelineCanvas;
  const ctx = canvas.getContext("2d");
  const labelWidth = getAniTrackLabelWidth();
  const timelineWidth = Math.max(1, el.aniTimeline.clientWidth - labelWidth);
  const rowHeight = getAniTimelineRowHeight();
  const visibleTracks = getVisibleAniTrackNames();
  const contentHeight = Math.max(el.aniTimeline.clientHeight, visibleTracks.length * rowHeight);
  const scrollTop = el.aniTimeline.scrollTop;
  const visibleStartRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  const visibleEndRow = Math.min(visibleTracks.length - 1, Math.ceil((scrollTop + el.aniTimeline.clientHeight) / rowHeight) + 1);
  const dpr = window.devicePixelRatio || 1;
  const pixelWidth = Math.max(1, Math.ceil(timelineWidth * dpr));
  const pixelHeight = Math.max(1, Math.ceil(contentHeight * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  canvas.style.left = `${labelWidth}px`;
  canvas.style.width = `${timelineWidth}px`;
  canvas.style.height = `${contentHeight}px`;
  canvas.style.top = `0px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, timelineWidth, contentHeight);
  state.aniTimelineKeyHits = [];
  if (!state.currentAnimation) return;
  const range = getAniRange();
  if (el.aniSnapKeys.checked && range.length > 0) {
    const step = getAniSnapStep();
    const first = Math.ceil(range.start / step) * step;
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0, time = first; time <= range.end + 0.000001 && i < 1000; i++, time += step) {
      const x = Math.max(0, Math.min(timelineWidth, (time - range.start) / range.length * timelineWidth));
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, contentHeight);
    }
    ctx.stroke();
  }
  for (let rowIndex = visibleStartRow; rowIndex <= visibleEndRow; rowIndex++) {
    const partName = visibleTracks[rowIndex];
    if (!partName) continue;
    const y = rowIndex * rowHeight + rowHeight / 2;
    let lastDrawnX = -Infinity;
    for (const time of getAniPartKeyTimes(partName)) {
      if (time < range.start || time > range.end) continue;
      const x = Math.max(0, Math.min(timelineWidth, (time - range.start) / range.length * timelineWidth));
      const active = partName === state.selectedAniPartName && isSameAniTime(time, state.selectedAniKeyTime);
      const xPixel = Math.round(x);
      if (!active && xPixel === lastDrawnX) continue;
      lastDrawnX = xPixel;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = active ? "#ff6aa8" : "#e5b85b";
      ctx.strokeStyle = active ? "#ffffff" : "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1;
      ctx.fillRect(-4, -4, 8, 8);
      ctx.strokeRect(-4, -4, 8, 8);
      ctx.restore();
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x, y - rowHeight / 2);
      ctx.lineTo(x, y + rowHeight / 2);
      ctx.stroke();
    }
  }
}

function scheduleAniTimelineCanvasDraw() {
  if (state.aniTimelineDrawRequest) return;
  state.aniTimelineDrawRequest = requestAnimationFrame(() => {
    state.aniTimelineDrawRequest = 0;
    drawAniTimelineCanvas();
  });
}

function getAniTimelineRowHeight() {
  return parseFloat(getComputedStyle(el.aniTimelinePanel).getPropertyValue("--ani-track-row-height")) || 28;
}

function hitAniTimelineKey(event, partName) {
  const labelWidth = getAniTrackLabelWidth();
  const rect = el.aniTimeline.getBoundingClientRect();
  const x = event.clientX - rect.left - labelWidth;
  const y = event.clientY - rect.top + el.aniTimeline.scrollTop;
  const threshold = 8;
  const rowHeight = getAniTimelineRowHeight();
  const visibleTracks = getVisibleAniTrackNames();
  const rowIndex = Math.floor(y / rowHeight);
  const candidateParts = partName ? [partName] : [visibleTracks[rowIndex], visibleTracks[rowIndex - 1], visibleTracks[rowIndex + 1]].filter(Boolean);
  const range = getAniRange();
  const timelineWidth = Math.max(1, el.aniTimeline.clientWidth - labelWidth);
  const timeAtX = range.start + Math.max(0, Math.min(1, x / timelineWidth)) * range.length;
  const thresholdTime = threshold / timelineWidth * range.length;
  let best = null;
  for (const candidatePart of candidateParts) {
    const candidateRowIndex = visibleTracks.indexOf(candidatePart);
    if (candidateRowIndex < 0) continue;
    const candidateY = candidateRowIndex * rowHeight + rowHeight / 2;
    const dy = Math.abs(candidateY - y);
    if (dy > threshold) continue;
    for (const time of getNearestAniPartKeyTimes(candidatePart, timeAtX, thresholdTime)) {
      if (time < range.start || time > range.end) continue;
      const candidateX = Math.max(0, Math.min(timelineWidth, (time - range.start) / range.length * timelineWidth));
      const dx = Math.abs(candidateX - x);
      if (dx <= threshold && (!best || dx + dy < best.distance)) {
        best = { partName: candidatePart, time, x: candidateX, y: candidateY, rowIndex: candidateRowIndex, distance: dx + dy };
      }
    }
  }
  return best;
}

function updateAniTimelineHoverCursor(event) {
  if (!state.currentAnimation || state.draggingAniKeyTime != null) return;
  const hit = hitAniTimelineKey(event, "");
  if (!hit) {
    el.aniTimeline.style.cursor = "";
    return;
  }
  el.aniTimeline.style.cursor = hit.partName === state.selectedAniPartName && isSameAniTime(hit.time, state.selectedAniKeyTime)
    ? "grab"
    : "pointer";
}

function renderAniTimelineKeys() {
  el.aniKeyLayer.replaceChildren();
  state.aniTimelineKeyHits = [];
  if (!state.currentAnimation) return;
  const visibleTracks = getVisibleAniTrackNames();
  el.aniTimeline.style.setProperty("--ani-track-count", String(Math.max(1, visibleTracks.length)));
  for (const partName of visibleTracks) {
    const row = document.createElement("div");
    row.className = "ani-track-row";
    row.dataset.partName = partName;
    const label = document.createElement("div");
    label.className = "ani-track-label";
    label.title = partName;
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "ani-track-add";
    addButton.textContent = "+";
    addButton.title = `${t("addKey")} ${partName}`;
    addButton.addEventListener("click", (event) => {
      event.stopPropagation();
      addAniKeyForPart(partName);
    });
    const labelText = document.createElement("span");
    labelText.textContent = partName;
    label.append(addButton, labelText);
    const keys = document.createElement("div");
    keys.className = "ani-track-keys";
    keys.addEventListener("pointerdown", (event) => {
      const hit = hitAniTimelineKey(event, partName);
      if (hit) {
        event.preventDefault();
        event.stopPropagation();
        if (hit.partName !== state.selectedAniPartName || !isSameAniTime(hit.time, state.selectedAniKeyTime)) {
          selectAniKey(hit.partName, hit.time);
          return;
        }
        state.draggingAniKeyTime = hit.time;
        state.draggingAniPartName = hit.partName;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      seekAniTimelineTime(timelineTimeFromEvent(event, true));
    });
    row.append(label, keys);
    el.aniKeyLayer.append(row);
  }
  clampAniTimelinePanelHeight();
  syncAniTimelineOverlayHeight();
  requestAnimationFrame(() => {
    clampAniTimelinePanelHeight();
    syncAniTimelineOverlayHeight();
  });
}

function selectAniKey(partName, time) {
  state.selectedAniKeyTime = time;
  state.selectedAniPartName = partName;
  el.autoPlay.checked = false;
  applyAnimation(time);
  updateAniTimelinePlayback();
  scheduleAniTimelineCanvasDraw();
  renderAniKeyEditor();
}

function selectAniKeyTime(time) {
  const parts = getAniPartsAtTime(time);
  selectAniKey(parts.includes(state.selectedAniPartName) ? state.selectedAniPartName : (parts[0] || getVisibleAniTrackNames()[0] || ""), time);
}

function seekAniTimelineTime(time) {
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  el.autoPlay.checked = false;
  applyAnimation(time);
  updateAniTimelinePlayback();
  scheduleAniTimelineCanvasDraw();
  renderAniKeyEditor();
}

function selectAniTrackAtTime(partName, time) {
  state.selectedAniPartName = partName;
  state.selectedAniKeyTime = Number(time.toFixed(6));
  el.autoPlay.checked = false;
  applyAnimation(state.selectedAniKeyTime);
  updateAniTimelinePlayback();
  scheduleAniTimelineCanvasDraw();
  renderAniKeyEditor();
}

function clearSelectedAniKey() {
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  el.aniKeyEditor.style.removeProperty("left");
  el.aniKeyEditor.style.removeProperty("top");
  el.aniKeyEditor.style.removeProperty("bottom");
  scheduleAniTimelineCanvasDraw();
  renderAniKeyEditor();
}

function renderAniKeyEditor() {
  el.aniTransformEditor.replaceChildren();
  const disabled = !state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName;
  el.aniKeyEditor.hidden = disabled;
  el.aniKeyEditor.classList.toggle("disabled", disabled);
  if (!state.currentModel) {
    el.aniKeyTransformTitle.textContent = "-";
    return;
  }
  if (disabled) {
    el.aniKeyTransformTitle.textContent = "-";
    return;
  }
  el.aniDeleteKey.disabled = false;
  el.aniKeyTransformTitle.textContent = `${state.selectedAniPartName} @ ${formatNumber(state.selectedAniKeyTime)}`;
  el.aniKeyTimeInput.value = formatNumber(state.selectedAniKeyTime);
  buildAniTransformEditor(state.selectedAniPartName, state.selectedAniKeyTime);
  positionAniKeyEditorInitial();
}

function buildAniTransformEditor(partName, time) {
  const transform = getAniTransformValues(partName, time);
  for (const type of ["position", "rotation", "scale"]) {
    const block = document.createElement("div");
    block.className = "ani-transform-block";
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.aniTransformType = type;
    checkbox.checked = hasAniTransformKey(partName, type, time);
    const title = document.createElement("span");
    title.textContent = type;
    label.append(checkbox, title);
    block.append(label);
    const axes = document.createElement("div");
    axes.className = "ani-transform-axes";
    const controls = TRANSFORM_CONTROLS.filter((control) => control.transform === type);
    for (const control of controls) {
      const row = document.createElement("div");
      row.className = "transform-row ani-transform-row";
      const axisLabel = document.createElement("span");
      axisLabel.textContent = control.label;
      const range = createAniTransformInput("range", control, transform);
      const number = createAniTransformInput("number", control, transform);
      row.append(axisLabel, range, number);
      axes.append(row);
    }
    block.append(axes);
    el.aniTransformEditor.append(block);
  }
}

function positionAniKeyEditorInitial() {
  if (el.aniKeyEditor.style.left || el.aniKeyEditor.style.top) return;
  requestAnimationFrame(() => {
    if (el.aniKeyEditor.hidden || el.aniKeyEditor.style.left || el.aniKeyEditor.style.top) return;
    const editorRect = el.aniKeyEditor.getBoundingClientRect();
    el.aniKeyEditor.style.left = `10px`;
    el.aniKeyEditor.style.top = `${-editorRect.height - 10}px`;
  });
}

function createAniTransformInput(type, control, transform) {
  const input = document.createElement("input");
  input.type = type;
  input.step = String(control.step);
  input.dataset.aniTransformType = control.transform;
  input.dataset.axis = control.axis;
  input.dataset.inputKind = type;
  const rawValue = transform[control.transform][control.axis];
  input.min = String(Math.min(control.min, rawValue));
  input.max = String(Math.max(control.max, rawValue));
  input.value = formatNumber(rawValue);
  return input;
}

function handleAniTransformEditorInput(event) {
  if (!state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName) return;
  const type = event.target.dataset.aniTransformType;
  if (!type) return;
  if (event.target.dataset.axis) syncAniTransformInputPair(event.target);
  const track = ensureAniTrack(state.selectedAniPartName);
  const values = readAniTransformInputs(type);
  if (event.target.type === "checkbox") {
    if (event.target.checked) {
      setAniTransformKey(track, type, state.selectedAniKeyTime, values);
    } else {
      removeAniTransformKey(track, type, state.selectedAniKeyTime);
    }
  } else if (hasAniTransformKey(state.selectedAniPartName, type, state.selectedAniKeyTime)) {
    setAniTransformKey(track, type, state.selectedAniKeyTime, values);
  }
  if (!state.aniTrackSelectionTouched) initializeVisibleAniTracks();
  applyAnimation(state.animationFrame);
  updateAniTimelinePlayback();
  scheduleAniTimelineCanvasDraw();
}

function syncAniTransformInputPair(source) {
  const selector = `[data-ani-transform-type="${source.dataset.aniTransformType}"][data-axis="${source.dataset.axis}"]`;
  for (const input of el.aniTransformEditor.querySelectorAll(selector)) {
    if (input !== source) input.value = source.value;
  }
}

function readAniTransformInputs(type) {
  const values = {};
  for (const input of el.aniTransformEditor.querySelectorAll(`input[data-ani-transform-type="${type}"][data-axis]`)) {
    values[input.dataset.axis] = Number(input.value) || 0;
  }
  if (type === "scale") {
    values.x = values.x || 1;
    values.y = values.y || 1;
    values.z = values.z || 1;
  }
  return values;
}

function addAniKeyForPart(partName) {
  if (!state.currentAnimation) return;
  state.selectedAniKeyTime = Number(state.animationFrame.toFixed(6));
  state.selectedAniPartName = partName || getDefaultAniTargetPartName();
  if (state.selectedAniPartName) {
    const track = ensureAniTrack(state.selectedAniPartName);
    const transform = getAniTransformValues(state.selectedAniPartName, state.selectedAniKeyTime);
    const types = getAniKeyTypesForNewKey(track, state.selectedAniKeyTime);
    for (const type of types) setAniTransformKey(track, type, state.selectedAniKeyTime, transform[type]);
    state.visibleAniTracks ||= new Set();
    state.visibleAniTracks.add(state.selectedAniPartName);
  }
  el.autoPlay.checked = false;
  updateFrameControls();
}

function getAniKeyTypesForNewKey(track, time) {
  let previousTime = null;
  for (const key of [...track.positions, ...track.rotations, ...track.scales]) {
    if (key.time < time && (previousTime == null || key.time > previousTime)) previousTime = key.time;
  }
  if (previousTime == null) return ["position"];
  const types = [];
  if (track.positions.some((key) => isSameAniTime(key.time, previousTime))) types.push("position");
  if (track.rotations.some((key) => isSameAniTime(key.time, previousTime))) types.push("rotation");
  if (track.scales.some((key) => isSameAniTime(key.time, previousTime))) types.push("scale");
  return types.length ? types : ["position"];
}

function getDefaultAniTargetPartName() {
  const highlighted = state.currentModel?.submeshes?.[state.highlightedPartIndex]?.name || "";
  if (highlighted) return highlighted;
  if (state.selectedAniPartName) return state.selectedAniPartName;
  return getVisibleAniTrackNames()[0] || state.currentModel?.submeshes?.[0]?.name || "";
}

function applyAniKeyTimeInput() {
  if (!state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName) return;
  const duration = Math.max(state.currentAnimation.duration || 0, 0);
  const nextTime = Number(Math.max(0, Math.min(duration, Number(el.aniKeyTimeInput.value) || 0)).toFixed(6));
  if (isSameAniTime(nextTime, state.selectedAniKeyTime)) {
    el.aniKeyTimeInput.value = formatNumber(state.selectedAniKeyTime);
    return;
  }
  moveAniPartKeyTime(state.selectedAniPartName, state.selectedAniKeyTime, nextTime);
  state.selectedAniKeyTime = nextTime;
  el.autoPlay.checked = false;
  applyAnimation(nextTime);
  updateFrameControls();
}

function selectAdjacentAniKey(direction) {
  if (!state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName) return;
  const times = getAniPartKeyTimes(state.selectedAniPartName);
  if (!times.length) return;
  const index = times.findIndex((time) => isSameAniTime(time, state.selectedAniKeyTime));
  const nextIndex = Math.max(0, Math.min(times.length - 1, (index >= 0 ? index : 0) + direction));
  selectAniKey(state.selectedAniPartName, times[nextIndex]);
}

function insertAniKeyAfterSelected() {
  if (!state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName) return;
  const duration = Math.max(state.currentAnimation.duration || 0, 0);
  const interval = Math.max(0.0001, Number(el.aniKeyInterval.value) || 1);
  const nextTime = Number(Math.min(duration, state.selectedAniKeyTime + interval).toFixed(6));
  if (isSameAniTime(nextTime, state.selectedAniKeyTime)) return;
  state.selectedAniKeyTime = nextTime;
  el.autoPlay.checked = false;
  applyAnimation(nextTime);
  updateFrameControls();
}

function deleteSelectedAniKey() {
  if (!state.currentAnimation || state.selectedAniKeyTime == null || !state.selectedAniPartName) return;
  const track = state.currentAnimation.tracks.get(state.selectedAniPartName);
  if (track) removeTrackKeysAtTime(track, state.selectedAniKeyTime);
  if (!state.aniTrackSelectionTouched) initializeVisibleAniTracks();
  state.selectedAniKeyTime = null;
  state.selectedAniPartName = "";
  applyAnimation(state.animationFrame);
  updateFrameControls();
}

function getAniKeyTimes() {
  const times = [];
  if (!state.currentAnimation) return times;
  for (const track of state.currentAnimation.tracks.values()) {
    for (const key of [...track.positions, ...track.rotations, ...track.scales]) {
      if (!times.some((time) => isSameAniTime(time, key.time))) times.push(key.time);
    }
  }
  return times.sort((a, b) => a - b);
}

function getAniPartsAtTime(time) {
  const parts = [];
  if (!state.currentAnimation) return parts;
  for (const [partName, track] of state.currentAnimation.tracks) {
    if (track.positions.some((key) => isSameAniTime(key.time, time))
      || track.rotations.some((key) => isSameAniTime(key.time, time))
      || track.scales.some((key) => isSameAniTime(key.time, time))) {
      parts.push(partName);
    }
  }
  return parts;
}

function getAniPartKeyTimes(partName) {
  if (state.aniPartKeyTimeCache.has(partName)) return state.aniPartKeyTimeCache.get(partName);
  const track = state.currentAnimation?.tracks.get(partName);
  if (!track) return [];
  const times = mergeAniKeyTimes(track.positions, track.rotations, track.scales);
  state.aniPartKeyTimeCache.set(partName, times);
  return times;
}

function mergeAniKeyTimes(...keyArrays) {
  const times = [];
  for (const keys of keyArrays) {
    for (const key of keys || []) times.push(key.time);
  }
  if (!times.length) return [];
  times.sort((a, b) => a - b);
  const unique = [times[0]];
  for (let i = 1; i < times.length; i++) {
    if (!isSameAniTime(times[i], unique[unique.length - 1])) unique.push(times[i]);
  }
  return unique;
}

function getNearestAniPartKeyTimes(partName, time, thresholdTime) {
  const times = getAniPartKeyTimes(partName);
  if (!times.length) return [];
  const index = lowerBound(times, time);
  const candidates = [];
  for (let i = Math.max(0, index - 2); i < Math.min(times.length, index + 3); i++) {
    if (Math.abs(times[i] - time) <= thresholdTime) candidates.push(times[i]);
  }
  return candidates;
}

function lowerBound(values, target) {
  let left = 0;
  let right = values.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (values[mid] < target) left = mid + 1;
    else right = mid;
  }
  return left;
}

function invalidateAniKeyTimeCache(partName = null) {
  if (!partName) {
    state.aniPartKeyTimeCache.clear();
  } else {
    state.aniPartKeyTimeCache.delete(partName);
  }
}

function openAniTrackDialog() {
  renderAniTrackSelection();
  if (el.aniTrackDialog?.showModal) {
    el.aniTrackDialog.showModal();
  } else {
    el.aniTrackDialog.hidden = false;
  }
}

function openAniBatchEditor() {
  if (!state.currentAnimation) return;
  if (!state.aniBatchSelectedTracks.size) {
    for (const partName of getVisibleAniTrackNames()) state.aniBatchSelectedTracks.add(partName);
  }
  el.aniBatchStartTime.value = formatNumber(state.aniRangeStart);
  el.aniBatchEndTime.value = formatNumber(state.aniRangeEnd);
  el.aniBatchPasteTime.value = formatNumber(state.animationFrame);
  el.aniBatchPaste.disabled = !hasAniBatchClipboard();
  renderAniBatchTrackSelection();
  el.aniBatchEditor.hidden = false;
  positionAniBatchEditorInitial();
}

function closeAniBatchEditor() {
  el.aniBatchEditor.hidden = true;
}

function renderAniBatchTrackSelection() {
  el.aniBatchTrackList.replaceChildren();
  if (!state.currentModel) return;
  const keyed = new Set(getAnimatedPartNames());
  for (const part of state.currentModel.submeshes) {
    const partName = part.name;
    const label = document.createElement("label");
    label.className = "ani-track-choice ani-key-part";
    label.classList.toggle("has-key", keyed.has(partName));
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.aniBatchSelectedTracks.has(partName);
    checkbox.addEventListener("input", () => {
      if (checkbox.checked) state.aniBatchSelectedTracks.add(partName);
      else state.aniBatchSelectedTracks.delete(partName);
    });
    const text = document.createElement("span");
    text.textContent = partName;
    label.append(checkbox, text);
    el.aniBatchTrackList.append(label);
  }
}

function positionAniBatchEditorInitial() {
  if (el.aniBatchEditor.style.left || el.aniBatchEditor.style.top) return;
  requestAnimationFrame(() => {
    if (el.aniBatchEditor.hidden || el.aniBatchEditor.style.left || el.aniBatchEditor.style.top) return;
    const editorRect = el.aniBatchEditor.getBoundingClientRect();
    el.aniBatchEditor.style.left = `12px`;
    el.aniBatchEditor.style.top = `${-editorRect.height - 12}px`;
    el.aniBatchEditor.style.bottom = "auto";
  });
}

function getAniBatchRange() {
  const duration = Math.max(state.currentAnimation?.duration || 0, 0);
  const start = Math.max(0, Math.min(duration, Number(el.aniBatchStartTime.value) || 0));
  const rawEnd = Number(el.aniBatchEndTime.value);
  const end = Math.max(start, Math.min(duration, Number.isFinite(rawEnd) ? rawEnd : duration));
  return { start, end };
}

function getAniBatchSelectedPartNames() {
  if (!state.currentModel) return [];
  const valid = new Set(state.currentModel.submeshes.map((part) => part.name));
  return [...state.aniBatchSelectedTracks].filter((partName) => valid.has(partName));
}

function selectAllAniBatchTracks() {
  state.aniBatchSelectedTracks = new Set(getAnimatedPartNames());
  renderAniBatchTrackSelection();
}

function clearAniBatchTracks() {
  state.aniBatchSelectedTracks.clear();
  renderAniBatchTrackSelection();
}

function handleAniBatchRangeOperation(operation) {
  if (!state.currentAnimation) return;
  const range = getAniBatchRange();
  const partNames = getAniBatchSelectedPartNames();
  if (!partNames.length) return;
  if (operation === "copy") {
    state.aniBatchClipboard = copyAniBatchRange(partNames, range.start, range.end);
    el.aniBatchPaste.disabled = !hasAniBatchClipboard();
  }
  if (operation === "remove") {
    cutAniBatchRange(partNames, range.start, range.end);
    refreshAniAfterBatchEdit();
  } else if (operation === "delete") {
    deleteAniBatchRange(partNames, range.start, range.end);
    refreshAniAfterBatchEdit();
  }
}

function copyAniBatchRange(partNames, start, end) {
  const tracks = [];
  for (const partName of partNames) {
    const track = state.currentAnimation.tracks.get(partName);
    if (!track) continue;
    const copy = { partName, positions: [], rotations: [], scales: [] };
    for (const type of ["positions", "rotations", "scales"]) {
      copy[type] = track[type]
        .filter((key) => key.time >= start && key.time <= end)
        .map((key) => ({ timeOffset: Number((key.time - start).toFixed(6)), value: cloneAniKeyValue(key.value) }));
    }
    if (copy.positions.length || copy.rotations.length || copy.scales.length) tracks.push(copy);
  }
  return { duration: Math.max(0, end - start), partNames: [...partNames], tracks };
}

function deleteAniBatchRange(partNames, start, end) {
  for (const partName of partNames) {
    const track = state.currentAnimation.tracks.get(partName);
    if (!track) continue;
    for (const type of ["positions", "rotations", "scales"]) {
      track[type].splice(0, track[type].length, ...track[type].filter((key) => key.time < start || key.time > end));
    }
    invalidateAniKeyTimeCache(partName);
  }
}

function cutAniBatchRange(partNames, start, end) {
  const delta = Math.max(0, end - start);
  deleteAniBatchRange(partNames, start, end);
  if (delta <= 0) return;
  for (const partName of partNames) {
    const track = state.currentAnimation.tracks.get(partName);
    if (!track) continue;
    for (const type of ["positions", "rotations", "scales"]) {
      for (const key of track[type]) {
        if (key.time > end) key.time = Number((key.time - delta).toFixed(6));
      }
      sortAniKeys(track[type]);
    }
    invalidateAniKeyTimeCache(partName);
  }
  state.currentAnimation.duration = Math.max(0, (state.currentAnimation.duration || 0) - delta);
  if (state.animationFrame > state.currentAnimation.duration) state.animationFrame = state.currentAnimation.duration;
}

function getAniBatchPasteMode() {
  return el.aniBatchPasteMode.querySelector("input[name='aniBatchPasteMode']:checked")?.value || "merge";
}

function hasAniBatchClipboard() {
  const clipboard = state.aniBatchClipboard;
  return !!clipboard && ((clipboard.duration || 0) > 0 || !!clipboard.tracks?.length);
}

function pasteAniBatchClipboard() {
  if (!state.currentAnimation || !hasAniBatchClipboard()) return;
  const pasteTime = Math.max(0, Number(el.aniBatchPasteTime.value) || 0);
  const mode = getAniBatchPasteMode();
  const clipboardDuration = Math.max(0, state.aniBatchClipboard.duration || 0);
  const targetPartNames = state.aniBatchClipboard.partNames?.length
    ? state.aniBatchClipboard.partNames
    : state.aniBatchClipboard.tracks.map((track) => track.partName);
  const selectedPartNames = getAniBatchSelectedPartNames();
  const insertPartNames = [...new Set([...targetPartNames, ...selectedPartNames])];
  const previousDuration = state.currentAnimation.duration || 0;
  if (mode === "insert" && clipboardDuration > 0) {
    shiftAniBatchKeysAfter(insertPartNames, pasteTime, clipboardDuration);
    state.currentAnimation.duration = previousDuration + clipboardDuration;
  } else if (mode === "overwrite") {
    deleteAniBatchRange(targetPartNames, pasteTime, pasteTime + clipboardDuration);
  }
  for (const copiedTrack of state.aniBatchClipboard.tracks) {
    const track = ensureAniTrack(copiedTrack.partName);
    for (const sourceType of ["positions", "rotations", "scales"]) {
      const keys = track[sourceType];
      for (const key of copiedTrack[sourceType]) {
        const time = Number((pasteTime + key.timeOffset).toFixed(6));
        const existing = keys.findIndex((candidate) => isSameAniTime(candidate.time, time));
        const pastedKey = { time, value: cloneAniKeyValue(key.value) };
        if (existing >= 0) keys[existing] = pastedKey;
        else keys.push(pastedKey);
      }
      sortAniKeys(keys);
    }
    invalidateAniKeyTimeCache(copiedTrack.partName);
    state.visibleAniTracks ||= new Set();
    state.visibleAniTracks.add(copiedTrack.partName);
  }
  if (mode !== "insert") {
    state.currentAnimation.duration = Math.max(state.currentAnimation.duration || 0, pasteTime + clipboardDuration);
  }
  refreshAniAfterBatchEdit();
}

function shiftAniBatchKeysAfter(partNames, startTime, delta) {
  for (const partName of partNames) {
    const track = state.currentAnimation.tracks.get(partName);
    if (!track) continue;
    for (const type of ["positions", "rotations", "scales"]) {
      for (const key of track[type]) {
        if (key.time >= startTime) key.time = Number((key.time + delta).toFixed(6));
      }
      sortAniKeys(track[type]);
    }
    invalidateAniKeyTimeCache(partName);
  }
}

function cloneAniKeyValue(value) {
  return value?.clone ? value.clone() : value;
}

function refreshAniAfterBatchEdit() {
  if (!state.aniTrackSelectionTouched) initializeVisibleAniTracks();
  applyAnimation(state.animationFrame);
  updateFrameControls();
  renderAniBatchTrackSelection();
}

function renderAniTrackSelection() {
  el.aniTrackList.replaceChildren();
  if (!state.currentModel) return;
  if (!state.visibleAniTracks) initializeVisibleAniTracks();
  const keyed = new Set(getAnimatedPartNames());
  for (const part of state.currentModel.submeshes) {
    const partName = part.name;
    const label = document.createElement("label");
    label.className = "ani-track-choice ani-key-part";
    label.classList.toggle("has-key", keyed.has(partName));
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.visibleAniTracks.has(partName);
    checkbox.addEventListener("input", () => {
      state.aniTrackSelectionTouched = true;
      if (checkbox.checked) {
        state.visibleAniTracks.add(partName);
      } else {
        state.visibleAniTracks.delete(partName);
      }
      renderAniTimelineKeys();
      updateAniTimelineCursor(getAniRange().length > 0 ? (state.animationFrame - getAniRange().start) / getAniRange().length * 100 : 0);
    });
    const text = document.createElement("span");
    text.textContent = partName;
    label.append(checkbox, text);
    el.aniTrackList.append(label);
  }
}

function ensureAniTrack(partName) {
  if (!state.currentAnimation.tracks.has(partName)) {
    state.currentAnimation.tracks.set(partName, { boneName: partName, positions: [], rotations: [], scales: [] });
  }
  return state.currentAnimation.tracks.get(partName);
}

function moveAniPartKeyTime(partName, fromTime, toTime) {
  const track = state.currentAnimation?.tracks.get(partName);
  if (!track) return;
  for (const keys of [track.positions, track.rotations, track.scales]) {
    for (const key of keys) {
      if (isSameAniTime(key.time, fromTime)) key.time = toTime;
    }
    sortAniKeys(keys);
  }
  invalidateAniKeyTimeCache(partName);
}

function hasAniTransformKey(partName, type, time) {
  const track = state.currentAnimation?.tracks.get(partName);
  return !!track && getAniKeyArray(track, type).some((key) => isSameAniTime(key.time, time));
}

function setAniTransformKey(track, type, time, values) {
  const keys = getAniKeyArray(track, type);
  let key = keys.find((candidate) => isSameAniTime(candidate.time, time));
  if (!key) {
    key = { time, value: null };
    keys.push(key);
  }
  if (type === "rotation") {
    key.value = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      THREE.MathUtils.degToRad(values.x || 0),
      THREE.MathUtils.degToRad(values.y || 0),
      THREE.MathUtils.degToRad(values.z || 0),
      "XYZ"
    ));
  } else {
    key.value = new THREE.Vector3(values.x, values.y, values.z);
  }
  sortAniKeys(keys);
  invalidateAniKeyTimeCache(track.boneName);
}

function removeAniTransformKey(track, type, time) {
  const keys = getAniKeyArray(track, type);
  const index = keys.findIndex((key) => isSameAniTime(key.time, time));
  if (index >= 0) keys.splice(index, 1);
  invalidateAniKeyTimeCache(track.boneName);
}

function removeTrackKeysAtTime(track, time) {
  for (const type of ["position", "rotation", "scale"]) removeAniTransformKey(track, type, time);
}

function getAniKeyArray(track, type) {
  if (type === "position") return track.positions;
  if (type === "rotation") return track.rotations;
  return track.scales;
}

function sortAniKeys(keys) {
  keys.sort((a, b) => a.time - b.time);
}

function getAniTransformValues(partName, time) {
  const node = state.boneNodes.get(partName);
  const track = state.currentAnimation?.tracks.get(partName);
  const position = sampleVectorKey(track?.positions || [], time)?.clone()
    || node?.position?.clone()
    || new THREE.Vector3();
  const quaternion = sampleQuaternionKey(track?.rotations || [], time)?.clone()
    || node?.quaternion?.clone()
    || new THREE.Quaternion();
  const scale = sampleVectorKey(track?.scales || [], time)?.clone()
    || node?.scale?.clone()
    || new THREE.Vector3(1, 1, 1);
  const rotation = new THREE.Euler().setFromQuaternion(quaternion, "XYZ");
  return {
    position,
    rotation: {
      x: THREE.MathUtils.radToDeg(rotation.x),
      y: THREE.MathUtils.radToDeg(rotation.y),
      z: THREE.MathUtils.radToDeg(rotation.z)
    },
    scale
  };
}

function isSameAniTime(a, b) {
  return b != null && Math.abs(a - b) <= 0.00001;
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
  const newTextureName = value.trim() ? normalizeModelTextureName(value, { maxLength: isTrackBinModel() ? 63 : 31 }) : "";
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
    state.currentModel.materials.push(createMd9MaterialFromThree(null, normalizeModelTextureName(file.name, { maxLength: isTrackBinModel() ? 63 : 31 })));
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
    if (["w", "a", "s", "d", "e", "q"].includes(key)) {
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
    if (event.button === 0) {
      event.preventDefault();
      state.cameraDragPointerId = event.pointerId;
      state.cameraDragStart.set(event.clientX, event.clientY);
      state.cameraPointerMoved = false;
    }
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (state.cameraPointerLocked || state.cameraDragPointerId !== event.pointerId || event.buttons !== 1) return;
    if (state.cameraDragStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) <= PART_PICK_DRAG_THRESHOLD) return;
    state.cameraPointerMoved = true;
    requestCameraPointerLock();
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    state.cameraDragPointerId = null;
    if (state.cameraPointerLocked) {
      document.exitPointerLock?.();
    }
    if (state.cameraPointerMoved || pointerDown.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > PART_PICK_DRAG_THRESHOLD) return;
    pickPartFromViewport(event);
  });
  renderer.domElement.addEventListener("pointercancel", () => {
    state.cameraDragPointerId = null;
    if (state.cameraPointerLocked) document.exitPointerLock?.();
  });
  document.addEventListener("pointerlockchange", handleCameraPointerLockChange);
  document.addEventListener("mousemove", handleCameraPointerLockMove);
  document.addEventListener("mouseup", () => {
    state.cameraDragPointerId = null;
    if (state.cameraPointerLocked) document.exitPointerLock?.();
  });
}

function requestCameraPointerLock() {
  if (document.pointerLockElement === renderer.domElement) return;
  renderer.domElement.requestPointerLock?.();
}

function handleCameraPointerLockChange() {
  state.cameraPointerLocked = document.pointerLockElement === renderer.domElement;
  if (!state.cameraPointerLocked) state.cameraDragPointerId = null;
}

function handleCameraPointerLockMove(event) {
  if (!state.cameraPointerLocked) return;
  if (Math.hypot(event.movementX || 0, event.movementY || 0) > 0) state.cameraPointerMoved = true;
  rotateCameraByPointerMovement(event.movementX || 0, event.movementY || 0);
}

function rotateCameraByPointerMovement(movementX, movementY) {
  const offset = camera.position.clone().sub(controls.target);
  const yaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -movementX * POINTER_LOCK_ROTATE_SPEED);
  const up = camera.up.clone().applyQuaternion(yaw).normalize();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).applyQuaternion(yaw).normalize();
  offset.applyQuaternion(yaw);
  const pitch = new THREE.Quaternion().setFromAxisAngle(right, -movementY * POINTER_LOCK_ROTATE_SPEED);
  offset.applyQuaternion(pitch);
  up.applyQuaternion(pitch).normalize();
  camera.position.copy(controls.target).add(offset);
  camera.up.copy(up);
  camera.lookAt(controls.target);
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
  if (state.skeletonLines) state.skeletonLines.visible = el.showSkeleton.checked && !isTrackBinModel();
  el.meshNameOverlay.hidden = !state.currentModel || !el.showMeshNames.checked;
  if (!el.meshNameOverlay.hidden) updateMeshNameLabels();
  if (state.bounds) state.bounds.visible = el.showBounds.checked;
  for (const entry of state.meshEntries) {
    sanitizeMaterialTextures(entry.material);
    entry.material.wireframe = el.showWireframe.checked;
    entry.material.map = el.showTextures.checked ? getMaterialBaseMap(entry.material) : null;
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
  const sampleTime = time >= duration ? duration : ((time % duration) + duration) % duration;
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
  camera.up.set(0, 1, 0);
  camera.updateProjectionMatrix();
  controls.update();
}

async function saveCurrentModel() {
  if (!state.currentModel) return;
  el.saveModel.disabled = true;
  const saveSnapshot = captureSaveMutationSnapshot(state.currentModel);
  try {
    validateModelForSave(state.currentModel);
    const zipEntries = [];
    const isTrackBin = isTrackBinModel(state.currentModel);
    const extension = isTrackBin ? ".bin" : ".md9";
    const originalName = state.currentModel.name.split(/[\\/]/).pop() || `model${extension}`;
    const defaultBaseName = originalName.replace(/\.[^.]+$/, "") || "model";
    const chosenName = window.prompt(t("modelNamePrompt"), defaultBaseName);
    if (chosenName === null) return;
    const baseName = normalizeModelBaseName(chosenName || defaultBaseName);
    setStatus("Preparing save...");
    await nextFrame();
    await bakeReplacementAtlas(state.currentModel, zipEntries);
    const modelBytes = isTrackBin
      ? serializeTrackBin(createBakedTrackModelForSave(state.currentModel))
      : serializeMd9(createMd9ModelForSave(state.currentModel));
    for (const animation of isTrackBin ? [] : (state.currentModel.generatedAnimations || [])) {
      zipEntries.push({ name: sanitizeFilename(animation.name || "animation.ani"), data: new Blob([serializeAni(animation)], { type: "application/octet-stream" }) });
    }
    zipEntries.unshift({ name: `${baseName}${extension}`, data: new Blob([modelBytes], { type: "application/octet-stream" }) });
    zipEntries.push(...getSaveDependencyEntries(state.currentModel, zipEntries));
    const zip = await createZipBlob(zipEntries);
    downloadBlob(zip, `${sanitizeFilename(baseName)}.zip`);
    setStatus(t("savedMd9", { name: `${baseName}.zip` }));
  } catch (error) {
    console.error(error);
    setStatus(t("saveFailed", { message: error.message }));
  } finally {
    restoreSaveMutationSnapshot(state.currentModel, saveSnapshot);
    el.saveModel.disabled = !state.currentModel;
  }
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function validateModelForSave(model) {
  if (!model || isTrackBinModel(model)) return;
  validateParentHierarchy(model.submeshes);
}

function normalizeModelBaseName(name) {
  return sanitizeFilename(String(name || "model").replace(/\.(md9|bin)$/i, "").trim() || "model");
}

function createMd9ModelForSave(model) {
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
    submeshes: model.submeshes.map(createMd9PartForSave)
  };
}

function createMd9PartForSave(part) {
  return {
    ...part,
    matrix: part.matrix ? [...part.matrix] : createIdentityMatrixArray(),
    boundingBox: [...part.boundingBox],
    localPositions: new Float32Array(part.localPositions),
    normals: new Float32Array(part.normals),
    uvs: new Float32Array(part.uvs),
    indices: new Uint16Array(part.indices)
  };
}

function createBakeHierarchyContext(model) {
  validateParentHierarchy(model.submeshes);
  const localMatrices = model.submeshes.map((part) => md9ArrayToRenderMatrix(part.matrix));
  const worldMatrices = new Map();
  const savedWorldPositions = new Map();
  const visitingWorld = new Set();
  const visitingPosition = new Set();
  const getWorldMatrix = (index) => {
    if (worldMatrices.has(index)) return worldMatrices.get(index);
    if (visitingWorld.has(index)) throw new Error("Parent hierarchy contains a cycle.");
    visitingWorld.add(index);
    const part = model.submeshes[index];
    const parentWorld = part.parentId >= 0 ? getWorldMatrix(part.parentId) : new THREE.Matrix4();
    const world = new THREE.Matrix4().multiplyMatrices(parentWorld, localMatrices[index]);
    worldMatrices.set(index, world);
    visitingWorld.delete(index);
    return world;
  };
  const getSavedWorldPosition = (index) => {
    if (savedWorldPositions.has(index)) return savedWorldPositions.get(index);
    if (visitingPosition.has(index)) throw new Error("Parent hierarchy contains a cycle.");
    visitingPosition.add(index);
    const position = new THREE.Vector3().setFromMatrixPosition(getWorldMatrix(index));
    savedWorldPositions.set(index, position);
    visitingPosition.delete(index);
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
    trackParts: model.submeshes.map((part) => {
      const snapshot = {};
      copyTrackPartMetadata(part, snapshot);
      return snapshot;
    }),
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
    const match = findCompatibleTexture(material.textureName, model.baseDir || "");
    if (!match?.fileOrUrl || !(match.fileOrUrl instanceof File)) continue;
    const entryName = match.name || material.textureName;
    const key = textureKey(entryName);
    if (existing.has(key)) continue;
    entries.push({ name: entryName, data: match.fileOrUrl });
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
    if (floatArraysEqual(model.submeshes[index].uvs, uvs)) continue;
    model.submeshes[index].uvs = new Float32Array(uvs);
    updatePartUvAttribute(index);
  }
  for (const [index, metadata] of (snapshot.trackParts || []).entries()) {
    if (!model.submeshes[index]) continue;
    copyTrackPartMetadata(metadata, model.submeshes[index]);
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
  applyOptions();
}

function updatePartUvAttribute(index) {
  const part = state.currentModel?.submeshes[index];
  const geometry = state.meshEntries[index]?.mesh?.geometry;
  if (!part || !geometry) return;
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(part.uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
}

function floatArraysEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function bakeReplacementAtlas(model, zipEntries = null) {
  const handled = new Set();
  for (const part of model.submeshes) {
    const material = model.materials[part.materialId];
    if (!material || handled.has(material)) continue;
    if (!material.atlasSourceFile && !material.atlasSourceImage) continue;
    handled.add(material);
    const textureName = material.textureName
      ? normalizeModelTextureName(material.textureName, { defaultExt: ".dds", maxLength: isTrackBinModel(model) ? 63 : 31 })
      : makePartTextureName(part.name);
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
  const textureName = normalizeModelTextureName(chosen || defaultName, { defaultExt: ".dds", maxLength: isTrackBinModel() ? 63 : 31 });
  downloadBlob(await canvasToDxt3DdsBlob(canvas), textureName);
  return textureName;
}

async function collectTextureAndAskName(canvas, defaultName, zipEntries) {
  if (!zipEntries) return downloadTextureAndAskName(canvas, defaultName);
  const chosen = window.prompt(t("textureNamePrompt"), defaultName);
  const textureName = normalizeModelTextureName(chosen || defaultName, { defaultExt: ".dds", maxLength: isTrackBinModel() ? 63 : 31 });
  zipEntries.push({ name: textureName, data: await canvasToDxt3DdsBlob(canvas) });
  return textureName;
}

async function canvasToPngBlob(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error(t("pngEncodeFailed"));
  return blob;
}

function normalizeMd9TextureName(name) {
  return normalizeModelTextureName(name, { defaultExt: ".dds", maxLength: 31 });
}

function normalizeModelTextureName(name, options = {}) {
  const maxLength = options.maxLength || 31;
  const defaultExt = options.defaultExt || "";
  let cleaned = String(name || "texture").split(/[\\/]/).pop().trim() || "texture";
  if (defaultExt && !/\.[^.\\/]+$/.test(cleaned)) cleaned += defaultExt;
  if (cleaned.length <= maxLength) return cleaned;
  const dot = cleaned.lastIndexOf(".");
  if (dot > 0 && dot < cleaned.length - 1) {
    const ext = cleaned.slice(dot);
    const stem = cleaned.slice(0, dot);
    return `${stem.slice(0, Math.max(1, maxLength - ext.length))}${ext.slice(0, maxLength - 1)}`.slice(0, maxLength);
  }
  return cleaned.slice(0, maxLength);
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

function createBakedTrackModelForSave(model) {
  const baked = {
    ...model,
    materials: model.materials.map((material) => ({
      ...material,
      diffuse: [...material.diffuse],
      ambient: [...material.ambient],
      specular: [...material.specular],
      emissive: [...material.emissive],
      trackTextureBytes: material.trackTextureBytes ? [...material.trackTextureBytes] : undefined
    })),
    submeshes: model.submeshes.map((part) => {
      const bakedGeometry = bakeTrackPartGeometryForSave(part);
      const positions = bakedGeometry.positions;
      const normals = bakedGeometry.normals;
      const clone = {
        ...part,
        matrix: new THREE.Matrix4().identity().toArray(),
        boundingBox: boxToTrackBoundingArray(computeArrayBox(positions)),
        localPositions: positions,
        normals,
        uvs: new Float32Array(part.uvs),
        indices: new Uint16Array(part.indices),
        parentId: -1
      };
      copyTrackPartMetadata(part, clone);
      return clone;
    })
  };
  updateGeneratedModelCounts(baked);
  return baked;
}

function bakeTrackPartGeometryForSave(part) {
  const transform = getTrackPartWorldTransform(part);
  if (isIdentityMatrix(transform)) {
    return {
      positions: new Float32Array(part.localPositions),
      normals: new Float32Array(part.normals)
    };
  }
  const positions = new Float32Array(part.localPositions.length);
  const normals = new Float32Array(part.normals.length);
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(transform);
  for (let i = 0; i < part.localPositions.length; i += 3) {
    point.set(part.localPositions[i], part.localPositions[i + 1], part.localPositions[i + 2]).applyMatrix4(transform);
    positions[i] = point.x;
    positions[i + 1] = point.y;
    positions[i + 2] = point.z;
  }
  for (let i = 0; i < part.normals.length; i += 3) {
    normal.set(part.normals[i], part.normals[i + 1], part.normals[i + 2]).applyMatrix3(normalMatrix).normalize();
    normals[i] = normal.x;
    normals[i + 1] = normal.y;
    normals[i + 2] = normal.z;
  }
  return { positions, normals };
}

function isIdentityMatrix(matrix, epsilon = 1e-8) {
  const elements = matrix?.elements || [];
  for (let i = 0; i < 16; i++) {
    const expected = i % 5 === 0 ? 1 : 0;
    if (Math.abs((elements[i] ?? 0) - expected) > epsilon) return false;
  }
  return true;
}

function serializeTrackBin(model) {
  const sections = collectTrackSectionsForSave(model);
  const materialBytes = 4 + model.materials.length * 132;
  let sectionBytes = 4;
  for (const section of sections) {
    sectionBytes += 12 + section.vertexCount * 32 + section.faceCount * 3 * 2 + 4 + section.parts.length * 28;
  }
  const buffer = new ArrayBuffer(materialBytes + sectionBytes);
  const view = new DataView(buffer);
  let offset = 0;
  const writeInt = (value) => {
    view.setInt32(offset, value, true);
    offset += 4;
  };
  const writeUint16 = (value) => {
    view.setUint16(offset, value, true);
    offset += 2;
  };
  const writeFloat = (value) => {
    view.setFloat32(offset, value, true);
    offset += 4;
  };
  const writeTrackTextureName = (material) => {
    const bytes = buildTrackTextureBytes(material);
    new Uint8Array(buffer, offset, 64).set(bytes);
    offset += 64;
  };

  writeInt(model.materials.length);
  for (const material of model.materials) {
    for (const value of material.diffuse) writeFloat(value);
    for (const value of material.ambient) writeFloat(value);
    for (const value of material.specular) writeFloat(value);
    for (const value of material.emissive) writeFloat(value);
    writeFloat(material.power);
    writeTrackTextureName(material);
  }

  writeInt(sections.length);
  for (const section of sections) {
    writeFloat(section.angleRadians);
    writeInt(section.vertexCount);
    writeInt(section.faceCount);
    for (const part of section.parts) {
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
    for (const part of section.parts) {
      for (const index of part.indices) writeUint16(index + part.trackVertexStart);
    }
    writeInt(section.parts.length);
    for (const part of section.parts) {
      writeInt(part.materialId);
      writeInt(part.vertexCount);
      writeInt(part.faceCount);
      writeInt(part.trackVertexStart);
      writeInt(part.trackAlphaFlag ?? 0);
      writeInt(part.trackCullFlag ?? 1);
      writeInt(part.trackSentinel ?? TRACK_BIN_RANGE_SENTINEL);
    }
  }
  return buffer;
}

function collectTrackSectionsForSave(model) {
  const sectionCount = Math.max(32, ...model.submeshes.map((part) => Number.isInteger(part.trackSectionId) ? part.trackSectionId + 1 : 1));
  const sections = Array.from({ length: sectionCount }, (_, index) => ({
    angleRadians: model.trackSections?.[index]?.angleRadians ?? THREE.MathUtils.degToRad(5.625 + index * 11.25),
    parts: []
  }));
  for (const part of model.submeshes) {
    const sectionId = Number.isInteger(part.trackSectionId) && part.trackSectionId >= 0 ? part.trackSectionId : 0;
    sections[sectionId].parts.push(part);
  }
  for (const [sectionId, section] of sections.entries()) {
    section.parts.sort((a, b) => (a.trackIndexId ?? 0) - (b.trackIndexId ?? 0));
    let vertexStart = 0;
    section.faceCount = 0;
    for (const [trackIndex, part] of section.parts.entries()) {
      part.trackSectionId = sectionId;
      part.trackIndexId = trackIndex;
      part.name = makeTrackPartName(sectionId, trackIndex);
      part.trackVertexStart = vertexStart;
      vertexStart += part.vertexCount;
      section.faceCount += part.faceCount;
    }
    section.vertexCount = vertexStart;
    if (section.vertexCount > 65535) throw new Error(t("replacementTooLarge"));
  }
  return sections;
}

function buildTrackTextureBytes(material) {
  const existing = material.trackTextureBytes ? Uint8Array.from(material.trackTextureBytes.slice(0, 64)) : null;
  if (existing && readTextureNameFromBytes(existing) === (material.textureName || "")) return existing;
  const bytes = new Uint8Array(64);
  bytes.fill(0xcc);
  const text = String(material.textureName || "");
  const length = Math.min(text.length, 63);
  for (let i = 0; i < length; i++) bytes[i] = text.charCodeAt(i) & 0x7f;
  bytes[length] = 0;
  return bytes;
}

function readTextureNameFromBytes(bytes) {
  let text = "";
  for (const byte of bytes) {
    if (byte === 0 || byte === 0xcc) break;
    if (byte >= 32 && byte < 127) text += String.fromCharCode(byte);
  }
  return text.trim();
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
  if (!state.currentModel) updateReferenceScale();
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
        const map = getRenderableTexture(material.map);
        const baseMap = getRenderableTexture(material.userData?.baseMap);
        if (map) textures.add(map);
        if (baseMap) textures.add(baseMap);
      }
    }
  });
  for (const geometry of geometries) geometry.dispose?.();
  for (const texture of textures) texture.dispose?.();
  for (const material of materials) material.dispose?.();
}

function setStatus(message) {
  el.status.textContent = message;
  updateStatusPosition();
}

function updateStatusPosition() {
  if (state.currentAnimation && !el.aniTimelinePanel.hidden) {
    const rect = el.aniTimelinePanel.getBoundingClientRect();
    el.status.style.bottom = `${Math.max(14, window.innerHeight - rect.top + 10)}px`;
  } else {
    el.status.style.removeProperty("bottom");
  }
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
  const rect = el.viewerCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, true);
  if (state.currentAnimation && !el.aniTimelinePanel.hidden) drawAniTimelineCanvas();
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const deltaSeconds = Math.min((now - state.lastFrameTime) / 1000, 0.1);
  state.lastFrameTime = now;
  if (state.currentAnimation && el.autoPlay.checked) {
    const range = getAniRange();
    applyAnimation(range.start + (((getNow() - state.animationStartTime) * ANIMATION_FPS) % range.length));
    updateAniTimelinePlayback();
  }
  updateKeyboardCamera(deltaSeconds);
  updateMeshNameLabels();
  if (state.highlightedHelper) {
    state.highlightedHelper.visible = state.meshEntries[state.highlightedPartIndex]?.mesh?.visible ?? false;
    state.highlightedHelper.update?.();
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
  if (state.cameraKeys.has("e")) move.y += 1;
  if (state.cameraKeys.has("q")) move.y -= 1;
  if (move.lengthSq() < 0.0001) return;
  const distance = Math.max(camera.position.distanceTo(controls.target), 1);
  move.normalize().multiplyScalar(distance * 0.9 * deltaSeconds);
  camera.position.add(move);
  controls.target.add(move);
}

function getNow() {
  return clock.getElapsedTime();
}
