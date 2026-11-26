import React, { useState, useEffect } from 'react';
import { Phone, Mail, Bell, Zap } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

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
      node: (
        <a
          href="#enquiry"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('enquiry');
          }}
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-200 hover:text-white font-semibold text-[10px] sm:text-[11px] max-w-full transition cursor-pointer"
          title="Open Admission Enquiry Form"
        >
          <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F59E0B] flex-shrink-0" />
          <span className="truncate">Admission open 2027-28</span>
        </a>
      ),
    },
  ];

  if (enableTicker && celebrants.students && celebrants.students.length > 0) {
    const studentNames = celebrants.students
      .map((s) => `${s.displayName || s.studentName} (${s.grade})`)
      .join(' & ');
    slides.push({
      id: 'student-birthdays',
      node: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 font-semibold text-[11px] truncate max-w-[180px] sm:max-w-none">
          <span>🎉 Happy Birthday {studentNames}!</span>
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
      node: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-200 font-semibold text-[11px] truncate max-w-[180px] sm:max-w-none">
          <span>💐 Birthday Wishes to {staffNames}!</span>
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
    <div className="bg-brand-navyDark text-white text-xs py-1.5 sm:py-2 px-2 sm:px-6 border-b border-brand-gold/30 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Phone (+ Email on lg+) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <a
            href={SCHOOL_INFO.phoneHref}
            className="inline-flex items-center gap-1 text-slate-200 hover:text-white transition font-medium text-[10px] sm:text-xs whitespace-nowrap"
            title="Call School Admissions Desk"
          >
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 flex-shrink-0" />
            <span>{SCHOOL_INFO.phoneDisplay}</span>
          </a>

          <a
            href={`mailto:${SCHOOL_INFO.email}`}
            className="hidden lg:inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition text-xs whitespace-nowrap"
            title="Email School Office"
          >
            <Mail className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
            <span className="text-brand-goldSoft font-mono">{SCHOOL_INFO.email}</span>
          </a>
        </div>

        {/* Center: Single-Row Catchy Admissions Pill (links directly to #enquiry) */}
        <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden">
          {activeSlide.node}
        </div>

        {/* Right: Compact Instagram, Facebook & Notices Bell Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <a
            href={SCHOOL_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Follow Khanatti Education Society on Instagram"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white hover:opacity-90 transition"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          <a
            href={SCHOOL_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            title="Visit Khanatti Education Society on Facebook"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:opacity-90 transition"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.5v3h2.8v8h3.2z" />
            </svg>
          </a>

          <a
            href="#news"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('news');
            }}
            aria-label="School Notices"
            title="View School Notices & Circulars"
            className="p-0.5 sm:p-1 text-slate-200 hover:text-amber-300 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
