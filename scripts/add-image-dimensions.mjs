import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceRoot = join(projectRoot, 'src');
const publicRoot = join(projectRoot, 'public');
const jpegStartOfFrameMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolutePath = join(directory, entry.name);
  return entry.isDirectory() ? walk(absolutePath) : absolutePath;
});

const dimensionsFromBuffer = (buffer) => {
  if (buffer.length >= 24 && buffer.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length >= 10 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      if (jpegStartOfFrameMarkers.has(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }

      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }

      const segmentLength = buffer.readUInt16BE(offset + 2);
      if (segmentLength < 2) break;
      offset += 2 + segmentLength;
    }
  }

  return undefined;
};

let changedFiles = 0;
let changedImages = 0;

for (const file of walk(sourceRoot).filter((path) => ['.astro', '.html'].includes(extname(path)))) {
  const source = readFileSync(file, 'utf8');
  const updated = source.replace(/<img\b[^>]*\bsrc=(?:"([/][^"{]+)"|'([/][^'{]+)')[^>]*>/gi, (tag, doubleQuoted, singleQuoted) => {
    const imageSource = doubleQuoted ?? singleQuoted;
    if (!imageSource.startsWith('/images/')) return tag;

    const attributes = [];
    const hasWidth = /\bwidth\s*=/.test(tag);
    const hasHeight = /\bheight\s*=/.test(tag);
    if (!hasWidth || !hasHeight) {
      try {
        const imagePath = join(publicRoot, decodeURIComponent(imageSource).replace(/^\/+/, ''));
        const dimensions = dimensionsFromBuffer(readFileSync(imagePath));
        if (dimensions && !hasWidth) attributes.push(`width="${dimensions.width}"`);
        if (dimensions && !hasHeight) attributes.push(`height="${dimensions.height}"`);
      } catch {
        // The site audit reports missing image files separately.
      }
    }

    if (!/\bloading\s*=/.test(tag)) attributes.push('loading="lazy"');
    if (!/\bdecoding\s*=/.test(tag)) attributes.push('decoding="async"');
    if (!attributes.length) return tag;

    changedImages += 1;
    return tag.replace(/\s*\/?>$/, (ending) => ` ${attributes.join(' ')}${ending.includes('/') ? ' />' : '>'}`);
  });

  if (updated !== source) {
    writeFileSync(file, updated);
    changedFiles += 1;
  }
}

console.log(`Обновлено изображений: ${changedImages}; файлов: ${changedFiles}`);
