import jsPDF from 'jspdf';
import { getPieceColor, getTextColor, hexToRgb } from './colors';

const MARGIN = 12;
const PAGE_W = 297;
const PAGE_H = 210;
const USABLE_W = PAGE_W - MARGIN * 2;
const USABLE_H = PAGE_H - MARGIN * 2;

export function exportToPDF(boards, pieces) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ── Summary page ──────────────────────────────────────────────────────────
  drawSummaryPage(doc, boards, pieces);

  // ── One page per board ────────────────────────────────────────────────────
  boards.forEach((board, idx) => {
    doc.addPage();
    drawBoardPage(doc, board, idx, pieces);
  });

  doc.save('plan-de-corte.pdf');
}

// ─── Summary page ────────────────────────────────────────────────────────────

function drawSummaryPage(doc, boards, pieces) {
  const totalBoardArea = boards.reduce((s, b) => s + b.width * b.height, 0);
  const totalPieceArea = pieces.reduce((s, p) => s + p.w * p.h * p.qty, 0);
  const totalPieces = pieces.reduce((s, p) => s + p.qty, 0);
  const waste = ((totalBoardArea - totalPieceArea) / totalBoardArea) * 100;

  let y = MARGIN + 8;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Plan de Corte — Melamina', MARGIN, y);

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  y += 10;

  // Stats row
  const statBoxW = 52;
  const stats = [
    { value: String(boards.length), label: `Placa${boards.length !== 1 ? 's' : ''}` },
    { value: String(totalPieces), label: 'Piezas totales' },
    { value: `${waste.toFixed(1)}%`, label: 'Desperdicio prom.' },
    { value: `${totalPieceArea.toFixed(0)}`, label: 'Área piezas (cm²)' },
  ];

  stats.forEach((stat, i) => {
    const x = MARGIN + i * (statBoxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, statBoxW, 20, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, statBoxW, 20, 2, 2, 'S');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(stat.value, x + statBoxW / 2, y + 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, x + statBoxW / 2, y + 17, { align: 'center' });
  });

  y += 30;

  // Pieces table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Lista de piezas', MARGIN, y);

  y += 6;

  const cols = [
    { label: '#', x: MARGIN + 2, w: 8 },
    { label: 'Color', x: MARGIN + 12, w: 14 },
    { label: 'Ancho (cm)', x: MARGIN + 28, w: 30 },
    { label: 'Alto (cm)', x: MARGIN + 60, w: 28 },
    { label: 'Cantidad', x: MARGIN + 90, w: 25 },
    { label: 'Área unit. (cm²)', x: MARGIN + 117, w: 40 },
    { label: 'Área total (cm²)', x: MARGIN + 159, w: 40 },
  ];

  // Header
  doc.setFillColor(241, 245, 249);
  doc.rect(MARGIN, y - 4, USABLE_W, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  cols.forEach((col) => doc.text(col.label, col.x, y));

  y += 7;

  pieces.forEach((piece, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, y - 4, USABLE_W, 7, 'F');
    }

    const [r, g, b] = hexToRgb(getPieceColor(i));
    doc.setFillColor(r, g, b);
    doc.roundedRect(cols[1].x, y - 3.5, 8, 4.5, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(String(i + 1), cols[0].x, y);
    doc.text(String(piece.w), cols[2].x, y);
    doc.text(String(piece.h), cols[3].x, y);
    doc.text(String(piece.qty), cols[4].x, y);
    doc.text((piece.w * piece.h).toFixed(2), cols[5].x, y);
    doc.text((piece.w * piece.h * piece.qty).toFixed(2), cols[6].x, y);

    y += 7;

    if (y > PAGE_H - MARGIN * 2) {
      doc.addPage();
      y = MARGIN + 8;
    }
  });
}

// ─── Board page ───────────────────────────────────────────────────────────────

function drawBoardPage(doc, board, boardIdx, pieces) {
  const TITLE_H = 14;
  const LEGEND_W = 55;
  const drawAreaW = USABLE_W - LEGEND_W - 4;
  const drawAreaH = USABLE_H - TITLE_H - 8;

  const scale = Math.min(drawAreaW / board.width, drawAreaH / board.height);
  const drawW = board.width * scale;
  const drawH = board.height * scale;

  const originX = MARGIN;
  const originY = MARGIN + TITLE_H;

  // Title
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Placa ${boardIdx + 1}`, MARGIN, MARGIN + 6);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${board.width} × ${board.height} cm  —  ${board.pieces.length} piezas`,
    MARGIN + 22,
    MARGIN + 6
  );

  // Board background
  doc.setFillColor(241, 245, 249);
  doc.rect(originX, originY, drawW, drawH, 'F');

  // Subtle grid (every 10 cm)
  const gridStep = 10 * scale;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);
  for (let x = gridStep; x < drawW; x += gridStep) {
    doc.line(originX + x, originY, originX + x, originY + drawH);
  }
  for (let y = gridStep; y < drawH; y += gridStep) {
    doc.line(originX, originY + y, originX + drawW, originY + y);
  }

  // Pieces
  board.pieces.forEach((piece) => {
    const x = originX + piece.x * scale;
    const y = originY + piece.y * scale;
    const w = piece.w * scale;
    const h = piece.h * scale;

    const bg = getPieceColor(piece.pieceIdx);
    const [r, g, b] = hexToRgb(bg);

    doc.setFillColor(r, g, b);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.rect(x, y, w, h, 'FD');

    if (w >= 7 && h >= 5) {
      const fg = getTextColor(bg);
      const [tr, tg, tb] = hexToRgb(fg);
      const fontSize = Math.min(7, Math.max(5, Math.min(w, h) * 0.35));
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(tr, tg, tb);
      const label = `${piece.originalW}×${piece.originalH}`;
      doc.text(label, x + w / 2, y + h / 2 + fontSize * 0.18, { align: 'center' });
    }
  });

  // Board border
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.5);
  doc.rect(originX, originY, drawW, drawH, 'S');

  // ── Legend ────────────────────────────────────────────────────────────────
  const legendX = originX + drawW + 6;
  let legendY = originY + 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Piezas en esta placa', legendX, legendY);
  legendY += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(legendX, legendY, legendX + LEGEND_W - 2, legendY);
  legendY += 5;

  const pieceTypesOnBoard = new Map();
  board.pieces.forEach((p) => {
    const key = p.pieceIdx;
    if (!pieceTypesOnBoard.has(key)) {
      pieceTypesOnBoard.set(key, { count: 0, piece: pieces[key] });
    }
    pieceTypesOnBoard.get(key).count++;
  });

  pieceTypesOnBoard.forEach(({ count, piece }, pieceIdx) => {
    const [r, g, b] = hexToRgb(getPieceColor(pieceIdx));
    doc.setFillColor(r, g, b);
    doc.roundedRect(legendX, legendY - 3, 5, 4, 0.5, 0.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${piece.w} × ${piece.h} cm`, legendX + 7, legendY);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${count} unid.`, legendX + 7, legendY + 4);

    legendY += 11;

    if (legendY > originY + drawAreaH) return;
  });

  // ── Waste info ────────────────────────────────────────────────────────────
  const totalArea = board.width * board.height;
  const usedArea = board.pieces.reduce((s, p) => s + p.w * p.h, 0);
  const utilPct = ((usedArea / totalArea) * 100).toFixed(1);
  const wastePct = (100 - parseFloat(utilPct)).toFixed(1);

  const statsY = originY + drawH + 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Utilización: ${utilPct}%   |   Desperdicio: ${wastePct}%   |   Área usada: ${usedArea.toFixed(1)} / ${totalArea.toFixed(1)} cm²`,
    originX,
    statsY
  );
}
