import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  BookOpen,
  Users,
  Bell,
  LayoutDashboard,
  Clock,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../constants/schoolData';

const NAV_CONFIG = [
  {
    label: 'Institutional Overview',
    to: '/portal/overview',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    label: 'Admissions Desk',
    to: '/portal/admin',
    icon: ClipboardList,
    roles: ['admin'],
  },
  {
    label: 'My Classroom & Homework',
    to: '/portal/teacher',
    icon: BookOpen,
    roles: ['teacher', 'admin'],
  },
  {
    label: 'Staff Timesheet & Attendance',
    to: '/portal/attendance-register',
    icon: Clock,
    roles: ['admin'],
  },
  {
    label: 'Staff Timesheet & Attendance',
    to: '/portal/timesheet',
    icon: Clock,
    roles: ['teacher'],
  },
  {
    label: 'Staff Management',
    to: '/portal/staff',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Public Notices & Circulars',
    to: '/portal/notices',
    icon: Bell,
    roles: ['admin', 'teacher'],
  },
];

const ROLE_LABELS = {
  admin: 'Office Admin',
  teacher: 'Faculty / Teacher',
};

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowedNavItems = NAV_CONFIG.filter((item) =>
    item.roles.includes(user?.role || 'teacher')
  );

  const handleLogout = () => {
    logout();
    navigate('/portal/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top Portal Header */}
      <header className="sticky top-0 z-40 bg-brand-navyDark text-white border-b border-brand-gold/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition"
              aria-label="Toggle portal sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/portal" className="flex items-center gap-3">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="School Emblem"
                className="w-10 h-10 rounded-full object-contain border border-brand-gold bg-white p-0.5"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-brand-gold font-bold">
                    KES Staff Portal
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400">
                    {SCHOOL_INFO.registrationNo}
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm md:text-base font-serif font-bold text-white leading-tight">
                  {SCHOOL_INFO.schoolName}
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/', { replace: true });
              }}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-brand-goldSoft transition px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-brand-gold/40"
              title="Visit Public Website (Logs out of active portal session)"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {user && (
              <div className="flex items-center gap-2.5 pl-2 sm:border-l border-slate-700">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/50 text-brand-goldSoft text-[11px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3 text-brand-gold" />
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition"
              title="Sign out of Staff Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Portal Body */}
      <div className="flex-grow max-w-7xl w-full mx-auto flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 space-y-6`}
        >
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Role Navigation
            </div>
            <nav className="space-y-1" aria-label="Portal Sidebar Navigation">
              {allowedNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                        isActive
                          ? 'bg-brand-navy text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4 text-brand-gold flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-navy/5 border border-brand-navy/10 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-brand-navy">Khanatti Office Desk</div>
            <div>📞 {SCHOOL_INFO.phoneDisplay}</div>
            <div>✉️ {SCHOOL_INFO.email}</div>
          </div>
        </aside>

        {/* Active Portal View */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
