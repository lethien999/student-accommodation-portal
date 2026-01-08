import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';
import verificationService from '../../services/verificationService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]); // Verification Reports
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await dashboardService.getAdminStats();
                if (res.success) {
                    setStats(res.data);
                }
                // Fetch Pending Verifications
                const reportData = await verificationService.getReports({ status: 'pending' });
                setReports(reportData.data);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this verification?')) return;
        try {
            setActionLoading(id);
            await verificationService.approveReport(id, 'Approved by Admin');
            setReports(reports.filter(r => r.id !== id));
            alert('Report Approved & Listing Verified!');
        } catch (err) {
            alert('Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Reason for rejection:');
        if (!reason) return;
        try {
            setActionLoading(id);
            await verificationService.rejectReport(id, reason);
            setReports(reports.filter(r => r.id !== id));
            alert('Report Rejected');
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

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

            {/* Pending Verifications */}
            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-blue-700">📋 Pending Verifications</h2>
                {reports.length === 0 ? (
                    <p className="text-gray-500">No pending reports.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="py-2 px-2">Accommodation</th>
                                    <th className="py-2 px-2">Staff</th>
                                    <th className="py-2 px-2">Criteria</th>
                                    <th className="py-2 px-2">Comment</th>
                                    <th className="py-2 px-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map(report => (
                                    <tr key={report.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-2">
                                            <Link to={`/accommodations/${report.Accommodation.id}`} target="_blank" className="text-blue-600 font-bold hover:underline">
                                                {report.Accommodation.name}
                                            </Link>
                                            <div className="text-xs text-gray-400">{report.Accommodation.address}</div>
                                        </td>
                                        <td className="py-2 px-2 text-sm">
                                            {report.staff?.fullName}<br />
                                            <span className="text-xs text-gray-500">{report.staff?.email}</span>
                                        </td>
                                        <td className="py-2 px-2 text-xs">
                                            <ul className="list-disc pl-3">
                                                {Object.entries(report.criteria || {}).map(([key, val]) => (
                                                    <li key={key} className={val ? 'text-green-600' : 'text-red-500'}>
                                                        {key}: {val ? 'Yes' : 'No'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="py-2 px-2 text-sm italic text-gray-600">"{report.comment}"</td>
                                        <td className="py-2 px-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(report.id)}
                                                    disabled={actionLoading === report.id}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                >
                                                    {actionLoading === report.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleReject(report.id)}
                                                    disabled={actionLoading === report.id}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
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

export default AdminDashboard;
