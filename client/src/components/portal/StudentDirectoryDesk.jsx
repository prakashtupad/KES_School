import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Users,
  Phone,
  MessageCircle,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Pencil,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDirectStudentChatUrl } from '../../utils/whatsappFormatter';

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

const ENROLLMENT_GRADES = [
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

  // Admission / Edit Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form Fields
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState('Male');
  const [grade, setGrade] = useState('Grade 1');
  const [section, setSection] = useState('A');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [status, setStatus] = useState('Active');

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

  const resetForm = () => {
    setEditingStudentId(null);
    setAdmissionNumber('');
    setRollNumber('');
    setStudentName('');
    setGender('Male');
    setGrade('Grade 1');
    setSection('A');
    setFatherName('');
    setMotherName('');
    setPrimaryPhone('');
    setStatus('Active');
    setFormError('');
  };

  const handleOpenEditModal = (st) => {
    setEditingStudentId(st._id);
    setAdmissionNumber(st.admissionNumber || '');
    setRollNumber(st.rollNumber || '');
    setStudentName(st.studentName || '');
    setGender(st.gender || 'Male');
    setGrade(ENROLLMENT_GRADES.includes(st.grade) ? st.grade : 'Grade 1');
    setSection(st.section || 'A');
    setFatherName(st.fatherName || '');
    setMotherName(st.motherName || '');
    setPrimaryPhone(st.primaryPhone || '');
    setStatus(st.status || 'Active');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanPhone = primaryPhone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (starting with 6-9).');
      return;
    }

    if (!admissionNumber.trim() || !studentName.trim() || !fatherName.trim()) {
      setFormError('Please complete all required fields (*).');
      return;
    }

    setSubmitting(true);
    try {
      const isEditing = Boolean(editingStudentId);
      const url = isEditing ? `/api/v1/students/${editingStudentId}` : '/api/v1/students';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          admissionNumber: admissionNumber.trim().toUpperCase(),
          rollNumber: rollNumber.trim(),
          studentName: studentName.trim(),
          gender,
          grade,
          section,
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          primaryPhone: cleanPhone,
          whatsappNumber: cleanPhone,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save student record.');
      }

      setFeedback(
        isEditing
          ? `Updated "${studentName.trim()}" (${admissionNumber.trim().toUpperCase()}).`
          : `Enrolled "${studentName.trim()}" (${admissionNumber.trim().toUpperCase()})!`
      );
      setTimeout(() => setFeedback(''), 4000);
      resetForm();
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
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
      'Class / Grade',
      'Section',
      'Academic Year',
      'Father / Guardian Name',
      'Mother Name',
      'Parent Mobile / WhatsApp',
      'Status',
      'Enrolled Date',
    ];

    const rows = students.map((st) => [
      escapeCsv(st.admissionNumber || ''),
      escapeCsv(st.rollNumber || ''),
      escapeCsv(st.studentName || ''),
      escapeCsv(st.gender || ''),
      escapeCsv(st.grade || ''),
      escapeCsv(st.section || 'A'),
      escapeCsv(st.academicYear || '2026-2027'),
      escapeCsv(st.fatherName || ''),
      escapeCsv(st.motherName || ''),
      escapeCsv(st.primaryPhone || st.whatsappNumber || ''),
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
            Student Information System
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy">
            Student Directory ({students.length})
          </h2>
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
              onClick={() => {
                resetForm();
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-brand-navy hover:bg-brand-navyDark text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm border border-brand-gold/40 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-brand-gold" />
              <span>+ Add Student</span>
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
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, ID, phone..."
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
            {isAdmin ? 'Click "+ Add Student" to enroll a student.' : 'Try changing the class filter.'}
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
                      <h3 className="font-bold text-sm text-brand-navy mt-1 truncate">
                        {st.studentName}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        Parent: <strong className="text-slate-700">{st.fatherName}</strong>
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(st)}
                        className="p-1.5 rounded-lg border border-slate-200 text-brand-navy hover:bg-slate-50 flex-shrink-0"
                        title="Edit Student"
                      >
                        <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                      </button>
                    )}
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
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Parent / Guardian</th>
                    <th className="py-3 px-4">Mobile &amp; WhatsApp</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {students.map((st) => {
                    const waUrl = getDirectStudentChatUrl(
                      st.whatsappNumber || st.primaryPhone,
                      st.studentName,
                      st.grade
                    );
                    return (
                      <tr key={st._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-brand-navy border border-slate-200">
                            {st.admissionNumber}
                          </span>
                          {st.rollNumber && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Roll: {st.rollNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-brand-navy text-xs sm:text-sm">
                            {st.studentName}
                          </div>
                          <span className="text-[11px] text-slate-500">{st.gender}</span>
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
                          <div className="font-semibold text-slate-800">{st.fatherName}</div>
                          {st.motherName && (
                            <div className="text-[11px] text-slate-400">{st.motherName}</div>
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

                        {isAdmin && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(st)}
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
                                <option value="Transferred">Transferred</option>
                                <option value="Alumni">Alumni</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Student Admission Modal Dialog */}
      {modalOpen && isAdmin && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admissionModalTitle"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-4">
            <div className="bg-brand-navy text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-gold/40">
              <h3 id="admissionModalTitle" className="text-base font-serif font-bold">
                {editingStudentId ? 'Edit Student Details' : 'New Student Admission'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-4 sm:p-5 space-y-3.5">
              {formError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Admission No *
                  </label>
                  <input
                    type="text"
                    required
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="KES-2026-003"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm uppercase font-mono focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Roll No
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="03"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Student full name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:border-brand-navy"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Class / Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:border-brand-navy"
                  >
                    {ENROLLMENT_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Section *
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:border-brand-navy"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Father / Guardian *
                  </label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Parent name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Mother Name
                  </label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="9845012345"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:border-brand-navy"
                  >
                    <option value="Active">Active</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white text-xs font-bold shadow transition"
                >
                  {submitting ? 'Saving...' : editingStudentId ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
