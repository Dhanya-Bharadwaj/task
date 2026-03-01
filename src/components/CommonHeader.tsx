/**
 * src/components/CommonHeader.tsx
 * BPV animated header with live clock and notification badge.
 */
import React from "react";
import { useAuth } from "../auth/useAuth";
import { LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommonHeader: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    return (
        <>
            {/* Bosch Supergraphic */}
            <img src="/Bosch-Supergraphic_RGB.svg" alt=""
                className="fixed top-0 left-0 w-screen"
                style={{ height: "7px", objectFit: "cover", zIndex: 50 }} />

            {/* Header */}
            <header
                className="flex justify-between items-center px-5 bg-white text-gray-800 border-b border-gray-200 z-10 relative"
                style={{ height: "56px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>

                {/* Left: Module title */}
                <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(to bottom, #0066a1, #00a0dc)" }} />
                    <div>
                        <div className="text-base font-bold text-gray-800 leading-tight tracking-tight">
                            Bosch Production Visualizer
                        </div>
                        <div className="text-[10px] text-gray-400 leading-none tracking-wide">
                            Real-Time OEE & Production KPI
                        </div>
                    </div>
                </div>

                {/* Right: Welcome + Logo */}
                <div className="flex items-center gap-5">

                    {/* Modules Menu */}
                    <button
                        onClick={() => navigate("/landing")}
                        className="relative cursor-pointer group flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Go to Modules"
                    >
                        <LayoutGrid size={20} className="text-gray-500 group-hover:text-[#0066a1] transition-colors" />
                    </button>

                    {/* Welcome */}
                    {auth?.user && (
                        <div className="hidden md:flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg,#0066a1,#00a0dc)" }}>
                                {auth.user.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">
                                {auth.user}
                            </span>
                        </div>
                    )}

                    {/* Bosch Logo */}
                    <img src="/bosch_logo.png" alt="Bosch"
                        className="h-7 w-auto object-contain" />
                </div>
            </header>
        </>
    );
};

export default CommonHeader;
