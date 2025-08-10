import React, { useMemo } from "react";
import ReorderableGrid, { type Widget } from "./components/ReorderableGrid";
import LineChart from "./components/LineChart";
import {
    BrowserRouter,
    Routes,
    Route,
    NavLink,
    useLocation,
} from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, cubicBezier } from "framer-motion";
import { ThemeProvider } from "./theme/ThemeProvider";
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

    return (
        <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
            <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--header)] backdrop-blur">
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
                    </nav>
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease }}
                    className="mx-auto w-full max-w-6xl px-4 py-8"
                >
                    <Routes location={location}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </motion.main>
            </AnimatePresence>
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
    // KPI widgets (drag-to-reorder)
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

    // Demo line series (30 days)
    const series = useMemo(() => {
        const now = Date.now();
        return Array.from({ length: 30 }, (_, i) => {
            const t = now - (29 - i) * 24 * 60 * 60 * 1000;
            const base = 120000 + i * 1200;
            const noise = (Math.random() - 0.5) * 3000;
            return { t, value: Math.max(10000, base + noise) };
        });
    }, []);

    return (
        <section className="space-y-6">
            <h1 className="text-2xl font-semibold">Overview</h1>

            {/* Drag-to-reorder KPI widgets */}
            <ReorderableGrid initial={widgets} storageKey="kpi-order-v1" />

            {/* Charts area */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-4 lg:col-span-2">
                    <h2 className="mb-3 text-sm font-medium text-[color:var(--muted)]">Revenue</h2>
                    <LineChart data={series} height={260} />
                </Card>

                <Card className="p-4">
                    <h2 className="mb-3 text-sm font-medium text-[color:var(--muted)]">Notes</h2>
                    <p className="text-sm text-[color:var(--muted)]">
                        এখানে ফিল্টার/ব্রেকডাউন যোগ করতে পারেন।
                    </p>
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
                            <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
                                {r.category}
                            </div>
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