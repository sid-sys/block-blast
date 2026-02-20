// Procedural sound effects using the Web Audio API
let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
};

/** Short percussive "click" when a block snaps to the grid */
export const playSnap = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
};

/** Rising sweep when a row or column is cleared */
export const playClear = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Bright sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.35);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);

    // Sparkle layer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, t);
    osc2.frequency.exponentialRampToValueAtTime(2400, t + 0.2);
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.3);
};

/** Ascending arpeggio for combos — pitch rises with combo level */
export const playCombo = (combo: number) => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const baseFreq = 400 + combo * 100; // Higher pitch for bigger combos

    for (let i = 0; i < Math.min(combo + 1, 5); i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq * (1 + i * 0.25), t + i * 0.08);
        gain.gain.setValueAtTime(0, t + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, t + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.15);
    }
};

/** "Good!" — cheerful two-note chime */
export const playGood = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const notes = [523, 659]; // C5, E5

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(0.2, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.2);
    });
};

/** "Excellent!" — triumphant three-note fanfare */
export const playExcellent = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const notes = [523, 659, 784]; // C5, E5, G5

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);
        gain.gain.setValueAtTime(0.2, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.25);
    });
};

/** "Unbelievable! / Legendary!" — epic ascending arpeggio with harmonics */
export const playLegendary = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        osc2.frequency.setValueAtTime(freq * 2, t + i * 0.1);
        gain.gain.setValueAtTime(0.18, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc2.connect(gain);
        osc.start(t + i * 0.1);
        osc2.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.35);
        osc2.stop(t + i * 0.1 + 0.35);
    });
};

/** Game over — descending sad tones */
export const playGameOver = () => {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const notes = [400, 350, 300, 200];

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.2);
        gain.gain.setValueAtTime(0.2, t + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t + i * 0.2);
        osc.stop(t + i * 0.2 + 0.4);
    });
};
