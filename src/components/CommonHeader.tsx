/**
 * src/components/CommonHeader.tsx
 * BPV animated header with live clock and notification badge.
 */
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { Clock, Bell, Wifi } from "lucide-react";

const CommonHeader: React.FC = () => {
    const auth = useAuth();
    const [time, setTime] = useState(new Date());
    const [ping, setPing] = useState(false);

    /* Live clock */
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    /* Notification ping every 90s */
    useEffect(() => {
        const p = setInterval(() => {
            setPing(true);
            setTimeout(() => setPing(false), 2500);
        }, 90000);
        return () => clearInterval(p);
    }, []);

    const hhmm = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const date = time.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

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

                {/* Right: Status + Clock + Welcome + Logo */}
                <div className="flex items-center gap-5">

                    {/* Live indicator */}
                    <div className="hidden md:flex items-center gap-1.5">
                        <span className="andon-pulse-green w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className="text-xs text-gray-400 font-medium">Live</span>
                        <Wifi size={12} className="text-green-500 ml-0.5" />
                    </div>

                    {/* Clock */}
                    <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1">
                        <Clock size={13} className="text-[#0066a1]" />
                        <div className="text-right">
                            <div className="text-xs font-bold text-gray-700 tabular-nums leading-none">{hhmm}</div>
                            <div className="text-[9px] text-gray-400 leading-none mt-0.5">{date}</div>
                        </div>
                    </div>

                    {/* Notification bell */}
                    <div className="relative cursor-pointer group">
                        <Bell size={18} className="text-gray-500 group-hover:text-[#0066a1] transition-colors" />
                        {ping && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-heartbeat" />
                        )}
                    </div>

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
