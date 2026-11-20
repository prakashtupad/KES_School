import React from 'react';
import { History, ShieldCheck, ArrowRight, UserCheck, Clock } from 'lucide-react';

const ACTION_BADGE_MAP = {
  INITIAL_PAYMENT: {
    label: 'INITIAL PAYMENT',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  INSTALLMENT_ADDED: {
    label: 'INSTALLMENT',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  AMOUNT_CORRECTED: {
    label: 'AMOUNT EDITED',
    className: 'bg-amber-100 text-red-800 border-amber-400',
  },
  TOTAL_FEE_UPDATED: {
    label: 'TOTAL FEE UPDATED',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

function formatAuditTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRoleLabel(role) {
  if (!role) return 'Admin';
  if (role === 'super_admin') return 'Super Admin';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Reusable chronological Payment & Edit History Log timeline/table (newest first).
 * Used inside AdmissionPaymentModal and StudentDirectoryDesk's Payment Audit Drawer.
 */
export default function PaymentAuditLogTimeline({ logs = [], compact = false }) {
  const sortedLogs = Array.isArray(logs)
    ? [...logs].sort(
        (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      )
    : [];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-[#1A365D]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A365D]">
            Payment &amp; Edit History Log
          </h4>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-600">
            {sortedLogs.length}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Immutable Audit Trail</span>
        </span>
      </div>

      {sortedLogs.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
          No payment or edit audit logs recorded yet for this student.
        </div>
      ) : (
        <div
          className={`space-y-2 ${
            compact ? 'max-h-56 overflow-y-auto pr-1' : 'max-h-[60vh] overflow-y-auto pr-1'
          }`}
        >
          {sortedLogs.map((entry, idx) => {
            const badge = ACTION_BADGE_MAP[entry.actionType] || {
              label: String(entry.actionType || 'UPDATED').replace(/_/g, ' '),
              className: 'bg-slate-100 text-slate-700 border-slate-300',
            };

            const prevPaid = Number(entry.previousPaidAmount || 0);
            const newPaid = Number(entry.newPaidAmount || 0);
            const delta =
              entry.deltaAmount !== undefined
                ? Number(entry.deltaAmount)
                : newPaid - prevPaid;
            const isNegative = delta < 0;
            const isPositive = delta > 0;

            const prevTotal =
              entry.previousTotalFee !== undefined ? Number(entry.previousTotalFee) : null;
            const newTotal =
              entry.newTotalFee !== undefined ? Number(entry.newTotalFee) : null;
            const totalChanged =
              prevTotal !== null && newTotal !== null && prevTotal !== newTotal;

            const editorName = entry.editedBy?.name || 'Admin Office';
            const editorRole = formatRoleLabel(entry.editedBy?.role);

            return (
              <div
                key={entry._id || `${entry.timestamp || idx}-${idx}`}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                  entry.actionType === 'AMOUNT_CORRECTED'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {entry.receiptNumber && (
                      <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {entry.receiptNumber}
                      </span>
                    )}
                    {entry.paymentMethod && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        • {String(entry.paymentMethod).replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatAuditTimestamp(entry.timestamp)}</span>
                  </span>
                </div>

                {/* Amount Before -> After & Delta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 flex-wrap">
                    <span className="text-slate-500">
                      ₹{prevPaid.toLocaleString('en-IN')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[#1A365D]">
                      ₹{newPaid.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isNegative
                          ? 'bg-red-100 text-red-700'
                          : isPositive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPositive ? '+' : isNegative ? '-' : ''}₹
                      {Math.abs(delta).toLocaleString('en-IN')}
                    </span>
                    {totalChanged && (
                      <span className="text-[10px] font-normal text-slate-500 ml-1">
                        (Total Fee: ₹{prevTotal.toLocaleString('en-IN')} → ₹
                        {newTotal.toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1A365D]">
                    <UserCheck className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>
                      {editorName} <span className="text-slate-400">({editorRole})</span>
                    </span>
                  </div>
                </div>

                {/* Reason / Remarks */}
                {entry.reason && (
                  <p className="text-[11px] text-slate-600 bg-slate-50/80 rounded-lg px-2.5 py-1.5 border border-slate-100 leading-relaxed">
                    <span className="font-bold text-slate-700">Reason: </span>
                    {entry.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
