import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';
import { Link } from 'react-router-dom';

const LandlordDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardService.getLandlordStats();
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
                <Link to="/accommodations/create" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
                    + Add New Property
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">My Listings</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalListings}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm uppercase">Total Reviews</h3>
                    <p className="text-3xl font-bold mt-2">{stats.overview.totalReviews}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">My Properties</h2>
                {stats.listings.length === 0 ? (
                    <p>You have no properties listed.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Name</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Views</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.listings.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded text-xs ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-2">${item.price}</td>
                                        <td className="py-2">{item.views || 0}</td>
                                        <td className="py-2">
                                            <Link to={`/accommodations/edit/${item.id}`} className="text-blue-600 mr-2">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LandlordDashboard;
