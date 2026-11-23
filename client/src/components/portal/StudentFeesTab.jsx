import React, { useState } from 'react';
import {
  IndianRupee,
  Printer,
  CheckCircle2,
  Clock,
  Receipt,
  CreditCard,
  Calendar,
  Bus,
} from 'lucide-react';
import PrintableFeeReceipt from './PrintableFeeReceipt';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentFeesTab({ student }) {
  const { t } = useLanguage();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (!student) return null;

  const fee = student.feeDetails || {};
  const amountPaid = Number(fee.amountPaid || 0);
  const admissionFeeAmount = Math.max(
    Number(fee.admissionFeeAmount || amountPaid || 10000),
    amountPaid
  );
  const balanceDue = Math.max(
    0,
    Number(fee.balanceDue ?? admissionFeeAmount - amountPaid)
  );
  const paymentStatus =
    amountPaid <= 0 ? 'Pending' : balanceDue > 0 ? 'Partial' : 'Paid';
  const hasPaidAny = amountPaid > 0;

  const hasCabOptIn =
    Boolean(student.transportDetails?.optedIn) || Number(fee.cabFeeAmount || 0) > 0;
  const annualCabFee = hasCabOptIn
    ? Math.max(0, Number(student.transportDetails?.annualCabFee ?? fee.cabFeeAmount ?? 0))
    : 0;
  const cabFeePaid = hasCabOptIn
    ? Math.min(
        annualCabFee,
        Number(student.transportDetails?.cabFeePaid ?? fee.cabFeePaid ?? 0)
      )
    : 0;
  const cabFeeDue = Math.max(0, annualCabFee - cabFeePaid);
  const tuitionFeeTotal = hasCabOptIn
    ? Math.max(0, Number(fee.tuitionFeeAmount || admissionFeeAmount - annualCabFee || 10000))
    : admissionFeeAmount;
  const tuitionFeePaid = Math.min(tuitionFeeTotal, Math.max(0, amountPaid - cabFeePaid));
  const tuitionFeeDue = Math.max(0, tuitionFeeTotal - tuitionFeePaid);
  const paidDateDisplay = fee.paidAt
    ? new Date(fee.paidAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const historyList =
    Array.isArray(fee.paymentHistory) && fee.paymentHistory.length > 0
      ? fee.paymentHistory
      : hasPaidAny
        ? [
            {
              receiptNumber: fee.receiptNumber || 'KES-REC-2026-0001',
              amountPaid,
              paymentMethod: fee.paymentMethod || 'Cash',
              transactionId: fee.transactionId || '—',
              paidAt: fee.paidAt || student.createdAt,
              remarks: fee.remarks || 'Admission & Registration Fee',
            },
          ]
        : [];

  return (
    <div className="space-y-5">
      {/* Top Fee Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#1A365D] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D97706]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D97706]/20 border border-[#D97706] flex items-center justify-center text-[#D97706]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                Academic Year {student.academicYear || '2026-2027'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {t('studentPortal.fees.heading')}
              </h3>
            </div>
          </div>

          {hasPaidAny && (
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {t('studentPortal.fees.printOfficialReceipt')} ({fee.receiptNumber || 'Receipt'})
              </span>
            </button>
          )}
        </div>

        {/* 4 Summary Metric Boxes */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {t('studentPortal.fees.totalFee')}
            </span>
            <div className="text-xl font-mono font-bold text-[#1A365D] mt-1">
              ₹{admissionFeeAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">
              {student.grade} ({student.academicYear || '2026-2027'})
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              {t('studentPortal.fees.totalPaid')}
            </span>
            <div className="text-xl font-mono font-bold text-emerald-700 mt-1">
              ₹{amountPaid.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700">
              {fee.receiptNumber ? `${t('studentPortal.fees.receiptNo')}: ${fee.receiptNumber}` : '—'}
            </span>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              balanceDue > 0
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
              {t('studentPortal.fees.balanceDue')}
            </span>
            <div
              className={`text-xl font-mono font-bold mt-1 ${
                balanceDue > 0 ? 'text-amber-900' : 'text-emerald-700'
              }`}
            >
              ₹{balanceDue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">
              {balanceDue > 0
                ? t('studentPortal.fees.payableAtDesk')
                : t('studentPortal.fees.completeCleared')}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {t('studentPortal.fees.paymentStatus')}
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {paymentStatus === 'Paid' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{paymentStatus}</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              Last Paid: {paidDateDisplay}
            </span>
          </div>
        </div>

        {/* Itemized Fee Breakdown (Tuition + ₹6,000 School Cab Fee) */}
        {hasCabOptIn && (
          <div className="px-5 pb-5">
            <div className="rounded-xl border border-[#D97706]/35 bg-amber-50/50 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A365D]">
                  <Bus className="w-4 h-4 text-[#D97706]" />
                  <span>{t('studentPortal.transport.itemizedFeeHeading')}</span>
                </span>
                {student.transportDetails?.cabNumber && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A365D] text-amber-300">
                    {student.transportDetails.cabNumber}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {t('studentPortal.transport.tuitionFeeLabel')}
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1A365D] mt-0.5">
                      ₹{tuitionFeeTotal.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Paid: ₹{tuitionFeePaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      tuitionFeeDue > 0
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {tuitionFeeDue > 0
                      ? `Due: ₹${tuitionFeeDue.toLocaleString('en-IN')}`
                      : 'Paid'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D97706]/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#D97706] block">
                      {t('studentPortal.transport.cabFeeLabel')}
                    </span>
                    <div className="font-mono font-bold text-sm text-[#1A365D] mt-0.5">
                      ₹{annualCabFee.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Paid: ₹{cabFeePaid.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      cabFeeDue > 0
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {cabFeeDue > 0
                      ? `${t('studentPortal.transport.pendingDue')}: ₹${cabFeeDue.toLocaleString('en-IN')}`
                      : t('studentPortal.transport.cabFeePaid')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment History & Receipt Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#1A365D]">
              Installment &amp; Receipt Transaction Ledger
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {historyList.length} Transaction{historyList.length === 1 ? '' : 's'}
          </span>
        </div>

        {historyList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-serif font-bold text-[#1A365D] text-sm">
              No Fee Receipts Recorded Yet
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Once fee payment is recorded at the Shri Siddharoodha English Medium School
              Office Desk, your official receipt and transaction details will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Mode / Reference</th>
                  <th className="py-3 px-4">Particulars / Remarks</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historyList.map((item, idx) => (
                  <tr key={item.receiptNumber || idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-[#1A365D]">
                      {item.receiptNumber || fee.receiptNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.paidAt
                            ? new Date(item.paidAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : paidDateDisplay}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {String(item.paymentMethod || 'Cash').replace('_', ' ')}
                      </span>
                      {item.transactionId && (
                        <span className="block text-[10px] font-mono text-slate-500">
                          Ref: {item.transactionId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.remarks || 'Admission & Registration Fee'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{Number(item.amountPaid || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setShowReceiptModal(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Official Fee Receipt Modal */}
      {showReceiptModal && (
        <PrintableFeeReceipt
          student={student}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
}
