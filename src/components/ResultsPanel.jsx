import BoardCanvas from './BoardCanvas';
import { exportToPDF } from '../utils/pdfExport';
import { getPieceColor } from '../utils/colors';

export default function ResultsPanel({ results, onReset }) {
  const { boards, pieces } = results;

  const totalBoardArea = boards.reduce((s, b) => s + b.width * b.height, 0);
  const totalPieceArea = pieces.reduce((s, p) => s + p.w * p.h * p.qty, 0);
  const totalPieces = pieces.reduce((s, p) => s + p.qty, 0);
  const wastePct = ((totalBoardArea - totalPieceArea) / totalBoardArea) * 100;

  const handleExport = () => exportToPDF(boards, pieces);

  return (
    <section className="results-section">
      {/* Summary card */}
      <div className="card results-card">
        <div className="card-header-row">
          <h2>Resultado del cálculo</h2>
          <button className="btn btn-outline btn-sm" onClick={onReset}>
            ↺ Nuevo cálculo
          </button>
        </div>

        <div className="summary-grid">
          <div className="stat-box">
            <span className="stat-value">{boards.length}</span>
            <span className="stat-label">
              Placa{boards.length !== 1 ? 's' : ''} necesaria{boards.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{totalPieces}</span>
            <span className="stat-label">Piezas totales</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{wastePct.toFixed(1)}%</span>
            <span className="stat-label">Desperdicio estimado</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{totalPieceArea.toFixed(0)}</span>
            <span className="stat-label">Área de piezas (cm²)</span>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <h3 className="legend-title">Leyenda de piezas</h3>
          <div className="legend-grid">
            {pieces.map((piece, i) => (
              <div key={i} className="legend-item">
                <span
                  className="legend-swatch"
                  style={{ background: getPieceColor(i) }}
                />
                <span className="legend-label">
                  {piece.w} × {piece.h} cm
                </span>
                <span className="legend-qty">{piece.qty} unid.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="export-row">
          <button className="btn btn-primary" onClick={handleExport}>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Board diagrams */}
      <div className="boards-grid">
        {boards.map((board, i) => (
          <BoardCanvas key={i} board={board} boardIndex={i} />
        ))}
      </div>
    </section>
  );
}
