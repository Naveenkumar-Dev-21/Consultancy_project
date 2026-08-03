import { useCallback, useEffect, useState } from 'react';

/**
 * Shared dark-mode state.
 *
 * The `dark` class is applied to <html> by an inline script in index.html
 * before first paint, so this hook only mirrors and mutates that state — it
 * never owns the initial value.
 *
 * Keeping the source of truth on the DOM (rather than in a provider) means the
 * storefront Header and the admin DashboardHeader stay consistent even though
 * they never share a React tree: whichever one is mounted reads the same class,
 * and the `storage` listener syncs any other open tab.
 */
export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(
        () => document.documentElement.classList.contains('dark')
    );

    const applyTheme = useCallback((isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
        try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        } catch {
            // Private mode / storage disabled — theme still applies for this session.
        }
        setDarkMode(isDark);
    }, []);

    const toggleDarkMode = useCallback(
        () => applyTheme(!document.documentElement.classList.contains('dark')),
        [applyTheme]
    );

    // Mirror theme changes made in other tabs.
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== 'theme') return;
            const isDark = e.newValue === 'dark';
            document.documentElement.classList.toggle('dark', isDark);
            setDarkMode(isDark);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return { darkMode, toggleDarkMode };
};

export default useDarkMode;
