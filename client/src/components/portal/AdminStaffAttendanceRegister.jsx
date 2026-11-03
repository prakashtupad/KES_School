import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StaffTimesheetDesk from './StaffTimesheetDesk';

const STATUS_OPTIONS = ['Present', 'Late', 'Half Day', 'On Leave', 'Absent'];

const STATUS_PILL_STYLES = {
  Present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Late: 'bg-amber-100 text-amber-800 border-amber-300',
  'Half Day': 'bg-blue-100 text-blue-800 border-blue-300',
  'On Leave': 'bg-red-100 text-red-800 border-red-300',
  Absent: 'bg-rose-100 text-rose-800 border-rose-300',
  'Not Checked In': 'bg-slate-100 text-slate-600 border-slate-300',
};

const ROLE_LABELS = {
  admin: 'Admin',
  teacher: 'Teacher',
};

const getTodayDateString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

export default function AdminStaffAttendanceRegister() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('register');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [registerData, setRegisterData] = useState([]);
  const [kpi, setKpi] = useState({
    totalStaff: 0,
    presentToday: 0,
    lateToday: 0,
    onLeave: 0,
    absent: 0,
    notCheckedIn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchRegister = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/attendance/admin/register?date=${encodeURIComponent(selectedDate)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterData(data.data || []);
        setKpi(
          data.kpi || {
            totalStaff: 0,
            presentToday: 0,
            lateToday: 0,
            onLeave: 0,
            absent: 0,
            notCheckedIn: 0,
          }
        );
      }
    } catch (err) {
      console.error('Failed to fetch staff register:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    if (activeTab === 'register') {
      fetchRegister();
    }
  }, [activeTab, fetchRegister]);

  const handleStatusChange = async (staffMember, newStatus) => {
    setUpdatingId(staffMember.staffId);
    setToast('');
    try {
      const res = await fetch('/api/v1/attendance/admin/manual-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId: staffMember.staffId,
          date: selectedDate,
          status: newStatus,
          verifiedByAdmin: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToast(`Updated ${staffMember.fullName} to "${newStatus}".`);
        fetchRegister();
      }
    } catch (err) {
      console.error('Manual attendance update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    if (!registerData || registerData.length === 0) return;

    const headers = [
      'Date',
      'Staff Name',
      'Email',
      'Role',
      'Check-In Time',
      'Check-Out Time',
      'Total Hours',
      'Periods Handled',
      'Work Type',
      'Status',
      'Verified By Admin',
      'Daily Notes',
    ];

    const rows = registerData.map((r) => [
      selectedDate,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      r.email || '',
      ROLE_LABELS[r.role] || r.role,
      formatTime(r.checkInTime),
      formatTime(r.checkOutTime),
      r.totalHours ? Number(r.totalHours).toFixed(2) : '0.00',
      r.periodsCovered || 0,
      `"${r.workType || 'Regular Teaching'}"`,
      r.status || 'Not Checked In',
      r.verifiedByAdmin ? 'Yes' : 'No',
      `"${(r.dailyNotes || r.leaveReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KES_Staff_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Header & Sub-Tab Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
            Attendance &amp; Timesheets
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
            Staff Attendance Manager
          </h2>
        </div>

        {/* Sub-Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-brand-navy'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-brand-gold" />
            <span>Staff Register</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-clock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'my-clock'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-brand-navy'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span>My Punch Clock</span>
          </button>
        </div>
      </div>

      {activeTab === 'my-clock' ? (
        <StaffTimesheetDesk />
      ) : (
        <>
          {/* Date Picker & CSV Export Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-gold" />
              <input
                id="attendanceDatePicker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-brand-navy bg-white"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayDateString())}
                className="text-xs font-semibold text-brand-navy hover:text-brand-gold underline"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchRegister}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-navy hover:bg-slate-50 transition"
                title="Refresh Register"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm border border-brand-gold/40 transition"
              >
                <Download className="w-3.5 h-3.5 text-brand-gold" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {toast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{toast}</span>
              </div>
              <button type="button" onClick={() => setToast('')} className="text-xs underline">
                Close
              </button>
            </div>
          )}

          {/* Compact KPI Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Staff
              </div>
              <div className="text-xl font-serif font-bold text-brand-navy mt-0.5">
                {kpi.totalStaff}
              </div>
            </div>

            <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Present</span>
              </div>
              <div className="text-xl font-serif font-bold text-emerald-800 mt-0.5">
                {kpi.presentToday}
              </div>
            </div>

            <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Late</span>
              </div>
              <div className="text-xl font-serif font-bold text-amber-800 mt-0.5">
                {kpi.lateToday}
              </div>
            </div>

            <div className="bg-red-50/70 rounded-xl border border-red-200 p-3 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                Leave
              </div>
              <div className="text-xl font-serif font-bold text-red-800 mt-0.5">
                {kpi.onLeave}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 shadow-sm col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Not Checked In
              </div>
              <div className="text-xl font-serif font-bold text-slate-700 mt-0.5">
                {kpi.notCheckedIn}
              </div>
            </div>
          </div>

          {/* MOBILE & SMALL TABLET CARDS (below md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500 col-span-full">
                Loading staff register...
              </div>
            ) : (
              registerData.map((row) => (
                <div
                  key={row.staffId}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-brand-navy flex items-center gap-1 truncate">
                        <span>{row.fullName}</span>
                        {row.verifiedByAdmin && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                        {ROLE_LABELS[row.role] || row.role}
                      </span>
                    </div>

                    <select
                      aria-label={`Change attendance status for ${row.fullName}`}
                      disabled={updatingId === row.staffId}
                      value={STATUS_OPTIONS.includes(row.status) ? row.status : ''}
                      onChange={(e) => {
                        if (e.target.value) handleStatusChange(row, e.target.value);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        STATUS_PILL_STYLES[row.status] ||
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {!STATUS_OPTIONS.includes(row.status) && (
                        <option value="">Not In</option>
                      )}
                      {STATUS_OPTIONS.map((statusOpt) => (
                        <option key={statusOpt} value={statusOpt} className="bg-white text-slate-800">
                          {statusOpt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>
                      In: <strong className="text-emerald-700">{formatTime(row.checkInTime)}</strong>
                    </span>
                    <span>
                      Out: <strong className="text-amber-700">{formatTime(row.checkOutTime)}</strong>
                    </span>
                    <span>{row.periodsCovered || 0} Periods</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE (md and up) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Check-In / Out</th>
                    <th className="py-3 px-4">Periods &amp; Summary</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Loading daily staff register...
                      </td>
                    </tr>
                  ) : (
                    registerData.map((row) => (
                      <tr key={row.staffId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-brand-navy flex items-center gap-1.5">
                            <span>{row.fullName}</span>
                            {row.verifiedByAdmin && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                            {ROLE_LABELS[row.role] || row.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div>
                            <span className="text-slate-400">In: </span>
                            <span className="font-mono font-semibold text-emerald-700">
                              {formatTime(row.checkInTime)}
                            </span>
                            <span className="mx-1.5 text-slate-300">|</span>
                            <span className="text-slate-400">Out: </span>
                            <span className="font-mono font-semibold text-amber-700">
                              {formatTime(row.checkOutTime)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-brand-navy">
                            {row.periodsCovered || 0} Periods •{' '}
                            <span className="font-normal text-slate-500">
                              {row.workType || 'Regular Teaching'}
                            </span>
                          </div>
                          {row.dailyNotes && (
                            <div className="text-[11px] text-slate-500 truncate">
                              {row.dailyNotes}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            aria-label={`Change attendance status for ${row.fullName}`}
                            disabled={updatingId === row.staffId}
                            value={STATUS_OPTIONS.includes(row.status) ? row.status : ''}
                            onChange={(e) => {
                              if (e.target.value) handleStatusChange(row, e.target.value);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${
                              STATUS_PILL_STYLES[row.status] ||
                              'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {!STATUS_OPTIONS.includes(row.status) && (
                              <option value="">Not Checked In</option>
                            )}
                            {STATUS_OPTIONS.map((statusOpt) => (
                              <option
                                key={statusOpt}
                                value={statusOpt}
                                className="bg-white text-slate-800"
                              >
                                {statusOpt}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
