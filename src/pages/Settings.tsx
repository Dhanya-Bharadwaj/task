/**
 * src/pages/Settings.tsx
 * Application settings page.
 */
import React from "react";
import MainLayout from "../layout/MainLayout";
import toast from "react-hot-toast";

const Settings: React.FC = () => {
    return (
        <MainLayout>
            <div className="flex flex-col p-4 space-y-4">
                <h3 className="page-title text-xl font-semibold text-gray-800">Settings</h3>

                <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm max-w-xl space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Theme</label>
                        <select className="input-field" style={{ width: 200 }}>
                            <option>Light (Default)</option>
                            <option>Dark</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Language</label>
                        <select className="input-field" style={{ width: 200 }}>
                            <option>English</option>
                            <option>हिंदी</option>
                            <option>தமிழ்</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Dashboard Auto-Refresh</label>
                        <select className="input-field" style={{ width: 200 }}>
                            <option>30 seconds</option>
                            <option>1 minute</option>
                            <option>5 minutes</option>
                            <option>Off</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Notifications</label>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="input-checkbox" defaultChecked id="notif-email" />
                            <label htmlFor="notif-email" className="text-sm text-gray-700">Email Alerts</label>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" className="input-checkbox" defaultChecked id="notif-browser" />
                            <label htmlFor="notif-browser" className="text-sm text-gray-700">Browser Alerts</label>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button className="btn-primary" onClick={() => toast.success("Settings saved.")}>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
