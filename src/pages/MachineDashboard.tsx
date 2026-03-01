/**
 * src/pages/MachineDashboard.tsx
 * Machine Dashboard — circular gauges, smiley status, downtime alerts, summary table.
 * Inspired by BPV requirements specification screenshots.
 */
import React, { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import KpiCard from "../components/KpiCard";
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
    AlertTriangle, CheckCircle, XCircle, Clock, Cpu,
    RefreshCw, Wrench, Activity,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

/* ─── Data ─── */
const machines = [
    {
        id: "CNC44", name: "CNC 44", line: "Line A", shift: "Shift I", status: "stopped",
        oee: -26, avail: 0, perf: 0, qual: 0, target: 0, actual: 0, opHours: "4702.9h",
        cycleTime: 0, stdCycleTime: 30.0, downtime: [
            { reason: "Power Failure", start: "06:30", end: "08:49", dur: 139 },
        ]
    },
    {
        id: "CNC46", name: "CNC 46", line: "Line A", shift: "Shift I", status: "stopped",
        oee: 0, avail: 0, perf: 0, qual: 0, target: 0, actual: 0, opHours: "4705.7h",
        cycleTime: 0, stdCycleTime: 30.0, downtime: []
    },
    {
        id: "CNC48", name: "CNC 48", line: "Line B", shift: "Shift I", status: "warning",
        oee: 68.4, avail: 78, perf: 85, qual: 95, target: 80, actual: 55, opHours: "3821.2h",
        cycleTime: 34.2, stdCycleTime: 30.0, downtime: [
            { reason: "Tool Breakage", start: "09:10", end: "09:45", dur: 35 },
        ]
    },
    {
        id: "CNC50", name: "CNC 50", line: "Line B", shift: "Shift I", status: "running",
        oee: 83.2, avail: 91, perf: 88, qual: 97, target: 80, actual: 68, opHours: "2994.5h",
        cycleTime: 32.1, stdCycleTime: 30.0, downtime: []
    },
    {
        id: "CNC52", name: "CNC 52", line: "Line C", shift: "Shift I", status: "running",
        oee: 91.5, avail: 95, perf: 93, qual: 98, target: 70, actual: 66, opHours: "1543.8h",
        cycleTime: 29.8, stdCycleTime: 30.0, downtime: []
    },
    {
        id: "MCH-006", name: "VMC #2", line: "Line C", shift: "Shift I", status: "running",
        oee: 88.7, avail: 93, perf: 91, qual: 97, target: 70, actual: 64, opHours: "2101.4h",
        cycleTime: 44.5, stdCycleTime: 45.0, downtime: []
    },
];

const ctLabels = ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00"];

/* ─── Circular Gauge (SVG) ─── */
type GaugeProps = { value: number; label: string; color: string; size?: number };
const CircularGauge: React.FC<GaugeProps> = ({ value, label, color, size = 72 }) => {
    const [animated, setAnimated] = useState(0);
    const pct = Math.max(0, Math.min(100, value));
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const offset = circ - (animated / 100) * circ;

    // Negative OEE clamp
    const displayVal = value < 0 ? `${value}%` : `${value}%`;
    const textColor = value < 0 ? "#ef4444" : value >= 85 ? "#16a34a" : value >= 65 ? "#ca8a04" : "#ef4444";

    useEffect(() => {
        const t = setTimeout(() => setAnimated(pct), 120);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={7} />
                {/* Value arc */}
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
                {/* Center text — counter-rotate so it reads correctly */}
                <text
                    x={size / 2} y={size / 2}
                    dominantBaseline="middle" textAnchor="middle"
                    style={{
                        transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`,
                        fontSize: size < 70 ? "11px" : "12px", fontWeight: 700, fill: textColor,
                        fontFamily: "inherit"
                    }}>
                    {displayVal}
                </text>
            </svg>
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
    );
};

/* ─── Smiley Face Status ─── */
const SmileyStatus: React.FC<{ status: string; size?: number }> = ({ status, size = 44 }) => {
    if (status === "running") {
        return (
            <svg width={size} height={size} viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
                <circle cx="16" cy="18" r="2.5" fill="#16a34a" />
                <circle cx="28" cy="18" r="2.5" fill="#16a34a" />
                <path d="M14 26 Q22 34 30 26" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
        );
    }
    if (status === "warning") {
        return (
            <svg width={size} height={size} viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="16" cy="18" r="2.5" fill="#ca8a04" />
                <circle cx="28" cy="18" r="2.5" fill="#ca8a04" />
                <path d="M14 29 Q22 24 30 29" stroke="#ca8a04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 44 44" className="andon-pulse-red rounded-full">
            <circle cx="22" cy="22" r="20" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
            <circle cx="16" cy="18" r="2.5" fill="#dc2626" />
            <circle cx="28" cy="18" r="2.5" fill="#dc2626" />
            <path d="M14 31 Q22 24 30 31" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
    );
};



/* ─── Machine Card with circular gauges ─── */
const MachineCard: React.FC<{ m: typeof machines[0]; selected: boolean; onClick: () => void; delay: number }> = ({
    m, selected, onClick, delay,
}) => {
    const gaugeColor = m.oee >= 85 ? "#16a34a" : m.oee >= 65 ? "#ca8a04" : "#dc2626";
    const borderColor = m.status === "running" ? "#22c55e" : m.status === "warning" ? "#eab308" : "#ef4444";

    return (
        <div
            onClick={onClick}
            className="kpi-card bg-white rounded-xl border-l-4 p-4 cursor-pointer"
            style={{
                borderLeftColor: borderColor,
                boxShadow: selected
                    ? `0 0 0 2px white, 0 0 0 4px ${borderColor}, 0 4px 20px rgba(0,0,0,0.1)`
                    : "0 2px 10px rgba(0,0,0,0.06)",
                animation: `slideUp 0.45s ease ${delay}ms both`,
            }}
        >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="text-sm font-bold text-gray-800">{m.name}</div>
                    <div className="text-[10px] text-gray-400">{m.id} · {m.shift} · {m.opHours}</div>
                </div>
                <SmileyStatus status={m.status} size={36} />
            </div>

            {/* Count row */}
            <div className="grid grid-cols-3 gap-1 text-center mb-3">
                {[
                    { label: "Target", val: m.target },
                    { label: "Actual", val: m.actual },
                    { label: "Δ", val: m.actual - m.target },
                ].map(({ label, val }) => (
                    <div key={label} className="bg-gray-50 rounded-lg py-1.5">
                        <div className={`text-lg font-bold tabular-nums ${label === "Δ" && val < 0 ? "text-red-600" : "text-gray-700"}`}>
                            {val}
                        </div>
                        <div className="text-[9px] text-gray-400 font-semibold">{label}</div>
                    </div>
                ))}
            </div>

            {/* Circular gauges */}
            <div className="flex items-center justify-around pt-2 border-t border-gray-100">
                <CircularGauge value={m.oee} label="OEE" color={gaugeColor} size={64} />
                <CircularGauge value={m.avail} label="Avail" color="#0066a1" size={56} />
                <CircularGauge value={m.perf} label="Perf" color="#8b5cf6" size={56} />
                <CircularGauge value={m.qual} label="Qual" color="#f97316" size={56} />
            </div>

            {/* Downtime badges */}
            {m.downtime.length > 0 && (
                <div className="mt-2 pt-2 border-t border-red-100">
                    {m.downtime.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-red-600">
                            <AlertTriangle size={10} />
                            <span className="font-semibold">{d.reason}</span>
                            <span className="text-red-400">{d.start}–{d.end}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Main Component ─── */
const MachineDashboard: React.FC = () => {
    const [selectedId, setSelectedId] = useState(machines[0].id);
    const [spinning, setSpinning] = useState(false);
    const machine = machines.find((m) => m.id === selectedId)!;

    const ctActual = machine.cycleTime > 0
        ? [31.2, 32.8, 32.1, 33.5, 32.4, 31.9, 32.7, 32.4, machine.cycleTime]
        : Array(9).fill(0);
    const ctStd = Array(9).fill(machine.stdCycleTime);

    const ctLineData = {
        labels: ctLabels,
        datasets: [
            {
                label: "Actual CT (s)", data: ctActual,
                borderColor: "#0066a1", backgroundColor: "rgba(0,102,161,0.07)",
                tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#0066a1",
            },
            {
                label: "Standard CT (s)", data: ctStd,
                borderColor: "#ef4444", borderDash: [6, 4], tension: 0, pointRadius: 0, borderWidth: 1.5,
            },
        ],
    };

    const doRefresh = () => {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 700);
    };

    useEffect(() => {
        const t = setInterval(doRefresh, 30000);
        return () => clearInterval(t);
    }, []);

    const runningCount = machines.filter(m => m.status === "running").length;
    const stoppedCount = machines.filter(m => m.status === "stopped").length;
    const warningCount = machines.filter(m => m.status === "warning").length;
    const allDowntime = machines.flatMap(m => m.downtime.map(d => ({ ...d, machine: m.name })));

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Machine Dashboard</h3>
                        <p className="text-xs text-gray-400">Real-time machine status · Shift I · 06:00 – 14:00</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600" />{runningCount} Running</span>
                            <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-yellow-500" />{warningCount} Warning</span>
                            <span className="flex items-center gap-1"><XCircle size={12} className="text-red-600" />{stoppedCount} Stopped</span>
                        </div>
                        <button onClick={doRefresh}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0066a1] px-3 py-1.5 rounded-lg border border-gray-200 bg-white transition-colors">
                            <RefreshCw size={12} className={spinning ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── KPI Summary Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn-d1">
                    <KpiCard label="Avg OEE" value={parseFloat((machines.filter(m => m.oee > 0).reduce((a, m) => a + m.oee, 0) / machines.filter(m => m.oee > 0).length).toFixed(1))} unit="%" icon={<Activity size={18} />} sub="Active machines" delay={0} target={100} />
                    <KpiCard label="Machines Running" value={runningCount} unit={` / ${machines.length}`} icon={<CheckCircle size={18} />} sub={`${stoppedCount} stopped`} delay={60} />
                    <KpiCard label="Total Downtime" value={allDowntime.reduce((a, d) => a + d.dur, 0)} unit=" min" icon={<Wrench size={18} />} sub="Unplanned this shift" delay={120} />
                    <KpiCard label="Active Lines" value={3} unit="" icon={<Cpu size={18} />} sub="Line A, B, C" delay={180} />
                </div>

                {/* ── Downtime Alerts ── */}
                {allDowntime.length > 0 && (
                    <div className="animate-fadeIn-d1">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} className="text-red-600" />
                            <h4 className="text-sm font-bold text-gray-700">Active / Recent Downtime Events</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {allDowntime.map((d, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50"
                                    style={{ animation: `slideUp 0.4s ease ${i * 80}ms both` }}>
                                    <SmileyStatus status="stopped" size={40} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-red-700">{d.reason}
                                            <span className="ml-2 text-[10px] font-medium text-red-400">({d.machine})</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                                            <Clock size={11} />
                                            <span>{d.start} – {d.end}</span>
                                            <span className="mx-1">·</span>
                                            <span className="font-semibold">{d.dur} min</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-200 flex-shrink-0">
                                        Unplanned
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Machine Cards Grid ── */}
                <div className="animate-fadeIn-d2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Machine Status — Production Area</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {machines.map((m, i) => (
                            <MachineCard key={m.id} m={m} selected={selectedId === m.id}
                                onClick={() => setSelectedId(m.id)} delay={i * 65} />
                        ))}
                    </div>
                </div>

                {/* ── Cycle Time Trend (selected machine) ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 kpi-card animate-fadeIn-d3">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#0066a1] inline-block" />
                            Cycle Time Trend — {machine.name}
                            <span className="text-xs text-gray-400 font-normal">({machine.id})</span>
                        </h4>
                        <select className="input-field text-xs" style={{ width: 180, height: 30 }}
                            value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                            {machines.map((m) => <option key={m.id} value={m.id}>{m.id} — {m.name}</option>)}
                        </select>
                    </div>
                    {machine.cycleTime > 0 ? (
                        <div style={{ height: 200 }}>
                            <Line data={ctLineData}
                                options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
                                    scales: {
                                        y: { title: { display: true, text: "CT (s)", font: { size: 10 } }, grid: { color: "#f1f5f9" } },
                                        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
                                    },
                                }} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 h-40 text-gray-400">
                            <SmileyStatus status="stopped" size={48} />
                            <div>
                                <div className="text-sm font-semibold text-gray-600">Machine not producing</div>
                                <div className="text-xs text-gray-400 mt-0.5">No cycle time data available for {machine.name}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Summary Table ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn-d3">
                    <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-[#0066a1]" />
                        <h4 className="text-sm font-bold text-gray-700">All Machines — Production Summary</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Machine", "Line", "Shift", "Status", "Target", "Actual", "Δ", "OEE", "Avail", "Perf", "Qual", "CT (s)", "Std CT", "Deviation"].map(h => (
                                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {machines.map((m, i) => {
                                    const delta = m.actual - m.target;
                                    const ctDev = m.cycleTime > 0 ? (m.cycleTime - m.stdCycleTime).toFixed(1) : "–";
                                    const ctDevNum = parseFloat(ctDev);
                                    return (
                                        <tr key={m.id}
                                            onClick={() => setSelectedId(m.id)}
                                            className={`border-b border-gray-50 table-row-hover cursor-pointer text-xs ${selectedId === m.id ? "bg-blue-50" : i % 2 === 1 ? "bg-gray-50/40" : ""
                                                }`}
                                            style={{ animation: `slideUp 0.4s ease ${i * 45}ms both` }}>
                                            <td className="px-3 py-2.5">
                                                <div className="font-bold text-gray-800">{m.name}</div>
                                                <div className="text-[9px] text-gray-400">{m.id}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500">{m.line}</td>
                                            <td className="px-3 py-2.5 text-gray-500">{m.shift}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-1.5">
                                                    <SmileyStatus status={m.status} size={22} />
                                                    <span className={`font-semibold ${m.status === "running" ? "text-green-700" : m.status === "warning" ? "text-yellow-700" : "text-red-700"}`}>
                                                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 font-semibold text-gray-700">{m.target}</td>
                                            <td className="px-3 py-2.5 font-semibold text-gray-700">{m.actual}</td>
                                            <td className="px-3 py-2.5">
                                                <span className={`font-bold ${delta >= 0 ? "text-green-700" : "text-red-600"}`}>
                                                    {delta > 0 ? `+${delta}` : delta}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={`font-bold ${m.oee >= 85 ? "text-green-700" : m.oee >= 65 ? "text-yellow-700" : "text-red-700"}`}>
                                                    {m.oee}%
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-blue-700 font-medium">{m.avail}%</td>
                                            <td className="px-3 py-2.5 text-purple-700 font-medium">{m.perf}%</td>
                                            <td className="px-3 py-2.5 text-orange-700 font-medium">{m.qual}%</td>
                                            <td className="px-3 py-2.5 text-gray-600">{m.cycleTime > 0 ? `${m.cycleTime}s` : "–"}</td>
                                            <td className="px-3 py-2.5 text-gray-400">{m.stdCycleTime}s</td>
                                            <td className="px-3 py-2.5">
                                                {m.cycleTime > 0 ? (
                                                    <span className={`font-bold ${ctDevNum > 0 ? "text-red-600" : "text-green-600"}`}>
                                                        {ctDevNum > 0 ? `+${ctDev}` : ctDev}s
                                                    </span>
                                                ) : "–"}
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

export default MachineDashboard;
