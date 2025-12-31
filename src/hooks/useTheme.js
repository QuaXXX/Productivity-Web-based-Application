import { useState, useEffect } from 'react';

function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem('productivity_theme');
            if (stored) return stored;

            // Default to system preference if no stored value
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        window.localStorage.setItem('productivity_theme', theme);
    }, [theme]);

    return [theme, setTheme];
}

export default useTheme;
