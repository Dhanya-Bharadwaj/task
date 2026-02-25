/**
 * src/context/UIProvider.tsx
 * Global loading overlay.
 */
import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type UIContextType = {
    loading: boolean;
    loadingMessage?: string;
    setLoading: (value: boolean, message?: string) => void;
    showLoader: (message?: string) => void;
    hideLoader: () => void;
};

export const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoadingState] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);

    const setLoading = useCallback((value: boolean, message?: string) => {
        setLoadingState(value);
        if (value) {
            setLoadingMessage(message);
        } else {
            setLoadingMessage(undefined);
        }
    }, []);

    const showLoader = useCallback((message?: string) => setLoading(true, message), [setLoading]);
    const hideLoader = useCallback(() => setLoading(false), [setLoading]);

    const contextValue = useMemo<UIContextType>(
        () => ({ loading, loadingMessage, setLoading, showLoader, hideLoader }),
        [loading, loadingMessage, setLoading, showLoader, hideLoader]
    );

    return (
        <UIContext.Provider value={contextValue}>
            {children}
            {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    {loadingMessage && (
                        <div className="mt-3 text-sm text-white">{loadingMessage}</div>
                    )}
                </div>
            )}
        </UIContext.Provider>
    );
};
