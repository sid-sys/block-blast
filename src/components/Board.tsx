import React, { useState } from 'react';
import { type GridCell, GRID_SIZE, type ClearedLines } from '../hooks/useGameLogic';
import { type Shape } from '../utils/shapes';
import { Block } from './Block';
import { ClearEffects } from './ClearEffects';
import { AnimatePresence, motion } from 'framer-motion';

interface BoardProps {
    grid: GridCell[][];
    canPlaceShape: (grid: GridCell[][], shape: Shape, r: number, c: number) => boolean;
    onPlaceShape: (shape: Shape, r: number, c: number) => boolean;
    draggedShape: Shape | null;
    clearedLines: ClearedLines | null;
}

export const Board: React.FC<BoardProps> = ({ grid, canPlaceShape, onPlaceShape, draggedShape, clearedLines }) => {
    const [hoverPos, setHoverPos] = useState<{ r: number, c: number } | null>(null);

    const handleDragOver = (e: React.DragEvent, r: number, c: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedShape) {
            // Center the shape on the cursor instead of anchoring at top-left
            const offsetR = Math.floor(draggedShape.matrix.length / 2);
            const offsetC = Math.floor(draggedShape.matrix[0].length / 2);
            const adjustedR = r - offsetR;
            const adjustedC = c - offsetC;

            if (hoverPos?.r !== adjustedR || hoverPos?.c !== adjustedC) {
                setHoverPos({ r: adjustedR, c: adjustedC });
            }
        }
    };

    const handleDragLeave = () => {
        setHoverPos(null);
    };



    // Calculate ghost cells
    const ghostCells = new Set<string>();
    let isValidPlacement = false;

    if (draggedShape && hoverPos) {
        isValidPlacement = canPlaceShape(grid, draggedShape, hoverPos.r, hoverPos.c);
        if (isValidPlacement) {
            for (let i = 0; i < draggedShape.matrix.length; i++) {
                for (let j = 0; j < draggedShape.matrix[i].length; j++) {
                    if (draggedShape.matrix[i][j] === 1) {
                        ghostCells.add(`${hoverPos.r + i},${hoverPos.c + j}`);
                    }
                }
            }
        }
    }

    const [ripples, setRipples] = useState<{ id: number; r: number; c: number; color: string }[]>([]);

    const triggerRipple = (r: number, c: number, color: string) => {
        setRipples((prev) => [...prev, { id: Date.now(), r, c, color }]);
    };

    const handleDropWithRipple = (e: React.DragEvent, r: number, c: number) => {
        e.preventDefault();
        setHoverPos(null);
        if (draggedShape) {
            // Center the shape on the cursor (same offset as handleDragOver)
            const offsetR = Math.floor(draggedShape.matrix.length / 2);
            const offsetC = Math.floor(draggedShape.matrix[0].length / 2);
            const adjustedR = r - offsetR;
            const adjustedC = c - offsetC;

            const success = onPlaceShape(draggedShape, adjustedR, adjustedC);
            if (success) {
                // Calculate center of the shape for the ripple origin
                const rows = draggedShape.matrix.length;
                const cols = draggedShape.matrix[0].length;
                const centerR = adjustedR + (rows / 2);
                const centerC = adjustedC + (cols / 2);
                triggerRipple(centerR, centerC, draggedShape.color);
            }
        }
    };

    return (
        <div
            className="game-grid"
            style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
            onMouseLeave={handleDragLeave}
        >
            {grid.map((row, r) => (
                row.map((cell, c) => {
                    const isGhost = ghostCells.has(`${r},${c}`);

                    return (
                        <div
                            key={`${r}-${c}`}
                            className="grid-cell"
                            onDragOver={(e) => handleDragOver(e, r, c)}
                            onDrop={(e) => handleDropWithRipple(e, r, c)}
                        >
                            <AnimatePresence mode="popLayout">
                                {cell ? (
                                    <motion.div
                                        key="block"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <Block color={cell.color} />
                                    </motion.div>
                                ) : isGhost ? (
                                    <motion.div
                                        key="ghost"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <Block color={draggedShape!.color} isGhost />
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    );
                })
            ))}

            {/* Ripples Layer */}
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.id}
                    className="absolute pointer-events-none rounded-full border-2"
                    style={{
                        top: `calc(${ripple.r} * (100% / ${GRID_SIZE}))`,
                        left: `calc(${ripple.c} * (100% / ${GRID_SIZE}))`,
                        width: `calc(100% / ${GRID_SIZE})`,
                        height: `calc(100% / ${GRID_SIZE})`,
                        borderColor: ripple.color,
                        zIndex: 10,
                        position: 'absolute',
                    }}
                    initial={{ scale: 0.5, opacity: 1, borderWidth: '4px' }}
                    animate={{ scale: 6, opacity: 0, borderWidth: '0px' }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onAnimationComplete={() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id))}
                />
            ))}

            {/* Clear Effects Layer */}
            <ClearEffects clearedLines={clearedLines} />
        </div>
    );
};
