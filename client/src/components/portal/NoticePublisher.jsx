import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NoticePublisher() {
  const { user, token } = useAuth();
  const canPublish = user?.role === 'admin' || user?.role === 'super_admin';

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Notice');
  const [targetAudience, setTargetAudience] = useState('All Parents');
  const [issuedBy, setIssuedBy] = useState('Office Desk');
  const [content, setContent] = useState('');
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const formCardRef = useRef(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/notices');
      const data = await res.json();
      if (res.ok && data.success) {
        setNotices(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const resetForm = () => {
    setEditingNoticeId(null);
    setTitle('');
    setCategory('Notice');
    setTargetAudience('All Parents');
    setIssuedBy('Office Desk');
    setContent('');
  };

  const handleStartEditNotice = (notice) => {
    setError('');
    setFeedback('');
    setEditingNoticeId(notice._id);
    setTitle(notice.title || '');
    setCategory(notice.category || 'Notice');
    setTargetAudience(notice.targetAudience || 'All Parents');
    setIssuedBy(notice.issuedBy || 'Office Desk');
    setContent(notice.content || '');
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEdit = () => {
    setError('');
    setFeedback('');
    resetForm();
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const isEditing = Boolean(editingNoticeId);
    setSubmitting(true);
    setFeedback('');
    setError('');
    try {
      const endpoint = isEditing
        ? `/api/v1/admin/notices/${editingNoticeId}`
        : '/api/v1/admin/notices';

      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          targetAudience: targetAudience.trim(),
          issuedBy: issuedBy.trim(),
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing ? 'Failed to update notice.' : 'Failed to publish notice.')
        );
      }

      resetForm();
      setFeedback(
        isEditing
          ? 'Official notice updated on public website!'
          : 'Official notice published to public website!'
      );
      loadNotices();
    } catch (err) {
      console.error('Failed to save notice:', err);
      setError(err.message || 'Unable to save notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!canPublish) return;
    try {
      const res = await fetch(`/api/v1/admin/notices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => String(n._id) !== String(id)));
        if (String(editingNoticeId) === String(id)) {
          resetForm();
        }
      }
    } catch (err) {
      console.error('Failed to delete notice:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          School Circulars &amp; Updates
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy mt-0.5">
          Public Notices &amp; Circulars Board
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Notices published here appear live in the &ldquo;News &amp; School Updates&rdquo; section
          of the public website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {canPublish && (
          <div
            ref={formCardRef}
            className={`lg:col-span-5 bg-white rounded-xl border shadow-sm p-5 sm:p-6 transition ${
              editingNoticeId
                ? 'border-brand-gold ring-2 ring-amber-400/20'
                : 'border-slate-200'
            }`}
          >
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between gap-2">
              <h3 className="font-serif font-bold text-base text-brand-navy flex items-center gap-2">
                {editingNoticeId ? (
                  <Pencil className="w-4 h-4 text-brand-gold" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-brand-gold" />
                )}
                <span>
                  {editingNoticeId ? 'Edit Official Notice' : 'Publish Official Notice'}
                </span>
              </h3>
              {editingNoticeId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-brand-navy bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs font-medium">
                {error}
              </div>
            )}

            {feedback && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
                ✓ {feedback}
              </div>
            )}

            <form onSubmit={handleSubmitNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Parent-Teacher Consultation Schedule"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Circular">Circular</option>
                    <option value="Event">Event</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="All Parents / Students"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Content *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the full circular details..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-lg shadow transition text-sm cursor-pointer"
                >
                  {submitting
                    ? editingNoticeId
                      ? 'Saving Changes...'
                      : 'Publishing...'
                    : editingNoticeId
                      ? 'Save Notice Changes'
                      : 'Publish Notice to Website'}
                </button>
                {editingNoticeId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className={`${canPublish ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              Loading notices...
            </div>
          ) : (
            notices.map((n) => {
              const isBeingEdited = String(editingNoticeId) === String(n._id);

              return (
                <div
                  key={n._id}
                  className={`bg-white rounded-xl border shadow-sm p-5 flex items-start justify-between gap-4 transition ${
                    isBeingEdited
                      ? 'border-brand-gold ring-2 ring-amber-400/25 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-gold mb-1">
                      <Bell className="w-3.5 h-3.5" />
                      <span>{n.category}</span>
                      <span>•</span>
                      <span className="placeholder-badge">
                        {n.dateBadge ||
                          new Date(n.publishDate || Date.now()).toLocaleDateString('en-IN')}
                      </span>
                      {isBeingEdited && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider">
                          Editing
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-brand-navy">{n.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {n.content}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2">
                      {n.statusLabel || `Notice for: ${n.targetAudience || 'All Parents'}`} • Issued
                      by: <strong className="text-brand-navy">{n.issuedBy || 'Office Desk'}</strong>
                    </div>
                  </div>

                  {canPublish && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditNotice(n)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isBeingEdited
                            ? 'text-brand-gold bg-amber-100'
                            : 'text-slate-400 hover:text-brand-navy hover:bg-slate-100'
                        }`}
                        title="Edit notice"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(n._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
