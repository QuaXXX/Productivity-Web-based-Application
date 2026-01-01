import { useCallback } from 'react';

// Helper to play a synthesized beep (No external assets needed)
const playSynth = (frequency = 440, type = 'sine', duration = 0.1) => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio play failed silently:", e);
    }
};

const useSoundEffects = () => {
    // In a real scenario with assets, we would do:
    // const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.25 });
    // But for this "Stable Juice" prompt, we use synth fallbacks to ensure it works immediately without assets.

    const playTier1 = useCallback(() => {
        // "Pop" - High pitch short sine
        playSynth(600, 'sine', 0.1);
    }, []);

    const playTier2 = useCallback(() => {
        // "Success Chord" - Arpeggio
        setTimeout(() => playSynth(400, 'sine', 0.2), 0);
        setTimeout(() => playSynth(500, 'sine', 0.2), 100);
        setTimeout(() => playSynth(600, 'sine', 0.4), 200);
    }, []);

    const playTier3 = useCallback(() => {
        // "Magical Fanfare"
        const now = 0;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
        notes.forEach((freq, i) => {
            setTimeout(() => playSynth(freq, 'triangle', 0.5), i * 150);
        });
    }, []);

    const playSound = useCallback((type) => {
        switch (type) {
            case 'click':
                playSynth(800, 'sine', 0.05); // High crisp click
                break;
            case 'success':
                playTier2();
                break;
            case 'error':
                playSynth(150, 'sawtooth', 0.3);
                break;
            default:
                playTier1();
        }
    }, [playTier1, playTier2]);

    return { playTier1, playTier2, playTier3, playSound };
};

export default useSoundEffects;
