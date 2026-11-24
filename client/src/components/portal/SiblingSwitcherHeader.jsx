import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function getStudentInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function isSectionApplicable(sec) {
  if (!sec) return false;
  const normalized = String(sec).trim().toUpperCase();
  return normalized !== 'N/A' && normalized !== 'NOT APPLICABLE' && normalized !== 'NONE';
}

export default function SiblingSwitcherHeader({
  siblings = [],
  activeSiblingIndex = 0,
  onSelectSibling,
}) {
  const { t } = useLanguage();

  // Eliminate duplicate top banner when parent only has 1 child
  if (!Array.isArray(siblings) || siblings.length <= 1) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-bold text-[#1A365D]">
        <div className="w-7 h-7 rounded-lg bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
          <Users className="w-3.5 h-3.5" />
        </div>
        <span>Switch Child:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial">
        {siblings.map((child, idx) => {
          const isSelected = idx === activeSiblingIndex;
          const photoUrl = child.documents?.studentPhotoUrl || '';
          const initials = getStudentInitials(child.studentName);
          const sectionDisplay = isSectionApplicable(child.section)
            ? ` (${child.section})`
            : '';

          return (
            <button
              key={child._id || child.admissionNumber || idx}
              type="button"
              onClick={() => onSelectSibling(idx)}
              className={`inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? 'bg-[#1A365D] text-white border-[#D97706] shadow-sm'
                  : 'bg-[#F8FAFC] hover:bg-slate-100 text-[#1A365D] border-slate-200'
              }`}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={child.studentName}
                  className="w-6 h-6 rounded-full object-cover object-top border border-[#D97706] flex-shrink-0 bg-white"
                />
              ) : (
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#D97706] text-[#1A365D]'
                      : 'bg-[#1A365D] text-amber-300'
                  }`}
                >
                  {initials}
                </span>
              )}
              <span className="truncate max-w-[140px]">{child.studentName}</span>
              <span
                className={`text-[10px] font-mono ${
                  isSelected ? 'text-amber-300' : 'text-slate-500'
                }`}
              >
                {child.grade}
                {sectionDisplay}
              </span>
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      <span className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {t('studentPortal.multiSiblingBadge')} ({siblings.length})
      </span>
    </div>
  );
}
