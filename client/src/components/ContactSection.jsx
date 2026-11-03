import React from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function ContactSection() {
  return (
    <section id="contact" className="py-12 sm:py-16 bg-brand-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
            Reach Out
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy mt-1">
            Contact &amp; Location
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Visiting the campus or reaching the office desk for queries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-navy">
                School Office Information
              </h3>
              <span className="text-[11px] font-mono font-semibold text-brand-navy bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {SCHOOL_INFO.registrationNo}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded bg-slate-100 text-brand-navy font-bold text-sm">📍</span>
              <div>
                <strong className="text-xs uppercase text-slate-500 tracking-wider block">
                  Postal Address
                </strong>
                <p className="text-sm text-slate-700 font-medium">
                  Khanatti Education Society’s
                  <br />
                  Shri Siddharoodha English Medium School
                </p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  <span className="placeholder-badge">Khanatti Village</span>, Gokak Taluk, Belagavi
                  District, Karnataka - 591233
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded bg-slate-100 text-brand-navy font-bold text-sm">📞</span>
              <div>
                <strong className="text-xs uppercase text-slate-500 tracking-wider block">
                  Phone &amp; WhatsApp Contacts
                </strong>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <a
                    href={SCHOOL_INFO.phoneHref}
                    className="placeholder-badge hover:border-brand-navy transition"
                  >
                    {SCHOOL_INFO.phoneDisplay}
                  </a>
                  <a
                    href={SCHOOL_INFO.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded bg-slate-100 text-brand-navy font-bold text-sm">✉️</span>
              <div>
                <strong className="text-xs uppercase text-slate-500 tracking-wider block">
                  Email Address
                </strong>
                <p className="text-sm text-slate-700 font-mono mt-1">
                  <a
                    href={`mailto:${SCHOOL_INFO.email}`}
                    className="placeholder-badge hover:border-brand-navy transition"
                  >
                    {SCHOOL_INFO.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded bg-slate-100 text-brand-navy font-bold text-sm">🌐</span>
              <div>
                <strong className="text-xs uppercase text-slate-500 tracking-wider block">
                  Official Social Media
                </strong>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <a
                    href={SCHOOL_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="placeholder-badge hover:border-brand-navy transition"
                  >
                    Instagram: {SCHOOL_INFO.instagramHandle}
                  </a>
                  <a
                    href={SCHOOL_INFO.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="placeholder-badge hover:border-brand-navy transition"
                  >
                    Facebook: Khanatti Education Society
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-2 rounded bg-slate-100 text-brand-navy font-bold text-sm">⏰</span>
              <div>
                <strong className="text-xs uppercase text-slate-500 tracking-wider block">
                  Office Hours
                </strong>
                <p className="text-sm text-slate-700 font-mono mt-1">
                  <span className="placeholder-badge">{SCHOOL_INFO.officeHours}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Map Link Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-navy border-b border-slate-100 pb-3 mb-4">
                Location &amp; Map
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">
                The school is located in Khanatti village, Gokak Taluk. Parents and visitors are
                requested to check office timings prior to in-person campus visits.
              </p>

              {/* Embedded Google Map for Khanatti, Gokak Taluk */}
              <div className="w-full aspect-[16/9] bg-slate-100 rounded-lg border border-slate-300 overflow-hidden relative">
                <iframe
                  title="Khanatti, Gokak Taluk, Belagavi Location Map"
                  src="https://www.google.com/maps?q=Khanatti,Gokak,Belagavi,Karnataka&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Location: <span className="placeholder-badge">Khanatti, Gokak Taluk</span>
              </span>
              <a
                href={SCHOOL_INFO.mapQueryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-navy hover:text-brand-gold inline-flex items-center gap-1 transition"
              >
                <span>Open in Maps</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
