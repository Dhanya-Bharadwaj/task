/**
 * src/pages/OperatorScreens.tsx
 * RS-09-001 Operator Screen: Downtime Entry + Rejection Entry
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Wrench, XOctagon, Search, Save, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

/* ─── Data ─── */
const lines = ["Line A", "Line B", "Line C"];
const stations: Record<string, string[]> = {
    "Line A": ["Station 01 — Welding", "Station 02 — Assembly", "Station 03 — Painting"],
    "Line B": ["Station 04 — Testing", "Station 05 — Packing"],
    "Line C": ["Station 06 — Dispatch"],
};
const shifts = ["Morning (06:00–14:00)", "Afternoon (14:00–22:00)", "Night (22:00–06:00)"];
const unplannedReasons = ["Power Failure", "Machine Breakdown", "Material Shortage", "Tool Breakage", "Quality Hold", "Other"];
const defectReasons = ["Dimensional Out of Spec", "Surface Defect", "Assembly Error", "Weld Defect", "Paint Defect", "Other"];

type DtRow = { id: number; station: string; start: string; end: string; reason: string; duration: number };
type RejRow = { id: number; station: string; count: number; reason: string; time: string };

const sampleDt: DtRow[] = [
    { id: 1, station: "Station 02 — Assembly", start: "08:15", end: "09:32", reason: "Machine Breakdown", duration: 77 },
    { id: 2, station: "Station 03 — Painting", start: "10:05", end: "10:22", reason: "Power Failure", duration: 17 },
];
const sampleRej: RejRow[] = [
    { id: 1, station: "Station 01 — Welding", count: 3, reason: "Weld Defect", time: "07:45" },
    { id: 2, station: "Station 04 — Testing", count: 2, reason: "Dimensional Out of Spec", time: "11:10" },
];

type Mode = "downtime" | "rejection";

const OperatorScreens: React.FC = () => {
    const [mode, setMode] = useState<Mode>("downtime");
    const [selLine, setSelLine] = useState(lines[0]);
    const [selShift, setSelShift] = useState(shifts[0]);
    const [selDate, setSelDate] = useState(new Date().toISOString().slice(0, 10));
    const [searched, setSearched] = useState(false);

    /* Downtime Entry state */
    const [dtRows, setDtRows] = useState<DtRow[]>([]);
    const [dtForm, setDtForm] = useState({ station: stations[lines[0]][0], start: "", end: "", reason: unplannedReasons[0] });

    /* Rejection Entry state */
    const [rejRows, setRejRows] = useState<RejRow[]>([]);
    const [rejForm, setRejForm] = useState({ station: stations[lines[0]][0], count: 1, reason: defectReasons[0] });

    const handleSearch = () => {
        setSearched(true);
        setDtRows(sampleDt);
        setRejRows(sampleRej);
        toast.success("Data loaded for selected shift.");
    };

    const addDowntime = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dtForm.start || !dtForm.end) { toast.error("Start and end time are required."); return; }
        const [sh, sm] = dtForm.start.split(":").map(Number);
        const [eh, em] = dtForm.end.split(":").map(Number);
        const dur = (eh * 60 + em) - (sh * 60 + sm);
        if (dur <= 0) { toast.error("End time must be after start time."); return; }
        setDtRows(p => [...p, { id: Date.now(), station: dtForm.station, start: dtForm.start, end: dtForm.end, reason: dtForm.reason, duration: dur }]);
        setDtForm(p => ({ ...p, start: "", end: "" }));
        toast.success("Downtime entry saved.");
    };

    const addRejection = (e: React.FormEvent) => {
        e.preventDefault();
        if (rejForm.count < 1) { toast.error("Rejected count must be ≥ 1."); return; }
        const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        setRejRows(p => [...p, { id: Date.now(), station: rejForm.station, count: rejForm.count, reason: rejForm.reason, time: now }]);
        setRejForm(p => ({ ...p, count: 1 }));
        toast.success("Rejection entry saved.");
    };

    const availableStations = stations[selLine] ?? [];

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* Header */}
                <div className="flex items-center justify-between animate-fadeIn flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Operator Screens</h2>
                        <p className="text-xs text-gray-400 mt-0.5">RS-09-001 · Downtime Entry & Rejection Entry</p>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs font-semibold">
                        <button onClick={() => setMode("downtime")} className="flex items-center gap-1.5 px-5 py-2 transition-colors duration-200"
                            style={{ background: mode === "downtime" ? "#dc2626" : "#fff", color: mode === "downtime" ? "#fff" : "#6b7280" }}>
                            <Wrench size={13} /> Downtime Entry
                        </button>
                        <button onClick={() => setMode("rejection")} className="flex items-center gap-1.5 px-5 py-2 transition-colors duration-200"
                            style={{ background: mode === "rejection" ? "#7c3aed" : "#fff", color: mode === "rejection" ? "#fff" : "#6b7280" }}>
                            <XOctagon size={13} /> Rejection Entry
                        </button>
                    </div>
                </div>

                {/* ── Search Filter (RS-09-002/003) ── */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-fadeIn-d1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Search by Date, Line & Shift</h4>
                    <div className="flex items-end gap-3 flex-wrap">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input type="date" className="input-field" value={selDate} onChange={(e) => setSelDate(e.target.value)} style={{ height: 36 }} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Line</label>
                            <select className="input-field" style={{ height: 36 }} value={selLine}
                                onChange={(e) => { setSelLine(e.target.value); setDtForm(p => ({ ...p, station: stations[e.target.value][0] })); setRejForm(p => ({ ...p, station: stations[e.target.value][0] })); }}>
                                {lines.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Shift</label>
                            <select className="input-field" style={{ height: 36 }} value={selShift} onChange={(e) => setSelShift(e.target.value)}>
                                {shifts.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <button onClick={handleSearch} className="btn-primary flex items-center gap-2 flex-shrink-0">
                            <Search size={14} /> Search
                        </button>
                    </div>
                </div>

                {searched && (
                    <>
                        {/* ── Downtime Entry (RS-09-002) ── */}
                        {mode === "downtime" && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <Wrench size={15} className="text-red-600" /> Add Downtime Entry — RS-09-002
                                        <span className="ml-auto text-xs text-gray-400 font-normal">{selLine} · {selShift} · {selDate}</span>
                                    </h4>
                                    <form onSubmit={addDowntime} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Station / Machine</label>
                                            <select className="input-field" style={{ height: 36 }} value={dtForm.station} onChange={(e) => setDtForm(p => ({ ...p, station: e.target.value }))}>
                                                {availableStations.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                                            <input type="time" className="input-field" style={{ height: 36 }} value={dtForm.start} onChange={(e) => setDtForm(p => ({ ...p, start: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">End Time</label>
                                            <input type="time" className="input-field" style={{ height: 36 }} value={dtForm.end} onChange={(e) => setDtForm(p => ({ ...p, end: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Reason (Unplanned)</label>
                                            <select className="input-field" style={{ height: 36 }} value={dtForm.reason} onChange={(e) => setDtForm(p => ({ ...p, reason: e.target.value }))}>
                                                {unplannedReasons.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors flex-shrink-0">
                                            <Save size={14} /> Save
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-red-600" />
                                        <h4 className="text-sm font-bold text-gray-700">Downtime Log ({dtRows.length} entries)</h4>
                                        <span className="ml-auto text-xs text-gray-400">Total: {dtRows.reduce((a, r) => a + r.duration, 0)} min</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {["#", "Station", "Start", "End", "Duration (min)", "Reason", ""].map(h => (
                                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dtRows.map((r, i) => (
                                                <tr key={r.id} className={`border-b border-gray-50 table-row-hover ${i % 2 ? "bg-gray-50/30" : ""}`}
                                                    style={{ animation: `slideUp 0.35s ease ${i * 40}ms both` }}>
                                                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.station}</td>
                                                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.start}</td>
                                                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.end}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="font-bold text-red-600">{r.duration}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{r.reason}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <button onClick={() => { setDtRows(p => p.filter(x => x.id !== r.id)); toast.success("Entry deleted."); }} className="text-red-400 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {dtRows.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No downtime entries. Add one above.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Rejection Entry (RS-09-003) ── */}
                        {mode === "rejection" && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <XOctagon size={15} className="text-purple-600" /> Add Rejection Entry — RS-09-003
                                        <span className="ml-auto text-xs text-gray-400 font-normal">{selLine} · {selShift} · {selDate}</span>
                                    </h4>
                                    <form onSubmit={addRejection} className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Station / Machine</label>
                                            <select className="input-field" style={{ height: 36 }} value={rejForm.station} onChange={(e) => setRejForm(p => ({ ...p, station: e.target.value }))}>
                                                {availableStations.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Rejected Part Count</label>
                                            <input type="number" min={1} className="input-field" style={{ height: 36 }} value={rejForm.count} onChange={(e) => setRejForm(p => ({ ...p, count: +e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Defect Reason</label>
                                            <select className="input-field" style={{ height: 36 }} value={rejForm.reason} onChange={(e) => setRejForm(p => ({ ...p, reason: e.target.value }))}>
                                                {defectReasons.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <button type="submit" className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition-colors flex-shrink-0">
                                            <PlusCircle size={14} /> Add & Save
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-purple-600" />
                                        <h4 className="text-sm font-bold text-gray-700">Rejection Log ({rejRows.length} entries)</h4>
                                        <span className="ml-auto text-xs text-gray-400">Total Bad: {rejRows.reduce((a, r) => a + r.count, 0)} pcs</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {["#", "Station", "Time", "Rejected (pcs)", "Defect Reason", ""].map(h => (
                                                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rejRows.map((r, i) => (
                                                <tr key={r.id} className={`border-b border-gray-50 table-row-hover ${i % 2 ? "bg-gray-50/30" : ""}`}
                                                    style={{ animation: `slideUp 0.35s ease ${i * 40}ms both` }}>
                                                    <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.station}</td>
                                                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.time}</td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="font-bold text-purple-700">{r.count} pcs</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">{r.reason}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <button onClick={() => { setRejRows(p => p.filter(x => x.id !== r.id)); toast.success("Entry deleted."); }} className="text-red-400 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {rejRows.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-sm text-gray-400">No rejection entries. Add one above.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!searched && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400 animate-fadeIn-d2" style={{ minHeight: 300 }}>
                        <Search size={48} className="opacity-30" />
                        <p className="text-sm text-center">Select Date, Line, and Shift above, then click <strong className="text-gray-600">Search</strong> to load data.</p>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};

export default OperatorScreens;
