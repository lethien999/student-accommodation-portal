import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import dashboardService from '../../services/dashboardService';
import verificationService from '../../services/verificationService';
import accommodationService from '../../services/accommodationService';
import { Link } from 'react-router-dom';

const SaleDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Reporting State
    const [tasks, setTasks] = useState([]); // List of unverified accommodations
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedAccommodation, setSelectedAccommodation] = useState(null);
    const [reportForm, setReportForm] = useState({
        criteria: { realImages: true, safeLocation: true, correctPrice: true, amenitiesMatch: true },
        comment: ''
    });

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

        // Fetch unverified data
        // For simplicity, we fetch all and filter client-side or use a specific API if available
        // Here we assume we can search
        const fetchTasks = async () => {
            const res = await accommodationService.getAll({
                // In a real app, backend should support filtering by 'verifyStatus=none'
                // For now, let's just fetch recent ones and show them
                limit: 20
            });
            // Client side filter for demo
            setTasks(res.accommodations.filter(a => !a.isVerified && a.verifyStatus !== 'pending'));
        };
        fetchTasks();
    }, []);

    const handleOpenReport = (acc) => {
        setSelectedAccommodation(acc);
        setShowReportModal(true);
    };

    const submitReport = async (e) => {
        e.preventDefault();
        try {
            await verificationService.createReport({
                accommodationId: selectedAccommodation.id,
                criteria: reportForm.criteria,
                comment: reportForm.comment
            });
            alert('Report submitted successfully!');
            setShowReportModal(false);
            setTasks(tasks.filter(t => t.id !== selectedAccommodation.id));
        } catch (err) {
            alert('Failed to submit report');
        }
    };


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
            {/* Verification Tasks Section */}
            <div className="bg-white p-6 rounded shadow mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span>🕵️‍♀️</span> Verification Tasks (Unverified Listings)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map(task => (
                        <div key={task.id} className="border p-4 rounded hover:shadow-md transition bg-gray-50">
                            <h3 className="font-bold text-lg">{task.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{task.address}</p>
                            <div className="flex justify-between items-center mt-4">
                                <Link to={`/accommodations/${task.id}`} target="_blank" className="text-blue-600 text-sm hover:underline">View Detail</Link>
                                <button
                                    onClick={() => handleOpenReport(task)}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 font-medium"
                                >
                                    Create Report
                                </button>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && <p className="text-gray-500">No unverified listings found.</p>}
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg mx-4">
                        <h3 className="text-xl font-bold mb-4">Verify: {selectedAccommodation?.name}</h3>
                        <form onSubmit={submitReport}>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Checklist Criteria</label>
                                <div className="space-y-2">
                                    {Object.keys(reportForm.criteria).map(key => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                checked={reportForm.criteria[key]}
                                                onChange={e => setReportForm({
                                                    ...reportForm,
                                                    criteria: { ...reportForm.criteria, [key]: e.target.checked }
                                                })}
                                                className="w-5 h-5 text-indigo-600"
                                            />
                                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block font-medium mb-1">Detailed Comment</label>
                                <textarea
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="4"
                                    placeholder="Describe the condition of the property..."
                                    value={reportForm.comment}
                                    onChange={e => setReportForm({ ...reportForm, comment: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default SaleDashboard;
