/**
 * src/components/Sidebar.tsx
 * -----------------------------------------------------------------------------
 * Single responsibility: render left navigation sidebar.
 *
 * - Supports collapse/expand.
 * - Highlights active route.
 * - Provides a Sign Out action with confirmation dialog.
 */
import React, { useMemo, useState } from "react";
import { useHierarchy } from "../context/HierarchyContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../auth/useAuth";
import {
    Settings, Info, LogOut, X, Menu,
    Users, Factory, Plus, Minus, Building2, LayoutDashboard, GitBranch
} from "lucide-react";

type NavItem = {
    name: string;
    path: string;
    icon?: React.ReactNode;
    children?: NavItem[];
};

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    const auth = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    /**
     * Navigation items are memoized so the array isn't recreated every render.
     */
    const { hierarchy } = useHierarchy();
    const isConfigRoute = location.pathname.startsWith("/configuration");

    const navItems = useMemo(() => {
        if (isConfigRoute) {
            return [];
        }

        const enterpriseChildren: NavItem[] = [];
        const stack: { level: number; item: NavItem }[] = [];

        for (const node of hierarchy) {
            let navItem: NavItem;
            if (node.level === 0) {
                navItem = { name: node.name, path: "", icon: <Factory size={22} />, children: [] };
                enterpriseChildren.push(navItem);
                stack[0] = { level: 0, item: navItem };
                stack.length = 1;
            } else {
                const parent = stack.slice().reverse().find(s => s.level < node.level)?.item;
                if (parent) {
                    navItem = { name: node.name, path: "", children: [] };
                    if (!parent.children) parent.children = [];
                    parent.children.push(navItem);
                    stack[node.level] = { level: node.level, item: navItem };
                    stack.length = node.level + 1;
                }
            }
        }

        // Post-process to assign real router paths to leaf nodes, and anchor hashes to parents
        const assignPaths = (items: NavItem[], currentPath: string) => {
            for (const item of items) {
                const urlPart = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const fullPath = `${currentPath}/${urlPart}`;

                if (item.children && item.children.length > 0) {
                    item.path = `#${urlPart}`; // accordion parent
                    assignPaths(item.children, fullPath);
                } else {
                    item.path = fullPath; // actual route
                }
            }
        };

        assignPaths(enterpriseChildren, ""); // The top level plant will be e.g. /plant-1

        return [
            { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
            {
                name: "Enterprise", path: "#enterprise", icon: <Building2 size={22} />,
                children: enterpriseChildren
            }
        ];
    }, [hierarchy, isConfigRoute]);

    // We've moved Configuration out of the standard sidebar Admin section
    const adminNavItems: NavItem[] = useMemo(() => {
        if (isConfigRoute) {
            return [
                { name: "Hierarchy", path: "/configuration?tab=hierarchy", icon: <GitBranch size={22} /> },
                { name: "Settings", path: "/configuration?tab=general", icon: <Settings size={22} /> }
            ];
        }

        return [
            { name: "User Config", path: "/user-config", icon: <Users size={22} /> },
            { name: "Settings", path: "/settings", icon: <Settings size={22} /> },
            { name: "About", path: "/about", icon: <Info size={22} /> },
        ];
    }, [isConfigRoute]);

    // Automatically expand the parents mapping to the active route
    React.useEffect(() => {
        const expandPath = (items: NavItem[], path: string): boolean => {
            let found = false;
            for (const item of items) {
                if (item.path === path) return true; // Found active child
                if (item.children) {
                    if (expandPath(item.children, path)) {
                        setExpandedNodes(prev => ({ ...prev, [item.path]: true }));
                        found = true;
                    }
                }
            }
            return found;
        };

        expandPath(navItems, location.pathname);
        expandPath(adminNavItems, location.pathname);
    }, [location.pathname, navItems, adminNavItems]);

    const renderNavItem = (item: NavItem, depth: number = 0) => {
        const isExactActive = item.path.includes("?")
            ? (location.pathname + location.search) === item.path || (location.pathname === item.path.split("?")[0] && location.search === "" && item.path.includes("hierarchy"))
            : location.pathname === item.path;

        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedNodes[item.path];

        if (hasChildren) {
            return (
                <React.Fragment key={item.path}>
                    <button
                        onClick={() => setExpandedNodes((p) => ({ ...p, [item.path]: !p[item.path] }))}
                        title={collapsed ? item.name : ""}
                        className={`w-full flex items-center justify-between text-sm font-normal rounded-none transition-all duration-200 outline-none hover:bg-gray-800 ${depth === 0 ? "px-4 py-3" : "py-2.5"}`}
                        style={depth > 0 ? { paddingLeft: `${16 + depth * 18}px`, paddingRight: "16px" } : {}}
                    >
                        <div className="flex items-center gap-3 text-gray-200">
                            {item.icon && React.isValidElement(item.icon)
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                ? React.cloneElement(item.icon as React.ReactElement<any>, { size: depth === 0 ? 22 : 16 })
                                : null}
                            {!item.icon && depth > 0 && <span className="w-2" />}
                            {!collapsed && <span className={depth > 0 ? "text-[13.5px] text-gray-300" : ""}>{item.name}</span>}
                        </div>
                        {!collapsed && (
                            <div className="text-gray-400">
                                {isExpanded ? <Minus size={15} /> : <Plus size={15} />}
                            </div>
                        )}
                    </button>
                    {isExpanded && !collapsed && (
                        <div className={depth === 0 ? "bg-gray-950/40 pb-1" : ""}>
                            {item.children!.map(child => renderNavItem(child, depth + 1))}
                        </div>
                    )}
                </React.Fragment>
            );
        }

        return (
            <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : ""}
                className={`flex items-center gap-3 text-sm font-normal rounded-none transition-all duration-200 no-underline hover:no-underline hover:bg-gray-800
                    ${isExactActive
                        ? (depth === 0 ? "bg-gray-700 text-white border-l-[5px] border-[#0066A1]" : "text-white bg-gray-800/60 border-l-[3px] border-[#0066A1]")
                        : (depth === 0 ? "text-gray-200 border-l-[3px] border-transparent" : "text-gray-400 border-l-[3px] border-transparent")
                    }
                    ${depth === 0 ? "px-4 py-3" : "py-2.5"}
                `}
                style={depth > 0 ? { paddingLeft: `${16 + depth * 18}px`, paddingRight: "16px" } : {}}
            >
                {item.icon && React.isValidElement(item.icon)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? React.cloneElement(item.icon as React.ReactElement<any>, { size: depth === 0 ? 22 : 16 })
                    : null}
                {!item.icon && depth > 0 && (
                    <span className="w-2" />
                )}
                {!collapsed && <span className={depth > 0 ? `text-[13px] ${isExactActive ? "font-medium" : ""}` : ""}>{item.name}</span>}
            </Link>
        );
    };

    return (
        <aside
            className={`${collapsed ? "w-16" : "w-64"} h-screen bg-gray-900 text-gray-200 flex flex-col justify-between transition-all duration-300 overflow-y-auto custom-scrollbar`}
        >
            {/* Top Section */}
            <div>
                {/* Header section showing version info and collapse/expand button */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                    {!collapsed && (
                        <span className="text-sm font-normal text-white tracking-wide mt-1">
                            Version 1.0.0
                        </span>
                    )}

                    <button
                        onClick={() => setCollapsed((v) => !v)}
                        className="text-gray-400 hover:text-white mt-1"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <Menu size={26} /> : <X size={26} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="mt-2 flex flex-col">
                    {navItems.map(item => renderNavItem(item, 0))}

                    <div className="border-t border-gray-700 my-2 mx-3" />

                    {/* Admin Nav Items */}
                    {adminNavItems.map(item => renderNavItem(item, 0))}
                </nav>
            </div>

            {/* Bottom Section - Sign Out */}
            <div className="border-t border-gray-700">
                <button
                    onClick={() => setShowDialog(true)}
                    title={collapsed ? "Sign Out" : ""}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-normal text-gray-200 hover:bg-gray-800 text-left"
                >
                    <LogOut size={22} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {showDialog && (
                    <ConfirmDialog
                        message="You are signing-out now, please confirm to proceed."
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
