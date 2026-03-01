/**
 * src/pages/LineDashboard.tsx
 * Animated Line-wise production dashboard with ANDON.
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import KpiCard from "../components/KpiCard";
import { CheckCircle, AlertTriangle, XCircle, BarChart3, Wrench, Target, Activity } from "lucide-react";

const lines = ["Line A", "Line B", "Line C"];

const lineData: Record<string, {
    oee: number; avail: number; perf: number; qual: number;
    target: number; actual: number; defects: number; downtime: number;
    stations: { id: string; name: string; status: string; oee: number; output: number; target: number }[];
}> = {
    "Line A": {
        oee: 82.4, avail: 91.2, perf: 88.5, qual: 97.8,
        target: 400, actual: 363, defects: 8, downtime: 52,
        stations: [
            { id: "A-01", name: "A-01 Welding", status: "running", oee: 88.2, output: 72, target: 80 },
            { id: "A-02", name: "A-02 Assembly", status: "warning", oee: 74.5, output: 58, target: 80 },
            { id: "A-03", name: "A-03 Painting", status: "stopped", oee: 0, output: 0, target: 80 },
            { id: "A-04", name: "A-04 Testing", status: "running", oee: 91.0, output: 76, target: 80 },
        ],
    },
    "Line B": {
        oee: 78.6, avail: 87.4, perf: 85.1, qual: 96.4,
        target: 320, actual: 271, defects: 12, downtime: 74,
        stations: [
            { id: "B-01", name: "B-01 Forming", status: "running", oee: 83.2, output: 66, target: 80 },
            { id: "B-02", name: "B-02 Drilling", status: "running", oee: 79.5, output: 62, target: 80 },
            { id: "B-03", name: "B-03 Finishing", status: "warning", oee: 65.0, output: 51, target: 80 },
            { id: "B-04", name: "B-04 QC Check", status: "running", oee: 86.8, output: 70, target: 80 },
        ],
    },
    "Line C": {
        oee: 88.2, avail: 93.5, perf: 91.0, qual: 98.3,
        target: 280, actual: 252, defects: 4, downtime: 26,
        stations: [
            { id: "C-01", name: "C-01 Cast", status: "running", oee: 91.2, output: 68, target: 70 },
            { id: "C-02", name: "C-02 Grind", status: "running", oee: 89.4, output: 65, target: 70 },
            { id: "C-03", name: "C-03 Polish", status: "running", oee: 84.8, output: 62, target: 70 },
        ],
    },
};

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
    const cls =
        status === "running" ? "andon-pulse-green bg-green-500" :
            status === "warning" ? "andon-pulse-yellow bg-yellow-500" :
                "andon-pulse-red bg-red-500";
    return <span className={`inline-block w-2 h-2 rounded-full ${cls} flex-shrink-0`} />;
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
    if (status === "running") return <CheckCircle size={14} className="text-green-600" />;
    if (status === "warning") return <AlertTriangle size={14} className="text-yellow-500" />;
    return <XCircle size={14} className="text-red-600" />;
};

const statusLabel: Record<string, string> = { running: "Running", warning: "Warning", stopped: "Stopped" };
const statusBorderColor: Record<string, string> = { running: "#22c55e", warning: "#eab308", stopped: "#ef4444" };

const LineDashboard: React.FC = () => {
    const [selectedLine, setSelectedLine] = useState("Line A");
    const data = lineData[selectedLine];

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Line Dashboard — ANDON</h3>
                        <p className="text-xs text-gray-400">Real-time line metrics &amp; station status</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Select Line:</span>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                            {lines.map((l) => (
                                <button key={l} onClick={() => setSelectedLine(l)}
                                    className="px-4 py-1.5 text-xs font-semibold transition-colors duration-200"
                                    style={{ background: selectedLine === l ? "#0066a1" : "#fff", color: selectedLine === l ? "#fff" : "#6b7280" }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="OEE" value={data.oee} unit="%" icon={<BarChart3 size={18} />} sub="Target: 85%" delay={0} target={100} />
                    <KpiCard label="Availability" value={data.avail} unit="%" icon={<CheckCircle size={18} />} sub="Target: 90%" delay={60} target={100} />
                    <KpiCard label="Performance" value={data.perf} unit="%" icon={<Activity size={18} />} sub="Target: 90%" delay={120} target={100} />
                    <KpiCard label="Quality" value={data.qual} unit="%" icon={<Target size={18} />} sub="Defects: OK" delay={180} target={100} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="Actual Output" value={data.actual} unit=" pcs" icon={<Activity size={18} />} sub={`Target: ${data.target}`} delay={60} target={data.target} />
                    <KpiCard label="Achievement" value={parseFloat(((data.actual / data.target) * 100).toFixed(1))} unit="%" icon={<Target size={18} />} delay={120} target={100} />
                    <KpiCard label="Defects" value={data.defects} unit=" pcs" icon={<XCircle size={18} />} sub="This Shift" delay={180} />
                    <KpiCard label="Downtime" value={data.downtime} unit=" min" icon={<Wrench size={18} />} sub="Unplanned" delay={240} />
                </div>

                {/* ANDON Cards */}
                <div className="animate-fadeIn-d2">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        Station ANDON — {selectedLine}
                        <span className="text-[10px] font-normal text-gray-400">({data.stations.length} stations)</span>
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {data.stations.map((st, i) => (
                            <div key={st.id} className="kpi-card bg-white rounded-xl border-l-4 p-4 flex flex-col gap-3"
                                style={{
                                    borderLeftColor: statusBorderColor[st.status],
                                    boxShadow: `0 2px 12px rgba(0,0,0,0.06)`,
                                    animation: `slideUp 0.4s ease ${i * 70}ms both`,
                                }}>
                                {/* Top */}
                                <div className="flex items-start justify-between gap-1">
                                    <div>
                                        <div className="text-xs font-bold text-gray-800">{st.name}</div>
                                        <div className="text-[10px] text-gray-400">{st.id}</div>
                                    </div>
                                    <StatusIcon status={st.status} />
                                </div>

                                {/* Status badge */}
                                <div className="flex items-center gap-1.5">
                                    <StatusDot status={st.status} />
                                    <span className={`text-xs font-semibold ${st.status === "running" ? "text-green-700" :
                                        st.status === "warning" ? "text-yellow-700" : "text-red-700"
                                        }`}>{statusLabel[st.status]}</span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-1 text-center">
                                    <div className="bg-gray-50 rounded-lg p-1.5">
                                        <div className={`text-lg font-bold tabular-nums ${st.oee >= 85 ? "text-green-700" : st.oee >= 65 ? "text-yellow-700" : "text-red-700"}`}>
                                            {st.oee > 0 ? `${st.oee}%` : "–"}
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-semibold">OEE</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-1.5">
                                        <div className="text-lg font-bold text-gray-700 tabular-nums">{st.output}<span className="text-xs text-gray-400">/{st.target}</span></div>
                                        <div className="text-[9px] text-gray-400 font-semibold">Output</div>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{st.target > 0 ? `${Math.round((st.output / st.target) * 100)}%` : "–"}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full animate-progress"
                                            style={{
                                                width: `${st.target > 0 ? (st.output / st.target) * 100 : 0}%`,
                                                background: statusBorderColor[st.status]
                                            }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn-d3">
                    <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-[#0066a1]" />
                        <h4 className="text-sm font-bold text-gray-700">Station Detail — {selectedLine}</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Station ID", "Station Name", "Status", "OEE %", "Output", "Target", "Achievement %"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.stations.map((st) => {
                                    const ach = st.target > 0 ? ((st.output / st.target) * 100).toFixed(1) : "0.0";
                                    return (
                                        <tr key={st.id} className="border-b border-gray-50 table-row-hover">
                                            <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{st.id}</td>
                                            <td className="px-4 py-2.5 font-semibold text-gray-800">{st.name}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.status === "running" ? "bg-green-100 text-green-700" :
                                                    st.status === "warning" ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-red-100 text-red-700"
                                                    }`}>
                                                    <StatusDot status={st.status} />
                                                    {statusLabel[st.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full animate-progress"
                                                            style={{ width: `${st.oee}%`, background: st.oee >= 85 ? "#22c55e" : st.oee >= 65 ? "#eab308" : "#ef4444" }} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${st.oee >= 85 ? "text-green-700" : st.oee >= 65 ? "text-yellow-700" : "text-red-700"}`}>
                                                        {st.oee > 0 ? `${st.oee}%` : "–"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{st.output}</td>
                                            <td className="px-4 py-2.5 text-gray-500">{st.target}</td>
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

export default LineDashboard;
