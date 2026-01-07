import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role || 'user'; // Normalized role name

    // Temporary: Only show Dashboard link for Phase 2 demo
    const adminLinks = [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Tài khoản cá nhân', path: '/profile' },
        // { label: 'Users', path: '/admin/users' },
    ];

    const landlordLinks = [
        { label: 'Dashboard', path: '/landlord' },
        { label: 'Tài khoản cá nhân', path: '/profile' },
        // { label: 'My Properties', path: '/landlord/properties' },
    ];

    const saleLinks = [
        { label: 'Dashboard', path: '/sale' },
        { label: 'Tài khoản cá nhân', path: '/profile' },
    ];

    const studentLinks = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Tài khoản cá nhân', path: '/profile' },
    ];

    let links = [];
    if (role === 'admin') links = adminLinks;
    else if (role === 'landlord') links = landlordLinks;
    else if (role === 'sale') links = saleLinks;
    else links = studentLinks;

    return (
        <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed left-0 top-0">
            <div className="p-4 text-2xl font-bold border-b border-gray-700">
                Portal
            </div>

            <div className="p-4 border-b border-gray-700">
                <p className="text-sm text-gray-400">Welcome,</p>
                <p className="font-semibold">{user?.fullName || user?.username}</p>
                <span className="text-xs bg-blue-600 px-2 py-1 rounded mt-1 inline-block uppercase">
                    {role}
                </span>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {links.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className="block p-2 rounded hover:bg-gray-700 transition"
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    {role !== 'user' && (
                        <li className="px-2 pt-4">
                            <span className="text-xs text-gray-500 uppercase">Coming Soon (Phase 3)</span>
                            <div className="text-gray-600 pl-2 text-sm mt-1">
                                Bookings<br />
                                Reviews
                            </div>
                        </li>
                    )}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
                <Link
                    to="/"
                    className="w-full bg-gray-600 p-2 rounded hover:bg-gray-500 transition mb-2 block text-center"
                >
                    Back to Website
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 p-2 rounded hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
