import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PortalDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  if (user.role === 'teacher') {
    return <Navigate to="/portal/teacher" replace />;
  }

  return <Navigate to="/portal/overview" replace />;
}
