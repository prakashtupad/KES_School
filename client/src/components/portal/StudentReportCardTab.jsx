import React, { useState, useMemo } from 'react';
import { Award, Printer, Calendar, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import { isSectionApplicable } from './SiblingSwitcherHeader';

const EXAM_TERMS = [
  'FA-1',
  'FA-2',
  'Mid-Term (SA-1)',
  'FA-3',
  'FA-4',
  'Annual Exam (SA-2)',
];

function computeLetterGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'E';
}

export default function StudentReportCardTab({ student }) {
  const examResults = useMemo(
    () => (Array.isArray(student?.examResults) ? student.examResults : []),
    [student]
  );

  const [selectedTerm, setSelectedTerm] = useState(() => {
    if (examResults.length > 0 && examResults[0]?.term) {
      return examResults[0].term;
    }
    return 'FA-1';
  });

  if (!student) return null;

  const activeResult = examResults.find((r) => r.term === selectedTerm) || null;
  const subjects = Array.isArray(activeResult?.subjects) ? activeResult.subjects : [];

  const totalMaxMarks = subjects.reduce(
    (sum, s) => sum + (Number(s.maxMarks) || 100),
    0
  );
  const totalObtainedMarks = subjects.reduce(
    (sum, s) => sum + (Number(s.marksObtained) || 0),
    0
  );
  const overallPercentage =
    totalMaxMarks > 0
      ? Number(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1))
      : 0;
  const overallGrade =
    totalMaxMarks > 0 ? computeLetterGrade(overallPercentage) : '—';
  const attendancePercentage = activeResult?.attendancePercentage ?? 100;
  const teacherRemarks =
    activeResult?.classTeacherRemarks ||
    'Consistent academic participation and good classroom discipline.';

  const handlePrintProgressReport = () => {
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) return;

    const sectionStr = isSectionApplicable(student.section)
      ? ` (Section ${student.section})`
      : '';
    const fatherName = student.father?.name || student.fatherName || '—';
    const motherName =
      student.mother?.name && String(student.mother.name) !== 'true'
        ? student.mother.name
        : student.motherName && String(student.motherName) !== 'true'
          ? student.motherName
          : '—';

    const rowsHtml =
      subjects.length > 0
        ? subjects
            .map((sub, i) => {
              const max = Number(sub.maxMarks) || 100;
              const obt = Number(sub.marksObtained) || 0;
              const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
              const grade = sub.grade || computeLetterGrade(pct);
              return `
                <tr>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center;">${i + 1}</td>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;font-weight:700;color:#1A365D;">${sub.subjectName}</td>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center;">${max}</td>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center;font-weight:700;">${obt}</td>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:#1A365D;">${grade}</td>
                  <td style="padding:8px 12px;border:1px solid #cbd5e1;">${sub.remarks || 'Good'}</td>
                </tr>
              `;
            })
            .join('')
        : `
          <tr>
            <td colspan="6" style="padding:20px;border:1px solid #cbd5e1;text-align:center;color:#64748b;">
              Marks for ${selectedTerm} have not been published yet.
            </td>
          </tr>
        `;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${student.studentName} (${selectedTerm})</title>
          <style>
            @page { size: A4; margin: 14mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; }
            .report-box { border: 2px solid #1A365D; border-radius: 10px; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #D97706; padding-bottom: 12px; margin-bottom: 16px; }
            .society { font-size: 11px; font-weight: 700; color: #D97706; letter-spacing: 1.5px; text-transform: uppercase; }
            .school { font-size: 20px; font-weight: 800; color: #1A365D; margin: 4px 0; }
            .sub { font-size: 11px; color: #475569; }
            .badge { display: inline-block; margin-top: 8px; background: #1A365D; color: #fff; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; background: #F8FAFC; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
            th { background: #1A365D; color: #fff; padding: 9px 12px; border: 1px solid #1A365D; text-transform: uppercase; font-size: 11px; }
            .summary { display: flex; justify-content: space-between; background: #fffbeb; border: 1px solid #D97706; border-radius: 8px; padding: 12px 16px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
            .remarks { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; font-size: 12px; margin-bottom: 36px; }
            .sigs { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1A365D; padding-top: 24px; }
            .sig-line { border-top: 1px solid #64748b; width: 160px; text-align: center; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div class="report-box">
            <div class="header">
              <div class="society">${SCHOOL_INFO.societyName}</div>
              <div class="school">${SCHOOL_INFO.schoolName}</div>
              <div class="sub">Khanatti, Taluk: Mudalgi, District: Belagavi - 591312 | ${SCHOOL_INFO.registrationNo}</div>
              <div class="badge">OFFICIAL PROGRESS REPORT CARD • ${selectedTerm} (${student.academicYear || '2026-2027'})</div>
            </div>

            <div class="grid">
              <div><strong>Student Name:</strong> ${student.studentName}</div>
              <div><strong>Admission No:</strong> ${student.admissionNumber}</div>
              <div><strong>Class & Section:</strong> ${student.grade}${sectionStr}</div>
              <div><strong>Roll No:</strong> ${student.rollNumber || '—'}</div>
              <div><strong>Father's Name:</strong> ${fatherName}</div>
              <div><strong>Mother's Name:</strong> ${motherName}</div>
              <div><strong>STS / SATS No:</strong> ${student.previousStudy?.stsNumber || '—'}</div>
              <div><strong>Attendance:</strong> ${attendancePercentage}%</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width:45px;">#</th>
                  <th style="text-align:left;">Subject</th>
                  <th>Max Marks</th>
                  <th>Marks Obtained</th>
                  <th>Grade</th>
                  <th style="text-align:left;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
              ${
                subjects.length > 0
                  ? `
                <tfoot>
                  <tr style="background:#f1f5f9;font-weight:800;">
                    <td colspan="2" style="padding:9px 12px;border:1px solid #cbd5e1;text-align:right;">GRAND TOTAL</td>
                    <td style="padding:9px 12px;border:1px solid #cbd5e1;text-align:center;">${totalMaxMarks}</td>
                    <td style="padding:9px 12px;border:1px solid #cbd5e1;text-align:center;color:#1A365D;">${totalObtainedMarks}</td>
                    <td style="padding:9px 12px;border:1px solid #cbd5e1;text-align:center;color:#D97706;">${overallGrade} (${overallPercentage}%)</td>
                    <td style="padding:9px 12px;border:1px solid #cbd5e1;">${overallPercentage >= 35 ? 'PASSED' : 'NEEDS IMPROVEMENT'}</td>
                  </tr>
                </tfoot>
              `
                  : ''
              }
            </table>

            <div class="summary">
              <span>Total Score: ${totalObtainedMarks} / ${totalMaxMarks}</span>
              <span>Percentage: ${overallPercentage}%</span>
              <span>Overall Grade: ${overallGrade}</span>
              <span>Term Attendance: ${attendancePercentage}%</span>
            </div>

            <div class="remarks">
              <strong>Class Teacher's Remarks:</strong> ${teacherRemarks}
            </div>

            <div class="sigs">
              <div class="sig-line">Class Teacher</div>
              <div class="sig-line">Parent / Guardian</div>
              <div class="sig-line">Headmaster / Principal</div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-5">
      {/* Top Report Card Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              Academic Assessment &amp; Scholastic Progress ({student.academicYear || '2026-2027'})
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A365D]">
              Digital Report Card — {student.studentName}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Select Exam Term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-[#1A365D] bg-white focus:border-[#1A365D]"
          >
            {EXAM_TERMS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrintProgressReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D97706]" />
            <span>🖨️ Print Progress Report</span>
          </button>
        </div>
      </div>

      {/* Term Summary Metrics */}
      {subjects.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Total Marks Scored
              </span>
              <div className="text-xl font-mono font-bold text-[#1A365D] mt-1">
                {totalObtainedMarks} / {totalMaxMarks}
              </div>
              <span className="text-[11px] text-slate-500">{selectedTerm}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Overall Percentage
              </span>
              <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
                {overallPercentage}%
              </div>
              <span className="text-[11px] text-emerald-700">Aggregate Score</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Scholastic Grade
              </span>
              <div className="text-xl font-mono font-bold text-[#D97706] mt-1">
                Grade {overallGrade}
              </div>
              <span className="text-[11px] text-slate-500">KSEAB Grading Scale</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Term Attendance
              </span>
              <div className="text-xl font-mono font-bold text-[#1A365D] mt-1">
                {attendancePercentage}%
              </div>
              <span className="text-[11px] text-slate-500">Classroom Presence</span>
            </div>
          </div>

          {/* Subject Marks Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1A365D]">
                Subject-Wise Marks Breakdown ({selectedTerm})
              </span>
              {activeResult?.publishedAt && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>
                    Published:{' '}
                    {new Date(activeResult.publishedAt).toLocaleDateString('en-IN')}
                  </span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1A365D] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map((sub, idx) => {
                    const max = Number(sub.maxMarks) || 100;
                    const obt = Number(sub.marksObtained) || 0;
                    const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
                    const grade = sub.grade || computeLetterGrade(pct);

                    return (
                      <tr key={sub.subjectName || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#1A365D]">
                          {sub.subjectName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">
                          {max}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          {obt}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-[#1A365D] border border-[#D97706]/40 font-mono font-bold text-xs">
                            {grade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {sub.remarks || 'Good Progress'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F8FAFC] font-bold text-[#1A365D] border-t-2 border-slate-200">
                    <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs">
                      Grand Total &amp; Aggregate
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{totalMaxMarks}</td>
                    <td className="py-3 px-4 text-center font-mono text-emerald-700">
                      {totalObtainedMarks}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#D97706]">
                      {overallGrade} ({overallPercentage}%)
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{overallPercentage >= 35 ? 'Passed' : 'Needs Support'}</span>
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-amber-50/60 border-t border-slate-200 text-xs text-slate-700">
              <strong className="text-[#1A365D] uppercase tracking-wider text-[11px] block mb-0.5">
                Class Teacher&apos;s Term Remarks:
              </strong>
              <span>{teacherRemarks}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2.5">
          <FileSpreadsheet className="w-9 h-9 text-slate-300 mx-auto" />
          <div className="font-serif font-bold text-[#1A365D] text-base">
            {selectedTerm} Marks Not Published Yet
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The class teacher has not published exam marks for{' '}
            <strong className="text-[#1A365D]">{selectedTerm}</strong> yet. You can switch
            the term dropdown above or print a blank assessment sheet using the Print button.
          </p>
          {examResults.length > 0 && (
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {examResults.map((res) => (
                <button
                  key={res.term}
                  type="button"
                  onClick={() => setSelectedTerm(res.term)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 border border-[#D97706]/40 text-[#1A365D] text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  View Published: {res.term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
