/**
 * src/pages/Reports.tsx
 * Web-based Reports page with export option.
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

type ReportRow = {
    date: string;
    line: string;
    shift: string;
    target: number;
    actual: number;
    defects: number;
    downtime: number;
    oee: number;
    avail: number;
    perf: number;
    qual: number;
};

const reportData: ReportRow[] = [
    { date: "2026-02-25", line: "Line A", shift: "Morning", target: 400, actual: 363, defects: 8, downtime: 52, oee: 82.4, avail: 91.2, perf: 88.5, qual: 97.8 },
    { date: "2026-02-25", line: "Line A", shift: "Afternoon", target: 400, actual: 381, defects: 5, downtime: 34, oee: 87.3, avail: 92.9, perf: 91.0, qual: 98.7 },
    { date: "2026-02-25", line: "Line B", shift: "Morning", target: 320, actual: 271, defects: 12, downtime: 74, oee: 74.7, avail: 84.6, perf: 85.0, qual: 96.8 },
    { date: "2026-02-25", line: "Line B", shift: "Afternoon", target: 320, actual: 295, defects: 7, downtime: 42, oee: 80.9, avail: 91.3, perf: 88.2, qual: 97.6 },
    { date: "2026-02-25", line: "Line C", shift: "Morning", target: 280, actual: 252, defects: 4, downtime: 26, oee: 88.2, avail: 94.6, perf: 91.2, qual: 98.4 },
    { date: "2026-02-24", line: "Line A", shift: "Morning", target: 400, actual: 358, defects: 11, downtime: 58, oee: 80.1, avail: 87.9, perf: 88.0, qual: 96.9 },
    { date: "2026-02-24", line: "Line B", shift: "Morning", target: 320, actual: 289, defects: 9, downtime: 48, oee: 78.5, avail: 90.0, perf: 85.4, qual: 97.1 },
    { date: "2026-02-24", line: "Line C", shift: "Morning", target: 280, actual: 261, defects: 3, downtime: 20, oee: 90.3, avail: 95.8, perf: 92.5, qual: 98.9 },
];

const reportTypes = ["Production Summary", "OEE Report", "Losses Report", "Hourly Report"];

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState(reportTypes[0]);
    const [fromDate, setFromDate] = useState("2026-02-24");
    const [toDate, setToDate] = useState("2026-02-25");
    const [lineFilter, setLineFilter] = useState("All Lines");

    const filtered = reportData.filter((r) => {
        const inRange = r.date >= fromDate && r.date <= toDate;
        const inLine = lineFilter === "All Lines" || r.line === lineFilter;
        return inRange && inLine;
    });

    const handleExport = () => {
        const headers = ["Date", "Line", "Shift", "Target", "Actual", "Defects", "Downtime(min)", "OEE%", "Avail%", "Perf%", "Qual%"];
        const rows = filtered.map((r) =>
            [r.date, r.line, r.shift, r.target, r.actual, r.defects, r.downtime, r.oee, r.avail, r.perf, r.qual].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `BPV_Report_${fromDate}_${toDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Report exported as CSV.");
    };

    return (
        <MainLayout>
            <div className="flex flex-col p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="page-title text-xl font-semibold text-gray-800">Web Reports</h3>
                    <button className="btn-primary flex items-center gap-2" onClick={handleExport}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Report Type</label>
                            <select className="input-field" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                {reportTypes.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From Date</label>
                            <input type="date" className="input-field" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To Date</label>
                            <input type="date" className="input-field" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Line</label>
                            <select className="input-field" value={lineFilter} onChange={(e) => setLineFilter(e.target.value)}>
                                <option>All Lines</option>
                                <option>Line A</option>
                                <option>Line B</option>
                                <option>Line C</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: "Avg OEE", value: filtered.length ? `${(filtered.reduce((a, r) => a + r.oee, 0) / filtered.length).toFixed(1)}%` : "-" },
                        { label: "Total Output", value: `${filtered.reduce((a, r) => a + r.actual, 0)} pcs` },
                        { label: "Total Defects", value: `${filtered.reduce((a, r) => a + r.defects, 0)} pcs` },
                        { label: "Total Downtime", value: `${filtered.reduce((a, r) => a + r.downtime, 0)} min` },
                    ].map((c) => (
                        <div key={c.label} className="bg-white border border-gray-200 rounded-md p-3 text-center shadow-sm">
                            <p className="text-xs text-gray-500">{c.label}</p>
                            <p className="text-xl font-bold text-gray-800 mt-0.5">{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Data Table */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">{reportType} — {filtered.length} records</h4>
                    </div>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Line</th>
                                    <th>Shift</th>
                                    <th>Target</th>
                                    <th>Actual</th>
                                    <th>Defects</th>
                                    <th>Downtime (min)</th>
                                    <th>OEE %</th>
                                    <th>Avail %</th>
                                    <th>Perf %</th>
                                    <th>Qual %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => (
                                    <tr key={i} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                                        <td className="font-mono text-xs">{r.date}</td>
                                        <td>{r.line}</td>
                                        <td className="text-gray-500 text-xs">{r.shift}</td>
                                        <td>{r.target}</td>
                                        <td className="font-medium">{r.actual}</td>
                                        <td className={r.defects > 8 ? "text-red-600 font-medium" : "text-gray-600"}>{r.defects}</td>
                                        <td className={r.downtime > 50 ? "text-yellow-700 font-medium" : "text-gray-600"}>{r.downtime}</td>
                                        <td className={`font-semibold ${r.oee >= 85 ? "text-blue-700" : r.oee >= 70 ? "text-yellow-700" : "text-red-700"}`}>{r.oee}%</td>
                                        <td>{r.avail}%</td>
                                        <td>{r.perf}%</td>
                                        <td>{r.qual}%</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="text-center py-4 text-gray-400 italic">No records found for selected filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Reports;
