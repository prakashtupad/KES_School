import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Sparkles, Flag, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_STYLE = {
  Public_Festival: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  National_Holiday: 'bg-amber-100 text-amber-900 border-amber-300',
  Term_Break: 'bg-purple-100 text-purple-900 border-purple-200',
  Local_Holiday: 'bg-teal-100 text-teal-800 border-teal-200',
};

function formatShortDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return { day: '—', month: '', full: '' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    day: String(d).padStart(2, '0'),
    month: dt.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    year: String(y),
    weekday: dt.toLocaleDateString('en-IN', { weekday: 'short' }),
    full: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

export default function UpcomingHolidaysSection() {
  const { language, t } = useLanguage();
  const isKn = language === 'kn';

  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalYear, setModalYear] = useState('2026');
  const [allYearHolidays, setAllYearHolidays] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/holidays?upcoming=true&limit=6')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.holidays)) {
          setUpcoming(data.holidays);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    let active = true;
    setLoadingModal(true);
    fetch(`/api/v1/holidays?year=${modalYear}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && Array.isArray(data.holidays)) {
          setAllYearHolidays(data.holidays);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingModal(false);
      });
    return () => {
      active = false;
    };
  }, [modalOpen, modalYear]);

  if (!loading && upcoming.length === 0) return null;

  const fullCalendarModal = modalOpen ? (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Full Academic Holiday Calendar"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        <div className="bg-[#1A365D] text-white px-5 py-4 flex items-center justify-between border-b-2 border-[#D97706]">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-[#D97706]" />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold block">
                {t('holidays.publicEyebrow')}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {t('holidays.fullCalendarTitle')} ({modalYear})
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
            {['2026', '2027'].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setModalYear(yr)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  modalYear === yr
                    ? 'bg-[#1A365D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {allYearHolidays.length} {t('holidays.holidaysListed')}
          </span>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
          {loadingModal ? (
            <div className="py-10 text-center text-xs text-slate-500">
              {t('common.loading')}
            </div>
          ) : (
            allYearHolidays.map((h) => {
              const dt = formatShortDate(h.startDate);
              const endDt = h.endDate && h.endDate !== h.startDate ? formatShortDate(h.endDate) : null;
              const badgeStyle = CATEGORY_STYLE[h.category] || CATEGORY_STYLE.Public_Festival;
              return (
                <div
                  key={h._id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center flex-shrink-0 text-indigo-900">
                    <span className="text-[9px] font-bold uppercase">{dt.month}</span>
                    <span className="text-base font-mono font-extrabold leading-none">
                      {dt.day}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-[#1A365D] truncate">
                      {isKn && h.titleKn ? h.titleKn : h.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {endDt ? `${dt.full} – ${endDt.full}` : `${dt.full} (${dt.weekday})`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section id="academic-calendar" className="py-12 sm:py-16 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D97706]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('holidays.publicEyebrow')}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A365D] mt-1">
              {t('holidays.publicHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {t('holidays.publicSubheading')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark text-white text-xs sm:text-sm font-bold shadow-sm border border-[#D97706]/40 transition cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-[#D97706]" />
            <span>{t('holidays.viewFullCalendar')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D97706]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((h) => {
            const dt = formatShortDate(h.startDate);
            const endDt = h.endDate && h.endDate !== h.startDate ? formatShortDate(h.endDate) : null;
            const badgeStyle = CATEGORY_STYLE[h.category] || CATEGORY_STYLE.Public_Festival;
            return (
              <div
                key={h._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex items-start gap-3.5"
              >
                <div className="w-14 h-14 rounded-xl bg-[#1A365D] text-white flex flex-col items-center justify-center flex-shrink-0 border-b-2 border-[#D97706] shadow-xs">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                    {dt.month}
                  </span>
                  <span className="text-xl font-mono font-extrabold leading-none mt-0.5">
                    {dt.day}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}
                    >
                      {h.category.replace('_', ' ')}
                    </span>
                    {h.isFlagHoistingDay && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#D97706]">
                        <Flag className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1A365D] leading-snug truncate">
                    {isKn && h.titleKn ? h.titleKn : h.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {endDt
                      ? `${dt.full} – ${endDt.full}`
                      : `${dt.weekday}, ${dt.full}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {fullCalendarModal &&
        (typeof document !== 'undefined'
          ? createPortal(fullCalendarModal, document.body)
          : fullCalendarModal)}
    </section>
  );
}
