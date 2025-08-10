// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const ThemeContext = createContext<Ctx | null>(null);
const ease = cubicBezier(0.22, 1, 0.36, 1);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const saved = localStorage.getItem("theme") as Theme | null;
            if (saved === "light" || saved === "dark") return saved;
        } catch { }
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    });

    const [fadeKey, setFadeKey] = useState(0);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("theme", theme); } catch { }
        setFadeKey((k) => k + 1); // triggers crossfade overlay
    }, [theme]);

    const value = useMemo<Ctx>(() => ({
        theme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        setTheme,
    }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
            <AnimatePresence>
                <motion.div
                    key={fadeKey}
                    aria-hidden
                    className="pointer-events-none fixed inset-0 z-[60]"
                    style={{ background: "var(--bg)" }}  // new theme bg
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                />
            </AnimatePresence>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}