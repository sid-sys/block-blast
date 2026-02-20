import { useState, useEffect } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Board } from './components/Board';
import { Tray } from './components/Tray';
import { Brain, Trophy, RotateCcw } from 'lucide-react';
import { type Shape } from './utils/shapes';
import { Block } from './components/Block';

function App() {
  const {
    grid,
    currentShapes,
    score,
    highScore,
    isGameOver,
    placeShape,
    canPlaceShape,
    resetGame,
    clearedLines
  } = useGameLogic();

  const [draggedShape, setDraggedShape] = useState<Shape | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  // Track global pointer movement for the floating preview
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setPointerPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
      // If we're not dropping on the board, we still want to clear the drag state
      // Board will handle its own pointerup for placement
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Floating Drag Preview */}
      {draggedShape && (
        <div
          className="floating-drag-preview"
          style={{
            left: pointerPos.x,
            top: pointerPos.y - 60 // Offset slightly so it's visible above the finger
          }}
        >
          <div
            className="shape-grid"
            style={{
              gridTemplateColumns: `repeat(${draggedShape.matrix[0].length}, 32px)`,
            }}
          >
            {draggedShape.matrix.map((row, i) => (
              row.map((val, j) => (
                <div key={`${i}-${j}`} style={{ width: 32, height: 32 }}>
                  {val === 1 && <Block color={draggedShape.color} size="32px" />}
                </div>
              ))
            ))}
          </div>
        </div>
      )}

      {/* Header / Score Board */}
      <div className="header">
        <div className="score-box">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score}</span>
        </div>

        <div className="brain-ring">
          <Brain className="brain-icon" />
        </div>

        <div className="score-box">
          <div className="score-label best-score-label">
            <Trophy size={14} /> BEST
          </div>
          <span className="score-value best-score-value">{highScore}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className={`game-board-container${clearedLines ? ' shaking' : ''}`}>
        <Board
          grid={grid}
          canPlaceShape={canPlaceShape}
          onPlaceShape={placeShape}
          draggedShape={draggedShape}
          setDraggedShape={setDraggedShape}
          clearedLines={clearedLines}
          pointerPos={pointerPos}
        />

        {isGameOver && (
          <div className="game-over-modal">
            <h2 className="game-over-title">Game Over</h2>
            <p className="game-over-score">Score: {score}</p>
            <button
              onClick={resetGame}
              className="reset-button"
            >
              <RotateCcw size={20} /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* Tray */}
      <Tray
        shapes={currentShapes}
        setDraggedShape={setDraggedShape}
      />

      <div className="footer-text">
        Relaxing!
      </div>
    </div>
  );
}

export default App;
