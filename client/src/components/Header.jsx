import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

const NAV_ITEMS = [
  { key: 'nav.home', href: '#home', isPrimary: true },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.leadership', href: '#leadership' },
  { key: 'nav.admissions', href: '#admissions' },
  { key: 'nav.campusLife', href: '#campus-life' },
  { key: 'nav.news', href: '#news' },
  { key: 'nav.contact', href: '#contact' },
];

export default function Header() {
  const { t } = useLanguage();
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith('/portal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md shadow-sm ${
        !isPortalRoute
          ? 'bg-[#1A365D] md:bg-white/95 border-b border-[#D97706]/40 md:border-slate-200 pt-[env(safe-area-inset-top)] md:pt-0'
          : 'bg-white/95 border-b border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
        {/* School Identity & Emblem — Fixed No-Wrap on Desktop so School Name Never Wraps */}
        <a
          href="#home"
          className="flex items-center gap-2.5 sm:gap-3 group min-w-0 flex-1 md:flex-initial md:flex-shrink-0"
          onClick={handleCloseMenu}
        >
          <img
            src={SCHOOL_INFO.logoUrl}
            alt="Shri Siddharoodha English Medium School Khanatti Logo"
            className="w-9 h-9 md:w-12 md:h-12 xl:w-13 xl:h-13 rounded-full object-contain border-2 border-brand-gold shadow-sm flex-shrink-0 bg-white p-0.5"
          />
          <div className="min-w-0">
            <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                {t('common.societyName')}
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 whitespace-nowrap">
                {SCHOOL_INFO.registrationNo}
              </span>
            </div>
            <h1
              className={`text-[11px] sm:text-sm md:text-base xl:text-[17px] font-bold leading-tight sm:leading-snug font-serif transition whitespace-normal sm:whitespace-nowrap ${
                !isPortalRoute
                  ? 'text-white md:text-brand-navy md:group-hover:text-brand-navyLight'
                  : 'text-brand-navy group-hover:text-brand-navyLight'
              }`}
            >
              {t('common.schoolName')}
            </h1>
            <span
              className={`text-[10px] md:text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${
                !isPortalRoute ? 'text-amber-300 md:text-brand-gold' : 'text-brand-gold'
              }`}
            >
              {t('common.locationShort')}
            </span>
          </div>
        </a>

        {/* Desktop Nav - Visible on xl+ screens */}
        <nav
          className="hidden xl:flex items-center gap-3.5 2xl:gap-5 text-[13px] 2xl:text-sm font-medium text-slate-700 flex-shrink-0"
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
              {t(item.key)}
            </a>
          ))}
        </nav>

        {/* Right Side Controls (Desktop: All 3 stacked neatly in 1 vertical column so header never overflows) */}
        <div className="flex items-center gap-2 xl:ml-2 flex-shrink-0">
          {/* Tablet (Side-by-Side) & Desktop (Single Vertical Column: Language Toggle -> Staff/Student Portal -> Enquire About Admission) */}
          <div className="hidden md:flex md:flex-row xl:flex-col items-center xl:items-stretch justify-center gap-1.5 xl:gap-1">
            <LanguageToggle compact className="xl:w-full" />

            <Link
              to="/portal/login"
              title={t('nav.portalLogin')}
              className="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-2.5 py-1 xl:py-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-brand-navy hover:border-brand-gold/50 hover:bg-slate-50 transition"
            >
              <Lock className="w-3 h-3 text-brand-gold flex-shrink-0" />
              <span>{t('nav.portalLogin')}</span>
            </Link>

            <a
              href="#enquiry"
              className="whitespace-nowrap bg-brand-navy hover:bg-brand-navyDark text-white text-[11px] font-semibold px-2.5 py-1 xl:py-0.5 rounded-lg shadow-sm border border-brand-gold/40 hover:border-brand-gold transition duration-150 inline-flex items-center justify-center gap-1.5"
            >
              <span>{t('nav.enquireAdmission')}</span>
              <svg
                className="w-3 h-3 text-brand-gold flex-shrink-0"
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

          {/* Mobile Compact Language Toggle (visible below md on public site) */}
          {!isPortalRoute && (
            <LanguageToggle compact variant="dark" className="md:hidden" />
          )}

          {/* Hamburger Menu Button (Visible below xl) */}
          <button
            id="mobileMenuBtn"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobileMenu"
            aria-label="Toggle navigation menu"
            onClick={handleToggleMenu}
            className={`xl:hidden p-2 rounded-lg border transition focus:outline-none flex-shrink-0 ${
              !isPortalRoute
                ? 'border-white/25 text-white hover:bg-white/10 md:border-slate-200 md:text-slate-700 md:hover:text-brand-navy md:hover:bg-slate-100'
                : 'border-slate-200 text-slate-700 hover:text-brand-navy hover:bg-slate-100'
            }`}
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
                {t(item.key)}
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
              <span>{t('nav.portalLogin')}</span>
            </Link>
            <a
              href="#enquiry"
              onClick={handleCloseMenu}
              className="mobile-nav-link flex-1 text-center bg-brand-navy hover:bg-brand-navyDark text-white font-semibold py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span>{t('nav.enquireAdmission')}</span>
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
