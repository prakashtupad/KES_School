import React from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function AdmissionsCallout() {
  return (
    <section
      id="admissions"
      className="py-12 bg-gradient-to-r from-brand-navy to-brand-navyDark text-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/10 rounded-2xl p-6 sm:p-10 border border-brand-gold/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="bg-brand-gold text-brand-navyDark font-bold px-2.5 py-1 rounded text-xs uppercase tracking-wider inline-block mb-3">
              Admissions Enquiry
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
              Admissions for Academic Year{' '}
              <span className="placeholder-badge">{SCHOOL_INFO.admissionYear}</span>
            </h2>
            <p className="text-slate-200 text-sm mt-2 leading-relaxed">
              Seeking admission for your child? We welcome parents and guardians to discuss entry
              for <span className="placeholder-badge">{SCHOOL_INFO.classesOffered}</span>. Contact
              our desk or submit the quick online enquiry form below.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href="#enquiry"
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-6 py-3.5 rounded-lg shadow-lg transition duration-150 inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <span>Go to Enquiry Form</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
