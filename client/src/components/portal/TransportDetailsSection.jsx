import React from 'react';
import { Bus, Phone, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getStudentInitials, isSectionApplicable } from './SiblingSwitcherHeader';

const TRANSPORT_HELPLINE_RAW = '917795770785';
const TRANSPORT_HELPLINE_DISPLAY = '+91 77957 70785';

function formatDriverPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return {
      href: `tel:+91${digits}`,
      display: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return {
      href: `tel:+${digits}`,
      display: `+91 ${local.slice(0, 5)} ${local.slice(5)}`,
    };
  }
  return {
    href: `tel:+${TRANSPORT_HELPLINE_RAW}`,
    display: TRANSPORT_HELPLINE_DISPLAY,
  };
}

/**
 * Multi-Child School Van & Transport Details Module.
 * Renders stacked Navy/Gold cards for EVERY sibling linked to the logged-in parent account.
 */
export default function TransportDetailsSection({ siblings = [], activeStudent = null }) {
  const { language, t } = useLanguage();

  const childrenList =
    Array.isArray(siblings) && siblings.length > 0
      ? siblings
      : activeStudent
        ? [activeStudent]
        : [];

  if (childrenList.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#1A365D] leading-tight">
          {t('studentPortal.transport.heading', 'School Van & Transport Details')}
        </h2>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A365D]/10 text-[#1A365D] text-xs font-bold">
          <Bus className="w-3.5 h-3.5 text-[#D97706]" />
          <span>AY 2026–2027</span>
        </span>
      </div>

      {/* Stacked Cards for Every Sibling */}
      <div>
        {childrenList.map((child, idx) => {
          const td = child.transportDetails || {};
          const fee = child.feeDetails || {};

          const annualCabFee = Math.max(
            0,
            Number(td.annualCabFee ?? child.annualCabFee ?? fee.cabFeeAmount ?? 0)
          );
          const cabPaid = Math.min(
            annualCabFee,
            Math.max(0, Number(td.cabFeePaid ?? child.cabFeePaid ?? fee.cabFeePaid ?? 0))
          );
          const cabDue = Math.max(0, annualCabFee - cabPaid);
          const hasCab = Boolean(
            td.optedIn || child.cabOpted || child.transportOpted || annualCabFee > 0
          );

          const village =
            child.residentialAddress?.villageOrTown ||
            child.residentialVillage ||
            child.village ||
            'Khanatti';
          const routeText =
            td.routeName ||
            child.cabRoute ||
            child.transportRoute ||
            village ||
            'Assigned Village Route';
          const cabNo = td.cabNumber || child.vehicleNumber || child.cabNumber || 'School Van';
          const vehicleDisplay = td.vehicleName ? `${cabNo} (${td.vehicleName})` : cabNo;
          const pickupTime = td.pickupTime || child.pickupTime;
          const dropTime = td.dropTime || child.dropTime;
          const timingsText =
            pickupTime && dropTime
              ? `Pickup: ${pickupTime} • Drop: ${dropTime}`
              : 'As per route schedule';

          const driverName = td.driverName || child.driverName || 'School Van Driver';
          const driverPhone = formatDriverPhone(td.driverPhone || child.driverPhone);

          const initials = getStudentInitials(child.studentName);
          const photoUrl = child.documents?.studentPhotoUrl || '';
          const sectionDisplay = isSectionApplicable(child.section) ? ` ${child.section}` : '';

          const requestCabMsg = `Namaste, I would like to request school cab facility for my child ${
            child.studentName || 'Student'
          } (${child.grade || ''}${sectionDisplay}, ${village}).`;
          const requestCabUrl = `https://wa.me/${TRANSPORT_HELPLINE_RAW}?text=${encodeURIComponent(
            requestCabMsg
          )}`;

          return (
            <article
              key={child._id || child.admissionNumber || idx}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-4"
            >
              {/* Card Header Bar (KES Navy & Gold Theme) */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={child.studentName}
                      className="w-10 h-10 rounded-full object-cover object-top border-2 border-white/80 bg-white flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white text-[#1A365D] font-bold text-xs flex items-center justify-center border-2 border-white/80 flex-shrink-0">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-white truncate">
                      {child.studentName}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#1A365D]/20 text-[11px] font-semibold text-white/95">
                      {child.grade}
                      {sectionDisplay}
                      {child.admissionNumber ? ` • ${child.admissionNumber}` : ''}
                    </span>
                  </div>
                </div>

                {hasCab ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex-shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CAB OPTED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-700/70 text-white text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    NOT OPTED
                  </span>
                )}
              </div>

              {/* Academic Year Info Callout Box */}
              <div className="mx-4 mt-3.5 p-3 rounded-xl bg-sky-50/90 border border-sky-200/70 text-xs text-slate-700 leading-relaxed">
                {language === 'kn' ? (
                  <span>
                    <strong>2026–2027</strong> ಶೈಕ್ಷಣಿಕ ವರ್ಷದ ನಿಮ್ಮ ಶಾಲಾ ವಾಹನದ ಮಾರ್ಗ ಮತ್ತು ನಿಲ್ದಾಣದ ವಿವರಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.
                  </span>
                ) : (
                  <span>
                    Please find below your transport route and stop details for the academic year{' '}
                    <strong>2026–2027</strong>.
                  </span>
                )}
              </div>

              {/* Conditional Body Rendering */}
              {hasCab ? (
                <div className="divide-y divide-slate-100 px-4 py-2 text-xs">
                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Route &amp; Stop</span>
                    <span className="text-slate-800 font-semibold text-right">{routeText}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Vehicle No</span>
                    <span className="text-slate-800 font-semibold text-right">{vehicleDisplay}</span>
                  </div>

                  <div className="py-2.5 flex items-start justify-between gap-3">
                    <span className="text-slate-500 font-medium flex-shrink-0">Timings</span>
                    <span className="text-slate-800 font-semibold text-right">{timingsText}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium flex-shrink-0">Driver</span>
                    <div className="flex items-center gap-2 min-w-0 justify-end flex-wrap">
                      <span className="text-slate-800 font-semibold truncate">
                        {driverName} • {driverPhone.display}
                      </span>
                      <a
                        href={driverPhone.href}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex-shrink-0"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Driver</span>
                      </a>
                    </div>
                  </div>

                  <div className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium flex-shrink-0">
                      Cab Fee Status
                    </span>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className="text-slate-800 font-semibold">
                        Paid: ₹{cabPaid.toLocaleString('en-IN')} / ₹{annualCabFee.toLocaleString('en-IN')}
                      </span>
                      {cabDue === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          Fully Paid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          Pending Due: ₹{cabDue.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3.5 text-xs font-medium text-slate-500 flex items-center justify-between gap-3 flex-wrap">
                  <span>Not available — School Cab Not Opted</span>
                  <a
                    href={requestCabUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#D97706] hover:text-[#1A365D] underline underline-offset-4 transition whitespace-nowrap"
                  >
                    Request Cab →
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Bottom Help Desk Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-slate-600">
          <div className="font-bold text-[#1A365D]">Need help with transport?</div>
          <div className="mt-0.5">
            Contact Transport In-charge:{' '}
            <span className="font-semibold text-slate-800">{TRANSPORT_HELPLINE_DISPLAY}</span>
          </div>
        </div>
        <a
          href={`tel:+${TRANSPORT_HELPLINE_RAW}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A365D] hover:bg-[#2B4C7E] text-white text-xs font-bold transition"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>Call Helpline</span>
        </a>
      </div>
    </div>
  );
}
