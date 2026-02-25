/**
 * src/context/AuthProvider.tsx
 * Owns authentication state for the BPV web app.
 * For demo purposes, accepts any non-empty username/password.
 */
import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import { clearSession, loadSession, saveSession } from "../auth/auth.storage";

export type AuthContextType = {
    user: string | null;
    tenantCode: string | null;
    accessToken: string | null;
    isBootstrapping: boolean;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [tenantCode, setTenantCode] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const refreshTimerRef = useRef<number | null>(null);

    function clearRefreshTimer() {
        if (refreshTimerRef.current) {
            window.clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }

    async function signIn(username: string, _password: string) {
        // Demo: accept any credentials
        const fakeToken = btoa(JSON.stringify({ sub: username, exp: Math.floor(Date.now() / 1000) + 3600 }));
        const tokenStr = `header.${fakeToken}.sig`;
        setUser(username);
        setTenantCode("BPV");
        setAccessToken(tokenStr);
        saveSession(username, "demo-refresh-token", "BPV");
    }

    function signOut() {
        clearRefreshTimer();
        setUser(null);
        setTenantCode(null);
        setAccessToken(null);
        clearSession();
    }

    useEffect(() => {
        const existing = loadSession();
        if (!existing) {
            setIsBootstrapping(false);
            return;
        }
        setUser(existing.username);
        setTenantCode(existing.tenantCode);
        setAccessToken("restored-token");
        setIsBootstrapping(false);
    }, []);

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            tenantCode,
            accessToken,
            isBootstrapping,
            signIn,
            signOut,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user, tenantCode, accessToken, isBootstrapping]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
