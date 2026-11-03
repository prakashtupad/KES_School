import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-sm w-full">
          <div className="w-10 h-10 border-4 border-brand-navy border-t-brand-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-brand-navy">Verifying Staff Session...</p>
          <p className="text-xs text-slate-500 mt-1">Shri Siddharoodha EMS Portal</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'teacher' ? '/portal/teacher' : '/portal/admin';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-brand-navy mb-2">
            Unauthorized Role Access
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Your current account role (<strong className="uppercase">{user.role}</strong>) does not
            have permission to access this administrative module.
          </p>
          <Link
            to={fallbackPath}
            className="inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navyDark text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg shadow transition"
          >
            <ArrowLeft className="w-4 h-4 text-brand-gold" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
