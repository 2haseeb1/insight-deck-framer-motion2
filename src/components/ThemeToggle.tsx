// src/components/ThemeToggle.tsx
import { motion, AnimatePresence, cubicBezier } from "framer-motion";
import { useTheme } from "../theme/ThemeProvider";

const ease = cubicBezier(0.22, 1, 0.36, 1);

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggle}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[var(--elev-1)]"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: -45, scale: 0.9 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 45, scale: 0.9 }}
                        transition={{ duration: 0.2, ease }}
                        className="text-[var(--fg)]"
                    >
                        {/* Moon icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
                        </svg>
                    </motion.span>
                ) : (
                    <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: 45, scale: 0.9 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -45, scale: 0.9 }}
                        transition={{ duration: 0.2, ease }}
                        className="text-[var(--fg)]"
                    >
                        {/* Sun icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1.1a1 1 0 1 1 2 0V21a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V3a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm9 7h-1.1a1 1 0 1 1 0-2H21a1 1 0 1 1 0 2ZM5.1 12a1 1 0 1 1 0-2H6.2a1 1 0 0 1 0 2H5.1ZM18.36 19.78a1 1 0 0 1-1.41 0l-.78-.78a1 1 0 1 1 1.41-1.41l.78.78a1 1 0 0 1 0 1.41Zm-10.53-10.5a1 1 0 0 1-1.41 0l-.78-.78A1 1 0 1 1 6.55 6.6l.78.78a1 1 0 0 1 0 1.41Zm10.5-3.18a1 1 0 0 1 0 1.41l-.78.78a1 1 0 1 1-1.41-1.41l.78-.78a1 1 0 0 1 1.41 0Zm-10.5 10.5a1 1 0 0 1 0 1.41l-.78.78a1 1 0 0 1-1.41-1.41l.78-.78a1 1 0 0 1 1.41 0Z" />
                        </svg>
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}