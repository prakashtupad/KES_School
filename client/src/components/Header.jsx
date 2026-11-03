import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* School Identity & Emblem */}
        <a
          href="#home"
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0 flex-1 lg:flex-initial"
          onClick={handleCloseMenu}
        >
          <img
            src={SCHOOL_INFO.logoUrl}
            alt="Shri Siddharoodha English Medium School Khanatti Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 xl:w-14 xl:h-14 rounded-full object-contain border-2 border-brand-gold shadow-sm flex-shrink-0 bg-white p-0.5"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {SCHOOL_INFO.societyName}
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {SCHOOL_INFO.registrationNo}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm md:text-base xl:text-lg font-bold text-brand-navy leading-snug font-serif group-hover:text-brand-navyLight transition truncate sm:whitespace-normal">
              {SCHOOL_INFO.schoolName}
            </h1>
            <span className="text-[11px] sm:text-xs font-semibold text-brand-gold flex items-center gap-1">
              {SCHOOL_INFO.shortLocation}
            </span>
          </div>
        </a>

        {/* Desktop Nav - Visible on xl+ screens so medium/iPad screens never crowd */}
        <nav
          className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-700 flex-shrink-0"
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

        {/* Right Side Controls (Responsive for Mobile, iPad/Tablet, and Desktop) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tablet & Desktop Action Buttons (md and up) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/portal/login"
              title="Staff & Teacher Portal Login"
              className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-brand-navy hover:border-brand-gold/50 hover:bg-slate-50 transition"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Staff Portal</span>
            </Link>

            <a
              href="#enquiry"
              className="whitespace-nowrap bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-semibold px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg shadow-sm border border-brand-gold/40 hover:border-brand-gold transition duration-150 inline-flex items-center gap-1.5"
            >
              <span className="hidden lg:inline">Enquire About Admission</span>
              <span className="lg:hidden">Enquire Now</span>
              <svg
                className="w-3.5 h-3.5 text-brand-gold flex-shrink-0"
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

          {/* Hamburger Menu Button (Visible below xl) */}
          <button
            id="mobileMenuBtn"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobileMenu"
            aria-label="Toggle navigation menu"
            onClick={handleToggleMenu}
            className="xl:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-brand-navy hover:bg-slate-100 transition focus:outline-none flex-shrink-0"
          >
            {!mobileMenuOpen ? (
              <svg
                id="menuOpenIcon"
                className="w-5 h-5 sm:w-6 sm:h-6"
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
                className="w-5 h-5 sm:w-6 sm:h-6"
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
      </div>

      {/* Mobile & Tablet Drawer Menu (Visible below xl) */}
      {mobileMenuOpen && (
        <div
          id="mobileMenu"
          className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-3 shadow-lg transition-all duration-200"
        >
          <nav
            className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm sm:text-base font-medium text-slate-700"
            aria-label="Mobile Navigation"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleCloseMenu}
                className={`mobile-nav-link px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-brand-navy ${
                  item.isPrimary ? 'text-brand-navy font-semibold bg-slate-50/80' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
            <Link
              to="/portal/login"
              onClick={handleCloseMenu}
              className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-brand-navy font-semibold py-2.5 px-4 rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Lock className="w-4 h-4 text-brand-gold" />
              <span>Staff &amp; Teacher Portal</span>
            </Link>
            <a
              href="#enquiry"
              onClick={handleCloseMenu}
              className="mobile-nav-link flex-1 text-center bg-brand-navy hover:bg-brand-navyDark text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2 text-xs sm:text-sm"
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
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1 text-xs text-slate-600">
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
      )}
    </header>
  );
}
