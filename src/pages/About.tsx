/**
 * src/pages/About.tsx
 * About page for BPV.
 */
import React from "react";
import MainLayout from "../layout/MainLayout";

const About: React.FC = () => {
    return (
        <MainLayout>
            <div className="flex flex-col p-4 space-y-4">
                <h3 className="page-title text-xl font-semibold text-gray-800">About — Bosch Production Visualizer</h3>

                <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 max-w-2xl space-y-4">
                    <div className="flex items-start gap-4">
                        <img src="/bosch_logo.png" alt="Bosch Logo" className="h-10 w-auto object-contain" />
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">Bosch Production Visualizer (BPV)</h2>
                            <p className="text-xs text-gray-500">Version 1.0.0 | RBEI — SDS/MFG</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Purpose</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            BPV provides real-time production KPIs for manufacturing operations. It computes real-time OEE
                            and provides ANDONs which can be viewed Station-wise or Line-wise. Losses entry can also be made
                            manually in standard formats.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Scope of Features</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                            <li>Multiple ANDONs — Day and Shift</li>
                            <li>Standard Dashboards — Line-wise and Machine-wise</li>
                            <li>Hourly Production Tracking</li>
                            <li>OEE Analysis (Availability, Performance, Quality)</li>
                            <li>Option to manually enter Quality and Losses data</li>
                            <li>Cycle Time trends</li>
                            <li>Web-based reports with export</li>
                            <li>Production Losses tracking</li>
                            <li>Configuration screens with access control</li>
                            <li>Data stored in SQL database</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700">Technology</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Frontend: React + TypeScript + Vite</div>
                            <div>Styling: TailwindCSS</div>
                            <div>Charts: Chart.js + react-chartjs-2</div>
                            <div>Backend: Python FastAPI (planned)</div>
                            <div>Database: PostgreSQL / SQL Server</div>
                            <div>Auth: OAuth2 Bearer Token</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-700">Contact</h4>
                        <p className="text-sm text-gray-600">Robert Bosch Engineering and Business Solutions (RBEI)</p>
                        <p className="text-sm text-gray-600">Centre of Competency — Manufacturing IT</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default About;
