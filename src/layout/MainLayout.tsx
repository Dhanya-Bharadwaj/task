import React from "react";
import Sidebar from "../components/Sidebar";
import CommonHeader from "../components/CommonHeader";
import Footer from "../components/Footer";

export type MainLayoutProps = {
    children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-shrink-0">
                <Sidebar />
            </div>

            <div className="flex flex-col flex-1 min-w-0 mt-[7px]">
                <CommonHeader />

                <main className="flex-1 min-w-0 bg-gray-50 overflow-auto">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default MainLayout;
