import React, { useRef } from "react";
import { motion } from "framer-motion";

export default function RangeScrubber({
    count,
    value,
    onChange,
    minSpan = 1,
}: {
    count: number;                 // total data points
    value: [number, number];       // [startIdx, endIdx] inclusive
    onChange: (r: [number, number]) => void;
    minSpan?: number;              // minimum width in points
}) {
    if (count <= 1) return null;

    const barRef = useRef<HTMLDivElement>(null!);
    const [start, end] = value;

    const pct = (idx: number) => (idx / (count - 1)) * 100;

    const handleDrag = (which: "start" | "end") => (_: any, info: { point: { x: number } }) => {
        const rect = barRef.current.getBoundingClientRect();
        const rel = Math.min(Math.max((info.point.x - rect.left) / rect.width, 0), 1);
        const idx = Math.round(rel * (count - 1));

        if (which === "start") {
            const nextStart = Math.min(idx, end - minSpan);
            onChange([Math.max(0, nextStart), end]);
        } else {
            const nextEnd = Math.max(idx, start + minSpan);
            onChange([start, Math.min(count - 1, nextEnd)]);
        }
    };

    return (
        <div className="mt-3">
            <div
                ref={barRef}
                className="relative h-8 w-full rounded-md border border-[color:var(--border)] bg-[var(--elev-1)]"
            >
                {/* selection shade */}
                <div
                    className="absolute top-0 h-full rounded-md bg-[color:var(--fg)]/10"
                    style={{
                        left: `${pct(start)}%`,
                        width: `${Math.max(0, pct(end) - pct(start))}%`,
                    }}
                />

                {/* start handle */}
                <motion.div
                    drag="x"
                    dragConstraints={barRef}
                    onDrag={handleDrag("start")}
                    className="absolute top-0 h-full w-2 -translate-x-1/2 cursor-ew-resize rounded bg-[color:var(--muted)]/50"
                    style={{ left: `${pct(start)}%` }}
                    whileDrag={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                />

                {/* end handle */}
                <motion.div
                    drag="x"
                    dragConstraints={barRef}
                    onDrag={handleDrag("end")}
                    className="absolute top-0 h-full w-2 -translate-x-1/2 cursor-ew-resize rounded bg-[color:var(--muted)]/50"
                    style={{ left: `${pct(end)}%` }}
                    whileDrag={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                />
            </div>

            <div className="mt-1 text-xs text-[color:var(--muted)]">
                Showing {end - start + 1} of {count} points
            </div>
        </div>
    );
}