import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ compact = false, className = '' }) {
  const { language, setLanguage } = useLanguage();
  const isKannada = language === 'kn';

  return (
    <div
      title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
      aria-label="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
      role="group"
      className={`bg-slate-100 border border-slate-300/80 rounded-full p-0.5 md:p-1 shadow-inner inline-flex items-center relative select-none shrink-0 ${className}`}
    >
      {/* Animated Sliding Active Pill Background */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0.5 bottom-0.5 md:top-1 md:bottom-1 w-[calc(50%-2px)] md:w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out ${
          isKannada
            ? 'left-[calc(50%)] bg-[#D97706] shadow-sm'
            : 'left-0.5 md:left-1 bg-[#1A365D] ring-1 ring-[#D97706]/80 shadow-sm'
        }`}
      />

      {/* Equal-Width Dual-Script Segmented Buttons */}
      <div className="relative z-10 grid grid-cols-2 w-full items-center gap-0.5 md:gap-0">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          aria-pressed={!isKannada}
          className={`flex items-center justify-center gap-0.5 md:gap-1.5 rounded-full font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
            compact
              ? 'px-2 py-1 text-[11px] md:px-2.5 md:py-1 md:text-[11px]'
              : 'px-2 py-1 text-[11px] md:px-3 md:py-1 md:text-xs'
          } ${!isKannada ? 'text-white' : 'text-slate-600 hover:text-[#1A365D]'}`}
        >
          <span
            className={`hidden md:inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] font-extrabold leading-none shrink-0 ${
              !isKannada
                ? 'bg-white/20 text-amber-300'
                : 'bg-slate-200/80 text-[#1A365D]'
            }`}
          >
            A
          </span>
          <span className="md:hidden">EN</span>
          <span className="hidden md:inline">English</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage('kn')}
          aria-pressed={isKannada}
          className={`flex items-center justify-center gap-0.5 md:gap-1.5 rounded-full font-bold font-kannada transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
            compact
              ? 'px-2 py-1 text-[11px] md:px-2.5 md:py-1 md:text-[11px]'
              : 'px-2 py-1 text-[11px] md:px-3 md:py-1 md:text-xs'
          } ${isKannada ? 'text-white' : 'text-slate-600 hover:text-[#1A365D]'}`}
        >
          <span
            className={`hidden md:inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] font-extrabold !leading-none shrink-0 font-kannada ${
              isKannada
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/80 text-[#1A365D]'
            }`}
          >
            <span className="translate-y-[1.5px]">ಅ</span>
          </span>
          <span className="md:hidden font-sans">KA</span>
          <span className="hidden md:inline translate-y-[0.5px]">ಕನ್ನಡ</span>
        </button>
      </div>
    </div>
  );
}
