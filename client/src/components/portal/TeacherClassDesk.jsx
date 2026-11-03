import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Calendar,
  GraduationCap,
  MessageCircle,
  Users,
  X,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getWhatsAppGroupBroadcastUrl,
  getDirectParentWhatsAppUrl,
} from '../../utils/whatsappFormatter';

const CLASS_GRADE_OPTIONS = [
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

const SECTION_OPTIONS = ['A', 'B', 'C'];

export default function TeacherClassDesk() {
  const { user, token } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState('All Classes');
  const [selectedSection, setSelectedSection] = useState('A');
  const [filterGrade, setFilterGrade] = useState('All Classes');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // WhatsApp Parent Broadcast Modal State
  const [broadcastHomework, setBroadcastHomework] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterGrade && filterGrade !== 'All Classes') {
        params.set('grade', filterGrade);
      }
      const res = await fetch(`/api/v1/teacher/homework?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHomeworkList(data.data || []);
      }
    } catch (err) {
      console.error('Error loading homework:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterGrade]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const handlePublishHomework = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedGrade || !subject.trim() || !title.trim() || !description.trim()) {
      setError('Please fill out Class/Grade, Subject, Title, and Homework Description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/teacher/homework', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade: selectedGrade,
          section: selectedSection || 'A',
          subject: subject.trim(),
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish homework.');
      }

      setSuccessMsg(data.message || 'Homework assignment published successfully!');
      setSubject('');
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchHomework();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHomework = async (id) => {
    try {
      const res = await fetch(`/api/v1/teacher/homework/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setHomeworkList((prev) => prev.filter((item) => String(item._id) !== String(id)));
      }
    } catch (err) {
      console.error('Failed to delete homework:', err);
    }
  };

  const handleOpenParentModal = async (hw) => {
    setBroadcastHomework(hw);
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams();
      if (hw.grade && hw.grade !== 'All Classes') {
        params.set('grade', hw.grade);
      }
      if (hw.section && hw.grade !== 'All Classes') {
        params.set('section', hw.section);
      }

      const res = await fetch(`/api/v1/students?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClassStudents(data.students || data.data || []);
      } else {
        setClassStudents([]);
      }
    } catch (err) {
      console.error('Error loading class students for WhatsApp:', err);
      setClassStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            Instructional Desk &amp; Free WhatsApp Broadcast
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy mt-0.5">
            My Classroom &amp; Daily Homework Publisher
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish daily homework and instantly broadcast formatted updates to Class WhatsApp
            Groups or individual parents in 1 click.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-brand-goldSoft border border-brand-gold/40 text-brand-navyDark text-xs font-bold">
          <GraduationCap className="w-4 h-4 text-brand-gold" />
          <span>Nursery to Grade 5</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Publish Homework Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h3 className="font-serif font-bold text-base text-brand-navy border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-brand-gold" />
            <span>Publish New Homework</span>
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handlePublishHomework} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="hwGrade"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Select Class / Grade *
                </label>
                <select
                  id="hwGrade"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                >
                  {CLASS_GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hwSection"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                >
                  Section
                </label>
                <select
                  id="hwSection"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                >
                  {SECTION_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Sec {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="hwSubject"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Subject *
              </label>
              <input
                id="hwSubject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. English Phonics / Mathematics / Kannada"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="hwTitle"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Assignment Title *
              </label>
              <input
                id="hwTitle"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Capital Letters Tracing & Oral Recitation"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="hwDesc"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Homework Instructions &amp; Details *
              </label>
              <textarea
                id="hwDesc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify textbook page numbers, notebook instructions, or activity notes for parents..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="hwDueDate"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                Submission / Due Date (Optional)
              </label>
              <input
                id="hwDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-lg shadow transition text-sm"
            >
              {submitting ? 'Publishing...' : 'Publish Homework Assignment'}
            </button>
          </form>
        </div>

        {/* Right: Published Homework Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-gold" />
              <h3 className="font-serif font-bold text-base text-brand-navy">
                Published Classroom Assignments
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Class:</span>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-brand-navy bg-white"
              >
                {CLASS_GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Loading classroom assignments...
            </div>
          ) : homeworkList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-1">
              <p className="font-serif font-bold text-brand-navy">
                No homework assignments published yet
              </p>
              <p className="text-xs text-slate-500">
                Use the form on the left to post daily homework for your class.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {homeworkList.map((item) => {
                const groupWaUrl = getWhatsAppGroupBroadcastUrl(item);

                return (
                  <article
                    key={item._id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-brand-gold/50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded bg-brand-navy text-white text-xs font-bold">
                            {item.grade} {item.section ? `• Sec ${item.section}` : ''}
                          </span>
                          <span className="px-2.5 py-0.5 rounded bg-brand-goldSoft text-brand-navyDark border border-brand-gold/40 text-xs font-semibold">
                            {item.subject}
                          </span>
                          {item.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(item.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-base text-brand-navy">
                          {item.title}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteHomework(item._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                      {item.description}
                    </p>

                    {/* 1-Click Free WhatsApp Broadcast Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={groupWaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Share to Class WhatsApp Group</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenParentModal(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-bold shadow-sm transition"
                        >
                          <Users className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Send to Student Parents</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Posted by{' '}
                        <strong className="text-slate-600">
                          {item.teacher?.fullName || item.teacherName || user?.fullName}
                        </strong>{' '}
                        •{' '}
                        {new Date(item.assignedDate || item.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'short',
                          }
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send to Student Parents WhatsApp Modal */}
      {broadcastHomework && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waBroadcastModalTitle"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
            <div className="bg-brand-navy text-white px-6 py-4 flex items-center justify-between border-b border-brand-gold/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">
                  1-Click Personalized Parent WhatsApp Dispatch
                </span>
                <h3 id="waBroadcastModalTitle" className="text-base sm:text-lg font-serif font-bold">
                  {broadcastHomework.grade} • {broadcastHomework.subject}: {broadcastHomework.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastHomework(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                <div>
                  <strong>Tip:</strong> You can share to the entire class WhatsApp group in 1 click,
                  or message individual parents below with their child&apos;s name automatically
                  prepended.
                </div>
                <a
                  href={getWhatsAppGroupBroadcastUrl(broadcastHomework)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold whitespace-nowrap shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Share to Class Group</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {loadingStudents ? (
                <div className="py-10 text-center text-xs sm:text-sm text-slate-500">
                  Loading enrolled students for {broadcastHomework.grade}...
                </div>
              ) : classStudents.length === 0 ? (
                <div className="py-8 text-center space-y-1 bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="font-serif font-bold text-brand-navy text-sm">
                    No enrolled students found for {broadcastHomework.grade}
                  </div>
                  <p className="text-xs text-slate-500">
                    Enroll students in the &ldquo;Student Directory&rdquo; tab to send personalized
                    1-to-1 parent messages.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl">
                  {classStudents.map((st) => {
                    const directUrl = getDirectParentWhatsAppUrl(
                      st.whatsappNumber || st.primaryPhone,
                      broadcastHomework,
                      st.studentName
                    );

                    return (
                      <div
                        key={st._id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                      >
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-brand-navy">
                            {st.studentName}{' '}
                            <span className="text-[11px] font-mono text-slate-500">
                              ({st.admissionNumber})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                            <span>Parent: {st.fatherName}</span>
                            <span>•</span>
                            <span className="font-mono inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-brand-gold" />
                              +91 {st.primaryPhone}
                            </span>
                          </div>
                        </div>

                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm whitespace-nowrap transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Send WhatsApp</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setBroadcastHomework(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
