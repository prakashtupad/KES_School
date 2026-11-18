import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, Plus, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EXAM_TERMS = [
  'FA-1',
  'FA-2',
  'Mid-Term (SA-1)',
  'FA-3',
  'FA-4',
  'Annual Exam (SA-2)',
];

const DEFAULT_SUBJECTS = [
  { subjectName: 'English (Language I)', maxMarks: 100, marksObtained: 85, remarks: 'Good' },
  { subjectName: 'Kannada (Language II)', maxMarks: 100, marksObtained: 88, remarks: 'Very Good' },
  { subjectName: 'Hindi (Language III)', maxMarks: 100, marksObtained: 82, remarks: 'Good' },
  { subjectName: 'Mathematics', maxMarks: 100, marksObtained: 90, remarks: 'Excellent' },
  { subjectName: 'General Science / EVS', maxMarks: 100, marksObtained: 86, remarks: 'Very Good' },
  { subjectName: 'Social Studies', maxMarks: 100, marksObtained: 84, remarks: 'Good' },
];

export default function StudentExamMarksModal({
  isOpen = true,
  student,
  onClose,
  onMarksSaved,
}) {
  const { token } = useAuth();
  const [term, setTerm] = useState('FA-1');
  const [academicYear, setAcademicYear] = useState(student?.academicYear || '2026-2027');
  const [attendancePercentage, setAttendancePercentage] = useState(96);
  const [classTeacherRemarks, setClassTeacherRemarks] = useState(
    'Consistent academic progress and active classroom participation.'
  );
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!student) return;
    const existingList = Array.isArray(student.examResults) ? student.examResults : [];
    const match = existingList.find((r) => r.term === term);
    if (match) {
      setAcademicYear(match.academicYear || student.academicYear || '2026-2027');
      setAttendancePercentage(match.attendancePercentage ?? 96);
      setClassTeacherRemarks(
        match.classTeacherRemarks ||
          'Consistent academic progress and active classroom participation.'
      );
      setSubjects(
        Array.isArray(match.subjects) && match.subjects.length > 0
          ? match.subjects.map((s) => ({
              subjectName: s.subjectName || '',
              maxMarks: Number(s.maxMarks) || 100,
              marksObtained: Number(s.marksObtained) || 0,
              remarks: s.remarks || '',
            }))
          : DEFAULT_SUBJECTS
      );
    } else {
      setSubjects(DEFAULT_SUBJECTS);
    }
  }, [student, term]);

  if (!isOpen || !student) return null;

  const handleUpdateSubject = (index, field, val) => {
    setSubjects((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      { subjectName: '', maxMarks: 100, marksObtained: 80, remarks: 'Good' },
    ]);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validSubjects = subjects.filter((s) => String(s.subjectName || '').trim());
    if (validSubjects.length === 0) {
      setErrorMsg('Please enter at least one subject with marks.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/student-portal/marks/${student._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          term,
          academicYear,
          attendancePercentage: Number(attendancePercentage) || 100,
          classTeacherRemarks,
          subjects: validSubjects,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save exam marks.');
      }
      if (onMarksSaved) {
        onMarksSaved(data.student);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not save report card marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Publish Student Exam Marks"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        <div className="bg-[#1A365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#D97706]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706] flex items-center justify-center text-[#D97706]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                Digital Report Card Publisher • {student.grade}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                Publish Term Exam Marks — {student.studentName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Exam Term *
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1A365D] bg-white"
              >
                {EXAM_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Term Attendance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={attendancePercentage}
                onChange={(e) => setAttendancePercentage(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A365D]">
                Subject-Wise Marks
              </span>
              <button
                type="button"
                onClick={handleAddSubject}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1A365D] text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-200"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={sub.subjectName}
                      onChange={(e) =>
                        handleUpdateSubject(idx, 'subjectName', e.target.value)
                      }
                      className="w-full p-1.5 rounded border border-slate-300 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Max"
                      value={sub.maxMarks}
                      onChange={(e) => handleUpdateSubject(idx, 'maxMarks', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs font-mono text-center bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max={sub.maxMarks || 100}
                      placeholder="Scored"
                      value={sub.marksObtained}
                      onChange={(e) =>
                        handleUpdateSubject(idx, 'marksObtained', e.target.value)
                      }
                      className="w-full p-1.5 rounded border border-emerald-400 text-xs font-mono font-bold text-center bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={sub.remarks}
                      onChange={(e) => handleUpdateSubject(idx, 'remarks', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Remove subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
              Class Teacher&apos;s Remarks
            </label>
            <input
              type="text"
              value={classTeacherRemarks}
              onChange={(e) => setClassTeacherRemarks(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark text-white text-xs font-bold shadow cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
              <span>{submitting ? 'Saving...' : `Publish ${term} Report Card`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode;
}
