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
/* App icon — 3D mechanical keycap with a bold T, sitting on a      */
/* warm cream base. detail:false = flat simplified mark for 16-32px */
/* ---------------------------------------------------------------- */

function iconSvg({ detail = true } = {}) {
  if (!detail) {
    // Flat mark for tiny favicons: pink rounded cap + white T, no depth
    return `
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f2a49b"/>
      <stop offset="1" stop-color="#dd857c"/>
    </linearGradient>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#fb)"/>
  <g fill="#ffffff">
    <rect x="116" y="122" width="280" height="76" rx="38"/>
    <rect x="218" y="122" width="76" height="272" rx="38"/>
  </g>
</svg>`;
  }
  return `
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdf6f1"/>
      <stop offset="1" stop-color="#f3e2d9"/>
    </linearGradient>
    <linearGradient id="capside" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d5766d"/>
      <stop offset="1" stop-color="#b85c55"/>
    </linearGradient>
    <linearGradient id="captop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6b4ab"/>
      <stop offset="0.6" stop-color="#ec9a91"/>
      <stop offset="1" stop-color="#e28c83"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="soft2" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
  </defs>

  <!-- warm cream backdrop -->
  <rect x="0" y="0" width="512" height="512" rx="116" fill="url(#bg)"/>
  <!-- backdrop blush glow behind cap -->
  <circle cx="256" cy="250" r="190" fill="#f3b9b1" opacity="0.4" filter="url(#soft)"/>

  <!-- cast shadow under keycap -->
  <ellipse cx="256" cy="432" rx="164" ry="26" fill="#c98d82" opacity="0.45" filter="url(#soft)"/>

  <!-- keycap body (side walls) -->
  <rect x="76" y="96" width="360" height="336" rx="64" fill="url(#capside)"/>
  <!-- keycap top face, raised toward the top -->
  <rect x="98" y="76" width="316" height="296" rx="52" fill="url(#captop)"/>
  <!-- top-face rim light -->
  <rect x="106" y="84" width="300" height="280" rx="46" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="5"/>
  <!-- gloss sweep on upper half -->
  <rect x="106" y="84" width="300" height="120" rx="46" fill="url(#gloss)"/>

  <!-- T shadow pressed into cap -->
  <g fill="#a34f48" opacity="0.5" filter="url(#soft2)" transform="translate(0,10)">
    <rect x="150" y="142" width="212" height="60" rx="30"/>
    <rect x="226" y="142" width="60" height="204" rx="30"/>
  </g>
  <!-- T -->
  <g fill="#ffffff">
    <rect x="150" y="136" width="212" height="60" rx="30"/>
    <rect x="226" y="136" width="60" height="204" rx="30"/>
  </g>

  <!-- trail of mini keycaps rising along the bottom-right of the backdrop -->
  <g>
    <rect x="330" y="440" width="42" height="38" rx="12" fill="#e8b6ae" opacity="0.55"/>
    <rect x="384" y="424" width="42" height="38" rx="12" fill="#e3a49b" opacity="0.75"/>
    <rect x="438" y="408" width="42" height="38" rx="12" fill="#dd8d84" opacity="0.95"/>
  </g>
</svg>`;
}

/* ---------------------------------------------------------------- */
/* og-image 1200x630 — dark cozy scene: glowing solved board,       */
/* cream wordmark, pastel keycap trio. Reads as a game, pops in     */
/* dark-mode chat clients.                                          */
/* ---------------------------------------------------------------- */

const OG_TILE = {
  correct: { bg: '#e89890', deep: '#c97b73', text: '#ffffff', glow: true },
  present: { bg: '#7d6a64', deep: '#67564f', text: '#f5e9e4', glow: false },
  absent: { bg: '#3a322e', deep: '#2e2724', text: '#9c8c84', glow: false },
  empty: { bg: '#2a2320', deep: '#2a2320', text: '#5a4e48', glow: false },
};

function ogTile(x, y, size, letter, status) {
  const t = OG_TILE[status];
  const r = Math.round(size * 0.2);
  const glow = t.glow
    ? `<rect x="${x - 10}" y="${y - 10}" width="${size + 20}" height="${size + 20}" rx="${r + 8}" fill="#e89890" opacity="0.35" filter="url(#glowblur)"/>`
    : '';
  const body =
    status === 'empty'
      ? `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="${t.bg}"/>
         <rect x="${x + 2}" y="${y + 2}" width="${size - 4}" height="${size - 4}" rx="${r - 2}" fill="none" stroke="#4a3f39" stroke-width="2"/>`
      : `<rect x="${x}" y="${y + 4}" width="${size}" height="${size}" rx="${r}" fill="${t.deep}"/>
         <rect x="${x}" y="${y}" width="${size}" height="${size - 6}" rx="${r}" fill="${t.bg}"/>
         <rect x="${x + 3}" y="${y + 3}" width="${size - 6}" height="${Math.round(size * 0.4)}" rx="${r - 3}" fill="#ffffff" opacity="0.16"/>`;
  const letterEl = letter
    ? `<text x="${x + size / 2}" y="${y + (size - 6) / 2}" dy="0.37em" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${Math.round(size * 0.52)}" fill="${t.text}">${letter}</text>`
    : '';
  return glow + body + letterEl;
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

function miniKeycap(x, y, w, capColor, deepColor, letter) {
  const h = Math.round(w * 0.82);
  const r = Math.round(w * 0.22);
  return `
    <rect x="${x}" y="${y + 6}" width="${w}" height="${h}" rx="${r}" fill="${deepColor}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h - 4}" rx="${r}" fill="${capColor}"/>
    <rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${Math.round(h * 0.34)}" rx="${r - 3}" fill="#ffffff" opacity="0.28"/>
    <text x="${x + w / 2}" y="${y + (h - 4) / 2}" dy="0.37em" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${Math.round(w * 0.42)}" fill="#ffffff">${letter}</text>`;
}

function ogSvg() {
  const tile = 100;
  const gap = 14;
  const boardW = 5 * tile + 4 * gap; // 556
  const boardX = 1200 - 64 - boardW;
  const boardY = (630 - (3 * tile + 2 * gap)) / 2;
  return `
<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2e2320"/>
      <stop offset="1" stop-color="#1c1512"/>
    </linearGradient>
    <filter id="glowblur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="bigblur" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#page)"/>

  <!-- ambient warm glows -->
  <circle cx="1020" cy="140" r="240" fill="#e89890" opacity="0.14" filter="url(#bigblur)"/>
  <circle cx="120" cy="560" r="240" fill="#c8a288" opacity="0.10" filter="url(#bigblur)"/>

  <!-- wordmark block -->
  <g transform="translate(72, 0)">
    <!-- mini logo keycap -->
    ${miniKeycap(0, 158, 78, '#ec9a91', '#b85c55', 'T')}

    <text x="100" y="222" font-family="Space Grotesk" font-weight="700" font-size="76" fill="#f5e9e4">TrailWord</text>
    <text x="2" y="296" font-family="Space Grotesk" font-weight="500" font-size="29" fill="#b8a49c">Guess the 5-letter word</text>
    <text x="2" y="336" font-family="Space Grotesk" font-weight="500" font-size="29" fill="#b8a49c">from its trail of clues.</text>

    <!-- daily pill -->
    <rect x="2" y="376" width="252" height="52" rx="26" fill="#4a2f2b"/>
    <text x="128" y="402" dy="0.36em" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="22" fill="#f7d3d3">A new puzzle daily</text>

    <!-- pastel keycap trio: ASMR keyboard hint -->
    ${miniKeycap(2, 466, 56, '#e8a49c', '#c17b73', 'A')}
    ${miniKeycap(70, 466, 56, '#a9c6ee', '#7d97c2', 'S')}
    ${miniKeycap(138, 466, 56, '#b3d9b6', '#84ab88', 'M')}
    ${miniKeycap(206, 466, 56, '#d9bfa4', '#a98e70', 'R')}
    <text x="290" y="494" dy="0.36em" font-family="Space Grotesk" font-weight="500" font-size="21" fill="#8a7468">keyboard sounds</text>

    <text x="2" y="586" font-family="Space Grotesk" font-weight="500" font-size="23" fill="#6f5d54">trailword.pages.dev</text>
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
