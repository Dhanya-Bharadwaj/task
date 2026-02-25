/**
 * src/pages/BPVDashboard.tsx
 * BPV Navigation Dashboard — premium animated tile grid.
 */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import {
    LayoutDashboard, Monitor, Cpu, BarChart3, Activity,
    AlertTriangle, FileText, Settings, Users, Wrench,
    Info, Clock, TrendingUp, ChevronRight,
} from "lucide-react";

/* ─── Live stats ticker ─── */
const stats = [
    { label: "Plant OEE", value: "83.1%", up: true },
    { label: "Shift Output", value: "363 pcs", up: true },
    { label: "Availability", value: "91.2%", up: true },
    { label: "Defects", value: "8 pcs", up: false },
    { label: "Downtime", value: "52 min", up: false },
    { label: "Lines Running", value: "2 / 3", up: true },
];

/* ─── Module tile definitions ─── */
type Tile = {
    label: string;
    desc: string;
    icon: React.ReactNode;
    path: string;
    color: string;          // primary hex
    colorEnd: string;       // gradient end hex
    glowAlpha: number;      // 0–1
    tag?: string;
};

const tileGroups: { group: string; icon: React.ReactNode; color: string; tiles: Tile[] }[] = [
    {
        group: "Production Monitoring",
        icon: <Activity size={14} />,
        color: "#0066a1",
        tiles: [
            {
                label: "Shift ANDON",
                desc: "Live shift overview & ANDON board",
                icon: <LayoutDashboard size={32} />,
                path: "/home",
                color: "#0066a1", colorEnd: "#0096d4", glowAlpha: 0.4,
                tag: "LIVE",
            },
            {
                label: "Line Dashboard",
                desc: "Line-wise KPI & station status",
                icon: <Monitor size={32} />,
                path: "/line-dashboard",
                color: "#7c3aed", colorEnd: "#a855f7", glowAlpha: 0.35,
            },
            {
                label: "Machine Dashboard",
                desc: "Machine status & cycle time trends",
                icon: <Cpu size={32} />,
                path: "/machine-dashboard",
                color: "#0891b2", colorEnd: "#22d3ee", glowAlpha: 0.35,
            },
            {
                label: "Hourly Production",
                desc: "Target vs actual per hour",
                icon: <Clock size={32} />,
                path: "/hourly-production",
                color: "#d97706", colorEnd: "#f59e0b", glowAlpha: 0.35,
            },
            {
                label: "OEE Analysis",
                desc: "Availability · Performance · Quality",
                icon: <BarChart3 size={32} />,
                path: "/oee-analysis",
                color: "#059669", colorEnd: "#10b981", glowAlpha: 0.35,
            },
            {
                label: "Cycle Time Trends",
                desc: "Machine-wise cycle time analysis",
                icon: <TrendingUp size={32} />,
                path: "/machine-dashboard",
                color: "#db2777", colorEnd: "#ec4899", glowAlpha: 0.33,
            },
        ],
    },
    {
        group: "Quality & Losses · Operator",
        icon: <AlertTriangle size={14} />,
        color: "#dc2626",
        tiles: [
            {
                label: "Losses Entry",
                desc: "Manual downtime & quality entry",
                icon: <Wrench size={32} />,
                path: "/losses-entry",
                color: "#dc2626", colorEnd: "#ef4444", glowAlpha: 0.35,
            },
            {
                label: "Operator Screens",
                desc: "Downtime entry & rejection entry",
                icon: <Wrench size={32} />,
                path: "/operator-screens",
                color: "#b45309", colorEnd: "#f59e0b", glowAlpha: 0.35,
                tag: "RS-09",
            },
            {
                label: "Reports",
                desc: "Shift & daily reports, CSV export",
                icon: <FileText size={32} />,
                path: "/reports",
                color: "#0f766e", colorEnd: "#14b8a6", glowAlpha: 0.33,
            },
        ],
    },
    {
        group: "Administration",
        icon: <Settings size={14} />,
        color: "#475569",
        tiles: [
            {
                label: "User Management",
                desc: "Add, edit, delete users & roles (RS-04 RS-05)",
                icon: <Users size={32} />,
                path: "/user-config",
                color: "#1d4ed8", colorEnd: "#3b82f6", glowAlpha: 0.35,
            },
            {
                label: "Configuration",
                desc: "Hierarchy, shifts, reasons, product types (RS-03 RS-06 RS-07 RS-08)",
                icon: <Settings size={32} />,
                path: "/configuration",
                color: "#475569", colorEnd: "#64748b", glowAlpha: 0.25,
            },
            {
                label: "About BPV",
                desc: "Version info, scope & technology",
                icon: <Info size={32} />,
                path: "/about",
                color: "#6b7280", colorEnd: "#9ca3af", glowAlpha: 0.2,
            },
        ],
    },
];

/* ─── Animated count-up for stat bar ─── */
function useFlipStat(index: number) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), index * 120);
        return () => clearTimeout(t);
    }, [index]);
    return visible;
}

/* ─── Individual Stat Badge ─── */
const StatBadge: React.FC<{ s: typeof stats[0]; i: number }> = ({ s, i }) => {
    const visible = useFlipStat(i);
    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm flex-shrink-0"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
        >
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.up ? "bg-green-500" : "bg-red-500"}`}
                style={{ animation: "pulseGreen 2s ease-in-out infinite" }} />
            <span className="text-[10px] text-gray-400 font-medium">{s.label}</span>
            <span className={`text-xs font-bold ${s.up ? "text-green-700" : "text-red-600"}`}>{s.value}</span>
        </div>
    );
};

/* ─── Tile Card ─── */
const TileCard: React.FC<{ tile: Tile; delay: number }> = ({ tile, delay }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <button
            ref={ref}
            onClick={() => navigate(tile.path)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex flex-col gap-3 rounded-2xl text-left overflow-hidden cursor-pointer border border-transparent"
            style={{
                padding: "1.5rem",
                background: hovered
                    ? `linear-gradient(135deg, ${tile.color} 0%, ${tile.colorEnd} 100%)`
                    : "#ffffff",
                borderColor: hovered ? "transparent" : "#f1f5f9",
                boxShadow: hovered
                    ? `0 12px 40px rgba(${hexToRgb(tile.color)},${tile.glowAlpha}), 0 2px 8px rgba(0,0,0,0.08)`
                    : "0 1px 6px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                transform: mounted
                    ? hovered ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)"
                    : "translateY(20px)",
                opacity: mounted ? 1 : 0,
                transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
        >
            {/* Background pattern (only on hover) */}
            {hovered && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                    <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/8" />
                </div>
            )}

            {/* LIVE tag */}
            {tile.tag && (
                <div className="absolute top-3 right-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md animate-blink ${hovered ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
                        }`}>{tile.tag}</span>
                </div>
            )}

            {/* Icon box */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                style={{
                    background: hovered
                        ? "rgba(255,255,255,0.2)"
                        : `linear-gradient(135deg, ${tile.color}, ${tile.colorEnd})`,
                    boxShadow: hovered
                        ? "none"
                        : `0 4px 14px rgba(${hexToRgb(tile.color)},0.4)`,
                    transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1) rotate(0deg)",
                }}
            >
                <div style={{ color: hovered ? "#fff" : "#fff" }}>
                    {tile.icon}
                </div>
            </div>

            {/* Text */}
            <div className="relative z-10 flex-1">
                <div className={`font-bold text-sm leading-tight transition-colors duration-200 ${hovered ? "text-white" : "text-gray-800"}`}>
                    {tile.label}
                </div>
                <div className={`text-[11px] mt-1 leading-relaxed transition-colors duration-200 ${hovered ? "text-white/75" : "text-gray-400"}`}>
                    {tile.desc}
                </div>
            </div>

            {/* Arrow */}
            <div className={`flex items-center gap-1 text-xs font-semibold transition-all duration-200 ${hovered ? "text-white/90 translate-x-1" : "text-gray-300 translate-x-0"
                }`}>
                <span>Open</span>
                <ChevronRight size={13} />
            </div>

            {/* Bottom accent bar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 origin-left"
                style={{
                    background: `linear-gradient(90deg, ${tile.color}, ${tile.colorEnd})`,
                    transform: hovered ? "scaleX(0)" : "scaleX(1)",
                    opacity: hovered ? 0 : 1,
                }}
            />
        </button>
    );
};

/* ─── hex → "r,g,b" for rgba() ─── */
function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

/* ─── Main Component ─── */
const BPVDashboard: React.FC = () => {
    /* ✅ Live clock — ticks every second */
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    const date = now.toLocaleDateString("en-IN", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    let globalDelay = 0;

    return (
        <MainLayout>
            <div className="flex flex-col gap-6 p-6" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* ── Hero Header ── */}
                <div className="relative rounded-2xl overflow-hidden animate-fadeIn"
                    style={{
                        background: "linear-gradient(135deg, #0a1628 0%, #0d2440 50%, #0a1e36 100%)",
                        boxShadow: "0 4px 32px rgba(0,102,161,0.18)",
                    }}>

                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: "linear-gradient(rgba(0,102,161,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,161,0.08) 1px, transparent 1px)",
                            backgroundSize: "32px 32px",
                        }} />

                    {/* Orbs */}
                    <div className="absolute right-0 top-0 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(0,150,212,0.15) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
                    <div className="absolute left-1/2 bottom-0 w-48 h-48 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(0,102,161,0.12) 0%, transparent 70%)", transform: "translateY(50%)" }} />

                    <div className="relative z-10 px-7 py-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="andon-pulse-green w-2 h-2 bg-green-400 rounded-full inline-block" />
                                <span className="text-green-400 text-[11px] font-semibold uppercase tracking-widest">System Online</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white leading-tight">
                                Bosch Production Visualizer
                            </h1>
                            <p className="text-sm text-blue-200/70 mt-0.5">{date} · {time}</p>
                        </div>

                        {/* Live stat chips */}
                        <div className="flex flex-wrap gap-2">
                            {stats.map((s, i) => <StatBadge key={s.label} s={s} i={i} />)}
                        </div>
                    </div>
                </div>

                {/* ── Module Groups ── */}
                {tileGroups.map((grp) => {
                    const groupStartDelay = globalDelay;
                    globalDelay += grp.tiles.length * 55 + 80;

                    return (
                        <div key={grp.group}>
                            {/* Group label */}
                            <div className="flex items-center gap-2.5 mb-4"
                                style={{ animation: `fadeIn 0.5s ease ${groupStartDelay}ms both` }}>
                                <div className="flex items-center justify-center w-5 h-5 rounded-md"
                                    style={{ background: grp.color, opacity: 0.9 }}>
                                    <div className="text-white" style={{ transform: "scale(0.75)" }}>{grp.icon}</div>
                                </div>
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{grp.group}</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                                <span className="text-[10px] text-gray-300 font-medium">{grp.tiles.length} modules</span>
                            </div>

                            {/* Tile grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                {grp.tiles.map((tile, i) => {
                                    const d = groupStartDelay + i * 55;
                                    return <TileCard key={tile.label} tile={tile} delay={d} />;
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* ── Footer ── */}
                <div className="flex items-center justify-center gap-3 pt-2 pb-1 animate-fadeIn-d4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-200" />
                    <span className="text-[11px] text-gray-300 font-medium">
                        Bosch Production Visualizer · RBEI SDS/MFG · v1.0.0
                    </span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-200" />
                </div>

            </div>
        </MainLayout>
    );
};

export default BPVDashboard;
