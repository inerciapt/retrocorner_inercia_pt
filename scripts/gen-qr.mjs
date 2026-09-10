import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

function baseUrl() {
  const toml = readFileSync(join(root, 'hugo.toml'), 'utf8');
  const m = toml.match(/^baseURL\s*=\s*['"]([^'"]+)['"]/m);
  if (!m) {
    console.error('gen-qr: no baseURL found in hugo.toml');
    process.exit(1);
  }
  return m[1].replace(/\/+$/, '');
}

function slugs() {
  const out = new Set();
  for (const file of readdirSync(join(root, 'content'))) {
    if (!file.endsWith('.md')) continue;
    const text = readFileSync(join(root, 'content', file), 'utf8');
    const block = text.match(/^---([\s\S]*?)^---/m);
    if (!block) continue;
    const slug = block[1].match(/^slug:\s*"?([\w-]+)"?/m);
    if (slug) out.add(slug[1]);
  }
  return [...out].sort();
}

function renderSvg(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const m = 4;
  const size = n + m * 2;
  let out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges"><rect width="' + size + '" height="' + size + '" fill="#ffffff"/>';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) {
        out += '<rect x="' + (c + m) + '" y="' + (r + m) + '" width="1" height="1" fill="#061213"/>';
      }
    }
  }
  return out + '</svg>';
}

const host = baseUrl();
const dir = join(root, 'assets', 'qr');
mkdirSync(dir, { recursive: true });

for (const slug of slugs()) {
  const url = host + '/' + slug + '/';
  writeFileSync(join(dir, slug + '.svg'), renderSvg(url));
}

console.log(`gen-qr: wrote ${slugs().length} QR codes to assets/qr/ (host ${host})`);