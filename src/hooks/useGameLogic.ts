import { useState, useEffect, useCallback } from 'react';
import { type Shape, getRandomShapes } from '../utils/shapes';
import { playSnap, playClear, playCombo, playGameOver } from '../utils/sfx';

export const GRID_SIZE = 8;
export type GridCell = { color: string } | null;


export type ClearedLines = {
    rows: number[];
    cols: number[];
    score: number;
    combo: number;
    color: string; // color of the block that triggered the clear
};

export const useGameLogic = () => {
    const [grid, setGrid] = useState<GridCell[][]>(() =>
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
    );

    const [currentShapes, setCurrentShapes] = useState<Shape[]>([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('blockPuzzleHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [isGameOver, setIsGameOver] = useState(false);
    const [clearedLines, setClearedLines] = useState<ClearedLines | null>(null);

    // Initialize shapes if empty
    useEffect(() => {
        if (currentShapes.length === 0 && !isGameOver) {
            setCurrentShapes(getRandomShapes(3));
        }
    }, [currentShapes.length, isGameOver]);

    // Persist high score
    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('blockPuzzleHighScore', score.toString());
        }
    }, [score, highScore]);

    const canPlaceShape = useCallback((grid: GridCell[][], shape: Shape, startRow: number, startCol: number) => {
        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[r].length; c++) {
                if (shape.matrix[r][c] === 1) {
                    const row = startRow + r;
                    const col = startCol + c;

                    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
                        return false; // Out of bounds
                    }
                    if (grid[row][col] !== null) {
                        return false; // Cell occupied
                    }
                }
            }
        }
        return true;
    }, []);

    const checkGameOver = useCallback((currentGrid: GridCell[][], shapes: Shape[]) => {
        // If no shapes left, it's not game over (we will get more)
        if (shapes.length === 0) return false;

        // Check if ANY shape can fit somewhere
        for (const shape of shapes) {
            let canFit = false;
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (canPlaceShape(currentGrid, shape, r, c)) {
                        canFit = true;
                        break;
                    }
                }
                if (canFit) break;
            }
            if (canFit) return false; // Found a spot for at least one shape
        }
        return true; // No spot for any shape
    }, [canPlaceShape]);

    const checkLines = useCallback((newGrid: GridCell[][]) => {
        const clearRows: number[] = [];
        const clearCols: number[] = [];

        // Check rows
        for (let r = 0; r < GRID_SIZE; r++) {
            if (newGrid[r].every(cell => cell !== null)) {
                clearRows.push(r);
            }
        }

        // Check cols
        for (let c = 0; c < GRID_SIZE; c++) {
            let isFull = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (newGrid[r][c] === null) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                clearCols.push(c);
            }
        }

        return { clearRows, clearCols };
    }, []);

    const placeShape = useCallback((shape: Shape, startRow: number, startCol: number) => {
        if (isGameOver) return false;

        // We need to re-validate because the user might drag drop
        if (!canPlaceShape(grid, shape, startRow, startCol)) {
            return false;
        }

        // Place shape
        // Deep copy grid
        const newGrid = grid.map(row => row.map(cell => cell ? { ...cell } : null));
        let placedBlocks = 0;

        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[r].length; c++) {
                if (shape.matrix[r][c] === 1) {
                    newGrid[startRow + r][startCol + c] = { color: shape.color };
                    placedBlocks++;
                }
            }
        }

        // Update score logic ...
        let earnedScore = placedBlocks;

        // Check lines
        const { clearRows, clearCols } = checkLines(newGrid);

        if (clearRows.length > 0 || clearCols.length > 0) {
            earnedScore += (clearRows.length + clearCols.length) * 10;

            // Identify cells to clear
            const cellsToClear = new Set<string>(); // "r,c"
            clearRows.forEach(r => {
                for (let c = 0; c < GRID_SIZE; c++) cellsToClear.add(`${r},${c}`);
            });
            clearCols.forEach(c => {
                for (let r = 0; r < GRID_SIZE; r++) cellsToClear.add(`${r},${c}`);
            });

            const combo = clearRows.length + clearCols.length;

            // SFX: line clear + combo
            playClear();
            if (combo >= 2) playCombo(combo);

            setClearedLines({
                rows: clearRows,
                cols: clearCols,
                score: combo * 10,
                combo,
                color: shape.color, // pass the placed block's color
            });

            // Set grid WITH blocks still visible first (animation plays over them)
            setGrid(newGrid);

            // Delay the actual cell clearing until the beam animation finishes
            setTimeout(() => {
                setGrid(prev => {
                    const cleared = prev.map(row => row.map(cell => cell ? { ...cell } : null));
                    cellsToClear.forEach(key => {
                        const [r, c] = key.split(',').map(Number);
                        cleared[r][c] = null;
                    });
                    return cleared;
                });
            }, 200);

            // Clear animation state after full animation
            setTimeout(() => {
                setClearedLines(null);
            }, 800);
        } else {
            // No lines cleared — just set the grid immediately
            setGrid(newGrid);
        }

        // SFX: snap sound for every successful placement
        playSnap();
        setScore(prev => prev + earnedScore);

        // Remove placed shape
        const remainingShapes = currentShapes.filter(s => s.id !== shape.id);

        // Check if we need to refill immediately for Game Over check?
        // If remainingShapes is empty, the Effect will refill them.
        // The Game Over check should happen AFTER refill.
        // However, React state updates are async.
        // We can rely on a separate Effect to check Game Over when grid or shapes change.

        setCurrentShapes(remainingShapes);
        return true;
    }, [grid, currentShapes, isGameOver, canPlaceShape, checkLines]);

    // Effect to check Game Over
    useEffect(() => {
        if (!isGameOver && currentShapes.length > 0) {
            // We only check if we have shapes. If empty, we wait for refill.
            // The refill logic is: if (currentShapes.length === 0) refill.
            // So this effect will run again after refill.

            if (checkGameOver(grid, currentShapes)) {
                // setIsGameOver(true);
                // Alert or something? 
                // Let's set it.
                setIsGameOver(true);
                playGameOver();
            }
        }
    }, [grid, currentShapes, checkGameOver, isGameOver]);

    const resetGame = () => {
        setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
        setScore(0);
        setIsGameOver(false);
        setCurrentShapes(getRandomShapes(3));
    };

    return {
        grid,
        currentShapes,
        score,
        highScore,
        isGameOver,
        placeShape,
        resetGame,
        canPlaceShape,
        clearedLines
    };
};
