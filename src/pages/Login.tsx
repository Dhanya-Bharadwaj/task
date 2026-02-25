/**
 * src/pages/Login.tsx
 * BPV Login — animated glassmorphism design.
 */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UIContext } from "../context/UIProvider";
import { useAuth } from "../auth/useAuth";
import { Activity, Lock, User } from "lucide-react";

/* ── Animated background orbs ── */
const orbs = [
    { w: 420, h: 420, top: "-10%", left: "-8%", bg: "radial-gradient(circle, rgba(0,102,161,0.35) 0%, transparent 70%)", dur: "10s" },
    { w: 320, h: 320, top: "60%", left: "75%", bg: "radial-gradient(circle, rgba(0,102,161,0.25) 0%, transparent 70%)", dur: "13s" },
    { w: 260, h: 260, top: "40%", left: "20%", bg: "radial-gradient(circle, rgba(0,80,130,0.18) 0%, transparent 70%)", dur: "9s" },
    { w: 180, h: 180, top: "10%", left: "65%", bg: "radial-gradient(circle, rgba(0,60,100,0.22) 0%, transparent 70%)", dur: "15s" },
];

/* ── Live Ticker items ── */
const ticker = [
    "Line A — OEE: 82.4%",
    "Line B — OEE: 78.6%",
    "Line C — OEE: 88.2%",
    "Shift Target: 400 pcs | Actual: 363 pcs",
    "Total Downtime: 52 min",
    "Quality Rate: 97.8%",
];

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tickerIdx, setTickerIdx] = useState(0);
    const [tickerFade, setTickerFade] = useState(true);
    const [inputFocus, setInputFocus] = useState<"user" | "pass" | null>(null);

    const auth = useAuth();
    const ui = useContext(UIContext);
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement>(null);

    /* Live ticker rotation */
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerFade(false);
            setTimeout(() => {
                setTickerIdx((i) => (i + 1) % ticker.length);
                setTickerFade(true);
            }, 400);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ui || !auth) return;
        const u = username.trim();
        if (!u || !password) { toast.error("Please enter username and password."); return; }
        try {
            ui.setLoading(true, "Signing in…");
            await auth.signIn(u, password);
            toast.success("Login successful!");
            navigate("/dashboard", { replace: true });
        } catch {
            toast.error("Invalid username or password");
        } finally {
            ui.setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col h-screen w-screen overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2440 40%, #0a1e36 70%, #061524 100%)" }}>

            {/* Bosch Supergraphic top stripe */}
            <img src="/Bosch-Supergraphic_RGB.svg" alt=""
                className="fixed top-0 left-0 w-screen" style={{ height: "7px", objectFit: "cover", zIndex: 50 }} />

            {/* Background Orbs */}
            {orbs.map((o, i) => (
                <div key={i} className="orb absolute rounded-full pointer-events-none"
                    style={{ width: o.w, height: o.h, top: o.top, left: o.left, background: o.bg, "--dur": o.dur } as React.CSSProperties} />
            ))}

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "linear-gradient(rgba(0,102,161,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,161,0.06) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />

            {/* Floating stat badges */}
            <div className="absolute top-24 right-12 hidden lg:flex flex-col gap-3 animate-fadeIn-d3 pointer-events-none">
                {[
                    { label: "OEE", val: "82.4%", color: "#22d3ee" },
                    { label: "Avail", val: "91.2%", color: "#4ade80" },
                    { label: "Perf", val: "88.5%", color: "#a78bfa" },
                    { label: "Qual", val: "97.8%", color: "#fb923c" },
                ].map((b) => (
                    <div key={b.label} className="glass-card rounded-lg px-4 py-2 flex items-center gap-3"
                        style={{ boxShadow: `0 0 12px ${b.color}33` }}>
                        <span className="text-xs text-gray-400 w-10">{b.label}</span>
                        <span className="text-base font-bold" style={{ color: b.color }}>{b.val}</span>
                    </div>
                ))}
            </div>

            {/* Left decorative panel */}
            <div className="absolute left-8 bottom-24 hidden lg:block animate-fadeIn-d2 pointer-events-none">
                <div className="glass-card rounded-xl p-5 w-64" style={{ boxShadow: "0 0 30px rgba(0,102,161,0.2)" }}>
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-widest">Live Production</p>
                    {[
                        { line: "Line A", pct: 91 },
                        { line: "Line B", pct: 74 },
                        { line: "Line C", pct: 96 },
                    ].map((r) => (
                        <div key={r.line} className="mb-2">
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-300">{r.line}</span>
                                <span className="text-cyan-400 font-semibold">{r.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full animate-progress"
                                    style={{ width: `${r.pct}%`, background: r.pct > 85 ? "#22d3ee" : r.pct > 70 ? "#facc15" : "#f87171" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Center Login Card */}
            <div className="flex flex-1 items-center justify-center relative z-10 px-4">
                <div className="glass-card rounded-2xl shadow-2xl w-full max-w-sm px-8 pt-8 pb-8 animate-scaleIn"
                    style={{ boxShadow: "0 8px 64px rgba(0,102,161,0.35), 0 0 0 1px rgba(255,255,255,0.12)" }}>

                    {/* Logo + Title */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 animate-float"
                            style={{ background: "linear-gradient(135deg, #0066a1, #004f7c)", boxShadow: "0 8px 24px rgba(0,102,161,0.45)" }}>
                            <Activity size={30} className="text-white" />
                        </div>
                        <img src="/bosch_logo.png" alt="Bosch" className="h-7 w-auto object-contain mb-2" />
                        <h1 className="text-base font-bold text-gray-800 text-center leading-tight">
                            Bosch Production Visualizer
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">Real-Time OEE & Production KPI</p>
                    </div>

                    {/* Form */}
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                        {/* Username */}
                        <div className={`relative transition-all duration-200 ${inputFocus === "user" ? "scale-[1.01]" : ""}`}>
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <input
                                className="input-field pl-9"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setInputFocus("user")}
                                onBlur={() => setInputFocus(null)}
                                autoComplete="username"
                                style={{
                                    height: 42, fontSize: "0.9rem",
                                    boxShadow: inputFocus === "user" ? "0 0 0 3px rgba(0,102,161,0.18)" : ""
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div className={`relative transition-all duration-200 ${inputFocus === "pass" ? "scale-[1.01]" : ""}`}>
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                            <input
                                className="input-field pl-9"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setInputFocus("pass")}
                                onBlur={() => setInputFocus(null)}
                                autoComplete="current-password"
                                style={{
                                    height: 42, fontSize: "0.9rem",
                                    boxShadow: inputFocus === "pass" ? "0 0 0 3px rgba(0,102,161,0.18)" : ""
                                }}
                            />
                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            className="w-full text-white font-semibold py-2.5 rounded-lg mt-1 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,102,161,0.5)] active:scale-[0.98]"
                            style={{
                                height: 44,
                                background: "linear-gradient(135deg, #0066a1 0%, #004b78 100%)",
                                fontSize: "0.92rem",
                            }}
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Live ticker */}
                    <div className="mt-5 pt-4 border-t border-gray-200">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Live Status</p>
                        <p className={`text-xs font-medium text-[#0066a1] transition-opacity duration-300 ${tickerFade ? "opacity-100" : "opacity-0"}`}>
                            ● {ticker[tickerIdx]}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 text-center pb-3 text-[11px] text-gray-500">
                © Bosch SDS/MFG 2026, all rights reserved. | BPV v1.0.0
            </div>
        </div>
    );
};

export default Login;
