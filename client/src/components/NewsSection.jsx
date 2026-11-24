import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, Calendar, Megaphone, Pin } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';
import { fetchSchoolNotices } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FILTER_TABS = [
  { id: 'all', label: 'All Notices' },
  { id: 'academic', label: 'Academic' },
  { id: 'events', label: 'Holidays & Events' },
  { id: 'circulars', label: 'Circulars' },
];

const FALLBACK_NOTICES = [
  {
    _id: 'notice-1',
    category: 'Notice',
    dateBadge: '2026–27 Session',
    title: 'Admission Process & Form Issuance',
    content: `Parents can enquire for admission for the academic year ${SCHOOL_INFO.admissionYear}. Enquiries are accepted at the school office during working hours.`,
    targetAudience: 'All Parents',
    issuedBy: 'Office Desk',
  },
  {
    _id: 'notice-2',
    category: 'Event',
    dateBadge: 'Monthly Schedule',
    title: 'Parent-Teacher Consultation Meeting',
    content:
      'Regular academic review and interaction with guardians regarding attendance and student progress. Exact date to be notified through class circulars.',
    targetAudience: 'All Parents',
    issuedBy: 'Main Campus',
  },
  {
    _id: 'notice-3',
    category: 'Academic',
    dateBadge: 'Academic Calendar',
    title: 'Term Assessment & Timetable',
    content: `Examination timetable for classes ${SCHOOL_INFO.classesOffered} will be posted on the school notice board and distributed to students.`,
    targetAudience: 'Students & Parents',
    issuedBy: 'Academic Desk',
  },
];

function getCategoryStyle(category = 'Notice') {
  const normalized = String(category).trim().toLowerCase();
  if (normalized === 'circular') {
    return {
      label: 'CIRCULAR',
      Icon: Bell,
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    };
  }
  if (normalized === 'event' || normalized === 'holiday') {
    return {
      label: 'EVENT',
      Icon: Megaphone,
      badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200/70',
    };
  }
  if (normalized === 'academic') {
    return {
      label: 'ACADEMIC',
      Icon: BookOpen,
      badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200/70',
    };
  }
  return {
    label: 'NOTICE',
    Icon: Pin,
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/70',
  };
}

function getTargetText(item) {
  if (item.targetAudience && String(item.targetAudience).trim()) {
    return String(item.targetAudience).trim();
  }
  if (item.statusLabel) {
    return String(item.statusLabel)
      .replace(/^Notice for:\s*/i, '')
      .replace(/^Status:\s*/i, '')
      .trim();
  }
  return 'All Parents';
}

export default function NewsSection() {
  const { tContent } = useLanguage();
  const [notices, setNotices] = useState(FALLBACK_NOTICES);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    fetchSchoolNotices()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const hasCustomDbNotices = res.data.some(
            (n) => !String(n._id).startsWith('notice-')
          );
          if (hasCustomDbNotices) {
            setNotices(res.data);
          }
        }
      })
      .catch(() => {
        // Keep verified fallback notices
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotices = useMemo(() => {
    if (activeFilter === 'all') return notices;
    return notices.filter((item) => {
      const cat = String(item.category || 'Notice').trim().toLowerCase();
      if (activeFilter === 'academic') return cat === 'academic';
      if (activeFilter === 'events') return cat === 'event' || cat === 'holiday';
      if (activeFilter === 'circulars') return cat === 'circular' || cat === 'notice';
      return true;
    });
  }, [notices, activeFilter]);

  return (
    <section id="news" className="py-12 sm:py-16 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header + Segmented Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-[#D97706] uppercase tracking-wider block">
              OFFICIAL ANNOUNCEMENTS &amp; CIRCULARS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A365D] mt-1">
              School Notices &amp; Latest Circulars
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Stay updated with important announcements, events, and academic schedules.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter school notices"
            className="inline-flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start lg:self-auto"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1A365D] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#1A365D] hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notices Grid */}
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2.5 shadow-sm">
            <p className="font-serif font-bold text-[#1A365D] text-base">
              No notices found in this category
            </p>
            <p className="text-xs text-slate-500">
              Switch back to view all active school announcements and circulars.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1A365D] hover:bg-[#142a4a] text-white text-xs font-bold transition cursor-pointer"
            >
              View All Notices
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredNotices.map((item) => {
              const formattedDate =
                item.dateBadge ||
                (item.publishDate
                  ? new Date(item.publishDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : SCHOOL_INFO.admissionYear);

              const { label, Icon, badgeClass } = getCategoryStyle(item.category);
              const targetText = getTargetText(item);

              return (
                <article
                  key={item._id || item.title}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category Pill & Gold Date Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{label}</span>
                      </span>

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-semibold whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-[#D97706]" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-[#1A365D] text-base sm:text-[17px] leading-snug mb-2">
                      {tContent(item, 'title')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 whitespace-pre-line">
                      {typeof item.content === 'string'
                        ? tContent(item, 'content')
                        : item.content}
                    </p>
                  </div>

                  {/* Bottom Footer */}
                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="truncate">
                      Target: <strong className="font-medium text-slate-600">{targetText}</strong>
                    </span>
                    <span className="whitespace-nowrap">
                      Published by:{' '}
                      <strong className="font-semibold text-slate-700">
                        {item.issuedBy || 'Office Desk'}
                      </strong>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
