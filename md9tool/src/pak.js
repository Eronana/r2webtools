export const FileType = {
  RAW: 0,
  LZSS: 1,
  DIRECTORY: 2,
  LZSSXOR: 3
};

const defaultOptions = {
  fileNameEncoding: "gbk",
  cacheData: false
};

export function readPakFromBuffer(buffer, options = defaultOptions) {
  const bytes = toBytes(buffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fileIndexOffset = view.getUint32(bytes.length - 9, true);
  const fileCount = view.getUint32(bytes.length - 5, true);
  const files = [];
  let offset = fileIndexOffset;
  for (let i = 0; i < fileCount; i++) {
    const result = readFile(bytes, offset, options);
    files.push(result.file);
    offset = result.nextOffset;
  }
  return files;
}

export class PakFile {
  constructor(bytes, fileInfo, cache = false) {
    this.bytes = bytes.slice(fileInfo.dataOffset, fileInfo.dataOffset + fileInfo.encodedSize);
    this.fileInfo = fileInfo;
    this.cache = cache;
    this.cachedData = undefined;
  }

  get name() {
    return this.fileInfo.fileName;
  }

  get type() {
    return this.fileInfo.fileType;
  }

  get size() {
    return this.fileInfo.originalSize;
  }

  get isDirectory() {
    return this.fileInfo.fileType === FileType.DIRECTORY;
  }

  get data() {
    if (!this.cachedData) {
      this.cachedData = decodeFileData(this.bytes, this.fileInfo);
      if (!this.cache) {
        const data = this.cachedData;
        this.cachedData = undefined;
        return data;
      }
    }
    return this.cachedData;
  }
}

export { PakFile as File };

function readFile(bytes, offset, options = defaultOptions) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const fileNameLength = bytes[offset];
  const fileType = bytes[offset + 1];
  const dataOffset = view.getUint32(offset + 2, true);
  const encodedSize = view.getUint32(offset + 6, true);
  const originalSize = view.getUint32(offset + 10, true);
  const fileNameOffset = offset + 14;
  const fileNameBytes = bytes.slice(fileNameOffset, fileNameOffset + fileNameLength);
  const fileName = decodeFileName(fileNameBytes, options.fileNameEncoding);
  const file = new PakFile(bytes, {
    fileName,
    fileType,
    dataOffset,
    encodedSize,
    originalSize
  }, options.cacheData);
  return {
    file,
    nextOffset: fileNameOffset + fileNameLength + 1
  };
}

function decodeFileData(bytes, fileInfo) {
  switch (fileInfo.fileType) {
    case FileType.LZSS:
      return lzssDecode(bytes, fileInfo.originalSize);
    case FileType.DIRECTORY:
    case FileType.RAW:
      return bytes;
    case FileType.LZSSXOR:
      return lzssXorDecode(bytes, fileInfo.originalSize);
    default:
      throw new Error(`unknown file type: ${fileInfo.fileType}`);
  }
}

function lzssDecode(bytes, originalSize) {
  const out = new Uint8Array(originalSize);
  let inIdx = 0;
  let outIdx = 0;
  let flags = 0;
  while (inIdx < bytes.length && outIdx < out.length) {
    flags >>= 1;
    if (!(flags & 0x100)) {
      flags = bytes[inIdx++] | 0xff00;
      if (inIdx >= bytes.length) break;
    }
    if (flags & 1) {
      const pair = readUint16LE(bytes, inIdx);
      const pos = pair & 0x0fff;
      const length = (pair >> 12) + 2;
      copyOverlap(out, outIdx, outIdx - pos, length);
      inIdx += 2;
      outIdx += length;
    } else {
      out[outIdx++] = bytes[inIdx++];
    }
  }
  return out;
}

function lzssXorDecode(bytes, originalSize) {
  const xorData = [0xff21, 0x834f, 0x675f, 0x0034, 0xf237, 0x815f, 0x4765, 0x0233];
  const out = new Uint8Array(originalSize);
  let inIdx = 0;
  let outIdx = 0;
  let flags = 0;
  let counter = 0;
  while (inIdx < bytes.length && outIdx < out.length) {
    if (counter++ & 7) {
      flags >>= 1;
    } else {
      flags = bytes[inIdx++] ^ 0xb4;
      if (inIdx >= bytes.length) break;
    }
    if (flags & 1) {
      const pair = readUint16LE(bytes, inIdx) ^ xorData[(flags >> 3) & 7];
      const pos = pair & 0x0fff;
      const length = (pair >> 12) + 2;
      copyOverlap(out, outIdx, outIdx - pos, length);
      inIdx += 2;
      outIdx += length;
    } else {
      out[outIdx++] = bytes[inIdx++] ^ 0xb4;
    }
  }
  return out;
}

function copyOverlap(out, destOffset, srcOffset, length) {
  for (let i = 0; i < length; i++) {
    out[destOffset + i] = srcOffset + i >= 0 ? out[srcOffset + i] : 0;
  }
}

function readUint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function decodeFileName(bytes, encoding) {
  const labels = [encoding, "gbk", "gb18030", "utf-8"];
  for (const label of labels) {
    try {
      return new TextDecoder(label).decode(bytes).replace(/\0+$/, "");
    } catch (error) {
      // Try the next decoder label.
    }
  }
  return String.fromCharCode(...bytes).replace(/\0+$/, "");
}

function toBytes(buffer) {
  if (buffer instanceof Uint8Array) return buffer;
  if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
  if (ArrayBuffer.isView(buffer)) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  throw new Error("Unsupported pak buffer");
}
