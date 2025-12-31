// Haptic feedback utility for PWA
// Uses navigator.vibrate() API when available

export const haptic = {
    // Light tap - checkbox, toggle
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    // Medium tap - button press, selection
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(25);
        }
    },

    // Success - completion, achievement
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([15, 50, 15]);
        }
    },

    // Error - invalid action
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([50, 30, 50]);
        }
    },

    // Celebration - streak, goal complete
    celebrate: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 30, 10, 30, 50]);
        }
    }
};

export default haptic;
