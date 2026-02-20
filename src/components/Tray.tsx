import React from 'react';
import { type Shape } from '../utils/shapes';
import { Block } from './Block';

interface TrayProps {
    shapes: Shape[];
    setDraggedShape: (shape: Shape | null) => void;
}

export const Tray: React.FC<TrayProps> = ({ shapes, setDraggedShape }) => {
    return (
        <div className="tray-container">
            {shapes.map((shape) => (
                <div
                    key={shape.id}
                    onPointerDown={(e) => {
                        // @ts-ignore - setPointerCapture exists but may not be in types depending on TS version
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setDraggedShape(shape);
                    }}
                    className="tray-shape"
                    style={{ touchAction: 'none' }}
                >
                    <div
                        className="shape-grid"
                        style={{
                            gridTemplateColumns: `repeat(${shape.matrix[0].length}, 20px)`,
                        }}
                    >
                        {shape.matrix.map((row, i) => (
                            row.map((val, j) => (
                                <div key={`${i}-${j}`} style={{ width: 20, height: 20 }}>
                                    {val === 1 && <Block color={shape.color} size="20px" />}
                                </div>
                            ))
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
