/**
 * src/components/Footer.tsx
 * Animated application footer.
 */
import React from "react";

const Footer: React.FC = () => {
    return (
        <footer
            className="flex items-center justify-between px-4 bg-white text-gray-400 border-t border-gray-100 text-xs z-10"
            style={{
                height: "28px",
                boxShadow: "0 -1px 0 rgba(0,0,0,0.04)",
            }}
        >
            <div className="flex items-center gap-2">
                <span className="andon-pulse-green w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                <span>System Online</span>
            </div>
            <span>© Bosch SDS/MFG 2026, all rights reserved. · Bosch Production Visualizer v1.0.0</span>
            <span className="text-gray-300">BPV | RBEI</span>
        </footer>
    );
};

export default Footer;
