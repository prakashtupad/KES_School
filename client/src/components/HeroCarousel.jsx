import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';
import { useLanguage } from '../context/LanguageContext';

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
  const { t, tContent } = useLanguage();
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
            const badgeText =
              tContent(slide, 'subtitle') || slide.tag || t('hero.badgeDefault');
            const slideTitle = tContent(slide, 'title') || t('hero.titleDefault');
            const slideDesc = tContent(slide, 'description') || t('hero.descDefault');
            const primaryText =
              slide.primaryButtonText || slide.primaryCta?.label || t('hero.enquireCta');
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
                      {slideTitle}
                    </h2>
                    <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed mb-5">
                      {slideDesc}
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
                  <div className="lg:col-span-7 space-y-3">
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-brand-gold/40 shadow-2xl bg-brand-navyDark">
                      <img
                        src={imgSrc}
                        alt={typeof slide.title === 'string' ? slide.title : 'School highlight'}
                        className="w-full h-56 sm:h-72 lg:h-[360px] object-cover object-center"
                      />

                      {/* Subtle On-Image Prev / Next Overlay Arrows */}
                      {slideCount > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous slide"
                            onClick={prevSlide}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/45 hover:bg-slate-900/75 text-white border border-white/25 backdrop-blur-sm flex items-center justify-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next slide"
                            onClick={nextSlide}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/45 hover:bg-slate-900/75 text-white border border-white/25 backdrop-blur-sm flex items-center justify-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      <div className="bg-brand-navyDark/95 px-4 py-2.5 border-t border-brand-gold/30 flex items-center justify-between text-xs text-slate-200">
                        <span className="font-medium truncate mr-2">{imgCaption}</span>
                        <span className="text-brand-gold font-semibold flex-shrink-0">
                          KES Khanatti
                        </span>
                      </div>
                    </div>

                    {/* Glassmorphic Bottom Control Bar (Prev/Next + Gold Pill Dots + Slide Preview) */}
                    {slideCount > 1 && (() => {
                      const nextIndex = (currentSlide + 1) % slideCount;
                      const nextSlideObj = slides[nextIndex] || {};
                      const currentLabel =
                        slide.caption ||
                        slide.imageCaption ||
                        tContent(slide, 'subtitle') ||
                        `Highlight ${currentSlide + 1}`;
                      const nextLabel =
                        nextSlideObj.caption ||
                        nextSlideObj.imageCaption ||
                        tContent(nextSlideObj, 'subtitle') ||
                        `Highlight ${nextIndex + 1}`;

                      return (
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                          {/* Left Pill: Prev & Next Icon Buttons */}
                          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex-shrink-0">
                            <button
                              id={isActive ? 'prevSlideBtn' : undefined}
                              type="button"
                              aria-label="Previous slide"
                              onClick={prevSlide}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              id={isActive ? 'nextSlideBtn' : undefined}
                              type="button"
                              aria-label="Next slide"
                              onClick={nextSlide}
                              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Center Pill: Elongated Gold Active Bar + Dots */}
                          <div
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex-shrink-0"
                            role="tablist"
                            aria-label="Slide indicators"
                          >
                            {slides.map((s, dotIdx) => {
                              const isSelected = dotIdx === currentSlide;
                              return (
                                <button
                                  key={s._id || s.id || dotIdx}
                                  type="button"
                                  role="tab"
                                  aria-label={`Go to slide ${dotIdx + 1}`}
                                  aria-selected={isSelected}
                                  data-index={dotIdx}
                                  onClick={() => setCurrentSlide(dotIdx)}
                                  className={`carousel-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    isSelected
                                      ? 'w-6 bg-amber-400'
                                      : 'w-1.5 bg-white/35 hover:bg-white/70'
                                  }`}
                                />
                              );
                            })}
                          </div>

                          {/* Right Pill: Mini Thumbnail + Slide Counter + Next Preview */}
                          <button
                            type="button"
                            onClick={nextSlide}
                            title={`Jump to next slide: ${nextLabel}`}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md flex-1 min-w-0 text-left transition cursor-pointer"
                          >
                            <img
                              src={imgSrc}
                              alt=""
                              aria-hidden="true"
                              className="w-9 h-6 rounded-md object-cover border border-white/20 flex-shrink-0"
                            />
                            <div className="min-w-0 flex items-center gap-2 text-[11px] sm:text-xs truncate">
                              <span className="font-semibold text-white truncate">
                                Slide {currentSlide + 1} of {slideCount}: {currentLabel}
                              </span>
                              <span className="hidden xl:inline text-slate-300/80 pl-2 border-l border-white/15 truncate">
                                Next: {nextLabel}
                              </span>
                            </div>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
