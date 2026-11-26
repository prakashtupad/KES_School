import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  ClipboardCheck,
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
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SCHOOL_INFO } from '../../constants/schoolData';
import BirthdayGreetingDesk from './BirthdayGreetingDesk';
import LanguageToggle from '../LanguageToggle';
import { isNativeMobileRole } from '../../utils/nativeMobileRole';
import NativeMobileAppBar from './NativeMobileAppBar';
import {
  TeacherMobileHomeHub,
  TeacherMobileBottomBar,
  TeacherProfileCard,
} from './TeacherMobileNativeShell';
import InstallPwaBanner from '../InstallPwaBanner';
import BackToTopButton from '../BackToTopButton';

const NAV_CONFIG = [
  {
    key: 'portal.overview',
    to: '/portal/overview',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    key: 'portal.admissionsDesk',
    to: '/portal/admin',
    icon: ClipboardList,
    roles: ['admin'],
  },
  {
    key: 'portal.studentDirectory',
    to: '/portal/students',
    icon: GraduationCap,
    roles: ['admin', 'teacher'],
  },
  {
    key: 'portal.dailyAttendance',
    to: '/portal/daily-attendance',
    icon: ClipboardCheck,
    roles: ['admin', 'teacher', 'super_admin'],
  },
  {
    key: 'portal.classroomHomework',
    to: '/portal/teacher',
    icon: BookOpen,
    roles: ['teacher', 'admin'],
  },
  {
    key: 'portal.timesheetAttendance',
    to: '/portal/attendance-register',
    icon: Clock,
    roles: ['admin'],
  },
  {
    key: 'portal.timesheetAttendance',
    to: '/portal/timesheet',
    icon: Clock,
    roles: ['teacher'],
  },
  {
    key: 'portal.staffManagement',
    to: '/portal/staff',
    icon: Users,
    roles: ['admin'],
  },
  {
    key: 'portal.noticesCirculars',
    to: '/portal/notices',
    icon: Bell,
    roles: ['admin', 'teacher'],
  },
  {
    key: 'portal.holidayCalendar',
    to: '/portal/holidays',
    icon: CalendarDays,
    roles: ['admin', 'teacher'],
  },
  {
    key: 'portal.websiteCms',
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showNativeMobile = isNativeMobileRole(user);
  const isTeacherHome =
    location.pathname === '/portal/teacher' && !location.search.includes('tab=homework');

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
      {/* Native Mobile App Bar (Teacher/Faculty only, < 768px) */}
      {showNativeMobile && (
        <NativeMobileAppBar
          appSubtitle="KES Teacher App"
          onBellClick={() => navigate('/portal/notices')}
          onLogout={handleLogout}
        />
      )}

      {/* Top Portal Header (Always shown for Admin/Staff; Desktop-only when Teacher native mobile bar is active) */}
      <header
        className={`${
          showNativeMobile ? 'hidden md:block' : ''
        } sticky top-0 z-40 w-full bg-[#1A365D] text-white border-b border-brand-gold/40 shadow-md overflow-hidden shrink-0`}
      >
        <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between flex-nowrap gap-1.5 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-md text-slate-200 hover:bg-white/10 transition shrink-0 cursor-pointer"
              aria-label="Toggle portal sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/portal" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="School Emblem"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain border border-brand-gold bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-brand-gold font-bold truncate">
                    {t('portal.staffPortalTitle')}
                  </span>
                </div>
                <h1 className="text-[10.5px] sm:text-sm md:text-base font-serif font-bold text-white leading-tight line-clamp-2 sm:line-clamp-none sm:truncate">
                  {t('common.schoolName')}
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center flex-nowrap gap-1 sm:gap-2.5 md:gap-3 ml-auto shrink-0">
            <LanguageToggle compact />

            <button
              type="button"
              onClick={handleGoPublicSite}
              className="inline-flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-white/15 hover:bg-white/10 hover:border-brand-gold/40 text-slate-200 hover:text-brand-goldSoft text-[11px] sm:text-xs font-medium transition shrink-0 cursor-pointer"
              title="Visit Public Website (Logs out of active portal session)"
              aria-label="Visit Public Website"
            >
              <span className="hidden sm:inline">{t('common.website')}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>

            {user && (
              <div className="flex items-center gap-2 md:pl-2 md:border-l border-slate-700 shrink-0">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">{user.fullName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                  <Shield className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{ROLE_LABELS[user.role] || user.role}</span>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow transition shrink-0 cursor-pointer"
              title="Sign out of Staff Portal"
              aria-label="Sign out of Staff Portal"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t('auth.logout')}</span>
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
          } fixed lg:static inset-y-0 left-0 top-14 sm:top-16 z-40 lg:z-10 w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out`}
        >
          <div className="space-y-4">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('portal.menu')}
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
                    <span>{t(item.key)}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="p-3 rounded-xl bg-brand-navy/5 border border-brand-navy/10 text-[11px] text-slate-600 space-y-0.5 mt-6">
            <div className="font-bold text-brand-navy">{t('portal.officeHelpdesk')}</div>
            <div>📞 {SCHOOL_INFO.phoneDisplay}</div>
          </div>
        </aside>

        {/* Active Portal View */}
        <main
          className={`flex-grow p-3 sm:p-5 lg:p-7 min-w-0 w-full overflow-x-auto ${
            showNativeMobile ? 'pb-24 md:pb-7' : ''
          }`}
        >
          {/* Teacher Portal Breadcrumb (Clickable Home / Active Page) */}
          {showNativeMobile && (() => {
            const routeLabels = {
              '/portal/teacher': location.search.includes('tab=homework')
                ? 'Classroom & Homework'
                : 'Teacher Home',
              '/portal/daily-attendance': 'Daily Attendance',
              '/portal/students': 'Student Directory & Marks',
              '/portal/timesheet': 'Teacher Profile & Timesheet',
              '/portal/notices': 'Notices & Circulars',
              '/portal/holidays': 'School Holiday Calendar',
            };
            const currentLabel = routeLabels[location.pathname] || 'Dashboard';
            return (
              <nav
                aria-label="Teacher Portal Breadcrumb"
                className="flex items-center flex-wrap gap-1.5 text-xs font-medium text-slate-500 mb-3"
              >
                <Link
                  to="/portal/teacher"
                  className="text-[#D97706] hover:text-[#1A365D] font-semibold transition"
                >
                  Home
                </Link>
                <span className="text-slate-300">/</span>
                <Link
                  to="/portal/teacher"
                  className="text-[#D97706] hover:text-[#1A365D] font-semibold transition"
                >
                  Teacher Portal
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-[#1A365D] font-bold">{currentLabel}</span>
              </nav>
            );
          })()}

          {showNativeMobile && isTeacherHome && <TeacherMobileHomeHub user={user} />}
          {showNativeMobile && location.pathname === '/portal/timesheet' && (
            <TeacherProfileCard user={user} />
          )}
          <BirthdayGreetingDesk />
          <Outlet />
        </main>
      </div>

      {/* Back to Top Button (All Portal Roles) */}
      <BackToTopButton />

      {/* Teacher Native Mobile Bottom Bar & Install Prompt (Teacher/Faculty only, < 768px) */}
      {showNativeMobile && (
        <>
          <InstallPwaBanner />
          <TeacherMobileBottomBar />
        </>
      )}
    </div>
  );
}
