/**
 * src/App.tsx
 * Application routing for BPV.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
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

        <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
