// Brand asset generator for TrailWord.
// Renders app icons + og-image from vector definitions using @resvg/resvg-js.
// Run: node scripts/generate-assets.mjs
// Outputs into public/. Fonts: Space Grotesk (OFL) in scripts/fonts/.

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
mkdirSync(out, { recursive: true });

const FONTS = [
  join(root, 'scripts/fonts/SpaceGrotesk-Bold.ttf'),
  join(root, 'scripts/fonts/SpaceGrotesk-Medium.ttf'),
];

function render(svg, width, file) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Space Grotesk' },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(out, file), png);
  console.log(`${file}  ${width}px  ${(png.length / 1024).toFixed(1)} KB`);
}

/* ---------------------------------------------------------------- */
/* App icon — marshmallow tile with bold T and a rising trail       */
/* of three mini-tiles. `detail: false` drops the trail + fine      */
/* highlights so the mark stays legible at 16-32px.                 */
/* ---------------------------------------------------------------- */

function iconSvg({ detail = true } = {}) {
  const trail = detail
    ? `
    <!-- trail of mini-tiles rising to the right -->
    <rect x="296" y="392" width="52" height="52" rx="16" fill="#ffffff" opacity="0.38"/>
    <rect x="360" y="360" width="52" height="52" rx="16" fill="#ffffff" opacity="0.62"/>
    <rect x="424" y="328" width="52" height="52" rx="16" fill="#ffffff" opacity="0.92"/>`
    : '';
  const gloss = detail
    ? `
    <!-- marshmallow top gloss -->
    <rect x="28" y="28" width="456" height="228" rx="100" fill="url(#gloss)"/>`
    : '';
  return `
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f2b0a6"/>
      <stop offset="0.55" stop-color="#e89890"/>
      <stop offset="1" stop-color="#d97f76"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>

  <!-- pillowy tile base -->
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#bg)"/>
  <!-- inner rim light (marshmallow inset) -->
  <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="6"/>
  ${gloss}

  <!-- T shadow -->
  <g fill="#8f4a42" opacity="0.35" filter="url(#soft)" transform="translate(0,14)">
    <rect x="120" y="128" width="272" height="72" rx="36"/>
    <rect x="220" y="128" width="72" height="268" rx="36"/>
  </g>
  <!-- T -->
  <g fill="#ffffff">
    <rect x="120" y="120" width="272" height="72" rx="36"/>
    <rect x="220" y="120" width="72" height="268" rx="36"/>
  </g>
  ${trail}
</svg>`;
}

/* ---------------------------------------------------------------- */
/* og-image 1200x630 — cream marshmallow scene: wordmark left,      */
/* mid-solve board right.                                           */
/* ---------------------------------------------------------------- */

// light-mode tile palette from src/index.css
const TILE = {
  correct: { bg: '#e89890', text: '#ffffff' },
  present: { bg: '#edd5d5', text: '#7a5a54' },
  absent: { bg: '#ece8e4', text: '#a09890' },
  empty: { bg: '#f6f1ec', text: '#c8beb6' },
};

function ogTile(x, y, size, letter, status) {
  const t = TILE[status];
  const r = Math.round(size * 0.22);
  const inner =
    status === 'empty'
      ? `<rect x="${x + 3}" y="${y + 3}" width="${size - 6}" height="${size - 6}" rx="${r - 2}" fill="none" stroke="#e2d8d0" stroke-width="2"/>`
      : `<rect x="${x + 3}" y="${y + 3}" width="${size - 6}" height="${Math.round(size * 0.45)}" rx="${r - 2}" fill="#ffffff" opacity="0.22"/>`;
  const shadow =
    status === 'empty'
      ? ''
      : `<rect x="${x}" y="${y + 5}" width="${size}" height="${size}" rx="${r}" fill="#c9a89e" opacity="0.35"/>`;
  const letterEl = letter
    ? `<text x="${x + size / 2}" y="${y + size / 2}" dy="0.36em" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${Math.round(size * 0.5)}" fill="${t.text}">${letter}</text>`
    : '';
  return `${shadow}<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="${t.bg}"/>${inner}${letterEl}`;
}

function ogBoard(ox, oy, size, gap) {
  const rows = [
    { word: 'TRAIL', statuses: ['correct', 'correct', 'correct', 'correct', 'correct'] },
    { word: 'WORD ', statuses: ['present', 'absent', 'present', 'absent', 'empty'] },
    { word: '     ', statuses: ['empty', 'empty', 'empty', 'empty', 'empty'] },
  ];
  let s = '';
  rows.forEach((row, ri) => {
    for (let ci = 0; ci < 5; ci++) {
      const letter = row.word[ci].trim();
      s += ogTile(ox + ci * (size + gap), oy + ri * (size + gap), size, letter, row.statuses[ci]);
    }
  });
  return s;
}

function ogSvg() {
  const tile = 96;
  const gap = 14;
  const boardW = 5 * tile + 4 * gap; // 536
  const boardX = 1200 - 72 - boardW;
  const boardY = (630 - (3 * tile + 2 * gap)) / 2;
  return `
<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdfcfa"/>
      <stop offset="1" stop-color="#f4ece5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#page)"/>

  <!-- soft blobs for depth -->
  <circle cx="1080" cy="60" r="220" fill="#f7d3d3" opacity="0.35"/>
  <circle cx="80" cy="600" r="260" fill="#f0e2d8" opacity="0.5"/>

  <!-- wordmark block -->
  <g transform="translate(76, 0)">
    <!-- mini logo tile -->
    <rect x="0" y="176" width="64" height="64" rx="18" fill="#e89890"/>
    <rect x="3" y="179" width="58" height="30" rx="15" fill="#ffffff" opacity="0.25"/>
    <g fill="#ffffff">
      <rect x="14" y="190" width="36" height="10" rx="5"/>
      <rect x="27" y="190" width="10" height="36" rx="5"/>
    </g>

    <text x="84" y="232" font-family="Space Grotesk" font-weight="700" font-size="72" fill="#3a3030">TrailWord</text>
    <text x="2" y="300" font-family="Space Grotesk" font-weight="500" font-size="28" fill="#8a7a74">Guess the 5-letter word</text>
    <text x="2" y="338" font-family="Space Grotesk" font-weight="500" font-size="28" fill="#8a7a74">from its trail of clues.</text>

    <!-- daily pill -->
    <rect x="2" y="378" width="256" height="52" rx="26" fill="#f7d3d3"/>
    <text x="130" y="404" dy="0.36em" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="22" fill="#7a4a44">A new puzzle daily</text>

    <text x="2" y="560" font-family="Space Grotesk" font-weight="500" font-size="24" fill="#b3a49c">trailword.pages.dev</text>
  </g>

  <!-- board -->
  ${ogBoard(boardX, boardY, tile, gap)}
</svg>`;
}

/* ---------------------------------------------------------------- */

render(iconSvg({ detail: true }), 512, 'icon-512.png');
render(iconSvg({ detail: true }), 192, 'icon-192.png');
render(iconSvg({ detail: true }), 180, 'apple-touch-icon.png');
render(iconSvg({ detail: false }), 32, 'favicon-32.png');
render(iconSvg({ detail: false }), 16, 'favicon-16.png');
render(ogSvg(), 1200, 'og-image.png');

// favicon.svg — the simplified mark, served as-is (crisp at any size)
writeFileSync(join(out, 'favicon.svg'), iconSvg({ detail: false }).trim());
console.log('favicon.svg  vector');
