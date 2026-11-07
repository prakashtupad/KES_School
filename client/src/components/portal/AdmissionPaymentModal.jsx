import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Banknote,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X,
  Printer,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PrintableFeeReceipt, { numberToIndianWords } from './PrintableFeeReceipt';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

const FEE_PRESETS = [500, 1000, 1500, 2500];

export default function AdmissionPaymentModal({
  isOpen = true,
  student,
  onClose,
  onPaymentRecorded,
}) {
  const { token, user } = useAuth();

  const [amountPaid, setAmountPaid] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paidStudentRecord, setPaidStudentRecord] = useState(null);

  useEffect(() => {
    if (student) {
      const existingFee = Number(student.feeDetails?.amountPaid || student.feeDetails?.admissionFeeAmount || 500);
      setAmountPaid(existingFee > 0 ? existingFee : 500);
      setPaymentMethod(
        student.feeDetails?.paymentMethod && student.feeDetails.paymentMethod !== 'Not_Applicable'
          ? student.feeDetails.paymentMethod
          : 'Cash'
      );
      setTransactionId(student.feeDetails?.transactionId || '');
      setRemarks(
        student.feeDetails?.remarks ||
          `Collected by ${user?.fullName || 'Office Admin'} at Khanatti Admissions Desk`
      );
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

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = Number(amountPaid);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid fee amount greater than ₹0.');
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
          amountPaid: numericAmount,
          admissionFeeAmount: numericAmount,
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
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
                Final Step • Fee Collection &amp; Receipt Desk
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                Collect Admission Fee &amp; Issue Receipt
              </h3>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
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
              Class &amp; Sec
            </span>
            <strong className="text-slate-800">
              {student.grade} ({student.section || 'A'})
            </strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Parent Phone
            </span>
            <strong className="font-mono text-slate-800">+91 {student.primaryPhone}</strong>
          </div>
        </div>

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

          {/* 2. Fee Amount Input + Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admissionFeeInput"
                className="text-xs font-bold uppercase tracking-wider text-slate-600"
              >
                2. Admission &amp; Registration Fee Amount (₹) *
              </label>
              <div className="flex items-center gap-1.5">
                {FEE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountPaid(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition cursor-pointer ${
                      Number(amountPaid) === preset
                        ? 'bg-brand-gold text-white border-brand-gold'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-mono font-bold text-slate-500 text-sm">
                ₹
              </span>
              <input
                id="admissionFeeInput"
                type="number"
                min="1"
                step="1"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 font-mono font-bold text-base text-brand-navy focus:border-brand-navy"
              />
            </div>
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mt-1.5 font-medium">
              In Words: <strong>{numberToIndianWords(amountPaid)}</strong>
            </p>
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
                  Collect Later
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
}
