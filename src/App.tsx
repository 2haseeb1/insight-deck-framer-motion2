import React, { useEffect, useMemo, useState } from "react";
import ReorderableGrid, { type Widget } from "./components/ReorderableGrid";
import LineChart from "./components/LineChart";
import RangeScrubber from "./components/RangeScrubber";
import {
    BrowserRouter,
    Routes,
    Route,
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, cubicBezier } from "framer-motion";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";

const ease = cubicBezier(0.22, 1, 0.36, 1);

export default function App() {
    return (
        <MotionConfig reducedMotion="user">
            <BrowserRouter>
                <ThemeProvider>
                    <Shell />
                </ThemeProvider>
            </BrowserRouter>
        </MotionConfig>
    );
}

function Shell() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toggle } = useTheme();

    // 1) Command palette
    const [cmdOpen, setCmdOpen] = useState(false);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setCmdOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // 2) Route progress bar
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        // Start progress on path change
        setProgress(5);
        let val = 5;
        const id = setInterval(() => {
            val = Math.min(80, val + (80 - val) * 0.25 + 3);
            setProgress(val);
        }, 120);
        return () => clearInterval(id);
    }, [location.pathname]);

    const finishProgressSoon = () => {
        // Finish after main content finishes its enter animation
        setProgress(100);
        setTimeout(() => setProgress(0), 250);
    };

    // 3) Auto-hide header on scroll
    const [hideHeader, setHideHeader] = useState(false);
    useEffect(() => {
        let lastY = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            const dy = y - lastY;
            if (y < 8) setHideHeader(false);
            else if (dy > 4) setHideHeader(true); // scrolling down
            else if (dy < -4) setHideHeader(false); // scrolling up
            lastY = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
            {/* Top route progress bar */}
            <RouteProgress value={progress} />

            {/* Auto-hiding header */}
            <motion.header
                initial={false}
                animate={{ y: hideHeader ? -56 : 0 }}
                transition={{ duration: 0.2, ease }}
                className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--header)] backdrop-blur"
                style={{ willChange: "transform" }}
            >
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <div className="font-semibold">InsightDeck</div>
                    <nav className="flex items-center gap-3 text-sm">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "text-[var(--fg)]" : "text-[color:var(--muted)] hover:text-[var(--fg)]"
                            }
                            end
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/reports"
                            className={({ isActive }) =>
                                isActive ? "text-[var(--fg)]" : "text-[color:var(--muted)] hover:text-[var(--fg)]"
                            }
                        >
                            Reports
                        </NavLink>

                        <ThemeToggle />
                        {/* Command palette button (optional) */}
                        <button
                            onClick={() => setCmdOpen(true)}
                            className="hidden items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--elev-1)] px-2.5 py-1.5 text-xs text-[color:var(--muted)] sm:flex"
                            title="Open command palette (Ctrl/⌘+K)"
                        >
                            ⌘K
                        </button>
                    </nav>
                </div>
            </motion.header>

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease }}
                    onAnimationComplete={finishProgressSoon}
                    className="mx-auto w-full max-w-6xl px-4 py-8"
                >
                    <Routes location={location}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </motion.main>
            </AnimatePresence>

            {/* Command palette overlay */}
            <CommandPalette
                open={cmdOpen}
                onClose={() => setCmdOpen(false)}
                onAction={(a) => {
                    if (a === "goto:dashboard") navigate("/");
                    if (a === "goto:reports") navigate("/reports");
                    if (a === "action:toggle-theme") toggle();
                    setCmdOpen(false);
                }}
            />
        </div>
    );
}

function Card({ className = "", children }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={`rounded-xl border border-[color:var(--border)] bg-[var(--elev-1)] ${className}`}>
            {children}
        </div>
    );
}

function DashboardPage() {
    // KPI widgets
    const widgets: Widget[] = useMemo(
        () => [
            {
                id: "revenue",
                node: (
                    <div className="p-4">
                        <div className="text-sm text-[color:var(--muted)]">Revenue</div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">$186,000</div>
                        <div className="mt-1 text-xs text-green-600">+12.4%</div>
                    </div>
                ),
            },
            {
                id: "mrr",
                node: (
                    <div className="p-4">
                        <div className="text-sm text-[color:var(--muted)]">MRR</div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">$115,000</div>
                        <div className="mt-1 text-xs text-green-600">+9.9%</div>
                    </div>
                ),
            },
            {
                id: "active-users",
                node: (
                    <div className="p-4">
                        <div className="text-sm text-[color:var(--muted)]">Active Users</div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">24,120</div>
                        <div className="mt-1 text-xs text-green-600">+6.2%</div>
                    </div>
                ),
            },
            {
                id: "arpu",
                node: (
                    <div className="p-4">
                        <div className="text-sm text-[color:var(--muted)]">ARPU</div>
                        <div className="mt-1 text-2xl font-semibold tabular-nums">$7.71</div>
                        <div className="mt-1 text-xs text-green-600">+2.8%</div>
                    </div>
                ),
            },
        ],
        []
    );

    // Demo series
    const series = useMemo(() => {
        const now = Date.now();
        return Array.from({ length: 30 }, (_, i) => {
            const t = now - (29 - i) * 24 * 60 * 60 * 1000;
            const base = 120000 + i * 1200;
            const noise = (Math.random() - 0.5) * 3000;
            return { t, value: Math.max(10000, base + noise) };
        });
    }, []);

    // Range state for scrubber (last 20 points)
    const [range, setRange] = useState<[number, number]>(() => {
        const n = series.length;
        return [Math.max(0, n - 20), n - 1];
    });
    const visible = useMemo(() => series.slice(range[0], range[1] + 1), [series, range]);

    return (
        <section className="space-y-6">
            <h1 className="text-2xl font-semibold">Overview</h1>

            <ReorderableGrid initial={widgets} storageKey="kpi-order-v1" />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-4 lg:col-span-2">
                    <h2 className="mb-3 text-sm font-medium text-[color:var(--muted)]">Revenue</h2>
                    <LineChart data={visible} height={260} />
                    <RangeScrubber count={series.length} value={range} onChange={setRange} minSpan={1} />
                </Card>

                <Card className="p-4">
                    <h2 className="mb-3 text-sm font-medium text-[color:var(--muted)]">Notes</h2>
                    <p className="text-sm text-[color:var(--muted)]">এখানে ফিল্টার/ব্রেকডাউন যোগ করতে পারেন।</p>
                </Card>
            </div>
        </section>
    );
}

function ReportsPage() {
    const items = [
        { id: "r1", title: "Growth Q3 Retrospective", category: "Marketing" },
        { id: "r2", title: "Checkout Funnel Analysis", category: "Product" },
        { id: "r3", title: "User Retention Cohorts", category: "Growth" },
    ];

    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Reports</h1>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r, i) => (
                    <motion.li
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease, delay: i * 0.04 }}
                    >
                        <Card className="p-4">
                            <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">{r.category}</div>
                            <div className="mt-1 font-medium">{r.title}</div>
                            <div className="mt-2 text-sm text-[color:var(--muted)]">
                                Summary placeholder. Click-through can open a modal when you add it.
                            </div>
                        </Card>
                    </motion.li>
                ))}
            </ul>
        </section>
    );
}

function NotFoundPage() {
    return (
        <div className="py-10 text-center text-[color:var(--muted)]">
            <div className="text-3xl font-semibold">404</div>
            <p className="mt-2">Page not found</p>
        </div>
    );
}

/* ====== Extras: progress bar + command palette components ====== */

function RouteProgress({ value }: { value: number }) {
    const visible = value > 0 && value < 100;
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed left-0 top-0 z-[60] h-0.5 bg-[var(--fg)]/80"
                    style={{ width: `${Math.max(5, Math.min(99, value))}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                />
            )}
        </AnimatePresence>
    );
}

function CommandPalette({
    open,
    onClose,
    onAction,
}: {
    open: boolean;
    onClose: () => void;
    onAction: (action: "goto:dashboard" | "goto:reports" | "action:toggle-theme") => void;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const items = [
        { id: "goto:dashboard", label: "Go to Dashboard" },
        { id: "goto:reports", label: "Go to Reports" },
        { id: "action:toggle-theme", label: "Toggle theme" },
    ] as const;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="w-full max-w-lg overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--elev-1)]"
                        initial={{ y: 12, scale: 0.98, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 12, scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="border-b border-[color:var(--border)]">
                            <input
                                autoFocus
                                placeholder="Search actions… (↑↓ to navigate, Enter to run)"
                                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                            />
                        </div>
                        <ul className="max-h-72 overflow-auto p-2 text-sm">
                            {items.map((it) => (
                                <li key={it.id}>
                                    <button
                                        onClick={() => onAction(it.id)}
                                        className="block w-full rounded px-2 py-1 text-left hover:bg-black/5"
                                    >
                                        {it.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between border-t border-[color:var(--border)] px-3 py-2 text-[10px] text-[color:var(--muted)]">
                            <span>Press Esc to close</span>
                            <span>Ctrl/⌘ + K</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}