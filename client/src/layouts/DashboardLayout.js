import React from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
