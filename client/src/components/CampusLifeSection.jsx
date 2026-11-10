import React, { useState, useEffect } from 'react';
import { SCHOOL_INFO } from '../constants/schoolData';
import BirthdayCelebrationCard from './BirthdayCelebrationCard';

const DEFAULT_CAMPUS_CARDS = [
  {
    _id: 'campus-building',
    title: 'School Building & Play Area',
    description:
      'Modern, well-ventilated school building in Khanatti with a dedicated children’s outdoor play park.',
    imageUrl: '/images/interactive-classroom.jpg?v=2',
    subtitle: 'School Infrastructure',
  },
  {
    _id: 'campus-entrance',
    title: 'Main Campus Entrance & Fountain',
    description:
      'Welcoming entrance arch of Khanatti Education Society’s Shri Siddharoodha English Medium School.',
    imageUrl: '/images/campus-entrance.jpg?v=2',
    subtitle: 'KES Khanatti Campus',
  },
  {
    _id: 'transport',
    title: 'New School Van & Rural Connectivity',
    description:
      'Dedicated school van facility blessed and inaugurated by Khanatti Education Society for safe student transport.',
    imageUrl: '/images/school-van.jpg?v=2',
    subtitle: 'Student Transport',
  },
  {
    _id: 'assembly',
    title: 'Morning Assembly & Classroom Learning',
    description:
      'Students gather daily for prayer, pledges, and interactive classroom learning with dedicated teachers.',
    imageUrl: '/images/morning-assembly.jpg?v=2',
    subtitle: 'Daily Discipline & Values',
  },
  {
    _id: 'events',
    title: 'Events & National Celebrations',
    description:
      'Celebration of national festivals (Independence Day, Republic Day) and cultural school activities.',
    imageUrl: '/images/events-celebrations.jpg?v=2',
    subtitle: 'Cultural & National Pride',
  },
  {
    _id: 'activities',
    title: 'Play, Learn & Grow',
    description:
      'Activity-based learning with alphabet mats, phonetic games, and joyful group exercises.',
    imageUrl: '/images/play-learn-grow.jpg?v=2',
    subtitle: 'Experiential Learning',
  },
];

export default function CampusLifeSection() {
  const [cards, setCards] = useState(DEFAULT_CAMPUS_CARDS);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [birthdayData, setBirthdayData] = useState({
    students: [],
    staff: [],
    enableCard: true,
    customWish: 'Wishing you joy, good health, and academic excellence! 🎂✨',
  });

  useEffect(() => {
    let active = true;
    fetch('/api/v1/content?section=campus_life')
      .then((res) => res.json())
      .then((data) => {
        const remoteCards = data.data || data.items || [];
        if (active && data && data.success !== false && remoteCards.length > 0) {
          setCards(remoteCards);
        }
      })
      .catch(() => {
        // Keep DEFAULT_CAMPUS_CARDS fallback if offline
      });

    fetch('/api/v1/content/today-birthdays')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data || data.success === false) return;
        const students = data.publicCelebrants?.students || data.students || [];
        const staff = data.publicCelebrants?.staff || data.staff || [];
        const enableCard =
          data.settings && typeof data.settings.enableBirthdayCampusCard === 'boolean'
            ? data.settings.enableBirthdayCampusCard
            : true;
        const customWish =
          data.settings?.customBirthdayWishTemplate ||
          'Wishing you joy, good health, and academic excellence! 🎂✨';
        setBirthdayData({ students, staff, enableCard, customWish });
      })
      .catch(() => {
        // Silent fallback
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="campus-life" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">
              Campus Environment
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy mt-1">
              Student &amp; Campus Life
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Authentic glimpses of our school campus, daily life, co-curricular learning, and
              community events at Khanatti.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={SCHOOL_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-300 text-xs font-semibold text-brand-navy hover:text-pink-700 transition shadow-sm"
            >
              <svg
                className="w-4 h-4 text-pink-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Follow {SCHOOL_INFO.instagramHandle}</span>
            </a>
            <a
              href={SCHOOL_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-brand-navy hover:text-blue-700 transition shadow-sm"
            >
              <svg
                className="w-4 h-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
              <span>Facebook Page</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthdayData.enableCard && (
            <BirthdayCelebrationCard
              celebrants={birthdayData.students}
              staffCelebrants={birthdayData.staff}
              customWish={birthdayData.customWish}
            />
          )}
          {cards.map((card, idx) => {
            const imgSrc = card.imageUrl || card.image || '/images/interactive-classroom.jpg?v=2';
            const badgeText = card.subtitle || card.badge || 'KES Khanatti Campus';
            const descText = card.description || card.caption || '';

            return (
              <div
                key={card._id || card.id || idx}
                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-sm hover:shadow-md hover:border-brand-gold/50 transition group flex flex-col"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhoto({
                      title: card.title,
                      badge: badgeText,
                      image: imgSrc,
                      caption: descText,
                    })
                  }
                  className="relative aspect-[16/10] bg-slate-100 border-b border-slate-200 overflow-hidden w-full text-left focus:outline-none"
                  aria-label={`View larger photo of ${card.title}`}
                >
                  <img
                    src={imgSrc}
                    alt={card.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-brand-navyDark/85 text-brand-goldSoft text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-brand-gold/40">
                    {badgeText}
                  </span>
                </button>
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-sm text-brand-navy">{card.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{descText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Campus Photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-brand-navyDark/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.title}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-brand-navy text-white">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-brand-gold block font-semibold">
                  {selectedPhoto.badge}
                </span>
                <h4 className="font-serif font-bold text-sm sm:text-base">{selectedPhoto.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo preview"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="bg-slate-900 max-h-[70vh] flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-700">
              {selectedPhoto.caption}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
