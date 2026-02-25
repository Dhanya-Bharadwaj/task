/**
 * src/pages/UserConfig.tsx
 * RS-04-001 User Management: Add, Edit, Delete User, Password Reset, User Role
 * RS-05-001 Role Management: Add Roles, Feature Assignment
 */
import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import {
    UserPlus, UserCog, KeyRound, Shield, X, Save, Eye, EyeOff,
    Trash2, ShieldCheck, PlusCircle, CheckSquare, Square,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ─── */
type User = {
    id: number;
    username: string;
    empNo: string;
    fullName: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
    lastLogin: string;
};

type Role = { id: number; name: string; desc: string };
type FeaturePermission = { feature: string;[role: string]: boolean | string };

/* ─── Sample Data ─── */
const initialUsers: User[] = [
    { id: 1, username: "admin", empNo: "EMP001", fullName: "System Admin", email: "admin@bosch.com", role: "Administrator", status: "Active", lastLogin: "2026-02-25 08:12" },
    { id: 2, username: "ravi.k", empNo: "EMP002", fullName: "Ravi Kumar", email: "ravi.k@bosch.com", role: "Manager", status: "Active", lastLogin: "2026-02-25 07:45" },
    { id: 3, username: "suresh.m", empNo: "EMP003", fullName: "Suresh M", email: "suresh.m@bosch.com", role: "Operator", status: "Active", lastLogin: "2026-02-24 16:22" },
    { id: 4, username: "priya.s", empNo: "EMP004", fullName: "Priya S", email: "priya.s@bosch.com", role: "Viewer", status: "Inactive", lastLogin: "2026-02-20 09:00" },
];

const initialRoles: Role[] = [
    { id: 1, name: "Administrator", desc: "Full system access including configuration" },
    { id: 2, name: "Manager", desc: "View and edit production data, no configuration" },
    { id: 3, name: "Operator", desc: "View dashboards and enter downtime/rejection" },
    { id: 4, name: "Viewer", desc: "Read-only access to dashboards and reports" },
];

const FEATURES = [
    "Shift ANDON", "Line Dashboard", "Machine Dashboard", "OEE Analysis",
    "Hourly Production", "Losses Entry", "Reports", "User Config",
    "Configuration", "Shift Management", "Role Management", "Reasons",
    "Product Types", "Operator Screens", "MTTR-MTBF",
];

const buildMatrix = (roles: Role[]): FeaturePermission[] =>
    FEATURES.map((f) => {
        const row: FeaturePermission = { feature: f };
        roles.forEach((r) => {
            if (r.name === "Administrator") row[r.name] = true;
            else if (r.name === "Manager") row[r.name] = !["User Config", "Configuration", "Role Management", "Product Types"].includes(f);
            else if (r.name === "Operator") row[r.name] = ["Shift ANDON", "Line Dashboard", "Machine Dashboard", "Losses Entry", "Operator Screens"].includes(f);
            else row[r.name] = ["Shift ANDON", "Line Dashboard", "OEE Analysis", "Reports"].includes(f);
        });
        return row;
    });

/* ─── Main Component ─── */
type Panel = "add" | "edit" | "reset" | "roles" | "roleManage" | null;

const UserConfig: React.FC = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [matrix, setMatrix] = useState<FeaturePermission[]>(() => buildMatrix(initialRoles));
    const [panel, setPanel] = useState<Panel>(null);
    const [selected, setSelected] = useState<User | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [showPw, setShowPw] = useState(false);
    const [newRoleForm, setNewRoleForm] = useState({ name: "", desc: "" });

    /* Add User form */
    const [addForm, setAddForm] = useState({
        username: "", empNo: "", fullName: "", email: "",
        role: initialRoles[2].name, password: "", confirm: "",
    });

    /* Password Reset */
    const [pwForm, setPwForm] = useState({ newPw: "", confirmPw: "" });

    /* Tiles */
    const tiles = [
        { id: "add", label: "Add User", icon: <UserPlus size={40} />, gradient: "linear-gradient(135deg,#0066a1,#0284c7)", glow: "rgba(0,102,161,0.35)" },
        { id: "edit", label: "Edit User", icon: <UserCog size={40} />, gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)", glow: "rgba(124,58,237,0.35)" },
        { id: "reset", label: "Password Reset", icon: <KeyRound size={40} />, gradient: "linear-gradient(135deg,#d97706,#fcd34d)", glow: "rgba(217,119,6,0.35)" },
        { id: "roles", label: "User Roles", icon: <Shield size={40} />, gradient: "linear-gradient(135deg,#059669,#34d399)", glow: "rgba(5,150,105,0.35)" },
        { id: "roleManage", label: "Role Management", icon: <ShieldCheck size={40} />, gradient: "linear-gradient(135deg,#dc2626,#f87171)", glow: "rgba(220,38,38,0.35)" },
    ] as const;

    const openPanel = (id: Panel) => { setPanel((p) => p === id ? null : id); setSelected(null); };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.username || !addForm.fullName || !addForm.empNo) { toast.error("Username, full name, and employee number are required."); return; }
        if (!addForm.password) { toast.error("Password is required."); return; }
        if (addForm.password !== addForm.confirm) { toast.error("Passwords do not match!"); return; }
        setUsers((p) => [{ id: Date.now(), username: addForm.username, empNo: addForm.empNo, fullName: addForm.fullName, email: addForm.email, role: addForm.role, status: "Active", lastLogin: "Never" }, ...p]);
        setAddForm({ username: "", empNo: "", fullName: "", email: "", role: initialRoles[2].name, password: "", confirm: "" });
        setPanel(null);
        toast.success("User added successfully.");
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setUsers((p) => p.map((u) => u.id === selected.id ? selected : u));
        toast.success("User updated.");
        setPanel(null);
    };

    const handleResetPw = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPw !== pwForm.confirmPw) { toast.error("Passwords do not match!"); return; }
        setPwForm({ newPw: "", confirmPw: "" });
        setPanel(null);
        toast.success(`Password reset for ${selected?.username}.`);
    };

    /* RS-04-004 Delete User */
    const confirmDelete = (u: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteTarget(u);
    };
    const doDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.username === "admin") { toast.error("Cannot delete the system admin."); setDeleteTarget(null); return; }
        setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
        toast.success(`User "${deleteTarget.username}" deleted.`);
        setDeleteTarget(null);
        if (selected?.id === deleteTarget.id) setSelected(null);
    };

    const handleToggleStatus = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setUsers((p) => p.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    };

    /* RS-05-002 Add Role */
    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        const name = newRoleForm.name.trim();
        if (!name) { toast.error("Role name is required."); return; }
        if (roles.some((r) => r.name.toLowerCase() === name.toLowerCase())) { toast.error("Role name must be unique."); return; }
        const newRole: Role = { id: Date.now(), name, desc: newRoleForm.desc };
        const updatedRoles = [...roles, newRole];
        setRoles(updatedRoles);
        setMatrix(buildMatrix(updatedRoles));
        setNewRoleForm({ name: "", desc: "" });
        toast.success(`Role "${name}" added.`);
    };

    /* RS-05-003 Toggle feature permission */
    const toggleFeature = (feature: string, roleName: string) => {
        setMatrix((prev) => prev.map((row) =>
            row.feature === feature ? { ...row, [roleName]: !row[roleName] } : row
        ));
    };

    return (
        <MainLayout>
            <div className="flex flex-col p-6 gap-6" style={{ minHeight: "calc(100vh - 87px)" }}>

                {/* Header */}
                <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800">User Configuration</h2>
                    <p className="text-xs text-gray-400 mt-0.5">RS-04 & RS-05 · Manage users, roles, passwords, and feature access</p>
                </div>

                {/* ── Tiles ── */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 animate-fadeIn-d1">
                    {tiles.map((t, i) => (
                        <button key={t.id} onClick={() => openPanel(t.id as Panel)}
                            className="group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl overflow-hidden cursor-pointer"
                            style={{
                                background: t.gradient,
                                boxShadow: panel === t.id
                                    ? `0 0 0 3px white, 0 0 0 5px ${t.glow}, 0 8px 32px ${t.glow}`
                                    : `0 4px 20px ${t.glow}`,
                                minHeight: 140,
                                animation: `slideUp 0.5s ease ${i * 70}ms both`,
                                transition: "box-shadow 0.2s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                                transform: panel === t.id ? "scale(0.96)" : "scale(1)",
                            }}>
                            <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-none"
                                style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%)" }} />
                            <div className="relative z-10 text-white/90 group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
                            <div className="relative z-10 text-white font-bold text-xs text-center px-2 leading-tight">{t.label}</div>
                            {panel === t.id && (
                                <div className="absolute top-2.5 right-2.5 bg-white/20 rounded-full p-0.5"><X size={13} className="text-white" /></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Panel: Add User (RS-04-002) ── */}
                {panel === "add" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-scaleIn">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UserPlus size={16} className="text-[#0066a1]" /> Add New User
                            <span className="ml-auto text-[10px] text-gray-400 font-normal">RS-04-002 · Fields marked * are mandatory</span>
                        </h3>
                        <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs text-gray-500 mb-1">Username *</label>
                                <input className="input-field" placeholder="e.g. john.d" value={addForm.username} onChange={(e) => setAddForm((p) => ({ ...p, username: e.target.value }))} /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Employee Number *</label>
                                <input className="input-field" placeholder="e.g. EMP005" value={addForm.empNo} onChange={(e) => setAddForm((p) => ({ ...p, empNo: e.target.value }))} /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">First / Full Name *</label>
                                <input className="input-field" placeholder="Full Name" value={addForm.fullName} onChange={(e) => setAddForm((p) => ({ ...p, fullName: e.target.value }))} /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Email</label>
                                <input className="input-field" type="email" placeholder="email@bosch.com" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Role</label>
                                <select className="input-field" value={addForm.role} onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}>
                                    {roles.map((r) => <option key={r.id}>{r.name}</option>)}</select></div>
                            <div className="relative"><label className="block text-xs text-gray-500 mb-1">Password *</label>
                                <input className="input-field pr-9" type={showPw ? "text" : "password"} placeholder="Password" value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} />
                                <button type="button" className="absolute right-2 top-7 text-gray-400" onClick={() => setShowPw((v) => !v)}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Confirm Password *</label>
                                <input className="input-field" type="password" placeholder="Confirm" value={addForm.confirm} onChange={(e) => setAddForm((p) => ({ ...p, confirm: e.target.value }))} /></div>
                            <div className="col-span-2 flex gap-3 pt-2">
                                <button type="submit" className="btn-primary flex items-center gap-2"><Save size={15} /> Save User</button>
                                <button type="button" className="btn-secondary" onClick={() => setPanel(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Panel: Edit User (RS-04-003) ── */}
                {panel === "edit" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-scaleIn">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UserCog size={16} className="text-purple-600" /> Edit User
                            <span className="ml-auto text-[10px] text-gray-400 font-normal">RS-04-003 · Select a user from the table below</span>
                        </h3>
                        {!selected ? (
                            <div className="py-6 text-center text-sm text-gray-400">
                                👇 Click any row in the user table below to select a user for editing
                            </div>
                        ) : (
                            <form className="grid grid-cols-2 gap-4" onSubmit={handleUpdateUser}>
                                <div><label className="block text-xs text-gray-500 mb-1">Username (read-only)</label>
                                    <input className="input-field bg-gray-50" value={selected.username} disabled /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Employee No. (read-only)</label>
                                    <input className="input-field bg-gray-50" value={selected.empNo} disabled /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Full Name *</label>
                                    <input className="input-field" value={selected.fullName} onChange={(e) => setSelected((p) => p ? { ...p, fullName: e.target.value } : p)} /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Email</label>
                                    <input className="input-field" type="email" value={selected.email} onChange={(e) => setSelected((p) => p ? { ...p, email: e.target.value } : p)} /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Role</label>
                                    <select className="input-field" value={selected.role} onChange={(e) => setSelected((p) => p ? { ...p, role: e.target.value } : p)}>
                                        {roles.map((r) => <option key={r.id}>{r.name}</option>)}</select></div>
                                <div className="col-span-2 flex gap-3 pt-2">
                                    <button type="submit" className="btn-primary flex items-center gap-2"><Save size={15} /> Update User</button>
                                    <button type="button" className="btn-secondary" onClick={() => setPanel(null)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* ── Panel: Password Reset (RS-04-005) ── */}
                {panel === "reset" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-scaleIn">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <KeyRound size={16} className="text-yellow-600" /> Password Reset
                            <span className="ml-auto text-[10px] text-gray-400 font-normal">RS-04-005 · Select user from table, then set new password</span>
                        </h3>
                        {!selected ? (
                            <div className="py-6 text-center text-sm text-gray-400">👇 Select a user from the table below to reset password</div>
                        ) : (
                            <form onSubmit={handleResetPw} className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="w-9 h-9 rounded-full bg-[#0066a1] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {selected.username.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">{selected.fullName}</div>
                                        <div className="text-xs text-gray-500">@{selected.username} · {selected.role} · {selected.empNo}</div>
                                    </div>
                                </div>
                                <div><label className="block text-xs text-gray-500 mb-1">New Password</label>
                                    <input className="input-field" type="password" placeholder="New password" value={pwForm.newPw} onChange={(e) => setPwForm((p) => ({ ...p, newPw: e.target.value }))} /></div>
                                <div><label className="block text-xs text-gray-500 mb-1">Confirm Password</label>
                                    <input className="input-field" type="password" placeholder="Confirm" value={pwForm.confirmPw} onChange={(e) => setPwForm((p) => ({ ...p, confirmPw: e.target.value }))} /></div>
                                <div className="col-span-2 flex gap-3 pt-2">
                                    <button type="submit" className="btn-primary flex items-center gap-2"><KeyRound size={15} /> Reset Password</button>
                                    <button type="button" className="btn-secondary" onClick={() => setPanel(null)}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* ── Panel: User Role Assignment (RS-04-006) ── */}
                {panel === "roles" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-scaleIn">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-green-600" /> User Role Assignment
                            <span className="ml-auto text-[10px] text-gray-400 font-normal">RS-04-006 · Click a row to assign role</span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {["#", "Username", "Full Name", "Emp No.", "Current Role", "Assign Role"].map(h => (
                                            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={u.id} className="border-b border-gray-50 table-row-hover" style={{ animation: `slideUp 0.35s ease ${i * 40}ms both` }}>
                                            <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-gray-700">{u.username}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">{u.fullName}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500">{u.empNo}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{u.role}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select className="input-field" style={{ height: 30, fontSize: 12, padding: "2px 8px" }}
                                                    value={u.role}
                                                    onChange={(e) => { setUsers((p) => p.map((x) => x.id === u.id ? { ...x, role: e.target.value } : x)); toast.success(`${u.username} → ${e.target.value}`); }}>
                                                    {roles.map((r) => <option key={r.id}>{r.name}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Panel: Role Management (RS-05-001/002/003) ── */}
                {panel === "roleManage" && (
                    <div className="space-y-5 animate-scaleIn">
                        {/* RS-05-002 Add Role */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <PlusCircle size={15} className="text-red-600" /> Add New Role
                                <span className="ml-auto text-[10px] text-gray-400 font-normal">RS-05-002 · Role name must be unique</span>
                            </h3>
                            <form onSubmit={handleAddRole} className="flex items-end gap-3">
                                <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Role Name *</label>
                                    <input className="input-field" placeholder="e.g. Supervisor" value={newRoleForm.name} onChange={(e) => setNewRoleForm((p) => ({ ...p, name: e.target.value }))} /></div>
                                <div className="flex-[2]"><label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input className="input-field" placeholder="Brief description" value={newRoleForm.desc} onChange={(e) => setNewRoleForm((p) => ({ ...p, desc: e.target.value }))} /></div>
                                <button type="submit" className="btn-primary flex items-center gap-2 flex-shrink-0"><PlusCircle size={14} /> Add Role</button>
                            </form>
                            {/* Role list */}
                            <div className="mt-4 divide-y divide-gray-100">
                                {roles.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between py-2.5">
                                        <div>
                                            <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                                            <span className="text-xs text-gray-400 ml-3">{r.desc}</span>
                                        </div>
                                        {!["Administrator", "Manager", "Operator", "Viewer"].includes(r.name) && (
                                            <button onClick={() => {
                                                setRoles((p) => p.filter((x) => x.id !== r.id));
                                                setMatrix(buildMatrix(roles.filter((x) => x.id !== r.id)));
                                                toast.success(`Role "${r.name}" deleted.`);
                                            }} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RS-05-003 Feature Assignment */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                <CheckSquare size={15} className="text-red-600" />
                                <h3 className="text-sm font-bold text-gray-700">Feature → Role Assignment</h3>
                                <span className="ml-auto text-[10px] text-gray-400">RS-05-003 · Click checkboxes to toggle access</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-50">Feature / Screen</th>
                                            {roles.map((r) => (
                                                <th key={r.id} className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">{r.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matrix.map((row, i) => (
                                            <tr key={row.feature} className={`border-b border-gray-50 table-row-hover ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                                                <td className="px-4 py-2.5 text-xs font-medium text-gray-700 sticky left-0 bg-inherit">{row.feature}</td>
                                                {roles.map((r) => (
                                                    <td key={r.id} className="px-4 py-2.5 text-center">
                                                        <button
                                                            onClick={() => r.name !== "Administrator" && toggleFeature(row.feature, r.name)}
                                                            className={`transition-colors ${r.name === "Administrator" ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
                                                            title={r.name === "Administrator" ? "Admins always have full access" : `Toggle ${r.name} access to ${row.feature}`}>
                                                            {row[r.name]
                                                                ? <CheckSquare size={18} className={r.name === "Administrator" ? "text-green-400" : "text-green-600"} />
                                                                : <Square size={18} className="text-gray-300" />}
                                                        </button>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                                <button className="btn-primary flex items-center gap-2" onClick={() => toast.success("Feature permissions saved.")}><Save size={14} /> Save Permissions</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Users Table ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeIn-d2">
                    <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 rounded-full bg-[#0066a1]" />
                            <h4 className="text-sm font-bold text-gray-700">All Users ({users.length})</h4>
                        </div>
                        <span className="text-xs text-gray-400">Click a row to select · RS-04-003/004/005</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["#", "Username", "Emp No.", "Full Name", "Email", "Role", "Status", "Last Login", "Actions"].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={u.id} onClick={() => setSelected(u)}
                                        className={`border-b border-gray-50 table-row-hover cursor-pointer transition-all ${selected?.id === u.id ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : ""}`}
                                        style={{ animation: `slideUp 0.4s ease ${i * 50}ms both` }}>
                                        <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                    style={{ background: "linear-gradient(135deg,#0066a1,#0284c7)" }}>
                                                    {u.username.charAt(0).toUpperCase()}</div>
                                                <span className="font-mono text-xs text-gray-600">{u.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{u.empNo}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">{u.fullName}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {u.status === "Active" && <span className="andon-pulse-green inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 align-middle" />}
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{u.lastLogin}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={(e) => handleToggleStatus(u.id, e)}
                                                    className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${u.status === "Active" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"}`}>
                                                    {u.status === "Active" ? "Deactivate" : "Activate"}
                                                </button>
                                                {/* RS-04-004 Delete with confirmation */}
                                                <button onClick={(e) => confirmDelete(u, e)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                                                    title="Delete user">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Delete Confirmation Modal (RS-04-004) ── */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scaleIn">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <Trash2 size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-800">Delete User?</div>
                                    <div className="text-xs text-gray-500">This action cannot be undone.</div>
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                                <div className="text-sm font-semibold text-gray-800">{deleteTarget.fullName}</div>
                                <div className="text-xs text-gray-500">@{deleteTarget.username} · {deleteTarget.empNo} · {deleteTarget.role}</div>
                            </div>
                            <p className="text-xs text-gray-500 mb-5">The user will be permanently removed from the system and will no longer be able to log in.</p>
                            <div className="flex gap-3">
                                <button onClick={doDelete}
                                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <Trash2 size={14} /> Delete User
                                </button>
                                <button onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};

export default UserConfig;
