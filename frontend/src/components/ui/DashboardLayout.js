/**
 * DashboardLayout Component
 * 
 * Responsive dashboard layout with collapsible sidebar for all dashboard types.
 * Follows Single Responsibility - handles only layout structure.
 * 
 * @component
 */
import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import CosmicBackground from './CosmicBackground';
import AnimatedButton from './AnimatedButton';
import './ui-styles.css';

const DashboardLayout = ({
    children,
    sidebarItems = [],
    activeKey,
    onNavigate,
    title = 'Dashboard',
    userInfo = null,
    headerActions = null,
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleNavClick = (key) => {
        if (onNavigate) onNavigate(key);
        if (isMobile) setSidebarOpen(false);
    };

    return (
        <CosmicBackground className="dashboard-layout">
            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="dashboard-layout__overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-layout__sidebar ${sidebarOpen ? 'dashboard-layout__sidebar--open' : ''}`}>
                <div className="dashboard-layout__sidebar-header">
                    <h2 className="dashboard-layout__logo">{title}</h2>
                    {isMobile && (
                        <button
                            className="dashboard-layout__close-btn"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <nav className="dashboard-layout__nav">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.key}
                            className={`dashboard-layout__nav-item ${activeKey === item.key ? 'dashboard-layout__nav-item--active' : ''}`}
                            onClick={() => handleNavClick(item.key)}
                        >
                            {item.icon && <span className="dashboard-layout__nav-icon">{item.icon}</span>}
                            <span className="dashboard-layout__nav-label">{item.label}</span>
                            {item.badge && (
                                <span className="dashboard-layout__nav-badge">{item.badge}</span>
                            )}
                        </button>
                    ))}
                </nav>

                {userInfo && (
                    <div className="dashboard-layout__user">
                        <div className="dashboard-layout__user-avatar">
                            {userInfo.avatar ? (
                                <img src={userInfo.avatar} alt={userInfo.name} />
                            ) : (
                                <span>{userInfo.name?.charAt(0)?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="dashboard-layout__user-info">
                            <span className="dashboard-layout__user-name">{userInfo.name}</span>
                            <span className="dashboard-layout__user-role">{userInfo.role}</span>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main content */}
            <main className="dashboard-layout__main">
                <header className="dashboard-layout__header">
                    {isMobile && (
                        <button
                            className="dashboard-layout__menu-btn"
                            onClick={toggleSidebar}
                            aria-label="Open sidebar"
                        >
                            <FaBars />
                        </button>
                    )}
                    <div className="dashboard-layout__header-content">
                        {headerActions}
                    </div>
                </header>

                <div className="dashboard-layout__content">
                    {children}
                </div>
            </main>
        </CosmicBackground>
    );
};

export default DashboardLayout;
