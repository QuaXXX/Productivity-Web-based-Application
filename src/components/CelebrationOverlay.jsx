import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import confetti from 'canvas-confetti';

const CelebrationOverlay = ({ data }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    // Parse data safely
    const type = data ? data.type : null;
    const originId = data ? data.originId : null;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
            const handleResize = () => {
                setDimensions({ width: window.innerWidth, height: window.innerHeight });
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        if (!type) return;

        // Function to get normalized origin from an ID
        const getOrigin = (id) => {
            if (!id) return { x: 0.5, y: 0.5 };
            const element = document.getElementById(id);
            if (element) {
                const rect = element.getBoundingClientRect();
                return {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                };
            }
            return { x: 0.5, y: 0.5 };
        };

        if (type === 'tier2') {
            const origin = getOrigin(originId || 'daily-ring-container');
            const count = 100;
            const defaults = { origin: origin, zIndex: 100 };
            const fire = (particleRatio, opts) => {
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
            };

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        }
        else if (type === 'tier3') {
            // Extravagant Big Goal Celebration
            // Colors: Red, Gold, Blue (Theme) - Brighter for Dark Mode
            const colors = ['#F87171', '#FCD34D', '#60A5FA']; // Red-400, Amber-300, Blue-400
            const origin = getOrigin(originId);

            // 1. Center/Target Burst (Massive)
            const count = 250; // Double the daily amount
            const defaults = { origin: origin, colors: colors, zIndex: 100 };
            const fire = (particleRatio, opts) => {
                confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
            };

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });

            // 2. Side Cannons (Grand Finale)
            // Left Cannon
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 1 },
                    colors: colors,
                    zIndex: 100
                });
            }, 250);

            // Right Cannon
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 1 },
                    colors: colors,
                    zIndex: 100
                });
            }, 400);
        }

    }, [type, originId]);

    // ReactConfetti removed/unused now, as we moved fully to canvas-confetti for celebrations
    return null;
};

export default CelebrationOverlay;
