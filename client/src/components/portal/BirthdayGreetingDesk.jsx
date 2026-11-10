import React, { useState, useEffect } from 'react';
import {
  getStudentBirthdayWhatsAppUrl,
  getStaffBirthdayWhatsAppUrl,
} from '../../utils/birthdayWishFormatter';

export default function BirthdayGreetingDesk({ portalCelebrants: propCelebrants = null }) {
  const [celebrants, setCelebrants] = useState(
    propCelebrants || { students: [], staff: [] }
  );

  useEffect(() => {
    if (propCelebrants) {
      setCelebrants(propCelebrants);
      return;
    }

    let active = true;
    fetch('/api/v1/content/today-birthdays')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data || data.success === false) return;
        if (data.portalCelebrants) {
          setCelebrants(data.portalCelebrants);
        }
      })
      .catch(() => {
        // Silent fallback
      });

    return () => {
      active = false;
    };
  }, [propCelebrants]);

  const students = celebrants.students || [];
  const staff = celebrants.staff || [];
  const total = students.length + staff.length;

  if (total === 0) return null;

  return (
    <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-300 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎂</span>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Today&apos;s Birthday Celebrations ({total})
            </h4>
            <p className="text-xs text-slate-600">
              Send warm school wishes directly to parents or colleagues via 1-click free WhatsApp.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {students.map((student) => (
          <div
            key={student._id}
            className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-xs"
          >
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 block truncate">
                {student.studentName}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">
                {student.grade}
                {student.section && student.section !== 'N/A'
                  ? ` (Sec ${student.section})`
                  : ''}{' '}
                • Parent: {student.father?.name || student.fatherName || 'Guardian'}
              </span>
            </div>
            <a
              href={getStudentBirthdayWhatsAppUrl(student)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0"
            >
              <span>📲 Wish on WhatsApp</span>
            </a>
          </div>
        ))}

        {staff.map((member) => (
          <div
            key={member._id}
            className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between gap-2 shadow-xs"
          >
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-800 block truncate">
                {member.fullName} ({member.role === 'teacher' ? 'Faculty' : 'Staff'})
              </span>
              <span className="text-[11px] text-slate-500 block">Faculty Birthday</span>
            </div>
            <a
              href={getStaffBirthdayWhatsAppUrl(member)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0"
            >
              <span>📲 Wish on WhatsApp</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
