import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_SLIDES = [
  {
    _id: 'default-slide-0',
    subtitle: 'WELCOME TO KHANATTI',
    subtitleKn: 'ಖಾನಟ್ಟಿಗೆ ಸುಸ್ವಾಗತ',
    title: 'Inspiring with Values & Quality Education',
    titleKn: 'ಮೌಲ್ಯಾಧಾರಿತ ಮತ್ತು ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣದೊಂದಿಗೆ ಪ್ರೇರಣೆ',
    description:
      'Rooted in Khanatti under the guidance of Khanatti Education Society, nurturing curious, disciplined, and compassionate learners for a bright future.',
    descriptionKn:
      'ಖಾನಟ್ಟಿ ಎಜುಕೇಶನ್ ಸೊಸೈಟಿಯ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಖಾನಟ್ಟಿಯಲ್ಲಿ ಬೇರೂರಿರುವ ನಮ್ಮ ಶಾಲೆಯು, ಉಜ್ವಲ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಶಿಸ್ತು, ಜ್ಞಾನ ಮತ್ತು ಮೌಲ್ಯಯುತ ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ರೂಪಿಸುತ್ತಿದೆ.',
    primaryButtonText: `Enquire for ${SCHOOL_INFO.admissionYear}`,
    primaryButtonTextKn: `${SCHOOL_INFO.admissionYear} ದಾಖಲಾತಿ ವಿಚಾರಣೆ`,
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Learn Our Story',
    secondaryButtonTextKn: 'ನಮ್ಮ ಶಾಲೆಯ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',
    secondaryButtonLink: '#about',
    imageUrl: '/images/governance-campus.jpg',
    caption: 'Guided by Moral Values & Community Excellence',
    captionKn: 'ನೈತಿಕ ಮೌಲ್ಯಗಳು ಮತ್ತು ಸಮುದಾಯದ ಶ್ರೇಷ್ಠತೆಯ ಮಾರ್ಗದರ್ಶನ',
  },
  {
    _id: 'default-slide-1',
    subtitle: 'ACADEMIC PATHWAY',
    subtitleKn: 'ಶೈಕ್ಷಣಿಕ ಮಾರ್ಗ',
    title: `Structured Learning for Classes: ${SCHOOL_INFO.classesOffered}`,
    titleKn: `ತರಗತಿಗಳಿಗೆ ವ್ಯವಸ್ಥಿತ ಶಿಕ್ಷಣ: ${SCHOOL_INFO.classesOffered}`,
    description: `Following verified curriculum guidelines under ${SCHOOL_INFO.curriculumBoard}, helping each child develop foundational mastery and language fluency.`,
    descriptionKn: `${SCHOOL_INFO.curriculumBoard} ಪಠ್ಯಕ್ರಮದ ಮಾರ್ಗಸೂಚಿಗಳ ಅಡಿಯಲ್ಲಿ, ಪ್ರತಿ ಮಗುವಿನಲ್ಲಿ ಮೂಲಭೂತ ಕಲಿಕೆ ಮತ್ತು ಭಾಷಾ ಪ್ರಾವೀಣ್ಯತೆಯನ್ನು ಬೆಳೆಸಲಾಗುತ್ತದೆ.`,
    primaryButtonText: 'Enquire About Admission',
    primaryButtonTextKn: 'ದಾಖಲಾತಿ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: '',
    secondaryButtonTextKn: '',
    secondaryButtonLink: '',
    imageUrl: '/images/interactive-classroom.jpg',
    caption: 'Interactive Classroom Learning at Khanatti',
    captionKn: 'ಖಾನಟ್ಟಿಯಲ್ಲಿ ಸಂವಾದಾತ್ಮಕ ತರಗತಿ ಕಲಿಕೆ',
  },
  {
    _id: 'default-slide-2',
    subtitle: 'NURTURING ATMOSPHERE',
    subtitleKn: 'ಪೋಷಣೆಯ ವಾತಾವರಣ',
    title: 'A Safe, Supportive Campus for Every Rural & Town Child',
    titleKn: 'ಪ್ರತಿ ಗ್ರಾಮೀಣ ಮತ್ತು ಪಟ್ಟಣದ ಮಗುವಿಗೆ ಸುರಕ್ಷಿತ, ಪೂರಕ ಶಾಲಾ ಆವರಣ',
    description:
      'Dedicated educators, caring classroom culture, and regular student activities focused on moral values and holistic growth in Khanatti.',
    descriptionKn:
      'ಖಾನಟ್ಟಿಯಲ್ಲಿ ನೈತಿಕ ಮೌಲ್ಯಗಳು ಮತ್ತು ಸರ್ವತೋಮುಖ ಬೆಳವಣಿಗೆಗೆ ಒತ್ತು ನೀಡುವ ಸಮರ್ಪಿತ ಶಿಕ್ಷಕರು, ಕಾಳಜಿಯುತ ತರಗತಿ ಸಂಸ್ಕೃತಿ ಮತ್ತು ನಿಯಮಿತ ವಿದ್ಯಾರ್ಥಿ ಚಟುವಟಿಕೆಗಳು.',
    primaryButtonText: 'View Campus Life',
    primaryButtonTextKn: 'ಶಾಲಾ ಚಟುವಟಿಕೆಗಳನ್ನು ನೋಡಿ',
    primaryButtonLink: '#campus-life',
    secondaryButtonText: '',
    secondaryButtonTextKn: '',
    secondaryButtonLink: '',
    imageUrl: '/images/campus-joy.jpg',
    caption: 'Joyful, Child-Centric Campus Environment',
    captionKn: 'ಆನಂದದಾಯಕ, ಮಕ್ಕಳ ಕೇಂದ್ರಿತ ಶಾಲಾ ಪರಿಸರ',
  },
  {
    _id: 'default-slide-3',
    subtitle: 'ADMISSIONS & ENQUIRIES',
    subtitleKn: 'ದಾಖಲಾತಿ ಮತ್ತು ವಿಚಾರಣೆಗಳು',
    title: `Admissions Open for New Session ${SCHOOL_INFO.admissionYear}`,
    titleKn: `${SCHOOL_INFO.admissionYear} ಹೊಸ ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ದಾಖಲಾತಿ ಪ್ರಾರಂಭವಾಗಿದೆ`,
    description:
      'Simple enquiry process for parents and guardians. Submit your interest online and our school admissions desk will assist you directly.',
    descriptionKn:
      'ಪೋಷಕರು ಮತ್ತು ಪಾಲಕರಿಗೆ ಸರಳ ವಿಚಾರಣೆ ಪ್ರಕ್ರಿಯೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಿ, ನಮ್ಮ ಶಾಲಾ ದಾಖಲಾತಿ ವಿಭಾಗವು ನಿಮಗೆ ನೇರವಾಗಿ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    primaryButtonText: 'Fill Admission Form',
    primaryButtonTextKn: 'ದಾಖಲಾತಿ ಅರ್ಜಿ ಭರ್ತಿ ಮಾಡಿ',
    primaryButtonLink: '#enquiry',
    secondaryButtonText: 'Office & Map Info',
    secondaryButtonTextKn: 'ಕಚೇರಿ ಮತ್ತು ನಕ್ಷೆ ಮಾಹಿತಿ',
    secondaryButtonLink: '#contact',
    imageUrl: '/images/morning-assembly.jpg',
    caption: `Admissions Open for ${SCHOOL_INFO.admissionYear}`,
    captionKn: `${SCHOOL_INFO.admissionYear} ದಾಖಲಾತಿ ಪ್ರಾರಂಭ`,
  },
];

// Fallback Kannada lookup when MongoDB CMS slides do not have *Kn fields populated
const KN_FALLBACK_BY_TEXT = DEFAULT_SLIDES.reduce((acc, s) => {
  if (s.subtitle && s.subtitleKn) acc[s.subtitle.trim()] = s.subtitleKn;
  if (s.title && s.titleKn) acc[s.title.trim()] = s.titleKn;
  if (s.description && s.descriptionKn) acc[s.description.trim()] = s.descriptionKn;
  if (s.primaryButtonText && s.primaryButtonTextKn) {
    acc[s.primaryButtonText.trim()] = s.primaryButtonTextKn;
  }
  if (s.secondaryButtonText && s.secondaryButtonTextKn) {
    acc[s.secondaryButtonText.trim()] = s.secondaryButtonTextKn;
  }
  if (s.caption && s.captionKn) acc[s.caption.trim()] = s.captionKn;
  return acc;
}, {});

export default function HeroCarousel() {
  const { language, t, tContent } = useLanguage();
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
            const translateWithFallback = (field, rawFallback = '') => {
              const direct = tContent(slide, field);
              const val = direct || rawFallback;
              if (language === 'kn' && !slide?.[`${field}Kn`] && val) {
                return KN_FALLBACK_BY_TEXT[String(val).trim()] || val;
              }
              return val;
            };

            const badgeText =
              translateWithFallback('subtitle', slide.tag) || t('hero.badgeDefault');
            const slideTitle =
              translateWithFallback('title') || t('hero.titleDefault');
            const slideDesc =
              translateWithFallback('description') || t('hero.descDefault');
            const primaryText =
              translateWithFallback('primaryButtonText', slide.primaryCta?.label) ||
              t('hero.enquireCta');
            const primaryLink =
              slide.primaryButtonLink || slide.primaryCta?.href || '#enquiry';
            const secondaryText = translateWithFallback(
              'secondaryButtonText',
              slide.secondaryCta?.label ?? ''
            );
            const secondaryLink =
              slide.secondaryButtonLink || slide.secondaryCta?.href || '#about';
            const imgSrc = slide.imageUrl || slide.image || '/images/governance-campus.jpg';
            const imgCaption =
              translateWithFallback('caption', slide.imageCaption) ||
              (language === 'kn'
                ? 'ನೈತಿಕ ಮೌಲ್ಯಗಳು ಮತ್ತು ಸಮುದಾಯದ ಶ್ರೇಷ್ಠತೆಯ ಮಾರ್ಗದರ್ಶನ'
                : 'Guided by Moral Values & Community Excellence');

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
                  {/* Left on desktop / Bottom on mobile: Compact & Balanced Slide Text Content (5 cols on desktop) */}
                  <div className="order-2 lg:order-1 lg:col-span-5">
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

                  {/* Right on desktop / Top on mobile: Wide & Prominent School Visual Showcase Card (7 cols on desktop) */}
                  <div className="order-1 lg:order-2 lg:col-span-7 space-y-3">
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
                          {language === 'kn' ? 'ಕೆಇಎಸ್ ಖಾನಟ್ಟಿ' : 'KES Khanatti'}
                        </span>
                      </div>
                    </div>

                    {/* Glassmorphic Bottom Control Bar (Prev/Next + Gold Pill Dots + Slide Preview) */}
                    {slideCount > 1 && (() => {
                      const nextIndex = (currentSlide + 1) % slideCount;
                      const nextSlideObj = slides[nextIndex] || {};
                      const resolveLabel = (sObj, idxNum) => {
                        const cap = tContent(sObj, 'caption') || sObj.imageCaption;
                        const sub = tContent(sObj, 'subtitle');
                        const raw = cap || sub;
                        if (language === 'kn' && raw) {
                          return (
                            sObj?.captionKn ||
                            sObj?.subtitleKn ||
                            KN_FALLBACK_BY_TEXT[String(raw).trim()] ||
                            raw
                          );
                        }
                        return raw || (language === 'kn' ? `ಮುಖ್ಯಾಂಶ ${idxNum}` : `Highlight ${idxNum}`);
                      };
                      const currentLabel = resolveLabel(slide, currentSlide + 1);
                      const nextLabel = resolveLabel(nextSlideObj, nextIndex + 1);

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
                                {language === 'kn'
                                  ? `ಸ್ಲೈಡ್ ${currentSlide + 1} / ${slideCount}: ${currentLabel}`
                                  : `Slide ${currentSlide + 1} of ${slideCount}: ${currentLabel}`}
                              </span>
                              <span className="hidden xl:inline text-slate-300/80 pl-2 border-l border-white/15 truncate">
                                {language === 'kn' ? `ಮುಂದಿನದು: ${nextLabel}` : `Next: ${nextLabel}`}
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
