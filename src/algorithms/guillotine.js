/**
 * Guillotine Bin Packing Algorithm
 *
 * Packs rectangular pieces into boards using guillotine cuts.
 * A guillotine cut is a single straight cut from one side of a rectangle
 * to the other, producing exactly two sub-rectangles.
 *
 * Kerf (0.4mm = 0.04cm) is deducted from the free space after each cut,
 * representing the material removed by the saw blade.
 */

const KERF = 0.04; // 0.4 mm in cm
const MAX_BOARDS = 500;

/**
 * Main entry point.
 * @param {number} boardW - Board width in cm
 * @param {number} boardH - Board height in cm
 * @param {Array<{w, h, qty, idx}>} pieces - Pieces to pack
 * @returns {Array<{width, height, pieces: Array}>} - Packed boards
 */
export function packPieces(boardW, boardH, pieces) {
  // Expand pieces into individual items
  const items = [];
  pieces.forEach((piece) => {
    for (let i = 0; i < piece.qty; i++) {
      items.push({ w: piece.w, h: piece.h, pieceIdx: piece.idx });
    }
  });

  // Sort by area descending — place largest pieces first for better packing
  items.sort((a, b) => b.w * b.h - a.w * a.h);

  const boards = [];
  let remaining = [...items];

  while (remaining.length > 0 && boards.length < MAX_BOARDS) {
    const { placed, unplaced } = packSingleBoard(boardW, boardH, remaining);

    if (placed.length === 0) {
      // Safety: avoid infinite loop if something unexpected happens
      break;
    }

    boards.push({ width: boardW, height: boardH, pieces: placed });
    remaining = unplaced;
  }

  return boards;
}

/**
 * Pack as many items as possible onto a single board.
 */
function packSingleBoard(boardW, boardH, items) {
  let freeRects = [{ x: 0, y: 0, w: boardW, h: boardH }];
  const placed = [];
  const unplaced = [];

  for (const item of items) {
    const fit = findBestFit(freeRects, item.w, item.h);

    if (!fit) {
      unplaced.push(item);
      continue;
    }

    const { idx, rotated } = fit;
    const rect = freeRects[idx];
    const pw = rotated ? item.h : item.w;
    const ph = rotated ? item.w : item.h;

    placed.push({
      x: rect.x,
      y: rect.y,
      w: pw,
      h: ph,
      pieceIdx: item.pieceIdx,
      originalW: item.w,
      originalH: item.h,
      rotated,
    });

    // Replace the used free rect with the two resulting sub-rects
    const newRects = guillotineSplit(rect, pw, ph);
    freeRects.splice(idx, 1, ...newRects);

    // Remove degenerate rectangles (too small to be useful)
    freeRects = freeRects.filter((r) => r.w > 0.01 && r.h > 0.01);
  }

  return { placed, unplaced };
}

/**
 * Find the best free rectangle for a piece using "Best Area Fit" heuristic.
 * Tries both normal and rotated orientation.
 * Returns null if no fitting rectangle exists.
 */
function findBestFit(freeRects, w, h) {
  let bestScore = Infinity;
  let bestIdx = -1;
  let bestRotated = false;

  for (let i = 0; i < freeRects.length; i++) {
    const rect = freeRects[i];

    // Normal orientation
    if (w <= rect.w && h <= rect.h) {
      const score = rect.w * rect.h;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
        bestRotated = false;
      }
    }

    // Rotated 90°
    if (h <= rect.w && w <= rect.h) {
      const score = rect.w * rect.h;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
        bestRotated = true;
      }
    }
  }

  return bestIdx === -1 ? null : { idx: bestIdx, rotated: bestRotated };
}

/**
 * Split a free rectangle after placing a piece of size (pw × ph) at its top-left corner.
 * Applies kerf (saw blade width) to the resulting sub-rectangles.
 *
 * Chooses between horizontal and vertical split by maximizing the larger
 * resulting rectangle (reduces fragmentation).
 */
function guillotineSplit(rect, pw, ph) {
  const remainW = rect.w - pw - KERF;
  const remainH = rect.h - ph - KERF;

  // Horizontal split: right sub-rect has height=ph, bottom spans full width
  const horizScore = Math.max(
    remainW > 0 ? remainW * ph : 0,
    remainH > 0 ? rect.w * remainH : 0
  );

  // Vertical split: bottom sub-rect has width=pw, right spans full height
  const vertScore = Math.max(
    remainW > 0 ? remainW * rect.h : 0,
    remainH > 0 ? pw * remainH : 0
  );

  const splits = [];

  if (horizScore >= vertScore) {
    // Horizontal split
    if (remainW > 0.01) {
      splits.push({ x: rect.x + pw + KERF, y: rect.y, w: remainW, h: ph });
    }
    if (remainH > 0.01) {
      splits.push({ x: rect.x, y: rect.y + ph + KERF, w: rect.w, h: remainH });
    }
  } else {
    // Vertical split
    if (remainW > 0.01) {
      splits.push({ x: rect.x + pw + KERF, y: rect.y, w: remainW, h: rect.h });
    }
    if (remainH > 0.01) {
      splits.push({ x: rect.x, y: rect.y + ph + KERF, w: pw, h: remainH });
    }
  }

  return splits;
}
