import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Bus,
  MapPin,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGES = {
  new: {
    label: 'New Enquiry',
    classes: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  contacted: {
    label: 'Contacted',
    classes: 'bg-blue-50 text-blue-800 border-blue-300',
  },
  visit_scheduled: {
    label: 'Visit Scheduled',
    classes: 'bg-purple-50 text-purple-800 border-purple-300',
  },
  admitted: {
    label: 'Admitted',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  closed: {
    label: 'Closed',
    classes: 'bg-slate-100 text-slate-600 border-slate-300',
  },
};

const FILTER_TABS = [
  { key: 'all', label: 'All Enquiries' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'visit_scheduled', label: 'Visit Scheduled' },
  { key: 'admitted', label: 'Admitted' },
  { key: 'closed', label: 'Closed' },
];

export default function AdminEnquiryDesk() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notesDraft, setNotesDraft] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/v1/admin/enquiries?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiries(data.data || []);
        const initialNotes = {};
        (data.data || []).forEach((item) => {
          initialNotes[item._id] = item.internalNotes || '';
        });
        setNotesDraft(initialNotes);
      }
    } catch (err) {
      console.error('Error loading enquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, searchQuery]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateEnquiry = async (id, payload) => {
    setUpdatingId(id);
    setFeedback('');
    try {
      const res = await fetch(`/api/v1/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiries((prev) =>
          prev.map((item) => (String(item._id) === String(id) ? data.data : item))
        );
        setFeedback('Enquiry record updated successfully.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update enquiry:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/v1/admin/enquiries/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KES_Admissions_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
            Admissions Desk
          </span>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-navy mt-0.5">
            Admission Enquiries
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Click any student row to expand details, log notes, or update status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={fetchEnquiries}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-navy hover:bg-brand-navyDark text-white text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-brand-gold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
          ✓ {feedback}
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  active
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, parent, phone, ref..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-brand-navy bg-white"
          />
        </div>
      </div>

      {/* Collapsible Accordion Enquiries List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-500">
          Loading admission enquiries...
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <p className="text-base font-serif font-bold text-brand-navy">
            No matching admission enquiries found
          </p>
          <p className="text-xs text-slate-500">
            New enquiries submitted from the public website will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((enquiry) => {
            const badge = STATUS_BADGES[enquiry.status] || STATUS_BADGES.new;
            const phone = enquiry.phone || enquiry.phoneNumber;
            const location = enquiry.location || enquiry.villageTown;
            const queryText = enquiry.message || enquiry.optionalMessage;
            const isUpdating = updatingId === enquiry._id;
            const isExpanded = Boolean(expandedIds[enquiry._id]);

            return (
              <div
                key={enquiry._id}
                className={`bg-white rounded-xl border shadow-sm transition overflow-hidden ${
                  isExpanded
                    ? 'border-brand-gold/60 ring-1 ring-brand-gold/20'
                    : 'border-slate-200 hover:border-brand-gold/40'
                }`}
              >
                {/* Compact Accordion Header (Click to Expand / Collapse) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpanded(enquiry._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpanded(enquiry._id);
                    }
                  }}
                  className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/70 transition"
                >
                  {/* Left: Student Name, Class, Status & Reference */}
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <span className="placeholder-badge font-bold text-[11px]">
                      {enquiry.referenceId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.classes}`}
                    >
                      {badge.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-brand-navy truncate">
                      Student: {enquiry.studentName}{' '}
                      <span className="text-xs font-sans font-semibold text-brand-gold">
                        ({enquiry.classOfInterest})
                      </span>
                    </h3>
                  </div>

                  {/* Right: Phone Number & Expand Toggle */}
                  <div className="flex items-center gap-3 ml-auto">
                    <a
                      href={`tel:+91${phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono font-bold text-brand-navy text-xs sm:text-sm hover:underline inline-flex items-center gap-1"
                    >
                      <span>📞 +91 {phone}</span>
                    </a>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        isExpanded
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Collapsible Details Panel */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-4">
                    {/* Metadata Row: Parent, School Van, Location, Submitted Time */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>
                          Parent / Guardian: <strong className="text-brand-navy">{enquiry.guardianName}</strong>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                            enquiry.needSchoolVan === 'Yes'
                              ? 'bg-brand-goldSoft text-brand-navyDark border-brand-gold/50'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          <Bus className="w-3 h-3" />
                          School Van: {enquiry.needSchoolVan || 'No'}
                        </span>
                        {location && (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                            <span>{location}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Submitted:{' '}
                        {enquiry.createdAt
                          ? new Date(enquiry.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'Recent'}
                      </div>
                    </div>

                    {/* Parent Query / Message */}
                    {queryText && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-500 uppercase tracking-wider text-[10px] block mb-0.5">
                          Parent Query / Message:
                        </strong>
                        {queryText}
                      </div>
                    )}

                    {/* Internal Notes & Status Action Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-1">
                      <div className="lg:col-span-6">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Internal Office Notes (Staff Only)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={notesDraft[enquiry._id] ?? ''}
                            onChange={(e) =>
                              setNotesDraft((prev) => ({
                                ...prev,
                                [enquiry._id]: e.target.value,
                              }))
                            }
                            placeholder="Add follow-up remarks, visit date, or transport notes..."
                            className="flex-grow px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-brand-navy bg-white"
                          />
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleUpdateEnquiry(enquiry._id, {
                                internalNotes: notesDraft[enquiry._id] || '',
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Status Action Buttons */}
                      <div className="lg:col-span-6 flex flex-wrap items-center lg:justify-end gap-2">
                        <button
                          type="button"
                          disabled={isUpdating || enquiry.status === 'contacted'}
                          onClick={() => handleUpdateEnquiry(enquiry._id, { status: 'contacted' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-800 border border-blue-200 text-xs font-semibold transition"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Mark Contacted</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || enquiry.status === 'visit_scheduled'}
                          onClick={() =>
                            handleUpdateEnquiry(enquiry._id, { status: 'visit_scheduled' })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-800 border border-purple-200 text-xs font-semibold transition"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Schedule Visit</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || enquiry.status === 'admitted'}
                          onClick={() => handleUpdateEnquiry(enquiry._id, { status: 'admitted' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Admitted</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || enquiry.status === 'closed'}
                          onClick={() => handleUpdateEnquiry(enquiry._id, { status: 'closed' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
