import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardCheck,
  BookOpen,
  Award,
  Users,
  CalendarDays,
  Clock,
  Megaphone,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

const TEACHER_QUICK_ACTIONS = [
  {
    id: 'attendance',
    label: 'Attendance',
    icon: ClipboardCheck,
    to: '/portal/daily-attendance',
    circleBg: 'bg-amber-500',
  },
  {
    id: 'post-homework',
    label: 'Post Homework',
    icon: BookOpen,
    to: '/portal/teacher?tab=homework',
    circleBg: 'bg-orange-500',
  },
  {
    id: 'enter-marks',
    label: 'Enter Marks',
    icon: Award,
    to: '/portal/students',
    circleBg: 'bg-purple-600',
  },
  {
    id: 'my-students',
    label: 'My Students',
    icon: Users,
    to: '/portal/students',
    circleBg: 'bg-blue-600',
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: CalendarDays,
    to: '/portal/teacher?tab=homework',
    circleBg: 'bg-indigo-600',
  },
  {
    id: 'timesheet',
    label: 'Timesheet',
    icon: Clock,
    to: '/portal/timesheet',
    circleBg: 'bg-teal-600',
  },
  {
    id: 'circulars',
    label: 'Circulars',
    icon: Megaphone,
    to: '/portal/notices',
    circleBg: 'bg-red-500',
  },
  {
    id: 'holidays',
    label: 'Holidays',
    icon: Calendar,
    to: '/portal/holidays',
    circleBg: 'bg-violet-600',
  },
];

const TEACHER_BOTTOM_TABS = [
  { id: 'home', label: 'Home', to: '/portal/teacher', icon: Home },
  { id: 'attendance', label: 'Attendance', to: '/portal/daily-attendance', icon: ClipboardCheck },
  { id: 'homework', label: 'Homework', to: '/portal/teacher?tab=homework', icon: BookOpen },
  { id: 'marks', label: 'Marks', to: '/portal/students', icon: Award },
  { id: 'profile', label: 'Profile', to: '/portal/timesheet', icon: User },
];

/**
 * Teacher Welcome & Today's Class Summary Card + 4x2 Elevated Quick-Access Card Grid (md:hidden)
 */
export function TeacherMobileHomeHub({ user }) {
  const navigate = useNavigate();
  const firstName = (user?.fullName || 'Teacher').split(' ')[0];
  const assignedClasses =
    Array.isArray(user?.assignedGrades) && user.assignedGrades.length > 0
      ? user.assignedGrades.join(', ')
      : 'Nursery – Grade 5';

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className="md:hidden space-y-3.5 mb-5">
      {/* Sub-strip info */}
      <div className="-mt-1 px-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Primary Section • Academic Year 2026–27</span>
        </span>
        <span>{todayFormatted}</span>
      </div>

      {/* A. Teacher Welcome & Today's Class Summary Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1A365D] via-[#1E3F6E] to-[#13294B] text-white p-4 shadow-lg border border-[#D97706]/60 space-y-3">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-[#F59E0B]" />
            <span>Teacher Workspace • {assignedClasses}</span>
          </span>
          <h2 className="text-lg font-serif font-bold text-white leading-snug">
            Namaste, {firstName}
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Class Teacher • Primary Section
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate('/portal/daily-attendance')}
            className="py-2.5 px-3 rounded-xl bg-[#D97706] hover:bg-amber-600 text-white font-bold text-[11px] shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
          >
            <span>Mark Attendance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/portal/teacher?tab=homework')}
            className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Post Homework</span>
          </button>
        </div>
      </div>

      {/* B. Teacher 4x2 Elevated Card Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {TEACHER_QUICK_ACTIONS.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.to)}
              className="bg-white rounded-2xl border border-slate-200/80 p-2.5 shadow-sm hover:border-[#D97706]/50 active:scale-95 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
            >
              <span
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-xs ${item.circleBg}`}
              >
                <IconComponent className="w-4 h-4" />
              </span>
              <span className="text-[10.5px] font-semibold text-slate-700 leading-tight text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Fixed 5-Tab Bottom Navigation Bar for Teacher/Faculty (md:hidden)
 */
export function TeacherMobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveId = () => {
    const { pathname, search } = location;
    if (pathname === '/portal/daily-attendance') return 'attendance';
    if (pathname === '/portal/students') return 'marks';
    if (pathname === '/portal/timesheet') return 'profile';
    if (pathname === '/portal/teacher' && search.includes('tab=homework')) return 'homework';
    if (pathname === '/portal/teacher') return 'home';
    return 'home';
  };

  const activeId = getActiveId();

  return (
    <nav
      aria-label="Teacher Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {TEACHER_BOTTOM_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.to)}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition cursor-pointer focus:outline-none ${
                isActive ? 'text-[#1A365D]' : 'text-slate-500 hover:text-[#1A365D]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#D97706]" />
              )}
              <IconComponent
                className={`w-5 h-5 transition ${
                  isActive ? 'text-[#D97706]' : 'text-slate-500'
                }`}
              />
              <span className={isActive ? 'font-bold text-[#1A365D]' : ''}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Teacher Profile Card displaying the photo & details entered in Admin Staff Management.
 */
export function TeacherProfileCard({ user }) {
  if (!user) return null;
  const initials = (user.fullName || 'T')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const assignedClasses =
    Array.isArray(user.assignedGrades) && user.assignedGrades.length > 0
      ? user.assignedGrades.join(', ')
      : 'All Classes';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      <div className="bg-[#1A365D] text-white px-4 py-2.5 flex items-center justify-between border-b border-[#D97706]/40">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300">
          Faculty Official Profile
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold uppercase">
          <ShieldCheck className="w-3 h-3" />
          <span>{user.isActive !== false ? 'Active' : 'Inactive'}</span>
        </span>
      </div>

      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.fullName}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover object-top border-2 border-[#D97706] ring-4 ring-amber-500/15 shadow-md bg-white flex-shrink-0 mx-auto sm:mx-0"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A365D] text-amber-300 border-2 border-[#D97706] ring-4 ring-amber-500/15 font-serif font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0 mx-auto sm:mx-0">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1A365D]">
                {user.fullName}
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-[10px] font-bold uppercase">
                {user.role || 'Teacher'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 min-w-0">
              <Mail className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
              <span className="font-mono truncate">{user.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
              <Phone className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
              <span className="font-mono">{user.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
              <GraduationCap className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
              <span className="font-semibold text-[#1A365D]">{assignedClasses}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
