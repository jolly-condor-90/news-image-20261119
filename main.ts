// make.fun news-image-20261119 — "The World Today", Thursday 19 November 2026.
// The rendered front page is bundled as entry.png. This program only checks that
// the asset is a whole PNG within the gate's limits, then copies the exact bytes
// to the path the grader reads. It makes no network calls and is deterministic.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outputDir, 'entry.png');

const image: Buffer = readFileSync(source);
const PNG_SIGNATURE = '89504e470d0a1a0a';

// Fail loudly rather than copy a truncated file or a different image format.
if (image.length < 24 || image.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) {
  throw new Error(`${source} is not a whole PNG`);
}

// IHDR stores width and height as big-endian 32-bit integers at bytes 16 and 20.
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024 || image.length > 1048576) {
  throw new Error(`image ${width}x${height}, ${image.length} bytes, exceeds the gate`);
}

// The grader creates /output; creating it here also lets local runs succeed.
mkdirSync(outputDir, { recursive: true });
writeFileSync(target, image);
console.log(`wrote ${target} (${width}x${height}, ${image.length} bytes)`);
