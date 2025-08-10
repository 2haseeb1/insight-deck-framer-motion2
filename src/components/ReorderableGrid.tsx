import React, { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";

export type Widget = { id: string; node: React.ReactNode };

function orderByIds(items: Widget[], ids: string[]) {
    const map = new Map(items.map((it) => [it.id, it]));
    const ordered: Widget[] = [];
    ids.forEach((id) => {
        const it = map.get(id);
        if (it) {
            ordered.push(it);
            map.delete(id);
        }
    });
    for (const it of map.values()) ordered.push(it);
    return ordered;
}

export default function ReorderableGrid({
    initial,
    storageKey = "kpi-order-v1",
    className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
    longPressMs = 260,
}: {
    initial: Widget[];
    storageKey?: string;
    className?: string;
    longPressMs?: number;
}) {
    const [items, setItems] = useState<Widget[]>(() => initial);

    // NON-NULL ref (fixes the TS mismatch)
    const containerRef = useRef<HTMLDivElement>(null!);

    // Load saved order once on mount
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]") as string[];
            if (Array.isArray(saved) && saved.length) {
                setItems(orderByIds(initial, saved));
            } else {
                setItems(initial);
            }
        } catch {
            setItems(initial);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist order
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(items.map((i) => i.id)));
        } catch { }
    }, [items, storageKey]);

    return (
        <div ref={containerRef} className={className} style={{ position: "relative" }}>
            {/* contents so items still participate in the CSS grid */}
            <Reorder.Group
                axis="y"
                values={items}
                onReorder={(next) => {
                    setItems(next);
                    console.log("New order:", next.map((n) => n.id));
                }}
                className="contents"
            >
                {items.map((item) => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        longPressMs={longPressMs}
                        containerRef={containerRef}
                    />
                ))}
            </Reorder.Group>
        </div>
    );
}

function DraggableItem({
    item,
    longPressMs,
    containerRef,
}: {
    item: Widget;
    longPressMs: number;
    containerRef: React.RefObject<HTMLDivElement>; // expects non-nullable ref
}) {
    const controls = useDragControls();

    // Long-press support
    const timeoutRef = useRef<number | null>(null);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);
    const lastNativeEventRef = useRef<PointerEvent | null>(null);

    const clearLongPress = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        startPosRef.current = null;
        lastNativeEventRef.current = null;
    };

    const onItemPointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return; // left click only
        const target = e.target as HTMLElement;

        // If using the handle, let the handle take over
        if (target.closest("[data-drag-handle]")) return;

        // Skip interactive controls
        if (target.closest("a,button,input,textarea,select,label")) return;

        lastNativeEventRef.current = e.nativeEvent as PointerEvent;
        startPosRef.current = { x: e.clientX, y: e.clientY };

        const isTouch = (e as any).pointerType === "touch";
        const delay = isTouch ? Math.max(180, longPressMs - 60) : longPressMs;

        timeoutRef.current = window.setTimeout(() => {
            if (lastNativeEventRef.current) {
                controls.start(lastNativeEventRef.current); // begin drag after hold
            }
            clearLongPress();
        }, delay);
    };

    const onItemPointerMove = (e: React.PointerEvent) => {
        if (!startPosRef.current) return;
        const dx = Math.abs(e.clientX - startPosRef.current.x);
        const dy = Math.abs(e.clientY - startPosRef.current.y);
        if (dx + dy > 8) clearLongPress(); // cancel if user moves too far
    };

    const onItemPointerUp = () => clearLongPress();
    const onItemPointerCancel = () => clearLongPress();
    const onItemPointerLeave = () => clearLongPress();

    return (
        <Reorder.Item
            value={item}
            as="div"
            drag
            dragListener={true}                // DEBUG: drag anywhere on the card
            dragConstraints={containerRef}
            dragElastic={0.12}
            dragMomentum={false}
            layout
            transition={{ layout: { type: "spring", stiffness: 550, damping: 40, mass: 0.6 } }}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                zIndex: 10,
            }}
            className="relative group cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: "manipulation" }}
        >
            {/* Handle (always visible for debug) */}
            <div className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--elev-1)] text-[color:var(--muted)] shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="7" cy="7" r="1.5" />
                    <circle cx="7" cy="12" r="1.5" />
                    <circle cx="7" cy="17" r="1.5" />
                    <circle cx="12" cy="7" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="17" r="1.5" />
                </svg>
            </div>

            {/* Card content */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--elev-1)]">
                {item.node}
            </div>
        </Reorder.Item>
    );
}