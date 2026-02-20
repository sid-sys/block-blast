import { useMemo, useState, useEffect } from 'react';
import { GRID_SIZE, type ClearedLines } from '../hooks/useGameLogic';
import { playGood, playExcellent, playLegendary } from '../utils/sfx';

interface ClearEffectsProps {
    clearedLines: ClearedLines | null;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    dx: number;  // pre-calculated horizontal offset
    dy: number;  // pre-calculated vertical offset
    delay: number;
}

// Generate random particles for the burst effect
const generateParticles = (
    rows: number[],
    cols: number[],
    beamColor: string
): Particle[] => {
    const particles: Particle[] = [];
    let id = 0;

    // Particles along cleared rows
    rows.forEach(r => {
        const y = ((r + 0.5) / GRID_SIZE) * 100;
        for (let i = 0; i < 20; i++) {
            const x = (Math.random()) * 100;
            const angle = (Math.random() - 0.5) * Math.PI;
            const speed = 30 + Math.random() * 60;
            particles.push({
                id: id++,
                x,
                y,
                color: beamColor,
                size: 6 + Math.random() * 6,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                delay: Math.random() * 0.3,
            });
        }
    });

    // Particles along cleared cols
    cols.forEach(c => {
        const x = ((c + 0.5) / GRID_SIZE) * 100;
        for (let i = 0; i < 20; i++) {
            const y = (Math.random()) * 100;
            const angle = (Math.random() - 0.5) * Math.PI;
            const speed = 30 + Math.random() * 60;
            particles.push({
                id: id++,
                x,
                y,
                color: beamColor,
                size: 6 + Math.random() * 6,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                delay: Math.random() * 0.3,
            });
        }
    });

    return particles;
};

// Convert a hex color to rgba with alpha
const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Build beam style from any color
const buildBeamStyle = (color: string) => ({
    bg: hexToRgba(color, 0.6),
    glow: hexToRgba(color, 0.4),
    text: color,
});

export const ClearEffects: React.FC<ClearEffectsProps> = ({ clearedLines }) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    // Derive beam color from the placed block's color
    const beamStyle = useMemo(() => {
        if (!clearedLines) return buildBeamStyle('#4ade80');
        return buildBeamStyle(clearedLines.color);
    }, [clearedLines]);

    // Generate particles when clearedLines changes
    useEffect(() => {
        if (clearedLines) {
            setParticles(generateParticles(clearedLines.rows, clearedLines.cols, clearedLines.color));
        } else {
            setParticles([]);
        }
    }, [clearedLines]);

    // Play compliment SFX based on combo level
    useEffect(() => {
        if (!clearedLines) return;
        const combo = clearedLines.combo;
        if (combo >= 4) playLegendary();
        else if (combo >= 2) playExcellent();
        else playGood();
    }, [clearedLines]);

    const rows = clearedLines?.rows ?? [];
    const cols = clearedLines?.cols ?? [];
    const score = clearedLines?.score ?? 0;
    const combo = clearedLines?.combo ?? 0;

    // Calculate center point for floating text — must always be called (Rules of Hooks)
    const centerPos = useMemo(() => {
        let avgR = GRID_SIZE / 2;
        let avgC = GRID_SIZE / 2;

        if (rows.length > 0 && cols.length > 0) {
            avgR = rows.reduce((a, b) => a + b, 0) / rows.length;
            avgC = cols.reduce((a, b) => a + b, 0) / cols.length;
        } else if (rows.length > 0) {
            avgR = rows.reduce((a, b) => a + b, 0) / rows.length;
            avgC = (GRID_SIZE - 1) / 2;
        } else if (cols.length > 0) {
            avgC = cols.reduce((a, b) => a + b, 0) / cols.length;
            avgR = (GRID_SIZE - 1) / 2;
        }

        return {
            top: `${(avgR / GRID_SIZE) * 100 + (100 / GRID_SIZE / 2)}%`,
            left: `${(avgC / GRID_SIZE) * 100 + (100 / GRID_SIZE / 2)}%`
        };
    }, [rows, cols]);

    const getCompliment = (combo: number) => {
        if (combo >= 4) return "LEGENDARY!";
        if (combo >= 3) return "UNBELIEVABLE!";
        if (combo >= 2) return "Excellent!";
        return "Good!";
    };

    // Early return AFTER all hooks
    if (!clearedLines) return null;

    return (
        <>
            {/* Row Beams — colored & glowing */}
            {rows.map(r => (
                <div
                    key={`row-beam-${r}`}
                    className="clear-beam clear-beam-row"
                    style={{
                        gridRowStart: r + 1,
                        gridRowEnd: r + 2,
                        gridColumnStart: 1,
                        gridColumnEnd: -1,
                        background: `linear-gradient(90deg, transparent 0%, ${beamStyle.bg} 15%, ${beamStyle.bg} 85%, transparent 100%)`,
                        boxShadow: `0 0 20px 8px ${beamStyle.glow}, inset 0 0 15px ${beamStyle.glow}`,
                    }}
                />
            ))}

            {/* Col Beams — colored & glowing */}
            {cols.map(c => (
                <div
                    key={`col-beam-${c}`}
                    className="clear-beam clear-beam-col"
                    style={{
                        gridColumnStart: c + 1,
                        gridColumnEnd: c + 2,
                        gridRowStart: 1,
                        gridRowEnd: -1,
                        background: `linear-gradient(180deg, transparent 0%, ${beamStyle.bg} 15%, ${beamStyle.bg} 85%, transparent 100%)`,
                        boxShadow: `0 0 20px 8px ${beamStyle.glow}, inset 0 0 15px ${beamStyle.glow}`,
                    }}
                />
            ))}

            {/* Particles */}
            {particles.map(p => (
                <div
                    key={`particle-${p.id}`}
                    className="clear-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        '--dx': `${p.dx}px`,
                        '--dy': `${p.dy}px`,
                        '--delay': `${p.delay}s`,
                    } as React.CSSProperties}
                />
            ))}

            {/* Floating Text */}
            <div
                className="floating-text-container"
                style={{ top: centerPos.top, left: centerPos.left }}
            >
                <div
                    className="floating-text-score"
                    style={{ color: beamStyle.text, textShadow: `0 0 20px ${beamStyle.glow}, 0 2px 8px rgba(0,0,0,0.6)` }}
                >
                    +{score}
                </div>
                {combo >= 1 && (
                    <div
                        className="floating-text-label"
                        style={{ color: beamStyle.text, textShadow: `0 0 10px ${beamStyle.glow}` }}
                    >
                        ✦ {getCompliment(combo)} ✦
                    </div>
                )}
            </div>
        </>
    );
};
