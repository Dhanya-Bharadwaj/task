/**
 * src/App.tsx
 * Application routing for BPV.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import BPVDashboard from "./pages/BPVDashboard";
import Home from "./pages/Home";
import LineDashboard from "./pages/LineDashboard";
import MachineDashboard from "./pages/MachineDashboard";
import OEEAnalysis from "./pages/OEEAnalysis";
import HourlyProduction from "./pages/HourlyProduction";
import LossesEntry from "./pages/LossesEntry";
import Reports from "./pages/Reports";
import Configuration from "./pages/Configuration";
import UserConfig from "./pages/UserConfig";
import Settings from "./pages/Settings";
import About from "./pages/About";
import OperatorScreens from "./pages/OperatorScreens";
import PlantDashboard from "./pages/PlantDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { HierarchyProvider } from "./context/HierarchyContext";

function App() {
  return (
    <HierarchyProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Protected */}
          <Route path="/landing" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><BPVDashboard /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/line-dashboard" element={<ProtectedRoute><LineDashboard /></ProtectedRoute>} />
          <Route path="/machine-dashboard" element={<ProtectedRoute><MachineDashboard /></ProtectedRoute>} />
          <Route path="/oee-analysis" element={<ProtectedRoute><OEEAnalysis /></ProtectedRoute>} />
          <Route path="/hourly-production" element={<ProtectedRoute><HourlyProduction /></ProtectedRoute>} />
          <Route path="/losses-entry" element={<ProtectedRoute><LossesEntry /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
          <Route path="/user-config" element={<ProtectedRoute><UserConfig /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/operator-screens" element={<ProtectedRoute><OperatorScreens /></ProtectedRoute>} />

          {/* Dynamic nested Plant dashboards based on sidebar hierarchy */}
          <Route path="/plant-1/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />
          <Route path="/plant-2/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />
          <Route path="/plant-3/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />
          <Route path="/plant-4/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />
          <Route path="/plant-5/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />
          <Route path="/plant-6/*" element={<ProtectedRoute><PlantDashboard /></ProtectedRoute>} />

          <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
        </Routes>
      </BrowserRouter>
    </HierarchyProvider>
  );
}

export default App;
