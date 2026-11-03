import React, { useState } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

const NAV_ITEMS = [
  { label: 'Home', href: '#home', isPrimary: true },
  { label: 'About Us', href: '#about' },
  { label: 'Admissions', href: '#admissions' },
  { label: 'Campus Life', href: '#campus-life' },
  { label: 'News & Events', href: '#news' },
  { label: 'Contact Us', href: '#contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
        {/* School Identity & Emblem */}
        <a
          href="#home"
          className="flex items-center gap-3.5 group flex-shrink-0"
          onClick={handleCloseMenu}
        >
          <img
            src={SCHOOL_INFO.logoUrl}
            alt="Shri Siddharoodha English Medium School Khanatti Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-contain border-2 border-brand-gold shadow-sm flex-shrink-0 bg-white p-0.5"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {SCHOOL_INFO.societyName}
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {SCHOOL_INFO.registrationNo}
              </span>
            </div>
            <h1 className="text-sm sm:text-base xl:text-lg font-bold text-brand-navy leading-snug font-serif group-hover:text-brand-navyLight transition">
              {SCHOOL_INFO.schoolName}
            </h1>
            <span className="text-xs font-semibold text-brand-gold flex items-center gap-1">
              {SCHOOL_INFO.shortLocation}
            </span>
          </div>
        </a>

        {/* Desktop Nav - Spacious & Single-Line (No Wrapping) */}
        <nav
          className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-700"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap py-1.5 border-b-2 transition-colors duration-150 ${
                item.isPrimary
                  ? 'text-brand-navy font-semibold border-brand-gold'
                  : 'border-transparent hover:text-brand-navy hover:border-brand-gold/60'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
          <a
            href={SCHOOL_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            title={`Instagram: ${SCHOOL_INFO.instagramHandle}`}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50/50 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href={SCHOOL_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Facebook"
            title="Visit Khanatti Education Society on Facebook"
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
            </svg>
          </a>
          <a
            href="#enquiry"
            className="whitespace-nowrap bg-brand-navy hover:bg-brand-navyDark text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm border border-brand-gold/40 hover:border-brand-gold transition duration-150 inline-flex items-center gap-2"
          >
            <span>Enquire About Admission</span>
            <svg
              className="w-4 h-4 text-brand-gold flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          id="mobileMenuBtn"
          type="button"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobileMenu"
          aria-label="Toggle navigation menu"
          onClick={handleToggleMenu}
          className="lg:hidden p-2 rounded-md text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition focus:outline-none flex-shrink-0"
        >
          {!mobileMenuOpen ? (
            <svg
              id="menuOpenIcon"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          ) : (
            <svg
              id="menuCloseIcon"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobileMenu"
          className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg transition-all duration-200"
        >
          <nav
            className="flex flex-col space-y-1 text-base font-medium text-slate-700"
            aria-label="Mobile Navigation"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleCloseMenu}
                className={`mobile-nav-link px-3 py-2 rounded-md hover:bg-slate-50 hover:text-brand-navy ${
                  item.isPrimary ? 'text-brand-navy font-semibold' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 space-y-2">
            <a
              href="#enquiry"
              onClick={handleCloseMenu}
              className="mobile-nav-link w-full text-center bg-brand-navy text-white font-semibold py-2.5 px-4 rounded-md shadow flex items-center justify-center gap-2"
            >
              <span>Enquire About Admission</span>
              <svg
                className="w-4 h-4 text-brand-gold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-1 text-xs text-slate-600">
              <a href={SCHOOL_INFO.phoneHref} className="font-semibold text-brand-navy">
                📞 {SCHOOL_INFO.phoneDisplay}
              </a>
              <div className="flex items-center gap-3">
                <a
                  href={SCHOOL_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-pink-700 hover:underline"
                >
                  Instagram
                </a>
                <a
                  href={SCHOOL_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-700 hover:underline"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
