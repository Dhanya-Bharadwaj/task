/**
 * src/pages/Landing.tsx
 * -----------------------------------------------------------------------------
 * Responsibility:
 * - Application gateway/landing page (INDUS 4.0).
 * - Displays 5 module cards.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Factory,
    Activity,
    CheckCircle,
    FileText,
    Wrench,
} from "lucide-react";

type ModuleCard = {
    title: string;
    icon: React.ReactNode;
    path: string;
};

const Landing: React.FC = () => {
    const navigate = useNavigate();

    const cards: ModuleCard[] = [
        { title: "Plant Configuration", icon: <Factory size={28} />, path: "/configuration" },
        { title: "Production Visualizer", icon: <Activity size={28} />, path: "/dashboard" },
        { title: "Quality Assistance", icon: <CheckCircle size={28} />, path: "#" },
        { title: "Reports", icon: <FileText size={28} />, path: "#" },
        { title: "Maintenance", icon: <Wrench size={28} />, path: "#" },
    ];

    const handleCardClick = (path: string) => {
        if (path !== "#") {
            navigate(path);
        } else {
            alert("Module coming soon");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative">
            {/* Top Banner indicating Bosch theme */}
            <div className="absolute top-0 left-0 w-full h-2" style={{ background: "linear-gradient(90deg, #0066a1, #00a0dc, #0066a1)" }} />

            <div className="max-w-5xl w-full text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">INDUS 4.0</h1>
                <p className="text-sm text-gray-500 font-medium tracking-wide">
                    DESIGNED AND DEVELOPED BY BOSCH
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 w-full max-w-[720px]">
                {cards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => handleCardClick(card.path)}
                        className="group flex flex-col items-center justify-center w-full sm:w-48 md:w-52 h-48 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200"
                    >
                        <div className="text-gray-500 group-hover:text-[#0066a1] transition-colors duration-200 mb-4 transform group-hover:scale-110">
                            {card.icon}
                        </div>
                        <div className="text-sm font-semibold text-gray-800 text-center px-4 leading-tight group-hover:text-[#0066a1] transition-colors duration-200">
                            {card.title}
                        </div>
                    </button>
                ))}
            </div>

            {/* Footer Logo */}
            <div className="absolute bottom-8 flex justify-center w-full">
                <img src="/bosch_logo.png" alt="Bosch" className="h-6 w-auto object-contain opacity-70" />
            </div>
        </div>
    );
};

export default Landing;
