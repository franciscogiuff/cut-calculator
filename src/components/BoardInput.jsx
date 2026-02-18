export default function BoardInput({ boardW, boardH, onChangeW, onChangeH, errors }) {
  return (
    <div className="board-input">
      <p className="input-hint">
        Medidas estándar: <strong>244 × 183 cm</strong> o <strong>244 × 122 cm</strong>
      </p>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="board-w">Ancho (cm)</label>
          <input
            id="board-w"
            type="number"
            value={boardW}
            onChange={(e) => onChangeW(e.target.value)}
            placeholder="ej: 244"
            min="1"
            step="0.1"
            className={errors.boardW ? 'error' : ''}
          />
          {errors.boardW && <span className="field-error">{errors.boardW}</span>}
        </div>
        <div className="dimension-separator">×</div>
        <div className="form-group">
          <label htmlFor="board-h">Alto (cm)</label>
          <input
            id="board-h"
            type="number"
            value={boardH}
            onChange={(e) => onChangeH(e.target.value)}
            placeholder="ej: 183"
            min="1"
            step="0.1"
            className={errors.boardH ? 'error' : ''}
          />
          {errors.boardH && <span className="field-error">{errors.boardH}</span>}
        </div>
      </div>
      <div className="kerf-badge">
        <span className="kerf-icon">⚙</span>
        Kerf: <strong>0.4 mm</strong> por corte (hoja de sierra)
      </div>
    </div>
  );
}
