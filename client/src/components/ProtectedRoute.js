import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Bảo vệ routes yêu cầu authentication và authorization
 * Supports role-based access control via 'roles' prop
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if roles prop is provided
  if (roles && roles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !roles.includes(userRole)) {
      // User not authorized
      return <Navigate to="/" replace />; // Or to a 403 Forbidden page
    }
  }

  return children;
};

export default ProtectedRoute;
