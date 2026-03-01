/**
 * src/components/KpiCard.tsx
 * Animated KPI card with counting number, gradient icon bg, and hover lift.
 */
import React, { useEffect, useRef, useState } from "react";

type Props = {
    label: string;
    value: number;
    unit?: string;
    prefix?: string;
    icon: React.ReactNode;
    sub?: string;
    subColor?: string;
    delay?: number;         // ms delay for stagger
    target?: number;        // if provided, shows target line
    targetLabel?: string;
};

/** Counts from 0 to target over ~800ms */
function useCountUp(target: number, duration = 900, delay = 0) {
    const [val, setVal] = useState(0);
    const raf = useRef<number | null>(null);

    useEffect(() => {
        let start = 0;
        const timeout = setTimeout(() => {
            const startTime = performance.now();
            const step = (now: number) => {
                const pct = Math.min((now - startTime) / duration, 1);
                const ease = 1 - Math.pow(1 - pct, 3); // easeOutCubic
                setVal(parseFloat((ease * target).toFixed(1)));
                if (pct < 1) raf.current = requestAnimationFrame(step);
            };
            raf.current = requestAnimationFrame(step);
        }, delay);

        return () => {
            clearTimeout(start);
            clearTimeout(timeout);
            if (raf.current) cancelAnimationFrame(raf.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    return val;
}

const KpiCard: React.FC<Props> = ({
    label, value, unit, prefix, icon, sub, subColor, delay = 0, target, targetLabel,
}) => {
    const displayVal = useCountUp(value, 900, delay);

    return (
        <div
            className="kpi-card bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2"
            style={{
                boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                animation: `slideUp 0.5s ease ${delay}ms both`,
            }}
        >
            <div className="flex items-start justify-between">
                {/* Icon */}
                <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-100">
                    <div className="text-[#0066A1]">{icon}</div>
                </div>

                {/* Value */}
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 tabular-nums leading-none">
                        {prefix}{displayVal % 1 === 0 ? Math.round(displayVal) : displayVal.toFixed(1)}{unit}
                    </div>
                    {sub && (
                        <div className="text-[11px] mt-1 font-medium" style={{ color: subColor || "#6b7280" }}>
                            {sub}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>

                {/* Progress bar toward target */}
                {target !== undefined && (
                    <div className="mt-1.5">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full animate-progress bg-[#0066A1]"
                                style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
                            />
                        </div>
                        {targetLabel && (
                            <div className="text-[10px] text-gray-400 mt-0.5">{targetLabel}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KpiCard;
