import React, { useEffect, useState } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';
import { fetchSchoolNotices } from '../services/api';

const FALLBACK_NOTICES = [
  {
    _id: 'notice-1',
    category: 'Notice',
    dateBadge: '2026–27 Session',
    title: 'Admission Process & Form Issuance',
    content: (
      <>
        Parents can enquire for admission for the academic year{' '}
        <span className="placeholder-badge">{SCHOOL_INFO.admissionYear}</span>. Enquiries accepted
        at the school office during working hours.
      </>
    ),
    statusLabel: 'Status: Active',
    issuedBy: 'Office Desk',
  },
  {
    _id: 'notice-2',
    category: 'Event',
    dateBadge: 'Monthly Schedule',
    title: 'Parent-Teacher Consultation Meeting',
    content:
      'Regular academic review and interaction with guardians regarding attendance and student progress. Exact date to be notified through class circulars.',
    statusLabel: 'Notice for: All Parents',
    issuedBy: 'Main Campus',
  },
  {
    _id: 'notice-3',
    category: 'Academic',
    dateBadge: 'Academic Calendar',
    title: 'Term Assessment & Timetable',
    content: (
      <>
        Examination timetable for classes{' '}
        <span className="placeholder-badge">{SCHOOL_INFO.classesOffered}</span> will be posted on
        the school notice board and distributed to students.
      </>
    ),
    statusLabel: 'Notice for: Students',
    issuedBy: 'Notice Board',
  },
];

export default function NewsSection() {
  const [notices, setNotices] = useState(FALLBACK_NOTICES);

  useEffect(() => {
    let isMounted = true;
    fetchSchoolNotices()
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          // Only override if custom notices from DB are returned beyond default fallback IDs
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

  return (
    <section id="news" className="py-12 sm:py-16 bg-brand-cream border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
              Official Notices
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy mt-1">
              News &amp; School Updates
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {notices.map((item) => {
            const formattedDate =
              item.dateBadge ||
              (item.publishDate
                ? new Date(item.publishDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : SCHOOL_INFO.admissionYear);

            return (
              <article
                key={item._id || item.title}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-brand-gold/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-brand-gold mb-2">
                    {item.category || 'Notice'} •{' '}
                    <span className="placeholder-badge">{formattedDate}</span>
                  </div>
                  <h3 className="font-bold text-brand-navy text-base mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                    {item.content}
                  </p>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>
                    {item.statusLabel || `Notice for: ${item.targetAudience || 'All Parents'}`}
                  </span>
                  <span className="text-brand-navy font-semibold">
                    {item.issuedBy || 'Office Desk'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
