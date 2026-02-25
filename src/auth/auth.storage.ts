/**
 * src/auth/auth.storage.ts
 * Session persistence helpers.
 */

const STORAGE_KEY = "bpv_session";

type SessionData = {
    username: string;
    refreshToken: string;
    tenantCode: string;
};

export function saveSession(username: string, refreshToken: string, tenantCode: string): void {
    const data: SessionData = { username, refreshToken, tenantCode };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadSession(): SessionData | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as SessionData;
    } catch {
        return null;
    }
}

export function clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}
