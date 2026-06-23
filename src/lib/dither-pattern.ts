// Generate Bayer dither pattern as SVG data URI for CSS backgrounds

const BAYER_4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Generate a repeating Bayer dither pattern as an SVG data URI.
 *  Each cell in the 4x4 Bayer matrix is drawn at opacity = value/16.
 *  scale multiplies each cell's pixel size for a more visible pattern. */
export function bayerPatternDataUri(scale = 2): string {
  const size = 4 * scale; // 4x4 Bayer, each cell scaled

  let rects = '';
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const opacity = BAYER_4x4[y][x] / 16;
      if (opacity === 0) continue;
      rects +=
        `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="currentColor" opacity="${opacity}"/>`;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <pattern id="b" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${rects}</pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#b)"/>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
