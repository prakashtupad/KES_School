import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  IndianRupee,
  BookOpen,
  Award,
  CalendarCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Users,
  GraduationCap,
  Bus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SCHOOL_INFO } from '../../constants/schoolData';
import LanguageToggle from '../LanguageToggle';
import SiblingSwitcherHeader, {
  getStudentInitials,
  isSectionApplicable,
} from './SiblingSwitcherHeader';
import StudentOverviewTab from './StudentOverviewTab';
import StudentFeesTab from './StudentFeesTab';
import StudentCurriculumTab from './StudentCurriculumTab';
import StudentReportCardTab from './StudentReportCardTab';
import StudentAttendanceTab from './StudentAttendanceTab';
import StudentTransportTab from './StudentTransportTab';
import OurLeadership from '../OurLeadership';

const PORTAL_TABS = [
  {
    id: 'overview',
    labelKey: 'studentPortal.tabs.overview',
    shortKey: 'studentPortal.tabs.overviewShort',
    icon: User,
  },
  {
    id: 'attendance',
    labelKey: 'studentPortal.tabs.attendance',
    shortKey: 'studentPortal.tabs.attendanceShort',
    icon: CalendarCheck,
  },
  {
    id: 'fees',
    labelKey: 'studentPortal.tabs.fees',
    shortKey: 'studentPortal.tabs.feesShort',
    icon: IndianRupee,
  },
  {
    id: 'homework',
    labelKey: 'studentPortal.tabs.homework',
    shortKey: 'studentPortal.tabs.homeworkShort',
    icon: BookOpen,
  },
  {
    id: 'report-card',
    labelKey: 'studentPortal.tabs.reportCard',
    shortKey: 'studentPortal.tabs.reportCardShort',
    icon: Award,
  },
  {
    id: 'leadership',
    labelKey: 'studentPortal.tabs.leadership',
    shortKey: 'studentPortal.tabs.leadershipShort',
    icon: Users,
  },
];

function getCurrentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function StudentParentPortal() {
  const { user, token, parentSession, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const siblings = useMemo(
    () => (Array.isArray(parentSession?.siblings) ? parentSession.siblings : []),
    [parentSession]
  );
  const homeworkList = Array.isArray(parentSession?.homeworkList)
    ? parentSession.homeworkList
    : [];

  const [activeSiblingIndex, setActiveSiblingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Batch-cached monthly attendance across ALL siblings for zero-reload sibling switching
  const [attendanceMonth, setAttendanceMonth] = useState(getCurrentMonthStr);
  const [attendanceCacheByMonth, setAttendanceCacheByMonth] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const siblingIdsKey = useMemo(
    () => siblings.map((s) => String(s._id)).join(','),
    [siblings]
  );

  useEffect(() => {
    if (!token || !siblingIdsKey) return;
    if (attendanceCacheByMonth[attendanceMonth]) return;

    let cancelled = false;
    const fetchAllSiblingsAttendance = async () => {
      setAttendanceLoading(true);
      try {
        const params = new URLSearchParams({
          studentIds: siblingIdsKey,
          month: attendanceMonth,
        });
        const res = await fetch(`/api/v1/attendance/siblings-summary?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setAttendanceCacheByMonth((prev) => ({
            ...prev,
            [attendanceMonth]: data.byStudentId || {},
          }));
        }
      } catch (err) {
        console.error('Failed to load siblings attendance:', err);
      } finally {
        if (!cancelled) setAttendanceLoading(false);
      }
    };

    fetchAllSiblingsAttendance();
    return () => {
      cancelled = true;
    };
  }, [token, siblingIdsKey, attendanceMonth, attendanceCacheByMonth]);

  const safeIndex =
    activeSiblingIndex >= 0 && activeSiblingIndex < siblings.length
      ? activeSiblingIndex
      : 0;
  const currentStudent = siblings[safeIndex] || null;
  const hasTransportOptIn = Boolean(currentStudent?.transportDetails?.optedIn);

  const visibleTabs = useMemo(() => {
    if (!hasTransportOptIn) return PORTAL_TABS;
    const transportTab = {
      id: 'transport',
      labelKey: 'studentPortal.tabs.transport',
      shortKey: 'studentPortal.tabs.transportShort',
      icon: Bus,
    };
    // Insert Transportation right after Fee Ledger & Receipts
    const feesIdx = PORTAL_TABS.findIndex((tab) => tab.id === 'fees');
    if (feesIdx === -1) return [...PORTAL_TABS, transportTab];
    return [
      ...PORTAL_TABS.slice(0, feesIdx + 1),
      transportTab,
      ...PORTAL_TABS.slice(feesIdx + 1),
    ];
  }, [hasTransportOptIn]);

  // If parent switches to a sibling who has NOT opted into School Cab, exit the transport tab cleanly
  useEffect(() => {
    if (activeTab === 'transport' && !hasTransportOptIn) {
      setActiveTab('overview');
    }
  }, [activeTab, hasTransportOptIn]);

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
      <header className="sticky top-0 z-50 w-full bg-[#1A365D] text-white border-b border-[#D97706]/40 shadow-md overflow-hidden shrink-0">
        <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between flex-nowrap gap-1.5 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-md text-slate-200 hover:bg-white/10 transition shrink-0 cursor-pointer"
              aria-label="Toggle student portal menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/portal/student" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="School Emblem"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain border border-[#D97706] bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-[#D97706] font-bold truncate">
                  {t('studentPortal.headerTitle')}
                </span>
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
              className="inline-flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border border-white/15 hover:bg-white/10 hover:border-[#D97706]/40 text-slate-200 hover:text-amber-200 text-[11px] sm:text-xs font-medium transition shrink-0 cursor-pointer"
              title="Return to Public School Website"
              aria-label="Return to Public School Website"
            >
              <span className="hidden sm:inline">{t('common.website')}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>

            {user && (
              <div className="flex items-center gap-2 md:pl-2 md:border-l border-slate-700 shrink-0">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">
                    +91 {parentSession?.parentPhone || user.mobileNumber || ''}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                  <Users className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="sm:hidden">{t('studentPortal.parentBadge')}</span>
                  <span className="hidden sm:inline">
                    {t('studentPortal.parentBadge')} ({siblings.length}{' '}
                    {siblings.length === 1
                      ? t('studentPortal.childSingular')
                      : t('studentPortal.siblingsPlural')}
                    )
                  </span>
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow transition shrink-0 cursor-pointer"
              title="Sign out of Student & Parent Portal"
              aria-label="Sign out of Student & Parent Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('auth.logout')}</span>
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

            {/* 5 Dashboard Section Tabs */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('studentPortal.dashboardMenu')}
              </div>
              <nav className="space-y-1" aria-label="Student Portal Tabs">
                {visibleTabs.map((tab) => {
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-left whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-[#1A365D] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-[#1A365D]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                      <span className="truncate">{t(tab.labelKey)}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1A365D]/5 border border-[#1A365D]/10 text-[11px] text-slate-600 space-y-0.5 mt-6">
            <div className="font-bold text-[#1A365D]">{t('studentPortal.officeHelpdesk')}</div>
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
              {/* Top Sibling Switcher Bar (Client-Side Instant Switching — Multi-Sibling Only) */}
              <SiblingSwitcherHeader
                siblings={siblings}
                activeSiblingIndex={safeIndex}
                onSelectSibling={(idx) => setActiveSiblingIndex(idx)}
              />

              {/* Unified Interactive Student Portal Breadcrumb */}
              {(() => {
                const currentTabObj = visibleTabs.find((tab) => tab.id === activeTab);
                const activeTabLabel = currentTabObj
                  ? t(currentTabObj.labelKey)
                  : t('studentPortal.tabs.overview');
                return (
                  <nav
                    aria-label="Student Portal Breadcrumb"
                    className="flex items-center flex-wrap gap-1.5 text-xs font-medium text-slate-500"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="text-[#D97706] hover:text-[#1A365D] font-semibold transition cursor-pointer"
                    >
                      Home
                    </button>
                    <span className="text-slate-300">/</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className="text-[#D97706] hover:text-[#1A365D] font-semibold transition cursor-pointer"
                    >
                      {t('studentPortal.dashboardMenu')}
                    </button>
                    <span className="text-slate-300">/</span>
                    <span className="text-[#1A365D] font-bold">{activeTabLabel}</span>
                  </nav>
                );
              })()}

              {/* Mobile Quick Horizontal Tab Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:hidden">
                {visibleTabs.map((tab) => {
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
                      <span>{t(tab.shortKey)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Content */}
              {activeTab === 'overview' && (
                <StudentOverviewTab
                  student={currentStudent}
                  attendanceData={
                    attendanceCacheByMonth[attendanceMonth]?.[String(currentStudent._id)] ||
                    null
                  }
                  homeworkList={homeworkList}
                  onNavigateTab={setActiveTab}
                />
              )}
              {activeTab === 'attendance' && (
                <StudentAttendanceTab
                  student={currentStudent}
                  selectedMonth={attendanceMonth}
                  onMonthChange={setAttendanceMonth}
                  attendanceData={
                    attendanceCacheByMonth[attendanceMonth]?.[String(currentStudent._id)] ||
                    null
                  }
                  loading={attendanceLoading && !attendanceCacheByMonth[attendanceMonth]}
                />
              )}
              {activeTab === 'fees' && <StudentFeesTab student={currentStudent} />}
              {activeTab === 'transport' && hasTransportOptIn && (
                <StudentTransportTab
                  student={currentStudent}
                  onOpenFeesTab={() => setActiveTab('fees')}
                />
              )}
              {activeTab === 'homework' && (
                <StudentCurriculumTab
                  student={currentStudent}
                  homeworkList={homeworkList}
                />
              )}
              {activeTab === 'report-card' && (
                <StudentReportCardTab student={currentStudent} />
              )}
              {activeTab === 'leadership' && <OurLeadership isPortalView={true} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
