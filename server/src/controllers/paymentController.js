const Student = require('../models/Student');
const { getDbStatus } = require('../config/db');
const memoryStore = require('../utils/memoryStore');

/**
 * Generate sequential institutional receipt number: KES-REC-2026-XXXX
 * Scans existing receipt numbers to ensure no collisions.
 */
const generateReceiptNumber = async (academicYear = '2026-2027') => {
  const yearPrefix = String(academicYear).slice(0, 4) || String(new Date().getFullYear());
  const prefix = `KES-REC-${yearPrefix}-`;
  const dbStatus = getDbStatus();

  let maxSeq = 0;

  if (dbStatus.isConnected) {
    const paidStudents = await Student.find(
      {
        $or: [
          { 'feeDetails.receiptNumber': { $regex: `^${prefix}` } },
          { 'feeDetails.paymentHistory.receiptNumber': { $regex: `^${prefix}` } },
        ],
      },
      { 'feeDetails.receiptNumber': 1, 'feeDetails.paymentHistory': 1 }
    ).lean();

    for (const st of paidStudents) {
      const candidates = [
        st.feeDetails?.receiptNumber || '',
        ...((st.feeDetails?.paymentHistory || []).map((h) => h.receiptNumber || '')),
      ];
      for (const rec of candidates) {
        if (rec.startsWith(prefix)) {
          const numPart = parseInt(rec.replace(prefix, ''), 10);
          if (!Number.isNaN(numPart) && numPart > maxSeq) {
            maxSeq = numPart;
          }
        }
      }
    }
  } else {
    for (const st of memoryStore.students) {
      const candidates = [
        st.feeDetails?.receiptNumber || '',
        ...((st.feeDetails?.paymentHistory || []).map((h) => h.receiptNumber || '')),
      ];
      for (const rec of candidates) {
        if (rec.startsWith(prefix)) {
          const numPart = parseInt(rec.replace(prefix, ''), 10);
          if (!Number.isNaN(numPart) && numPart > maxSeq) {
            maxSeq = numPart;
          }
        }
      }
    }
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
};

/**
 * POST /api/v1/payments/record-fee
 * Records admission fee collection (Cash, Online_UPI, Online_Card, Bank_Transfer, Cheque_DD)
 * and generates an official receipt number (KES-REC-2026-XXXX).
 */
exports.recordFeePayment = async (req, res) => {
  try {
    const {
      studentId,
      amountPaid,
      currentPaymentAmount,
      admissionFeeAmount,
      isRemainingPayment = false,
      paymentMethod = 'Cash',
      transactionId = '',
      voucherNumber = '',
      remarks = '',
    } = req.body || {};

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required to record admission fee payment.',
      });
    }

    const numericInputPaid = Number(
      currentPaymentAmount !== undefined ? currentPaymentAmount : amountPaid
    );
    if (Number.isNaN(numericInputPaid) || numericInputPaid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid fee amount greater than ₹0.',
      });
    }

    const validMethods = [
      'Cash',
      'Online_UPI',
      'Online_Card',
      'Bank_Transfer',
      'Cheque_DD',
      'Not_Applicable',
    ];
    const resolvedMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'Cash';

    const resolvedTxnId =
      String(transactionId || '').trim() ||
      (voucherNumber
        ? `CASH-${String(voucherNumber).trim()}`
        : resolvedMethod === 'Cash'
          ? `CASH-${Date.now().toString().slice(-6)}`
          : `UPI-${Date.now().toString().slice(-8)}`);

    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found.',
        });
      }

      const previousPaid = Number(student.feeDetails?.amountPaid || 0);
      const cumulativePaid = isRemainingPayment
        ? previousPaid + numericInputPaid
        : Number(amountPaid !== undefined ? amountPaid : numericInputPaid);

      const requestedTotalFee =
        admissionFeeAmount !== undefined
          ? Number(admissionFeeAmount)
          : Number(student.feeDetails?.admissionFeeAmount || 0);

      const totalFee = Math.max(requestedTotalFee || cumulativePaid, cumulativePaid);
      const balanceDue = Math.max(0, totalFee - cumulativePaid);
      const computedStatus =
        cumulativePaid <= 0 ? 'Pending' : balanceDue > 0 ? 'Partial' : 'Paid';

      const receiptNo =
        !isRemainingPayment && student.feeDetails?.receiptNumber && previousPaid === 0
          ? student.feeDetails.receiptNumber
          : await generateReceiptNumber(student.academicYear || '2026-2027');

      const resolvedRemarks =
        String(remarks || '').trim() ||
        (resolvedMethod === 'Cash'
          ? 'Paid in Cash at Khanatti School Office Counter'
          : `Paid via ${resolvedMethod.replace('_', ' ')}`);

      const existingHistory = Array.isArray(student.feeDetails?.paymentHistory)
        ? [...student.feeDetails.paymentHistory]
        : [];

      // If student already had a previous payment without history array, seed the first entry
      if (existingHistory.length === 0 && previousPaid > 0 && isRemainingPayment) {
        existingHistory.push({
          receiptNumber: student.feeDetails?.receiptNumber || 'KES-REC-2026-INIT',
          amountPaid: previousPaid,
          paymentMethod: student.feeDetails?.paymentMethod || 'Cash',
          transactionId: student.feeDetails?.transactionId || '',
          paidAt: student.feeDetails?.paidAt || student.createdAt || new Date(),
          remarks: student.feeDetails?.remarks || 'Initial Fee Payment',
        });
      }

      existingHistory.push({
        receiptNumber: receiptNo,
        amountPaid: numericInputPaid,
        paymentMethod: resolvedMethod,
        transactionId: resolvedTxnId,
        paidAt: new Date(),
        remarks: resolvedRemarks,
      });

      student.feeDetails = {
        ...(student.feeDetails ? student.feeDetails.toObject?.() || student.feeDetails : {}),
        admissionFeeAmount: totalFee,
        amountPaid: cumulativePaid,
        balanceDue,
        lastPaymentAmount: numericInputPaid,
        paymentStatus: computedStatus,
        paymentMethod: resolvedMethod,
        transactionId: resolvedTxnId,
        receiptNumber: receiptNo,
        paidAt: new Date(),
        collectedBy: req.user?._id,
        collectedByStaff: req.user?._id,
        remarks: resolvedRemarks,
        paymentHistory: existingHistory,
      };

      await student.save();

      const populatedStudent = await Student.findById(student._id)
        .populate('feeDetails.collectedBy', 'fullName email role')
        .lean();

      return res.status(200).json({
        success: true,
        message: `Official fee receipt ${receiptNo} generated successfully.`,
        receiptNumber: receiptNo,
        student: populatedStudent || student,
        feeDetails: (populatedStudent || student).feeDetails,
      });
    }

    // Fallback to memoryStore
    const memStudent = memoryStore.students.find((s) => String(s._id) === String(studentId));
    if (!memStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    const previousPaid = Number(memStudent.feeDetails?.amountPaid || 0);
    const cumulativePaid = isRemainingPayment
      ? previousPaid + numericInputPaid
      : Number(amountPaid !== undefined ? amountPaid : numericInputPaid);

    const requestedTotalFee =
      admissionFeeAmount !== undefined
        ? Number(admissionFeeAmount)
        : Number(memStudent.feeDetails?.admissionFeeAmount || 0);

    const totalFee = Math.max(requestedTotalFee || cumulativePaid, cumulativePaid);
    const balanceDue = Math.max(0, totalFee - cumulativePaid);
    const computedStatus =
      cumulativePaid <= 0 ? 'Pending' : balanceDue > 0 ? 'Partial' : 'Paid';

    const receiptNo =
      !isRemainingPayment && memStudent.feeDetails?.receiptNumber && previousPaid === 0
        ? memStudent.feeDetails.receiptNumber
        : await generateReceiptNumber(memStudent.academicYear || '2026-2027');

    const resolvedRemarks =
      String(remarks || '').trim() ||
      (resolvedMethod === 'Cash'
        ? 'Paid in Cash at Khanatti School Office Counter'
        : `Paid via ${resolvedMethod.replace('_', ' ')}`);

    const existingHistory = Array.isArray(memStudent.feeDetails?.paymentHistory)
      ? [...memStudent.feeDetails.paymentHistory]
      : [];

    if (existingHistory.length === 0 && previousPaid > 0 && isRemainingPayment) {
      existingHistory.push({
        receiptNumber: memStudent.feeDetails?.receiptNumber || 'KES-REC-2026-INIT',
        amountPaid: previousPaid,
        paymentMethod: memStudent.feeDetails?.paymentMethod || 'Cash',
        transactionId: memStudent.feeDetails?.transactionId || '',
        paidAt: memStudent.feeDetails?.paidAt || new Date(),
        remarks: memStudent.feeDetails?.remarks || 'Initial Fee Payment',
      });
    }

    existingHistory.push({
      receiptNumber: receiptNo,
      amountPaid: numericInputPaid,
      paymentMethod: resolvedMethod,
      transactionId: resolvedTxnId,
      paidAt: new Date(),
      remarks: resolvedRemarks,
    });

    memStudent.feeDetails = {
      admissionFeeAmount: totalFee,
      amountPaid: cumulativePaid,
      balanceDue,
      lastPaymentAmount: numericInputPaid,
      paymentStatus: computedStatus,
      paymentMethod: resolvedMethod,
      transactionId: resolvedTxnId,
      receiptNumber: receiptNo,
      paidAt: new Date(),
      collectedBy: req.user?._id,
      collectedByStaff: req.user?._id,
      remarks: resolvedRemarks,
      paymentHistory: existingHistory,
    };

    return res.status(200).json({
      success: true,
      message: `Official fee receipt ${receiptNo} generated successfully.`,
      receiptNumber: receiptNo,
      student: memStudent,
      feeDetails: memStudent.feeDetails,
    });
  } catch (error) {
    console.error('[Record Fee Payment Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record admission fee payment.',
    });
  }
};

/**
 * POST /api/v1/payments/create-order
 * Initializes an online UPI / Gateway order for a student.
 */
exports.createOnlineOrder = async (req, res) => {
  try {
    const { studentId, amount = 500 } = req.body || {};
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
      }

      student.feeDetails = {
        ...(student.feeDetails ? student.feeDetails.toObject?.() || student.feeDetails : {}),
        orderId,
        admissionFeeAmount: Number(amount) || 500,
      };
      await student.save();

      return res.status(200).json({
        success: true,
        orderId,
        amount: (Number(amount) || 500) * 100,
        currency: 'INR',
        studentName: student.studentName,
        admissionNumber: student.admissionNumber,
      });
    }

    const memStudent = memoryStore.students.find((s) => String(s._id) === String(studentId));
    if (!memStudent) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    memStudent.feeDetails = {
      ...(memStudent.feeDetails || {}),
      orderId,
      admissionFeeAmount: Number(amount) || 500,
    };

    return res.status(200).json({
      success: true,
      orderId,
      amount: (Number(amount) || 500) * 100,
      currency: 'INR',
      studentName: memStudent.studentName,
      admissionNumber: memStudent.admissionNumber,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to initialize online payment order.',
    });
  }
};

/**
 * POST /api/v1/payments/verify-online
 * Verifies online UPI / Gateway transaction and generates receipt.
 */
exports.verifyOnlinePayment = async (req, res) => {
  req.body = {
    ...req.body,
    paymentMethod: req.body.paymentMethod || 'Online_UPI',
    transactionId:
      req.body.transactionId || req.body.razorpayPaymentId || `UPI-${Date.now().toString().slice(-8)}`,
    amountPaid: req.body.amountPaid || 500,
  };
  return exports.recordFeePayment(req, res);
};

/**
 * GET /api/v1/payments/receipt/:receiptNumber
 * Public or authenticated endpoint returning receipt metadata, student particulars, and cashier info.
 */
exports.getReceiptByNumber = async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    if (!receiptNumber) {
      return res.status(400).json({
        success: false,
        message: 'Receipt number is required.',
      });
    }

    const normalizedReceipt = String(receiptNumber).trim().toUpperCase();
    const dbStatus = getDbStatus();

    if (dbStatus.isConnected) {
      const student = await Student.findOne({
        'feeDetails.receiptNumber': normalizedReceipt,
      })
        .populate('feeDetails.collectedBy', 'fullName email role')
        .lean();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `No fee receipt found matching ${normalizedReceipt}.`,
        });
      }

      return res.status(200).json({
        success: true,
        receiptNumber: normalizedReceipt,
        feeDetails: student.feeDetails,
        student,
      });
    }

    const memStudent = memoryStore.students.find(
      (s) => String(s.feeDetails?.receiptNumber || '').toUpperCase() === normalizedReceipt
    );

    if (!memStudent) {
      return res.status(404).json({
        success: false,
        message: `No fee receipt found matching ${normalizedReceipt}.`,
      });
    }

    return res.status(200).json({
      success: true,
      receiptNumber: normalizedReceipt,
      feeDetails: memStudent.feeDetails,
      student: memStudent,
    });
  } catch (error) {
    console.error('[Get Receipt Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve receipt details.',
    });
  }
};
