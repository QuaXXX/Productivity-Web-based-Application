import { useState, useEffect, useRef } from 'react';

function useLocalStorage(key, initialValue) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Debounce synchronization if needed? App.jsx used debouncing.
    // For standard hook, we usually sync immediately.
    // Given the app used useDebounce for storage, we might want to respect that performance optimization.
    // But for a cleaner refactor, direct sync is safer unless performance hits.
    // Let's stick to direct sync for simplicity in this standard hook, 
    // BUT App.jsx had `useDebounce`. I should probably implement a `useDebouncedLocalStorage`?
    // Or just `useLocalStorage` and let App handle debouncing? 
    // The previous code: `const debouncedHabits = useDebounce(habits, 1000); useEffect(...)`
    // This implies `habits` state updates INSTANTLY (UI responsive), storage updates LATER.

    // So `storedValue` (state) should update instantly. The `setItem` should be side-effect.

    return [storedValue, setValue];
}

export default useLocalStorage;
