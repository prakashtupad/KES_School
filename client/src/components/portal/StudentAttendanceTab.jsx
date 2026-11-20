import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_STYLE = {
  Present: {
    cell: 'bg-emerald-50 border-emerald-300 text-emerald-900',
    badge: 'bg-emerald-600 text-white',
    label: 'Present',
    short: 'P',
  },
  Absent: {
    cell: 'bg-rose-50 border-rose-300 text-rose-900',
    badge: 'bg-rose-600 text-white',
    label: 'Absent',
    short: 'A',
  },
  Late: {
    cell: 'bg-amber-50 border-amber-300 text-amber-900',
    badge: 'bg-amber-500 text-white',
    label: 'Late',
    short: 'L',
  },
  'Half-Day': {
    cell: 'bg-orange-50 border-orange-300 text-orange-900',
    badge: 'bg-orange-500 text-white',
    label: 'Half-Day',
    short: 'HD',
  },
  Excused_Leave: {
    cell: 'bg-amber-50 border-amber-300 text-amber-900',
    badge: 'bg-slate-600 text-white',
    label: 'Excused Leave',
    short: 'LV',
  },
};

function formatMonthLabel(monthStr) {
  const [y, m] = String(monthStr || '').split('-').map(Number);
  if (!y || !m) return monthStr;
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function shiftMonth(monthStr, delta) {
  const [y, m] = String(monthStr || '').split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function StudentAttendanceTab({
  student,
  selectedMonth,
  onMonthChange,
  attendanceData,
  loading = false,
}) {
  const [selectedDayRecord, setSelectedDayRecord] = useState(null);

  const summary = attendanceData?.summary || {
    totalWorkingDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    halfDayCount: 0,
    excusedLeaveDays: 0,
    attendancePercentage: 100,
  };

  const dailyRecords = useMemo(
    () => (Array.isArray(attendanceData?.dailyRecords) ? attendanceData.dailyRecords : []),
    [attendanceData]
  );

  const recordByDate = useMemo(() => {
    const map = new Map();
    for (const r of dailyRecords) {
      map.set(r.date, r);
    }
    return map;
  }, [dailyRecords]);

  const calendarCells = useMemo(() => {
    const [year, month] = String(selectedMonth || '').split('-').map(Number);
    if (!year || !month) return [];
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push({ empty: true, key: `empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dow = new Date(year, month - 1, day).getDay();
      cells.push({
        empty: false,
        key: dateStr,
        day,
        dateStr,
        isSunday: dow === 0,
        record: recordByDate.get(dateStr) || null,
      });
    }
    return cells;
  }, [selectedMonth, recordByDate]);

  if (!student) return null;

  const lateAndLeaveTotal =
    (summary.lateDays || 0) + (summary.halfDayCount || 0) + (summary.excusedLeaveDays || 0);

  const nonPresentDays = dailyRecords.filter((r) => r.status !== 'Present');

  const pctColor =
    summary.totalWorkingDays === 0
      ? 'text-[#1A365D]'
      : summary.attendancePercentage >= 85
        ? 'text-emerald-700'
        : summary.attendancePercentage >= 75
          ? 'text-amber-700'
          : 'text-rose-700';

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              Monthly Attendance Tracker
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A365D]">
              Daily Attendance — {student.studentName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live attendance synced from class teacher roll call. Switch siblings above for instant updates.
            </p>
          </div>
        </div>

        {/* Month Switcher */}
        <div className="inline-flex items-center gap-1 bg-[#F8FAFC] border border-slate-200 rounded-xl p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setSelectedDayRecord(null);
              onMonthChange(shiftMonth(selectedMonth, -1));
            }}
            className="p-1.5 rounded-lg hover:bg-white text-[#1A365D] transition cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs sm:text-sm font-bold text-[#1A365D] min-w-[136px] text-center">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedDayRecord(null);
              onMonthChange(shiftMonth(selectedMonth, 1));
            }}
            className="p-1.5 rounded-lg hover:bg-white text-[#1A365D] transition cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Attendance Rate
          </span>
          <div className={`text-2xl sm:text-3xl font-mono font-bold mt-1 ${pctColor}`}>
            {summary.totalWorkingDays > 0 ? `${summary.attendancePercentage}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-500">
            {summary.totalWorkingDays} marked day{summary.totalWorkingDays === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Days Present
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-700 mt-1">
            {summary.presentDays}
          </div>
          <span className="text-[11px] text-emerald-800/80">In {formatMonthLabel(selectedMonth)}</span>
        </div>

        <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Days Absent
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-700 mt-1">
            {summary.absentDays}
          </div>
          <span className="text-[11px] text-rose-800/80">Marked absent</span>
        </div>

        <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Late / Leave
            </span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-800 mt-1">
            {lateAndLeaveTotal}
          </div>
          <span className="text-[11px] text-amber-900/80">Late, Half-Day &amp; Leave</span>
        </div>
      </div>

      {/* Color-Coded Monthly Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-serif font-bold text-[#1A365D]">
            {formatMonthLabel(selectedMonth)} Attendance Calendar
          </h4>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Present
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
              Absent
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Late / Leave
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              Sunday / Unmarked
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading monthly attendance calendar...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className={`text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1.5 rounded-lg ${
                    wd === 'Sun'
                      ? 'bg-slate-100 text-rose-600'
                      : 'bg-[#F8FAFC] text-slate-500'
                  }`}
                >
                  {wd}
                </div>
              ))}

              {calendarCells.map((cell) => {
                if (cell.empty) {
                  return <div key={cell.key} className="h-14 sm:h-16 rounded-xl bg-transparent" />;
                }

                const rec = cell.record;
                const stStyle = rec ? STATUS_STYLE[rec.status] : null;
                const isSelected = selectedDayRecord?.date === cell.dateStr;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDayRecord(rec || null)}
                    title={
                      rec
                        ? `${cell.dateStr}: ${stStyle?.label || rec.status}${rec.remarks ? ` — ${rec.remarks}` : ''}`
                        : cell.isSunday
                          ? 'Sunday / Holiday'
                          : 'No attendance marked'
                    }
                    className={`h-14 sm:h-16 rounded-xl border p-1.5 flex flex-col items-center justify-between transition ${
                      stStyle
                        ? `${stStyle.cell} cursor-pointer hover:shadow-xs`
                        : cell.isSunday
                          ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-default'
                          : 'bg-white border-slate-200 text-slate-500 cursor-default'
                    } ${isSelected ? 'ring-2 ring-[#1A365D]' : ''}`}
                  >
                    <span className="text-xs font-mono font-bold self-start leading-none">
                      {cell.day}
                    </span>

                    {stStyle ? (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold leading-none ${stStyle.badge}`}
                      >
                        <span className="sm:hidden">{stStyle.short}</span>
                        <span className="hidden sm:inline">{stStyle.label}</span>
                      </span>
                    ) : cell.isSunday ? (
                      <span className="text-[9px] font-semibold text-slate-400">Sun</span>
                    ) : (
                      <span className="text-[9px] text-slate-300">—</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDayRecord && (
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#1A365D] flex-shrink-0" />
                  <span>
                    <strong className="font-mono text-[#1A365D]">{selectedDayRecord.date}</strong>:{' '}
                    <strong>
                      {STATUS_STYLE[selectedDayRecord.status]?.label || selectedDayRecord.status}
                    </strong>
                    {selectedDayRecord.remarks ? ` — ${selectedDayRecord.remarks}` : ''}
                  </span>
                </div>
                {selectedDayRecord.markedByName && (
                  <span className="text-[11px] text-slate-500">
                    Marked by {selectedDayRecord.markedByName}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Absence / Late / Leave Remarks List */}
      {nonPresentDays.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A365D]">
            Absences, Late Arrivals &amp; Leave Notes ({nonPresentDays.length})
          </h4>
          <div className="divide-y divide-slate-100">
            {nonPresentDays.map((item) => {
              const stStyle = STATUS_STYLE[item.status] || STATUS_STYLE.Absent;
              return (
                <div
                  key={item.date}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1A365D]">{item.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stStyle.badge}`}
                    >
                      {stStyle.label}
                    </span>
                  </div>
                  <span className="text-slate-600">
                    {item.remarks || 'No additional remarks recorded.'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
