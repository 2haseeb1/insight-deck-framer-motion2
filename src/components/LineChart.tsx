import React, { useMemo, useRef, useState } from "react";
import { motion, cubicBezier } from "framer-motion";

type Point = { t: number; value: number };

export default function LineChart({
    data,
    height = 260,
}: {
    data: Point[];
    height?: number;
}) {
    const padding = { top: 16, right: 16, bottom: 24, left: 36 };
    const width = 800; // viewBox width (responsive via SVG)
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const yMin = min * 0.9;
    const yMax = max * 1.1;

    const x = (i: number) => (i / Math.max(1, data.length - 1)) * innerW + padding.left;
    const y = (v: number) => {
        if (yMax === yMin) return padding.top + innerH / 2;
        return padding.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
    };

    const d = useMemo(
        () => data.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)},${y(p.value)}`).join(" "),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data.length, yMin, yMax]
    );
    const area = `${d} L ${x(data.length - 1)},${y(yMin)} L ${x(0)},${y(yMin)} Z`;

    const ticks = 4;
    const gridYs = Array.from({ length: ticks + 1 }, (_, i) => padding.top + (i / ticks) * innerH);

    const ease = cubicBezier(0.22, 1, 0.36, 1);

    // Tooltip + crosshair
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const hitRef = useRef<SVGRectElement>(null);

    const onMove = (e: React.PointerEvent<SVGRectElement>) => {
        if (!hitRef.current || data.length === 0) return;
        const rect = hitRef.current.getBoundingClientRect();
        const rel = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        const idx = Math.round(rel * (data.length - 1));
        setHoverIdx(idx);
    };
    const onLeave = () => setHoverIdx(null);

    const cx = hoverIdx != null ? x(hoverIdx) : null;
    const cy = hoverIdx != null ? y(data[hoverIdx].value) : null;

    // Tooltip box placement
    const tipW = 140;
    const tipH = 34;
    const plotLeft = padding.left;
    const plotRight = padding.left + innerW;
    const plotTop = padding.top;
    const plotBottom = padding.top + innerH;

    let tipX = cx ?? 0;
    let tipY = cy ?? 0;
    if (cx != null && cy != null) {
        const toRight = cx + 8 + tipW <= plotRight;
        tipX = toRight ? cx + 8 : cx - 8 - tipW;
        const above = cy - 8 - tipH >= plotTop;
        tipY = above ? cy - tipH - 8 : Math.min(cy + 8, plotBottom - tipH);
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
            <defs>
                <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {/* Grid */}
            {gridYs.map((gy, i) => (
                <line key={i} x1={padding.left} x2={padding.left + innerW} y1={gy} y2={gy} stroke="#e5e7eb" strokeWidth="1" />
            ))}

            {/* Area */}
            <motion.path
                key={`area-${data.length}-${min}-${max}`}
                d={area}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease }}
            />

            {/* Line */}
            <motion.path
                key={`line-${data.length}-${min}-${max}`}
                d={d}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease }}
            />

            {/* Crosshair + point + tooltip */}
            {hoverIdx != null && cx != null && cy != null && (
                <g>
                    <motion.line
                        x1={cx}
                        x2={cx}
                        y1={plotTop}
                        y2={plotBottom}
                        stroke="currentColor"
                        style={{ color: "var(--muted)" }}
                        strokeDasharray="3 3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />

                    <circle cx={cx} cy={cy} r="4.5" fill="#111827" />
                    <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />

                    <g transform={`translate(${tipX}, ${tipY})`}>
                        <rect width={tipW} height={tipH} rx="6" fill="var(--elev-1)" stroke="var(--border)" />
                        <text x={8} y={14} fontSize="10" fill="var(--muted)">
                            {new Date(data[hoverIdx].t).toLocaleDateString()}
                        </text>
                        <text x={8} y={26} fontSize="12" fontWeight={600} fill="var(--fg)">
                            ${Math.round(data[hoverIdx].value).toLocaleString()}
                        </text>
                    </g>
                </g>
            )}

            {/* Hit rect to capture pointer */}
            <rect
                ref={hitRef}
                x={padding.left}
                y={padding.top}
                width={innerW}
                height={innerH}
                fill="transparent"
                style={{ cursor: "crosshair" }}
                onPointerMove={onMove}
                onPointerEnter={onMove}
                onPointerLeave={onLeave}
            />
        </svg>
    );
}