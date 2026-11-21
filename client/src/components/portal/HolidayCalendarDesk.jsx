import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Flag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_META = {
  Public_Festival: {
    label: 'Public Festival',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  National_Holiday: {
    label: 'National Holiday',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  Term_Break: {
    label: 'Term Break',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  Local_Holiday: {
    label: 'Local Holiday',
    badge: 'bg-teal-100 text-teal-800 border-teal-300',
  },
};

function formatDateReadable(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return dateStr || '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDayOfWeekLabel(startDate, endDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate || ''))) return '—';
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const startDay = new Date(sy, sm - 1, sd).toLocaleDateString('en-IN', {
    weekday: 'long',
  });
  if (!endDate || endDate === startDate) return startDay;
  const [ey, em, ed] = endDate.split('-').map(Number);
  const daysDiff =
    Math.round((new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd)) / (1000 * 60 * 60 * 24)) +
    1;
  return `${daysDiff} Days Range`;
}

const INITIAL_FORM = {
  title: '',
  titleKn: '',
  startDate: '2026-08-15',
  endDate: '2026-08-15',
  isMultiDay: false,
  category: 'Public_Festival',
  isFlagHoistingDay: false,
  appliesTo: {
    students: true,
    teachers: true,
    nonTeachingStaff: true,
  },
  description: '',
};

export default function HolidayCalendarDesk() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('2026');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (yearFilter !== 'All') params.set('year', yearFilter);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);

      const res = await fetch(`/api/v1/holidays?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setHolidays(Array.isArray(data.holidays) ? data.holidays : []);
      } else {
        throw new Error(data.message || 'Failed to load holidays.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load holiday calendar.');
    } finally {
      setLoading(false);
    }
  }, [yearFilter, categoryFilter]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const filteredHolidays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return holidays;
    return holidays.filter(
      (h) =>
        String(h.title || '').toLowerCase().includes(q) ||
        String(h.titleKn || '').toLowerCase().includes(q) ||
        String(h.startDate || '').includes(q) ||
        String(h.category || '').toLowerCase().includes(q)
    );
  }, [holidays, searchQuery]);

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    const defaultYear = yearFilter === '2027' ? '2027' : '2026';
    setForm({
      ...INITIAL_FORM,
      startDate: `${defaultYear}-08-15`,
      endDate: `${defaultYear}-08-15`,
    });
    setModalOpen(true);
    setErrorMsg('');
  };

  const handleOpenEdit = (h) => {
    setEditingHoliday(h);
    setForm({
      title: h.title || '',
      titleKn: h.titleKn || '',
      startDate: h.startDate || '',
      endDate: h.endDate || h.startDate || '',
      isMultiDay: Boolean(h.endDate && h.endDate !== h.startDate),
      category: h.category || 'Public_Festival',
      isFlagHoistingDay: Boolean(h.isFlagHoistingDay),
      appliesTo: {
        students: h.appliesTo?.students !== false,
        teachers: h.appliesTo?.teachers !== false,
        nonTeachingStaff: h.appliesTo?.nonTeachingStaff !== false,
      },
      description: h.description || '',
    });
    setModalOpen(true);
    setErrorMsg('');
  };

  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) {
      setErrorMsg('Holiday title and start date are required.');
      return;
    }

    const finalEndDate = form.isMultiDay ? form.endDate || form.startDate : form.startDate;
    if (finalEndDate < form.startDate) {
      setErrorMsg('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const url = editingHoliday
        ? `/api/v1/holidays/${editingHoliday._id}`
        : '/api/v1/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          titleKn: form.titleKn.trim(),
          startDate: form.startDate,
          endDate: finalEndDate,
          category: form.category,
          isFlagHoistingDay: Boolean(form.isFlagHoistingDay),
          appliesTo: form.appliesTo,
          description: form.description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save holiday.');
      }

      setModalOpen(false);
      setFeedback(data.message || 'Holiday saved successfully!');
      setTimeout(() => setFeedback(''), 4000);
      fetchHolidays();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving holiday.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (h) => {
    if (!window.confirm(`Delete "${h.title}" (${h.startDate}) from the school calendar?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/holidays/${h._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete holiday.');
      }
      setFeedback(data.message || 'Holiday deleted.');
      setTimeout(() => setFeedback(''), 4000);
      fetchHolidays();
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete holiday.');
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/v1/holidays/seed-defaults', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to seed default holidays.');
      }
      setFeedback(data.message);
      setTimeout(() => setFeedback(''), 5000);
      fetchHolidays();
    } catch (err) {
      setErrorMsg(err.message || 'Could not seed default holidays.');
    } finally {
      setSeeding(false);
    }
  };

  const modalNode = modalOpen ? (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Add or Edit School Holiday"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-[#1A365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#D97706]/40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              Academic Calendar &amp; Attendance Sync
            </span>
            <h3 className="text-base font-serif font-bold">
              {editingHoliday ? 'Edit School Holiday / Break' : '+ Add Holiday / Term Break'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveHoliday} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
                Holiday Name (English) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ganesh Chaturthi"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
                Holiday Name (Kannada / ಕನ್ನಡ)
              </label>
              <input
                type="text"
                placeholder="e.g. ಗಣೇಶ ಚತುರ್ಥಿ"
                value={form.titleKn}
                onChange={(e) => setForm((p) => ({ ...p, titleKn: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-kannada"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="multiDayToggle"
              type="checkbox"
              checked={form.isMultiDay}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  isMultiDay: e.target.checked,
                  endDate: e.target.checked ? p.endDate || p.startDate : p.startDate,
                }))
              }
              className="w-4 h-4 rounded border-slate-300 text-[#1A365D]"
            />
            <label htmlFor="multiDayToggle" className="font-semibold text-[#1A365D] cursor-pointer">
              Multi-day Vacation / Term Break (Date Range)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
                {form.isMultiDay ? 'Start Date *' : 'Holiday Date *'}
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    startDate: e.target.value,
                    endDate: p.isMultiDay ? p.endDate : e.target.value,
                  }))
                }
                className="w-full p-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono"
              />
            </div>

            {form.isMultiDay && (
              <div>
                <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm"
              >
                <option value="Public_Festival">Public Festival</option>
                <option value="National_Holiday">National Holiday</option>
                <option value="Term_Break">Term Break / Vacation</option>
                <option value="Local_Holiday">Local / District Holiday</option>
              </select>
            </div>

            <label className="flex items-center gap-2 pt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFlagHoistingDay}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isFlagHoistingDay: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-[#D97706]"
              />
              <span className="font-semibold text-slate-700">
                Flag Hoisting / Campus Observance
              </span>
            </label>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
            <span className="block font-bold uppercase text-[10px] tracking-wider text-slate-500">
              Holiday Applies To (Attendance Sync)
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { key: 'students', label: 'Students' },
                { key: 'teachers', label: 'Teachers' },
                { key: 'nonTeachingStaff', label: 'Non-Teaching Staff' },
              ].map((item) => (
                <label key={item.key} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.appliesTo[item.key])}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        appliesTo: { ...p.appliesTo, [item.key]: e.target.checked },
                      }))
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#1A365D]"
                  />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-[11px] text-slate-600 mb-1">
              Optional Note / Circular Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Campus flag hoisting at 8:30 AM..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#1A365D] hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold shadow-sm cursor-pointer"
            >
              {submitting ? 'Saving...' : editingHoliday ? 'Save Changes' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              2026 &amp; 2027 Karnataka Academic Calendar • Attendance Synced
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A365D]">
              School Holiday Calendar ({filteredHolidays.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Holidays here automatically lock daily roll-call alerts and exclude non-working days from Student &amp; Staff attendance rates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchHolidays}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            title="Refresh holiday calendar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                disabled={seeding}
                onClick={handleSeedDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{seeding ? 'Seeding...' : 'Seed 2026/27 Defaults'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1A365D] hover:bg-brand-navyDark text-white font-bold text-xs shadow-sm border border-[#D97706]/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Add Holiday / Term Break</span>
              </button>
            </>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar: Year Tabs + Category Pills + Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {['2026', '2027', 'All'].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setYearFilter(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  yearFilter === yr
                    ? 'bg-[#1A365D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                {yr === 'All' ? 'All Years' : yr}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-[#1A365D] bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Public_Festival">Public Festivals</option>
            <option value="National_Holiday">National Holidays</option>
            <option value="Term_Break">Term Breaks / Vacations</option>
            <option value="Local_Holiday">Local Holidays</option>
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holiday name, Kannada, date..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
          />
        </div>
      </div>

      {/* Holiday List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading 2026 &amp; 2027 school holiday calendar...
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-serif font-bold text-[#1A365D] text-sm">
              No holidays match your filter
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Date(s)</th>
                  <th className="py-3 px-4">Day / Span</th>
                  <th className="py-3 px-4">Holiday Name (English &amp; ಕನ್ನಡ)</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Applies To</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHolidays.map((h) => {
                  const cat = CATEGORY_META[h.category] || CATEGORY_META.Public_Festival;
                  const isRange = h.endDate && h.endDate !== h.startDate;
                  return (
                    <tr key={h._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-[#1A365D]">
                        {formatDateReadable(h.startDate)}
                        {isRange && (
                          <span className="block text-[10px] text-indigo-700 font-semibold">
                            to {formatDateReadable(h.endDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {getDayOfWeekLabel(h.startDate, h.endDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1A365D] flex items-center gap-1.5 flex-wrap">
                          <span>{h.title}</span>
                          {h.isFlagHoistingDay && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[9.5px] font-bold">
                              <Flag className="w-2.5 h-2.5 text-[#D97706]" />
                              Flag Hoisting
                            </span>
                          )}
                        </div>
                        {h.titleKn && (
                          <div className="text-[11px] text-slate-600 font-kannada mt-0.5">
                            {h.titleKn}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.badge}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          {h.appliesTo?.students !== false && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              Students
                            </span>
                          )}
                          {h.appliesTo?.teachers !== false && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              Teachers
                            </span>
                          )}
                          {h.appliesTo?.nonTeachingStaff !== false && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              Staff
                            </span>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(h)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-[#1A365D] cursor-pointer"
                              title="Edit Holiday"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#D97706]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(h)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalNode &&
        (typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode)}
    </div>
  );
}
