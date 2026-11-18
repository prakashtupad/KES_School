import React from 'react';
import { Users, CheckCircle2, GraduationCap } from 'lucide-react';

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
  if (!Array.isArray(siblings) || siblings.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A365D] text-[#D97706] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
              {siblings.length > 1
                ? `Multi-Sibling Family Account (${siblings.length} Enrolled Children)`
                : 'Active Student Profile'}
            </span>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1A365D]">
              {siblings.length > 1
                ? 'Select Child to Switch Dashboard Instantly'
                : siblings[0]?.studentName}
            </h2>
          </div>
        </div>

        {siblings.length > 1 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-[#D97706]/30 text-[#1A365D] text-[11px] font-bold">
            <GraduationCap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Instant Client-Side Switcher • Zero Reload</span>
          </span>
        )}
      </div>

      {/* Interactive Sibling Cards */}
      <div
        className={`grid grid-cols-1 ${
          siblings.length === 1
            ? 'sm:grid-cols-1'
            : siblings.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3'
        } gap-3`}
      >
        {siblings.map((child, idx) => {
          const isSelected = idx === activeSiblingIndex;
          const photoUrl = child.documents?.studentPhotoUrl || '';
          const initials = getStudentInitials(child.studentName);
          const sectionDisplay = isSectionApplicable(child.section)
            ? ` • Sec ${child.section}`
            : '';

          return (
            <button
              key={child._id || child.admissionNumber || idx}
              type="button"
              onClick={() => onSelectSibling(idx)}
              className={`w-full text-left p-3.5 rounded-xl border-2 transition flex items-center justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-[#1A365D] text-white border-[#D97706] shadow-md'
                  : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={child.studentName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#D97706] flex-shrink-0 bg-white"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-xl border-2 border-[#D97706] flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 shadow-xs ${
                      isSelected
                        ? 'bg-white text-[#1A365D]'
                        : 'bg-[#1A365D] text-white'
                    }`}
                  >
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#D97706] text-[#1A365D]'
                          : 'bg-slate-200 text-[#1A365D]'
                      }`}
                    >
                      {child.admissionNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        isSelected ? 'text-amber-200' : 'text-slate-600'
                      }`}
                    >
                      {child.grade}
                      {sectionDisplay}
                    </span>
                  </div>
                  <div
                    className={`font-serif font-bold text-sm sm:text-base truncate mt-0.5 ${
                      isSelected ? 'text-white' : 'text-[#1A365D]'
                    }`}
                  >
                    {child.studentName}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {isSelected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#D97706] hover:underline">
                    Switch →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
