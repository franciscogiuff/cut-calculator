import { useEffect, useRef } from 'react';
import { getPieceColor, getTextColor } from '../utils/colors';

const MAX_CANVAS_W = 360;
const MAX_CANVAS_H = 420;

export default function BoardCanvas({ board, boardIndex }) {
  const canvasRef = useRef(null);

  const scale = Math.min(MAX_CANVAS_W / board.width, MAX_CANVAS_H / board.height);
  const displayW = Math.round(board.width * scale);
  const displayH = Math.round(board.height * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Board background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, displayW, displayH);

    // Subtle grid (every 10 cm)
    const gridStep = 10 * scale;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = gridStep; x < displayW; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, displayH);
      ctx.stroke();
    }
    for (let y = gridStep; y < displayH; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(displayW, y);
      ctx.stroke();
    }

    // Draw pieces
    board.pieces.forEach((piece) => {
      const x = piece.x * scale;
      const y = piece.y * scale;
      const w = piece.w * scale;
      const h = piece.h * scale;

      const bg = getPieceColor(piece.pieceIdx);
      const fg = getTextColor(bg);

      // Fill
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, w, h);

      // Inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);

      // Label — only if the piece is large enough to display text
      if (w >= 28 && h >= 18) {
        const fontSize = Math.min(13, Math.max(8, Math.min(w, h) * 0.22));
        ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = fg;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = `${piece.originalW}×${piece.originalH}`;
        const textW = ctx.measureText(label).width;

        if (textW <= w - 6) {
          ctx.fillText(label, x + w / 2, y + h / 2);
        } else if (w >= 18 && h >= 28) {
          // Rotate label 90° for tall narrow pieces
          ctx.save();
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      }
    });

    // Board outer border
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, displayW - 2, displayH - 2);
  }, [board, scale, displayW, displayH]);

  const totalArea = board.width * board.height;
  const usedArea = board.pieces.reduce((s, p) => s + p.w * p.h, 0);
  const utilPct = ((usedArea / totalArea) * 100).toFixed(1);
  const wastePct = (100 - parseFloat(utilPct)).toFixed(1);

  return (
    <div className="board-card">
      <div className="board-card-header">
        <span className="board-title">Placa {boardIndex + 1}</span>
        <span className="board-util-badge">{utilPct}% utilización</span>
      </div>
      <div className="board-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div className="board-card-footer">
        <span>
          {board.width} × {board.height} cm
        </span>
        <span>{board.pieces.length} piezas</span>
        <span className="waste-text">Desperdicio: {wastePct}%</span>
      </div>
    </div>
  );
}
