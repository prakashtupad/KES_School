import React from 'react';
import {
  User,
  Calendar,
  Droplets,
  MapPin,
  Phone,
  ShieldCheck,
  Printer,
  Bus,
  BookOpen,
  Users,
} from 'lucide-react';
import { getStudentInitials, isSectionApplicable } from './SiblingSwitcherHeader';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

export default function StudentOverviewTab({ student }) {
  if (!student) return null;

  const photoUrl = student.documents?.studentPhotoUrl || '';
  const initials = getStudentInitials(student.studentName);
  const dobDisplay = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const fatherName = student.father?.name || student.fatherName || '—';
  const motherName =
    student.mother?.name && String(student.mother.name) !== 'true'
      ? student.mother.name
      : student.motherName && String(student.motherName) !== 'true'
        ? student.motherName
        : '—';
  const fatherPhone =
    student.father?.mobileNumber || student.father?.mobile || student.primaryPhone || '—';
  const motherPhone = student.mother?.mobileNumber || student.mother?.mobile || '—';
  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const taluk = student.residentialAddress?.taluk || 'Mudalgi';
  const district = student.residentialAddress?.district || 'Belagavi';
  const pincode = student.residentialAddress?.pincode || '591312';

  const stsNumber = student.previousStudy?.stsNumber || 'Not Assigned Yet';
  const penNumber = student.previousStudy?.penNumber || 'Not Assigned Yet';
  const apaarId = student.previousStudy?.apaarId || 'Not Assigned Yet';

  return (
    <div className="space-y-5">
      {/* Top Digital Student Photo ID Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A365D] to-brand-navyDark px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D97706]">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D97706] font-bold block">
              Khanatti Education Society • Official Student Digital ID
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold">
              Student Overview &amp; Statutory Profile
            </h3>
          </div>

          <button
            type="button"
            onClick={() => printStudentAdmissionSummary(student)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D97706] hover:bg-amber-500 text-[#1A365D] font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Admission Profile</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Student Passport Photo or Monogram Avatar */}
          <div className="flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student.studentName}
                className="w-24 h-24 rounded-2xl border-2 border-[#D97706] object-cover shadow-md bg-slate-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-[#D97706] bg-[#1A365D] text-white flex flex-col items-center justify-center shadow-md">
                <span className="text-2xl font-serif font-bold text-[#D97706]">
                  {initials}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-300 mt-0.5">
                  Student ID
                </span>
              </div>
            )}
          </div>

          {/* Primary Student Identification */}
          <div className="flex-grow space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-[#1A365D] border border-[#D97706]/40">
                Adm No: {student.admissionNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#1A365D] text-white text-xs font-bold">
                {student.grade}
                {isSectionApplicable(student.section) ? ` • Section ${student.section}` : ''}
              </span>
              {student.rollNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                  Roll No: {student.rollNumber}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                {student.status || 'Active'} ({student.academicYear || '2026-2027'})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A365D]">
              {student.studentName}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                <span>
                  DOB: <strong className="text-slate-900">{dobDisplay}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <User className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                <span>
                  Gender: <strong className="text-slate-900">{student.gender || '—'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Droplets className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span>
                  Blood Group:{' '}
                  <strong className="text-slate-900">{student.bloodGroup || 'Unknown'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                <span>
                  Village: <strong className="text-slate-900">{village}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Karnataka State & National Compliance Identifiers (STS / PEN / APAAR) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-[#D97706]" />
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A365D]">
            Karnataka State &amp; National Education Identifiers
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Karnataka STS / SATS No.
            </span>
            <span className="font-mono font-bold text-sm text-[#1A365D] mt-1 block">
              {stsNumber}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              National PEN (Permanent Edu No.)
            </span>
            <span className="font-mono font-bold text-sm text-[#1A365D] mt-1 block">
              {penNumber}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              APAAR ID (One Nation One ID)
            </span>
            <span className="font-mono font-bold text-sm text-[#1A365D] mt-1 block">
              {apaarId}
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Parent / Guardian Particulars & Academic / Residential Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Father & Mother Particulars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Users className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A365D]">
              Parent &amp; Guardian Particulars
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Father / Primary Guardian
              </span>
              <div className="font-bold text-sm text-[#1A365D]">{fatherName}</div>
              {student.father?.profession && (
                <div className="text-slate-600">Occupation: {student.father.profession}</div>
              )}
              <div className="flex items-center gap-1 font-mono text-slate-700 pt-0.5">
                <Phone className="w-3 h-3 text-[#D97706]" />
                <span>+91 {fatherPhone}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Mother Particulars
              </span>
              <div className="font-bold text-sm text-[#1A365D]">{motherName}</div>
              {student.mother?.profession && (
                <div className="text-slate-600">Occupation: {student.mother.profession}</div>
              )}
              {motherPhone && motherPhone !== '—' && (
                <div className="flex items-center gap-1 font-mono text-slate-700 pt-0.5">
                  <Phone className="w-3 h-3 text-[#D97706]" />
                  <span>+91 {motherPhone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Residential Address
            </span>
            <div className="font-semibold text-slate-800">
              {village}, Taluk: {taluk}, District: {district} — {pincode}
            </div>
          </div>
        </div>

        {/* Additional Demographics & Enrollment Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A365D]">
              Demographics &amp; School Particulars
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Mother Tongue
              </span>
              <strong className="text-slate-800 mt-0.5 block">
                {student.motherTongue || 'Kannada'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                3rd Language (Language III)
              </span>
              <strong className="text-slate-800 mt-0.5 block">
                {student.languageIII || 'Kannada'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Category &amp; Religion
              </span>
              <strong className="text-slate-800 mt-0.5 block">
                {student.category || 'General'} • {student.religion || 'Hindu'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                School Van / Transport
              </span>
              <strong className="text-slate-800 mt-0.5 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>
                  {student.transportRequired || student.schoolTransportOptIn
                    ? 'Opted In (School Van)'
                    : 'Self-Commute'}
                </span>
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-[#D97706]/30 text-xs text-slate-700 flex items-center justify-between">
            <span>
              Primary WhatsApp Broadcast Number:{' '}
              <strong className="font-mono text-[#1A365D]">
                +91 {student.whatsappNumber || student.primaryPhone}
              </strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
