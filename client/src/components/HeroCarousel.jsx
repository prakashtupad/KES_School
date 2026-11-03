import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

const SLIDES = [
  {
    id: 0,
    tag: 'Welcome to Khanatti',
    title: <>Inspiring with Values &amp; Quality Education</>,
    description:
      'Rooted in Khanatti under the guidance of Khanatti Education Society, nurturing curious, disciplined, and compassionate learners for a bright future.',
    primaryCta: {
      label: (
        <>
          Enquire for <span className="font-mono text-xs font-bold">{SCHOOL_INFO.admissionYear}</span>
        </>
      ),
      href: '#enquiry',
    },
    secondaryCta: {
      label: 'Learn Our Story',
      href: '#about',
    },
    image: '/images/governance-campus.jpg',
    imageAlt: 'Shri Siddharoodha English Medium School students, teachers, and management',
    imageCaption: 'Guided by Moral Values & Community Excellence',
  },
  {
    id: 1,
    tag: 'Academic Pathway',
    title: (
      <>
        Structured Learning for Classes:{' '}
        <span className="placeholder-badge align-middle">{SCHOOL_INFO.classesOffered}</span>
      </>
    ),
    description: (
      <>
        Following verified curriculum guidelines under{' '}
        <span className="placeholder-badge">{SCHOOL_INFO.curriculumBoard}</span>, helping each child
        develop foundational mastery and language fluency.
      </>
    ),
    primaryCta: {
      label: 'Enquire About Admission',
      href: '#enquiry',
    },
    secondaryCta: null,
    image: '/images/interactive-classroom.jpg',
    imageAlt: 'Teacher guiding students at the classroom blackboard',
    imageCaption: 'Interactive Classroom Learning at Khanatti',
  },
  {
    id: 2,
    tag: 'Nurturing Atmosphere',
    title: <>A Safe, Supportive Campus for Every Rural &amp; Town Child</>,
    description:
      'Dedicated educators, caring classroom culture, and regular student activities focused on moral values and holistic growth in Khanatti.',
    primaryCta: {
      label: 'View Campus Life',
      href: '#campus-life',
    },
    secondaryCta: null,
    image: '/images/campus-joy.jpg',
    imageAlt: 'Joyful students participating in learning activities on campus',
    imageCaption: 'Joyful, Child-Centric Campus Environment',
  },
  {
    id: 3,
    tag: 'Admissions & Enquiries',
    title: (
      <>
        Admissions Open for New Session{' '}
        <span className="placeholder-badge align-middle">{SCHOOL_INFO.admissionYear}</span>
      </>
    ),
    description:
      'Simple enquiry process for parents and guardians. Submit your interest online and our school admissions desk will assist you directly.',
    primaryCta: {
      label: 'Fill Admission Form',
      href: '#enquiry',
    },
    secondaryCta: {
      label: 'Office & Map Info',
      href: '#contact',
    },
    image: '/images/morning-assembly.jpg',
    imageAlt: 'Students in uniform during school assembly and classroom sessions',
    imageCaption: `Admissions Open for ${SCHOOL_INFO.admissionYear}`,
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative bg-brand-navy text-white overflow-hidden"
      aria-label="Featured Highlights Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-6xl mx-auto relative">
        <div
          id="carouselWrapper"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center focus:outline-none"
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <div
                key={slide.id}
                className={`carousel-slide w-full px-6 sm:px-12 py-12 transition-opacity duration-300 ${
                  isActive ? 'flex opacity-100' : 'hidden opacity-0'
                }`}
                data-slide={index}
                aria-hidden={!isActive}
              >
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Slide Text Content */}
                  <div className="lg:col-span-7 max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-semibold tracking-wide uppercase mb-3 border border-brand-gold/30">
                      {slide.tag}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[34px] font-bold font-serif leading-[1.22] tracking-tight text-white mb-3.5">
                      {slide.title}
                    </h2>
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={slide.primaryCta.href}
                        className="bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-5 py-2.5 rounded shadow transition inline-flex items-center gap-2 text-sm"
                      >
                        <span>{slide.primaryCta.label}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                      {slide.secondaryCta && (
                        <a
                          href={slide.secondaryCta.href}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded border border-white/30 transition text-sm"
                        >
                          {slide.secondaryCta.label}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Authentic School Visual Card */}
                  <div className="hidden lg:block lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold/40 shadow-2xl bg-brand-navyDark">
                      <img
                        src={slide.image}
                        alt={slide.imageAlt}
                        className="w-full h-72 object-cover object-top"
                      />
                      <div className="bg-brand-navyDark/95 px-4 py-2.5 border-t border-brand-gold/30 flex items-center justify-between text-xs text-slate-200">
                        <span className="font-medium">{slide.imageCaption}</span>
                        <span className="text-brand-gold font-semibold">KES Khanatti</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls (Keyboard & Touch Accessible) */}
        <div className="absolute bottom-4 right-4 sm:right-8 flex items-center gap-2 z-10">
          <button
            id="prevSlideBtn"
            type="button"
            aria-label="Previous slide"
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slide indicators */}
          <div className="flex items-center gap-1.5 px-2" role="tablist" aria-label="Slide indicators">
            {SLIDES.map((slide, index) => {
              const isSelected = index === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-selected={isSelected}
                  data-index={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`carousel-dot w-2.5 h-2.5 rounded-full transition ${
                    isSelected ? 'bg-brand-gold' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>

          <button
            id="nextSlideBtn"
            type="button"
            aria-label="Next slide"
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
