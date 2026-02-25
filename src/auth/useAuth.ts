/**
 * src/auth/useAuth.ts
 * Hook to access AuthContext.
 */
import { useContext } from "react";
import type { AuthContextType } from "../context/AuthProvider";
import { AuthContext } from "../context/AuthProvider";

export function useAuth(): AuthContextType | null {
    return useContext(AuthContext);
}
