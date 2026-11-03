import React from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

export default function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Introduction */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 text-brand-gold font-semibold text-xs tracking-wider uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-gold" />
              Welcome to Our School
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy leading-tight mb-4">
              Khanatti Education Society’s Shri Siddharoodha English Medium School
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-4">
              Established under the patronage of <strong>Khanatti Education Society</strong> in
              Khanatti, our institution is committed to bringing accessible, disciplined, and
              nurturing English medium education to children of the local community.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base mb-6">
              Our campus provides an atmosphere of mutual respect, cultural grounding, and moral
              integrity inspired by the teachings of Sadguru Shri Siddharoodha Swamiji.
            </p>

            {/* Verified Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded bg-brand-navy/10 text-brand-navy flex items-center justify-center mb-2 font-bold">
                  1
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Our Approved Vision</h3>
                <p className="text-xs text-slate-600 leading-normal">
                  To empower every child with foundational literacy, communicative confidence, and
                  character to grow into responsible citizens.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded bg-brand-gold/20 text-brand-gold flex items-center justify-center mb-2 font-bold">
                  2
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Our Learning Approach</h3>
                <p className="text-xs text-slate-600 leading-normal">
                  Child-centric teaching, interactive language development, continuous assessment,
                  and close collaboration with parents.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Society Governance & Authentic School Campus Card */}
          <div className="lg:col-span-5">
            <div className="bg-brand-cream border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <div className="w-full aspect-[4/3] bg-white rounded-lg border border-slate-200 overflow-hidden mb-4 shadow-inner relative group">
                <img
                  src="/images/governance-campus.jpg?v=2"
                  alt="Khanatti Education Society School Campus & Assembly Ground"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 inset-x-0 bg-brand-navyDark/85 text-white text-[11px] py-1.5 px-3 font-medium">
                  Shri Siddharoodha English Medium School Campus &amp; Assembly Ground
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">
                Khanatti Education Society Governance
              </h3>
              <p className="text-xs font-mono font-semibold text-brand-navy mb-2">
                {SCHOOL_INFO.registrationNo}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Management, Head of School &amp; Faculty details available upon confirmation.
              </p>
              <div className="inline-block px-3 py-1 bg-white rounded border border-slate-200 text-xs text-slate-600 font-mono">
                Affiliation:{' '}
                <span className="placeholder-badge">{SCHOOL_INFO.curriculumBoard}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
