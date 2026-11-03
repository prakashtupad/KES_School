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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDirectStudentChatUrl } from '../../utils/whatsappFormatter';
import DirectAdmissionOnboardingModal from './DirectAdmissionOnboardingModal';
import StudentProfileDrawer from './StudentProfileDrawer';

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

const SECTIONS = ['All', 'A', 'B', 'C'];

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
      'Student Name (As per Aadhaar)',
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
                {sec === 'All' ? 'All Sections' : `Sec ${sec}`}
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
                          {st.grade} ({st.section || 'A'})
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Adm No</th>
                    <th className="py-3 px-4">Student (Click for Full Profile)</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Mobile &amp; WhatsApp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {students.map((st) => {
                    const waUrl = getDirectStudentChatUrl(
                      st.whatsappNumber || st.primaryPhone,
                      st.studentName,
                      st.grade
                    );
                    const fatherDisplay = st.father?.name || st.fatherName || '—';
                    const motherDisplay = st.mother?.name || st.motherName || '';

                    return (
                      <tr key={st._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-brand-navy border border-slate-200">
                            {st.admissionNumber}
                          </span>
                          {st.previousStudy?.stsNumber && (
                            <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                              STS: {st.previousStudy.stsNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedProfileStudent(st)}
                            className="font-bold text-brand-navy hover:text-brand-gold text-xs sm:text-sm text-left underline decoration-brand-gold/50 underline-offset-2 transition"
                          >
                            {st.studentName}
                          </button>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{st.gender}</span>
                            {st.bloodGroup && st.bloodGroup !== 'Unknown' && (
                              <span>• {st.bloodGroup}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-navy text-white text-[11px] font-bold">
                            {st.grade}
                          </span>
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-goldSoft text-brand-navyDark border border-brand-gold/40 text-[11px] font-bold">
                            {st.section || 'A'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{fatherDisplay}</div>
                          {motherDisplay && (
                            <div className="text-[11px] text-slate-400">{motherDisplay}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:+91${st.primaryPhone}`}
                              className="inline-flex items-center gap-1 font-mono font-bold text-brand-navy hover:underline"
                            >
                              <Phone className="w-3 h-3 text-brand-gold" />
                              <span>{st.primaryPhone}</span>
                            </a>

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Chat</span>
                            </a>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                            {st.status || 'Active'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProfileStudent(st)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                              title="View Full Profile"
                            >
                              <Eye className="w-3 h-3 text-brand-navy" />
                              <span>Profile</span>
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudent(st)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-brand-navy text-xs font-semibold transition"
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
    </div>
  );
}
