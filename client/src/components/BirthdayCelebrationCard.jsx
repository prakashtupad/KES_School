import React from 'react';

export default function BirthdayCelebrationCard({
  celebrants = [],
  staffCelebrants = [],
  customWish = 'Wishing you joy, good health, and academic excellence! 🎂✨',
}) {
  const totalCelebrants = (celebrants?.length || 0) + (staffCelebrants?.length || 0);

  if (totalCelebrants === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between h-full">
        <div>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
            Star of the Day • Birthday Corner
          </span>
          <h4 className="text-lg font-serif font-bold text-slate-800 mt-3">
            &ldquo;Education is the most powerful weapon which you can use to change the world.&rdquo;
          </h4>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Every child at Shri Siddharoodha English Medium School is nurtured to excel in moral
            character, leadership, and knowledge. Student &amp; faculty birthdays are celebrated
            right here on their special day!
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
          <span>🌱 Daily Campus Inspiration • KES Khanatti</span>
          <span>🎂</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1A365D] to-[#0F2342] text-white rounded-xl p-6 border border-amber-400/40 shadow-md flex flex-col justify-between h-full">
      {/* Subtle celebratory background ornaments */}
      <div className="absolute top-2 right-3 text-2xl opacity-25 pointer-events-none select-none">
        🎂✨🎈
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
            Star of the Day
          </span>
          <span className="text-amber-300 text-xs font-semibold">
            Birthday Corner 🎉
          </span>
        </div>

        <h4 className="text-lg sm:text-xl font-serif font-bold text-amber-100 mt-3">
          Happy Birthday to Our Bright Stars!
        </h4>

        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
          {celebrants.map((student, idx) => (
            <div
              key={student._id || idx}
              className="flex items-center justify-between bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-amber-400 flex-shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-sm flex-shrink-0">
                    🎈
                  </span>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white block leading-tight truncate">
                    {student.displayName || student.studentName}
                  </span>
                  <span className="text-[11px] text-amber-300">
                    {student.grade}
                    {student.section && student.section !== 'N/A'
                      ? ` • Section ${student.section}`
                      : ''}
                  </span>
                </div>
              </div>
              <span className="text-xs flex-shrink-0 ml-2">⭐</span>
            </div>
          ))}

          {staffCelebrants.map((staff, idx) => (
            <div
              key={staff._id || `staff-${idx}`}
              className="flex items-center justify-between bg-amber-500/15 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-amber-400/30"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-sm flex-shrink-0">
                  💐
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white block leading-tight truncate">
                    {staff.displayName}
                  </span>
                  <span className="text-[11px] text-amber-300">{staff.role}</span>
                </div>
              </div>
              <span className="text-xs flex-shrink-0 ml-2">✨</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/15 text-[11px] text-slate-300">
        {customWish || 'May your day be filled with blessings, joy, and success!'}
      </div>
    </div>
  );
}
