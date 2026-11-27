import React, { useEffect, useState } from 'react';
import {
  X,
  MessageCircle,
  Lock,
  LogOut,
  ChevronRight,
  Check,
} from 'lucide-react';
import { getStudentInitials, isSectionApplicable } from './SiblingSwitcherHeader';

const WHATSAPP_NUMBER = '917795770785';

function getParentInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PG';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Slide-out Hamburger Navigation Drawer for Student / Parent Mobile PWA (< 768px).
 * Strictly isolated to role === 'parent' || role === 'student'.
 */
export default function ParentMobileDrawer({
  isOpen,
  onClose,
  parentName,
  siblings = [],
  activeSiblingIndex = 0,
  onSelectSibling,
  onChangePassword,
  onLogout,
}) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmingLogout(false);
      return undefined;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeStudent = siblings[activeSiblingIndex] || siblings[0] || null;
  const resolvedParentName =
    parentName ||
    activeStudent?.father?.name ||
    activeStudent?.fatherName ||
    activeStudent?.mother?.name ||
    activeStudent?.motherName ||
    'PARENT / GUARDIAN';

  const parentInitials = getParentInitials(resolvedParentName);
  const admNo = activeStudent?.admissionNumber || 'KES';
  const parentHelpMessage = `Namaste, I am ${resolvedParentName} (Parent of ${
    activeStudent?.studentName || 'Student'
  }, Adm No: ${admNo}). I need assistance regarding the KES Parent Portal.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    parentHelpMessage
  )}`;

  const displaySiblings =
    Array.isArray(siblings) && siblings.length > 0
      ? siblings
      : activeStudent
        ? [activeStudent]
        : [];

  return (
    <div
      className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Parent Navigation Drawer"
        className={`relative z-10 w-[82%] max-w-[320px] h-full bg-white flex flex-col justify-between shadow-2xl overflow-y-auto transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Navy Gradient Profile Banner */}
          <div className="bg-gradient-to-br from-[#1A365D] via-[#1E3A6D] to-[#2B4C7E] text-white p-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] relative">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="absolute top-[calc(env(safe-area-inset-top)+0.9rem)] right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-amber-400/80 flex items-center justify-center text-lg font-bold tracking-wide flex-shrink-0">
                {parentInitials}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold tracking-wide uppercase truncate">
                  {resolvedParentName}
                </div>
                <div className="text-xs font-medium text-amber-300/90 uppercase tracking-wider mt-0.5">
                  PARENT / GUARDIAN
                </div>
              </div>
            </div>
          </div>

          {/* Quick Sibling Switcher Grid */}
          {displaySiblings.length > 0 && (
            <div className="p-4 bg-slate-50/80 border-b border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Switch Student Profile
              </div>
              <div className="grid grid-cols-2 gap-3">
                {displaySiblings.map((child, idx) => {
                  const isActive = idx === activeSiblingIndex;
                  const initials = getStudentInitials(child.studentName);
                  const photoUrl = child.documents?.studentPhotoUrl || '';
                  const sectionText = isSectionApplicable(child.section)
                    ? ` ${child.section}`
                    : '';

                  return (
                    <button
                      key={child._id || child.admissionNumber || idx}
                      type="button"
                      onClick={() => {
                        onSelectSibling(idx);
                        onClose();
                      }}
                      className={`relative rounded-xl p-3 flex flex-col items-center text-center border transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                        </span>
                      )}

                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={child.studentName}
                          className="w-11 h-11 rounded-full object-cover object-top border border-[#D97706] bg-white mb-2"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#1A365D] text-white font-bold text-sm flex items-center justify-center mb-2">
                          {initials}
                        </div>
                      )}

                      <span className="text-[11px] font-bold text-slate-800 uppercase truncate w-full">
                        {child.studentName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 truncate w-full mt-0.5">
                        {child.grade}
                        {sectionText}
                        {child.admissionNumber ? ` • ${child.admissionNumber}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drawer Action Menu List (NO "Raise a Ticket") */}
          <nav aria-label="Parent Drawer Actions" className="divide-y divide-slate-100 px-2 py-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="py-3.5 px-3 flex items-center justify-between text-sm font-semibold text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition"
            >
              <span className="flex items-center gap-3.5">
                <MessageCircle className="w-4 h-4 text-[#059669] flex-shrink-0" />
                <span>Chat on WhatsApp</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={() => {
                onChangePassword();
                onClose();
              }}
              className="w-full py-3.5 px-3 flex items-center justify-between text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-3.5">
                <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>Change Password</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              className="w-full py-3.5 px-3 flex items-center justify-between text-sm font-semibold text-red-600 hover:bg-red-50/60 rounded-lg transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-3.5">
                <LogOut className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                <span>Logout</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </nav>

          {/* Clean Logout Confirmation Prompt */}
          {confirmingLogout && (
            <div className="mx-4 my-3 p-3.5 rounded-xl bg-red-50 border border-red-200 space-y-2.5">
              <p className="text-xs font-semibold text-slate-800">
                Sign out of KES Parent Portal?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingLogout(false)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingLogout(false);
                    onClose();
                    onLogout();
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Institutional Footer */}
        <footer className="p-4 bg-slate-50 border-t border-slate-200/80 text-center pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="text-base font-extrabold tracking-wider text-[#1A365D]">
            KES KHANATTI
          </div>
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
            SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            © 2026 Khanatti Education Society • All rights reserved.
          </div>
        </footer>
      </aside>
    </div>
  );
}
