import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users, Shield, CheckCircle, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GRADE_OPTIONS = [
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

export default function StaffManagement() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [phone, setPhone] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Classes');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffList(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleGradeSelection = (grade) => {
    setAssignedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || password.length < 4) {
      setError('Please provide full name, official email, and a password of at least 4 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role: isAdmin ? role : 'teacher',
          phone: phone.trim(),
          assignedGrades: role === 'teacher' ? [selectedGrade] : ['All Classes'],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to create account.');
      }

      setSuccessMsg(data.message || 'Staff account created!');
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      fetchStaff();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (staffMember) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/v1/auth/users/${staffMember._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !staffMember.isActive,
        }),
      });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error('Error updating staff status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          Role-Based Access Control (RBAC)
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-navy mt-0.5">
          Staff &amp; Faculty Account Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Office Admins can provision Admin and Faculty Teacher accounts and manage active status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Create Account Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h3 className="font-serif font-bold text-base text-brand-navy border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-brand-gold" />
            <span>Create Staff Account</span>
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

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Smt. Rekha Kulkarni"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rekha.teacher@keskhanatti.org"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Role *
                </label>
                <select
                  value={isAdmin ? role : 'teacher'}
                  disabled={!isAdmin}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                >
                  <option value="teacher">Teacher / Faculty</option>
                  {isAdmin && <option value="admin">Office Admin</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 00000"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy"
              />
            </div>

            {role === 'teacher' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Class / Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-brand-navy bg-white"
                >
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-lg shadow transition text-sm"
            >
              {submitting ? 'Creating Account...' : 'Create Staff Account'}
            </button>
          </form>
        </div>

        {/* Right: Staff Roster */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-serif font-bold text-base text-brand-navy flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold" />
              <span>Authorized Staff Roster ({staffList.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading staff roster...</div>
          ) : (
            <div className="space-y-3">
              {staffList.map((member) => (
                <div
                  key={member._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-brand-navy">{member.fullName}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy text-[10px] font-mono font-bold uppercase">
                        <Shield className="w-3 h-3 text-brand-gold" />
                        {member.role}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          member.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-0.5">{member.email}</div>
                  </div>

                  {isAdmin && member.email !== user.email && (
                    <button
                      type="button"
                      onClick={() => handleToggleActive(member)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        member.isActive
                          ? 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                    >
                      {member.isActive ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
