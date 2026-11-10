import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  BookOpen,
  Users,
  Bell,
  LayoutDashboard,
  Clock,
  GraduationCap,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../constants/schoolData';
import BirthdayGreetingDesk from './BirthdayGreetingDesk';

const NAV_CONFIG = [
  {
    label: 'Overview',
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
    label: 'Student Directory',
    to: '/portal/students',
    icon: GraduationCap,
    roles: ['admin', 'teacher'],
  },
  {
    label: 'Classroom & Homework',
    to: '/portal/teacher',
    icon: BookOpen,
    roles: ['teacher', 'admin'],
  },
  {
    label: 'Timesheet & Attendance',
    to: '/portal/attendance-register',
    icon: Clock,
    roles: ['admin'],
  },
  {
    label: 'Timesheet & Attendance',
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
    label: 'Notices & Circulars',
    to: '/portal/notices',
    icon: Bell,
    roles: ['admin', 'teacher'],
  },
  {
    label: 'Website Content (CMS)',
    to: '/portal/cms',
    icon: Layers,
    roles: ['admin'],
  },
];

const ROLE_LABELS = {
  admin: 'Admin',
  teacher: 'Teacher',
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

  const handleGoPublicSite = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top Portal Header */}
      <header className="sticky top-0 z-50 bg-[#1A365D] text-white border-b border-brand-gold/40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition flex-shrink-0"
              aria-label="Toggle portal sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/portal" className="flex items-center gap-2.5 min-w-0">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="School Emblem"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain border border-brand-gold bg-white p-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-brand-gold font-bold truncate">
                    KES Staff Portal
                  </span>
                </div>
                <h1 className="text-xs sm:text-sm md:text-base font-serif font-bold text-white truncate">
                  {SCHOOL_INFO.schoolName}
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleGoPublicSite}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-brand-goldSoft transition px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-brand-gold/40"
              title="Visit Public Website (Logs out of active portal session)"
            >
              <span className="hidden sm:inline">Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {user && (
              <div className="flex items-center gap-2 sm:pl-2 sm:border-l border-slate-700">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.fullName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-gold/20 border border-brand-gold/50 text-brand-goldSoft text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3 text-brand-gold" />
                  <span>{ROLE_LABELS[user.role] || user.role}</span>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow transition"
              title="Sign out of Staff Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Portal Body */}
      <div className="flex-grow max-w-7xl w-full mx-auto flex relative">
        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation (Slide-over on Mobile/Tablet, Fixed on Desktop) */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 left-0 top-14 sm:top-16 z-40 w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out`}
        >
          <div className="space-y-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
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

          <div className="p-3 rounded-xl bg-brand-navy/5 border border-brand-navy/10 text-[11px] text-slate-600 space-y-0.5 mt-6">
            <div className="font-bold text-brand-navy">Office Helpdesk</div>
            <div>📞 {SCHOOL_INFO.phoneDisplay}</div>
          </div>
        </aside>

        {/* Active Portal View */}
        <main className="flex-grow p-3 sm:p-5 lg:p-7 min-w-0 w-full overflow-x-auto isolate">
          <BirthdayGreetingDesk />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
