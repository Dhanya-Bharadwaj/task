/**
 * src/pages/LossesEntry.tsx
 * Manual Losses Entry page — Quality & Downtime losses.
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import toast from "react-hot-toast";
import { PlusCircle, Trash2 } from "lucide-react";

type LossEntry = {
    id: number;
    date: string;
    shift: string;
    line: string;
    station: string;
    lossType: string;
    category: string;
    duration: number;
    qty: number;
    remarks: string;
};

const initialLosses: LossEntry[] = [
    { id: 1, date: "2026-02-25", shift: "Morning", line: "Line A", station: "A-03 Painting", lossType: "Downtime", category: "Mechanical Failure", duration: 35, qty: 0, remarks: "Pump seal failure" },
    { id: 2, date: "2026-02-25", shift: "Morning", line: "Line A", station: "A-02 Assembly", lossType: "Quality", category: "Dimensional Error", duration: 0, qty: 5, remarks: "Bore oversize" },
    { id: 3, date: "2026-02-25", shift: "Morning", line: "Line B", station: "B-03 Finishing", lossType: "Downtime", category: "Electrical Fault", duration: 22, qty: 0, remarks: "Control panel trip" },
    { id: 4, date: "2026-02-25", shift: "Morning", line: "Line B", station: "B-03 Finishing", lossType: "Quality", category: "Surface Defect", duration: 0, qty: 3, remarks: "Scratch on surface" },
];

const lossTypes = ["Downtime", "Quality"];
const downCategories = ["Mechanical Failure", "Electrical Fault", "Setup/Changeover", "Planned Maintenance", "Material Shortage", "Operator Absence", "Other"];
const qualCategories = ["Dimensional Error", "Surface Defect", "Material Defect", "Wrong Assembly", "Measurement Error", "Other"];
const lines = ["Line A", "Line B", "Line C"];
const stations = ["A-01 Welding", "A-02 Assembly", "A-03 Painting", "A-04 Testing", "B-01 Forming", "B-02 Drilling", "B-03 Finishing", "B-04 QC Check", "C-01 Cast", "C-02 Grind", "C-03 Polish"];
const shifts = ["Morning (06:00–14:00)", "Afternoon (14:00–22:00)", "Night (22:00–06:00)"];

const LossesEntry: React.FC = () => {
    const [losses, setLosses] = useState<LossEntry[]>(initialLosses);
    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        shift: shifts[0],
        line: lines[0],
        station: stations[0],
        lossType: lossTypes[0],
        category: downCategories[0],
        duration: "",
        qty: "",
        remarks: "",
    });

    const categories = form.lossType === "Downtime" ? downCategories : qualCategories;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "lossType" ? { category: value === "Downtime" ? downCategories[0] : qualCategories[0] } : {}),
        }));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: LossEntry = {
            id: Date.now(),
            date: form.date,
            shift: form.shift,
            line: form.line,
            station: form.station,
            lossType: form.lossType,
            category: form.category,
            duration: parseFloat(form.duration) || 0,
            qty: parseInt(form.qty) || 0,
            remarks: form.remarks,
        };
        setLosses((prev) => [newEntry, ...prev]);
        setForm((f) => ({ ...f, duration: "", qty: "", remarks: "" }));
        toast.success("Loss entry added successfully.");
    };

    const handleDelete = (id: number) => {
        setLosses((prev) => prev.filter((l) => l.id !== id));
        toast.success("Entry deleted.");
    };

    return (
        <MainLayout>
            <div className="flex flex-col p-4 space-y-4">
                <h3 className="page-title text-xl font-semibold text-gray-800">
                    Losses Entry — Quality &amp; Downtime
                </h3>

                {/* Entry Form */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <PlusCircle size={16} className="text-[#0066a1]" />
                            New Loss Entry
                        </h4>
                    </div>
                    <form onSubmit={handleAdd} className="p-4 grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input name="date" type="date" className="input-field" value={form.date} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Shift</label>
                            <select name="shift" className="input-field" value={form.shift} onChange={handleChange}>
                                {shifts.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Line</label>
                            <select name="line" className="input-field" value={form.line} onChange={handleChange}>
                                {lines.map((l) => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Station</label>
                            <select name="station" className="input-field" value={form.station} onChange={handleChange}>
                                {stations.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Loss Type</label>
                            <select name="lossType" className="input-field" value={form.lossType} onChange={handleChange}>
                                {lossTypes.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                            <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                                {categories.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                {form.lossType === "Downtime" ? "Duration (min)" : "Qty (pcs)"}
                            </label>
                            {form.lossType === "Downtime" ? (
                                <input name="duration" type="number" className="input-field" placeholder="Minutes" value={form.duration} onChange={handleChange} min={0} />
                            ) : (
                                <input name="qty" type="number" className="input-field" placeholder="Quantity" value={form.qty} onChange={handleChange} min={0} />
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                            <input name="remarks" type="text" className="input-field" placeholder="Brief reason / description" value={form.remarks} onChange={handleChange} />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary w-full">Add Entry</button>
                        </div>
                    </form>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Total Downtime Losses", value: `${losses.filter(l => l.lossType === "Downtime").reduce((a, l) => a + l.duration, 0)} min` },
                        { label: "Total Quality Losses", value: `${losses.filter(l => l.lossType === "Quality").reduce((a, l) => a + l.qty, 0)} pcs` },
                        { label: "Total Entries", value: `${losses.length}` },
                    ].map((c) => (
                        <div key={c.label} className="bg-white border border-gray-200 rounded-md p-3 text-center shadow-sm">
                            <p className="text-xs text-gray-500">{c.label}</p>
                            <p className="text-xl font-bold text-gray-800 mt-0.5">{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Losses Table */}
                <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="text-sm font-semibold text-gray-700">Loss Records</h4>
                    </div>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Shift</th>
                                    <th>Line</th>
                                    <th>Station</th>
                                    <th>Loss Type</th>
                                    <th>Category</th>
                                    <th>Duration (min)</th>
                                    <th>Qty (pcs)</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {losses.map((l, i) => (
                                    <tr key={l.id} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                                        <td className="font-mono text-xs text-gray-600">{l.date}</td>
                                        <td className="text-xs text-gray-500">{l.shift.split(" ")[0]}</td>
                                        <td>{l.line}</td>
                                        <td>{l.station}</td>
                                        <td>
                                            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded border ${l.lossType === "Downtime"
                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    : "bg-red-50 text-red-700 border-red-200"
                                                }`}>
                                                {l.lossType}
                                            </span>
                                        </td>
                                        <td className="text-gray-600">{l.category}</td>
                                        <td className="text-center">{l.duration > 0 ? l.duration : "-"}</td>
                                        <td className="text-center">{l.qty > 0 ? l.qty : "-"}</td>
                                        <td className="text-gray-500 text-xs">{l.remarks || "-"}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(l.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
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

export default LossesEntry;
