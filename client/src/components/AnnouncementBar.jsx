import React from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function AnnouncementBar() {
  return (
    <div className="bg-brand-navyDark text-white text-xs py-2 px-3 sm:px-6 border-b border-brand-gold/30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-1.5 text-center lg:text-left">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center lg:justify-start">
          <span className="bg-brand-gold text-brand-navyDark font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Admissions Open
          </span>
          <span>
            <span className="placeholder-badge">{SCHOOL_INFO.admissionYear}</span> (
            <span className="text-brand-goldSoft font-semibold">{SCHOOL_INFO.prePrimaryGrades}</span>)
            <span className="hidden sm:inline"> • Enquire online today</span>
          </span>
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
