import { useState, useCallback } from 'react';
import BoardInput from './components/BoardInput';
import PiecesInput from './components/PiecesInput';
import ResultsPanel from './components/ResultsPanel';
import { packPieces } from './algorithms/guillotine';

let nextId = 1;

function createPiece() {
  return { id: nextId++, w: '', h: '', qty: '1' };
}

export default function App() {
  const [boardW, setBoardW] = useState('');
  const [boardH, setBoardH] = useState('');
  const [pieces, setPieces] = useState([createPiece()]);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Piece list handlers ───────────────────────────────────────────────────

  const handleAddPiece = useCallback(() => {
    setPieces((prev) => [...prev, createPiece()]);
  }, []);

  const handleUpdatePiece = useCallback((id, field, value) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    // Clear related error on edit
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`piece_${id}_${field}`];
      delete next[`piece_${id}_size`];
      return next;
    });
  }, []);

  const handleRemovePiece = useCallback((id) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next)
        .filter((k) => k.startsWith(`piece_${id}_`))
        .forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────

  function validate() {
    const errs = {};
    const bw = parseFloat(boardW);
    const bh = parseFloat(boardH);

    if (!boardW || isNaN(bw) || bw <= 0) {
      errs.boardW = 'Ingresá un valor válido mayor a 0';
    }
    if (!boardH || isNaN(bh) || bh <= 0) {
      errs.boardH = 'Ingresá un valor válido mayor a 0';
    }

    if (pieces.length === 0) {
      errs.pieces = 'Agregá al menos una pieza para calcular.';
    }

    pieces.forEach((p) => {
      const pw = parseFloat(p.w);
      const ph = parseFloat(p.h);
      const qty = parseInt(p.qty, 10);

      if (!p.w || isNaN(pw) || pw <= 0) errs[`piece_${p.id}_w`] = true;
      if (!p.h || isNaN(ph) || ph <= 0) errs[`piece_${p.id}_h`] = true;
      if (!p.qty || isNaN(qty) || qty < 1) errs[`piece_${p.id}_qty`] = true;

      // Check if piece fits in board (at least one orientation)
      const boardValid = !errs.boardW && !errs.boardH;
      const pieceValid = !errs[`piece_${p.id}_w`] && !errs[`piece_${p.id}_h`];

      if (boardValid && pieceValid) {
        const fitsNormal = pw <= bw && ph <= bh;
        const fitsRotated = ph <= bw && pw <= bh;
        if (!fitsNormal && !fitsRotated) {
          errs[`piece_${p.id}_size`] =
            `La pieza ${pw}×${ph} cm no cabe en la placa (${bw}×${bh} cm), ni rotada.`;
        }
      }
    });

    return errs;
  }

  // ── Calculate ─────────────────────────────────────────────────────────────

  const handleCalculate = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const bw = parseFloat(boardW);
    const bh = parseFloat(boardH);

    const parsedPieces = pieces.map((p, i) => ({
      w: parseFloat(p.w),
      h: parseFloat(p.h),
      qty: parseInt(p.qty, 10),
      idx: i,
    }));

    const boards = packPieces(bw, bh, parsedPieces);
    setResults({ boards, pieces: parsedPieces, boardW: bw, boardH: bh });

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleReset = () => {
    setResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const canCalculate = boardW && boardH && pieces.length > 0;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-icon">▦</div>
          <div>
            <h1>Optimizador de Cortes</h1>
            <p>Calculá el plan de corte óptimo para placas de melamina</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Input section */}
        <div className="inputs-layout">
          {/* Board size */}
          <div className="card">
            <h2 className="card-title">
              <span className="card-title-icon">□</span>
              Tamaño de la Placa
            </h2>
            <BoardInput
              boardW={boardW}
              boardH={boardH}
              onChangeW={(v) => {
                setBoardW(v);
                setErrors((e) => { const n = { ...e }; delete n.boardW; return n; });
              }}
              onChangeH={(v) => {
                setBoardH(v);
                setErrors((e) => { const n = { ...e }; delete n.boardH; return n; });
              }}
              errors={errors}
            />
          </div>

          {/* Pieces list */}
          <div className="card card-pieces">
            <h2 className="card-title">
              <span className="card-title-icon">⊞</span>
              Piezas a Cortar
            </h2>
            <PiecesInput
              pieces={pieces}
              errors={errors}
              onAdd={handleAddPiece}
              onUpdate={handleUpdatePiece}
              onRemove={handleRemovePiece}
            />
            {errors.pieces && <p className="field-error block-error">{errors.pieces}</p>}
          </div>
        </div>

        {/* Calculate button */}
        <div className="calculate-row">
          <button
            className="btn btn-primary btn-calc"
            onClick={handleCalculate}
            disabled={!canCalculate}
          >
            Calcular cortes
          </button>
        </div>

        {/* Results */}
        {results && (
          <div id="results">
            <ResultsPanel results={results} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Kerf: 0.4 mm por corte · Medidas en cm · Algoritmo guillotina</p>
        <p className="footer-author">
          Hecho por Francisco Giuffrida
          <a
            href="https://www.linkedin.com/in/francisco-giuffrida/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Francisco Giuffrida"
            className="footer-linkedin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </p>
      </footer>
    </div>
  );
}
