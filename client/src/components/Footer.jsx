import React from 'react';
import { Link } from 'react-router-dom';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navyDark text-slate-300 text-xs py-10 border-t border-brand-gold/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-700">
          {/* School summary */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={SCHOOL_INFO.logoUrl}
                alt="Shri Siddharoodha English Medium School Khanatti Logo"
                className="w-10 h-10 rounded-full object-contain border border-brand-gold shadow-sm flex-shrink-0 bg-white p-0.5"
              />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                  {SCHOOL_INFO.societyName} ({SCHOOL_INFO.registrationNo})
                </span>
                <h4 className="font-bold text-sm text-white font-serif">
                  {SCHOOL_INFO.schoolName}
                </h4>
              </div>
            </div>
            <p className="text-brand-goldSoft font-medium text-xs">
              🌱 {SCHOOL_INFO.tagline}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Dedicated to providing character-building, value-based English medium education (
              {SCHOOL_INFO.prePrimaryGrades} &amp; Primary) in Khanatti, Gokak Taluk.
            </p>
            <div className="text-[11px] text-slate-400">
              Village Khanatti, Gokak Taluk, Belagavi District, Karnataka
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Quick Navigation
            </h5>
            <ul className="space-y-1.5">
              <li>
                <a href="#home" className="hover:text-brand-gold transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-brand-gold transition">
                  About Us &amp; Society
                </a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-brand-gold transition">
                  Admissions
                </a>
              </li>
              <li>
                <a href="#campus-life" className="hover:text-brand-gold transition">
                  Campus Life
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-brand-gold transition">
                  News &amp; Events
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-gold transition">
                  Contact Us
                </a>
              </li>
              <li className="pt-1">
                <Link
                  to="/portal/login"
                  className="inline-flex items-center gap-1.5 text-brand-goldSoft hover:text-brand-gold font-semibold transition"
                >
                  <span>🔒 Staff &amp; Teacher Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Contacts in footer */}
          <div className="md:col-span-4 space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              School Contact Info
            </h5>
            <p className="text-xs text-slate-300">
              Phone:{' '}
              <a
                href={SCHOOL_INFO.phoneHref}
                className="placeholder-badge hover:border-white transition"
              >
                {SCHOOL_INFO.phoneDisplay}
              </a>
            </p>
            <p className="text-xs text-slate-300">
              Email:{' '}
              <a
                href={`mailto:${SCHOOL_INFO.email}`}
                className="placeholder-badge hover:border-white transition"
              >
                {SCHOOL_INFO.email}
              </a>
            </p>
            <p className="text-xs text-slate-300">
              Instagram:{' '}
              <a
                href={SCHOOL_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="placeholder-badge hover:border-white transition"
              >
                {SCHOOL_INFO.instagramHandle}
              </a>
            </p>
            <p className="text-xs text-slate-300">
              Facebook:{' '}
              <a
                href={SCHOOL_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="placeholder-badge hover:border-white transition"
              >
                Khanatti Education Society
              </a>
            </p>
            <p className="text-xs text-slate-300">
              Office Hours: <span className="placeholder-badge">{SCHOOL_INFO.officeHours}</span>
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="#enquiry"
                className="inline-block bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-3 py-1.5 rounded text-xs transition"
              >
                Enquire About Admission
              </a>
              <a
                href={SCHOOL_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-semibold px-2.5 py-1.5 rounded text-xs border border-white/20 transition"
              >
                <span>Instagram</span>
              </a>
              <a
                href={SCHOOL_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white font-semibold px-2.5 py-1.5 rounded text-xs border border-white/20 transition"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & Note */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 text-center sm:text-left">
          <div>
            © <span id="currentYear">{currentYear}</span> Khanatti Education Society’s Shri
            Siddharoodha English Medium School, Khanatti ({SCHOOL_INFO.registrationNo}). All rights
            reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Official School Portal • Knowledge • Values • Excellence</span>
            <span className="text-slate-600">•</span>
            <Link to="/portal/login" className="text-slate-400 hover:text-brand-gold transition underline underline-offset-2">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
