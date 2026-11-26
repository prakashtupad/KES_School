import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  GraduationCap,
  UserCheck,
  Bell,
  CalendarDays,
  Sparkles,
  Award,
  MapPin,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    id: 'admission',
    label: 'Admission',
    icon: UserPlus,
    href: '#enquiry',
    bg: 'bg-amber-50 border-amber-200/80 text-[#D97706]',
  },
  {
    id: 'parent-portal',
    label: 'Parent Portal',
    icon: GraduationCap,
    to: '/portal/login?mode=parent',
    bg: 'bg-indigo-50 border-indigo-200/80 text-[#1A365D]',
  },
  {
    id: 'teachers-portal',
    label: 'Teachers Portal',
    icon: UserCheck,
    to: '/portal/login?mode=staff',
    bg: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
  },
  {
    id: 'notices-news',
    label: 'Notices & News',
    icon: Bell,
    href: '#news',
    bg: 'bg-slate-100 border-slate-200 text-[#1A365D]',
  },
  {
    id: 'holidays',
    label: 'Holidays',
    icon: CalendarDays,
    href: '#academic-calendar',
    bg: 'bg-sky-50 border-sky-200/80 text-sky-700',
  },
  {
    id: 'campus-life',
    label: 'Campus Life',
    icon: Sparkles,
    href: '#campus-life',
    bg: 'bg-purple-50 border-purple-200/80 text-purple-700',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: Award,
    href: '#leadership',
    bg: 'bg-yellow-50 border-yellow-200/80 text-amber-700',
  },
  {
    id: 'campus-location',
    label: 'Campus Map',
    icon: MapPin,
    href: '#contact',
    bg: 'bg-rose-50 border-rose-200/80 text-rose-700',
  },
];

export default function MobileQuickActionsGrid() {
  const location = useLocation();
  const navigate = useNavigate();

  // Strict scope guard: never render on /portal/* routes
  if (location.pathname.startsWith('/portal')) {
    return null;
  }

  const handleAction = (action) => {
    if (action.to) {
      navigate(action.to);
      return;
    }
    if (action.href) {
      const targetId = action.href.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      aria-label="Quick School Services"
      className="md:hidden bg-white border-b border-slate-200/80 px-3.5 py-4 shadow-xs"
    >
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
          Quick Access
        </span>
        <span className="text-[11px] font-semibold text-[#1A365D]">
          KES Khanatti App
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {QUICK_ACTIONS.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item)}
              className="flex flex-col items-center justify-start gap-1.5 py-1.5 rounded-xl active:scale-95 transition cursor-pointer focus:outline-none"
            >
              <span
                className={`w-12 h-12 rounded-2xl border shadow-xs flex items-center justify-center ${item.bg}`}
              >
                <IconComponent className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
