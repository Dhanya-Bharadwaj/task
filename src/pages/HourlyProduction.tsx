/**
 * src/pages/HourlyProduction.tsx
 * Hourly Production Tracking page.
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const lines = ["Line A", "Line B", "Line C"];

type HourRow = {
    hour: string;
    target: number;
    actual: number;
    defects: number;
    downtime: number;
    cumTarget: number;
    cumActual: number;
};

const generateHours = (baseTarget: number): HourRow[] => {
    const start = 6;
    const rows: HourRow[] = [];
    let cumT = 0, cumA = 0;
    for (let i = 0; i < 8; i++) {
        const t = baseTarget;
        const a = Math.round(baseTarget * (0.85 + Math.random() * 0.15));
        const d = Math.round(Math.random() * 3);
        const dt = Math.round(Math.random() * 8);
        cumT += t;
        cumA += a;
        rows.push({
            hour: `${String(start + i).padStart(2, "0")}:00 - ${String(start + i + 1).padStart(2, "0")}:00`,
            target: t, actual: a, defects: d, downtime: dt,
            cumTarget: cumT, cumActual: cumA,
        });
    }
    return rows;
};

const lineHours: Record<string, HourRow[]> = {
    "Line A": generateHours(50),
    "Line B": generateHours(40),
    "Line C": generateHours(35),
};

const HourlyProduction: React.FC = () => {
    const [selectedLine, setSelectedLine] = useState("Line A");
    const rows = lineHours[selectedLine];

    const barData = {
        labels: rows.map((r) => r.hour.split(" - ")[0]),
        datasets: [
            { label: "Target", data: rows.map((r) => r.target), backgroundColor: "#94a3b8" },
            { label: "Actual", data: rows.map((r) => r.actual), backgroundColor: "#0066a1" },
        ],
    };

    return (
        <MainLayout>
            <div className="flex flex-col p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="page-title text-xl font-semibold text-gray-800">
                        Hourly Production Tracking
                    </h3>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Line:</label>
                        <select
                            className="input-field"
                            style={{ width: 130, height: 30 }}
                            value={selectedLine}
                            onChange={(e) => setSelectedLine(e.target.value)}
                        >
                            {lines.map((l) => <option key={l}>{l}</option>)}
                        </select>
                        <span className="text-xs text-gray-400">
                            Shift: Morning (06:00–14:00) | {new Date().toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Shift Target", value: `${rows.reduce((a, r) => a + r.target, 0)} pcs` },
                        { label: "Shift Actual", value: `${rows.reduce((a, r) => a + r.actual, 0)} pcs` },
                        { label: "Total Defects", value: `${rows.reduce((a, r) => a + r.defects, 0)} pcs` },
                        { label: "Total Downtime", value: `${rows.reduce((a, r) => a + r.downtime, 0)} min` },
                    ].map((c) => (
                        <div key={c.label} className="bg-white border border-gray-200 rounded-md p-3 text-center shadow-sm">
                            <p className="text-xs text-gray-500">{c.label}</p>
                            <p className="text-xl font-bold text-gray-800 mt-0.5">{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Hourly Production — Target vs Actual</h4>
                    <div style={{ height: 220 }}>
                        <Bar
                            data={barData}
                            options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: "top" } },
                            }}
                        />
                    </div>
                </div>

                {/* Hourly Table */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="text-sm font-semibold text-gray-700">Hourly Detail — {selectedLine}</h4>
                    </div>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Hour</th>
                                    <th>Target (pcs)</th>
                                    <th>Actual (pcs)</th>
                                    <th>Defects</th>
                                    <th>Downtime (min)</th>
                                    <th>Achievement %</th>
                                    <th>Cum. Target</th>
                                    <th>Cum. Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => {
                                    const ach = ((r.actual / r.target) * 100).toFixed(1);
                                    return (
                                        <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                                            <td className="font-mono text-xs text-gray-600">{r.hour}</td>
                                            <td>{r.target}</td>
                                            <td className="font-medium text-gray-800">{r.actual}</td>
                                            <td className={r.defects > 0 ? "text-red-600 font-medium" : "text-gray-500"}>{r.defects}</td>
                                            <td className={r.downtime > 5 ? "text-yellow-700 font-medium" : "text-gray-500"}>{r.downtime}</td>
                                            <td>
                                                <span className={`font-semibold text-xs ${parseFloat(ach) >= 95 ? "text-green-700" : parseFloat(ach) >= 80 ? "text-yellow-700" : "text-red-700"}`}>
                                                    {ach}%
                                                </span>
                                            </td>
                                            <td className="text-gray-500">{r.cumTarget}</td>
                                            <td className="font-medium text-gray-700">{r.cumActual}</td>
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

export default HourlyProduction;
