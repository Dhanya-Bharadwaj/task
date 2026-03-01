/**
 * src/pages/Home.tsx
 * BPV Main Dashboard — animated ANDON & KPI overview.
 * Fixes: live clock ticks every second; Shift/Day toggle shows different data.
 */
import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../layout/MainLayout";
import KpiCard from "../components/KpiCard";
import {
    Activity, CheckCircle,
    TrendingUp, Clock, Package, Wrench, RefreshCw, Sun, Sunrise,
} from "lucide-react";

/* ─── Types ─── */
type AndonItem = { id: string; station: string; line: string; status: string; oee: number; output: number; target: number; };
type ViewData = { label: string; oee: number; availability: number; performance: number; quality: number; target: number; actual: number; defects: number; downtime: number; elapsed: number; andons: AndonItem[]; };

/* ─── Per-view data ─── */
const viewData: Record<"shift" | "day", ViewData> = {
    shift: {
        label: "Morning Shift  06:00 – 14:00",
        oee: 82.4, availability: 91.2, performance: 88.5, quality: 97.8,
        target: 400, actual: 363, defects: 8, downtime: 52, elapsed: 275,
        andons: [
            { id: "S01", station: "Station 01 — Welding", line: "Line A", status: "running", oee: 88.2, output: 72, target: 80 },
            { id: "S02", station: "Station 02 — Assembly", line: "Line A", status: "warning", oee: 74.5, output: 58, target: 80 },
            { id: "S03", station: "Station 03 — Painting", line: "Line A", status: "stopped", oee: 0, output: 0, target: 80 },
            { id: "S04", station: "Station 04 — Testing", line: "Line B", status: "running", oee: 93.1, output: 78, target: 80 },
            { id: "S05", station: "Station 05 — Packing", line: "Line B", status: "running", oee: 85.6, output: 68, target: 80 },
            { id: "S06", station: "Station 06 — Dispatch", line: "Line B", status: "warning", oee: 69.2, output: 55, target: 80 },
        ],
    },
    day: {
        label: "Full Day  06:00 – 22:00",
        oee: 79.8, availability: 88.4, performance: 86.2, quality: 96.9,
        target: 1200, actual: 1041, defects: 31, downtime: 134, elapsed: 480,
        andons: [
            { id: "S01", station: "Station 01 — Welding", line: "Line A", status: "running", oee: 84.2, output: 220, target: 240 },
            { id: "S02", station: "Station 02 — Assembly", line: "Line A", status: "running", oee: 80.6, output: 196, target: 240 },
            { id: "S03", station: "Station 03 — Painting", line: "Line A", status: "warning", oee: 62.5, output: 148, target: 240 },
            { id: "S04", station: "Station 04 — Testing", line: "Line B", status: "running", oee: 89.4, output: 218, target: 240 },
            { id: "S05", station: "Station 05 — Packing", line: "Line B", status: "running", oee: 81.2, output: 196, target: 240 },
            { id: "S06", station: "Station 06 — Dispatch", line: "Line B", status: "running", oee: 76.8, output: 183, target: 240 },
        ],
    },
} as const;

type ViewKey = keyof typeof viewData;

/* ─── ANDON Status Dot ─── */
const StatusDot: React.FC<{ status: string }> = ({ status }) => {
    const cls =
        status === "running" ? "andon-pulse-green bg-green-500" :
            status === "warning" ? "andon-pulse-yellow bg-yellow-500" :
                "andon-pulse-red bg-red-500";
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
};

/* ─── ANDON Station Card ─── */
type Andon = typeof viewData.shift.andons[0];
const AndonCard: React.FC<{ s: Andon; delay: number }> = ({ s, delay }) => {
    const pct = s.target ? Math.round((s.output / s.target) * 100) : 0;
    const border = s.status === "running" ? "#22c55e" : s.status === "warning" ? "#eab308" : "#ef4444";
    const badgeCls = s.status === "running" ? "bg-green-100 text-green-700" :
        s.status === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

    return (
        <div className="bg-white rounded-xl border-l-4 p-4 flex flex-col gap-3 kpi-card"
            style={{ borderLeftColor: border, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", animation: `slideUp 0.45s ease ${delay}ms both` }}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-xs font-bold text-gray-800 leading-tight">{s.station}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.line}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeCls}`}>
                    <StatusDot status={s.status} />
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                    <div className="text-lg font-bold tabular-nums"
                        style={{ color: s.oee >= 85 ? "#16a34a" : s.oee >= 65 ? "#ca8a04" : "#dc2626" }}>
                        {s.oee > 0 ? `${s.oee}%` : "—"}
                    </div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">OEE</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-800 tabular-nums">{s.output}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Output</div>
                </div>
                <div>
                    <div className="text-lg font-bold text-gray-400 tabular-nums">{s.target}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Target</div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-progress"
                        style={{ width: `${pct}%`, background: border }} />
                </div>
            </div>
        </div>
    );
};

/* ─── Main Component ─── */
const Home: React.FC = () => {
    const [view, setView] = useState<ViewKey>("shift");
    const [andons, setAndons] = useState([...viewData.shift.andons]);
    const [now, setNow] = useState(new Date());
    const [spinning, setSpinning] = useState(false);

    /* ✅ Fix 1: Live clock — ticks every second */
    useEffect(() => {
        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, []);

    /* ✅ Fix 2: When view changes, reload ANDON data for that view */
    useEffect(() => {
        setAndons([...viewData[view].andons]);
    }, [view]);

    /* Auto-refresh live output numbers every 30s */
    const doRefresh = useCallback(() => {
        setSpinning(true);
        setTimeout(() => {
            setAndons((prev) =>
                prev.map((s) => ({
                    ...s,
                    output: s.status === "running"
                        ? Math.min(s.output + Math.floor(Math.random() * 3), s.target)
                        : s.status === "warning"
                            ? s.output + (Math.random() > 0.6 ? 1 : 0)
                            : s.output,
                }))
            );
            setSpinning(false);
        }, 700);
    }, []);

    useEffect(() => {
        const t = setInterval(doRefresh, 30000);
        return () => clearInterval(t);
    }, [doRefresh]);

    const info = viewData[view];
    const oeePct = info.oee;
    const oeeColor = oeePct >= 85 ? "#16a34a" : oeePct >= 70 ? "#ca8a04" : "#dc2626";
    const gaugeAngle = (oeePct / 100) * 180;

    const dateStr = now.toLocaleDateString("en-IN", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5 overflow-auto" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between animate-fadeIn flex-wrap gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Production Dashboard — ANDON</h3>
                        {/* ✅ Clock ticks live thanks to `now` state */}
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            {dateStr} · <span className="text-[#0066a1] font-semibold">{timeStr}</span>
                            &nbsp;·&nbsp; {info.label}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* ✅ Shift/Day toggle — now changes real data */}
                        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                            {(["shift", "day"] as const).map((v) => (
                                <button key={v} onClick={() => setView(v)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 transition-colors duration-200"
                                    style={{ background: view === v ? "#0066a1" : "#fff", color: view === v ? "#fff" : "#6b7280" }}>
                                    {v === "shift" ? <Sunrise size={12} /> : <Sun size={12} />}
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Refresh button */}
                        <button onClick={doRefresh}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0066a1] transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#0066a1] bg-white">
                            <RefreshCw size={13} className={spinning ? "animate-spin" : ""} />
                            <span className="font-mono">{spinning ? "Refreshing…" : timeStr}</span>
                        </button>
                    </div>
                </div>

                {/* ── View Banner ── */}
                <div key={view}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border animate-fadeIn"
                    style={{
                        background: view === "shift"
                            ? "linear-gradient(90deg,rgba(0,102,161,0.07),rgba(0,150,212,0.04))"
                            : "linear-gradient(90deg,rgba(217,119,6,0.07),rgba(245,158,11,0.04))",
                        borderColor: view === "shift" ? "rgba(0,102,161,0.15)" : "rgba(217,119,6,0.18)",
                    }}>
                    {view === "shift"
                        ? <Sunrise size={16} className="text-[#0066a1]" />
                        : <Sun size={16} className="text-amber-600" />}
                    <span className="text-xs font-semibold" style={{ color: view === "shift" ? "#0066a1" : "#b45309" }}>
                        Viewing: {info.label}
                    </span>
                    <div className="flex items-center gap-4 ml-auto text-xs text-gray-500">
                        <span>Target: <b className="text-gray-700">{info.target} pcs</b></span>
                        <span>Actual: <b className="text-gray-700">{info.actual} pcs</b></span>
                        <span>OEE: <b style={{ color: oeeColor }}>{info.oee}%</b></span>
                    </div>
                </div>

                {/* ── OEE Gauge + KPI Cards ── */}
                <div className="grid grid-cols-12 gap-4">
                    {/* OEE Semi-circle Gauge */}
                    <div className="col-span-12 md:col-span-3 bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center justify-center kpi-card animate-fadeIn-d1"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", minHeight: 180 }}>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall OEE</div>
                        <div className="relative" style={{ width: 130, height: 70, overflow: "hidden" }}>
                            <svg width="130" height="70" viewBox="0 0 130 70">
                                <path d="M 10 65 A 55 55 0 0 1 120 65" fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
                                <path d="M 10 65 A 55 55 0 0 1 120 65" fill="none" stroke={oeeColor} strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(gaugeAngle / 180) * 173} 173`}
                                    style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }} />
                            </svg>
                            <div className="absolute bottom-0 left-1/2 origin-bottom"
                                style={{
                                    width: 2, height: 52, transformOrigin: "bottom center",
                                    transform: `rotate(${gaugeAngle - 90}deg)`,
                                    background: "#374151", transition: "transform 1s cubic-bezier(0.22,1,0.36,1)", marginLeft: -1
                                }} />
                        </div>
                        <div className="text-4xl font-bold tabular-nums mt-1" style={{ color: oeeColor }}>{info.oee}%</div>
                        <div className="text-xs text-gray-400 mt-0.5">Target: 85%</div>
                        <div className="flex gap-1 mt-2">
                            {["A", "P", "Q"].map((l, i) => (
                                <React.Fragment key={l}>
                                    <div className="text-center">
                                        <div className="text-[10px] text-gray-400">{l}</div>
                                        <div className="text-xs font-bold text-gray-700">
                                            {[info.availability, info.performance, info.quality][i]}%
                                        </div>
                                    </div>
                                    {i < 2 && <div className="w-px bg-gray-200 mx-1 self-stretch" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="col-span-12 md:col-span-9 grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <KpiCard label="Availability" value={info.availability} unit="%" icon={<CheckCircle size={18} />} sub="Target: 90%" delay={50} target={100} targetLabel="vs 100%" />
                        <KpiCard label="Performance" value={info.performance} unit="%" icon={<TrendingUp size={18} />} sub="Target: 90%" delay={100} target={100} />
                        <KpiCard label="Quality Rate" value={info.quality} unit="%" icon={<Package size={18} />} sub={`Defects: ${info.defects} pcs`} delay={150} target={100} />
                        <KpiCard label="Total Output" value={info.actual} unit=" pcs" icon={<Activity size={18} />} sub={`Target: ${info.target}`} delay={200} target={info.target} targetLabel={`${((info.actual / info.target) * 100).toFixed(1)}% achieved`} />
                        <KpiCard label="Total Downtime" value={info.downtime} unit=" min" icon={<Wrench size={18} />} sub="Unplanned losses" delay={250} />
                        <KpiCard label={view === "shift" ? "Elapsed (min)" : "Shift Duration"} value={info.elapsed} unit=" min" icon={<Clock size={18} />} sub={view === "shift" ? "Shift: 480 min" : "Day: 960 min"} delay={300} target={view === "shift" ? 480 : 960} targetLabel="Time progress" />
                    </div>
                </div>

                {/* ── ANDON Board ── */}
                <div className="animate-fadeIn-d2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-700">ANDON Board — Station Status</h4>
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                                {andons.filter(a => a.status === "running").length} Running &nbsp;·&nbsp;
                                {andons.filter(a => a.status === "warning").length} Warning &nbsp;·&nbsp;
                                {andons.filter(a => a.status === "stopped").length} Stopped
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                            {view === "shift" ? "Current shift data" : "All 3 shifts combined"}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {andons.map((s, i) => <AndonCard key={`${view}-${s.id}`} s={s} delay={i * 60} />)}
                    </div>
                </div>

                {/* ── Detail Table ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn-d3">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-[#0066a1]" />
                        <h4 className="text-sm font-bold text-gray-700">
                            Station Detail — {view === "shift" ? "Shift View" : "Day View"}
                        </h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["#", "Station", "Line", "Status", "OEE", "Output", "Target", "Achievement"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {andons.map((row, idx) => {
                                    const ach = row.target > 0 ? ((row.output / row.target) * 100).toFixed(1) : "0.0";
                                    return (
                                        <tr key={`${view}-${row.id}`} className="table-row-hover border-b border-gray-50"
                                            style={{ animation: `slideUp 0.35s ease ${idx * 45}ms both` }}>
                                            <td className="px-4 py-2.5 text-xs text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-semibold text-gray-800">{row.station}</td>
                                            <td className="px-4 py-2.5">
                                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{row.line}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${row.status === "running" ? "bg-green-100 text-green-700" :
                                                    row.status === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                    <StatusDot status={row.status} />
                                                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-14 overflow-hidden">
                                                        <div className="h-full rounded-full animate-progress"
                                                            style={{ width: `${row.oee}%`, background: row.oee >= 85 ? "#22c55e" : row.oee >= 65 ? "#eab308" : "#ef4444" }} />
                                                    </div>
                                                    <span className={`text-xs font-bold w-12 text-right ${row.oee >= 85 ? "text-green-700" : row.oee >= 65 ? "text-yellow-700" : "text-red-700"}`}>
                                                        {row.oee > 0 ? `${row.oee}%` : "–"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 font-semibold text-gray-800">{row.output}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{row.target}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`font-bold text-xs ${parseFloat(ach) >= 90 ? "text-green-700" : parseFloat(ach) >= 70 ? "text-yellow-700" : "text-red-700"}`}>
                                                    {ach}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </MainLayout>
    );
};

export default Home;
