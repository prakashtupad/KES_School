import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Calendar,
  BookOpen,
  FileText,
  Save,
  AlertCircle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WORK_TYPES = [
  'Regular Teaching',
  'Exam Duty',
  'Meeting / Training',
  'Administrative Work',
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const STATUS_BADGE_STYLES = {
  Present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Late: 'bg-amber-100 text-amber-800 border-amber-300',
  'Half Day': 'bg-blue-100 text-blue-800 border-blue-300',
  'On Leave': 'bg-red-100 text-red-800 border-red-300',
  Absent: 'bg-rose-100 text-rose-800 border-rose-300',
};

const formatTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateReadable = (dateVal) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function StaffTimesheetDesk() {
  const { token, user } = useAuth();
  const nowInit = new Date();

  const [liveNow, setLiveNow] = useState(nowInit);
  const [selectedMonth, setSelectedMonth] = useState(nowInit.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(nowInit.getFullYear());

  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    daysPresent: 0,
    daysLate: 0,
    leavesTaken: 0,
    totalHoursLogged: 0,
    totalPeriodsCovered: 0,
  });

  // Activity form state
  const [periodsCovered, setPeriodsCovered] = useState(0);
  const [workType, setWorkType] = useState('Regular Teaching');
  const [dailyNotes, setDailyNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Live ticking digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/attendance/my-history?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.data || []);
        setSummary(
          data.summary || {
            daysPresent: 0,
            daysLate: 0,
            leavesTaken: 0,
            totalHoursLogged: 0,
            totalPeriodsCovered: 0,
          }
        );
        if (data.todayRecord) {
          setTodayRecord(data.todayRecord);
          setPeriodsCovered(data.todayRecord.periodsCovered || 0);
          setWorkType(data.todayRecord.workType || 'Regular Teaching');
          setDailyNotes(data.todayRecord.dailyNotes || '');
        } else {
          setTodayRecord(null);
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Could not load attendance history. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await fetch('/api/v1/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workType,
          periodsCovered: Number(periodsCovered) || 0,
          dailyNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to clock in');
      }
      setTodayRecord(data.data);
      setFeedback({ type: 'success', message: data.message });
      fetchAttendanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await fetch('/api/v1/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          periodsCovered: Number(periodsCovered) || 0,
          workType,
          dailyNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to clock out');
      }
      setTodayRecord(data.data);
      setFeedback({ type: 'success', message: data.message });
      fetchAttendanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await fetch('/api/v1/attendance/daily-activity', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          periodsCovered: Number(periodsCovered) || 0,
          workType,
          dailyNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save activity log');
      }
      setTodayRecord(data.data);
      setFeedback({ type: 'success', message: data.message });
      fetchAttendanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const hasClockedIn = Boolean(todayRecord?.checkInTime);
  const hasClockedOut = Boolean(todayRecord?.checkOutTime);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded bg-brand-goldSoft text-brand-gold font-bold text-[11px] uppercase tracking-wider mb-1">
            Staff Self-Service Timesheet
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy">
            Daily Punch Clock &amp; Teaching Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Record your daily school check-in, check-out, periods covered, and classroom summary.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reporting Time Rule
            </div>
            <div className="text-xs font-bold text-brand-navy">
              Before 09:15 AM (IST)
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAttendanceData}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-navy hover:bg-slate-50 transition"
            title="Refresh attendance log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Grid: Today's Punch Clock + Quick Daily Teaching Activity Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Punch Clock Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navyDark text-white rounded-2xl p-6 shadow-md border border-brand-gold/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-gold">
                <Clock className="w-4 h-4" />
                Today&apos;s Punch Clock
              </span>
              {todayRecord?.status && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    STATUS_BADGE_STYLES[todayRecord.status] ||
                    'bg-white/10 text-white border-white/20'
                  }`}
                >
                  {todayRecord.status}
                </span>
              )}
            </div>

            {/* Live Digital Clock */}
            <div className="my-4 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl sm:text-4xl font-mono font-extrabold tracking-tight text-white">
                {liveNow.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </div>
              <div className="text-xs text-brand-goldSoft font-medium mt-1">
                {liveNow.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* Today's Timestamps Summary */}
            <div className="grid grid-cols-3 gap-2.5 my-4 text-center">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-slate-300">
                  Check-In
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5">
                  {formatTime(todayRecord?.checkInTime)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-slate-300">
                  Check-Out
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5">
                  {formatTime(todayRecord?.checkOutTime)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-slate-300">
                  Hours Logged
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  {todayRecord?.totalHours
                    ? `${Number(todayRecord.totalHours).toFixed(2)}h`
                    : '0.00h'}
                </div>
              </div>
            </div>
          </div>

          {/* Clock In / Clock Out Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={hasClockedIn || actionLoading}
              onClick={handleClockIn}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition ${
                hasClockedIn
                  ? 'bg-emerald-600 text-white cursor-default border border-emerald-400'
                  : 'bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark'
              }`}
            >
              {hasClockedIn ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Punched In ({formatTime(todayRecord?.checkInTime)})</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Clock In Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!hasClockedIn || hasClockedOut || actionLoading}
              onClick={handleClockOut}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition ${
                hasClockedOut
                  ? 'bg-slate-700 text-slate-200 cursor-default border border-slate-500'
                  : hasClockedIn
                  ? 'bg-amber-500 hover:bg-amber-400 text-brand-navyDark'
                  : 'bg-white/10 text-slate-400 cursor-not-allowed border border-white/10'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>
                {hasClockedOut
                  ? `Clocked Out (${formatTime(todayRecord?.checkOutTime)})`
                  : 'Clock Out'}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Daily Teaching Activity & Notes Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-brand-navy flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-gold" />
                <span>Today&apos;s Teaching &amp; Duty Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update periods handled, work category, and brief teaching/substitute summary.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveActivity} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="periodsCoveredInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Number of Periods Handled
                </label>
                <input
                  id="periodsCoveredInput"
                  type="number"
                  min="0"
                  max="12"
                  value={periodsCovered}
                  onChange={(e) => setPeriodsCovered(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="workTypeSelect"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Primary Work Type
                </label>
                <select
                  id="workTypeSelect"
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                >
                  {WORK_TYPES.map((wt) => (
                    <option key={wt} value={wt}>
                      {wt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="dailyNotesInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Short Summary / Daily Notes (Classes taught or substitute duties)
                </label>
                <span className="text-[11px] text-slate-400">
                  {dailyNotes.length}/300
                </span>
              </div>
              <textarea
                id="dailyNotesInput"
                rows={3}
                maxLength={300}
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder="e.g. Taught Grade 1 & 2 English Phonics, covered 5th period substitution for Grade 3 Maths..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                {todayRecord?.verifiedByAdmin
                  ? '✓ Verified by School Office Admin'
                  : 'You can update this log anytime during the school day.'}
              </span>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-lg shadow transition"
              >
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Save Daily Log</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Monthly Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Days Present (This Month)
            </div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
              {summary.daysPresent}{' '}
              <span className="text-xs font-sans font-medium text-slate-500">
                days ({summary.daysLate} late)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Hours &amp; Periods Logged
            </div>
            <div className="text-2xl font-serif font-bold text-brand-navy mt-1">
              {Number(summary.totalHoursLogged || 0).toFixed(1)} hrs{' '}
              <span className="text-xs font-sans font-medium text-slate-500">
                • {summary.totalPeriodsCovered || 0} periods
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Leaves Taken
            </div>
            <div className="text-2xl font-serif font-bold text-red-600 mt-1">
              {summary.leavesTaken}{' '}
              <span className="text-xs font-sans font-medium text-slate-500">days</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* My Monthly Attendance Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-brand-navy flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-gold" />
              <span>My Monthly Attendance Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete daily attendance and teaching activity history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Select Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              {[2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">In-Time</th>
                <th className="py-3 px-4">Out-Time</th>
                <th className="py-3 px-4">Total Hours</th>
                <th className="py-3 px-4">Periods &amp; Work Type</th>
                <th className="py-3 px-4">Daily Summary / Notes</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading monthly attendance records...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No attendance records logged for this month yet. Use the Punch Clock above to clock in!
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id || item.dateKey} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-brand-navy whitespace-nowrap">
                      {formatDateReadable(item.date || item.dateKey)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {formatTime(item.checkInTime)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                      {formatTime(item.checkOutTime)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {item.totalHours ? `${Number(item.totalHours).toFixed(2)} hrs` : '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-brand-navy">
                        {item.periodsCovered || 0} Periods
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {item.workType || 'Regular Teaching'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                      {item.dailyNotes || item.leaveReason || (
                        <span className="text-slate-400 italic">No notes added</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          STATUS_BADGE_STYLES[item.status] ||
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
