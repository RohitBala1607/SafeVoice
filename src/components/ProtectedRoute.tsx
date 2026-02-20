import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to respective login based on path
        if (location.pathname.startsWith('/institution')) {
            return <Navigate to="/institution-login" state={{ from: location }} replace />;
        }
        if (location.pathname.startsWith('/authority')) {
            return <Navigate to="/authority-login" state={{ from: location }} replace />;
        }
        return <Navigate to="/welcome" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
        // Redirect to their own dashboard if role mismatch
        if (user.role === 'institution') {
            return <Navigate to="/institution-dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
