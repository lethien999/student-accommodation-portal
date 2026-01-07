import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardService.getAdminStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <DashboardLayout>Loading...</DashboardLayout>;
    if (error) return <DashboardLayout><div className="text-red-600">{error}</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">Accommodations</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalAccommodations}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">Total Reviews</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalReviews}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Role Distribution</h2>
                <ul>
                    {stats.rolesStats.map((role, idx) => (
                        <li key={idx} className="flex justify-between border-b py-2 last:border-0">
                            <span className="capitalize">{role.role}</span>
                            <span className="font-semibold">{role.count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
