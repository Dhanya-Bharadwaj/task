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
    Info, Clock, TrendingUp,
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
            className="group relative flex flex-col gap-3 rounded-md text-left overflow-hidden cursor-pointer"
            style={{
                padding: "1.25rem",
                backgroundColor: hovered ? "#f8fafc" : "#ffffff",
                border: "1px solid",
                borderColor: hovered ? "#cbd5e1" : "#e2e8f0",
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                opacity: mounted ? 1 : 0,
                transition: "all 0.2s ease",
            }}
        >
            {/* LIVE tag */}
            {tile.tag && (
                <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-red-600 bg-red-50 border border-red-200 animate-blink">
                        {tile.tag}
                    </span>
                </div>
            )}

            {/* Icon */}
            <div
                className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                style={{
                    backgroundColor: hovered ? "#e0f2fe" : "#f1f5f9",
                    color: hovered ? "#0284c7" : "#64748b",
                }}
            >
                {tile.icon}
            </div>

            {/* Text */}
            <div className="relative z-10 flex-1 mt-1">
                <div className="font-semibold text-sm leading-tight text-gray-800 transition-colors duration-200 group-hover:text-[#0066A1]">
                    {tile.label}
                </div>
                <div className="text-[11px] mt-1.5 leading-relaxed text-gray-500 line-clamp-2">
                    {tile.desc}
                </div>
            </div>

            {/* Left border accent on hover */}
            <div
                className="absolute top-0 bottom-0 left-0 w-1 transition-all duration-200"
                style={{
                    backgroundColor: "#0066A1",
                    opacity: hovered ? 1 : 0,
                }}
            />
        </button>
    );
};



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
