/**
 * src/api/auth.api.ts
 * Authentication API calls.
 */
import { http } from "./http";

export type TokenResponse = {
    access_token: string;
    refresh_token: string;
    tenant_code: string;
};

export async function loginApi(username: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");

    const res = await http.post<TokenResponse>("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
}

export async function refreshApi(refreshToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams();
    params.append("refresh_token", refreshToken);
    params.append("grant_type", "refresh_token");

    const res = await http.post<TokenResponse>("/auth/refresh", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
}
