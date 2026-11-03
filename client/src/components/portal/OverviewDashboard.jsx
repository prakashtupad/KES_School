import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, BookOpen, Bell, CalendarCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../constants/schoolData';

export default function OverviewDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    visitScheduled: 0,
    staffCount: 3,
    homeworkCount: 0,
    noticesCount: 3,
  });

  useEffect(() => {
    fetch('/api/v1/admin/overview', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.data) {
          setStats(data.data);
        }
      })
      .catch(() => {});
  }, [token]);

  const cards = [
    {
      label: 'Total Admission Enquiries',
      value: stats.totalEnquiries,
      sub: `${stats.newEnquiries} new awaiting call`,
      icon: ClipboardList,
      to: '/portal/admin',
      color: 'bg-brand-navy text-white',
    },
    {
      label: 'Scheduled Campus Visits',
      value: stats.visitScheduled,
      sub: 'Prospective parents visiting Khanatti',
      icon: CalendarCheck,
      to: '/portal/admin',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
    {
      label: 'Authorized Staff & Faculty',
      value: stats.staffCount,
      sub: 'Office Admin & Faculty Teachers',
      icon: Users,
      to: '/portal/staff',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
    {
      label: 'Published Homework Tasks',
      value: stats.homeworkCount,
      sub: `${stats.noticesCount} active school notices`,
      icon: BookOpen,
      to: '/portal/teacher',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyDark text-white rounded-2xl p-6 sm:p-8 shadow-md border border-brand-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-goldSoft text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            Institutional Governance Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold">
            Welcome, {user?.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {SCHOOL_INFO.societyName} {SCHOOL_INFO.schoolName} ({SCHOOL_INFO.registrationNo})
          </p>
        </div>

        <Link
          to="/portal/admin"
          className="bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-5 py-2.5 rounded-lg shadow transition text-xs sm:text-sm whitespace-nowrap"
        >
          Open Admissions Desk →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className={`rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${card.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {card.label}
                </span>
                <IconComponent className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <div className="text-3xl font-serif font-bold">{card.value}</div>
                <div className="text-xs opacity-75 mt-1">{card.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
