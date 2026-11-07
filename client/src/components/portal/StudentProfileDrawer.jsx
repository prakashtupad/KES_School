import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Pencil,
  ShieldCheck,
  GraduationCap,
  Users,
  FileCheck,
  CheckCircle2,
  MapPin,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDirectStudentChatUrl } from '../../utils/whatsappFormatter';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

export default function StudentProfileDrawer({
  studentId,
  initialStudent = null,
  onClose,
  onEdit,
}) {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStudent(initialStudent);
    const id = studentId || initialStudent?._id;
    if (!id || !token) return;

    let active = true;
    setLoading(true);
    fetch(`/api/v1/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success && (data.student || data.data)) {
          setStudent(data.student || data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studentId, initialStudent, token]);

  if (!student && !studentId) return null;

  const st = student || {};
  const waUrl = getDirectStudentChatUrl(
    st.whatsappNumber || st.primaryPhone,
    st.studentName,
    st.grade
  );

  const dobFormatted = st.dateOfBirth
    ? new Date(st.dateOfBirth).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const fatherName = st.father?.name || st.fatherName || '—';
  const motherName =
    st.mother?.name && String(st.mother.name) !== 'true'
      ? st.mother.name
      : st.motherName && String(st.motherName) !== 'true'
        ? st.motherName
        : '—';
  const village =
    st.residentialAddress?.villageOrTown || st.residentialVillage || 'Khanatti';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Full Student Profile"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl border-l border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-10 bg-brand-navy text-white px-5 py-4 flex items-center justify-between gap-3 border-b border-brand-gold/40">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-brand-gold text-brand-navyDark font-mono font-bold text-[11px]">
                {st.admissionNumber || '—'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[11px] font-bold">
                {st.grade} • Sec {st.section || 'A'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold">
                {st.status || 'Active'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold mt-1 truncate">
              {st.studentName || 'Loading student profile...'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => printStudentAdmissionSummary(st)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
              title="Print Admission Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {isAdmin && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(st)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold border border-white/20 transition"
              >
                <Pencil className="w-3.5 h-3.5 text-brand-gold" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Close student profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 flex-1 text-xs sm:text-sm">
          {loading && !st.studentName ? (
            <div className="py-12 text-center text-slate-500">
              Loading full student profile...
            </div>
          ) : (
            <>
              {/* Quick Contact & WhatsApp Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Primary Parent Contact
                    </span>
                    <a
                      href={`tel:+91${st.primaryPhone}`}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-brand-navy text-sm hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      <span>+91 {st.primaryPhone}</span>
                    </a>
                  </div>
                  <div className="pl-3 border-l border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Village / Town
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{village}</span>
                    </span>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Parent</span>
                </a>
              </div>

              {/* 1. Karnataka State Statutory IDs (STS / PEN / APAAR / Aadhaar) */}
              <div className="p-4 rounded-xl bg-brand-goldSoft/50 border border-brand-gold/40 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  <span>Karnataka State &amp; National Statutory IDs</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Student Aadhaar</span>
                    <span className="font-mono font-bold text-brand-navy text-xs">
                      {st.aadhaarNumber || st.studentAadhaarNo || 'Not Recorded'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Karnataka STS / SATS</span>
                    <span className="font-mono font-bold text-brand-navy text-xs">
                      {st.previousStudy?.stsNumber || 'Not Recorded'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">National PEN No.</span>
                    <span className="font-mono font-bold text-brand-navy text-xs">
                      {st.previousStudy?.penNumber || 'Not Recorded'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">APAAR Edu ID</span>
                    <span className="font-mono font-bold text-brand-navy text-xs">
                      {st.previousStudy?.apaarId || 'Not Recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Student Demographics & Medical Particulars */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-brand-gold" />
                  <span>Demographics, Language &amp; Health Particulars</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Date of Birth</span>
                    <strong className="text-slate-800">{dobFormatted}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Gender</span>
                    <strong className="text-slate-800">{st.gender || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Blood Group</span>
                    <strong className="text-slate-800">{st.bloodGroup || 'Unknown'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Religion / Caste / Cat
                    </span>
                    <strong className="text-slate-800">
                      {st.religion || 'Hindu'} {st.caste ? `• ${st.caste}` : ''} (
                      {st.category || 'General'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Mother Tongue / 3rd Lang
                    </span>
                    <strong className="text-slate-800">
                      {st.motherTongue || 'Kannada'} / {st.languageIII || 'Kannada'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      School Van / Transport
                    </span>
                    <strong className="text-slate-800">
                      {st.transportRequired || st.schoolTransportOptIn ? 'Yes (Opted)' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Height / Weight
                    </span>
                    <strong className="text-slate-800">
                      {st.heightCm ? `${st.heightCm} cm` : '—'} /{' '}
                      {st.weightKg ? `${st.weightKg} kg` : '—'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Special Child (CWSN)
                    </span>
                    <strong className="text-slate-800">
                      {st.isSpecialChild ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Medical / Allergies
                    </span>
                    <strong className="text-slate-800">
                      {st.medicalAilmentsOrAllergies || st.medicalAilmentOrAllergy || 'None'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Parent / Guardian Particulars */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Users className="w-4 h-4 text-brand-gold" />
                  <span>Parent / Guardian Particulars</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-gold">
                      Father / Primary Guardian
                    </span>
                    <div className="font-bold text-brand-navy text-sm">{fatherName}</div>
                    <div className="text-slate-600">
                      Mobile: <span className="font-mono font-semibold">{st.primaryPhone}</span>
                    </div>
                    {st.father?.qualification && (
                      <div className="text-slate-600">
                        Qualification: {st.father.qualification}
                      </div>
                    )}
                    {st.father?.profession && (
                      <div className="text-slate-600">Occupation: {st.father.profession}</div>
                    )}
                    {st.father?.officeAddress && (
                      <div className="text-slate-500">Address: {st.father.officeAddress}</div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand-gold">
                      Mother Particulars
                    </span>
                    <div className="font-bold text-brand-navy text-sm">{motherName}</div>
                    {(st.mother?.mobile || st.mother?.mobileNumber) && (
                      <div className="text-slate-600">
                        Mobile:{' '}
                        <span className="font-mono font-semibold">
                          {st.mother.mobile || st.mother.mobileNumber}
                        </span>
                      </div>
                    )}
                    {st.mother?.qualification && (
                      <div className="text-slate-600">
                        Qualification: {st.mother.qualification}
                      </div>
                    )}
                    {st.mother?.profession && (
                      <div className="text-slate-600">Occupation: {st.mother.profession}</div>
                    )}
                    {st.mother?.annualIncome && (
                      <div className="text-slate-600">
                        Annual Income: ₹ {st.mother.annualIncome}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Previous Academic History & Enclosures */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileCheck className="w-4 h-4 text-brand-gold" />
                  <span>Previous School &amp; Submitted Enclosures</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Previous School
                    </span>
                    <strong className="text-slate-800">
                      {st.previousStudy?.schoolName || 'First-Time Enrollment'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Board &amp; Last Class
                    </span>
                    <strong className="text-slate-800">
                      {st.previousStudy?.affiliatedBoard || 'KSEAB'}{' '}
                      {st.previousStudy?.standardStudied
                        ? `(${st.previousStudy.standardStudied})`
                        : ''}
                    </strong>
                  </div>
                </div>

                {st.enclosuresSubmitted && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {[
                      { key: 'birthCertificate', label: 'Birth Certificate' },
                      { key: 'studentAadhaar', label: 'Student Aadhaar' },
                      { key: 'parentAadhaar', label: 'Parent Aadhaar' },
                      { key: 'transferCertificate', label: 'Transfer Certificate' },
                      { key: 'casteCertificate', label: 'Caste/Income Cert' },
                      { key: 'passportPhotos', label: 'Passport Photos' },
                    ].map((enc) => {
                      const done = Boolean(st.enclosuresSubmitted?.[enc.key]);
                      return (
                        <span
                          key={enc.key}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            done
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {done && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{enc.label}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
