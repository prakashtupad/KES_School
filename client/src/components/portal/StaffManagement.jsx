import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserPlus, Users, Shield, CheckCircle, Ban, Pencil, X, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function compressStaffPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 320;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.max(1, Math.round(img.width * ratio));
        const h = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Classes');

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const formCardRef = useRef(null);

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

  const resetForm = () => {
    setEditingStaffId(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('teacher');
    setPhone('');
    setPhotoUrl('');
    setSelectedGrade('All Classes');
  };

  const handleStartEditStaff = (member) => {
    setError('');
    setSuccessMsg('');
    setEditingStaffId(member._id);
    setFullName(member.fullName || '');
    setEmail(member.email || '');
    setPassword('');
    setRole(member.role === 'admin' ? 'admin' : 'teacher');
    setPhone(member.phone || '');
    setPhotoUrl(member.photoUrl || '');
    const primaryGrade =
      Array.isArray(member.assignedGrades) && member.assignedGrades.length > 0
        ? member.assignedGrades[0]
        : 'All Classes';
    setSelectedGrade(GRADE_OPTIONS.includes(primaryGrade) ? primaryGrade : 'All Classes');
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCancelEdit = () => {
    setError('');
    setSuccessMsg('');
    resetForm();
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressStaffPhoto(file);
      setPhotoUrl(compressed);
    } catch {
      setError('Unable to read image file. Please try a valid JPG/PNG photo.');
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const isEditing = Boolean(editingStaffId);

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide full name and official email.');
      return;
    }

    if (!isEditing && password.length < 4) {
      setError('Please provide an initial password of at least 4 characters.');
      return;
    }

    if (isEditing && password.length > 0 && password.length < 4) {
      setError('New password must be at least 4 characters long (or leave blank to keep existing).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        role: isAdmin ? role : 'teacher',
        phone: phone.trim(),
        photoUrl,
        assignedGrades: role === 'teacher' ? [selectedGrade] : ['All Classes'],
      };
      if (!isEditing || password.length >= 4) {
        payload.password = password;
      }

      const endpoint = isEditing
        ? `/api/v1/auth/users/${editingStaffId}`
        : '/api/v1/auth/users';

      const res = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (isEditing ? 'Unable to update staff account.' : 'Unable to create account.')
        );
      }

      setSuccessMsg(
        data.message ||
          (isEditing ? 'Staff account updated successfully!' : 'Staff account created!')
      );
      resetForm();
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
        {/* Left: Create / Edit Account Form */}
        <div
          ref={formCardRef}
          className={`lg:col-span-5 bg-white rounded-xl border shadow-sm p-5 sm:p-6 transition ${
            editingStaffId
              ? 'border-brand-gold ring-2 ring-amber-400/20'
              : 'border-slate-200'
          }`}
        >
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-base text-brand-navy flex items-center gap-2">
              {editingStaffId ? (
                <Pencil className="w-4 h-4 text-brand-gold" />
              ) : (
                <UserPlus className="w-4 h-4 text-brand-gold" />
              )}
              <span>{editingStaffId ? 'Edit Staff Account' : 'Create Staff Account'}</span>
            </h3>
            {editingStaffId && (
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

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitStaff} className="space-y-4">
            {/* Staff Profile Photo Upload */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName || 'Staff photo'}
                  className="w-14 h-14 rounded-full object-cover object-top border-2 border-[#D97706] bg-white flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1A365D]/10 text-[#1A365D] border-2 border-dashed border-[#D97706]/60 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-[#D97706]" />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Staff Profile Photo (Optional)
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-[#1A365D] text-xs font-semibold cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      className="sr-only"
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

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
                  {editingStaffId ? 'New Password (Optional)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required={!editingStaffId}
                  minLength={editingStaffId ? undefined : 4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingStaffId ? 'Leave blank to keep' : 'Min 4 characters'}
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

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand-navy hover:bg-brand-navyDark disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-lg shadow transition text-sm cursor-pointer"
              >
                {submitting
                  ? editingStaffId
                    ? 'Saving Changes...'
                    : 'Creating Account...'
                  : editingStaffId
                    ? 'Save Staff Changes'
                    : 'Create Staff Account'}
              </button>
              {editingStaffId && (
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
              {staffList.map((member) => {
                const isBeingEdited = String(editingStaffId) === String(member._id);
                const assignedGradeLabel =
                  Array.isArray(member.assignedGrades) && member.assignedGrades.length > 0
                    ? member.assignedGrades.join(', ')
                    : '';

                return (
                  <div
                    key={member._id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isBeingEdited
                        ? 'border-brand-gold ring-2 ring-amber-400/25 bg-amber-50/30'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => isAdmin && handleStartEditStaff(member)}
                      className={`text-left min-w-0 flex-1 flex items-center gap-3 ${isAdmin ? 'cursor-pointer group' : ''}`}
                      title={isAdmin ? 'Click to edit staff details' : undefined}
                    >
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.fullName}
                          className="w-11 h-11 rounded-full object-cover object-top border-2 border-[#D97706] bg-white flex-shrink-0"
                        />
                      ) : (
                        <span className="w-11 h-11 rounded-full bg-[#1A365D]/10 text-[#1A365D] border border-[#1A365D]/20 text-xs font-bold inline-flex items-center justify-center flex-shrink-0">
                          {(member.fullName || 'S')
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0].toUpperCase())
                            .join('')}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-brand-navy group-hover:text-brand-gold transition">
                          {member.fullName}
                        </span>
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
                        {isBeingEdited && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase">
                            Editing
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-0.5">{member.email}</div>
                      {(member.phone || (member.role === 'teacher' && assignedGradeLabel)) && (
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {member.phone && <span>📞 {member.phone}</span>}
                          {member.role === 'teacher' && assignedGradeLabel && (
                            <span>🎓 {assignedGradeLabel}</span>
                          )}
                        </div>
                      )}
                      </div>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditStaff(member)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                            isBeingEdited
                              ? 'bg-amber-100 text-brand-navy border-brand-gold'
                              : 'bg-white hover:bg-slate-100 text-brand-navy border-slate-300'
                          }`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Edit</span>
                        </button>

                        {member.email !== user.email && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(member)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
