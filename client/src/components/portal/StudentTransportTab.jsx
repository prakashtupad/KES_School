import React, { useState } from 'react';
import {
  Bus,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Car,
  Route,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentTransportTab({ student, onOpenFeesTab }) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  if (!student || !student.transportDetails?.optedIn) return null;

  const td = student.transportDetails || {};
  const fee = student.feeDetails || {};

  const cabNumber = td.cabNumber || 'KA-41-A-7684';
  const vehicleName = td.vehicleName || 'KES School Van 1';
  const vehicleImageUrl = td.vehicleImageUrl || '/school-cab.jpg';
  const driverName = td.driverName || t('studentPortal.transport.assignedByOffice');
  const driverPhoneRaw = String(td.driverPhone || '').replace(/\D/g, '');
  const driverPhoneDisplay =
    driverPhoneRaw.length === 10
      ? `+91 ${driverPhoneRaw.slice(0, 5)} ${driverPhoneRaw.slice(5)}`
      : driverPhoneRaw || '—';

  const routeName =
    td.routeName || student.transportRoute || 'Route 1: Khanatti – Mallapur – Mudalagi';
  const shortRouteLabel = routeName.includes(':')
    ? routeName.split(':')[0].trim()
    : 'Route 1';
  const pickupPoint =
    td.pickupPoint ||
    student.residentialAddress?.villageOrTown ||
    student.residentialVillage ||
    'Khanatti';
  const pickupTime = td.pickupTime || '07:45 AM';
  const dropTime = td.dropTime || '04:15 PM';

  // Extract midpoint village if route has multiple stops separated by "–" or "-"
  const routeParts = (routeName.includes(':') ? routeName.split(':')[1] : routeName)
    .split(/[–\-→,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const startStopLabel = routeParts[0] || pickupPoint;
  const midStopLabel = routeParts.length > 1 ? routeParts[1] : 'Main Road';

  const annualCabFee = Number(td.annualCabFee || fee.cabFeeAmount || 6000);
  const cabFeePaid = Math.min(
    annualCabFee,
    Number(td.cabFeePaid ?? fee.cabFeePaid ?? 0)
  );
  const cabFeeDue = Math.max(0, annualCabFee - cabFeePaid);
  const isCabPaid = cabFeeDue <= 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Page Title & Active Route Pill */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#1A365D] leading-tight">
            {t('studentPortal.transport.heading')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Home / Student Portal / {t('studentPortal.tabs.transport')}
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
          Active Route: {shortRouteLabel}
        </span>
      </div>

      {/* 1. Wide Horizontal Vehicle Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left: Real School Van Photo + School Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-amber-200 bg-amber-50 flex-shrink-0 shadow-xs">
              {!imgError ? (
                <img
                  src={vehicleImageUrl}
                  alt={`${vehicleName} (${cabNumber})`}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
                  <Bus className="w-12 h-12 text-[#D97706]" />
                  <span className="text-[11px] font-bold text-[#1A365D] mt-1">
                    {cabNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#1A365D] uppercase tracking-wide leading-snug">
                {t('common.schoolName')}
              </h3>

              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-amber-100/90 border border-[#D97706]/50 text-[#1A365D] font-mono font-extrabold text-xs sm:text-sm tracking-wider shadow-2xs">
                  {cabNumber}
                </span>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Status: Active Transport Opt-In</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live / Active Badge + Vehicle Specs */}
          <div className="flex flex-col md:items-end justify-between gap-2.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 self-start md:self-end px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('studentPortal.transport.activeService')}</span>
            </span>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-[#1A365D] flex-shrink-0" />
                <span>
                  Vehicle: <strong className="text-slate-800">{vehicleName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#1A365D] flex-shrink-0" />
                <span>
                  Capacity: <strong className="text-slate-800">14 Seater School Van</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  Safety: <strong className="text-slate-800">School Verified &amp; Monitored</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Two-Column Grid: Driver & Safety Contact + Route & Timing Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Left Card: Driver & Safety Contact */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1A365D]" />
                <h4 className="text-sm sm:text-base font-bold text-[#1A365D]">
                  {t('studentPortal.transport.driverDetails')}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>On Duty • {t('studentPortal.transport.verifiedDriver')}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Driver Avatar Badge */}
              <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-[#1A365D]/10 to-slate-100 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0 text-[#1A365D]">
                <div className="w-11 h-11 rounded-full bg-[#1A365D] text-[#D97706] flex items-center justify-center font-serif font-bold text-base shadow-xs">
                  {driverName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0].toUpperCase())
                    .join('') || 'DR'}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1.5">
                  Driver
                </span>
              </div>

              <div className="space-y-1 text-xs sm:text-sm min-w-0">
                <div className="font-bold text-[#1A365D] text-sm sm:text-base truncate">
                  Driver: {driverName}
                </div>
                <div className="text-slate-600 text-xs">
                  License Class: <strong className="text-slate-800">Commercial LMV</strong>
                </div>
                <div className="text-slate-600 text-xs">
                  Assigned Route: <strong className="text-slate-800">{shortRouteLabel}</strong>
                </div>
                <div className="text-slate-600 text-xs">
                  Contact Number:{' '}
                  <strong className="font-mono text-[#1A365D]">{driverPhoneDisplay}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Call & Message Driver Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {driverPhoneRaw.length >= 10 ? (
              <>
                <a
                  href={`tel:+91${driverPhoneRaw.slice(-10)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('studentPortal.transport.callDriver')}</span>
                </a>
                <a
                  href={`https://wa.me/91${driverPhoneRaw.slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Message Driver</span>
                </a>
              </>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Driver contact number will be updated by school office.
              </span>
            )}
          </div>
        </div>

        {/* Right Card: Route & Timing Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[#1A365D]" />
              <h4 className="text-sm sm:text-base font-bold text-[#1A365D]">
                {t('studentPortal.transport.routeAndTiming')}
              </h4>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="font-bold text-[#1A365D] text-sm sm:text-base">
                {routeName}
              </div>
              <div className="text-slate-600 text-xs">
                {t('studentPortal.transport.pickupStop')}:{' '}
                <strong className="text-slate-900">{pickupPoint}</strong>
              </div>
              <div className="text-slate-600 text-xs">
                {t('studentPortal.transport.morningPickup')}:{' '}
                <strong className="font-mono text-[#1A365D]">{pickupTime}</strong>
              </div>
              <div className="text-slate-600 text-xs">
                {t('studentPortal.transport.eveningDrop')}:{' '}
                <strong className="font-mono text-[#1A365D]">{dropTime}</strong>
              </div>
            </div>
          </div>

          {/* 3-Node Horizontal Route Timeline Strip */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
            <div className="relative flex items-center justify-between px-4">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-[#1A365D]/30" />
              <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#1A365D] ring-4 ring-[#1A365D]/15" />
              <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#D97706] ring-4 ring-[#D97706]/15" />
              <span className="relative z-10 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-600/15" />
            </div>

            <div className="flex items-center justify-between gap-1 text-[10.5px] sm:text-[11px] font-semibold text-slate-700 text-center">
              <span className="truncate max-w-[34%]">
                {startStopLabel} ({pickupTime})
              </span>
              <span className="text-slate-400">→</span>
              <span className="truncate max-w-[28%]">{midStopLabel}</span>
              <span className="text-slate-400">→</span>
              <span className="truncate max-w-[34%] text-[#1A365D] font-bold">
                School Campus
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Annual Cab Fee Banner */}
      <div
        className={`rounded-2xl border px-5 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isCabPaid
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-amber-50/70 border-amber-200'
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-base sm:text-lg font-bold text-[#1A365D]">
              {t('studentPortal.transport.cabFeeLabel')}: ₹
              {annualCabFee.toLocaleString('en-IN')}
            </span>

            {isCabPaid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('studentPortal.transport.cabFeePaid')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 border border-[#D97706]/40 text-amber-900 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                <span>
                  {t('studentPortal.transport.pendingDue')}: ₹
                  {cabFeeDue.toLocaleString('en-IN')}
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {isCabPaid
              ? t('studentPortal.transport.cabFeeHelper')
              : 'Due Date: Term-1 Clearance • Payable at School Office / Fee Ledger'}
          </p>
        </div>

        {onOpenFeesTab && (
          <button
            type="button"
            onClick={onOpenFeesTab}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D97706] hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer flex-shrink-0"
          >
            <span>
              {isCabPaid
                ? t('studentPortal.transport.viewFeeLedger')
                : 'Pay Cab Fee in Fee Ledger'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
