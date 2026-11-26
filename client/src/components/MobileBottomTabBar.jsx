import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Lock, Bell, PhoneCall } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', href: '#home', route: '/', icon: Home },
  { id: 'admissions', label: 'Admissions', href: '#enquiry', route: '/#enquiry', icon: FileText },
  { id: 'portal', label: 'Portal', to: '/portal/login', icon: Lock },
  { id: 'notices', label: 'Notices', href: '#news', route: '/#news', icon: Bell },
  { id: 'contact', label: 'Contact', href: '#contact', route: '/#contact', icon: PhoneCall },
];

export default function MobileBottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginRoute = location.pathname === '/portal/login';
  const [activeTab, setActiveTab] = useState(isLoginRoute ? 'portal' : 'home');

  useEffect(() => {
    if (location.pathname === '/portal/login') {
      setActiveTab('portal');
    } else if (location.pathname === '/' || location.pathname === '/enquiry') {
      const h = location.hash || (location.pathname === '/enquiry' ? '#enquiry' : '');
      if (h === '#enquiry') setActiveTab('admissions');
      else if (h === '#news') setActiveTab('notices');
      else if (h === '#contact') setActiveTab('contact');
      else setActiveTab('home');
    }
  }, [location.pathname, location.hash]);

  // Strict scope guard: render ONLY on public website & /portal/login, never inside logged-in /portal/* dashboards
  if (location.pathname.startsWith('/portal') && !isLoginRoute) {
    return null;
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    if (tab.to) {
      navigate(tab.to);
      return;
    }

    // If currently on /portal/login, navigate back to the public page / anchor
    if (isLoginRoute) {
      navigate(tab.route || '/');
      return;
    }

    if (tab.href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetId = tab.href.replace(/^#/, '');
    const el = document.getElementById(targetId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition cursor-pointer focus:outline-none ${
                isActive ? 'text-[#1A365D]' : 'text-slate-500 hover:text-[#1A365D]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#D97706]" />
              )}
              <IconComponent
                className={`w-5 h-5 transition ${
                  isActive ? 'text-[#D97706]' : 'text-slate-500'
                }`}
              />
              <span className={isActive ? 'font-bold text-[#1A365D]' : ''}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
