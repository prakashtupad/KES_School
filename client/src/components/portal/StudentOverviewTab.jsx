import React, { useState } from 'react';
import {
  User,
  Calendar,
  Droplets,
  MapPin,
  Phone,
  ShieldCheck,
  Printer,
  Bus,
  BookOpen,
  Users,
  CreditCard,
  IndianRupee,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { getStudentInitials, isSectionApplicable } from './SiblingSwitcherHeader';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';
import { useLanguage } from '../../context/LanguageContext';
import StudentIdCardModal from './StudentIdCardModal';

export default function StudentOverviewTab({
  student,
  attendanceData = null,
  homeworkList = [],
  onNavigateTab,
}) {
  const { t } = useLanguage();
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  if (!student) return null;

  const photoUrl = student.documents?.studentPhotoUrl || '';
  const initials = getStudentInitials(student.studentName);
  const dobDisplay = student.dateOfBirth
    ? new Date(student.dateOfBirth)
        .toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '-')
    : '—';

  const fatherName = student.father?.name || student.fatherName || '—';
  const motherName =
    student.mother?.name && String(student.mother.name) !== 'true'
      ? student.mother.name
      : student.motherName && String(student.motherName) !== 'true'
        ? student.motherName
        : '—';
  const fatherPhone =
    student.father?.mobileNumber || student.father?.mobile || student.primaryPhone || '—';
  const motherPhone = student.mother?.mobileNumber || student.mother?.mobile || '';
  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const taluk = student.residentialAddress?.taluk || 'Mudalagi';
  const district = student.residentialAddress?.district || 'Belagavi';
  const pincode = student.residentialAddress?.pincode || '591312';

  const stsNumber = student.previousStudy?.stsNumber || '';
  const penNumber = student.previousStudy?.penNumber || '';
  const apaarId = student.previousStudy?.apaarId || '';

  // 1. Attendance Quick Summary
  const attSummary = attendanceData?.summary || null;
  const totalWorking = Number(attSummary?.totalWorkingDays || 0);
  const presentDays = Number(attSummary?.presentDays || 0) + Number(attSummary?.lateDays || 0);
  const attPct = totalWorking > 0 ? Number(attSummary?.attendancePercentage || 0) : null;
  const attBadge =
    attPct === null
      ? { label: 'Synced', cls: 'bg-slate-100 text-slate-600' }
      : attPct >= 85
        ? { label: 'Excellent', cls: 'bg-emerald-100 text-emerald-800' }
        : attPct >= 75
          ? { label: 'Good', cls: 'bg-amber-100 text-amber-800' }
          : { label: 'Low', cls: 'bg-rose-100 text-rose-800' };

  // 2. Fee Balance Quick Summary
  const fee = student.feeDetails || {};
  const amountPaid = Number(fee.amountPaid || 0);
  const totalFee = Math.max(Number(fee.admissionFeeAmount || amountPaid || 10000), amountPaid);
  const balanceDue = Math.max(0, Number(fee.balanceDue ?? totalFee - amountPaid));
  const isFeeCleared = balanceDue === 0 && amountPaid > 0;

  // 3. Daily Homework Quick Summary
  const studentHw = Array.isArray(homeworkList)
    ? homeworkList.filter(
        (hw) => !hw.grade || hw.grade === student.grade || hw.grade === 'All Classes'
      )
    : [];
  const hwSubjects = Array.from(
    new Set(studentHw.map((hw) => hw.subject).filter(Boolean))
  ).slice(0, 2);

  // 4. School Cab Quick Summary
  const hasCab = Boolean(student.transportDetails?.optedIn);
  const cabRoute = student.transportDetails?.routeName || student.transportRoute || '';
  const shortCabRoute = cabRoute.includes(':')
    ? cabRoute.split(':')[0].trim()
    : cabRoute || 'Route 1';
  const cabNo = student.transportDetails?.cabNumber || 'KA-41-A-7684';
  const cabDriver = student.transportDetails?.driverName || '';

  return (
    <div className="space-y-5">
      {/* Top Executive Page Title */}
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A365D]">
        Student &amp; Parent Portal • Active Profile
      </h2>

      {/* 1. Unified Hero Profile Card with Large Rounded-Corner Portrait */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navy Header Strip */}
        <div className="bg-[#1A365D] px-5 py-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#D97706]">
          <span className="text-[11px] uppercase tracking-widest text-slate-200 font-bold">
            {t('studentPortal.overview.digitalIdEyebrow')}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowIdCardModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Digital ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => printStudentAdmissionSummary(student)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D97706] hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('studentPortal.overview.printProfile')}</span>
            </button>
          </div>
        </div>

        {/* Hero Body: Prominent Large Portrait + Student Identity */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6">
          {/* Prominent Rounded-Corner Student Portrait (128px–144px) */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.studentName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-amber-400/80 ring-4 ring-amber-500/15 object-cover object-top shadow-md bg-slate-100"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-amber-400/80 ring-4 ring-amber-500/15 bg-[#1A365D] text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D97706]">
                  {initials}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-300 mt-1">
                  Student ID
                </span>
              </div>
            )}
          </div>

          {/* Primary Student Identification */}
          <div className="flex-grow space-y-2.5 min-w-0 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A365D] leading-tight">
              {student.studentName}
            </h1>

            {/* Clean Pill Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono font-bold text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Adm No: {student.admissionNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#1A365D] text-white text-xs font-bold">
                {student.grade}
                {isSectionApplicable(student.section) ? ` • Sec ${student.section}` : ''}
              </span>
              {student.rollNumber && (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                  Roll No: {student.rollNumber}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {student.status || 'Active'} ({student.academicYear || '2026-2027'})
              </span>
            </div>

            {/* Icon-Badged Metadata Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 pt-1 text-xs sm:text-sm text-slate-600">
              <div className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1A365D]/70 flex-shrink-0" />
                <span>
                  {t('studentPortal.overview.dob')}:{' '}
                  <strong className="text-slate-900 font-mono">{dobDisplay}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#1A365D]/70 flex-shrink-0" />
                <span>
                  {t('studentPortal.overview.gender')}:{' '}
                  <strong className="text-slate-900">{student.gender || '—'}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>
                  {t('studentPortal.overview.bloodGroup')}:{' '}
                  <strong className="text-slate-900">{student.bloodGroup || 'Unknown'}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                <span>
                  {t('studentPortal.overview.village')}:{' '}
                  <strong className="text-slate-900">
                    {village}, {taluk} Taluk
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Card At-a-Glance Parent Quick-Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Attendance */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('attendance')}
          className="text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-[#1A365D]/30 transition space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <CalendarCheck className="w-4 h-4 text-[#D97706]" />
              <span>Attendance</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${attBadge.cls}`}>
              {attBadge.label}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#1A365D]">
            {attPct !== null ? `${attPct}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {totalWorking > 0
              ? `${presentDays} / ${totalWorking} Days Present`
              : 'Tap to view monthly register'}
          </div>
        </button>

        {/* Card 2: Fee Balance */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('fees')}
          className="text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-[#1A365D]/30 transition space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <IndianRupee className="w-4 h-4 text-[#D97706]" />
              <span>Fee Balance</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isFeeCleared
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isFeeCleared ? 'No Dues' : 'Pending'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#1A365D]">
            {isFeeCleared
              ? 'All Clear'
              : `₹${balanceDue.toLocaleString('en-IN')}`}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {isFeeCleared
              ? 'All Term Fees Cleared'
              : `Paid: ₹${amountPaid.toLocaleString('en-IN')} / ₹${totalFee.toLocaleString('en-IN')}`}
          </div>
        </button>

        {/* Card 3: Daily Homework */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('homework')}
          className="text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-[#1A365D]/30 transition space-y-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <BookOpen className="w-4 h-4 text-[#D97706]" />
              <span>Daily Homework</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                studentHw.length > 0
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {studentHw.length > 0 ? 'Active' : 'Updated'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[#1A365D]">
            {studentHw.length} Task{studentHw.length === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {hwSubjects.length > 0
              ? `Subjects: ${hwSubjects.join(' & ')}`
              : 'Tap to check classroom diary'}
          </div>
        </button>

        {/* Card 4: School Cab */}
        <button
          type="button"
          onClick={() => hasCab && onNavigateTab && onNavigateTab('transport')}
          className={`text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm transition space-y-2 ${
            hasCab
              ? 'hover:shadow-md hover:border-[#1A365D]/30 cursor-pointer'
              : 'cursor-default'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Bus className="w-4 h-4 text-[#D97706]" />
              <span>School Cab</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                hasCab
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {hasCab ? 'Opted-In' : 'Self'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#1A365D] truncate">
            {hasCab ? shortCabRoute : 'Self / Walk'}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {hasCab
              ? `Van: ${cabNo}${cabDriver ? ` • ${cabDriver}` : ''}`
              : 'Parent drop & pickup'}
          </div>
        </button>
      </div>

      {/* 3. Two-Column Executive Detail Cards (Navy Header Strips) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card 1: Demographics & School Particulars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#1A365D] px-5 py-3 text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide">
              {t('studentPortal.overview.demographicsHeading')}
            </h4>
          </div>

          <div className="p-5 divide-y divide-slate-100 flex-grow text-xs sm:text-sm">
            <div className="pb-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('studentPortal.overview.motherTongue')}
                </span>
                <strong className="text-[#1A365D] text-sm sm:text-base mt-0.5 block">
                  {student.motherTongue || 'Kannada'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('studentPortal.overview.thirdLang')}
                </span>
                <strong className="text-[#1A365D] text-sm sm:text-base mt-0.5 block">
                  {student.languageIII || 'Kannada'}
                </strong>
              </div>
            </div>

            <div className="py-3.5 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('studentPortal.overview.categoryReligion')}
                </span>
                <strong className="text-slate-800 mt-0.5 block">
                  {student.category || 'General'} • {student.religion || 'Hindu'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('studentPortal.overview.transport')}
                </span>
                <strong className="text-slate-800 mt-0.5 inline-flex items-center gap-1">
                  <Bus className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                  <span className="truncate">
                    {hasCab ? shortCabRoute : t('studentPortal.overview.selfCommute')}
                  </span>
                </strong>
              </div>
            </div>

            <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('studentPortal.overview.whatsappBroadcast')}
                </span>
                <strong className="font-mono text-[#1A365D] text-sm mt-0.5 block">
                  +91 {student.whatsappNumber || student.primaryPhone}
                </strong>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                {t('common.verified')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card 2: Parent & Guardian Particulars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#1A365D] px-5 py-3 text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold tracking-wide">
              {t('studentPortal.overview.parentHeading')}
            </h4>
          </div>

          <div className="p-5 divide-y divide-slate-100 flex-grow text-xs sm:text-sm">
            <div className="pb-3.5 space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {t('studentPortal.overview.fatherLabel')}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <strong className="text-[#1A365D] text-sm sm:text-base">{fatherName}</strong>
                <span className="inline-flex items-center gap-1 text-slate-600 font-mono text-xs">
                  <Phone className="w-3 h-3 text-[#D97706]" />
                  <span>Contact: +91 {fatherPhone}</span>
                </span>
              </div>
            </div>

            <div className="py-3.5 space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {t('studentPortal.overview.motherLabel')}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <strong className="text-[#1A365D] text-sm sm:text-base">{motherName}</strong>
                {motherPhone && (
                  <span className="inline-flex items-center gap-1 text-slate-600 font-mono text-xs">
                    <Phone className="w-3 h-3 text-[#D97706]" />
                    <span>Contact: +91 {motherPhone}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3.5 space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                {t('studentPortal.overview.addressLabel')}
              </span>
              <div className="font-semibold text-slate-800">
                At &amp; Post: {village}, Taluk: {taluk}, Dist: {district} — {pincode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Karnataka State & National Education Identifiers Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A365D]">
            {t('studentPortal.overview.stateIdsHeading')}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('studentPortal.overview.stsLabel')}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <strong className="font-mono text-sm text-[#1A365D]">
                {stsNumber || t('studentPortal.overview.notAssigned')}
              </strong>
              {stsNumber && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('studentPortal.overview.penLabel')}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <strong className="font-mono text-sm text-[#1A365D]">
                {penNumber || t('studentPortal.overview.notAssigned')}
              </strong>
              {penNumber && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {t('studentPortal.overview.apaarLabel')}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <strong className="font-mono text-sm text-[#1A365D]">
                {apaarId || t('studentPortal.overview.notAssigned')}
              </strong>
              {apaarId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Student ID Card Preview & Download Modal */}
      {showIdCardModal && (
        <StudentIdCardModal
          isOpen={showIdCardModal}
          students={[student]}
          title={`Digital Student ID Card — ${student.studentName}`}
          onClose={() => setShowIdCardModal(false)}
        />
      )}
    </div>
  );
}
