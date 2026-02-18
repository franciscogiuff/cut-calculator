const PALETTE = [
  '#3b82f6', // blue
  '#f97316', // orange
  '#ef4444', // red
  '#22c55e', // green
  '#a855f7', // purple
  '#14b8a6', // teal
  '#eab308', // yellow
  '#ec4899', // pink
  '#6366f1', // indigo
  '#84cc16', // lime
  '#f43f5e', // rose
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#fb923c', // orange-400
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#c084fc', // purple-400
  '#f472b6', // pink-400
  '#fbbf24', // amber
];

export function getPieceColor(index) {
  return PALETTE[index % PALETTE.length];
}

/**
 * Returns '#ffffff' or '#1e293b' depending on background luminance.
 */
export function getTextColor(bgHex) {
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1e293b' : '#ffffff';
}

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
