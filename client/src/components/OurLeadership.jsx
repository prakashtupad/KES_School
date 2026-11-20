import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Award, Quote } from 'lucide-react';
import { LEADERSHIP_DATA } from '../data/leadershipData';
import { useLanguage } from '../context/LanguageContext';

function mapCmsItemToLeader(item, index) {
  const paragraphs = String(item.description || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (item.secondaryDescription && String(item.secondaryDescription).trim()) {
    paragraphs.push(String(item.secondaryDescription).trim());
  }

  const paragraphsKn = String(item.descriptionKn || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    id: item._id || `leader_${index}`,
    role: item.subtitle || 'Leadership',
    subtitleKn: item.subtitleKn || '',
    name: item.governanceTitle || item.title || 'Leadership Member',
    title: item.title || `Message from Our ${item.subtitle || 'Leader'}`,
    titleKn: item.titleKn || '',
    designation:
      item.governanceSubtitle ||
      item.caption ||
      `${item.subtitle || 'Leadership'}, Khanatti Education Society (KES)`,
    imageUrl: item.imageUrl || '/images/leadership/founder-subhash-tuppad.jpg',
    message: paragraphs.length > 0 ? paragraphs : [''],
    messageKn: paragraphsKn,
  };
}

function getDefaultKnKey(role = '') {
  const norm = String(role).trim().toLowerCase();
  if (norm === 'founder') return 'founder';
  if (norm === 'co-founder' || norm === 'cofounder') return 'cofounder';
  if (norm === 'chairman') return 'chairman';
  return null;
}

export default function OurLeadership({ isPortalView = false }) {
  const { language, t } = useLanguage();
  const [leaders, setLeaders] = useState(LEADERSHIP_DATA);
  const [selectedRole, setSelectedRole] = useState('All');
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/content?section=leadership')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const rawItems = data?.data || data?.items || [];
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          setLeaders(rawItems.map(mapCmsItemToLeader));
        }
      })
      .catch(() => {
        // Keep static LEADERSHIP_DATA fallback if offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const roleFilters = useMemo(() => {
    const uniqueRoles = Array.from(
      new Set(leaders.map((l) => l.role).filter(Boolean))
    );
    return [
      { key: 'All', label: t('leadership.allFilter') },
      ...uniqueRoles.map((r) => ({
        key: r,
        label: t(`leadership.roles.${r}`, r),
      })),
    ];
  }, [leaders, t]);

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    if (!isPortalView && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const visibleLeaders =
    selectedRole === 'All'
      ? leaders
      : leaders.filter((leader) => leader.role === selectedRole);

  return (
    <section
      id="leadership"
      ref={sectionRef}
      className={`${
        isPortalView
          ? 'py-2'
          : 'py-6 sm:py-8 bg-[#F8FAFC] border-t border-slate-200 scroll-mt-16 sm:scroll-mt-20'
      }`}
    >
      <div className={isPortalView ? 'w-full' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {/* Compact Section Header & Interactive Filter Pills */}
        <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-[#D97706] text-[11px] font-bold uppercase tracking-widest mb-1.5">
            <Award className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{t('leadership.badge')}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A365D]">
            {t('leadership.heading')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            {t('leadership.subheading')}
          </p>

          {/* Role Filter Pills */}
          <div
            className="flex flex-wrap justify-center gap-2 mt-3.5"
            role="tablist"
            aria-label="Filter Leadership Messages by Role"
          >
            {roleFilters.map((tab) => {
              const isActive = selectedRole === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectRole(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1A365D] text-white shadow-sm border border-[#1A365D]'
                      : 'bg-white text-slate-600 border border-slate-300 hover:border-[#D97706] hover:text-[#1A365D]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leadership Cards Stack */}
        <div className="space-y-6">
          {visibleLeaders.map((leader) => {
            const knKey = getDefaultKnKey(leader.role);
            const isKn = language === 'kn';

            const displayRole = isKn
              ? leader.subtitleKn ||
                (knKey ? t(`leadership.${knKey}.role`, leader.role) : leader.role)
              : leader.role;

            const displayName = isKn
              ? knKey
                ? t(`leadership.${knKey}.name`, leader.name)
                : leader.name
              : leader.name;

            const displayTitle = isKn
              ? leader.titleKn ||
                (knKey ? t(`leadership.${knKey}.title`, leader.title) : leader.title)
              : leader.title;

            const displayDesignation = isKn
              ? knKey
                ? t(`leadership.${knKey}.designation`, leader.designation)
                : leader.designation
              : leader.designation;

            const knDefaultParagraphs =
              isKn && knKey ? t(`leadership.${knKey}.paragraphs`, null) : null;

            const paragraphs =
              isKn && Array.isArray(leader.messageKn) && leader.messageKn.length > 0
                ? leader.messageKn
                : isKn && Array.isArray(knDefaultParagraphs) && knDefaultParagraphs.length > 0
                  ? knDefaultParagraphs
                  : Array.isArray(leader.message)
                    ? leader.message
                    : [leader.message];

            return (
              <article
                key={leader.id || leader.role}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 lg:p-7"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-start">
                  {/* Left Column (4 cols on md+): Framed Portrait */}
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div className="w-full max-w-[230px] mx-auto bg-[#F8FAFC] p-2 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl border-2 border-[#D97706]/30 shadow-md bg-slate-100 relative">
                        <img
                          src={leader.imageUrl}
                          alt={`${displayName} — ${displayRole}`}
                          loading="lazy"
                          className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              leader.name
                            )}&background=1A365D&color=D97706&size=400&bold=true`;
                          }}
                        />
                      </div>

                      <div className="text-center pt-2.5 pb-0.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1A365D] text-amber-300 text-[10px] font-bold uppercase tracking-widest">
                          {displayRole}
                        </span>
                        <h4 className="text-sm sm:text-base font-serif font-bold text-[#1A365D] mt-1">
                          {displayName}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (8 cols on md+): Editorial Message & Signature Block */}
                  <div className="md:col-span-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-[#1A365D] text-amber-300 text-[11px] font-bold uppercase tracking-wider rounded-md">
                          {displayRole}
                        </span>
                        <Quote className="w-5 h-5 text-[#D97706]/30 flex-shrink-0" />
                      </div>

                      <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-[#1A365D] mb-3 leading-snug">
                        {displayTitle}
                      </h3>

                      <div className="space-y-2.5 text-xs sm:text-sm lg:text-[15px] text-slate-700 leading-relaxed">
                        {paragraphs.map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                    </div>

                    {/* Signature Footer Block */}
                    <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-serif font-bold text-[#1A365D]">
                          {displayName}
                        </p>
                        <p className="text-xs font-semibold text-[#D97706]">
                          {displayDesignation}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {t('leadership.societyTag')}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
