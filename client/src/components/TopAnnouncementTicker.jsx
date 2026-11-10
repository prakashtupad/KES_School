import React, { useState, useEffect } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function TopAnnouncementTicker({
  publicCelebrants: propCelebrants = null,
}) {
  const [index, setIndex] = useState(0);
  const [celebrants, setCelebrants] = useState(
    propCelebrants || { students: [], staff: [] }
  );
  const [enableTicker, setEnableTicker] = useState(true);

  useEffect(() => {
    if (propCelebrants) {
      setCelebrants(propCelebrants);
      return;
    }

    let active = true;
    fetch('/api/v1/content/today-birthdays')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data || data.success === false) return;
        if (data.settings && typeof data.settings.enableBirthdayTicker === 'boolean') {
          setEnableTicker(data.settings.enableBirthdayTicker);
        }
        if (data.publicCelebrants) {
          setCelebrants(data.publicCelebrants);
        } else if (data.students || data.staff) {
          setCelebrants({
            students: data.students || [],
            staff: data.staff || [],
          });
        }
      })
      .catch(() => {
        // Silent fallback to standard admission announcement
      });

    return () => {
      active = false;
    };
  }, [propCelebrants]);

  const slides = [
    {
      id: 'admission',
      badge: 'Admissions Open',
      badgeClass: 'bg-brand-gold text-brand-navyDark',
      content: (
        <span>
          <span className="placeholder-badge">{SCHOOL_INFO.admissionYear}</span> (
          <span className="text-brand-goldSoft font-semibold">
            {SCHOOL_INFO.prePrimaryGrades}
          </span>
          )<span className="hidden sm:inline"> • Enquire online today</span>
        </span>
      ),
    },
  ];

  if (enableTicker && celebrants.students && celebrants.students.length > 0) {
    const studentNames = celebrants.students
      .map((s) => `${s.displayName || s.studentName} (${s.grade})`)
      .join(' & ');
    slides.push({
      id: 'student-birthdays',
      badge: 'Birthday Wishes',
      badgeClass: 'bg-amber-400 text-brand-navyDark',
      content: (
        <span className="text-amber-200 font-semibold">
          🎉 Happy Birthday to {studentNames}! Wishing you joy and success! 🎂
        </span>
      ),
    });
  }

  if (enableTicker && celebrants.staff && celebrants.staff.length > 0) {
    const staffNames = celebrants.staff
      .map((st) => `${st.displayName} (${st.role})`)
      .join(', ');
    slides.push({
      id: 'staff-birthdays',
      badge: 'Faculty Celebration',
      badgeClass: 'bg-amber-400 text-brand-navyDark',
      content: (
        <span className="text-amber-200 font-semibold">
          💐 Heartiest Birthday Wishes to {staffNames}! KES Management wishes you good health &amp; success. ✨
        </span>
      ),
    });
  }

  useEffect(() => {
    if (slides.length <= 1) {
      setIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[index % slides.length] || slides[0];

  return (
    <div className="bg-brand-navyDark text-white text-xs py-2 px-3 sm:px-6 border-b border-brand-gold/30 overflow-hidden transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-1.5 text-center lg:text-left">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center lg:justify-start transition-opacity duration-500">
          <span
            className={`${activeSlide.badgeClass} font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider`}
          >
            {activeSlide.badge}
          </span>
          {activeSlide.content}
          {slides.length > 1 && (
            <span className="inline-flex items-center gap-1 ml-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(idx)}
                  aria-label={`Announcement slide ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === index % slides.length
                      ? 'bg-brand-gold w-3'
                      : 'bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </span>
          )}
        </div>

        <div className="text-slate-300 text-[11px] sm:text-xs flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <a
            href={SCHOOL_INFO.phoneHref}
            className="hover:text-white transition inline-flex items-center gap-1"
            title="Call School Admissions Desk"
          >
            <span>📞</span>
            <span className="placeholder-badge">{SCHOOL_INFO.phoneDisplay}</span>
          </a>
          <span className="hidden sm:inline text-slate-500">|</span>
          <a
            href={`mailto:${SCHOOL_INFO.email}`}
            className="hidden sm:inline-flex hover:text-white transition items-center gap-1"
            title="Email School Office"
          >
            <span>✉️</span>
            <span className="text-brand-goldSoft font-mono">{SCHOOL_INFO.email}</span>
          </a>
          <span className="text-slate-500">|</span>
          <a
            href={SCHOOL_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-goldLight transition inline-flex items-center gap-1 font-medium text-brand-goldSoft"
            title="Follow Khanatti Education Society on Instagram"
          >
            <span>Instagram</span>
          </a>
          <span className="text-slate-500">•</span>
          <a
            href={SCHOOL_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-goldLight transition inline-flex items-center gap-1 font-medium text-brand-goldSoft"
            title="Visit Khanatti Education Society on Facebook"
          >
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
}
