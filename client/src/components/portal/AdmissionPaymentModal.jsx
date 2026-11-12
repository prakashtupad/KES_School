import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  IndianRupee,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PrintableFeeReceipt, { numberToIndianWords } from './PrintableFeeReceipt';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

const TOTAL_FEE_PRESETS = [500, 1500, 2500, 5000, 10000];
const INSTALLMENT_PRESETS = [500, 1000, 2000, 5000];

const isSectionApplicable = (sec) => {
  if (!sec) return false;
  const normalized = String(sec).trim().toUpperCase();
  return normalized !== 'N/A' && normalized !== 'NOT APPLICABLE' && normalized !== 'NONE';
};

export default function AdmissionPaymentModal({
  isOpen = true,
  student,
  onClose,
  onPaymentRecorded,
}) {
  const { token, user } = useAuth();

  const alreadyPaid = Number(student?.feeDetails?.amountPaid || 0);
  const isRemainingPayment = alreadyPaid > 0;

  const [totalFeeAmount, setTotalFeeAmount] = useState(500);
  const [payingNow, setPayingNow] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paidStudentRecord, setPaidStudentRecord] = useState(null);

  useEffect(() => {
    if (student) {
      const prevPaid = Number(student.feeDetails?.amountPaid || 0);
      const prevTotal = Number(student.feeDetails?.admissionFeeAmount || 500);
      const prevBalance = Math.max(0, prevTotal - prevPaid);

      if (prevPaid > 0) {
        // Student already made an initial payment; prepare for remaining fee collection
        const defaultNextPayment = prevBalance > 0 ? prevBalance : 500;
        const defaultTotal = prevBalance > 0 ? prevTotal : prevPaid + defaultNextPayment;
        setTotalFeeAmount(defaultTotal);
        setPayingNow(defaultNextPayment);
        setRemarks(
          `Remaining Fee Installment collected by ${user?.fullName || 'Office Admin'}`
        );
      } else {
        const initialTotal = prevTotal > 0 ? prevTotal : 500;
        setTotalFeeAmount(initialTotal);
        setPayingNow(initialTotal);
        setRemarks(
          `Collected by ${user?.fullName || 'Office Admin'} at Khanatti Admissions Desk`
        );
      }

      setPaymentMethod(
        student.feeDetails?.paymentMethod &&
          student.feeDetails.paymentMethod !== 'Not_Applicable'
          ? student.feeDetails.paymentMethod
          : 'Cash'
      );
      setTransactionId('');
      setErrorMsg('');
      setPaidStudentRecord(null);
    }
  }, [student, user]);

  if (!isOpen || !student) return null;

  // If fee has just been recorded in this session, immediately render the PrintableFeeReceipt dialog
  if (paidStudentRecord) {
    return (
      <PrintableFeeReceipt
        student={paidStudentRecord}
        onClose={() => {
          setPaidStudentRecord(null);
          if (onClose) onClose();
        }}
      />
    );
  }

  const numericPayingNow = Math.max(0, Number(payingNow) || 0);
  const cumulativePaidAfter = alreadyPaid + numericPayingNow;
  const effectiveTotalFee = Math.max(
    Number(totalFeeAmount) || 0,
    cumulativePaidAfter
  );
  const balanceBeforePayment = Math.max(0, effectiveTotalFee - alreadyPaid);
  const balanceAfterPayment = Math.max(0, effectiveTotalFee - cumulativePaidAfter);

  const handleTotalFeeChange = (val) => {
    const numTotal = Number(val);
    setTotalFeeAmount(val);
    if (!Number.isNaN(numTotal) && numTotal > alreadyPaid) {
      setPayingNow(numTotal - alreadyPaid);
    }
  };

  const handlePayingNowChange = (val) => {
    setPayingNow(val);
    const numPay = Number(val);
    if (!Number.isNaN(numPay) && alreadyPaid + numPay > Number(totalFeeAmount || 0)) {
      setTotalFeeAmount(alreadyPaid + numPay);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (Number.isNaN(numericPayingNow) || numericPayingNow <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/v1/payments/record-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: student._id,
          currentPaymentAmount: numericPayingNow,
          amountPaid: cumulativePaidAfter,
          admissionFeeAmount: effectiveTotalFee,
          isRemainingPayment,
          paymentMethod,
          transactionId:
            transactionId.trim() ||
            (paymentMethod === 'Cash'
              ? `CASH-${Date.now().toString().slice(-6)}`
              : `UPI-${Date.now().toString().slice(-8)}`),
          remarks:
            remarks.trim() ||
            (paymentMethod === 'Cash'
              ? 'Paid in Cash at Khanatti School Office Counter'
              : 'Paid via Online UPI / Gateway'),
        }),
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to record admission fee.');
      }

      const updatedStudent = data.student || {
        ...student,
        feeDetails: data.feeDetails,
      };

      if (onPaymentRecorded) {
        onPaymentRecorded(updatedStudent);
      }

      // Immediately switch to Official Printable Receipt view
      setPaidStudentRecord(updatedStudent);
    } catch (err) {
      setErrorMsg(err.message || 'Could not record fee payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateGatewayRef = () => {
    const generatedUtr = `UTR${Date.now().toString().slice(-9)}`;
    setTransactionId(generatedUtr);
  };

  const fatherName = student.father?.name || student.fatherName || '—';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Admission Fee Collection Desk"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top Navy Header */}
        <div className="bg-brand-navy text-white px-5 py-4 flex items-center justify-between border-b border-brand-gold/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold flex items-center justify-center text-brand-gold font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold block">
                {isRemainingPayment
                  ? 'Remaining / Balance Fee Collection Desk'
                  : 'Final Step • Fee Collection & Receipt Desk'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {isRemainingPayment
                  ? 'Collect Remaining Fee & Issue Receipt'
                  : 'Collect Admission Fee & Issue Receipt'}
              </h3>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close fee modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Student Summary Banner */}
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Student Name
            </span>
            <strong className="text-brand-navy truncate block">{student.studentName}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Admission No
            </span>
            <span className="font-mono font-bold text-brand-navy bg-brand-goldSoft px-1.5 py-0.5 rounded border border-brand-gold/40 inline-block">
              {student.admissionNumber}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Class
            </span>
            <strong className="text-slate-800">
              {student.grade}
              {isSectionApplicable(student.section) ? ` (${student.section})` : ''}
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Parent Phone
            </span>
            <strong className="font-mono text-slate-800">+91 {student.primaryPhone}</strong>
          </div>
        </div>

        {/* Previous Payment Banner (when collecting remaining fee) */}
        {isRemainingPayment && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
              <History className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Previously Paid: <strong className="font-mono">₹{alreadyPaid}</strong>
              </span>
              {student.feeDetails?.receiptNumber && (
                <span className="font-mono text-[11px] text-amber-700">
                  ({student.feeDetails.receiptNumber})
                </span>
              )}
            </div>
            <div className="font-mono text-[11px] font-bold text-brand-navy">
              Total After Payment: ₹{cumulativePaidAfter} / ₹{effectiveTotalFee}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleConfirmPayment} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Payment Method Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Select Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  paymentMethod === 'Cash'
                    ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    paymentMethod === 'Cash' ? 'text-brand-gold' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold">Cash / Counter</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      paymentMethod === 'Cash' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Manual cash book / slip entry
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Online_UPI')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  paymentMethod === 'Online_UPI'
                    ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    paymentMethod === 'Online_UPI' ? 'text-brand-gold' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold">Online UPI / Gateway</div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      paymentMethod === 'Online_UPI' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    PhonePe / GPay UTR or Gateway
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Total Fee & Current Installment / Remaining Amount Inputs */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total Agreed Fee */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="totalFeeInput"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-600"
                  >
                    Total Applicable Fee (₹)
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-slate-500 text-xs">
                    ₹
                  </span>
                  <input
                    id="totalFeeInput"
                    type="number"
                    min={Math.max(1, alreadyPaid)}
                    step="1"
                    required
                    value={totalFeeAmount}
                    onChange={(e) => handleTotalFeeChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sm text-slate-800 bg-white focus:border-brand-navy"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {TOTAL_FEE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleTotalFeeChange(preset)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        Number(totalFeeAmount) === preset
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paying Now */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="payingNowInput"
                    className="text-[11px] font-bold uppercase tracking-wider text-brand-navy"
                  >
                    {isRemainingPayment ? 'Remaining Paying Now (₹) *' : 'Amount Paying Now (₹) *'}
                  </label>
                  {balanceBeforePayment > 0 && Number(payingNow) !== balanceBeforePayment && (
                    <button
                      type="button"
                      onClick={() => setPayingNow(balanceBeforePayment)}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Full Due: ₹{balanceBeforePayment}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-emerald-700 text-xs">
                    ₹
                  </span>
                  <input
                    id="payingNowInput"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={payingNow}
                    onChange={(e) => handlePayingNowChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border-2 border-emerald-500 font-mono font-bold text-sm text-emerald-900 bg-white focus:border-emerald-600"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {INSTALLMENT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePayingNowChange(preset)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        Number(payingNow) === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Balance Summary Strip */}
            <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600">
                In Words: <strong className="text-brand-navy">{numberToIndianWords(numericPayingNow)}</strong>
              </div>
              <div>
                {balanceAfterPayment > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[11px]">
                    Remaining Balance Due: ₹{balanceAfterPayment}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold text-[11px]">
                    ✓ Full Fee Cleared (Balance: ₹0)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Voucher / Transaction Reference */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="txnRefInput"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                {paymentMethod === 'Cash'
                  ? '3. Cash Voucher / Receipt Book Ref'
                  : '3. UPI Transaction UTR / Gateway Ref ID'}
              </label>
              {paymentMethod === 'Online_UPI' && (
                <button
                  type="button"
                  onClick={handleSimulateGatewayRef}
                  className="text-[11px] font-bold text-brand-navy hover:text-brand-gold underline cursor-pointer"
                >
                  + Auto-Generate Gateway UTR
                </button>
              )}
            </div>
            <input
              id="txnRefInput"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={
                paymentMethod === 'Cash'
                  ? 'e.g. CASH-VOUCHER-104 (Auto-generated if blank)'
                  : 'e.g. 431289401289 / pay_Pn82kL91'
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-mono"
            />
          </div>

          {/* 4. Cashier / Remarks */}
          <div>
            <label
              htmlFor="feeRemarksInput"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1"
            >
              4. Cashier / Office Remarks
            </label>
            <input
              id="feeRemarksInput"
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Admission & Registration Fee for AY 2026-27"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm"
            />
            <span className="block text-[10px] text-slate-400 mt-1">
              Parent: {fatherName} • Sequential Receipt Format: <code>KES-REC-2026-XXXX</code>
            </span>
          </div>

          {/* Submit & Secondary Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => printStudentAdmissionSummary(student)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition w-full sm:w-auto cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-brand-navy" />
                <span>Print Admission Summary</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold transition w-full sm:w-auto cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Generating Receipt...'
                  : 'Confirm & Generate Official Receipt'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
