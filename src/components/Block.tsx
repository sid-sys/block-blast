import React from 'react';
import { clsx } from 'clsx';

interface BlockProps {
    color: string;
    size?: number | string;
    className?: string;
    isGhost?: boolean;
}

export const Block: React.FC<BlockProps> = ({ color, size = '100%', className, isGhost }) => {
    return (
        <div
            className={clsx('cell-block', className)}
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                opacity: isGhost ? 0.5 : 1,
            }}
        >
            <div className="cell-bevel" />
        </div>
    );
};
