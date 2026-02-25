/**
 * src/auth/token.utils.ts
 * JWT token utilities.
 */

export function computeRefreshDelayMs(accessToken: string): number | null {
    try {
        const parts = accessToken.split(".");
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload.exp;
        if (!exp) return null;
        const nowMs = Date.now();
        const expMs = exp * 1000;
        const oneMinuteMs = 60 * 1000;
        const delayMs = expMs - nowMs - oneMinuteMs;
        return delayMs > 0 ? delayMs : null;
    } catch {
        return null;
    }
}
