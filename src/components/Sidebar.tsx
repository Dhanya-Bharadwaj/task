/**
 * src/components/Sidebar.tsx
 * BPV animated sidebar with smooth hover, active states, collapsible.
 */
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../auth/useAuth";
import {
    LayoutDashboard, Monitor, Cpu, BarChart3, ClipboardList,
    AlertTriangle, Settings, FileText, Info, LogOut, X, Menu, Clock,
    Grid, Users, Wrench,
} from "lucide-react";

type NavItem = { name: string; path: string; icon: React.ReactNode; badge?: string };

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems: NavItem[] = useMemo(() => [
        { name: "BPV Dashboard", path: "/dashboard", icon: <Grid size={20} /> },
        { name: "Shift ANDON", path: "/home", icon: <LayoutDashboard size={20} />, badge: "LIVE" },
        { name: "Line Dashboard", path: "/line-dashboard", icon: <Monitor size={20} /> },
        { name: "Machine Dash.", path: "/machine-dashboard", icon: <Cpu size={20} /> },
        { name: "OEE Analysis", path: "/oee-analysis", icon: <BarChart3 size={20} /> },
        { name: "Hourly Prod.", path: "/hourly-production", icon: <Clock size={20} /> },
        { name: "Losses Entry", path: "/losses-entry", icon: <AlertTriangle size={20} /> },
        { name: "Operator Screens", path: "/operator-screens", icon: <Wrench size={20} /> },
        { name: "Reports", path: "/reports", icon: <FileText size={20} /> },
        { name: "User Config", path: "/user-config", icon: <Users size={20} /> },
        { name: "Configuration", path: "/configuration", icon: <ClipboardList size={20} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
        { name: "About", path: "/about", icon: <Info size={20} /> },
    ], []);

    return (
        <aside
            className="h-screen text-gray-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative"
            style={{
                width: collapsed ? 64 : 220,
                background: "linear-gradient(180deg, #0d1b2a 0%, #0a1628 60%, #061220 100%)",
                boxShadow: "4px 0 24px rgba(0,0,0,0.35)",
            }}
        >
            {/* Decorative gradient line at top */}
            <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #0066a1, #00a0dc, #0066a1)" }} />

            {/* TOP SECTION */}
            <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-3.5 border-b border-white/10">
                    {!collapsed && (
                        <div className="animate-slideInLeft overflow-hidden">
                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-none">BPV</div>
                            <div className="text-xs text-white/70 leading-none mt-0.5">v1.0.0</div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed((v) => !v)}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="mt-2 flex flex-col gap-0.5 px-1.5">
                    {navItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        const isHovered = hoveredItem === item.name;

                        return (
                            <React.Fragment key={item.name}>
                                <Link
                                    to={item.path}
                                    title={collapsed ? item.name : ""}
                                    onMouseEnter={() => setHoveredItem(item.name)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal no-underline hover:no-underline
                    transition-all duration-200 group overflow-hidden"
                                    style={{
                                        color: isActive ? "#ffffff" : "#94a3b8",
                                        background: isActive
                                            ? "linear-gradient(90deg, rgba(0,102,161,0.55) 0%, rgba(0,102,161,0.15) 100%)"
                                            : isHovered
                                                ? "rgba(255,255,255,0.06)"
                                                : "transparent",
                                        transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
                                    }}
                                >
                                    {/* Active left bar */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-300"
                                        style={{
                                            background: "#0096d4",
                                            opacity: isActive ? 1 : 0,
                                            transform: isActive ? "scaleY(1)" : "scaleY(0)",
                                        }}
                                    />

                                    {/* Icon */}
                                    <div
                                        className="flex-shrink-0 transition-all duration-200"
                                        style={{
                                            color: isActive ? "#00c4ff" : isHovered ? "#7dd3fc" : "#94a3b8",
                                            transform: isHovered && !isActive ? "scale(1.1)" : "scale(1)",
                                        }}
                                    >
                                        {React.isValidElement(item.icon)
                                            ? React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 18 })
                                            : item.icon}
                                    </div>

                                    {/* Label + Badge */}
                                    {!collapsed && (
                                        <div className="flex items-center justify-between flex-1 min-w-0">
                                            <span className="truncate text-xs font-medium">{item.name}</span>
                                            {item.badge && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white animate-blink"
                                                    style={{ background: "#dc2626", fontSize: "9px" }}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>

                                {/* Separator after Reports */}
                                {item.name === "Reports" && (
                                    <div className="my-1.5 mx-3 border-t border-white/10" />
                                )}

                                {/* Stagger animation style scoped per item */}
                                <style>{`
                  .nav-item-${idx} { animation: slideUp 0.35s ease ${idx * 0.04}s both; }
                  @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-10px); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                `}</style>
                            </React.Fragment>
                        );
                    })}
                </nav>
            </div>

            {/* BOTTOM SECTION */}
            <div className="border-t border-white/10 px-1.5 py-2">
                {/* User info */}
                {!collapsed && auth?.user && (
                    <div className="flex items-center gap-2 px-2 py-2 mb-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#0066a1,#00a0dc)" }}>
                            {auth.user.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{auth.user}</div>
                            <div className="text-[10px] text-gray-500">Operator</div>
                        </div>
                    </div>
                )}

                {/* Sign Out */}
                <button
                    onClick={() => setShowDialog(true)}
                    title={collapsed ? "Sign Out" : ""}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-xs font-medium
            text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {showDialog && (
                    <ConfirmDialog
                        message="You are signing-out now. Please confirm."
                        confirmText="Sign Out"
                        cancelText="Cancel"
                        onConfirm={() => {
                            auth?.signOut();
                            setShowDialog(false);
                            navigate("/", { replace: true });
                        }}
                        onCancel={() => setShowDialog(false)}
                    />
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
