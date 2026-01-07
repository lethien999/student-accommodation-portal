import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';

const SaleDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardService.getSaleStats();
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
            <h1 className="text-3xl font-bold mb-6">Sale Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">Potential Leads</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalLeads}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Recent Leads (New Users)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2">Name</th>
                                <th className="py-2">Email</th>
                                <th className="py-2">Phone</th>
                                <th className="py-2">Registered At</th>
                                <th className="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentLeads.map(user => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-2">{user.fullName || user.username}</td>
                                    <td className="py-2">{user.email}</td>
                                    <td className="py-2">{user.phone || 'N/A'}</td>
                                    <td className="py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2">
                                        <button className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-xs">
                                            Contact
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SaleDashboard;
