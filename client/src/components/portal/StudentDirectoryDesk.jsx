import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Users,
  Phone,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  Pencil,
  Download,
  Eye,
  Printer,
  IndianRupee,
  Award,
  History,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  printStudentAdmissionSummary,
  printStudentDirectoryTable,
} from '../../utils/printStudentSummary';
import { exportStudentDirectoryExcel } from '../../utils/exportStudentDirectoryExcel';
import DirectAdmissionOnboardingModal from './DirectAdmissionOnboardingModal';
import StudentProfileDrawer from './StudentProfileDrawer';
import AdmissionPaymentModal from './AdmissionPaymentModal';
import PrintableFeeReceipt from './PrintableFeeReceipt';
import StudentExamMarksModal from './StudentExamMarksModal';
import PaymentAuditLogTimeline from './PaymentAuditLogTimeline';
import StudentIdCardModal from './StudentIdCardModal';

const GRADE_FILTERS = [
  'All Classes',
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
];

const SECTIONS = ['All', 'A', 'B', 'C', 'N/A'];

const isSectionApplicable = (sec) => {
  if (!sec) return false;
  const normalized = String(sec).trim().toUpperCase();
  return normalized !== 'N/A' && normalized !== 'NOT APPLICABLE' && normalized !== 'NONE';
};

const sortStudentsByAdmNoAsc = (list = []) =>
  [...list].sort((a, b) => {
    const admA = String(a?.admissionNumber || '').trim();
    const admB = String(b?.admissionNumber || '').trim();
    if (!admA && !admB) return 0;
    if (!admA) return 1;
    if (!admB) return -1;
    return admA.localeCompare(admB, undefined, { numeric: true, sensitivity: 'base' });
  });

export default function StudentDirectoryDesk() {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Bar States
  const [gradeFilter, setGradeFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all'); // 'all' | 'paid' | 'partial' | 'unpaid'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Multi-Step Onboarding Wizard & Full Profile Drawer States
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [paymentModalStudent, setPaymentModalStudent] = useState(null);
  const [receiptModalStudent, setReceiptModalStudent] = useState(null);
  const [marksModalStudent, setMarksModalStudent] = useState(null);
  const [auditLogModalStudent, setAuditLogModalStudent] = useState(null);
  const [idCardModalStudents, setIdCardModalStudents] = useState(null);
  const [idCardModalTitle, setIdCardModalTitle] = useState('');
  const [feedback, setFeedback] = useState('');
  const [toastAlert, setToastAlert] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/students', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAllStudents(sortStudentsByAdmNoAsc(data.students || data.data || []));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Compute live KPI & quick class-pill counts from the full directory
  const { kpiCounts, classPillCounts } = useMemo(() => {
    let paid = 0;
    let partial = 0;
    let unpaid = 0;
    let nursery = 0;
    let lkg = 0;
    let ukg = 0;
    let grades1to5 = 0;

    allStudents.forEach((st) => {
      const paidAmt = Number(st.feeDetails?.amountPaid || 0);
      const totalFeeAmt = Math.max(
        Number(st.feeDetails?.admissionFeeAmount || paidAmt || 500),
        paidAmt
      );
      const balanceAmt = Math.max(
        0,
        Number(st.feeDetails?.balanceDue ?? totalFeeAmt - paidAmt)
      );
      if (paidAmt > 0 && balanceAmt === 0) paid += 1;
      else if (paidAmt > 0 && balanceAmt > 0) partial += 1;
      else unpaid += 1;

      const g = String(st.grade || '').trim();
      if (g === 'Nursery') nursery += 1;
      else if (g === 'LKG') lkg += 1;
      else if (g === 'UKG') ukg += 1;
      else if (['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].includes(g)) {
        grades1to5 += 1;
      }
    });

    return {
      kpiCounts: { total: allStudents.length, paid, partial, unpaid },
      classPillCounts: {
        all: allStudents.length,
        Nursery: nursery,
        LKG: lkg,
        UKG: ukg,
        'Grade 1-5': grades1to5,
      },
    };
  }, [allStudents]);

  // Filtered students list (always sorted ascending by Adm No)
  const students = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allStudents.filter((st) => {
      if (gradeFilter === 'Grade 1-5') {
        if (!['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].includes(st.grade)) {
          return false;
        }
      } else if (gradeFilter && gradeFilter !== 'All Classes') {
        if (st.grade !== gradeFilter) return false;
      }

      if (sectionFilter && sectionFilter !== 'All') {
        const stSec = String(st.section || 'A').trim().toUpperCase();
        if (stSec !== String(sectionFilter).trim().toUpperCase()) return false;
      }

      if (feeStatusFilter !== 'all') {
        const paidAmt = Number(st.feeDetails?.amountPaid || 0);
        const totalFeeAmt = Math.max(
          Number(st.feeDetails?.admissionFeeAmount || paidAmt || 500),
          paidAmt
        );
        const balanceAmt = Math.max(
          0,
          Number(st.feeDetails?.balanceDue ?? totalFeeAmt - paidAmt)
        );
        if (feeStatusFilter === 'paid' && !(paidAmt > 0 && balanceAmt === 0)) return false;
        if (feeStatusFilter === 'partial' && !(paidAmt > 0 && balanceAmt > 0)) return false;
        if (feeStatusFilter === 'unpaid' && paidAmt !== 0) return false;
      }

      if (q) {
        const haystack = [
          st.studentName,
          st.admissionNumber,
          st.primaryPhone,
          st.whatsappNumber,
          st.aadhaarNumber,
          st.studentAadhaarNo,
          st.previousStudy?.stsNumber,
          st.father?.name,
          st.fatherName,
          st.mother?.name,
          st.motherName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allStudents, gradeFilter, sectionFilter, feeStatusFilter, searchQuery]);

  // Reset to page 1 whenever filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [gradeFilter, sectionFilter, feeStatusFilter, searchQuery, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(students.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, students.length);

  const paginatedStudents = useMemo(
    () => students.slice(startIdx, endIdx),
    [students, startIdx, endIdx]
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (safePage > 3) pages.push('ellipsis-start');
    const rangeStart = Math.max(2, safePage - 1);
    const rangeEnd = Math.min(totalPages - 1, safePage + 1);
    for (let p = rangeStart; p <= rangeEnd; p += 1) {
      pages.push(p);
    }
    if (safePage < totalPages - 2) pages.push('ellipsis-end');
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  const renderPaginationBar = (wrapperClassName) => (
    <div className={wrapperClassName}>
      {/* Left: Showing X - Y of N students */}
      <div className="text-xs text-slate-600 font-medium whitespace-nowrap">
        Showing{' '}
        <span className="font-semibold text-slate-800">
          {students.length === 0 ? 0 : startIdx + 1} - {endIdx}
        </span>{' '}
        of <span className="font-semibold text-slate-800">{students.length}</span>{' '}
        {students.length === 1 ? 'student' : 'students'}
      </div>

      {/* Center: Previous | 1 2 3 ... | Next */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={safePage <= 1}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
            safePage <= 1
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-700 hover:text-brand-navy hover:bg-slate-100 cursor-pointer'
          }`}
        >
          Previous
        </button>

        {visiblePageNumbers.map((item) =>
          typeof item === 'string' ? (
            <span
              key={item}
              className="px-1.5 py-1 text-xs text-slate-400 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => setCurrentPage(item)}
              aria-current={item === safePage ? 'page' : undefined}
              className={`min-w-[28px] px-2 py-1 rounded-md text-xs transition cursor-pointer ${
                item === safePage
                  ? 'font-bold text-[#1A365D] bg-slate-100 border border-slate-200'
                  : 'font-medium text-slate-500 hover:text-[#1A365D] hover:bg-slate-50'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage >= totalPages}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
            safePage >= totalPages
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-[#1A365D] hover:bg-slate-100 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>

      {/* Right: Rows per page */}
      <label className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
        <span className="text-slate-500">Rows per page:</span>
        <select
          aria-label="Rows per page"
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:border-brand-navy focus:outline-none cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
    </div>
  );

  const handleOpenNewAdmission = () => {
    setEditingStudent(null);
    setOnboardingModalOpen(true);
  };

  const handleOpenEditStudent = (st) => {
    setSelectedProfileStudent(null);
    setEditingStudent(st);
    setOnboardingModalOpen(true);
  };

  const handleEnrollmentComplete = (enrolledStudent) => {
    setFeedback(
      `Student "${enrolledStudent.studentName}" (${enrolledStudent.admissionNumber}) saved to Student Directory.`
    );
    setTimeout(() => setFeedback(''), 5000);
    fetchStudents();
  };

  const handleStatusChange = async (studentId, newStatus) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/v1/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (err) {
      console.error('Failed to update student status:', err);
    }
  };

  const handleWhatsAppClick = (student) => {
    const rawPhone = String(
      student.whatsappNumber ||
        student.primaryPhone ||
        student.father?.mobile ||
        student.parentPhone ||
        student.mobile ||
        ''
    );
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    if (digits.length !== 10) {
      setToastAlert('Parent mobile number not available');
      setTimeout(() => setToastAlert(''), 4000);
      return;
    }

    const clean10DigitPhone = digits;
    const parentName =
      student.father?.name || student.fatherName || student.parentName || 'Parent';
    const studentName = student.studentName || student.fullName || 'Student';
    const admissionNo = student.admissionNumber || student.admissionNo || '—';
    const className = `${student.grade || student.className || ''}${
      isSectionApplicable(student.section) ? ` (${student.section})` : ''
    }`.trim();
    const rollSuffix = student.rollNumber || student.rollNo
      ? ` (Roll No: ${student.rollNumber || student.rollNo})`
      : '';

    const paidAmount = Number(student.feeDetails?.amountPaid || 0);
    const cabOptedIn = Boolean(student.transportDetails?.optedIn);
    const annualCabFee = cabOptedIn ? Number(student.transportDetails?.annualCabFee || 0) : 0;
    const totalFee = Math.max(
      Number(student.feeDetails?.admissionFeeAmount || paidAmount || 500),
      paidAmount,
      annualCabFee
    );
    const balanceDue = Math.max(
      0,
      Number(student.feeDetails?.balanceDue ?? totalFee - paidAmount)
    );

    const portalUrl = 'https://kes-school.vercel.app';
    let message = '';

    if (language === 'kn') {
      if (balanceDue > 0) {
        message = [
          `ನಮಸ್ಕಾರ ${parentName} ಅವರಿಗೆ,`,
          '',
          `*ಶ್ರೀ ಸಿದ್ಧಾರೂಢ ಆಂಗ್ಲ ಮಾಧ್ಯಮ ಶಾಲೆ, ಖಾನಟ್ಟಿ* (KES) ವತಿಯಿಂದ ಶುಭಾಶಯಗಳು.`,
          '',
          `ನಿಮ್ಮ ಮಗುವಿನ ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಶುಲ್ಕದ ವಿವರ:`,
          `• *ವಿದ್ಯಾರ್ಥಿ:* ${studentName}`,
          `• *ದಾಖಲಾತಿ ಸಂಖ್ಯೆ:* ${admissionNo}`,
          `• *ತರಗತಿ:* ${className}${rollSuffix}`,
          `• *ಒಟ್ಟು ಶುಲ್ಕ:* ₹${totalFee.toLocaleString('en-IN')}`,
          `• *ಪಾವತಿಸಿದ ಮೊತ್ತ:* ₹${paidAmount.toLocaleString('en-IN')}`,
          `• *ಬಾಕಿ ಶುಲ್ಕ:* *₹${balanceDue.toLocaleString('en-IN')}*`,
          '',
          `ದಯವಿಟ್ಟು ಬಾಕಿ ಶುಲ್ಕವನ್ನು ಶಾಲಾ ಕಚೇರಿಯಲ್ಲಿ ಪಾವತಿಸಿ. ಡಿಜಿಟಲ್ ರಶೀದಿ, ಹಾಜರಾತಿ ಮತ್ತು ಅಂಕಪಟ್ಟಿಯನ್ನು ಪೋಷಕರ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಡಬಹುದು:`,
          `🔗 ${portalUrl}`,
          `📱 ಲಾಗಿನ್ ಮೊಬೈಲ್: ${clean10DigitPhone}`,
          '',
          `ಕಚೇರಿ ಸಹಾಯವಾಣಿ: +91 77957 70785`,
          `– ಕಚೇರಿ ಆಡಳಿತ ಮಂಡಳಿ, KES ಖಾನಟ್ಟಿ`,
        ].join('\n');
      } else {
        message = [
          `ನಮಸ್ಕಾರ ${parentName} ಅವರಿಗೆ,`,
          '',
          `*ಶ್ರೀ ಸಿದ್ಧಾರೂಢ ಆಂಗ್ಲ ಮಾಧ್ಯಮ ಶಾಲೆ, ಖಾನಟ್ಟಿ* (KES) ಗೆ ಹೃತ್ಪೂರ್ವಕ ಸ್ವಾಗತ!`,
          '',
          `ನಿಮ್ಮ ಮಗುವಿನ ವಿವರ:`,
          `• *ವಿದ್ಯಾರ್ಥಿ:* ${studentName}`,
          `• *ದಾಖಲಾತಿ ಸಂಖ್ಯೆ:* ${admissionNo}`,
          `• *ತರಗತಿ:* ${className}${rollSuffix}`,
          `• *ಶುಲ್ಕದ ಸ್ಥಿತಿ:* *ಎಲ್ಲಾ ಶುಲ್ಕ ಪಾವತಿಯಾಗಿದೆ (₹0 ಬಾಕಿ)* ✅`,
          '',
          `ಡಿಜಿಟಲ್ ರಶೀದಿ, ದಿನನಿತ್ಯದ ಹಾಜರಾತಿ, ಹೋಂವರ್ಕ್ ಮತ್ತು ಅಂಕಪಟ್ಟಿಯನ್ನು ಪೋಷಕರ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ:`,
          `🔗 ${portalUrl}`,
          `📱 ಲಾಗಿನ್ ಮೊಬೈಲ್: ${clean10DigitPhone}`,
          '',
          `ಕಚೇರಿ ಸಹಾಯವಾಣಿ: +91 77957 70785`,
          `– ಕಚೇರಿ ಆಡಳಿತ ಮಂಡಳಿ, KES ಖಾನಟ್ಟಿ`,
        ].join('\n');
      }
    } else if (balanceDue > 0) {
      message = [
        `Namaste ${parentName},`,
        '',
        `Greetings from *Shri Siddharoodha English Medium School, Khanatti* (KES).`,
        '',
        `Here is the academic & fee status for your ward:`,
        `• *Student:* ${studentName}`,
        `• *Admission No:* ${admissionNo}`,
        `• *Class:* ${className}${rollSuffix}`,
        `• *Total Fee:* ₹${totalFee.toLocaleString('en-IN')}`,
        `• *Paid:* ₹${paidAmount.toLocaleString('en-IN')}`,
        `• *Pending Balance Due:* *₹${balanceDue.toLocaleString('en-IN')}*`,
        '',
        `Kindly clear the pending fee at the school office. You can also view digital receipts, attendance & marks card on our Parent Portal:`,
        `🔗 ${portalUrl}`,
        `📱 Login Mobile: ${clean10DigitPhone}`,
        '',
        `Office Helpline: +91 77957 70785`,
        `– Office Administration, KES Khanatti`,
      ].join('\n');
    } else {
      message = [
        `Namaste ${parentName},`,
        '',
        `Warm greetings from *Shri Siddharoodha English Medium School, Khanatti* (KES).`,
        '',
        `Here is the active enrollment & Parent Portal access summary for your ward:`,
        `• *Student:* ${studentName}`,
        `• *Admission No:* ${admissionNo}`,
        `• *Class:* ${className}${rollSuffix}`,
        `• *Fee Status:* *All Fees Cleared (₹0 Due)* ✅`,
        '',
        `You can view digital receipts, daily attendance, homework & marks card anytime on our Parent Portal:`,
        `🔗 ${portalUrl}`,
        `📱 Login Mobile: ${clean10DigitPhone}`,
        '',
        `Office Helpline: +91 77957 70785`,
        `– Office Administration, KES Khanatti`,
      ].join('\n');
    }

    const waUrl = `https://wa.me/91${clean10DigitPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleExportReport = async () => {
    if (!students || students.length === 0 || exportingExcel) return;
    setExportingExcel(true);
    try {
      await exportStudentDirectoryExcel(students, {
        gradeFilter,
        sectionFilter,
      });
    } catch (err) {
      console.error('Failed to export Excel report:', err);
      setFeedback('Unable to generate Excel report. Please try again.');
      setTimeout(() => setFeedback(''), 5000);
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb + Executive Header & Action Bar */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5">
          <Link to="/portal" className="hover:text-[#1A365D] font-medium transition">
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-[#1A365D]">{t('portal.studentDirectory')}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A365D] leading-tight">
                {t('portal.studentDirectory')}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#1A365D]">
                {allStudents.length} {allStudents.length === 1 ? 'Student' : 'Students'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t('portal.sisSubheading')} • View profiles, Aadhaar, STS, and payment records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenNewAdmission}
                className="inline-flex items-center gap-1.5 bg-[#1A365D] hover:bg-brand-navyDark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm border border-[#D97706]/40 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="sm:hidden">Add Student</span>
                <span className="hidden sm:inline">{t('portal.newStudentAdmission')}</span>
              </button>
            )}

            <button
              type="button"
              disabled={students.length === 0}
              onClick={() => {
                const scopeLabel =
                  gradeFilter !== 'All Classes'
                    ? `${gradeFilter}${sectionFilter !== 'All' ? ` (Sec ${sectionFilter})` : ''}`
                    : 'Filtered Students';
                setIdCardModalTitle(`Batch ID Cards — ${scopeLabel} (${students.length})`);
                setIdCardModalStudents(students);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D97706]/50 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-[#92400E] font-bold text-xs shadow-sm transition cursor-pointer"
              title="Preview, Download & Print A4 Sheet of Student ID Cards"
            >
              <CreditCard className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="sm:hidden">Print ID</span>
              <span className="hidden sm:inline">Print Class ID Cards</span>
            </button>

            <button
              type="button"
              disabled={students.length === 0}
              onClick={() => printStudentDirectoryTable(students, gradeFilter, sectionFilter)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-[#1A365D] font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="sm:hidden">Print</span>
              <span className="hidden sm:inline">Print Student Directory</span>
            </button>

            <button
              type="button"
              disabled={students.length === 0 || exportingExcel}
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs shadow-sm transition cursor-pointer"
              title="Download Branded Excel Workbook (.xlsx) with School Header & Fee Totals"
            >
              <Download
                className={`w-3.5 h-3.5 text-emerald-700 ${exportingExcel ? 'animate-bounce' : ''}`}
              />
              <span className="sm:hidden">{exportingExcel ? '...' : 'Export'}</span>
              <span className="hidden sm:inline">
                {exportingExcel ? 'Exporting...' : t('portal.exportExcel')}
              </span>
            </button>

            <button
              type="button"
              onClick={fetchStudents}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-[#1A365D] hover:bg-slate-50 transition cursor-pointer shadow-sm"
              title="Refresh directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card KPI Summary Row (Horizontal scroll on mobile, 4-col grid on desktop) */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setFeeStatusFilter('all')}
          className={`min-w-[148px] sm:min-w-0 flex-shrink-0 sm:flex-shrink text-left bg-white rounded-xl border p-3 sm:p-4 shadow-sm transition flex items-center gap-3 cursor-pointer ${
            feeStatusFilter === 'all'
              ? 'border-[#1A365D]/40 ring-2 ring-[#1A365D]/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-[#1A365D] flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-600 truncate">
              Total Enrolled
            </div>
            <div className="text-lg sm:text-xl font-bold text-[#1A365D] leading-tight">
              {kpiCounts.total}
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">Nursery to Grade 5</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFeeStatusFilter((prev) => (prev === 'paid' ? 'all' : 'paid'))
          }
          className={`min-w-[148px] sm:min-w-0 flex-shrink-0 sm:flex-shrink text-left bg-white rounded-xl border p-3 sm:p-4 shadow-sm transition flex items-center gap-3 cursor-pointer ${
            feeStatusFilter === 'paid'
              ? 'border-emerald-400 ring-2 ring-emerald-500/15 bg-emerald-50/20'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-600 truncate">Fully Paid</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 leading-tight">
              {kpiCounts.paid}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFeeStatusFilter((prev) => (prev === 'partial' ? 'all' : 'partial'))
          }
          className={`min-w-[148px] sm:min-w-0 flex-shrink-0 sm:flex-shrink text-left bg-white rounded-xl border p-3 sm:p-4 shadow-sm transition flex items-center gap-3 cursor-pointer ${
            feeStatusFilter === 'partial'
              ? 'border-[#D97706] ring-2 ring-amber-500/15 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-600 truncate">Partial Fees</div>
            <div className="text-lg sm:text-xl font-bold text-[#D97706] leading-tight">
              {kpiCounts.partial}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setFeeStatusFilter((prev) => (prev === 'unpaid' ? 'all' : 'unpaid'))
          }
          className={`min-w-[148px] sm:min-w-0 flex-shrink-0 sm:flex-shrink text-left bg-white rounded-xl border p-3 sm:p-4 shadow-sm transition flex items-center gap-3 cursor-pointer ${
            feeStatusFilter === 'unpaid'
              ? 'border-red-400 ring-2 ring-red-500/15 bg-red-50/20'
              : 'border-slate-200 hover:border-red-300'
          }`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-600 truncate">
              Unpaid / Overdue
            </div>
            <div className="text-lg sm:text-xl font-bold text-red-600 leading-tight">
              {kpiCounts.unpaid}
            </div>
          </div>
        </button>
      </div>

      {toastAlert && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <span>{toastAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastAlert('')}
            className="p-0.5 text-amber-700 hover:text-amber-900 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Unified Filter Bar (Dropdowns + Quick Class Pills + Search with Clear) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Search Input (Top on mobile, Right on desktop) */}
        <div className="relative w-full lg:w-72 xl:w-80 lg:order-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Adm No, Aadhaar, STS, phone..."
            className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#1A365D] focus:outline-none bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Class & Section Dropdowns + Quick Class Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 lg:pb-0 lg:order-1 lg:flex-wrap">
          <select
            aria-label="Filter by Class"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-[#1A365D] bg-white flex-shrink-0 cursor-pointer"
          >
            {GRADE_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
            <option value="Grade 1-5">Grade 1–5</option>
          </select>

          <select
            aria-label="Filter by Section"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-[#1A365D] bg-white flex-shrink-0 cursor-pointer"
          >
            {SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'All'
                  ? 'All Sections'
                  : sec === 'N/A'
                    ? 'N/A (Not Applicable)'
                    : `Sec ${sec}`}
              </option>
            ))}
          </select>

          <span className="h-5 w-px bg-slate-200 flex-shrink-0" aria-hidden="true" />

          {[
            { value: 'All Classes', label: `All (${classPillCounts.all})` },
            { value: 'Nursery', label: `Nursery (${classPillCounts.Nursery})` },
            { value: 'LKG', label: `LKG (${classPillCounts.LKG})` },
            { value: 'UKG', label: `UKG (${classPillCounts.UKG})` },
            { value: 'Grade 1-5', label: `Grade 1-5 (${classPillCounts['Grade 1-5']})` },
          ].map((pill) => {
            const isActive = gradeFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => setGradeFilter(pill.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#1A365D]/40 hover:text-[#1A365D]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs sm:text-sm text-slate-500">
          Loading student directory...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-2">
          <GraduationCap className="w-7 h-7 text-slate-300 mx-auto" />
          <div className="font-serif font-bold text-brand-navy text-sm">
            No students found
          </div>
          <p className="text-xs text-slate-500">
            {gradeFilter !== 'All Classes' ||
            sectionFilter !== 'All' ||
            feeStatusFilter !== 'all' ||
            searchQuery
              ? 'No students match your active filters.'
              : isAdmin
                ? 'Click "+ New Student Admission" to onboard a student via the 4-step wizard.'
                : 'Try changing the class filter.'}
          </p>
          {(gradeFilter !== 'All Classes' ||
            sectionFilter !== 'All' ||
            feeStatusFilter !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setGradeFilter('All Classes');
                setSectionFilter('All');
                setFeeStatusFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#1A365D] text-white text-xs font-bold hover:bg-brand-navyDark transition cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* MOBILE & SMALL TABLET VIEW: Executive Student Cards with Profile Photo (visible below md) */}
          <div className="space-y-3 md:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedStudents.map((st) => {
                const fatherDisplay = st.father?.name || st.fatherName || '—';
                const feeStatus = st.feeDetails?.paymentStatus || 'Pending';
                const paidAmt = Number(st.feeDetails?.amountPaid || 0);
                const totalFeeAmt = Math.max(
                  Number(st.feeDetails?.admissionFeeAmount || paidAmt || 500),
                  paidAmt
                );
                const balanceAmt = Math.max(
                  0,
                  Number(st.feeDetails?.balanceDue ?? totalFeeAmt - paidAmt)
                );
                const hasPaidAny =
                  paidAmt > 0 || feeStatus === 'Paid' || feeStatus === 'Partial';
                const paymentLogsCount = Array.isArray(st.feeDetails?.paymentLogs)
                  ? st.feeDetails.paymentLogs.length
                  : 0;
                const initials = (st.studentName || 'S')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0].toUpperCase())
                  .join('');

                return (
                  <div
                    key={st._id}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm space-y-3"
                  >
                    {/* Top Row: Adm No + Profile Photo + Student Name + Class Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-[10px] px-2 py-1 rounded-md bg-slate-100 text-[#1A365D] border border-slate-200 flex-shrink-0">
                          {st.admissionNumber}
                        </span>

                        {st.documents?.studentPhotoUrl ? (
                          <img
                            src={st.documents.studentPhotoUrl}
                            alt={st.studentName}
                            className="w-11 h-11 rounded-full object-cover object-top border-2 border-[#D97706] shadow-sm flex-shrink-0 bg-slate-100"
                          />
                        ) : (
                          <span className="w-11 h-11 rounded-full bg-[#1A365D]/10 text-[#1A365D] border-2 border-[#D97706]/60 text-xs font-bold inline-flex items-center justify-center flex-shrink-0">
                            {initials}
                          </span>
                        )}

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileStudent(st)}
                            className="font-bold text-sm text-[#1A365D] hover:text-[#D97706] truncate block text-left cursor-pointer"
                          >
                            {st.studentName}
                          </button>
                          <div className="text-[11px] text-slate-500 truncate">
                            {st.rollNumber ? `Roll: ${st.rollNumber}` : 'Roll: —'}
                            {st.previousStudy?.stsNumber
                              ? ` • STS: ${st.previousStudy.stsNumber}`
                              : ''}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#1A365D] text-white text-[10px] font-bold whitespace-nowrap flex-shrink-0">
                        {st.grade}
                        {isSectionApplicable(st.section) ? ` - ${st.section}` : ''}
                      </span>
                    </div>

                    {/* Middle Info Rows: Parent / Mobile & Fee Status */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="truncate">
                          • Parent: <strong className="text-slate-800">{fatherDisplay}</strong>
                        </span>
                        <a
                          href={`tel:+91${st.primaryPhone}`}
                          className="inline-flex items-center gap-1 font-mono font-semibold text-[#1A365D] text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-[#D97706]" />
                          <span>+91 {st.primaryPhone}</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500">• Fee:</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              hasPaidAny && balanceAmt === 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : hasPaidAny
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {hasPaidAny
                              ? balanceAmt > 0
                                ? `Partial: ₹${paidAmt.toLocaleString('en-IN')} / ₹${totalFeeAmt.toLocaleString('en-IN')}`
                                : `Paid: ₹${(paidAmt || 500).toLocaleString('en-IN')}`
                              : 'Pending'}
                          </span>
                          {balanceAmt > 0 && hasPaidAny && (
                            <span className="text-[10px] font-mono font-bold text-red-600">
                              (Due: ₹{balanceAmt.toLocaleString('en-IN')})
                            </span>
                          )}
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {st.status || 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-slate-100">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setPaymentModalStudent(st)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            balanceAmt > 0 || !hasPaidAny
                              ? 'bg-[#D97706] hover:bg-amber-600 text-white shadow-xs'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                          title={
                            hasPaidAny
                              ? 'Collect Remaining or Edit Fee Amount'
                              : 'Collect Admission Fee'
                          }
                        >
                          <IndianRupee className="w-3 h-3" />
                          <span>
                            {!hasPaidAny
                              ? 'Collect Fee'
                              : balanceAmt > 0
                                ? `Pay (₹${balanceAmt.toLocaleString('en-IN')})`
                                : 'Fee'}
                          </span>
                        </button>
                      )}

                      {hasPaidAny && (
                        <button
                          type="button"
                          onClick={() => setReceiptModalStudent(st)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold cursor-pointer"
                          title="Print Official Fee Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIdCardModalTitle(`Digital ID Card — ${st.studentName}`);
                          setIdCardModalStudents([st]);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[#1A365D] hover:bg-slate-50 text-[11px] font-bold cursor-pointer"
                        title="View / Download / Print Student ID Card"
                      >
                        <CreditCard className="w-3 h-3 text-[#D97706]" />
                        <span>ID Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMarksModalStudent(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-[#1A365D] hover:bg-slate-50 text-[11px] font-bold cursor-pointer"
                        title="Publish / Update Digital Report Card Marks"
                      >
                        <Award className="w-3 h-3 text-[#D97706]" />
                        <span>Marks</span>
                      </button>

                      {isAdmin && (hasPaidAny || paymentLogsCount > 0) && (
                        <button
                          type="button"
                          onClick={() => setAuditLogModalStudent(st)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[#1A365D] hover:bg-slate-100 text-[11px] font-semibold cursor-pointer"
                          title="View Payment & Edit History Log"
                        >
                          <History className="w-3 h-3 text-[#D97706]" />
                          <span>History{paymentLogsCount > 0 ? ` (${paymentLogsCount})` : ''}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedProfileStudent(st)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#1A365D] hover:bg-slate-50 cursor-pointer"
                        title="View Full Student Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(st)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-[#1A365D] hover:bg-slate-50 cursor-pointer"
                          title="Edit Student"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#D97706]" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleWhatsAppClick(st)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center justify-center transition cursor-pointer"
                        title="Send Fee & Parent Portal Summary on WhatsApp"
                        aria-label={`WhatsApp ${st.studentName}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {renderPaginationBar(
              'bg-white rounded-xl border border-slate-200 shadow-sm px-3.5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5'
            )}
          </div>

          {/* DESKTOP & TABLET VIEW: Clean Streamlined Table (visible md and up) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="w-[120px] min-w-[120px] max-w-[120px] py-3 px-4 sticky left-0 bg-slate-50 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.08)]">
                      {t('table.admNo')}
                    </th>
                    <th className="py-3 px-4 sticky left-[120px] bg-slate-50 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.06)]">
                      {t('table.studentName')}
                    </th>
                    <th className="py-3 px-4">{t('table.classCol')}</th>
                    <th className="py-3 px-4">{t('table.feeStatus')}</th>
                    <th className="py-3 px-4">{t('table.actions')}</th>
                    <th className="py-3 px-4">{t('table.parentGuardian')}</th>
                    <th className="py-3 px-4">{t('table.mobile')}</th>
                    <th className="py-3 px-4">{t('table.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {paginatedStudents.map((st) => {
                    const fatherDisplay = st.father?.name || st.fatherName || '—';
                    const rawMother = st.mother?.name || st.motherName || '';
                    const motherDisplay = String(rawMother) !== 'true' ? rawMother : '';
                    const feeStatus = st.feeDetails?.paymentStatus || 'Pending';
                    const paidAmt = Number(st.feeDetails?.amountPaid || 0);
                    const totalFeeAmt = Math.max(
                      Number(st.feeDetails?.admissionFeeAmount || paidAmt || 500),
                      paidAmt
                    );
                    const balanceAmt = Math.max(
                      0,
                      Number(st.feeDetails?.balanceDue ?? totalFeeAmt - paidAmt)
                    );
                    const hasPaidAny =
                      paidAmt > 0 || feeStatus === 'Paid' || feeStatus === 'Partial';
                    const paymentLogsCount = Array.isArray(st.feeDetails?.paymentLogs)
                      ? st.feeDetails.paymentLogs.length
                      : 0;

                    return (
                      <tr key={st._id} className="group hover:bg-slate-50/80 transition">
                        <td className="w-[120px] min-w-[120px] max-w-[120px] py-3 px-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-slate-50 z-20 shadow-[1px_0_3px_rgba(0,0,0,0.08)]">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-brand-navy border border-slate-200">
                            {st.admissionNumber}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap sticky left-[120px] bg-white group-hover:bg-slate-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.06)]">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileStudent(st)}
                            className="inline-flex items-center gap-2 font-bold text-brand-navy hover:text-brand-gold text-xs sm:text-sm text-left transition cursor-pointer"
                          >
                            {st.documents?.studentPhotoUrl ? (
                              <img
                                src={st.documents.studentPhotoUrl}
                                alt={st.studentName}
                                className="w-7 h-7 rounded-full object-cover border border-[#D97706] flex-shrink-0 bg-slate-100"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-[#1A365D]/10 text-[#1A365D] border border-[#1A365D]/20 text-[10px] font-bold inline-flex items-center justify-center flex-shrink-0">
                                {(st.studentName || 'S')
                                  .split(' ')
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((p) => p[0].toUpperCase())
                                  .join('')}
                              </span>
                            )}
                            <span>{st.studentName}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-navy text-white text-[11px] font-bold">
                            {st.grade}
                          </span>
                          {isSectionApplicable(st.section) && (
                            <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-goldSoft text-brand-navyDark border border-brand-gold/40 text-[11px] font-bold">
                              {st.section}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {hasPaidAny ? (
                            <div className="space-y-0.5">
                              {balanceAmt > 0 ? (
                                <>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                                    <span>
                                      Partial: ₹{paidAmt} / ₹{totalFeeAmt}
                                    </span>
                                  </span>
                                  <span className="block text-[10px] font-mono font-bold text-red-600">
                                    Balance Due: ₹{balanceAmt}
                                  </span>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Paid (₹{paidAmt || 500})</span>
                                </span>
                              )}
                              {st.feeDetails?.receiptNumber && (
                                <span className="block text-[10px] font-mono text-slate-500">
                                  {st.feeDetails.receiptNumber}
                                </span>
                              )}
                              {isAdmin && paymentLogsCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAuditLogModalStudent(st)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1A365D] hover:text-[#D97706] underline underline-offset-2 cursor-pointer"
                                  title="View Payment & Edit Audit History"
                                >
                                  <History className="w-2.5 h-2.5" />
                                  <span>History ({paymentLogsCount})</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                                {feeStatus}
                              </span>
                              {isAdmin && paymentLogsCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAuditLogModalStudent(st)}
                                  className="block inline-flex items-center gap-1 text-[10px] font-bold text-[#1A365D] hover:text-[#D97706] underline underline-offset-2 cursor-pointer"
                                  title="View Payment & Edit Audit History"
                                >
                                  <History className="w-2.5 h-2.5" />
                                  <span>History ({paymentLogsCount})</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center justify-start gap-1.5">
                            {hasPaidAny && (
                              <button
                                type="button"
                                onClick={() => setReceiptModalStudent(st)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition cursor-pointer"
                                title="Print Official Fee Receipt"
                              >
                                <Printer className="w-3 h-3 text-emerald-700" />
                                <span>Print Receipt</span>
                              </button>
                            )}

                            {isAdmin &&
                              (!hasPaidAny ? (
                                <button
                                  type="button"
                                  onClick={() => setPaymentModalStudent(st)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition cursor-pointer"
                                  title="Collect Admission Fee & Generate Receipt"
                                >
                                  <IndianRupee className="w-3 h-3 text-brand-gold" />
                                  <span>Collect Fee</span>
                                </button>
                              ) : balanceAmt > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setPaymentModalStudent(st)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition cursor-pointer"
                                  title="Collect Remaining Fee Amount & Generate Receipt"
                                >
                                  <IndianRupee className="w-3 h-3 text-brand-gold" />
                                  <span>Pay Remaining (₹{balanceAmt})</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setPaymentModalStudent(st)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
                                  title="Update or Correct Fee Record"
                                >
                                  <IndianRupee className="w-3 h-3 text-brand-gold" />
                                  <span>Fee</span>
                                </button>
                              ))}

                            {isAdmin && (hasPaidAny || paymentLogsCount > 0) && (
                              <button
                                type="button"
                                onClick={() => setAuditLogModalStudent(st)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[#1A365D] text-xs font-semibold transition cursor-pointer"
                                title="View Payment & Edit History Log"
                              >
                                <History className="w-3 h-3 text-[#D97706]" />
                                <span>History</span>
                                {paymentLogsCount > 0 && (
                                  <span className="px-1 py-0.2 rounded-full bg-[#1A365D] text-white text-[9px] font-mono font-bold">
                                    {paymentLogsCount}
                                  </span>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setIdCardModalTitle(`Digital ID Card — ${st.studentName}`);
                                setIdCardModalStudents([st]);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D97706]/50 bg-amber-50 hover:bg-amber-100 text-[#1A365D] text-xs font-bold transition cursor-pointer"
                              title="Preview, Download PNG, or Print Student ID Card"
                            >
                              <CreditCard className="w-3 h-3 text-[#D97706]" />
                              <span>🪪 ID Card</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setMarksModalStudent(st)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-brand-navy text-xs font-semibold transition cursor-pointer"
                              title="Publish / Update Digital Report Card Marks"
                            >
                              <Award className="w-3 h-3 text-brand-gold" />
                              <span>Marks</span>
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudent(st)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-brand-navy text-xs font-semibold transition cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3 text-brand-gold" />
                                  <span>Edit</span>
                                </button>

                                <select
                                  aria-label={`Change status for ${st.studentName}`}
                                  value={st.status || 'Active'}
                                  onChange={(e) => handleStatusChange(st._id, e.target.value)}
                                  className="px-2 py-1 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Enrolled">Enrolled</option>
                                  <option value="Transferred">Transferred</option>
                                  <option value="Alumni">Alumni</option>
                                </select>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleWhatsAppClick(st)}
                              className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs inline-flex items-center justify-center transition cursor-pointer"
                              title="Send Fee & Parent Portal Summary on WhatsApp"
                              aria-label={`WhatsApp ${st.studentName}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{fatherDisplay}</div>
                          {motherDisplay && (
                            <div className="text-[11px] text-slate-400">{motherDisplay}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                          {st.primaryPhone}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            {st.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPaginationBar(
              'border-t border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3'
            )}
          </div>
        </>
      )}

      {/* Pathway 2 Multi-Step Direct Walk-In Student Admission & Onboarding Wizard */}
      {onboardingModalOpen && isAdmin && (
        <DirectAdmissionOnboardingModal
          isOpen={onboardingModalOpen}
          isModal={true}
          initialStudent={editingStudent}
          onEnrollmentComplete={handleEnrollmentComplete}
          onClose={() => {
            setOnboardingModalOpen(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Full Student Profile Side Drawer / Modal */}
      {selectedProfileStudent && (
        <StudentProfileDrawer
          studentId={selectedProfileStudent._id}
          initialStudent={selectedProfileStudent}
          onClose={() => setSelectedProfileStudent(null)}
          onEdit={(st) => handleOpenEditStudent(st)}
        />
      )}

      {/* Admission Fee Collection & Correction Modal */}
      {paymentModalStudent && isAdmin && (
        <AdmissionPaymentModal
          isOpen={Boolean(paymentModalStudent)}
          student={paymentModalStudent}
          onClose={() => setPaymentModalStudent(null)}
          onPaymentRecorded={(updatedStudent, meta = {}) => {
            // Immediately reflect updated/corrected fee amounts in the Student Directory row
            if (updatedStudent?._id) {
              setAllStudents((prev) =>
                prev.map((row) =>
                  String(row._id) === String(updatedStudent._id) ? updatedStudent : row
                )
              );
              setAuditLogModalStudent((prev) =>
                prev && String(prev._id) === String(updatedStudent._id)
                  ? updatedStudent
                  : prev
              );
            }
            setFeedback(
              meta.isCorrection
                ? `Fee amount corrected to ₹${Number(updatedStudent.feeDetails?.amountPaid || 0).toLocaleString('en-IN')} for ${updatedStudent.studentName} and logged in audit trail.`
                : `Official Fee Receipt (${updatedStudent.feeDetails?.receiptNumber || 'Paid'}) generated for ${updatedStudent.studentName}.`
            );
            setTimeout(() => setFeedback(''), 5000);
            fetchStudents();
          }}
        />
      )}

      {/* Payment & Edit History Audit Log Drawer/Modal */}
      {auditLogModalStudent &&
        isAdmin &&
        (() => {
          const logPaid = Number(auditLogModalStudent.feeDetails?.amountPaid || 0);
          const logTotal = Math.max(
            Number(auditLogModalStudent.feeDetails?.admissionFeeAmount || logPaid || 0),
            logPaid
          );
          const logBalance = Math.max(
            0,
            Number(auditLogModalStudent.feeDetails?.balanceDue ?? logTotal - logPaid)
          );
          const auditModal = (
            <div
              className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
              role="dialog"
              aria-modal="true"
              aria-label="Payment and Edit History Log"
            >
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
                <div className="bg-[#1A365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#D97706]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706] flex items-center justify-center text-[#D97706]">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                        Fee Accountability &amp; Audit Trail
                      </span>
                      <h3 className="text-base font-serif font-bold">
                        {auditLogModalStudent.studentName} ({auditLogModalStudent.admissionNumber})
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuditLogModalStudent(null)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    aria-label="Close payment history"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Current Financial Snapshot */}
                <div className="bg-[#F8FAFC] px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3 font-mono">
                    <span>
                      Total Fee:{' '}
                      <strong className="text-[#1A365D]">
                        ₹{logTotal.toLocaleString('en-IN')}
                      </strong>
                    </span>
                    <span>
                      Paid:{' '}
                      <strong className="text-emerald-700">
                        ₹{logPaid.toLocaleString('en-IN')}
                      </strong>
                    </span>
                    <span>
                      Balance Due:{' '}
                      <strong className={logBalance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                        ₹{logBalance.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const target = auditLogModalStudent;
                      setAuditLogModalStudent(null);
                      setPaymentModalStudent(target);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A365D] hover:bg-brand-navyDark text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    <IndianRupee className="w-3 h-3 text-[#D97706]" />
                    <span>Collect / Edit Fee</span>
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                  <PaymentAuditLogTimeline
                    logs={auditLogModalStudent.feeDetails?.paymentLogs || []}
                  />
                </div>
              </div>
            </div>
          );
          return typeof document !== 'undefined'
            ? createPortal(auditModal, document.body)
            : auditModal;
        })()}

      {/* Official Dual-Counterfoil Printable Fee Receipt Modal */}
      {receiptModalStudent && (
        <PrintableFeeReceipt
          student={receiptModalStudent}
          onClose={() => setReceiptModalStudent(null)}
        />
      )}

      {/* Term Exam Marks & Digital Report Card Publisher Modal */}
      {marksModalStudent && (
        <StudentExamMarksModal
          isOpen={Boolean(marksModalStudent)}
          student={marksModalStudent}
          onClose={() => setMarksModalStudent(null)}
          onMarksSaved={(updatedStudent) => {
            setFeedback(
              `Digital Report Card marks saved for ${updatedStudent.studentName}.`
            );
            setTimeout(() => setFeedback(''), 5000);
            fetchStudents();
          }}
        />
      )}

      {/* Digital Student ID Card Studio & A4 Batch Print Modal */}
      {idCardModalStudents && idCardModalStudents.length > 0 && (
        <StudentIdCardModal
          isOpen={Boolean(idCardModalStudents)}
          students={idCardModalStudents}
          title={idCardModalTitle || 'Digital Student ID Card Studio'}
          onClose={() => setIdCardModalStudents(null)}
        />
      )}
    </div>
  );
}
