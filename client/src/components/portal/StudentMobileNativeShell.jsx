import React from 'react';
import {
  Home,
  BookOpen,
  IndianRupee,
  Award,
  User,
  CalendarCheck,
  CreditCard,
  Bus,
  CalendarDays,
  Users,
  ArrowRight,
} from 'lucide-react';
import { getStudentInitials, isSectionApplicable } from './SiblingSwitcherHeader';

const STUDENT_BOTTOM_TABS = [
  { id: 'overview', label: 'Home', icon: Home },
  { id: 'homework', label: 'Homework', icon: BookOpen },
  { id: 'fees', label: 'Fees', icon: IndianRupee },
  { id: 'report-card', label: 'Marks', icon: Award },
  { id: 'profile', label: 'Profile', icon: User },
];

/**
 * Student / Parent Mobile Hero ID & Fee Status Card + 4x2 Card Grid + Today's Homework Preview (md:hidden)
 */
export function StudentMobileHomeHub({
  student,
  attendanceData,
  homeworkList = [],
  hasTransportOptIn,
  onNavigateTab,
  onOpenIdCard,
}) {
  if (!student) return null;

  const paidAmt = Number(student.feeDetails?.amountPaid || 0);
  const cabOptedIn = Boolean(student.transportDetails?.optedIn);
  const cabFee = cabOptedIn ? Number(student.transportDetails?.annualCabFee || 0) : 0;
  const totalFee = Math.max(
    Number(student.feeDetails?.admissionFeeAmount || paidAmt || 500),
    paidAmt,
    cabFee
  );
  const balanceDue = Math.max(
    0,
    Number(student.feeDetails?.balanceDue ?? totalFee - paidAmt)
  );

  const attendancePct =
    attendanceData?.percentage !== undefined && attendanceData?.percentage !== null
      ? `${attendanceData.percentage}%`
      : 'Active';

  const latestHomework = Array.isArray(homeworkList)
    ? homeworkList
        .filter(
          (hw) =>
            !hw.grade ||
            hw.grade === 'All Classes' ||
            String(hw.grade).toLowerCase() === String(student.grade || '').toLowerCase()
        )
        .slice(0, 2)
    : [];

  const quickActions = [
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      circleBg: 'bg-emerald-600',
      onClick: () => onNavigateTab('attendance'),
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: BookOpen,
      circleBg: 'bg-amber-500',
      onClick: () => onNavigateTab('homework'),
    },
    {
      id: 'fees',
      label: 'Fees & Receipts',
      icon: IndianRupee,
      circleBg: 'bg-teal-600',
      onClick: () => onNavigateTab('fees'),
    },
    {
      id: 'report-card',
      label: 'Report Card',
      icon: Award,
      circleBg: 'bg-purple-600',
      onClick: () => onNavigateTab('report-card'),
    },
    {
      id: 'id-card',
      label: 'ID Card',
      icon: CreditCard,
      circleBg: 'bg-[#1A365D]',
      onClick: onOpenIdCard,
    },
    {
      id: 'school-van',
      label: 'School Van',
      icon: Bus,
      circleBg: 'bg-blue-600',
      onClick: () => onNavigateTab('transport'),
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarDays,
      circleBg: 'bg-indigo-600',
      onClick: () => onNavigateTab('homework'),
    },
    {
      id: 'leadership',
      label: 'Leadership',
      icon: Users,
      circleBg: 'bg-rose-600',
      onClick: () => onNavigateTab('leadership'),
    },
  ];

  return (
    <div className="md:hidden space-y-3.5">
      {/* Hero Student ID & Fee Status Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1A365D] via-[#1E3F6E] to-[#13294B] text-white p-4 shadow-lg border border-[#D97706]/60 space-y-3">
        <div className="flex items-center gap-3">
          {student.documents?.studentPhotoUrl ? (
            <img
              src={student.documents.studentPhotoUrl}
              alt={student.studentName}
              className="w-14 h-14 rounded-full object-cover object-top border-2 border-[#D97706] bg-white flex-shrink-0 shadow-md"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-white text-[#1A365D] border-2 border-[#D97706] font-serif font-bold text-base flex items-center justify-center flex-shrink-0 shadow-md">
              {getStudentInitials(student.studentName)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white truncate leading-snug">
              {student.studentName}
            </h2>
            <p className="text-[11px] text-slate-200 mt-0.5 truncate">
              Adm No: <span className="font-mono font-semibold text-amber-300">{student.admissionNumber}</span>
              {' • '}
              {student.grade}
              {isSectionApplicable(student.section) ? ` ${student.section}` : ''}
            </p>
            {student.rollNumber && (
              <p className="text-[11px] text-slate-300">Roll: {student.rollNumber}</p>
            )}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10.5px] font-bold">
            Attendance ({attendancePct})
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
              balanceDue === 0
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                : 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
            }`}
          >
            {balanceDue === 0
              ? 'All Fees Paid (₹0 Due)'
              : `Pending: ₹${balanceDue.toLocaleString('en-IN')}`}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('fees')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D97706] hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          <span>View Fee Receipt</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4x2 Quick-Access Elevated Card Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
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

      {/* Today's Homework Preview Card (fills bottom space cleanly) */}
      <button
        type="button"
        onClick={() => onNavigateTab('homework')}
        className="w-full text-left bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-sm hover:border-[#D97706]/50 transition space-y-2 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A365D] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Today&apos;s Homework</span>
          </span>
          <span className="text-[11px] font-semibold text-[#D97706]">View All →</span>
        </div>

        {latestHomework.length > 0 ? (
          <div className="space-y-1.5">
            {latestHomework.map((hw) => (
              <div key={hw._id || hw.title} className="text-[11.5px] text-slate-600 truncate">
                <strong className="text-[#1A365D]">{hw.subject}:</strong>{' '}
                <span>{hw.title || hw.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11.5px] text-slate-500">
            No new homework posted today. Tap to view previous class assignments.
          </p>
        )}
      </button>
    </div>
  );
}

/**
 * Fixed 5-Tab Bottom Navigation Bar for Student/Parent Portal (md:hidden)
 */
export function StudentMobileBottomBar({ activeTab, onSelectTab }) {
  return (
    <nav
      aria-label="Student Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {STUDENT_BOTTOM_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive =
            activeTab === tab.id || (tab.id === 'overview' && activeTab === 'leadership');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
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
