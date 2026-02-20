import { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { Board } from './components/Board';
import { Tray } from './components/Tray';
import { Brain, Trophy, RotateCcw } from 'lucide-react';
import { type Shape } from './utils/shapes';

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

  return (
    <div className="app-container">
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
          clearedLines={clearedLines}
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
