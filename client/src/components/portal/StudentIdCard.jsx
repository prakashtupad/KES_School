import React from 'react';
import { Home, Phone } from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import { getStudentInitials } from './SiblingSwitcherHeader';

export const PROMOTION_YEARS = ['2026-27', '2027-28', '2028-29', '2029-30'];

export function formatIdCardDob(dob) {
  if (!dob) return '—';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatIndianPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '—';
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return `+91 ${digits}`;
}

export default function StudentIdCard({
  student,
  orientation = 'portrait',
  side = 'front',
}) {
  if (!student) return null;

  const isPortrait = orientation === 'portrait';
  const photoUrl = student.documents?.studentPhotoUrl || '';
  const initials = getStudentInitials(student.studentName);
  const fatherName = student.father?.name || student.fatherName || '—';
  const phoneDisplay = formatIndianPhone(
    student.primaryPhone || student.whatsappNumber || student.father?.mobile
  );
  const bloodGroup =
    student.bloodGroup && student.bloodGroup !== 'Unknown'
      ? student.bloodGroup
      : '';
  const stsNo = (
    student.stsNumber ||
    student.previousStudy?.stsNumber ||
    ''
  ).trim();
  const dobDisplay = formatIdCardDob(student.dateOfBirth);

  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const taluk = student.residentialAddress?.taluk || 'Mudalgi';
  const district = student.residentialAddress?.district || 'Belagavi';
  const pincode = student.residentialAddress?.pincode || '591312';

  // Exact CR80 visual aspect ratios (Portrait: 54mm x 86mm -> 260px x 414px; Landscape: 86mm x 54mm -> 414px x 260px)
  const cardDimensions = isPortrait
    ? 'w-[260px] h-[414px]'
    : 'w-[414px] h-[260px]';

  // ================= BACK SIDE =================
  if (side === 'back') {
    return (
      <div
        className={`${cardDimensions} bg-white rounded-2xl border-2 border-[#1A365D] shadow-md overflow-hidden flex flex-col justify-between select-none text-slate-800 relative flex-shrink-0`}
      >
        {/* Top Navy Header */}
        <div className="bg-[#1A365D] text-white px-3.5 py-2.5 flex items-center gap-2.5 border-b-[3px] border-[#D97706]">
          <img
            src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
            alt="KES Logo"
            className="w-9 h-9 rounded-full object-contain bg-white p-0.5 border-2 border-[#D97706] flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[6.8px] font-bold uppercase tracking-wider text-amber-300 truncate">
              KHANATTI EDUCATION SOCIETY&apos;S
            </div>
            <div className="text-[9.5px] font-serif font-bold leading-tight">
              SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
            </div>
            <div className="text-[7.5px] text-slate-200 leading-tight mt-0.5">
              Khanatti, Gokak Taluk
            </div>
          </div>
        </div>

        {/* Back Body */}
        <div
          className={`flex-grow ${
            isPortrait ? 'p-3 space-y-2.5' : 'px-3.5 py-2 space-y-1.5'
          } flex flex-col justify-between text-[9.5px] leading-snug bg-white`}
        >
          <div className={isPortrait ? 'space-y-2.5' : 'grid grid-cols-2 gap-2'}>
            {/* Residential Address */}
            <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-wider text-[#1A365D]">
                <Home className="w-3 h-3 text-[#1A365D] flex-shrink-0" />
                <span>RESIDENTIAL ADDRESS</span>
              </div>
              <div className="text-slate-700 mt-1 leading-relaxed text-[9px]">
                At &amp; Post: <strong className="text-[#1A365D]">{village}</strong>, Taluk:{' '}
                <strong className="text-[#1A365D]">{taluk}</strong>, District:{' '}
                <strong className="text-[#1A365D]">{district}</strong> — Pin:{' '}
                <strong className="text-[#1A365D] font-mono">{pincode}</strong>
              </div>
            </div>

            {/* Emergency School Helpline */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-[#D97706]/35">
              <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-wider text-amber-800">
                <Phone className="w-3 h-3 text-amber-700 flex-shrink-0" />
                <span>EMERGENCY SCHOOL HELPLINE</span>
              </div>
              <div className="text-slate-800 mt-1 text-[9.5px]">
                Phone:{' '}
                <strong className="font-mono text-[#1A365D]">
                  {SCHOOL_INFO.phoneDisplay}
                </strong>
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">
                Email: {SCHOOL_INFO.email}
              </div>
            </div>

            {/* Important Instructions */}
            <div
              className={`p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 ${
                isPortrait ? '' : 'col-span-2 py-1.5'
              }`}
            >
              <div className="text-[8.5px] font-bold uppercase tracking-wider text-[#1A365D] mb-1">
                IMPORTANT INSTRUCTIONS
              </div>
              <ol
                className={`text-[8.5px] text-slate-700 ${
                  isPortrait ? 'space-y-1' : 'space-y-0.5'
                }`}
              >
                <li>1. This card must be worn by the student daily.</li>
                <li>2. In case of loss, report to the school office immediately.</li>
                <li>3. Retain this card for the primary school duration.</li>
              </ol>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-200 text-center text-[8px] text-slate-600 leading-tight">
            If found, please return to:{' '}
            <strong className="text-[#1A365D]">
              Shri Siddharoodha English Medium School, Khanatti, Gokak Taluk
            </strong>
          </div>
        </div>
      </div>
    );
  }

  // ================= PORTRAIT FRONT (54mm x 86mm) =================
  if (isPortrait) {
    return (
      <div
        className={`${cardDimensions} bg-white rounded-2xl border-2 border-[#1A365D] shadow-md overflow-hidden flex flex-col justify-between select-none text-slate-800 relative flex-shrink-0`}
      >
        {/* Top Navy Header with Gold Bottom Border */}
        <div className="bg-[#1A365D] text-white px-3 pt-2.5 pb-2 border-b-[3px] border-[#D97706]">
          <div className="flex items-center gap-2">
            <img
              src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
              alt="School Crest"
              className="w-10 h-10 rounded-full object-contain bg-white p-0.5 border-2 border-[#D97706] flex-shrink-0"
            />
            <div className="text-left min-w-0">
              <div className="text-[6.8px] font-bold uppercase tracking-wider text-amber-300 leading-tight">
                KHANATTI EDUCATION SOCIETY&apos;S
              </div>
              <div className="text-[9.5px] font-serif font-bold text-white leading-tight mt-0.5">
                SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
              </div>
              <div className="text-[7.5px] font-semibold text-slate-200 leading-tight mt-0.5">
                Khanatti, Gokak Taluk
              </div>
              <div className="text-[6.4px] font-bold uppercase tracking-wider text-amber-200/95 mt-0.5">
                PERMANENT STUDENT IDENTITY CARD
              </div>
            </div>
          </div>
        </div>

        {/* Main Card Content */}
        <div className="px-3.5 pt-2.5 pb-2 flex-grow flex flex-col justify-between bg-white">
          {/* Student Photo + STUDENT Badge + Full Name */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-[78px] h-[88px] rounded-xl overflow-hidden border-2 border-[#D97706] shadow-xs bg-slate-100 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={student.studentName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1A365D] text-white flex flex-col items-center justify-center">
                    <span className="text-xl font-serif font-bold text-[#D97706]">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-[1px] rounded-full bg-[#D97706] text-white text-[7.2px] font-extrabold uppercase tracking-wider shadow-xs whitespace-nowrap">
                STUDENT
              </span>
            </div>

            <div className="text-center mt-1 w-full">
              <div className="font-serif font-bold text-[12.5px] text-[#1A365D] leading-tight uppercase truncate">
                {student.studentName || '—'}
              </div>
            </div>
          </div>

          {/* Permanent Student Fields (exact order matching reference) */}
          <div className="mt-1 space-y-[3px] text-[9.2px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                Adm No:
              </span>
              <strong className="font-mono text-[#1A365D] font-bold">
                {student.admissionNumber || '—'}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                D.O.B:
              </span>
              <strong className="font-mono text-slate-900">{dobDisplay}</strong>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                Blood Group:
              </span>
              {bloodGroup ? (
                <span className="px-2 py-[1px] rounded bg-[#B91C1C] text-white font-mono text-[8.5px] font-bold leading-tight">
                  {bloodGroup}
                </span>
              ) : (
                <strong className="text-slate-400 font-mono">—</strong>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                Father&apos;s Name:
              </span>
              <strong className="text-slate-900 truncate max-w-[125px] text-right">
                {fatherName}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                Contact No:
              </span>
              <strong className="font-mono text-[#1A365D]">{phoneDisplay}</strong>
            </div>

            {stsNo && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                  STS / SATS No:
                </span>
                <strong className="font-mono text-slate-900">{stsNo}</strong>
              </div>
            )}
          </div>

          {/* Always-Shown 4-Year Yearly Validation Strip */}
          <div className="mt-1.5 rounded-lg border border-slate-300 overflow-hidden bg-white">
            <div className="bg-slate-100 text-[#1A365D] text-[6.5px] font-bold uppercase tracking-wider text-center py-0.5 border-b border-slate-300">
              YEARLY VALIDATION
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-300 text-center">
              {PROMOTION_YEARS.map((yr) => (
                <div key={yr} className="py-1 px-0.5">
                  <div className="text-[6.8px] font-bold text-[#1A365D] leading-none">
                    {yr}
                  </div>
                  <div className="h-3 border-b border-dashed border-slate-300 mx-1 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Clean Bottom Footer: White space left + PRINCIPAL signature line bottom right */}
          <div className="mt-2 pt-1 flex items-end justify-end">
            <div className="text-center">
              <div className="w-20 border-b border-slate-500 mb-0.5" />
              <span className="font-bold text-[#1A365D] uppercase tracking-widest text-[7.2px]">
                PRINCIPAL
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= LANDSCAPE FRONT (86mm x 54mm) =================
  return (
    <div
      className={`${cardDimensions} bg-white rounded-2xl border-2 border-[#1A365D] shadow-md overflow-hidden flex flex-col justify-between select-none text-slate-800 relative flex-shrink-0`}
    >
      {/* Top Navy Header with Gold Bottom Border */}
      <div className="bg-[#1A365D] text-white px-3.5 py-2 flex items-center gap-2 border-b-[3px] border-[#D97706]">
        <img
          src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
          alt="School Crest"
          className="w-8 h-8 rounded-full object-contain bg-white p-0.5 border border-[#D97706] flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="text-[6.8px] font-bold uppercase tracking-wider text-amber-300 truncate">
            KHANATTI EDUCATION SOCIETY&apos;S
          </div>
          <div className="text-[10.5px] font-serif font-bold text-white leading-tight truncate">
            SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
          </div>
          <div className="text-[7px] text-slate-200 leading-tight">
            Khanatti, Gokak Taluk • Permanent Student Identity Card
          </div>
        </div>
      </div>

      {/* Center Content: Photo Left + Permanent Fields Right */}
      <div className="px-3.5 py-2 flex-grow flex items-stretch gap-3.5 bg-white">
        {/* Left Photo Column */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="w-[82px] h-[96px] rounded-xl overflow-hidden border-2 border-[#D97706] shadow-xs bg-slate-100 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={student.studentName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-[#1A365D] text-white flex flex-col items-center justify-center">
                  <span className="text-xl font-serif font-bold text-[#D97706]">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-[1px] rounded-full bg-[#D97706] text-white text-[7px] font-extrabold uppercase tracking-wider shadow-xs whitespace-nowrap">
              STUDENT
            </span>
          </div>
        </div>

        {/* Right Permanent Details + Always-Shown Yearly Validation + Principal Sign */}
        <div className="flex-grow min-w-0 flex flex-col justify-between">
          <div>
            <div className="font-serif font-bold text-[12.5px] text-[#1A365D] uppercase truncate pb-0.5 border-b border-slate-200">
              {student.studentName || '—'}
            </div>

            <div className="mt-1 space-y-[2px] text-[9px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">Adm No:</span>
                <strong className="font-mono text-[#1A365D]">
                  {student.admissionNumber || '—'}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">D.O.B:</span>
                <strong className="font-mono text-slate-900">{dobDisplay}</strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">Blood Group:</span>
                {bloodGroup ? (
                  <span className="px-2 py-[0.5px] rounded bg-[#B91C1C] text-white font-mono text-[8px] font-bold leading-tight">
                    {bloodGroup}
                  </span>
                ) : (
                  <strong className="text-slate-400 font-mono">—</strong>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">Father&apos;s Name:</span>
                <strong className="text-slate-900 truncate max-w-[160px] text-right">
                  {fatherName}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 font-semibold">Contact No:</span>
                <strong className="font-mono text-[#1A365D]">{phoneDisplay}</strong>
              </div>
              {stsNo && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 font-semibold">STS / SATS No:</span>
                  <strong className="font-mono text-slate-900">{stsNo}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 mt-1">
            <div className="flex-1 rounded border border-slate-300 overflow-hidden bg-white">
              <div className="bg-slate-100 text-[#1A365D] text-[5.5px] font-bold uppercase tracking-wider text-center py-[1px] border-b border-slate-300">
                YEARLY VALIDATION
              </div>
              <div className="grid grid-cols-4 divide-x divide-slate-300 text-center">
                {PROMOTION_YEARS.map((yr) => (
                  <div key={yr} className="py-0.5 px-0.5">
                    <div className="text-[5.8px] font-bold text-[#1A365D] leading-none">
                      {yr}
                    </div>
                    <div className="h-2 border-b border-dashed border-slate-300 mx-0.5 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center flex-shrink-0">
              <div className="w-18 border-b border-slate-500 mb-0.5" />
              <span className="font-bold text-[#1A365D] uppercase tracking-widest text-[7px]">
                PRINCIPAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
