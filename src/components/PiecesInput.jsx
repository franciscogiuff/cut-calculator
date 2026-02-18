export default function PiecesInput({ pieces, errors, onAdd, onUpdate, onRemove }) {
  return (
    <div className="pieces-input">
      {pieces.length > 0 ? (
        <div className="table-wrapper">
          <table className="pieces-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ancho (cm)</th>
                <th>Alto (cm)</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((piece, i) => (
                <tr key={piece.id}>
                  <td className="row-num">{i + 1}</td>
                  <td>
                    <input
                      type="number"
                      value={piece.w}
                      onChange={(e) => onUpdate(piece.id, 'w', e.target.value)}
                      placeholder="0"
                      min="0.1"
                      step="0.1"
                      className={errors[`piece_${piece.id}_w`] ? 'error' : ''}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={piece.h}
                      onChange={(e) => onUpdate(piece.id, 'h', e.target.value)}
                      placeholder="0"
                      min="0.1"
                      step="0.1"
                      className={errors[`piece_${piece.id}_h`] ? 'error' : ''}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={piece.qty}
                      onChange={(e) => onUpdate(piece.id, 'qty', e.target.value)}
                      placeholder="1"
                      min="1"
                      step="1"
                      className={errors[`piece_${piece.id}_qty`] ? 'error' : ''}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-icon btn-remove"
                      onClick={() => onRemove(piece.id)}
                      title="Eliminar pieza"
                      aria-label="Eliminar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-hint">No hay piezas. Agregá al menos una.</p>
      )}

      {pieces.map((piece) =>
        errors[`piece_${piece.id}_size`] ? (
          <p key={piece.id} className="field-error block-error">
            ⚠ {errors[`piece_${piece.id}_size`]}
          </p>
        ) : null
      )}

      <div className="add-piece-row">
        <button className="btn btn-outline" onClick={onAdd}>
          + Agregar pieza
        </button>
      </div>
    </div>
  );
}
