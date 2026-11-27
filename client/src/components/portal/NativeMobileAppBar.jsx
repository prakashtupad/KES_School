import React from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import LanguageToggle from '../LanguageToggle';

/**
 * Shared Sticky Navy Native Mobile Top App Bar (md:hidden, Teacher/Faculty & Student/Parent only).
 */
export default function NativeMobileAppBar({
  appSubtitle = 'KES Portal App',
  onMenuClick,
  onBellClick,
  bellCount = 0,
  onLogout,
  hideLogout = false,
}) {
  return (
    <header className="md:hidden sticky top-0 z-40 w-full bg-[#1A365D] text-white border-b border-[#D97706]/40 shadow-md pt-[env(safe-area-inset-top)] shrink-0">
      <div className="px-3 h-14 flex items-center justify-between gap-2">
        {/* Left: Circular Crest + School Name + App Role Subtitle */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
            alt="KES School Crest"
            className="w-8 h-8 rounded-full object-contain border border-amber-400/60 bg-white p-0.5 flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block leading-none mb-0.5">
              {appSubtitle}
            </span>
            <h1 className="text-[11px] font-serif font-bold text-white leading-tight truncate">
              {SCHOOL_INFO.schoolName}
            </h1>
          </div>
        </div>

        {/* Right: Language Pill + Notification Bell + Hamburger Menu (or Logout when not hidden) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <LanguageToggle compact variant="dark" />

          {onBellClick && (
            <button
              type="button"
              onClick={onBellClick}
              aria-label="Notifications & Circulars"
              className="relative p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-100 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {bellCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#D97706] text-white text-[9px] font-bold flex items-center justify-center">
                  {bellCount > 9 ? '9+' : bellCount}
                </span>
              )}
            </button>
          )}

          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
              className="w-9 h-9 rounded-lg border border-white/25 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white flex-shrink-0 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {!hideLogout && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
