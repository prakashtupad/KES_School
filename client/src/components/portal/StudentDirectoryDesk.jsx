import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  GraduationCap,
  Pencil,
  Download,
  Eye,
  Printer,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDirectStudentChatUrl } from '../../utils/whatsappFormatter';
import {
  printStudentAdmissionSummary,
  printStudentDirectoryTable,
} from '../../utils/printStudentSummary';
import DirectAdmissionOnboardingModal from './DirectAdmissionOnboardingModal';
import StudentProfileDrawer from './StudentProfileDrawer';
import AdmissionPaymentModal from './AdmissionPaymentModal';
import PrintableFeeReceipt from './PrintableFeeReceipt';

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

export default function StudentDirectoryDesk() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter Bar States
  const [gradeFilter, setGradeFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-Step Onboarding Wizard & Full Profile Drawer States
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);
  const [paymentModalStudent, setPaymentModalStudent] = useState(null);
  const [receiptModalStudent, setReceiptModalStudent] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchStudents = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (gradeFilter && gradeFilter !== 'All Classes') {
        params.set('grade', gradeFilter);
      }
      if (sectionFilter && sectionFilter !== 'All') {
        params.set('section', sectionFilter);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/v1/students?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStudents(data.students || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }, [token, gradeFilter, sectionFilter, searchQuery]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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

  const handleExportReport = () => {
    if (!students || students.length === 0) return;

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const headers = [
      'Admission No',
      'Roll No',
      'Student Name',
      'Gender',
      'Date of Birth',
      'Class / Grade',
      'Section',
      'Academic Year',
      'Student Aadhaar No',
      'Blood Group',
      'Category',
      'Father Name',
      'Mother Name',
      'Parent Mobile / WhatsApp',
      'Karnataka STS / SATS No',
      'National PEN No',
      'APAAR ID',
      'Fee Status',
      'Receipt Number',
      'Amount Paid (INR)',
      'Status',
      'Enrolled Date',
    ];

    const rows = students.map((st) => [
      escapeCsv(st.admissionNumber || ''),
      escapeCsv(st.rollNumber || ''),
      escapeCsv(st.studentName || ''),
      escapeCsv(st.gender || ''),
      escapeCsv(
        st.dateOfBirth ? new Date(st.dateOfBirth).toLocaleDateString('en-IN') : ''
      ),
      escapeCsv(st.grade || ''),
      escapeCsv(st.section || 'A'),
      escapeCsv(st.academicYear || '2026-2027'),
      escapeCsv(st.aadhaarNumber || st.studentAadhaarNo || ''),
      escapeCsv(st.bloodGroup || ''),
      escapeCsv(st.category || ''),
      escapeCsv(st.father?.name || st.fatherName || ''),
      escapeCsv(st.mother?.name || st.motherName || ''),
      escapeCsv(st.primaryPhone || st.whatsappNumber || ''),
      escapeCsv(st.previousStudy?.stsNumber || ''),
      escapeCsv(st.previousStudy?.penNumber || ''),
      escapeCsv(st.previousStudy?.apaarId || ''),
      escapeCsv(st.feeDetails?.paymentStatus || 'Pending'),
      escapeCsv(st.feeDetails?.receiptNumber || ''),
      escapeCsv(st.feeDetails?.amountPaid ?? 0),
      escapeCsv(st.status || 'Active'),
      escapeCsv(st.createdAt ? new Date(st.createdAt).toLocaleDateString('en-IN') : ''),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KES_Student_Directory_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
            Student Information System &amp; Pathway 2 Onboarding
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
            Student Directory ({students.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any student&apos;s name to view their full profile, Aadhaar, and Karnataka STS / PEN / APAAR IDs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchStudents}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-navy hover:bg-slate-50 transition"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            disabled={students.length === 0}
            onClick={() => printStudentDirectoryTable(students, gradeFilter, sectionFilter)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-brand-navy font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-brand-gold" />
            <span>Print Directory</span>
          </button>

          <button
            type="button"
            disabled={students.length === 0}
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-brand-navy font-bold text-xs shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-brand-gold" />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenNewAdmission}
              className="inline-flex items-center gap-1.5 bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm border border-brand-gold/40 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-brand-gold" />
              <span>+ New Student Admission</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Compact Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <select
            aria-label="Filter by Class"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-brand-navy bg-white"
          >
            {GRADE_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Section"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-brand-navy bg-white"
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
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, Admission No, STS, phone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-brand-navy bg-white"
          />
        </div>
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs sm:text-sm text-slate-500">
          Loading student directory...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-1.5">
          <GraduationCap className="w-7 h-7 text-slate-300 mx-auto" />
          <div className="font-serif font-bold text-brand-navy text-sm">
            No students found
          </div>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Click "+ New Student Admission" to onboard a student via the 4-step wizard.'
              : 'Try changing the class filter.'}
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE & SMALL TABLET VIEW: Clean Compact Cards (visible below md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
            {students.map((st) => {
              const waUrl = getDirectStudentChatUrl(
                st.whatsappNumber || st.primaryPhone,
                st.studentName,
                st.grade
              );
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

              return (
                <div
                  key={st._id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-brand-navy border border-slate-200">
                          {st.admissionNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-brand-navy text-white text-[10px] font-bold">
                          {st.grade}
                          {isSectionApplicable(st.section) ? ` (${st.section})` : ''}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            hasPaidAny && balanceAmt === 0
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {hasPaidAny
                            ? balanceAmt > 0
                              ? `Partial: ₹${paidAmt} (Due: ₹${balanceAmt})`
                              : `Paid: ₹${paidAmt || 500}`
                            : 'Fee: Pending'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProfileStudent(st)}
                        className="font-bold text-sm text-brand-navy hover:text-brand-gold mt-1 truncate block text-left underline decoration-brand-gold/50 underline-offset-2"
                      >
                        {st.studentName}
                      </button>
                      <p className="text-[11px] text-slate-500 truncate">
                        Parent: <strong className="text-slate-700">{fatherDisplay}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {hasPaidAny && (
                        <button
                          type="button"
                          onClick={() => setReceiptModalStudent(st)}
                          className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          title="Print Official Fee Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setPaymentModalStudent(st)}
                          className="p-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          title={
                            hasPaidAny
                              ? 'Collect Remaining Fee Amount'
                              : 'Collect Admission Fee'
                          }
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedProfileStudent(st)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="View Full Student Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-navy" />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(st)}
                          className="p-1.5 rounded-lg border border-slate-200 text-brand-navy hover:bg-slate-50"
                          title="Edit Student"
                        >
                          <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:+91${st.primaryPhone}`}
                      className="inline-flex items-center gap-1 font-mono font-bold text-brand-navy text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{st.primaryPhone}</span>
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP & TABLET VIEW: Clean Streamlined Table (visible md and up) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="w-[120px] min-w-[120px] max-w-[120px] py-3 px-4 sticky left-0 bg-slate-50 z-30 shadow-[1px_0_3px_rgba(0,0,0,0.08)]">
                      Adm No
                    </th>
                    <th className="py-3 px-4 sticky left-[120px] bg-slate-50 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.06)]">
                      Student Name
                    </th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Fee Status</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {students.map((st) => {
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
                            className="font-bold text-brand-navy hover:text-brand-gold text-xs sm:text-sm text-left transition cursor-pointer"
                          >
                            {st.studentName}
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

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{fatherDisplay}</div>
                          {motherDisplay && (
                            <div className="text-[11px] text-slate-400">{motherDisplay}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                          {st.primaryPhone}
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
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                              {feeStatus}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            {st.status || 'Active'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
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

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => setPaymentModalStudent(st)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition cursor-pointer"
                                title={
                                  hasPaidAny
                                    ? 'Collect Remaining Fee Amount & Generate Receipt'
                                    : 'Collect Admission Fee & Generate Receipt'
                                }
                              >
                                <IndianRupee className="w-3 h-3 text-brand-gold" />
                                <span>
                                  {hasPaidAny
                                    ? balanceAmt > 0
                                      ? `Pay Remaining (₹${balanceAmt})`
                                      : '+ Remaining Fee'
                                    : 'Collect Fee'}
                                </span>
                              </button>
                            )}

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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

      {/* Admission Fee Collection Modal */}
      {paymentModalStudent && isAdmin && (
        <AdmissionPaymentModal
          isOpen={Boolean(paymentModalStudent)}
          student={paymentModalStudent}
          onClose={() => setPaymentModalStudent(null)}
          onPaymentRecorded={(updatedStudent) => {
            setFeedback(
              `Official Fee Receipt (${updatedStudent.feeDetails?.receiptNumber || 'Paid'}) generated for ${updatedStudent.studentName}.`
            );
            setTimeout(() => setFeedback(''), 5000);
            fetchStudents();
          }}
        />
      )}

      {/* Official Dual-Counterfoil Printable Fee Receipt Modal */}
      {receiptModalStudent && (
        <PrintableFeeReceipt
          student={receiptModalStudent}
          onClose={() => setReceiptModalStudent(null)}
        />
      )}
    </div>
  );
}
