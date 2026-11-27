import React, { useEffect, useState } from 'react';
import {
  X,
  Bell,
  MessageCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const WHATSAPP_NUMBER = '917795770785';

function getTeacherInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Slide-out Hamburger Navigation Drawer for Teacher / Faculty Mobile PWA (< 768px).
 * Strictly isolated to Teacher/Faculty roles; Admin and Office Staff remain untouched.
 */
export default function TeacherMobileDrawer({
  isOpen,
  onClose,
  user,
  onNotificationsClick,
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

  const teacherName = user?.fullName || 'Teacher / Faculty';
  const teacherInitials = getTeacherInitials(teacherName);
  const assignedClasses =
    Array.isArray(user?.assignedGrades) && user.assignedGrades.length > 0
      ? user.assignedGrades.join(', ')
      : 'FACULTY / TEACHER';

  const helpMessage = `Namaste, I am ${teacherName} (Faculty at KES Shri Siddharoodha English Medium School). I need assistance regarding the KES Teacher Portal.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    helpMessage
  )}`;

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
        aria-label="Teacher Navigation Drawer"
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
                {teacherInitials}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold tracking-wide uppercase truncate">
                  {teacherName}
                </div>
                <div className="text-xs font-medium text-amber-300/90 uppercase tracking-wider mt-0.5 truncate">
                  {assignedClasses}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Action Menu List */}
          <nav aria-label="Teacher Drawer Actions" className="divide-y divide-slate-100 px-2 py-2">
            <button
              type="button"
              onClick={() => {
                onNotificationsClick();
                onClose();
              }}
              className="w-full py-3.5 px-3 flex items-center justify-between text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer text-left"
            >
              <span className="flex items-center gap-3.5">
                <Bell className="w-4 h-4 text-[#1A365D] flex-shrink-0" />
                <span>Notifications &amp; Circulars</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

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
                Sign out of KES Teacher Portal?
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
