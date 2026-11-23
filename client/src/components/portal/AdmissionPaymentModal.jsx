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
  PencilLine,
  ShieldAlert,
  Bus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PrintableFeeReceipt, { numberToIndianWords } from './PrintableFeeReceipt';
import PaymentAuditLogTimeline from './PaymentAuditLogTimeline';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';

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
  const [activeStudent, setActiveStudent] = useState(student);
  const [editingTuitionFee, setEditingTuitionFee] = useState(false);
  const [tuitionFeeDraft, setTuitionFeeDraft] = useState('');
  const [savingTuitionFee, setSavingTuitionFee] = useState(false);
  const [editingCabFee, setEditingCabFee] = useState(false);
  const [cabFeeDraft, setCabFeeDraft] = useState('');
  const [savingCabFee, setSavingCabFee] = useState(false);

  const curStudent = activeStudent || student;

  const existingPaid = Number(curStudent?.feeDetails?.amountPaid || 0);
  const existingTotal = Number(curStudent?.feeDetails?.admissionFeeAmount || 10000);
  const existingBalance = Math.max(
    0,
    Number(curStudent?.feeDetails?.balanceDue ?? existingTotal - existingPaid)
  );

  const hasPreviousPayment = existingPaid > 0;

  // Modes:
  // - 'initial'   : Brand new student (existingPaid === 0) -> POST /record-fee
  // - 'remaining' : Add new installment on top of existingPaid -> POST /record-fee
  // - 'correct'   : Edit/Correct previously recorded paid amount or total fee -> PUT /correct-fee/:studentId
  const [collectionMode, setCollectionMode] = useState('initial');
  const [totalFeeAmount, setTotalFeeAmount] = useState(10000);
  const [payingNow, setPayingNow] = useState(5000);
  const [clearFullPayment, setClearFullPayment] = useState(false);

  // Correction mode fields
  const [correctedTotalFee, setCorrectedTotalFee] = useState(10000);
  const [correctedPaidAmount, setCorrectedPaidAmount] = useState(0);
  const [correctionReason, setCorrectionReason] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentCategory, setPaymentCategory] = useState('ALL_COMBINED');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paidStudentRecord, setPaidStudentRecord] = useState(null);

  useEffect(() => {
    setActiveStudent(student);
    setEditingTuitionFee(false);
    setEditingCabFee(false);
    if (student) {
      const currentCab = Number(
        student.transportDetails?.annualCabFee ?? student.feeDetails?.cabFeeAmount ?? 0
      );
      setCabFeeDraft(currentCab > 0 ? String(currentCab) : '');
      const currentTuition =
        Number(student.feeDetails?.tuitionFeeAmount) > 0
          ? Number(student.feeDetails.tuitionFeeAmount)
          : Math.max(0, Number(student.feeDetails?.admissionFeeAmount || 10000) - currentCab) || 10000;
      setTuitionFeeDraft(String(currentTuition));
      const prevPaid = Number(student.feeDetails?.amountPaid || 0);
      const rawPrevTotal = Number(student.feeDetails?.admissionFeeAmount || 0);
      const resolvedTotal =
        prevPaid === 0
          ? rawPrevTotal > 500
            ? rawPrevTotal
            : 10000
          : Math.max(rawPrevTotal, prevPaid);
      const prevBalance = Math.max(0, resolvedTotal - prevPaid);

      setCorrectedTotalFee(resolvedTotal);
      setCorrectedPaidAmount(prevPaid);
      setCorrectionReason('');

      if (prevPaid > 0 && prevBalance > 0) {
        setCollectionMode('remaining');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(prevBalance);
        setClearFullPayment(true);
        setRemarks(
          `Remaining Fee Installment collected by ${user?.fullName || 'Office Admin'}`
        );
      } else if (prevPaid > 0 && prevBalance === 0) {
        // Already fully paid -> open directly in Edit / Correct Previous Amount mode
        setCollectionMode('correct');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(0);
        setClearFullPayment(false);
        setRemarks('');
      } else {
        // Brand new registration / Pending fee
        setCollectionMode('initial');
        setTotalFeeAmount(resolvedTotal);
        setPayingNow(Math.round(resolvedTotal / 2));
        setClearFullPayment(false);
        setRemarks(
          `Collected by ${user?.fullName || 'Office Admin'} at Khanatti Admissions Desk`
        );
      }

      setPaymentMethod(
        student.feeDetails?.paymentMethod &&
          student.feeDetails.paymentMethod !== 'Not_Applicable' &&
          student.feeDetails.paymentMethod !== 'Adjustment'
          ? student.feeDetails.paymentMethod
          : 'Cash'
      );
      setPaymentCategory('ALL_COMBINED');
      setTransactionId(
        prevPaid > 0 && prevBalance === 0 ? student.feeDetails?.transactionId || '' : ''
      );
      setErrorMsg('');
      setPaidStudentRecord(null);
    }
  }, [student, user]);

  if (!isOpen || !student) return null;

  // Immediately render the PrintableFeeReceipt dialog after recording or correcting a non-zero payment
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

  const isCorrectionMode = hasPreviousPayment && collectionMode === 'correct';
  const isRemainingMode = hasPreviousPayment && collectionMode === 'remaining';
  const baseAlreadyPaid = isRemainingMode ? existingPaid : 0;

  // School Cab Transport Fee Breakdown (variable distance-based fee — no hardcoded 6000)
  const hasCabOptIn =
    Boolean(curStudent.transportDetails?.optedIn) ||
    Number(curStudent.feeDetails?.cabFeeAmount || 0) > 0;
  const annualCabFee = hasCabOptIn
    ? Math.max(
        0,
        Number(curStudent.transportDetails?.annualCabFee ?? curStudent.feeDetails?.cabFeeAmount ?? 0)
      )
    : 0;
  const cabFeePaid = hasCabOptIn
    ? Math.min(
        annualCabFee,
        Number(curStudent.transportDetails?.cabFeePaid ?? curStudent.feeDetails?.cabFeePaid ?? 0)
      )
    : 0;
  const cabFeeDue = Math.max(0, annualCabFee - cabFeePaid);
  const tuitionFeeTotal = hasCabOptIn
    ? Math.max(
        0,
        Number(curStudent.feeDetails?.tuitionFeeAmount || existingTotal - annualCabFee || 10000)
      )
    : existingTotal;
  const tuitionFeePaid = Math.min(tuitionFeeTotal, Math.max(0, existingPaid - cabFeePaid));
  const tuitionFeeDue = Math.max(0, tuitionFeeTotal - tuitionFeePaid);

  const handleSaveInlineTuitionFee = async () => {
    const parsedTuition = Math.max(0, Number(tuitionFeeDraft) || 0);
    setSavingTuitionFee(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/v1/students/${curStudent._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tuitionFeeAmount: parsedTuition,
          transportDetails: {
            ...(curStudent.transportDetails || {}),
            optedIn: hasCabOptIn,
            annualCabFee,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to update School Tuition Fee.');
      }
      const updated = data.student || data.data;
      if (updated) {
        setActiveStudent(updated);
        const newTotal = Number(updated.feeDetails?.admissionFeeAmount || parsedTuition + annualCabFee);
        const newPaid = Number(updated.feeDetails?.amountPaid || 0);
        const newBal = Math.max(0, newTotal - newPaid);
        setTotalFeeAmount(newTotal);
        setCorrectedTotalFee(newTotal);
        if (newPaid > 0 && newBal > 0) {
          setCollectionMode('remaining');
          setPayingNow(newBal);
          setClearFullPayment(true);
        } else if (newPaid === 0) {
          setCollectionMode('initial');
          setPayingNow(Math.round(newTotal / 2));
        }
        if (onPaymentRecorded) {
          onPaymentRecorded(updated, { isCorrection: false });
        }
      }
      setEditingTuitionFee(false);
    } catch (err) {
      setErrorMsg(err.message || 'Could not update School Tuition Fee.');
    } finally {
      setSavingTuitionFee(false);
    }
  };

  const handleSaveInlineCabFee = async () => {
    const parsed = Math.max(0, Number(cabFeeDraft) || 0);
    setSavingCabFee(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/v1/students/${curStudent._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transportDetails: {
            ...(curStudent.transportDetails || {}),
            optedIn: true,
            annualCabFee: parsed,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to update Annual Cab Fee.');
      }
      const updated = data.student || data.data;
      if (updated) {
        setActiveStudent(updated);
        const newTotal = Number(updated.feeDetails?.admissionFeeAmount || tuitionFeeTotal + parsed);
        const newPaid = Number(updated.feeDetails?.amountPaid || 0);
        const newBal = Math.max(0, newTotal - newPaid);
        setTotalFeeAmount(newTotal);
        setCorrectedTotalFee(newTotal);
        if (newPaid > 0 && newBal > 0) {
          setCollectionMode('remaining');
          setPayingNow(newBal);
          setClearFullPayment(true);
        } else if (newPaid === 0) {
          setCollectionMode('initial');
          setPayingNow(Math.round(newTotal / 2));
        }
        if (onPaymentRecorded) {
          onPaymentRecorded(updated, { isCorrection: false });
        }
      }
      setEditingCabFee(false);
    } catch (err) {
      setErrorMsg(err.message || 'Could not update Annual Cab Fee.');
    } finally {
      setSavingCabFee(false);
    }
  };

  const handleSelectPaymentCategory = (cat) => {
    setPaymentCategory(cat);
    setErrorMsg('');
    if (cat === 'CAB_FEE') {
      const target = Math.min(maxPayableNow, cabFeeDue);
      setPayingNow(target);
      setClearFullPayment(target >= maxPayableNow && maxPayableNow > 0);
      setRemarks(
        `School Cab Facility Fee (₹${annualCabFee.toLocaleString('en-IN')}) collected by ${user?.fullName || 'Office Admin'}`
      );
    } else if (cat === 'TUITION_FEE') {
      const target = Math.min(maxPayableNow, tuitionFeeDue);
      setPayingNow(target);
      setClearFullPayment(target >= maxPayableNow && maxPayableNow > 0);
      setRemarks(
        `Tuition Fee Installment collected by ${user?.fullName || 'Office Admin'}`
      );
    } else {
      setPayingNow(maxPayableNow);
      setClearFullPayment(true);
      setRemarks(
        `Combined Tuition & School Cab Fee collected by ${user?.fullName || 'Office Admin'}`
      );
    }
  };

  // Calculations for Collect / Installment mode
  const numericTotalFee = Math.max(0, Number(totalFeeAmount) || 0);
  const numericPayingNow = Math.max(0, Number(payingNow) || 0);
  const maxPayableNow = Math.max(0, numericTotalFee - baseAlreadyPaid);
  const cumulativePaidAfter = baseAlreadyPaid + numericPayingNow;
  const effectiveTotalFee = Math.max(numericTotalFee, cumulativePaidAfter);
  const balanceAfterPayment = Math.max(0, effectiveTotalFee - cumulativePaidAfter);

  // Calculations for Edit / Correct Previous Amount mode
  const numericCorrectedTotal = Math.max(0, Number(correctedTotalFee) || 0);
  const numericCorrectedPaid = Math.max(0, Number(correctedPaidAmount) || 0);
  const correctionDelta = numericCorrectedPaid - existingPaid;
  const correctedBalanceDue = Math.max(0, numericCorrectedTotal - numericCorrectedPaid);

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
    } else if (clearFullPayment) {
      setPayingNow(numTotal);
    } else {
      setPayingNow(Math.round(numTotal / 2));
    }
  };

  const handlePayingNowChange = (val) => {
    setPayingNow(val);
    setErrorMsg('');
    const numPay = Number(val);
    if (!Number.isNaN(numPay)) {
      const targetFull = Math.max(0, numericTotalFee - baseAlreadyPaid);
      setClearFullPayment(numPay >= targetFull && targetFull > 0);
    }
  };

  const handleToggleClearFullPayment = (checked) => {
    setClearFullPayment(checked);
    setErrorMsg('');
    const targetFull = Math.max(0, numericTotalFee - baseAlreadyPaid);
    if (checked) {
      setPayingNow(targetFull);
    } else {
      setPayingNow(
        isRemainingMode ? Math.round(targetFull / 2) : Math.round(numericTotalFee / 2)
      );
    }
  };

  const handleSwitchMode = (mode) => {
    setCollectionMode(mode);
    setErrorMsg('');
    if (mode === 'remaining') {
      const rem = Math.max(0, existingTotal - existingPaid);
      setTotalFeeAmount(existingTotal);
      setPayingNow(rem > 0 ? rem : 0);
      setClearFullPayment(true);
      setTransactionId('');
      setRemarks(
        `Remaining Fee Installment collected by ${user?.fullName || 'Office Admin'}`
      );
    } else if (mode === 'correct') {
      setCorrectedTotalFee(existingTotal);
      setCorrectedPaidAmount(existingPaid);
      setCorrectionReason('');
      setTransactionId(student.feeDetails?.transactionId || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Branch A: Edit / Correct Previous Amount -> PUT /api/v1/payments/correct-fee/:studentId
    if (isCorrectionMode) {
      if (Number.isNaN(Number(correctedTotalFee)) || Number(correctedTotalFee) < 0) {
        setErrorMsg('Please enter a valid Corrected Total Fee (₹0 or more).');
        return;
      }
      if (
        Number.isNaN(Number(correctedPaidAmount)) ||
        Number(correctedPaidAmount) < 0 ||
        Number(correctedPaidAmount) > numericCorrectedTotal
      ) {
        setErrorMsg(
          `Corrected Paid Amount must be between ₹0 and Total Fee (₹${numericCorrectedTotal.toLocaleString('en-IN')}).`
        );
        return;
      }
      if (correctionReason.trim().length < 5) {
        setErrorMsg(
          'Please enter a clear correction reason (at least 5 characters) for the audit log.'
        );
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch(`/api/v1/payments/correct-fee/${student._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            correctedTotalFee: numericCorrectedTotal,
            correctedPaidAmount: numericCorrectedPaid,
            paymentMethod,
            transactionId: transactionId.trim(),
            correctionReason: correctionReason.trim(),
          }),
        });

        const rawText = await response.text();
        const data = rawText ? JSON.parse(rawText) : {};

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to save fee correction.');
        }

        const updatedStudent = data.student || {
          ...student,
          feeDetails: data.feeDetails,
        };

        if (onPaymentRecorded) {
          onPaymentRecorded(updatedStudent, { isCorrection: true });
        }

        if (Number(updatedStudent.feeDetails?.amountPaid || 0) > 0) {
          setPaidStudentRecord(updatedStudent);
        } else if (onClose) {
          onClose();
        }
      } catch (err) {
        setErrorMsg(err.message || 'Could not save corrected amount. Please try again.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Branch B: Collect Initial Payment or Remaining Installment -> POST /api/v1/payments/record-fee
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
          paymentCategory: hasCabOptIn ? paymentCategory : 'ALL_COMBINED',
          annualCabFee: hasCabOptIn ? annualCabFee : 0,
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
        onPaymentRecorded(updatedStudent, { isCorrection: false });
      }

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
  const auditLogs = Array.isArray(student.feeDetails?.paymentLogs)
    ? student.feeDetails.paymentLogs
    : [];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Admission Fee Collection Desk"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Navy Header */}
        <div className="bg-[#1A365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#D97706]/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D97706]/20 border border-[#D97706] flex items-center justify-center text-[#D97706] font-bold">
              {isCorrectionMode ? (
                <PencilLine className="w-5 h-5" />
              ) : (
                <IndianRupee className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                {isCorrectionMode
                  ? 'Audit-Logged Fee Amount Correction'
                  : isRemainingMode
                    ? 'Remaining / Installment Fee Collection Desk'
                    : 'Final Step • Fee Collection & Receipt Desk'}
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold">
                {isCorrectionMode
                  ? 'Edit / Correct Previous Paid Amount'
                  : isRemainingMode
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Student Summary Banner */}
          <div className="bg-[#F8FAFC] px-5 py-3 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Student Name
              </span>
              <strong className="text-[#1A365D] truncate block">{student.studentName}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Admission No
              </span>
              <span className="font-mono font-bold text-[#1A365D] bg-amber-50 px-1.5 py-0.5 rounded border border-[#D97706]/40 inline-block">
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

          {/* Simple Additive Fee Breakdown: Tuition + School Cab = Grand Total */}
          {hasCabOptIn && (
            <div className="px-5 py-3.5 bg-amber-50/60 border-b border-[#D97706]/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#1A365D]">
                  <Bus className="w-4 h-4 text-[#D97706]" />
                  <span>Tuition + School Cab Fee Summary</span>
                </span>
                {curStudent.transportDetails?.cabNumber && (
                  <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-[#1A365D] text-amber-300">
                    {curStudent.transportDetails.cabNumber}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. School Tuition Fee (Editable) */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      School Tuition Fee
                    </span>
                    {!editingTuitionFee && (
                      <button
                        type="button"
                        onClick={() => {
                          setTuitionFeeDraft(String(tuitionFeeTotal));
                          setEditingTuitionFee(true);
                        }}
                        className="text-[10px] font-bold text-[#1A365D] hover:text-[#D97706] underline underline-offset-2 cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {editingTuitionFee ? (
                    <div className="mt-1.5 space-y-1.5">
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 10000"
                        value={tuitionFeeDraft}
                        onChange={(e) => setTuitionFeeDraft(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono font-bold text-[#1A365D] border border-[#1A365D] rounded bg-slate-50"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={savingTuitionFee}
                          onClick={handleSaveInlineTuitionFee}
                          className="px-2 py-0.5 rounded bg-[#1A365D] hover:bg-brand-navyDark text-white text-[10px] font-bold cursor-pointer disabled:opacity-60"
                        >
                          {savingTuitionFee ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTuitionFee(false)}
                          className="px-2 py-0.5 rounded border border-slate-300 text-slate-600 text-[10px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-mono font-bold text-base text-[#1A365D] mt-0.5">
                        ₹{tuitionFeeTotal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Base annual school fee
                      </div>
                    </>
                  )}
                </div>

                {/* 2. School Cab Facility Fee (Editable) */}
                <div className="p-2.5 rounded-lg bg-white border border-[#D97706]/40">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase text-[#D97706]">
                      School Cab Fee
                    </span>
                    {!editingCabFee && (
                      <button
                        type="button"
                        onClick={() => {
                          setCabFeeDraft(annualCabFee > 0 ? String(annualCabFee) : '');
                          setEditingCabFee(true);
                        }}
                        className="text-[10px] font-bold text-[#1A365D] hover:text-[#D97706] underline underline-offset-2 cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>

                  {editingCabFee ? (
                    <div className="mt-1.5 space-y-1.5">
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 4500"
                        value={cabFeeDraft}
                        onChange={(e) => setCabFeeDraft(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono font-bold text-[#1A365D] border border-[#D97706] rounded bg-amber-50/40"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={savingCabFee}
                          onClick={handleSaveInlineCabFee}
                          className="px-2 py-0.5 rounded bg-[#1A365D] hover:bg-brand-navyDark text-white text-[10px] font-bold cursor-pointer disabled:opacity-60"
                        >
                          {savingCabFee ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCabFee(false)}
                          className="px-2 py-0.5 rounded border border-slate-300 text-slate-600 text-[10px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-mono font-bold text-base text-[#1A365D] mt-0.5">
                        + ₹{annualCabFee.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Distance-based transport fee
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Grand Total = Tuition + Cab */}
                <div className="p-2.5 rounded-lg bg-[#1A365D] text-white">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">
                    Grand Total (Tuition + Cab)
                  </span>
                  <div className="font-mono font-bold text-base mt-0.5">
                    ₹{(tuitionFeeTotal + annualCabFee).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-200 font-mono">
                    Paid: ₹{existingPaid.toLocaleString('en-IN')} • Due:{' '}
                    <strong className="text-amber-300">
                      ₹{Math.max(0, tuitionFeeTotal + annualCabFee - existingPaid).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Previous Payment Summary & Two-Mode Toggle Strip */}
          {hasPreviousPayment && (
            <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-3 space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-amber-950 font-semibold flex-wrap">
                  <History className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                  <span>
                    Previously Paid:{' '}
                    <strong className="font-mono">
                      ₹{existingPaid.toLocaleString('en-IN')}
                    </strong>{' '}
                    / ₹{existingTotal.toLocaleString('en-IN')}
                  </span>
                  {existingBalance > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono font-bold text-[10px]">
                      Due: ₹{existingBalance.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                      Fully Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Clean Two-Mode Segmented Switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={existingBalance === 0}
                  onClick={() => handleSwitchMode('remaining')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                    existingBalance === 0
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : collectionMode === 'remaining'
                        ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-sm cursor-pointer'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <IndianRupee className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Collect Remaining / Installment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('correct')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    collectionMode === 'correct'
                      ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                      : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100/70'
                  }`}
                >
                  <PencilLine className="w-3.5 h-3.5" />
                  <span>Edit / Correct Previous Amount</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
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
                      ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      paymentMethod === 'Cash' ? 'text-[#D97706]' : 'text-slate-400'
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
                      ? 'bg-[#1A365D] text-white border-[#1A365D] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      paymentMethod === 'Online_UPI' ? 'text-[#D97706]' : 'text-slate-400'
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

            {/* 2. Numeric Fee Inputs (Clean inputs with NO preset pill buttons) */}
            {isCorrectionMode ? (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-[#D97706] flex-shrink-0" />
                  <span>
                    Directly edit the recorded fee figures below. Every correction is permanently logged with your admin name &amp; timestamp.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Corrected Total Fee */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="correctedTotalFeeInput"
                        className="text-[11px] font-bold uppercase tracking-wider text-slate-700"
                      >
                        Corrected Total Fee (₹) *
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Prev: ₹{existingTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono font-bold text-slate-500 text-xs">
                        ₹
                      </span>
                      <input
                        id="correctedTotalFeeInput"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={correctedTotalFee}
                        onChange={(e) => {
                          setCorrectedTotalFee(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sm text-slate-900 bg-white focus:border-[#1A365D]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      In Words:{' '}
                      <strong className="text-[#1A365D]">
                        {numberToIndianWords(numericCorrectedTotal)}
                      </strong>
                    </p>
                  </div>

                  {/* Corrected Paid Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="correctedPaidInput"
                        className="text-[11px] font-bold uppercase tracking-wider text-[#1A365D]"
                      >
                        Corrected Paid Amount (₹) *
                      </label>
                      <span className="text-[10px] text-amber-800 font-mono font-semibold">
                        Prev: ₹{existingPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono font-bold text-[#D97706] text-xs">
                        ₹
                      </span>
                      <input
                        id="correctedPaidInput"
                        type="number"
                        min="0"
                        max={numericCorrectedTotal}
                        step="1"
                        required
                        value={correctedPaidAmount}
                        onChange={(e) => {
                          setCorrectedPaidAmount(e.target.value);
                          setErrorMsg('');
                        }}
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border-2 border-[#D97706] font-mono font-bold text-sm text-[#1A365D] bg-white focus:border-amber-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      In Words:{' '}
                      <strong className="text-[#1A365D]">
                        {numberToIndianWords(numericCorrectedPaid)}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Live Recalculation Banner */}
                <div className="p-3 rounded-lg bg-white border border-amber-300 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      correctionDelta < 0
                        ? 'bg-red-100 text-red-700'
                        : correctionDelta > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Adjustment: {correctionDelta > 0 ? '+' : correctionDelta < 0 ? '-' : ''}₹
                    {Math.abs(correctionDelta).toLocaleString('en-IN')}
                  </span>
                  <span className="font-bold text-[#1A365D]">
                    New Paid Total: ₹{numericCorrectedPaid.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      correctedBalanceDue > 0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    New Balance Due: ₹{correctedBalanceDue.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Mandatory Reason for Amount Correction */}
                <div>
                  <label
                    htmlFor="correctionReasonInput"
                    className="block text-xs font-bold uppercase tracking-wider text-red-800 mb-1"
                  >
                    Reason for Amount Correction * (Mandatory)
                  </label>
                  <textarea
                    id="correctionReasonInput"
                    rows={2}
                    required
                    value={correctionReason}
                    onChange={(e) => {
                      setCorrectionReason(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. Entered 5000 by mistake during walk-in; actual cash received was 4000."
                    className="w-full px-3 py-2 rounded-lg border border-amber-400 bg-white text-xs sm:text-sm focus:border-[#1A365D]"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3.5">
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
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-sm text-slate-900 bg-white focus:border-[#1A365D]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      In Words:{' '}
                      <strong className="text-[#1A365D]">
                        {numberToIndianWords(numericTotalFee)}
                      </strong>
                    </p>
                  </div>

                  {/* Paying Now (₹) * */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="payingNowInput"
                        className="text-[11px] font-bold uppercase tracking-wider text-[#1A365D]"
                      >
                        {isRemainingMode ? 'Remaining Paying Now (₹) *' : 'Paying Now (₹) *'}
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
                    <p className="text-[10px] text-slate-500 mt-1">
                      In Words:{' '}
                      <strong className="text-[#1A365D]">
                        {numberToIndianWords(numericPayingNow)}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Option to Clear Complete Payment Inside Form */}
                <div className="p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950">
                    <input
                      type="checkbox"
                      checked={
                        clearFullPayment ||
                        (maxPayableNow > 0 && numericPayingNow === maxPayableNow)
                      }
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
                    New Paid Total:{' '}
                    <strong className="font-mono text-[#1A365D]">
                      ₹{cumulativePaidAfter.toLocaleString('en-IN')}
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
            )}

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
                {paymentMethod === 'Online_UPI' && !isCorrectionMode && (
                  <button
                    type="button"
                    onClick={handleSimulateGatewayRef}
                    className="text-[11px] font-bold text-[#1A365D] hover:text-[#D97706] underline cursor-pointer"
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

            {/* 4. Cashier / Remarks (shown in Collection mode; Correction mode uses mandatory Reason above) */}
            {!isCorrectionMode && (
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
            )}

            {/* Submit & Secondary Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => printStudentAdmissionSummary(student)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition w-full sm:w-auto cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#1A365D]" />
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
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer ${
                  isCorrectionMode
                    ? 'bg-[#D97706] hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isCorrectionMode ? (
                  <PencilLine className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {submitting
                    ? isCorrectionMode
                      ? 'Saving Correction...'
                      : 'Generating Receipt...'
                    : isCorrectionMode
                      ? 'Save Corrected Amount & Log Audit'
                      : 'Confirm & Generate Official Receipt'}
                </span>
              </button>
            </div>
          </form>

          {/* In-Modal Payment & Edit History Log Section */}
          <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-slate-200 bg-[#F8FAFC]">
            <PaymentAuditLogTimeline logs={auditLogs} compact />
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
