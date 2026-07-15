import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"><div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold shadow-sm dark:border-slate-800 dark:bg-slate-900">Loading your workspace...</div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
