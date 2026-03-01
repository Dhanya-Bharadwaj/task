/**
 * src/pages/PlantDashboard.tsx
 * Dynamic user-customizable dashboard using existing BPV template styles and components.
 */
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import KpiCard from "../components/KpiCard";
import { AlertCircle, Plus, X, BarChart2, Activity, Settings, TrendingUp, CheckCircle2, Trash2, ShieldCheck, Clock } from "lucide-react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

/* --- Dummy Chart Configurations --- */
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#fff' } },
    scales: {
        x: { grid: { display: false }, ticks: { color: "#6b7280", font: { size: 11 } } },
        y: { grid: { color: "#f3f4f6" }, ticks: { color: "#6b7280", font: { size: 11 } } },
    }
};

const top5Data = {
    labels: ["P11-Area", "tess", "Line A", "Line B", "Line C"],
    datasets: [{
        label: "Availability %",
        data: [60, 40, 85, 70, 90],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "#0066A1"); // Bosch Blue
            gradient.addColorStop(1, "#60A5FA"); // Light Blue
            return gradient;
        },
        borderRadius: 4,
        barPercentage: 0.5,
    }],
};

const waveData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    datasets: [{
        label: "Trend",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: "rgba(0, 102, 161, 0.1)",
        borderColor: "#0066A1",
        tension: 0.4,
    }]
};

const AVAILABLE_OPT_GRAPHS = [
    { id: "oee", title: "OEE Trend", type: "wave", icon: <Activity size={18} /> },
    { id: "quality", title: "Quality Trend", type: "wave", icon: <ShieldCheck size={18} /> },
    { id: "performance", title: "Performance Trend", type: "wave", icon: <TrendingUp size={18} /> },
    { id: "availability", title: "Availability/Down Time", type: "bars", icon: <Clock size={18} /> },
    { id: "production", title: "Production Trend", type: "bars", icon: <BarChart2 size={18} /> },
];

const PlantDashboard: React.FC = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumb = pathSegments.map(s => s.replace(/-/g, ' ')).join(' / ').toUpperCase();
    const currentPlantName = pathSegments[0]?.replace(/-/g, ' ') || "Plant2";

    // Allow multiple graphs on the dashboard
    const [activeGraphIds, setActiveGraphIds] = useState<string[]>(["availability"]);
    const [showChartMenu, setShowChartMenu] = useState(false);
    const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

    const handleOpenModal = () => {
        setSelectedGraphId(null);
        setShowChartMenu(true);
    };

    const handleSaveChart = () => {
        if (selectedGraphId && !activeGraphIds.includes(selectedGraphId)) {
            setActiveGraphIds([...activeGraphIds, selectedGraphId]);
        }
        setShowChartMenu(false);
    };

    const removeGraph = (idToRemove: string) => {
        setActiveGraphIds(activeGraphIds.filter(id => id !== idToRemove));
    };

    return (
        <MainLayout>
            {/* Soft gray background matching Home.tsx, typical scrolling layout */}
            <div className="bg-[#f9fafb] min-h-[calc(100vh-87px)] p-6 font-sans text-gray-800">

                {/* --- HEADER --- */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="text-xs font-bold text-[#0066A1] tracking-wider mb-1">
                            {breadcrumb || "PLANT DASHBOARD"}
                        </div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-gray-800 capitalize">{currentPlantName}</h2>
                            <div className="flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full shadow-sm">
                                <span className="block w-2 h-2 bg-[#0066A1] rounded-full animate-pulse" />
                                Shift 3 (10:00 PM - 06:00 AM)
                            </div>
                        </div>
                    </div>

                    {/* Add Graph Button in Header */}
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-[#0066A1] hover:bg-[#005282] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} /> Add Graph
                    </button>
                </div>

                {/* --- RED ALERT BAR --- */}
                <div className="flex items-center justify-between bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded shadow-sm mb-6">
                    <div className="flex items-center gap-3 text-red-700 font-semibold text-sm">
                        <AlertCircle size={20} />
                        <span>Alert: 2 machines are currently experiencing breakdown (P11-Area)</span>
                    </div>
                </div>

                {/* --- MAIN GRID LAYOUT --- */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                    {/* Left Side: KPIs and Charts (Spans 3 cols) */}
                    <div className="xl:col-span-3 flex flex-col gap-6">

                        {/* KPI Cards Row (Using existing KpiCard component for perfect template match) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KpiCard
                                label="Overall Equipment Effectiveness"
                                value={90} unit="%"
                                icon={<Activity size={24} />}
                                target={100}
                                delay={100}
                                sub="Target: 95%"
                                subColor="#10b981"
                            />
                            <KpiCard
                                label="Production Yield"
                                value={94.5} unit="%"
                                icon={<ShieldCheck size={24} />}
                                target={100}
                                delay={200}
                                sub="Target: 98%"
                                subColor="#10b981"
                            />
                            <KpiCard
                                label="Average Cycle Time"
                                value={42} unit="s"
                                icon={<Clock size={24} />}
                                target={45}
                                delay={300}
                                sub="Target: < 45s"
                                subColor="#3b82f6"
                            />
                        </div>

                        {/* Rendering Active Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeGraphIds.map(graphId => {
                                const gDef = AVAILABLE_OPT_GRAPHS.find(g => g.id === graphId);
                                if (!gDef) return null;

                                return (
                                    <div key={graphId} className="bg-white border border-gray-100 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 relative group animate-slideUp">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-50 text-[#0066A1] rounded-md">
                                                    {gDef.icon}
                                                </div>
                                                <h3 className="font-bold text-gray-800">{gDef.title}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeGraph(graphId)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Remove Chart"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="h-64 w-full">
                                            {gDef.type === "wave" ? (
                                                <Line data={waveData} options={chartOptions} />
                                            ) : (
                                                <Bar data={top5Data} options={chartOptions} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty state if no graphs */}
                            {activeGraphIds.length === 0 && (
                                <div className="lg:col-span-2 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-12 text-gray-500">
                                    <BarChart2 size={48} className="mb-4 text-gray-300" />
                                    <p className="font-medium text-lg">No charts added yet</p>
                                    <p className="text-sm mb-4">Click "Add Graph" to customize your dashboard view</p>
                                    <button onClick={handleOpenModal} className="text-[#0066A1] font-bold hover:underline">
                                        + Add a graph now
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Side: Summary Column (Spans 1 col) */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        {/* Today's Summary Card */}
                        <div className="bg-white border border-gray-100 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-800 text-lg">Today's Summary</h3>
                            </div>

                            <div className="flex flex-col items-center mb-8 relative">
                                <div className="w-40 h-40 relative flex items-center justify-center">
                                    <Doughnut
                                        data={{
                                            datasets: [{
                                                data: [90, 10],
                                                backgroundColor: ["#0066A1", "#f3f4f6"],
                                                borderWidth: 0,
                                                borderRadius: 5
                                            }]
                                        }}
                                        options={{ cutout: "80%", responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="text-3xl font-black text-gray-800">90<span className="text-lg text-gray-500">%</span></div>
                                        <div className="text-xs font-bold text-gray-400 uppercase mt-1">OEE</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm text-green-600"><Settings size={16} /></div>
                                        <div className="text-sm font-semibold text-gray-600">Availability</div>
                                    </div>
                                    <div className="font-bold text-gray-800">91.6%</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm text-blue-600"><Activity size={16} /></div>
                                        <div className="text-sm font-semibold text-gray-600">Performance</div>
                                    </div>
                                    <div className="font-bold text-gray-800">89.2%</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm text-purple-600"><ShieldCheck size={16} /></div>
                                        <div className="text-sm font-semibold text-gray-600">Quality</div>
                                    </div>
                                    <div className="font-bold text-gray-800">98.1%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* --- ADD CHART MODAL --- */}
            {showChartMenu && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl w-[700px] max-w-full overflow-hidden flex flex-col border border-gray-200" style={{ animation: "slideUp 0.3s ease-out" }}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-gray-800 text-xl font-bold">Add Graph to Dashboard</h2>
                            <button onClick={() => setShowChartMenu(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {AVAILABLE_OPT_GRAPHS.map((graph) => {
                                    const isSelected = selectedGraphId === graph.id;
                                    const isAlreadyAdded = activeGraphIds.includes(graph.id);

                                    return (
                                        <div
                                            key={graph.id}
                                            onClick={() => !isAlreadyAdded && setSelectedGraphId(graph.id)}
                                            className={`bg-white rounded-lg border-2 p-4 h-[120px] relative flex flex-col justify-between transition-all duration-200 
                                                ${isAlreadyAdded ? 'opacity-50 cursor-not-allowed border-gray-200' :
                                                    isSelected ? 'border-[#0066A1] shadow-md bg-blue-50/20 cursor-pointer' :
                                                        'border-gray-100 hover:border-blue-300 cursor-pointer shadow-sm'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-[#0066A1] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {graph.icon}
                                                </div>
                                                {isSelected && <CheckCircle2 size={18} className="text-[#0066A1] fill-blue-100" />}
                                                {isAlreadyAdded && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">ADDED</span>}
                                            </div>

                                            <span className="text-sm font-bold text-gray-700 leading-tight">{graph.title}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-5 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setShowChartMenu(false)}
                                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 text-sm font-bold rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChart}
                                disabled={!selectedGraphId}
                                className="px-6 py-2.5 bg-[#0066A1] text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-[#005282] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Plus size={16} /> Add Graph
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default PlantDashboard;
