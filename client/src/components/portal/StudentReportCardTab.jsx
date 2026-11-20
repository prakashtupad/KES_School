import React, { useState, useMemo } from 'react';
import {
  Award,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ChevronDown,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import { isSectionApplicable } from './SiblingSwitcherHeader';
import { generateProgressReportImage } from '../../utils/progressReportImageGenerator';

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
    'Consistent academic progress and active classroom participation.';

  const academicYear = activeResult?.academicYear || student.academicYear || '2026-2027';
  const sectionStr = isSectionApplicable(student.section)
    ? ` (Sec ${student.section})`
    : '';
  const gradeAndSectionLabel = `${student.grade || '—'}${sectionStr}`;
  const fatherName = student.father?.name || student.fatherName || '—';
  const motherName =
    student.mother?.name && String(student.mother.name) !== 'true'
      ? student.mother.name
      : student.motherName && String(student.motherName) !== 'true'
        ? student.motherName
        : '—';
  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const parentPhone = String(
    student.primaryPhone || student.whatsappNumber || student.father?.mobile || ''
  ).replace(/\D/g, '');

  const publishedDateObj = activeResult?.publishedAt
    ? new Date(activeResult.publishedAt)
    : new Date();
  const formattedDate = publishedDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const buildReportCardHtml = (autoPrint = true) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${origin}${SCHOOL_INFO.logoUrl || '/images/logo.jpg'}`;

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
                  <td style="text-align: center;">${i + 1}</td>
                  <td><strong>${sub.subjectName}</strong></td>
                  <td style="text-align: center; font-family: monospace;">${max}</td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold;">${obt}</td>
                  <td style="text-align: center; font-family: monospace; font-weight: bold; color: #1A365D;">${grade}</td>
                  <td>${sub.remarks || 'Good'}</td>
                </tr>
              `;
            })
            .join('')
        : `
          <tr>
            <td colspan="6" style="padding:18px;text-align:center;color:#64748b;">
              Marks for ${selectedTerm} have not been published yet.
            </td>
          </tr>
        `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Official Digital Marks Card - ${student.studentName} (${selectedTerm})</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 14mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            .counterfoil {
              position: relative;
              border: 2px solid #1A365D;
              border-radius: 10px;
              padding: 18px 20px;
              background: #ffffff;
              overflow: hidden;
            }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Georgia, serif;
              font-size: 54px;
              font-weight: bold;
              letter-spacing: 6px;
              color: rgba(26, 54, 93, 0.045);
              pointer-events: none;
              z-index: 0;
            }
            .cf-header, .cf-meta-bar, .cf-grid, .cf-table, .cf-words, .cf-sigs {
              position: relative;
              z-index: 1;
            }
            .cf-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;
              border-bottom: 2px solid #1A365D;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .cf-logo {
              width: 62px;
              height: 62px;
              border-radius: 50%;
              object-fit: contain;
              border: 2px solid #D97706;
              padding: 2px;
              background: #ffffff;
              flex-shrink: 0;
            }
            .cf-titles {
              flex: 1;
              text-align: center;
            }
            .cf-society {
              font-size: 10px;
              font-weight: bold;
              letter-spacing: 1.2px;
              color: #475569;
              text-transform: uppercase;
            }
            .cf-school {
              font-family: Georgia, serif;
              font-size: 18px;
              font-weight: bold;
              color: #1A365D;
              margin: 3px 0;
            }
            .cf-sub {
              font-size: 10.5px;
              color: #334155;
            }
            .cf-contact {
              font-size: 10px;
              color: #475569;
              margin-top: 2px;
            }
            .cf-badge-col {
              text-align: right;
              flex-shrink: 0;
            }
            .cf-copy-badge {
              display: inline-block;
              background: #1A365D;
              color: #ffffff;
              font-size: 9.5px;
              font-weight: bold;
              padding: 4px 10px;
              border-radius: 4px;
              letter-spacing: 0.6px;
              text-transform: uppercase;
            }
            .cf-date {
              font-size: 10px;
              color: #334155;
              margin-top: 6px;
            }
            .cf-meta-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 12px;
              font-size: 11.5px;
              margin-bottom: 12px;
            }
            .gold {
              color: #b45309;
              font-family: monospace;
              font-size: 13px;
            }
            .cf-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 20px;
              font-size: 11.5px;
              margin-bottom: 12px;
            }
            .cf-grid .lbl {
              color: #64748b;
            }
            .cf-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
              margin-bottom: 12px;
            }
            .cf-table th {
              background: #f1f5f9;
              color: #1e293b;
              border: 1px solid #94a3b8;
              padding: 7px 10px;
              text-align: left;
            }
            .cf-table td {
              border: 1px solid #94a3b8;
              padding: 7px 10px;
            }
            .total-row td {
              background: #f8fafc;
              font-weight: bold;
            }
            .cf-words {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              font-size: 11.5px;
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 24px;
            }
            .paid-pill {
              background: #d1fae5;
              color: #065f46;
              border: 1px solid #6ee7b7;
              font-size: 10px;
              font-weight: bold;
              padding: 3px 9px;
              border-radius: 4px;
              white-space: nowrap;
            }
            .cf-sigs {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 22px;
              font-size: 11px;
              font-weight: bold;
              color: #334155;
            }
            .sig-box {
              border-top: 1px dashed #475569;
              padding-top: 5px;
              min-width: 185px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="counterfoil">
            <div class="watermark">KES KHANATTI</div>

            <div class="cf-header">
              <img class="cf-logo" src="${logoSrc}" alt="School Logo" />
              <div class="cf-titles">
                <div class="cf-society">KHANATTI EDUCATION SOCIETY'S</div>
                <div class="cf-school">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</div>
                <div class="cf-sub">Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026</div>
                <div class="cf-contact">Phone: +91 77957 70785 • Email: kes2026@gmail.com</div>
              </div>
              <div class="cf-badge-col">
                <span class="cf-copy-badge">STUDENT / PARENT COPY</span>
                <div class="cf-date">Date: <strong>${formattedDate}</strong></div>
              </div>
            </div>

            <div class="cf-meta-bar">
              <div>Exam Term: <strong class="gold">${selectedTerm}</strong></div>
              <div>Admission No: <strong>${student.admissionNumber || '—'}</strong></div>
              <div>Academic Year: <strong>${academicYear}</strong></div>
            </div>

            <div class="cf-grid">
              <div><span class="lbl">Student Name:</span> <strong>${student.studentName || '—'}</strong></div>
              <div><span class="lbl">Grade / Class:</span> <strong>${gradeAndSectionLabel}</strong></div>
              <div><span class="lbl">Father / Guardian:</span> <strong>${fatherName}</strong></div>
              <div><span class="lbl">Mother's Name:</span> <strong>${motherName}</strong></div>
              <div><span class="lbl">Village / Town:</span> <strong>${village}</strong></div>
              <div><span class="lbl">Roll No &amp; Attendance:</span> <strong>Roll: ${student.rollNumber || '—'} • Attendance: ${attendancePercentage}%</strong></div>
            </div>

            <table class="cf-table">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">#</th>
                  <th>Subject Particulars</th>
                  <th style="width: 95px; text-align: center;">Max Marks</th>
                  <th style="width: 115px; text-align: center;">Marks Obtained</th>
                  <th style="width: 80px; text-align: center;">Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                ${
                  subjects.length > 0
                    ? `
                  <tr class="total-row">
                    <td colspan="2" style="text-align: right;">TOTAL MARKS OBTAINED (${overallPercentage}%):</td>
                    <td style="text-align: center; font-family: monospace;">${totalMaxMarks}</td>
                    <td style="text-align: center; font-family: monospace; font-size: 13px; color: #065f46;">${totalObtainedMarks}</td>
                    <td style="text-align: center; font-family: monospace; font-size: 13px; color: #b45309;">${overallGrade}</td>
                    <td style="color: #065f46;">${overallPercentage >= 35 ? 'PASSED' : 'NEEDS SUPPORT'}</td>
                  </tr>
                `
                    : ''
                }
              </tbody>
            </table>

            <div class="cf-words">
              <div>
                Class Teacher's Remarks: <strong>${teacherRemarks}</strong>
              </div>
              <span class="paid-pill">✓ ${overallPercentage >= 35 ? 'PASSED & CONFIRMED' : 'PUBLISHED'}</span>
            </div>

            <div class="cf-sigs">
              <div class="sig-box">Class Teacher Signature</div>
              <div class="sig-box">Parent / Guardian Signature</div>
              <div class="sig-box" style="color:#1A365D;">Headmaster / Principal Seal &amp; Signature</div>
            </div>
          </div>

          ${
            autoPrint
              ? `
          <script>
            (function() {
              var printed = false;
              function triggerPrint() {
                if (printed) return;
                printed = true;
                window.focus();
                window.print();
              }
              var imgs = Array.prototype.slice.call(document.images);
              if (imgs.length === 0) {
                window.onload = triggerPrint;
              } else {
                var loaded = 0;
                function check() {
                  loaded++;
                  if (loaded >= imgs.length) setTimeout(triggerPrint, 120);
                }
                imgs.forEach(function(img) {
                  if (img.complete) check();
                  else {
                    img.addEventListener('load', check);
                    img.addEventListener('error', check);
                  }
                });
                setTimeout(triggerPrint, 900);
              }
            })();
          </script>
          `
              : ''
          }
        </body>
      </html>
    `;
  };

  const handlePrintProgressReport = () => {
    const win = window.open('', '_blank', 'width=900,height=820');
    if (!win) {
      window.print();
      return;
    }
    win.document.write(buildReportCardHtml(true));
    win.document.close();
  };

  const handleDownloadProgressReport = async (format = 'png') => {
    const cleanTerm = String(selectedTerm || 'Term').replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanName = String(student.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');

    if (format === 'html') {
      try {
        const htmlDoc = buildReportCardHtml(false);
        const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = `KES_Progress_Report_${cleanTerm}_${cleanName}.html`;
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadFeedback(`Printable Progress Report "${fileName}" downloaded!`);
        setTimeout(() => setDownloadFeedback(''), 4500);
      } catch (err) {
        console.error('[Download Progress Report Document Error]', err);
        setDownloadFeedback('Failed to download document.');
      }
      return;
    }

    // Default: High-Resolution PNG Image
    setIsDownloading(true);
    try {
      const imgData = await generateProgressReportImage({
        student,
        selectedTerm,
        academicYear,
        formattedDate,
        gradeAndSectionLabel,
        fatherName,
        motherName,
        village,
        attendancePercentage,
        subjects,
        totalMaxMarks,
        totalObtainedMarks,
        overallPercentage,
        overallGrade,
        teacherRemarks,
      });

      const a = document.createElement('a');
      a.href = imgData.dataUrl;
      a.download = imgData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadFeedback(`Progress Report "${imgData.fileName}" downloaded successfully!`);
      setTimeout(() => setDownloadFeedback(''), 4500);
    } catch (err) {
      console.error('[Download Progress Report Image Error]', err);
      setDownloadFeedback('Failed to generate image. Please use Print to PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Report Card Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              Academic Assessment &amp; Scholastic Progress ({academicYear})
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A365D]">
              Official Digital Marks Card — {student.studentName}
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

          {/* Download Progress Report Button with format dropdown */}
          <div className="relative inline-flex rounded-xl shadow-sm">
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => handleDownloadProgressReport('png')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-l-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              title="Download High-Resolution Official Progress Report Image (PNG)"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>{isDownloading ? 'Downloading...' : '📥 Download Progress Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDownloadMenu((prev) => !prev)}
              className="px-2.5 py-2 rounded-r-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm border-l border-emerald-600 transition cursor-pointer"
              title="More Download Options"
            >
              <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadMenu(false);
                    handleDownloadProgressReport('png');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center gap-2.5 text-slate-800 font-semibold cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-emerald-900 font-bold">Download Image (PNG)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      High-resolution card for WhatsApp &amp; Gallery
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadMenu(false);
                    handleDownloadProgressReport('html');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 flex items-center gap-2.5 text-slate-800 font-semibold border-t border-slate-100 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="text-blue-900 font-bold">Download Document (HTML / PDF)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Offline A4 format ready for Print to PDF
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Feedback Notification */}
      {downloadFeedback && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{downloadFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadFeedback('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Official Marks Card Container Matching Payment Receipt Header & Counterfoil Styling */}
      {subjects.length > 0 ? (
        <div className="bg-white shadow-md p-4 sm:p-6 rounded-2xl border border-slate-200">
          <div className="border-2 border-brand-navy p-4 sm:p-6 rounded-xl bg-white text-slate-900 relative overflow-hidden">
            {/* Subtle Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none text-4xl sm:text-6xl font-serif font-bold tracking-widest text-brand-navy select-none">
              KES KHANATTI
            </div>

            {/* Institutional Header (Identical to Official Payment Receipt Header) */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-brand-navy pb-3.5 mb-3.5">
              <img
                src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
                alt="School Logo"
                className="w-14 h-14 rounded-full object-contain border-2 border-brand-gold p-0.5 bg-white flex-shrink-0"
              />

              <div className="text-center flex-1 px-2">
                <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-500">
                  KHANATTI EDUCATION SOCIETY&apos;S
                </span>
                <h2 className="text-sm sm:text-lg font-serif font-bold text-brand-navy leading-tight">
                  SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
                </h2>
                <p className="text-[11px] text-slate-600">
                  Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026
                </p>
                <p className="text-[10px] text-slate-500">
                  Phone: +91 77957 70785 • Email: kes2026@gmail.com
                </p>
              </div>

              <div className="text-center sm:text-right flex-shrink-0">
                <span className="inline-block bg-brand-navy text-white px-2.5 py-0.5 text-[9.5px] font-bold uppercase rounded tracking-wider">
                  STUDENT / PARENT COPY
                </span>
                <div className="mt-1 text-[10px] font-mono text-slate-600">
                  Date: <strong>{formattedDate}</strong>
                </div>
              </div>
            </div>

            {/* Marks Card Meta Strip (Matching Receipt Meta Strip) */}
            <div className="relative z-10 flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-3.5">
              <div>
                Exam Term:{' '}
                <strong className="font-mono text-brand-gold text-sm">{selectedTerm}</strong>
              </div>
              <div>
                Admission No:{' '}
                <strong className="font-mono text-brand-navy">{student.admissionNumber}</strong>
              </div>
              <div>
                Academic Year: <strong>{academicYear}</strong>
              </div>
            </div>

            {/* Student Particulars Grid (Matching Receipt Particulars Grid) */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-3.5">
              <div>
                <span className="text-slate-500">Student Name:</span>{' '}
                <strong className="text-slate-900">{student.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Grade / Class:</span>{' '}
                <strong className="text-slate-900">{gradeAndSectionLabel}</strong>
              </div>
              <div>
                <span className="text-slate-500">Father / Guardian:</span>{' '}
                <strong className="text-slate-900">{fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Mother&apos;s Name:</span>{' '}
                <strong className="text-slate-900">{motherName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Village / Town:</span>{' '}
                <strong className="text-slate-900">{village}</strong>
              </div>
              <div>
                <span className="text-slate-500">Roll No &amp; Attendance:</span>{' '}
                <strong className="text-slate-900">
                  Roll: {student.rollNumber || '—'} • Attendance: {attendancePercentage}%
                </strong>
              </div>
            </div>

            {/* Subject Marks Table (Matching Receipt Itemized Table Style) */}
            <div className="relative z-10 overflow-x-auto mb-3.5">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center w-10">#</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Subject Particulars
                    </th>
                    <th className="border border-slate-300 p-2 text-center w-24">
                      Max Marks
                    </th>
                    <th className="border border-slate-300 p-2 text-center w-28">
                      Marks Obtained
                    </th>
                    <th className="border border-slate-300 p-2 text-center w-20">
                      Grade
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, idx) => {
                    const max = Number(sub.maxMarks) || 100;
                    const obt = Number(sub.marksObtained) || 0;
                    const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
                    const grade = sub.grade || computeLetterGrade(pct);

                    return (
                      <tr key={sub.subjectName || idx}>
                        <td className="border border-slate-300 p-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-300 p-2 font-semibold text-brand-navy">
                          {sub.subjectName}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-slate-700">
                          {max}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                          {obt}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-brand-navy">
                          {grade}
                        </td>
                        <td className="border border-slate-300 p-2 text-slate-600">
                          {sub.remarks || 'Good'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td
                      colSpan={2}
                      className="border border-slate-300 p-2 text-right uppercase"
                    >
                      Total Marks Obtained ({overallPercentage}%):
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {totalMaxMarks}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono text-sm text-emerald-700">
                      {totalObtainedMarks}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono text-sm text-brand-gold">
                      {overallGrade}
                    </td>
                    <td className="border border-slate-300 p-2 text-emerald-700">
                      {overallPercentage >= 35 ? 'PASSED' : 'NEEDS SUPPORT'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Remarks & Result Status Bar (Matching Amount in Words Bar on Receipt) */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-xs mb-5">
              <div>
                <span className="text-slate-600">Class Teacher&apos;s Remarks: </span>
                <strong className="text-brand-navy">{teacherRemarks}</strong>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>
                  {overallPercentage >= 35
                    ? `Passed • Grade ${overallGrade} (${overallPercentage}%)`
                    : 'Published'}
                </span>
              </span>
            </div>

            {/* Signatures Footer (Matching Payment Receipt Signatures) */}
            <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 pt-5 text-xs font-semibold text-slate-700">
              <div className="text-center">
                <div className="w-36 sm:w-44 border-b border-dashed border-slate-500 mb-1" />
                <span className="text-[11px]">Class Teacher Signature</span>
              </div>
              <div className="text-center">
                <div className="w-36 sm:w-44 border-b border-dashed border-slate-500 mb-1" />
                <span className="text-[11px]">Parent / Guardian Signature</span>
              </div>
              <div className="text-center">
                <div className="w-44 sm:w-56 border-b border-dashed border-slate-800 mb-1" />
                <span className="text-[11px] font-bold text-brand-navy">
                  Headmaster / Principal Seal &amp; Signature
                </span>
              </div>
            </div>
          </div>
        </div>
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
