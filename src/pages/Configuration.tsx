/**
 * src/pages/Configuration.tsx
 * RS-03-001 Hierarchy · RS-06 Shift Management · RS-07 Product Type ·
 * RS-08 Reasons (Planned/Unplanned/Defects) · RS-15-001 Line OEE
 */
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useHierarchy } from "../context/HierarchyContext";
import MainLayout from "../layout/MainLayout";
import toast from "react-hot-toast";
import { Save, PlusCircle, Trash2, ChevronRight, ChevronDown, Settings2, X } from "lucide-react";

/* ─── Types ─── */
type LineConfig = { id: string; name: string; shiftDuration: number; stdCycleTime: number; targetOEE: number; oeeMode: "last" | "simple"; active: boolean };
type ShiftMaster = { id: number; no: number; name: string; desc: string };
type ShiftGroup = { id: number; groupName: string; shifts: { shiftId: number; start: string; end: string }[] };
type Reason = { id: number; name: string; category: "planned" | "unplanned" | "defect" };
type ProductType = { id: number; name: string; desc: string };

/* ─── Initial Data ─── */
const initialLines: LineConfig[] = [
    { id: "LA", name: "Line A", shiftDuration: 480, stdCycleTime: 30, targetOEE: 85, oeeMode: "last", active: true },
    { id: "LB", name: "Line B", shiftDuration: 480, stdCycleTime: 45, targetOEE: 85, oeeMode: "simple", active: true },
    { id: "LC", name: "Line C", shiftDuration: 480, stdCycleTime: 18, targetOEE: 90, oeeMode: "last", active: false },
];
const initialShiftMasters: ShiftMaster[] = [
    { id: 1, no: 1, name: "Morning Shift", desc: "First shift of the day" },
    { id: 2, no: 2, name: "Afternoon Shift", desc: "Second shift" },
    { id: 3, no: 3, name: "Night Shift", desc: "Third shift" },
];
const initialShiftGroups: ShiftGroup[] = [
    { id: 1, groupName: "Standard 3-Shift", shifts: [{ shiftId: 1, start: "06:00", end: "14:00" }, { shiftId: 2, start: "14:00", end: "22:00" }, { shiftId: 3, start: "22:00", end: "06:00" }] },
];
const initialReasons: Reason[] = [
    { id: 1, name: "Planned Maintenance", category: "planned" },
    { id: 2, name: "Break / Lunch", category: "planned" },
    { id: 3, name: "Power Failure", category: "unplanned" },
    { id: 4, name: "Machine Breakdown", category: "unplanned" },
    { id: 5, name: "Material Shortage", category: "unplanned" },
    { id: 6, name: "Dimensional Out of Spec", category: "defect" },
    { id: 7, name: "Surface Defect", category: "defect" },
];
const initialProductTypes: ProductType[] = [
    { id: 1, name: "Type A", desc: "Standard model — 80mm bore" },
    { id: 2, name: "Type B", desc: "Heavy-duty model — 100mm bore" },
    { id: 3, name: "Type C", desc: "Compact model — 60mm bore" },
];

type TabId = "hierarchy" | "lines" | "shifts" | "reasons" | "products" | "general";

/* ─── Reason sub-tabs ─── */
const REASON_CATS = ["planned", "unplanned", "defect"] as const;
type ReasonCat = typeof REASON_CATS[number];
const catLabel: Record<ReasonCat, string> = { planned: "Planned Downtime", unplanned: "Unplanned Downtime", defect: "Defects" };
const catColor: Record<ReasonCat, string> = { planned: "text-blue-700 bg-blue-50 border-blue-200", unplanned: "text-red-700 bg-red-50 border-red-200", defect: "text-amber-700 bg-amber-50 border-amber-200" };

/* ─── Main Component ─── */
const Configuration: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tab = (searchParams.get("tab") as TabId) || "hierarchy";
    const [lines, setLines] = useState(initialLines);
    const [shiftMasters, setShiftMasters] = useState(initialShiftMasters);
    const [shiftGroups, setShiftGroups] = useState(initialShiftGroups);
    const [reasons, setReasons] = useState(initialReasons);
    const [productTypes, setProductTypes] = useState(initialProductTypes);
    const [reasonCat, setReasonCat] = useState<ReasonCat>("planned");
    const [newReason, setNewReason] = useState("");
    const [newProduct, setNewProduct] = useState({ name: "", desc: "" });
    const [newShift, setNewShift] = useState({ no: 4, name: "", desc: "" });
    const [expandedGroup, setExpandedGroup] = useState<number | null>(1);
    const [editProductId, setEditProductId] = useState<number | null>(null);
    const [editProductDesc, setEditProductDesc] = useState("");

    const { hierarchy: hierarchyTree, setHierarchy: setHierarchyTree } = useHierarchy();

    // Modal states for Hierarchy RS-03-001
    const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<any>(null); // For edit mode
    const [hForm, setHForm] = useState({ name: "", type: "Plant", level: 0, index: -1 });

    const openAddHierarchy = (parentIndex?: number, parentLevel?: number) => {
        setEditingNode(null);
        if (parentIndex !== undefined && parentLevel !== undefined) {
            setHForm({ name: "", type: _getDefaultType(parentLevel + 1), level: parentLevel + 1, index: parentIndex + 1 });
        } else {
            setHForm({ name: "", type: "Plant", level: 0, index: hierarchyTree.length });
        }
        setIsHierarchyModalOpen(true);
    };

    const openEditHierarchy = (node: any, index: number) => {
        setEditingNode(node);
        setHForm({ name: node.name, type: node.type, level: node.level, index });
        setIsHierarchyModalOpen(true);
    };

    const _getDefaultType = (level: number) => {
        if (level === 0) return "Plant";
        if (level === 1) return "Production Area";
        if (level === 2) return "Line";
        return "Workstation";
    };

    const saveHierarchyNode = () => {
        if (!hForm.name.trim()) return toast.error("Name is required.");

        const newTree = [...hierarchyTree];
        if (editingNode) {
            // Edit existing
            const idx = newTree.findIndex(n => n.id === editingNode.id);
            if (idx > -1) {
                newTree[idx] = { ...newTree[idx], name: hForm.name, type: hForm.type };
            }
            toast.success("Hierarchy updated.");
        } else {
            // Add new
            const newNode = {
                id: Date.now().toString(),
                level: hForm.level,
                name: hForm.name,
                type: hForm.type
            };
            // Insert at specified index
            newTree.splice(hForm.index, 0, newNode);
            toast.success("Hierarchy node added.");
        }
        setHierarchyTree(newTree);
        setIsHierarchyModalOpen(false);
    };

    const handleDeleteNode = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}" and all its children?`)) {
            // Delete the node and all its children
            const startIndex = hierarchyTree.findIndex(n => n.id === id);
            if (startIndex === -1) return;

            const levelToDelete = hierarchyTree[startIndex].level;
            let endIndex = startIndex + 1;
            while (endIndex < hierarchyTree.length && hierarchyTree[endIndex].level > levelToDelete) {
                endIndex++;
            }

            setHierarchyTree(prev => [
                ...prev.slice(0, startIndex),
                ...prev.slice(endIndex)
            ]);
            toast.success(`${name} deleted.`);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col p-5 gap-5" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* Header */}
                <div className="flex items-center justify-between animate-fadeIn flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Configuration</h2>
                        <p className="text-xs text-gray-400 mt-0.5">RS-03 · RS-06 · RS-07 · RS-08 · RS-15 — Administrator access required</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">⚠ Admin Access</span>
                        <button className="btn-primary flex items-center gap-2" onClick={() => toast.success("Configuration saved.")}><Save size={15} /> Save All</button>
                    </div>
                </div>

                {/* Tabs are now driven by the Sidebar when in configuration mode */}

                {/* ── Hierarchy (RS-03-001) ── */}
                {tab === "hierarchy" && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-base font-bold text-gray-800">Hierarchy Management</h4>
                                <p className="text-xs text-gray-500 mt-1">Configure your enterprise plant structure. Parent-child relationships govern access and visualizer drill-downs.</p>
                            </div>
                            <button className="btn-primary flex items-center gap-2 text-sm shadow-md" onClick={() => openAddHierarchy()}>
                                <PlusCircle size={16} /> New Root Plant
                            </button>
                        </div>

                        <div className="bg-gray-50/50 rounded-lg border border-gray-100 p-2 space-y-1">
                            {hierarchyTree.length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm italic">
                                    No hierarchy nodes exist. Add a new plant to get started.
                                </div>
                            )}
                            {hierarchyTree.map((node, i) => (
                                <div key={node.id} className="flex items-center gap-3 py-2.5 px-4 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all group"
                                    style={{ paddingLeft: `${(node.level * 32) + 16}px`, animation: `slideUp 0.3s ease ${i * 20}ms both` }}>

                                    {node.level < 3 ? <ChevronDown size={15} className="text-blue-500 flex-shrink-0" /> : <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />}

                                    <div className="flex flex-col flex-1">
                                        <span className={`text-sm font-semibold tracking-wide ${node.level === 0 ? "text-[#0066a1]" : node.level === 1 ? "text-purple-700" : node.level === 2 ? "text-emerald-700" : "text-gray-700"}`}>
                                            {node.name}
                                        </span>
                                    </div>

                                    <span className="text-[10px] uppercase tracking-wider font-semibold border border-gray-200 bg-gray-50 text-gray-500 px-2 py-0.5 rounded ml-auto">
                                        {node.type}
                                    </span>

                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                        {node.level < 3 && (
                                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded shadow-sm border border-transparent hover:border-blue-100 transition-all" title="Add Child" onClick={() => openAddHierarchy(i, node.level)}>
                                                <PlusCircle size={14} />
                                            </button>
                                        )}
                                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded shadow-sm border border-transparent hover:border-gray-200 transition-all" title="Edit" onClick={() => openEditHierarchy(node, i)}>
                                            <Settings2 size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded shadow-sm border border-transparent hover:border-red-100 transition-all" title="Delete" onClick={() => handleDeleteNode(node.id, node.name)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Lines & Stations + OEE Mode (RS-15-001) ── */}
                {tab === "lines" && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700">Lines & Cycle Time</h4>
                                <button className="btn-secondary flex items-center gap-1.5 text-xs"><PlusCircle size={13} /> Add Line</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["Line ID", "Name", "Shift (min)", "Std CT (s)", "OEE Target %", "OEE Mode (RS-15)", "Status", ""].map(h => (
                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((l, i) => (
                                            <tr key={l.id} className={`border-b border-gray-50 ${i % 2 ? "bg-gray-50/30" : ""}`}>
                                                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{l.id}</td>
                                                <td className="px-4 py-2.5 font-medium text-gray-800">{l.name}</td>
                                                <td className="px-4 py-2.5"><input type="number" className="input-field" style={{ height: 30, width: 80 }} value={l.shiftDuration} onChange={(e) => setLines(p => p.map(x => x.id === l.id ? { ...x, shiftDuration: +e.target.value } : x))} /></td>
                                                <td className="px-4 py-2.5"><input type="number" className="input-field" style={{ height: 30, width: 80 }} value={l.stdCycleTime} onChange={(e) => setLines(p => p.map(x => x.id === l.id ? { ...x, stdCycleTime: +e.target.value } : x))} /></td>
                                                <td className="px-4 py-2.5"><input type="number" className="input-field" style={{ height: 30, width: 70 }} value={l.targetOEE} onChange={(e) => setLines(p => p.map(x => x.id === l.id ? { ...x, targetOEE: +e.target.value } : x))} /></td>
                                                <td className="px-4 py-2.5">
                                                    <select className="input-field" style={{ height: 30, fontSize: 11 }} value={l.oeeMode} onChange={(e) => setLines(p => p.map(x => x.id === l.id ? { ...x, oeeMode: e.target.value as "last" | "simple" } : x))}>
                                                        <option value="last">Last Machine (A×P×Q)</option>
                                                        <option value="simple">Simple Line (OEE1×OEE2…)</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <button onClick={() => setLines(p => p.map(x => x.id === l.id ? { ...x, active: !x.active } : x))}
                                                        className={`text-xs px-2 py-0.5 rounded border font-medium ${l.active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                                        {l.active ? "Active" : "Inactive"}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <button onClick={() => { setLines(p => p.filter(x => x.id !== l.id)); toast.success("Line removed."); }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
                            <strong>RS-15-001 OEE Modes:</strong><br />
                            • <strong>Last Machine of Line:</strong> OEE = Availability × Performance × Quality (of the last station)<br />
                            • <strong>Simple OEE for Line:</strong> OEE = OEE(1) × OEE(2) × OEE(3)… (product of all stations)
                        </div>
                    </div>
                )}

                {/* ── Shift Management (RS-06-001/002/003/004) ── */}
                {tab === "shifts" && (
                    <div className="space-y-5 animate-fadeIn">

                        {/* RS-06-002 Shift Master */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700">Shift Master (RS-06-002)</h4>
                                <div className="flex items-center gap-2">
                                    <input className="input-field" style={{ height: 30, width: 90 }} type="number" placeholder="Shift No." value={newShift.no} onChange={(e) => setNewShift(p => ({ ...p, no: +e.target.value }))} />
                                    <input className="input-field" style={{ height: 30, width: 140 }} placeholder="Shift Name *" value={newShift.name} onChange={(e) => setNewShift(p => ({ ...p, name: e.target.value }))} />
                                    <input className="input-field" style={{ height: 30, width: 180 }} placeholder="Description" value={newShift.desc} onChange={(e) => setNewShift(p => ({ ...p, desc: e.target.value }))} />
                                    <button className="btn-primary flex items-center gap-1.5 text-xs flex-shrink-0"
                                        onClick={() => {
                                            if (!newShift.name.trim()) { toast.error("Shift name required"); return; }
                                            setShiftMasters(p => [...p, { id: Date.now(), ...newShift }]);
                                            setNewShift({ no: shiftMasters.length + 2, name: "", desc: "" });
                                            toast.success("Shift master added.");
                                        }}>
                                        <PlusCircle size={13} /> Add
                                    </button>
                                </div>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {["Sl No.", "Shift Number", "Shift Name", "Description", ""].map(h => (
                                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {shiftMasters.map((s, i) => (
                                        <tr key={s.id} className={`border-b border-gray-50 ${i % 2 ? "bg-gray-50/30" : ""}`}>
                                            <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                            <td className="px-4 py-2.5 font-semibold text-gray-700">{s.no}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{s.name}</td>
                                            <td className="px-4 py-2.5 text-xs text-gray-500">{s.desc}</td>
                                            <td className="px-4 py-2.5">
                                                <button onClick={() => { setShiftMasters(p => p.filter(x => x.id !== s.id)); toast.success("Shift deleted."); }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* RS-06-003 Shift Groups */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700">Shift Groups (RS-06-003)</h4>
                                <button className="btn-secondary flex items-center gap-1.5 text-xs"
                                    onClick={() => {
                                        const name = prompt("Enter shift group name:");
                                        if (!name) return;
                                        setShiftGroups(p => [...p, { id: Date.now(), groupName: name, shifts: [] }]);
                                        toast.success(`Shift group "${name}" added.`);
                                    }}>
                                    <PlusCircle size={13} /> Add Shift Group
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {shiftGroups.map((g) => (
                                    <div key={g.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <button onClick={() => setExpandedGroup(expandedGroup === g.id ? null : g.id)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                                            <span className="text-sm font-semibold text-gray-800">{g.groupName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">{g.shifts.length} shifts</span>
                                                {expandedGroup === g.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                            </div>
                                        </button>
                                        {expandedGroup === g.id && (
                                            <div className="p-4">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                            {["Shift", "Start", "End", "Break", "Actions"].map(h => (
                                                                <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {g.shifts.map((sh, i) => {
                                                            const masterName = shiftMasters.find(m => m.id === sh.shiftId)?.name ?? "—";
                                                            return (
                                                                <tr key={i} className="border-b border-gray-50">
                                                                    <td className="px-3 py-2 font-medium text-gray-700">{masterName}</td>
                                                                    <td className="px-3 py-2"><input type="time" className="input-field" style={{ height: 28 }} defaultValue={sh.start} /></td>
                                                                    <td className="px-3 py-2"><input type="time" className="input-field" style={{ height: 28 }} defaultValue={sh.end} /></td>
                                                                    <td className="px-3 py-2">
                                                                        <button className="text-xs text-blue-600 hover:underline" onClick={() => toast("Add/edit breaks (UI only)")}>Edit Breaks</button>
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <button className="text-red-500 hover:text-red-700" onClick={() => {
                                                                            setShiftGroups(p => p.map(x => x.id === g.id ? { ...x, shifts: x.shifts.filter((_, j) => j !== i) } : x));
                                                                        }}><Trash2 size={13} /></button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                {/* Add shift to group */}
                                                <div className="flex items-center gap-2 mt-3">
                                                    <select className="input-field flex-1" style={{ height: 30, fontSize: 12 }}
                                                        onChange={(e) => {
                                                            const id = +e.target.value;
                                                            if (!id) return;
                                                            setShiftGroups(p => p.map(x => x.id === g.id ? { ...x, shifts: [...x.shifts, { shiftId: id, start: "06:00", end: "14:00" }] } : x));
                                                            toast.success("Shift added to group.");
                                                            e.target.value = "";
                                                        }}>
                                                        <option value="">+ Add shift to group…</option>
                                                        {shiftMasters.filter(m => !g.shifts.some(s => s.shiftId === m.id)).map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RS-06-004 Shift Assignment */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50"><h4 className="text-sm font-bold text-gray-700">Shift Assignment (RS-06-004)</h4></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["#", "Line", "Date Range", "Assigned Shift Group", "Action"].map(h => (
                                                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { line: "Line A", range: "01 Feb – 28 Feb 2026", group: "Standard 3-Shift" },
                                            { line: "Line B", range: "01 Feb – 28 Feb 2026", group: "Standard 3-Shift" },
                                            { line: "Line C", range: "01 Feb – 28 Feb 2026", group: "Standard 3-Shift" },
                                        ].map((row, i) => (
                                            <tr key={row.line} className={`border-b border-gray-50 ${i % 2 ? "bg-gray-50/30" : ""}`}>
                                                <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                                <td className="px-4 py-2.5 font-medium text-gray-800">{row.line}</td>
                                                <td className="px-4 py-2.5 text-xs text-gray-500">{row.range}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{row.group}</span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <button className="text-xs text-[#0066a1] hover:underline font-medium" onClick={() => toast("Edit assignment (UI only)")}>Edit</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Reasons (RS-08-001/002/003/004) ── */}
                {tab === "reasons" && (
                    <div className="space-y-5 animate-fadeIn">
                        {/* Sub-tabs */}
                        <div className="flex gap-2">
                            {REASON_CATS.map((c) => (
                                <button key={c} onClick={() => setReasonCat(c)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${reasonCat === c ? catColor[c] : "text-gray-500 border-gray-200 bg-white"}`}>
                                    {catLabel[c]}
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/60">
                                        {reasons.filter(r => r.category === c).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Add Reason */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-sm font-bold text-gray-700">
                                    {reasonCat === "planned" ? "RS-08-002" : reasonCat === "unplanned" ? "RS-08-003" : "RS-08-004"} · Add {catLabel[reasonCat]} Reason
                                </h4>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!newReason.trim()) { toast.error("Reason field is mandatory."); return; }
                                setReasons(p => [...p, { id: Date.now(), name: newReason.trim(), category: reasonCat }]);
                                setNewReason("");
                                toast.success("Reason added.");
                            }} className="flex items-center gap-2">
                                <input className="input-field flex-1" placeholder={`Add ${catLabel[reasonCat]} reason *`} value={newReason} onChange={(e) => setNewReason(e.target.value)} />
                                <button type="submit" className="btn-primary flex items-center gap-1.5 flex-shrink-0">
                                    <PlusCircle size={14} /> Add
                                </button>
                            </form>
                        </div>

                        {/* Reasons list */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50">
                                <h4 className="text-sm font-bold text-gray-700">{catLabel[reasonCat]} Reasons ({reasons.filter(r => r.category === reasonCat).length})</h4>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {["#", "Reason Name", "Category", "Action"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reasons.filter(r => r.category === reasonCat).map((r, i) => (
                                        <tr key={r.id} className={`border-b border-gray-50 table-row-hover ${i % 2 ? "bg-gray-50/30" : ""}`}
                                            style={{ animation: `slideUp 0.3s ease ${i * 40}ms both` }}>
                                            <td className="px-4 py-2.5 text-xs text-gray-400">{i + 1}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{r.name}</td>
                                            <td className="px-4 py-2.5">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${catColor[r.category]}`}>{catLabel[r.category]}</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <button onClick={() => { setReasons(p => p.filter(x => x.id !== r.id)); toast.success("Reason deleted."); }} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reasons.filter(r => r.category === reasonCat).length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-sm text-gray-400">No {catLabel[reasonCat].toLowerCase()} reasons yet. Add one above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Product Types (RS-07-001/002/003/004) ── */}
                {tab === "products" && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* RS-07-002 Add Product Type */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">RS-07-002 Add Product Type</h4>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (!newProduct.name.trim()) { toast.error("Product Type name is mandatory."); return; }
                                setProductTypes(p => [...p, { id: Date.now(), ...newProduct }]);
                                setNewProduct({ name: "", desc: "" });
                                toast.success("Product Type added.");
                            }} className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Product Type Name *</label>
                                    <input className="input-field" placeholder="e.g. Type D" value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input className="input-field" placeholder="Brief description" value={newProduct.desc} onChange={(e) => setNewProduct(p => ({ ...p, desc: e.target.value }))} />
                                </div>
                                <button type="submit" className="btn-primary flex items-center gap-1.5 flex-shrink-0"><PlusCircle size={14} /> Submit</button>
                            </form>
                        </div>

                        {/* RS-07-003/004 Edit/Delete Product Type */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-gray-50">
                                <h4 className="text-sm font-bold text-gray-700">RS-07-003/004 Product Types — Edit or Delete</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Product Type Name is not editable. Only description can be changed.</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {["#", "Type Name", "Description", "Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {productTypes.map((pt, i) => (
                                        <tr key={pt.id} className={`border-b border-gray-50 ${i % 2 ? "bg-gray-50/30" : ""}`}
                                            style={{ animation: `slideUp 0.3s ease ${i * 50}ms both` }}>
                                            <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">{pt.name}</td>
                                            <td className="px-4 py-3">
                                                {editProductId === pt.id ? (
                                                    <input className="input-field" style={{ height: 30 }} value={editProductDesc}
                                                        onChange={(e) => setEditProductDesc(e.target.value)} autoFocus />
                                                ) : (
                                                    <span className="text-xs text-gray-500">{pt.desc}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {editProductId === pt.id ? (
                                                        <>
                                                            <button className="text-xs px-3 py-1 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                                                                onClick={() => { setProductTypes(p => p.map(x => x.id === pt.id ? { ...x, desc: editProductDesc } : x)); setEditProductId(null); toast.success("Product type updated."); }}>
                                                                Save
                                                            </button>
                                                            <button className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => setEditProductId(null)}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <button className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                                            onClick={() => { setEditProductId(pt.id); setEditProductDesc(pt.desc); }}>Edit</button>
                                                    )}
                                                    <button onClick={() => {
                                                        if (window.confirm(`Delete "${pt.name}"? This cannot be undone.`)) {
                                                            setProductTypes(p => p.filter(x => x.id !== pt.id));
                                                            toast.success(`"${pt.name}" deleted.`);
                                                        }
                                                    }} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── General ── */}
                {tab === "general" && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-fadeIn grid grid-cols-2 gap-4">
                        {[
                            { label: "Plant Name", value: "Bosch — Coimbatore Plant" },
                            { label: "Plant Code", value: "CBE-001" },
                            { label: "OEE Target (%)", value: "85" },
                            { label: "Data Refresh (sec)", value: "30" },
                            { label: "Timezone", value: "Asia/Kolkata (IST +5:30)" },
                            { label: "DB Server", value: "postgresql://localhost:5432/bpv_db" },
                        ].map((f) => (
                            <div key={f.label}>
                                <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                                <input type="text" className="input-field" defaultValue={f.value} />
                            </div>
                        ))}
                    </div>
                )}

            </div>
            {/* Hierarchy Modal */}
            {isHierarchyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(90deg, #0066a1 0%, #00a0dc 100%)" }}>
                            <h3 className="font-bold text-white tracking-wide">
                                {editingNode ? "Edit Hierarchy Node" : "Add Hierarchy Node"}
                            </h3>
                            <button onClick={() => setIsHierarchyModalOpen(false)} className="text-blue-100 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Node Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={hForm.name}
                                    onChange={(e) => setHForm({ ...hForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    placeholder="e.g. Assembly Line A"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Hierarchy Level</label>
                                    <select
                                        value={hForm.level}
                                        onChange={(e) => setHForm({ ...hForm, level: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                                        disabled={!!editingNode} // Can't easily change level of existing node in simple UI without messing up tree
                                    >
                                        <option value={0}>0 — Root Plant</option>
                                        <option value={1}>1 — Production Area</option>
                                        <option value={2}>2 — Line</option>
                                        <option value={3}>3 — Workstation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Designation</label>
                                    <select
                                        value={hForm.type}
                                        onChange={(e) => setHForm({ ...hForm, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
                                    >
                                        <option value="Plant">Plant</option>
                                        <option value="Production Area">Production Area</option>
                                        <option value="Line">Line</option>
                                        <option value="Workstation">Workstation</option>
                                    </select>
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs leading-relaxed text-blue-800">
                                <strong>Tip:</strong> Typical Bosch nomenclature expects Plant (Site) &rarr; Production Area (Shopfloor) &rarr; Line / Cell &rarr; Workstation.
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsHierarchyModalOpen(false)}
                                className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveHierarchyNode}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#0066a1] hover:bg-blue-700 rounded-lg shadow-md transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> {editingNode ? "Save Structure" : "Add to Hierarchy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Configuration;
