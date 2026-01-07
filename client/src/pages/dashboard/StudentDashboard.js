import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="bg-white p-8 rounded shadow text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome back, {user?.fullName || user?.username}!</h1>
                <p className="text-gray-600 mb-8">Ready to find your next home?</p>

                <div className="flex justify-center space-x-4">
                    <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        Browse Accommodations
                    </Link>
                    <Link to="/profile" className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition">
                        Update Profile
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
