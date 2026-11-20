import React, { useMemo, useState } from 'react';
import { BookOpen, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { isSectionApplicable } from './SiblingSwitcherHeader';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentCurriculumTab({ student, homeworkList = [] }) {
  const { t } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  // Filter homework client-side for the selected sibling's grade & section with zero server requests
  const childHomework = useMemo(() => {
    if (!student || !Array.isArray(homeworkList)) return [];
    const targetGrade = String(student.grade || '').trim();
    const targetSection = String(student.section || '').trim().toUpperCase();
    const studentHasSection = isSectionApplicable(targetSection);

    return homeworkList.filter((hw) => {
      const gradeMatches =
        hw.grade === targetGrade || hw.grade === 'All Classes';
      if (!gradeMatches) return false;

      const hwSec = String(hw.section || '').trim().toUpperCase();
      if (!isSectionApplicable(hwSec) || hwSec === 'ALL' || !studentHasSection) {
        return true;
      }
      return hwSec === targetSection;
    });
  }, [homeworkList, student]);

  const subjects = useMemo(() => {
    const unique = new Set(
      childHomework.map((hw) => hw.subject).filter(Boolean)
    );
    return ['All Subjects', ...Array.from(unique)];
  }, [childHomework]);

  const filteredAssignments = useMemo(() => {
    if (selectedSubject === 'All Subjects') return childHomework;
    return childHomework.filter((hw) => hw.subject === selectedSubject);
  }, [childHomework, selectedSubject]);

  if (!student) return null;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              Daily Classroom Diary • {student.grade}
              {isSectionApplicable(student.section) ? ` (Section ${student.section})` : ''}
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A365D]">
              {t('studentPortal.homework.heading')} ({filteredAssignments.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('studentPortal.homework.showingFor')}{' '}
              <strong className="text-[#1A365D]">{student.studentName}</strong>.
            </p>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {subjects.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-[#1A365D] text-white border-[#1A365D]'
                    : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Homework Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <div className="font-serif font-bold text-[#1A365D] text-sm">
            No Pending Homework Assignments for {student.grade}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            New daily homework and study instructions published by your class teachers will
            automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((hw, idx) => {
            const assignedStr = hw.assignedDate || hw.createdAt
              ? new Date(hw.assignedDate || hw.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Today';
            const dueStr = hw.dueDate
              ? new Date(hw.dueDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={hw._id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#D97706]/60 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1A365D] text-white text-xs font-bold">
                      {hw.subject || 'General'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Assigned: {assignedStr}</span>
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#1A365D]">
                    {hw.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/80">
                    {hw.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Teacher: {hw.teacherName || 'Class Faculty'}</span>
                  </span>

                  {dueStr && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                      <Clock className="w-3 h-3 text-[#D97706]" />
                      <span>Due: {dueStr}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
