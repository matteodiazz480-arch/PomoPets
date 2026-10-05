// One-off script: renders a soft pastel cartoon "habitat" background PNG as a placeholder.
// Run with: node scripts/generate-background.js
// The app loads this file by its exact name (Pets/Background.png) — overwrite it with your
// own artwork later and no code changes are needed.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 1080;
const H = 1920;
const OUT = path.join(__dirname, '..', 'Pets', 'Background.png');

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

const sky1 = hexToRgb('#CDEBFF');
const sky2 = hexToRgb('#F5FBFF');
const hillBack = hexToRgb('#CDECC9');
const hillFront = hexToRgb('#AEE0B4');
const sunColor = hexToRgb('#FFF3D0');

const pixels = Buffer.alloc(W * H * 3);

function setPx(x, y, rgb) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 3;
  pixels[idx] = rgb[0];
  pixels[idx + 1] = rgb[1];
  pixels[idx + 2] = rgb[2];
}

// sky gradient
for (let y = 0; y < H; y++) {
  const t = y / H;
  const col = lerpColor(sky1, sky2, Math.min(1, t * 1.3));
  for (let x = 0; x < W; x++) setPx(x, y, col);
}

// soft sun glow
const sunCx = W * 0.78;
const sunCy = H * 0.16;
const sunR = 130;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - sunCx, y - sunCy);
    if (d < sunR * 2.2) {
      const glow = Math.max(0, 1 - d / (sunR * 2.2));
      const idx = (y * W + x) * 3;
      const base = [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
      const mixed = lerpColor(base, sunColor, glow * (d < sunR ? 0.9 : 0.35));
      setPx(x, y, mixed);
    }
  }
}

// clouds: soft white ellipses
function drawEllipse(cx, cy, rx, ry, rgb, opacity) {
  const minX = Math.max(0, Math.floor(cx - rx));
  const maxX = Math.min(W - 1, Math.ceil(cx + rx));
  const minY = Math.max(0, Math.floor(cy - ry));
  const maxY = Math.min(H - 1, Math.ceil(cy + ry));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const d2 = nx * nx + ny * ny;
      if (d2 <= 1) {
        const edge = 1 - Math.sqrt(d2);
        const a = Math.min(1, opacity * (0.5 + edge));
        const idx = (y * W + x) * 3;
        const base = [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
        const mixed = lerpColor(base, rgb, a);
        setPx(x, y, mixed);
      }
    }
  }
}

const white = [255, 255, 255];
drawEllipse(W * 0.2, H * 0.11, 95, 40, white, 0.85);
drawEllipse(W * 0.32, H * 0.095, 65, 30, white, 0.85);
drawEllipse(W * 0.13, H * 0.13, 55, 26, white, 0.75);
drawEllipse(W * 0.62, H * 0.07, 70, 28, white, 0.6);
drawEllipse(W * 0.7, H * 0.085, 45, 20, white, 0.6);

// rolling hills, back layer
function drawHillBand(baseY, amplitude, freq, phase, rgb) {
  const heights = new Array(W);
  for (let x = 0; x < W; x++) {
    heights[x] = baseY + Math.sin((x / W) * Math.PI * freq + phase) * amplitude;
  }
  for (let x = 0; x < W; x++) {
    for (let y = Math.floor(heights[x]); y < H; y++) setPx(x, y, rgb);
  }
}

drawHillBand(H * 0.72, 45, 2.2, 0.4, hillBack);
drawHillBand(H * 0.8, 35, 3, 2.1, hillFront);

// gentle vignette at the very bottom for depth
for (let y = Math.floor(H * 0.9); y < H; y++) {
  const t = (y - H * 0.9) / (H * 0.1);
  for (let x = 0; x < W; x++) {
    const idx = (y * W + x) * 3;
    const base = [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
    const mixed = lerpColor(base, [Math.max(0, base[0] - 20), Math.max(0, base[1] - 20), Math.max(0, base[2] - 20)], t * 0.4);
    setPx(x, y, mixed);
  }
}

writePng(OUT, W, H, pixels);
console.log('wrote', OUT);

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function writePng(filePath, width, height, rgbBuf) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // raw scanlines with filter byte 0 per row
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0;
    rgbBuf.copy(raw, rowStart + 1, y * width * 3, (y + 1) * width * 3);
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });

  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, png);
}
