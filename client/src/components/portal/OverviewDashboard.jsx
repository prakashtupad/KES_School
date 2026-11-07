import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  BookOpen,
  IndianRupee,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SCHOOL_INFO } from '../../constants/schoolData';

export default function OverviewDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    studentCount: 0,
    totalFeeCollected: 0,
    paidStudentCount: 0,
    pendingFeeCount: 0,
    staffCount: 2,
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
      label: 'Enquiries',
      value: stats.totalEnquiries,
      sub: `${stats.newEnquiries} new leads`,
      icon: ClipboardList,
      to: '/portal/admin',
      color: 'bg-brand-navy text-white',
    },
    {
      label: 'Enrolled Students',
      value: stats.studentCount ?? 0,
      sub: 'Student directory',
      icon: GraduationCap,
      to: '/portal/students',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
    {
      label: 'Payment Fee Status',
      value: `₹${Number(stats.totalFeeCollected ?? 0).toLocaleString('en-IN')}`,
      sub: `${stats.paidStudentCount ?? 0} Paid • ${stats.pendingFeeCount ?? 0} Pending`,
      icon: IndianRupee,
      to: '/portal/students',
      color: 'bg-emerald-50 text-emerald-950 border border-emerald-200',
    },
    {
      label: 'Staff & Faculty',
      value: stats.staffCount,
      sub: 'Active accounts',
      icon: Users,
      to: '/portal/staff',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
    {
      label: 'Homework & Notices',
      value: stats.homeworkCount,
      sub: `${stats.noticesCount} active notices`,
      icon: BookOpen,
      to: '/portal/teacher',
      color: 'bg-white text-brand-navy border border-slate-200',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyDark text-white rounded-2xl p-4 sm:p-6 shadow-md border border-brand-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-goldSoft text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            School Overview
          </span>
          <h2 className="text-lg sm:text-2xl font-serif font-bold">
            Welcome, {user?.fullName}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {SCHOOL_INFO.schoolName} ({SCHOOL_INFO.registrationNo})
          </p>
        </div>

        <Link
          to="/portal/admin"
          className="bg-brand-gold hover:bg-brand-goldLight text-brand-navyDark font-bold px-4 py-2 rounded-lg shadow transition text-xs whitespace-nowrap"
        >
          Admissions Desk →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className={`rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${card.color}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 truncate">
                  {card.label}
                </span>
                <IconComponent className="w-4 h-4 text-brand-gold flex-shrink-0" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] opacity-75 mt-1 truncate">{card.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
