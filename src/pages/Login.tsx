/**
 * src/pages/Login.tsx
 * -----------------------------------------------------------------------------
 * Responsibility:
 * - Render a username/password login screen (white screen template).
 * - Call AuthProvider.signIn() using BPV credentials.
 * - Show a global loading overlay via UIProvider during network calls.
 * - Navigate to /dashboard on success.
 *
 * Notes:
 * - This file does NOT manage tokens directly.
 * - Token storage + refresh scheduling are owned by AuthProvider.
 */
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import CommonHeader from "../components/CommonHeader";
import Footer from "../components/Footer";
import { UIContext } from "../context/UIProvider";
import { useAuth } from "../auth/useAuth";

const Login: React.FC = () => {
    // -----------------------------
    // Local form state
    // -----------------------------
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // -----------------------------
    // External dependencies
    // -----------------------------
    const auth = useAuth();       // AuthProvider (OAuth2 login + refresh scheduler)
    const ui = useContext(UIContext); // Global loader overlay
    const navigate = useNavigate();

    /**
     * Handle form submit:
     * - Runs OAuth2 login using AuthProvider.signIn()
     * - Navigates to /dashboard if login is successful
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ui) {
            toast.error("UI provider is not configured.");
            return;
        }
        if (!auth) {
            toast.error("Auth provider is not configured.");
            return;
        }

        const u = username.trim();
        if (!u || !password) {
            toast.error("Please enter username and password.");
            return;
        }

        try {
            ui.setLoading(true, "Signing in...");
            await auth.signIn(u, password);

            toast.success("Login successful!");
            navigate("/landing", { replace: true });
        } catch (err) {
            // Keep message user-friendly; log details for developers.
            console.error("Login failed:", err);
            toast.error("Invalid username or password");
        } finally {
            ui.setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col h-screen w-screen bg-white overflow-hidden">
            {/* Common header */}
            <div className="mt-[7px]">
                <CommonHeader />
            </div>

            {/* Decorative background layer */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/login_bkg.jpg')",
                    opacity: 0.3,
                    filter: "brightness(0.8)",
                    zIndex: 0,
                }}
            />

            {/* Centered login form */}
            <div className="flex flex-1 items-center justify-center relative z-10">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white px-8 pt-4 pb-8 rounded-lg shadow-lg w-96"
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-2 mt-0">
                        <img src="/login.png" alt="Login" className="w-16 h-16 opacity-90" />
                    </div>

                    {/* Username / Password */}
                    <div className="login-page">
                        <input
                            className="input-field mb-4"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />

                        <input
                            className="input-field mb-6"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit */}
                    <div className="login-page">
                        <button type="submit" className="btn-primary w-full">
                            Login
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Login;
