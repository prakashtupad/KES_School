import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  IndianRupee,
  BookOpen,
  Award,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Users,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../constants/schoolData';
import SiblingSwitcherHeader, {
  getStudentInitials,
  isSectionApplicable,
} from './SiblingSwitcherHeader';
import StudentOverviewTab from './StudentOverviewTab';
import StudentFeesTab from './StudentFeesTab';
import StudentCurriculumTab from './StudentCurriculumTab';
import StudentReportCardTab from './StudentReportCardTab';

const PORTAL_TABS = [
  {
    id: 'overview',
    label: 'Student Overview & Profile',
    shortLabel: 'Overview',
    icon: User,
  },
  {
    id: 'fees',
    label: 'Fee Ledger & Receipts',
    shortLabel: 'Fees & Receipts',
    icon: IndianRupee,
  },
  {
    id: 'homework',
    label: 'Curriculum & Daily Homework',
    shortLabel: 'Homework',
    icon: BookOpen,
  },
  {
    id: 'report-card',
    label: 'Digital Report Card',
    shortLabel: 'Report Card',
    icon: Award,
  },
];

export default function StudentParentPortal() {
  const { user, parentSession, logout } = useAuth();
  const navigate = useNavigate();

  const siblings = Array.isArray(parentSession?.siblings)
    ? parentSession.siblings
    : [];
  const homeworkList = Array.isArray(parentSession?.homeworkList)
    ? parentSession.homeworkList
    : [];

  const [activeSiblingIndex, setActiveSiblingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const safeIndex =
    activeSiblingIndex >= 0 && activeSiblingIndex < siblings.length
      ? activeSiblingIndex
      : 0;
  const currentStudent = siblings[safeIndex] || null;

  const handleLogout = () => {
    logout();
    navigate('/portal/login', { replace: true });
  };

  const handleGoPublicSite = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Sticky Top Navy Portal Header */}
      <header className="sticky top-0 z-50 bg-[#1A365D] text-white border-b border-[#D97706]/40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition flex-shrink-0 cursor-pointer"
              aria-label="Toggle student portal menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/portal/student" className="flex items-center gap-2.5 min-w-0">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="School Emblem"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain border border-[#D97706] bg-white p-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-[#D97706] font-bold block truncate">
                  KES Student &amp; Parent Portal
                </span>
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
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-amber-200 transition px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-[#D97706]/40 cursor-pointer"
              title="Return to Public School Website"
            >
              <span className="hidden sm:inline">Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {user && (
              <div className="flex items-center gap-2 sm:pl-2 sm:border-l border-slate-700">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    +91 {parentSession?.parentPhone || user.mobileNumber || ''}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D97706]/20 border border-[#D97706]/50 text-amber-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                  <Users className="w-3 h-3 text-[#D97706]" />
                  <span>
                    Parent ({siblings.length}{' '}
                    {siblings.length === 1 ? 'Child' : 'Siblings'})
                  </span>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow transition cursor-pointer"
              title="Sign out of Student & Parent Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Portal Layout */}
      <div className="flex-grow max-w-7xl w-full mx-auto flex relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } fixed lg:static inset-y-0 left-0 top-14 sm:top-16 z-40 lg:z-10 w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out`}
        >
          <div className="space-y-5">
            {/* Active Student Quick Card in Sidebar */}
            {currentStudent && (
              <div className="p-3 rounded-xl bg-[#1A365D] text-white border border-[#D97706]/40 space-y-2">
                <div className="flex items-center gap-2.5">
                  {currentStudent.documents?.studentPhotoUrl ? (
                    <img
                      src={currentStudent.documents.studentPhotoUrl}
                      alt={currentStudent.studentName}
                      className="w-10 h-10 rounded-lg object-cover border border-[#D97706] bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white text-[#1A365D] border border-[#D97706] font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {getStudentInitials(currentStudent.studentName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#D97706] font-bold block">
                      {currentStudent.admissionNumber}
                    </span>
                    <div className="text-xs font-bold truncate">
                      {currentStudent.studentName}
                    </div>
                    <span className="text-[10px] text-slate-300 block">
                      {currentStudent.grade}
                      {isSectionApplicable(currentStudent.section)
                        ? ` • Sec ${currentStudent.section}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Dashboard Section Tabs */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Student Dashboard
              </div>
              <nav className="space-y-1" aria-label="Student Portal Tabs">
                {PORTAL_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-[#1A365D] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-[#1A365D]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1A365D]/5 border border-[#1A365D]/10 text-[11px] text-slate-600 space-y-0.5 mt-6">
            <div className="font-bold text-[#1A365D]">Khanatti Office Helpdesk</div>
            <div>📞 {SCHOOL_INFO.phoneDisplay}</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-3 sm:p-5 lg:p-7 min-w-0 w-full overflow-x-auto space-y-5">
          {!currentStudent ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-base font-serif font-bold text-[#1A365D]">
                No Active Student Profile Loaded
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please sign in with your registered 10-digit parent mobile number and
                Admission Number or Date of Birth.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-[#1A365D] text-white text-xs font-bold cursor-pointer"
              >
                Return to Portal Login
              </button>
            </div>
          ) : (
            <>
              {/* Top Sibling Switcher Bar (Client-Side Instant Switching) */}
              <SiblingSwitcherHeader
                siblings={siblings}
                activeSiblingIndex={safeIndex}
                onSelectSibling={(idx) => setActiveSiblingIndex(idx)}
              />

              {/* Mobile Quick Horizontal Tab Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden">
                {PORTAL_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition cursor-pointer ${
                        isActive
                          ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              {activeTab === 'overview' && (
                <StudentOverviewTab student={currentStudent} />
              )}
              {activeTab === 'fees' && <StudentFeesTab student={currentStudent} />}
              {activeTab === 'homework' && (
                <StudentCurriculumTab
                  student={currentStudent}
                  homeworkList={homeworkList}
                />
              )}
              {activeTab === 'report-card' && (
                <StudentReportCardTab student={currentStudent} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
