import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, PlusCircle, Trash2, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

export default function TeacherClassDesk() {
  const { user, token } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState('All Classes');
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            Instructional Desk
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy mt-0.5">
            My Classroom &amp; Daily Homework Publisher
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Publish daily homework, classwork summaries, and reading exercises for your assigned
            classes.
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
            <div>
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
              {homeworkList.map((item) => (
                <article
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-brand-gold/50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded bg-brand-navy text-white text-xs font-bold">
                          {item.grade}
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

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Posted by:{' '}
                      <strong className="text-slate-600">
                        {item.teacher?.fullName || item.teacherName || user?.fullName}
                      </strong>
                    </span>
                    <span>
                      Assigned:{' '}
                      {new Date(item.assignedDate || item.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
