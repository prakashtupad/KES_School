import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';

const DEFAULT_SLIDES = [
  {
    _id: 'default-slide-0',
    subtitle: 'WELCOME TO KHANATTI',
    title: 'Inspiring with Values & Quality Education',
    description:
      'Rooted in Khanatti under the guidance of Khanatti Education Society, nurturing curious, disciplined, and compassionate learners for a bright future.',
    primaryButtonText: `Enquire for ${SCHOOL_INFO.admissionYear}`,
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Learn Our Story',
    secondaryButtonLink: '#about',
    imageUrl: '/images/governance-campus.jpg',
    caption: 'Guided by Moral Values & Community Excellence',
  },
  {
    _id: 'default-slide-1',
    subtitle: 'ACADEMIC PATHWAY',
    title: `Structured Learning for Classes: ${SCHOOL_INFO.classesOffered}`,
    description: `Following verified curriculum guidelines under ${SCHOOL_INFO.curriculumBoard}, helping each child develop foundational mastery and language fluency.`,
    primaryButtonText: 'Enquire About Admission',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    imageUrl: '/images/interactive-classroom.jpg',
    caption: 'Interactive Classroom Learning at Khanatti',
  },
  {
    _id: 'default-slide-2',
    subtitle: 'NURTURING ATMOSPHERE',
    title: 'A Safe, Supportive Campus for Every Rural & Town Child',
    description:
      'Dedicated educators, caring classroom culture, and regular student activities focused on moral values and holistic growth in Khanatti.',
    primaryButtonText: 'View Campus Life',
    primaryButtonLink: '#campus-life',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    imageUrl: '/images/campus-joy.jpg',
    caption: 'Joyful, Child-Centric Campus Environment',
  },
  {
    _id: 'default-slide-3',
    subtitle: 'ADMISSIONS & ENQUIRIES',
    title: `Admissions Open for New Session ${SCHOOL_INFO.admissionYear}`,
    description:
      'Simple enquiry process for parents and guardians. Submit your interest online and our school admissions desk will assist you directly.',
    primaryButtonText: 'Fill Admission Form',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Office & Map Info',
    secondaryButtonLink: '#contact',
    imageUrl: '/images/morning-assembly.jpg',
    caption: `Admissions Open for ${SCHOOL_INFO.admissionYear}`,
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    let active = true;
    fetch('/api/v1/content?section=hero_carousel')
      .then((res) => res.json())
      .then((data) => {
        const remoteSlides = data.data || data.items || [];
        if (active && data && data.success !== false && remoteSlides.length > 0) {
          setSlides(remoteSlides);
          setCurrentSlide(0);
        }
      })
      .catch(() => {
        // Keep DEFAULT_SLIDES fallback if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const slideCount = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || slideCount <= 1) return undefined;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slideCount]);

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
      <div className="max-w-7xl mx-auto relative">
        <div
          id="carouselWrapper"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] flex items-center focus:outline-none"
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const badgeText = slide.subtitle || slide.tag || 'WELCOME TO KHANATTI';
            const primaryText =
              slide.primaryButtonText || slide.primaryCta?.label || 'Enquire for 2026–27';
            const primaryLink =
              slide.primaryButtonLink || slide.primaryCta?.href || '#enquiry';
            const secondaryText =
              slide.secondaryButtonText ?? slide.secondaryCta?.label ?? '';
            const secondaryLink =
              slide.secondaryButtonLink || slide.secondaryCta?.href || '#about';
            const imgSrc = slide.imageUrl || slide.image || '/images/governance-campus.jpg';
            const imgCaption =
              slide.caption ||
              slide.imageCaption ||
              'Guided by Moral Values & Community Excellence';

            return (
              <div
                key={slide._id || slide.id || index}
                className={`carousel-slide w-full px-4 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 transition-opacity duration-300 ${
                  isActive ? 'flex opacity-100' : 'hidden opacity-0'
                }`}
                data-slide={index}
                aria-hidden={!isActive}
              >
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                  {/* Left: Compact & Balanced Slide Text Content (5 cols on desktop) */}
                  <div className="lg:col-span-5">
                    {badgeText && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-semibold tracking-wide uppercase mb-3 border border-brand-gold/30">
                        {badgeText}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif leading-tight tracking-tight text-white mb-3">
                      {slide.title}
                    </h2>
                    <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed mb-5">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {primaryText && (
                        <a
                          href={primaryLink}
                          className="bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-5 py-2.5 rounded-lg shadow transition inline-flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <span>{primaryText}</span>
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
                      )}
                      {secondaryText && (
                        <a
                          href={secondaryLink}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-lg border border-white/30 transition text-xs sm:text-sm"
                        >
                          {secondaryText}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Wide & Prominent School Visual Showcase Card (7 cols on desktop) */}
                  <div className="lg:col-span-7">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold/40 shadow-2xl bg-brand-navyDark">
                      <img
                        src={imgSrc}
                        alt={typeof slide.title === 'string' ? slide.title : 'School highlight'}
                        className="w-full h-56 sm:h-72 lg:h-[360px] object-cover object-center"
                      />
                      <div className="bg-brand-navyDark/95 px-4 py-2.5 border-t border-brand-gold/30 flex items-center justify-between text-xs text-slate-200">
                        <span className="font-medium truncate mr-2">{imgCaption}</span>
                        <span className="text-brand-gold font-semibold flex-shrink-0">
                          KES Khanatti
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls (Keyboard & Touch Accessible) */}
        {slideCount > 1 && (
          <div className="absolute bottom-3 right-4 sm:right-8 flex items-center gap-2 z-10">
            <button
              id="prevSlideBtn"
              type="button"
              aria-label="Previous slide"
              onClick={prevSlide}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Slide indicators */}
            <div className="flex items-center gap-1.5 px-2" role="tablist" aria-label="Slide indicators">
              {slides.map((slide, index) => {
                const isSelected = index === currentSlide;
                return (
                  <button
                    key={slide._id || slide.id || index}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
