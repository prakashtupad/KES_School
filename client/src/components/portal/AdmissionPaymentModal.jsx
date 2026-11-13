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
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PrintableFeeReceipt, { numberToIndianWords } from './PrintableFeeReceipt';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

const TOTAL_FEE_PRESETS = [5000, 10000, 15000, 20000];
const INSTALLMENT_PRESETS = [2000, 5000, 7500, 10000];

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

  const existingPaid = Number(student?.feeDetails?.amountPaid || 0);
  const existingTotal = Number(student?.feeDetails?.admissionFeeAmount || 10000);
  const existingBalance = Math.max(
    0,
    Number(student?.feeDetails?.balanceDue ?? existingTotal - existingPaid)
  );

  // Determine whether this student already has a prior payment and is paying remaining balance
  const hasPreviousPayment = existingPaid > 0;

  // 'remaining' = add this installment to existingPaid; 'fresh' = set/override from scratch
  const [collectionMode, setCollectionMode] = useState('remaining');
  const [totalFeeAmount, setTotalFeeAmount] = useState(10000);
  const [payingNow, setPayingNow] = useState(5000);
  const [clearFullPayment, setClearFullPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paidStudentRecord, setPaidStudentRecord] = useState(null);

  useEffect(() => {
    if (student) {
      const prevPaid = Number(student.feeDetails?.amountPaid || 0);
      const rawPrevTotal = Number(student.feeDetails?.admissionFeeAmount || 0);
      // Default total applicable fee to 10000 when registering a new student (or if previously 0/500 default)
      const resolvedTotal =
        prevPaid === 0
          ? rawPrevTotal > 500
            ? rawPrevTotal
            : 10000
          : Math.max(rawPrevTotal, prevPaid);
      const prevBalance = Math.max(0, resolvedTotal - prevPaid);

      if (prevPaid > 0 && prevBalance > 0) {
        // Student has a partial payment and a remaining balance due
        setCollectionMode('remaining');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(prevBalance);
        setClearFullPayment(true);
        setRemarks(
          `Remaining Fee Installment collected by ${user?.fullName || 'Office Admin'}`
        );
      } else if (prevPaid > 0 && prevBalance === 0) {
        // Student already cleared full fee; open in override/correction mode or additional fee mode
        setCollectionMode('fresh');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(Math.round(resolvedTotal / 2));
        setClearFullPayment(false);
        setRemarks(
          `Updated Fee Receipt recorded by ${user?.fullName || 'Office Admin'}`
        );
      } else {
        // Brand new registration / Pending fee: Total = 10000, Paying Now = 5000 (50% default)
        setCollectionMode('fresh');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(Math.round(resolvedTotal / 2));
        setClearFullPayment(false);
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

  const isRemainingMode = hasPreviousPayment && collectionMode === 'remaining';
  const baseAlreadyPaid = isRemainingMode ? existingPaid : 0;

  const numericTotalFee = Math.max(0, Number(totalFeeAmount) || 0);
  const numericPayingNow = Math.max(0, Number(payingNow) || 0);
  const maxPayableNow = Math.max(0, numericTotalFee - baseAlreadyPaid);

  const cumulativePaidAfter = baseAlreadyPaid + numericPayingNow;
  const effectiveTotalFee = Math.max(numericTotalFee, cumulativePaidAfter);
  const balanceAfterPayment = Math.max(0, effectiveTotalFee - cumulativePaidAfter);

  /**
   * When Admin enters/changes Total Applicable Fee (₹):
   * - On new registration / fresh mode (baseAlreadyPaid === 0):
   *   - If "Clear Complete Payment" is checked, set Paying Now = 100% of Total Fee.
   *   - Otherwise automatically populate Paying Now = 50% of Total Fee (e.g., 10000 -> 5000)!
   * - On remaining payment mode (baseAlreadyPaid > 0):
   *   - Automatically populate Paying Now = remaining balance (Total Fee - Already Paid).
   */
  const handleTotalFeeChange = (val) => {
    setTotalFeeAmount(val);
    setErrorMsg('');
    const numTotal = Number(val);
    if (Number.isNaN(numTotal) || numTotal <= 0) {
      setPayingNow(0);
      return;
    }

    if (isRemainingMode) {
      const rem = Math.max(0, numTotal - baseAlreadyPaid);
      setPayingNow(rem);
      setClearFullPayment(true);
    } else {
      if (clearFullPayment) {
        setPayingNow(numTotal);
      } else {
        setPayingNow(Math.round(numTotal / 2));
      }
    }
  };

  /**
   * When Admin edits "Remaining Paying Now (₹) *":
   * - Keep Total Applicable Fee untouched unless the user explicitly enters more than Total Fee
   * - Automatically update the "Clear Complete Payment" checkbox state to reflect whether full balance is being cleared
   */
  const handlePayingNowChange = (val) => {
    setPayingNow(val);
    setErrorMsg('');
    const numPay = Number(val);
    if (!Number.isNaN(numPay)) {
      const targetFull = Math.max(0, numericTotalFee - baseAlreadyPaid);
      setClearFullPayment(numPay >= targetFull && targetFull > 0);
    }
  };

  /**
   * Toggle "Clear Complete Payment" inside the form
   */
  const handleToggleClearFullPayment = (checked) => {
    setClearFullPayment(checked);
    setErrorMsg('');
    const targetFull = Math.max(0, numericTotalFee - baseAlreadyPaid);
    if (checked) {
      // Populate the entire payable amount so Remaining Balance Due becomes ₹0
      setPayingNow(targetFull);
    } else {
      // Populate 50% installment
      setPayingNow(
        isRemainingMode ? Math.round(targetFull / 2) : Math.round(numericTotalFee / 2)
      );
    }
  };

  const handleSwitchCollectionMode = (mode) => {
    setCollectionMode(mode);
    setErrorMsg('');
    if (mode === 'remaining') {
      const rem = Math.max(0, numericTotalFee - existingPaid);
      setPayingNow(rem > 0 ? rem : 0);
      setClearFullPayment(true);
    } else {
      const defaultTotal = numericTotalFee > 0 ? numericTotalFee : 10000;
      setTotalFeeAmount(defaultTotal);
      setPayingNow(Math.round(defaultTotal / 2));
      setClearFullPayment(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (Number.isNaN(numericPayingNow) || numericPayingNow <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (numericTotalFee <= 0) {
      setErrorMsg('Please enter a valid Total Applicable Fee greater than ₹0.');
      return;
    }

    if (baseAlreadyPaid + numericPayingNow > numericTotalFee) {
      setErrorMsg(
        `Payment amount (₹${numericPayingNow.toLocaleString('en-IN')}) cannot exceed the remaining balance due (₹${maxPayableNow.toLocaleString('en-IN')}). Please increase Total Applicable Fee first if needed.`
      );
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
          isRemainingPayment: isRemainingMode,
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
                {isRemainingMode
                  ? 'Remaining / Balance Fee Collection Desk'
                  : 'Final Step • Fee Collection & Receipt Desk'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {isRemainingMode
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
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
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

        {/* Previous Payment Banner (when student already has a payment recorded) */}
        {hasPreviousPayment && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
              <History className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span>
                Previously Paid:{' '}
                <strong className="font-mono">
                  ₹{existingPaid.toLocaleString('en-IN')}
                </strong>{' '}
                / ₹{existingTotal.toLocaleString('en-IN')}
              </span>
              { existingBalance > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-mono font-bold text-[10px]">
                  Due: ₹{existingBalance.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {existingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => handleSwitchCollectionMode('remaining')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                    collectionMode === 'remaining'
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Collect Remaining
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSwitchCollectionMode('fresh')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                  collectionMode === 'fresh'
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
                title="Reset and enter Total Fee & Paid Amount from scratch"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset / Edit Fee</span>
              </button>
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

          {/* 2. Total Fee & Remaining Paying Now Inputs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Total Applicable Fee (₹) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="totalFeeInput"
                    className="text-[11px] font-bold uppercase tracking-wider text-slate-700"
                  >
                    Total Applicable Fee (₹) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Annual / Course Fee
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-slate-500 text-xs">
                    ₹
                  </span>
                  <input
                    id="totalFeeInput"
                    type="number"
                    min={Math.max(1, baseAlreadyPaid)}
                    step="1"
                    required
                    value={totalFeeAmount}
                    onChange={(e) => handleTotalFeeChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sm text-slate-900 bg-white focus:border-brand-navy"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {TOTAL_FEE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleTotalFeeChange(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        Number(totalFeeAmount) === preset
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remaining Paying Now (₹) * */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="payingNowInput"
                    className="text-[11px] font-bold uppercase tracking-wider text-brand-navy"
                  >
                    Remaining Paying Now (₹) *
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Editable Installment
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-mono font-bold text-emerald-700 text-xs">
                    ₹
                  </span>
                  <input
                    id="payingNowInput"
                    type="number"
                    min="1"
                    max={maxPayableNow > 0 ? maxPayableNow : undefined}
                    step="1"
                    required
                    value={payingNow}
                    onChange={(e) => handlePayingNowChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border-2 border-emerald-500 font-mono font-bold text-sm text-emerald-950 bg-white focus:border-emerald-600"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {!isRemainingMode && numericTotalFee > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setClearFullPayment(false);
                        setPayingNow(Math.round(numericTotalFee / 2));
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        Number(payingNow) === Math.round(numericTotalFee / 2)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      50% (₹{Math.round(numericTotalFee / 2).toLocaleString('en-IN')})
                    </button>
                  )}
                  {INSTALLMENT_PRESETS.filter((p) => p <= maxPayableNow).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePayingNowChange(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        Number(payingNow) === preset
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Option to Clear Complete Payment Inside Form */}
            <div className="p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950">
                <input
                  type="checkbox"
                  checked={clearFullPayment || (maxPayableNow > 0 && numericPayingNow === maxPayableNow)}
                  onChange={(e) => handleToggleClearFullPayment(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <span>
                  {isRemainingMode
                    ? `Clear Complete Remaining Payment (₹${maxPayableNow.toLocaleString('en-IN')})`
                    : `Clear Complete Payment Now (Full ₹${numericTotalFee.toLocaleString('en-IN')})`}
                </span>
              </label>

              {numericPayingNow < maxPayableNow && (
                <button
                  type="button"
                  onClick={() => handleToggleClearFullPayment(true)}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer self-start sm:self-auto"
                >
                  Pay Full ₹{maxPayableNow.toLocaleString('en-IN')}
                </button>
              )}
            </div>

            {/* Live Breakdown Summary Strip */}
            <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600">
                In Words:{' '}
                <strong className="text-brand-navy">
                  {numberToIndianWords(numericPayingNow)}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                {balanceAfterPayment > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[11px]">
                    Remaining Balance Due: ₹{balanceAfterPayment.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold text-[11px]">
                    ✓ Complete Fee Cleared (Balance: ₹0)
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
