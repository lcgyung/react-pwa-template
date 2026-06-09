// 플레이스홀더 PWA 아이콘 생성기 (의존성 없음, zlib만 사용).
// 브랜드 색 배경 + 중앙에 둥근 사각형 + 'P' 글리프(단순 비트맵)를 그려 단색보다 식별성을 높인다.
// 실제 배포 시 public/ 의 아이콘을 브랜드 에셋으로 교체하세요.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

// CRC32
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

// 색상
const BG = [15, 23, 42]; // slate-900 (#0f172a) — theme_color
const FG = [56, 189, 248]; // sky-400 (#38bdf8)

// 5x7 비트맵 'P'
const GLYPH_P = ['11110', '10001', '10001', '11110', '10000', '10000', '10000'];

function makePng(size, maskable) {
  // maskable: 안전영역 확보를 위해 글리프를 더 작게(가운데 60%).
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b]) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = 255;
  };
  // 배경
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, BG);

  // 글리프 영역
  const glyphFrac = maskable ? 0.42 : 0.56;
  const gw = 5,
    gh = 7;
  const cell = Math.floor((size * glyphFrac) / gh);
  const totalW = gw * cell;
  const totalH = gh * cell;
  const ox = Math.floor((size - totalW) / 2);
  const oy = Math.floor((size - totalH) / 2);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (GLYPH_P[gy][gx] === '1') {
        for (let dy = 0; dy < cell; dy++)
          for (let dx = 0; dx < cell; dx++) set(ox + gx * cell + dx, oy + gy * cell + dy, FG);
      }
    }
  }

  // 스캔라인(필터 바이트 0) 추가
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-192-maskable.png', 192, true],
  ['icon-512-maskable.png', 512, true],
  ['apple-touch-icon.png', 180, false],
];
for (const [name, size, maskable] of targets) {
  writeFileSync(join(PUBLIC, name), makePng(size, maskable));
  console.log('wrote', name, `${size}x${size}`, maskable ? '(maskable)' : '');
}

// favicon.svg (벡터)
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0f172a"/><text x="32" y="44" font-family="system-ui,sans-serif" font-size="40" font-weight="700" fill="#38bdf8" text-anchor="middle">P</text></svg>`;
writeFileSync(join(PUBLIC, 'favicon.svg'), favicon);
console.log('wrote favicon.svg');
