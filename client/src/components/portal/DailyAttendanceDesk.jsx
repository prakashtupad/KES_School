import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardCheck,
  Calendar,
  CheckCheck,
  Save,
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Users,
  Phone,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAbsenteeWhatsAppUrl } from '../../utils/absenteeAlertFormatter';

const GRADES = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

const SECTIONS = ['A', 'B', 'C', 'N/A', 'ALL'];

const STATUS_OPTIONS = [
  {
    value: 'Present',
    label: 'Present',
    shortLabel: 'P',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    idleClass: 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
  },
  {
    value: 'Absent',
    label: 'Absent',
    shortLabel: 'A',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs',
    idleClass: 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700',
  },
  {
    value: 'Late',
    label: 'Late',
    shortLabel: 'L',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-xs',
    idleClass: 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700',
  },
  {
    value: 'Half-Day',
    label: 'Half-Day',
    shortLabel: 'HD',
    activeClass: 'bg-orange-500 text-white border-orange-500 shadow-xs',
    idleClass: 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50 hover:text-orange-700',
  },
  {
    value: 'Excused_Leave',
    label: 'Leave',
    shortLabel: 'LV',
    activeClass: 'bg-slate-600 text-white border-slate-600 shadow-xs',
    idleClass: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800',
  },
];

function getTodayLocalIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DailyAttendanceDesk() {
  const { token, user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(getTodayLocalIso);
  const [selectedGrade, setSelectedGrade] = useState(() => {
    const assigned = Array.isArray(user?.assignedGrades) ? user.assignedGrades : [];
    const firstSpecific = assigned.find((g) => GRADES.includes(g));
    return firstSpecific || 'Grade 1';
  });
  const [selectedSection, setSelectedSection] = useState('A');

  const [records, setRecords] = useState([]);
  const [absentees, setAbsentees] = useState([]);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [sheetMeta, setSheetMeta] = useState(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState(null);
  const [overrideHoliday, setOverrideHoliday] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyingId, setNotifyingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSheet = useCallback(async () => {
    if (!token || !selectedGrade || !selectedDate) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        grade: selectedGrade,
        section: selectedSection,
      });
      const res = await fetch(`/api/v1/attendance/sheet?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not load class attendance sheet.');
      }
      setRecords(Array.isArray(data.records) ? data.records : []);
      setAbsentees(Array.isArray(data.absentees) ? data.absentees : []);
      setIsAlreadyMarked(Boolean(data.isAlreadyMarked));
      setSheetMeta(data.sheet || null);
      setIsHoliday(Boolean(data.isHoliday));
      setHolidayInfo(data.holidayInfo || null);
      setOverrideHoliday(false);
    } catch (err) {
      setErrorMsg(err.message || 'Error loading attendance sheet.');
      setRecords([]);
      setAbsentees([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate, selectedGrade, selectedSection]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let other = 0;
    for (const r of records) {
      if (r.status === 'Present') present += 1;
      else if (r.status === 'Absent') absent += 1;
      else other += 1;
    }
    return { total: records.length, present, absent, other };
  }, [records]);

  const handleStatusChange = (studentId, newStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? {
              ...r,
              status: newStatus,
              remarks: newStatus === 'Present' ? '' : r.remarks,
            }
          : r
      )
    );
  };

  const handleRemarkChange = (studentId, val) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, remarks: val } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'Present', remarks: '' })));
    setFeedback('All students toggled to Present. Click "Save & Publish Daily Attendance" to confirm.');
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleSaveAttendance = async () => {
    if (records.length === 0) return;
    setSaving(true);
    setErrorMsg('');
    setFeedback('');

    try {
      const payload = {
        date: selectedDate,
        academicYear: '2026-2027',
        grade: selectedGrade,
        section: selectedSection,
        records: records.map((r) => ({
          studentId: r.studentId,
          admissionNumber: r.admissionNumber,
          studentName: r.studentName,
          status: r.status,
          remarks: r.remarks || '',
          alertSent: Boolean(r.alertSent),
        })),
      };

      const res = await fetch('/api/v1/attendance/mark-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save daily attendance.');
      }

      setIsAlreadyMarked(true);
      setSheetMeta(data.sheet || null);
      setAbsentees(Array.isArray(data.absentees) ? data.absentees : []);
      setFeedback(
        data.absentees?.length > 0
          ? `Attendance saved for ${selectedGrade} (${selectedSection}). ${data.absentees.length} absent student(s) ready for instant WhatsApp alert below.`
          : `Attendance saved for ${selectedGrade} (${selectedSection}) — 100% Present today!`
      );
    } catch (err) {
      setErrorMsg(err.message || 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendAbsenteeWhatsApp = async (absentStudent) => {
    const waUrl = getAbsenteeWhatsAppUrl(absentStudent, selectedDate);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setNotifyingId(absentStudent.studentId);
    try {
      const res = await fetch('/api/v1/attendance/mark-alert-sent', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: absentStudent.studentId,
          date: selectedDate,
          grade: selectedGrade,
          section: selectedSection,
        }),
      });
      if (res.ok) {
        setAbsentees((prev) =>
          prev.map((a) =>
            a.studentId === absentStudent.studentId ? { ...a, alertSent: true } : a
          )
        );
        setRecords((prev) =>
          prev.map((r) =>
            r.studentId === absentStudent.studentId ? { ...r, alertSent: true } : r
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark alertSent:', err);
    } finally {
      setNotifyingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                Morning Roll Call &amp; Instant Parent Alerts
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A365D]">
                Daily Student Attendance Desk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All students default to Present — simply tap absent/late students and save to trigger 1-click WhatsApp parent alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAlreadyMarked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Marked{sheetMeta?.markedByName ? ` by ${sheetMeta.markedByName}` : ''}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Pending for {selectedDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-[#D97706] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                aria-label="Select Attendance Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono font-bold text-[#1A365D] bg-[#F8FAFC] focus:border-[#1A365D]"
              />
            </div>

            <select
              aria-label="Select Class / Grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-[#1A365D] bg-white focus:border-[#1A365D]"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              aria-label="Select Section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-[#1A365D] bg-white focus:border-[#1A365D]"
            >
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL'
                    ? 'All Sections'
                    : sec === 'N/A'
                      ? 'Section N/A'
                      : `Section ${sec}`}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchSheet}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#1A365D] hover:bg-slate-50 transition cursor-pointer"
              title="Reload Class Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={records.length === 0 || (isHoliday && !overrideHoliday)}
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 border border-emerald-300 font-bold text-xs transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              disabled={saving || records.length === 0 || (isHoliday && !overrideHoliday)}
              onClick={handleSaveAttendance}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D97706]" />
              <span>{saving ? 'Saving Roll Sheet...' : 'Save & Publish Daily Attendance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* School Holiday / Sunday Attendance Lock Banner */}
      {isHoliday && holidayInfo && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 block">
                {holidayInfo.isFlagHoistingDay
                  ? 'National Observance • Flag Hoisting Day'
                  : 'School Holiday — Attendance Marking Locked'}
              </span>
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#1A365D]">
                School Holiday: {holidayInfo.title}
                {holidayInfo.titleKn ? ` (${holidayInfo.titleKn})` : ''}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Regular attendance &amp; absentee WhatsApp alerts are automatically disabled on holidays so students are not marked absent by mistake.
              </p>
            </div>
          </div>

          {isAdmin && (
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-[#1A365D] cursor-pointer flex-shrink-0 shadow-2xs">
              <input
                type="checkbox"
                checked={overrideHoliday}
                onChange={(e) => setOverrideHoliday(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
              />
              <span>Override for Special Campus Event</span>
            </label>
          )}
        </div>
      )}

      {/* Live Attendance Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Class Strength
          </span>
          <div className="text-2xl font-mono font-bold text-[#1A365D] mt-0.5">
            {counts.total}
          </div>
        </div>
        <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Present
          </span>
          <div className="text-2xl font-mono font-bold text-emerald-700 mt-0.5">
            {counts.present}
          </div>
        </div>
        <div className="bg-rose-50/70 rounded-xl border border-rose-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            Absent
          </span>
          <div className="text-2xl font-mono font-bold text-rose-700 mt-0.5">
            {counts.absent}
          </div>
        </div>
        <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Late / Half-Day / Leave
          </span>
          <div className="text-2xl font-mono font-bold text-amber-800 mt-0.5">
            {counts.other}
          </div>
        </div>
      </div>

      {/* Feedback & Error Alerts */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Instant Absentee Alert Panel (Shown whenever there are saved absent students) */}
      {isAlreadyMarked && absentees.length > 0 && (
        <div className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-serif font-bold text-rose-950">
                  Instant Absentee WhatsApp Alert Queue ({absentees.length})
                </h3>
                <p className="text-[11px] text-rose-800">
                  Tap &quot;Notify Parent on WhatsApp&quot; to send the official institutional absentee notice immediately.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-800">
              {absentees.filter((a) => a.alertSent).length} / {absentees.length} Notified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {absentees.map((ab) => (
              <div
                key={ab.studentId}
                className="bg-white rounded-xl border border-rose-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#1A365D] border border-slate-200">
                      {ab.admissionNumber}
                    </span>
                    <strong className="text-xs sm:text-sm text-[#1A365D] truncate">
                      {ab.studentName}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Parent: {ab.father?.name || ab.fatherName || '—'}</span>
                    {ab.primaryPhone && (
                      <span className="inline-flex items-center gap-0.5 font-mono text-slate-700">
                        <Phone className="w-3 h-3 text-[#D97706]" />
                        +91 {ab.primaryPhone}
                      </span>
                    )}
                  </div>
                  {ab.remarks && (
                    <p className="text-[10px] text-rose-700 mt-0.5 italic">
                      Note: {ab.remarks}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {ab.alertSent ? (
                    <button
                      type="button"
                      onClick={() => handleSendAbsenteeWhatsApp(ab)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-xs transition cursor-pointer"
                      title="Already notified — click to resend on WhatsApp"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Parent Notified</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={notifyingId === ab.studentId}
                      onClick={() => handleSendAbsenteeWhatsApp(ab)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {notifyingId === ab.studentId
                          ? 'Updating...'
                          : 'Notify Parent on WhatsApp'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Class Roster Attendance Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs sm:text-sm text-slate-500">
          Loading {selectedGrade} ({selectedSection}) attendance roll sheet...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="font-serif font-bold text-[#1A365D] text-base">
            No Active Students Found in {selectedGrade} ({selectedSection})
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching the Grade or Section dropdown above (or choose &quot;All Sections&quot;) to view enrolled students.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 w-28">Adm / Roll</th>
                  <th className="py-3 px-4">Student &amp; Parent</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4 w-60">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {records.map((rec, idx) => {
                  const rowBg =
                    rec.status === 'Absent'
                      ? 'bg-rose-50/40'
                      : rec.status !== 'Present'
                        ? 'bg-amber-50/30'
                        : 'bg-white';

                  return (
                    <tr key={rec.studentId} className={`${rowBg} hover:bg-slate-50/80 transition`}>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-[#1A365D] border border-slate-200">
                          {rec.admissionNumber}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          #{idx + 1}{rec.rollNumber ? ` • Roll ${rec.rollNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#1A365D]">
                          {rec.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rec.fatherName || 'Parent'}
                          {rec.primaryPhone ? ` • +91 ${rec.primaryPhone}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {STATUS_OPTIONS.map((opt) => {
                            const active = rec.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStatusChange(rec.studentId, opt.value)}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                  active ? opt.activeClass : opt.idleClass
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={rec.remarks || ''}
                          onChange={(e) => handleRemarkChange(rec.studentId, e.target.value)}
                          placeholder={
                            rec.status === 'Present'
                              ? '—'
                              : 'e.g. Fever / Informed by parent'
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:border-[#1A365D]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-200">
            {records.map((rec, idx) => (
              <div
                key={rec.studentId}
                className={`p-3.5 space-y-2.5 ${
                  rec.status === 'Absent'
                    ? 'bg-rose-50/40'
                    : rec.status !== 'Present'
                      ? 'bg-amber-50/30'
                      : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-[#1A365D] border border-slate-200">
                        {rec.admissionNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                    </div>
                    <div className="font-bold text-sm text-[#1A365D] mt-0.5">
                      {rec.studentName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rec.fatherName || 'Parent'}
                      {rec.primaryPhone ? ` • +91 ${rec.primaryPhone}` : ''}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = rec.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleStatusChange(rec.studentId, opt.value)}
                        className={`py-1.5 rounded-lg text-[11px] font-bold border text-center transition cursor-pointer ${
                          active ? opt.activeClass : opt.idleClass
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {rec.status !== 'Present' && (
                  <input
                    type="text"
                    value={rec.remarks || ''}
                    onChange={(e) => handleRemarkChange(rec.studentId, e.target.value)}
                    placeholder="Optional remark (e.g. Fever / Family function)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Bottom Sticky Save Footer */}
          <div className="bg-[#F8FAFC] px-4 sm:px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-semibold">
              Summary: <strong className="text-emerald-700">{counts.present} Present</strong> •{' '}
              <strong className="text-rose-700">{counts.absent} Absent</strong> •{' '}
              <strong className="text-amber-700">{counts.other} Other</strong>
            </div>

            <button
              type="button"
              disabled={saving || records.length === 0}
              onClick={handleSaveAttendance}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D97706]" />
              <span>{saving ? 'Saving Roll Sheet...' : 'Save & Publish Daily Attendance'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
