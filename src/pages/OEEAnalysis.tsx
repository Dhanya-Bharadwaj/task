/**
 * src/pages/OEEAnalysis.tsx
 * Animated OEE Analysis — Availability · Performance · Quality breakdown.
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import KpiCard from "../components/KpiCard";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { CheckCircle, Activity, Zap, Star } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const oeeWeekData = [78.2, 82.4, 79.8, 85.1, 88.3, 81.7, 83.5];
const availData = [89.1, 91.2, 88.5, 93.0, 94.2, 90.8, 92.1];
const perfData = [84.3, 88.5, 87.0, 89.5, 91.0, 86.4, 87.9];
const qualData = [97.2, 97.8, 96.8, 98.1, 98.6, 97.5, 97.4];

const lines = ["Line A", "Line B", "Line C"];
const lineOEE = [82.4, 78.6, 88.2];

const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const, labels: { boxWidth: 10, font: { size: 11 } } } },
    scales: {
        y: { min: 60, max: 100, ticks: { callback: (v: number | string) => `${v}%`, font: { size: 10 } }, grid: { color: "#f1f5f9" } },
        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    },
};

const OEEAnalysis: React.FC = () => {
    const [selectedLine, setSelectedLine] = useState("All Lines");

    const doughnutData = {
        labels: ["Availability Loss", "Performance Loss", "Quality Loss", "OEE Achieved"],
        datasets: [{
            data: [8.8, 11.5, 2.2, 77.5],
            backgroundColor: ["#fbbf24", "#f97316", "#ef4444", "#0066a1"],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const weekBarData = {
        labels: weekLabels,
        datasets: [
            { label: "Avail %", data: availData, backgroundColor: "rgba(34,197,94,0.8)", borderRadius: 4 },
            { label: "Perf %", data: perfData, backgroundColor: "rgba(139,92,246,0.8)", borderRadius: 4 },
            { label: "Quality %", data: qualData, backgroundColor: "rgba(249,115,22,0.8)", borderRadius: 4 },
            { label: "OEE %", data: oeeWeekData, backgroundColor: "rgba(0,102,161,0.85)", borderRadius: 4 },
        ],
    };

    const lineBarData = {
        labels: lines,
        datasets: [
            { label: "OEE %", data: lineOEE, backgroundColor: ["rgba(0,102,161,0.85)", "rgba(239,68,68,0.8)", "rgba(34,197,94,0.85)"], borderRadius: 4 },
        ],
    };

    const oeeLineData = {
        labels: weekLabels,
        datasets: [
            {
                label: "OEE % (Trend)", data: oeeWeekData,
                borderColor: "#0066a1", backgroundColor: "rgba(0,102,161,0.08)",
                tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: "#0066a1",
            },
            {
                label: "Target (85%)", data: Array(7).fill(85),
                borderColor: "#ef4444", borderDash: [6, 4], tension: 0, pointRadius: 0, borderWidth: 1.5,
            },
        ],
    };

    const detailRows = [
        { line: "Line A", shift: "Morning", planned: 480, run: 437, avail: 91.0, perf: 88.2, qual: 97.8, oee: 78.6 },
        { line: "Line A", shift: "Afternoon", planned: 480, run: 452, avail: 94.2, perf: 91.0, qual: 98.3, oee: 84.3 },
        { line: "Line B", shift: "Morning", planned: 480, run: 419, avail: 87.3, perf: 85.5, qual: 96.2, oee: 71.8 },
        { line: "Line B", shift: "Afternoon", planned: 480, run: 443, avail: 92.3, perf: 89.8, qual: 97.5, oee: 81.0 },
        { line: "Line C", shift: "Morning", planned: 480, run: 462, avail: 96.3, perf: 93.2, qual: 98.8, oee: 88.7 },
    ];

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 animate-fadeIn">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">OEE Analysis</h3>
                        <p className="text-xs text-gray-400">Availability · Performance · Quality breakdown</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Line:</label>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                            {["All Lines", ...lines].map((l) => (
                                <button key={l} onClick={() => setSelectedLine(l)}
                                    className="px-3 py-1.5 text-xs font-semibold transition-colors duration-200"
                                    style={{ background: selectedLine === l ? "#0066a1" : "#fff", color: selectedLine === l ? "#fff" : "#6b7280" }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="OEE" value={82.4} unit="%" icon={<Star size={18} />} sub="Target: 85%" delay={0} target={100} />
                    <KpiCard label="Availability" value={91.2} unit="%" icon={<CheckCircle size={18} />} sub="Target: 90%" delay={60} target={100} />
                    <KpiCard label="Performance" value={88.5} unit="%" icon={<Zap size={18} />} sub="Target: 90%" delay={120} target={100} />
                    <KpiCard label="Quality" value={97.8} unit="%" icon={<Activity size={18} />} sub="Defects: 8 pcs" delay={180} target={100} />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-3 gap-4 animate-fadeIn-d1">
                    {/* Trend Line */}
                    <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm kpi-card">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#0066a1] inline-block" />
                            OEE Trend — This Week
                        </h4>
                        <div style={{ height: 200 }}>
                            <Line data={oeeLineData} options={chartOpts} />
                        </div>
                    </div>

                    {/* Donut */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm kpi-card">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#0066a1] inline-block" />
                            OEE Composition
                        </h4>
                        <div style={{ height: 200 }}>
                            <Doughnut data={doughnutData}
                                options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
                                    cutout: "60%",
                                }} />
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-2 gap-4 animate-fadeIn-d2">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm kpi-card">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#22c55e] inline-block" />
                            Weekly OEE Components
                        </h4>
                        <div style={{ height: 200 }}>
                            <Bar data={weekBarData} options={chartOpts} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm kpi-card">
                        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#8b5cf6] inline-block" />
                            Line-wise OEE Comparison
                        </h4>
                        <div style={{ height: 200 }}>
                            <Bar data={lineBarData} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn-d3">
                    <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-[#0066a1]" />
                        <h4 className="text-sm font-bold text-gray-700">OEE Detail — Line-wise / Shift-wise</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Line", "Shift", "Planned (min)", "Run Time (min)", "Availability", "Performance", "Quality", "OEE"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {detailRows.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 table-row-hover">
                                        <td className="px-4 py-2.5 font-semibold text-gray-800">{r.line}</td>
                                        <td className="px-4 py-2.5 text-gray-500 text-xs">{r.shift}</td>
                                        <td className="px-4 py-2.5 text-gray-500">{r.planned}</td>
                                        <td className="px-4 py-2.5 text-gray-500">{r.run}</td>
                                        {[
                                            { v: r.avail, hi: 90 },
                                            { v: r.perf, hi: 90 },
                                            { v: r.qual, hi: 97 },
                                        ].map(({ v, hi }, j) => (
                                            <td key={j} className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-14 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                                        <div className="h-full rounded-full animate-progress"
                                                            style={{ width: `${v - 60}%`, background: v >= hi ? "#22c55e" : "#eab308", transformOrigin: "left" }} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${v >= hi ? "text-green-700" : "text-yellow-700"}`}>{v.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-4 py-2.5">
                                            <span className={`font-bold text-sm ${r.oee >= 80 ? "text-blue-700" : r.oee >= 65 ? "text-yellow-700" : "text-red-700"}`}>
                                                {r.oee.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default OEEAnalysis;
