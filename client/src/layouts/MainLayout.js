import React from 'react';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Outlet />
            </main>
            <Chatbot />
        </div>
    );
};

export default MainLayout;
