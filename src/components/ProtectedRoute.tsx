/**
 * src/components/ProtectedRoute.tsx
 * Guards routes requiring authentication.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
    const auth = useAuth();

    if (auth?.isBootstrapping) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!auth?.accessToken) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
