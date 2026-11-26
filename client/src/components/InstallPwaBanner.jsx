import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Share, X } from 'lucide-react';
import { SCHOOL_INFO } from '../constants/schoolData';

const DISMISS_STORAGE_KEY = 'kes_pwa_install_dismissed';

export default function InstallPwaBanner() {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIosPrompt, setIsIosPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || dismissed) return undefined;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) return undefined;

    const ua = window.navigator.userAgent || '';
    const isIos = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream;
    if (isIos) {
      setIsIosPrompt(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsIosPrompt(false);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissed]);

  // Strict scope guard: never render inside /portal/* routes
  if (location.pathname.startsWith('/portal') || dismissed) {
    return null;
  }

  if (!deferredPrompt && !isIosPrompt) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissed(true);
      }
    } catch {
      // Ignore prompt cancellation errors
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      role="region"
      aria-label="Install KES School App"
      className="md:hidden fixed bottom-[72px] left-3 right-3 z-40 bg-[#1A365D] text-white rounded-2xl border border-[#D97706]/60 shadow-2xl p-3 flex items-center justify-between gap-2.5"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
          alt="KES School App"
          className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-[#D97706] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">
            Install KES School App
          </div>
          {deferredPrompt ? (
            <div className="text-[10.5px] text-slate-200 truncate">
              Quick access to Notices, Homework &amp; Portal
            </div>
          ) : (
            <div className="text-[10.5px] text-slate-200 flex items-center gap-1 flex-wrap">
              <span>Tap</span>
              <Share className="w-3 h-3 text-[#F59E0B] inline" />
              <span>then &ldquo;Add to Home Screen&rdquo;</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
