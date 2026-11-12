import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  MessageCircle,
  X,
  CheckCircle2,
  FileText,
  Download,
  Copy,
  Image as ImageIcon,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import { printStudentAdmissionSummary } from '../../utils/printStudentSummary';
import { generateReceiptImage } from '../../utils/receiptImageGenerator';
import '../../styles/printReceipt.css';

/**
 * Convert an integer rupee amount into Indian English words (e.g., 500 -> "Rupees Five Hundred Only")
 */
export function numberToIndianWords(numValue) {
  const num = Math.round(Number(numValue) || 0);
  if (num === 0) return 'Rupees Zero Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 !== 0 ? ' ' + ones[n % 10] : ''}`;
  };

  let remaining = num;
  const parts = [];

  if (remaining >= 10000000) {
    parts.push(`${twoDigits(Math.floor(remaining / 10000000))} Crore`);
    remaining %= 10000000;
  }
  if (remaining >= 100000) {
    parts.push(`${twoDigits(Math.floor(remaining / 100000))} Lakh`);
    remaining %= 100000;
  }
  if (remaining >= 1000) {
    parts.push(`${twoDigits(Math.floor(remaining / 1000))} Thousand`);
    remaining %= 1000;
  }
  if (remaining >= 100) {
    parts.push(`${ones[Math.floor(remaining / 100)]} Hundred`);
    remaining %= 100;
  }
  if (remaining > 0) {
    if (parts.length > 0) parts.push('and');
    parts.push(twoDigits(remaining));
  }

  return `Rupees ${parts.join(' ')} Only`;
}

function formatPaymentMethodLabel(method) {
  if (!method || method === 'Not_Applicable') return 'Cash';
  const map = {
    Cash: 'Cash (Counter)',
    Online_UPI: 'Online UPI / QR',
    Online_Card: 'Online Card / Gateway',
    Bank_Transfer: 'NEFT / Bank Transfer',
    Cheque_DD: 'Cheque / Demand Draft',
  };
  return map[method] || String(method).replace(/_/g, ' ');
}

export default function PrintableFeeReceipt({ student, onClose }) {
  const [sharingImage, setSharingImage] = useState(false);
  const [generatedReceiptImg, setGeneratedReceiptImg] = useState(null);
  const [shareFeedback, setShareFeedback] = useState('');

  if (!student) return null;

  const feeDetails = student.feeDetails || {};
  const receiptNo = feeDetails.receiptNumber || 'KES-REC-2026-0001';
  const amountPaid = Number(feeDetails.amountPaid ?? feeDetails.admissionFeeAmount ?? 500);
  const totalFee = Math.max(Number(feeDetails.admissionFeeAmount ?? amountPaid), amountPaid);
  const balanceDue = Math.max(0, Number(feeDetails.balanceDue ?? totalFee - amountPaid));
  const amountWords = numberToIndianWords(amountPaid);
  const paymentMode = formatPaymentMethodLabel(feeDetails.paymentMethod);
  const txnRef = feeDetails.transactionId || 'OFFICE-CASH-COUNTER';
  const academicYear = student.academicYear || '2026-2027';

  const normSec = String(student.section || '').trim().toUpperCase();
  const hasValidSection =
    normSec && normSec !== 'N/A' && normSec !== 'NOT APPLICABLE' && normSec !== 'NONE';
  const gradeAndSectionLabel = hasValidSection
    ? `${student.grade || '—'} (Sec ${student.section})`
    : `${student.grade || '—'}`;

  const paidDateObj = feeDetails.paidAt ? new Date(feeDetails.paidAt) : new Date();
  const formattedDateTime = paidDateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fatherName = student.father?.name || student.fatherName || '—';
  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const parentPhone = String(
    student.primaryPhone || student.whatsappNumber || student.father?.mobile || ''
  ).replace(/\D/g, '');

  const directParentWhatsAppUrl =
    parentPhone.length === 10 ? `https://wa.me/91${parentPhone}` : 'https://web.whatsapp.com';

  const buildImagePayload = async () => {
    return generateReceiptImage({
      student,
      receiptNo,
      amountPaid,
      amountWords,
      paymentMode,
      txnRef,
      academicYear,
      formattedDateTime,
      fatherName,
      village,
      parentPhone,
      remarks: feeDetails.remarks || '',
    });
  };

  const triggerDownload = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReceiptImage = async () => {
    setSharingImage(true);
    try {
      const imgData = await buildImagePayload();
      setGeneratedReceiptImg(imgData);
      triggerDownload(imgData.dataUrl, imgData.fileName);
      setShareFeedback(`Receipt image "${imgData.fileName}" downloaded!`);
    } finally {
      setSharingImage(false);
    }
  };

  const handleCopyReceiptImage = async (imgDataToCopy) => {
    const targetImg = imgDataToCopy || generatedReceiptImg || (await buildImagePayload());
    setGeneratedReceiptImg(targetImg);
    if (
      targetImg?.blob &&
      navigator.clipboard &&
      typeof window.ClipboardItem !== 'undefined'
    ) {
      await navigator.clipboard.write([
        new window.ClipboardItem({ 'image/png': targetImg.blob }),
      ]);
      setShareFeedback(
        'Receipt Image copied to clipboard! Press Ctrl + V inside WhatsApp chat to paste the exact receipt image.'
      );
      return true;
    }
    return false;
  };

  const handleShareReceiptImageOnWhatsApp = async () => {
    setSharingImage(true);
    setShareFeedback('');
    try {
      const imgData = await buildImagePayload();
      setGeneratedReceiptImg(imgData);

      // 1. Copy the exact Receipt PNG image to clipboard so Ctrl+V pastes the image directly in WhatsApp
      let copiedToClipboard = false;
      try {
        copiedToClipboard = await handleCopyReceiptImage(imgData);
      } catch {
        copiedToClipboard = false;
      }

      // 2. If running on mobile/tablet where Web Share API supports direct image file sharing to WhatsApp
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
      if (
        isMobileDevice &&
        imgData.file &&
        navigator.canShare &&
        navigator.canShare({ files: [imgData.file] })
      ) {
        await navigator.share({
          files: [imgData.file],
          title: `Official Fee Receipt - ${receiptNo}`,
        });
        return;
      }

      // 3. On Desktop: Download the PNG receipt image & copy to clipboard so the admin can paste (Ctrl+V) or attach the exact image in WhatsApp without any ugly text message
      triggerDownload(imgData.dataUrl, imgData.fileName);
      setShareFeedback(
        copiedToClipboard
          ? `Exact Receipt Image copied to clipboard & saved as "${imgData.fileName}". Click "Open Parent's WhatsApp" below and press Ctrl + V to send the image!`
          : `Exact Receipt Image downloaded as "${imgData.fileName}". Attach or drag it into the Parent's WhatsApp chat!`
      );
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Error generating receipt image:', err);
      }
    } finally {
      setSharingImage(false);
    }
  };

  const handlePrintA4Receipt = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${origin}${SCHOOL_INFO.logoUrl || '/images/logo.jpg'}`;

    const printWin = window.open('', '_blank', 'width=900,height=820');
    if (!printWin) {
      window.print();
      return;
    }

    const buildCounterfoilHtml = (copyBadge) => `
      <div class="counterfoil">
        <div class="watermark">KES KHANATTI</div>
        <div class="cf-header">
          <img class="cf-logo" src="${logoSrc}" alt="School Logo" />
          <div class="cf-titles">
            <div class="cf-society">KHANATTI EDUCATION SOCIETY'S</div>
            <div class="cf-school">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</div>
            <div class="cf-sub">Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026</div>
            <div class="cf-contact">Phone: +91 77957 70785 • Email: kes2026@gmail.com</div>
          </div>
          <div class="cf-badge-col">
            <span class="cf-copy-badge">${copyBadge}</span>
            <div class="cf-date">Date: <strong>${formattedDateTime}</strong></div>
          </div>
        </div>

        <div class="cf-meta-bar">
          <div>Receipt No: <strong class="gold">${receiptNo}</strong></div>
          <div>Admission No: <strong>${student.admissionNumber || '—'}</strong></div>
          <div>Academic Year: <strong>${academicYear}</strong></div>
        </div>

        <div class="cf-grid">
          <div><span class="lbl">Student Name:</span> <strong>${student.studentName || '—'}</strong></div>
          <div><span class="lbl">Class:</span> <strong>${gradeAndSectionLabel}</strong></div>
          <div><span class="lbl">Father / Guardian:</span> <strong>${fatherName}</strong></div>
          <div><span class="lbl">Parent Mobile:</span> <strong>+91 ${parentPhone || '—'}</strong></div>
          <div><span class="lbl">Village / Town:</span> <strong>${village}</strong></div>
          <div><span class="lbl">Mode &amp; Ref:</span> <strong>${paymentMode} (${txnRef})</strong></div>
        </div>

        <table class="cf-table">
          <thead>
            <tr>
              <th style="width: 38px; text-align: center;">#</th>
              <th>Fee Particulars</th>
              <th style="width: 140px;">Mode / Ref</th>
              <th style="width: 125px; text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td>
                <strong>Admission &amp; Registration Fee (AY ${academicYear})</strong>
                ${balanceDue > 0 ? `<div style="font-size: 10px; color: #b45309; font-weight: bold; margin-top: 2px;">Total Applicable Fee: ₹ ${totalFee.toFixed(2)} • Balance Due: ₹ ${balanceDue.toFixed(2)}</div>` : ''}
                ${feeDetails.remarks ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;">Note: ${feeDetails.remarks}</div>` : ''}
              </td>
              <td style="font-size: 10.5px;">${paymentMode}<br/><span style="font-family: monospace;">${txnRef}</span></td>
              <td style="text-align: right; font-family: monospace; font-weight: bold;">₹ ${amountPaid.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">TOTAL AMOUNT RECEIVED${balanceDue > 0 ? ` (Balance Due: ₹ ${balanceDue.toFixed(2)})` : ''}:</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px; color: #065f46;">₹ ${amountPaid.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="cf-words">
          Amount in Words: <strong>${amountWords}</strong>
          <span class="paid-pill">PAID &amp; VERIFIED</span>
        </div>

        <div class="cf-sigs">
          <div class="sig-box">Parent / Guardian Signature</div>
          <div class="sig-box">Authorized Cashier / Principal Seal &amp; Signature</div>
        </div>
      </div>
    `;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Official Fee Receipt - ${receiptNo}</title>
          <style>
            @page { size: A4 portrait; margin: 9mm 11mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              background: #ffffff;
            }
            .counterfoil {
              position: relative;
              border: 2px solid #1A365D;
              border-radius: 8px;
              padding: 13px 16px;
              background: #ffffff;
              overflow: hidden;
            }
            .watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Georgia, serif;
              font-size: 52px;
              font-weight: bold;
              letter-spacing: 6px;
              color: rgba(26, 54, 93, 0.045);
              pointer-events: none;
              z-index: 0;
            }
            .cf-header, .cf-meta-bar, .cf-grid, .cf-table, .cf-words, .cf-sigs {
              position: relative;
              z-index: 1;
            }
            .cf-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              border-bottom: 2px solid #1A365D;
              padding-bottom: 9px;
              margin-bottom: 9px;
            }
            .cf-logo {
              width: 58px;
              height: 58px;
              border-radius: 50%;
              object-fit: contain;
              border: 2px solid #D97706;
              padding: 2px;
              background: #ffffff;
              flex-shrink: 0;
            }
            .cf-titles {
              flex: 1;
              text-align: center;
            }
            .cf-society {
              font-size: 9.5px;
              font-weight: bold;
              letter-spacing: 1px;
              color: #475569;
              text-transform: uppercase;
            }
            .cf-school {
              font-family: Georgia, serif;
              font-size: 16.5px;
              font-weight: bold;
              color: #1A365D;
              margin: 2px 0;
            }
            .cf-sub {
              font-size: 10px;
              color: #334155;
            }
            .cf-contact {
              font-size: 9.5px;
              color: #475569;
              margin-top: 1px;
            }
            .cf-badge-col {
              text-align: right;
              flex-shrink: 0;
            }
            .cf-copy-badge {
              display: inline-block;
              background: #1A365D;
              color: #ffffff;
              font-size: 9px;
              font-weight: bold;
              padding: 3px 8px;
              border-radius: 4px;
              letter-spacing: 0.6px;
              text-transform: uppercase;
            }
            .cf-date {
              font-size: 9.5px;
              color: #334155;
              margin-top: 5px;
            }
            .cf-meta-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 5px;
              padding: 6px 10px;
              font-size: 11px;
              margin-bottom: 9px;
            }
            .gold {
              color: #b45309;
              font-family: monospace;
              font-size: 12.5px;
            }
            .cf-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 5px 16px;
              font-size: 11px;
              margin-bottom: 9px;
            }
            .cf-grid .lbl {
              color: #64748b;
            }
            .cf-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-bottom: 8px;
            }
            .cf-table th {
              background: #f1f5f9;
              color: #1e293b;
              border: 1px solid #94a3b8;
              padding: 5px 8px;
              text-align: left;
            }
            .cf-table td {
              border: 1px solid #94a3b8;
              padding: 6px 8px;
            }
            .total-row td {
              background: #f8fafc;
              font-weight: bold;
            }
            .cf-words {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 11px;
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 4px;
              padding: 5px 10px;
              margin-bottom: 18px;
            }
            .paid-pill {
              background: #d1fae5;
              color: #065f46;
              border: 1px solid #6ee7b7;
              font-size: 9.5px;
              font-weight: bold;
              padding: 2px 7px;
              border-radius: 4px;
            }
            .cf-sigs {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 14px;
              font-size: 10.5px;
              font-weight: bold;
              color: #334155;
            }
            .sig-box {
              border-top: 1px dashed #475569;
              padding-top: 4px;
              min-width: 210px;
              text-align: center;
            }
            .cut-line {
              text-align: center;
              margin: 12px 0;
              font-family: monospace;
              font-size: 11px;
              font-weight: bold;
              color: #64748b;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          ${buildCounterfoilHtml('STUDENT / PARENT COPY')}
          <div class="cut-line">------------------ Cut Here / Office Record Perforation ------------------</div>
          ${buildCounterfoilHtml('SCHOOL OFFICE / AUDIT COPY')}

          <script>
            (function() {
              var printed = false;
              function triggerPrint() {
                if (printed) return;
                printed = true;
                window.focus();
                window.print();
              }
              var imgs = Array.prototype.slice.call(document.images);
              if (imgs.length === 0) {
                window.onload = triggerPrint;
              } else {
                var loaded = 0;
                function check() {
                  loaded++;
                  if (loaded >= imgs.length) setTimeout(triggerPrint, 120);
                }
                imgs.forEach(function(img) {
                  if (img.complete) check();
                  else {
                    img.addEventListener('load', check);
                    img.addEventListener('error', check);
                  }
                });
                setTimeout(triggerPrint, 900);
              }
            })();
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const renderCounterfoilCard = (copyTitle) => (
    <div className="border-2 border-brand-navy p-4 sm:p-5 rounded-xl bg-white text-slate-900 relative overflow-hidden">
      {/* Subtle Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none text-4xl sm:text-6xl font-serif font-bold tracking-widest text-brand-navy select-none">
        KES KHANATTI
      </div>

      {/* Institutional Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-brand-navy pb-3.5 mb-3.5">
        <img
          src={SCHOOL_INFO.logoUrl || '/images/logo.jpg'}
          alt="School Logo"
          className="w-14 h-14 rounded-full object-contain border-2 border-brand-gold p-0.5 bg-white flex-shrink-0"
        />

        <div className="text-center flex-1 px-2">
          <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-500">
            KHANATTI EDUCATION SOCIETY&apos;S
          </span>
          <h2 className="text-sm sm:text-lg font-serif font-bold text-brand-navy leading-tight">
            SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL
          </h2>
          <p className="text-[11px] text-slate-600">
            Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026
          </p>
          <p className="text-[10px] text-slate-500">
            Phone: +91 77957 70785 • Email: kes2026@gmail.com
          </p>
        </div>

        <div className="text-center sm:text-right flex-shrink-0">
          <span className="inline-block bg-brand-navy text-white px-2 py-0.5 text-[9.5px] font-bold uppercase rounded tracking-wider">
            {copyTitle}
          </span>
          <div className="mt-1 text-[10px] font-mono text-slate-600">
            Date: <strong>{formattedDateTime}</strong>
          </div>
        </div>
      </div>

      {/* Receipt Meta Strip */}
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mb-3.5">
        <div>
          Receipt No:{' '}
          <strong className="font-mono text-brand-gold text-sm">{receiptNo}</strong>
        </div>
        <div>
          Admission No:{' '}
          <strong className="font-mono text-brand-navy">{student.admissionNumber}</strong>
        </div>
        <div>
          Academic Year: <strong>{academicYear}</strong>
        </div>
      </div>

      {/* Student Particulars Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-3.5">
        <div>
          <span className="text-slate-500">Student Name:</span>{' '}
          <strong className="text-slate-900">{student.studentName}</strong>
        </div>
        <div>
          <span className="text-slate-500">Grade / Class:</span>{' '}
          <strong className="text-slate-900">{gradeAndSectionLabel}</strong>
        </div>
        <div>
          <span className="text-slate-500">Father / Guardian:</span>{' '}
          <strong className="text-slate-900">{fatherName}</strong>
        </div>
        <div>
          <span className="text-slate-500">Parent Mobile:</span>{' '}
          <strong className="font-mono text-slate-900">+91 {parentPhone || '—'}</strong>
        </div>
        <div>
          <span className="text-slate-500">Village / Town:</span>{' '}
          <strong className="text-slate-900">{village}</strong>
        </div>
        <div>
          <span className="text-slate-500">Payment Mode &amp; Ref:</span>{' '}
          <strong className="text-slate-900">
            {paymentMode} ({txnRef})
          </strong>
        </div>
      </div>

      {/* Itemized Fee Table */}
      <div className="relative z-10 overflow-x-auto mb-3">
        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800">
              <th className="border border-slate-300 p-2 text-center w-10">#</th>
              <th className="border border-slate-300 p-2 text-left">Particulars</th>
              <th className="border border-slate-300 p-2 text-left w-36">Mode / Ref</th>
              <th className="border border-slate-300 p-2 text-right w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 text-center">1</td>
              <td className="border border-slate-300 p-2 font-medium">
                Admission &amp; Registration Fee (AY {academicYear})
                {balanceDue > 0 && (
                  <span className="block text-[10.5px] text-amber-800 font-bold mt-0.5">
                    Total Applicable Fee: ₹ {totalFee.toFixed(2)} • Remaining Balance Due: ₹{' '}
                    {balanceDue.toFixed(2)}
                  </span>
                )}
                {feeDetails.remarks && (
                  <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                    Remarks: {feeDetails.remarks}
                  </span>
                )}
              </td>
              <td className="border border-slate-300 p-2 text-[11px]">
                {paymentMode}
                <span className="block font-mono text-[10px] text-slate-500">{txnRef}</span>
              </td>
              <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                ₹ {amountPaid.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td colSpan={3} className="border border-slate-300 p-2 text-right uppercase">
                Total Amount Received:
              </td>
              <td className="border border-slate-300 p-2 text-right font-mono text-sm text-emerald-700">
                ₹ {amountPaid.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 text-xs mb-5">
        <div>
          <span className="text-slate-600">Amount in Words: </span>
          <strong className="text-brand-navy">{amountWords}</strong>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Paid &amp; Confirmed</span>
        </span>
      </div>

      {/* Dual Signatures */}
      <div className="relative z-10 flex items-end justify-between pt-5 text-xs font-semibold text-slate-700">
        <div className="text-center">
          <div className="w-40 sm:w-48 border-b border-dashed border-slate-500 mb-1" />
          <span className="text-[11px]">Parent / Guardian Signature</span>
        </div>
        <div className="text-center">
          <div className="w-48 sm:w-56 border-b border-dashed border-slate-800 mb-1" />
          <span className="text-[11px] font-bold text-brand-navy">
            Authorized Cashier / Principal Seal &amp; Signature
          </span>
        </div>
      </div>
    </div>
  );

  const receiptModalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 flex flex-col items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Official Printable Fee Receipt"
    >
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
              {receiptNo}
            </span>
            <h3 className="font-serif font-bold text-brand-navy text-base sm:text-lg">
              Official Dual-Counterfoil Fee Receipt
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formatted for single A4 sheet printing (Upper: Student/Parent Copy • Lower: School Office Copy).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrintA4Receipt}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy hover:bg-brand-navyDark text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-brand-gold" />
            <span>Print Receipt (A4)</span>
          </button>

          <button
            type="button"
            disabled={sharingImage}
            onClick={handleShareReceiptImageOnWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-lg text-xs shadow-sm transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {sharingImage ? 'Generating Receipt Image...' : 'Share Receipt Image on WhatsApp'}
            </span>
          </button>

          <button
            type="button"
            disabled={sharingImage}
            onClick={handleDownloadReceiptImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-brand-navy font-bold rounded-lg text-xs border border-slate-300 transition cursor-pointer"
            title="Download High-Resolution Receipt PNG Image"
          >
            <Download className="w-3.5 h-3.5 text-brand-gold" />
            <span>Download Image</span>
          </button>

          <button
            type="button"
            onClick={() => printStudentAdmissionSummary(student)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-brand-gold" />
            <span>Print Admission Form</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Receipt Image Ready Banner (Appears when Share Receipt Image is clicked) */}
      {generatedReceiptImg && (
        <div className="print:hidden w-full max-w-4xl bg-emerald-50 border-2 border-emerald-400 rounded-xl shadow-md p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={generatedReceiptImg.dataUrl}
              alt="Generated Receipt Preview"
              className="w-28 h-20 object-contain rounded-lg border border-emerald-300 bg-white p-1 shadow-xs flex-shrink-0"
            />
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Official Receipt Image Generated &amp; Copied to Clipboard!</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                {shareFeedback ||
                  'Click "Open Parent WhatsApp Chat" below and simply press Ctrl + V (Paste) to send this exact receipt image without any text clutter.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleCopyReceiptImage(generatedReceiptImg)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Image</span>
            </button>

            <a
              href={directParentWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open Parent WhatsApp (+91 {parentPhone}) &amp; Paste (Ctrl+V)</span>
            </a>
          </div>
        </div>
      )}

      {/* Printable A4 Canvas */}
      <div
        id="kes-printable-fee-receipt"
        className="w-full max-w-4xl bg-white shadow-2xl p-4 sm:p-8 rounded-2xl space-y-4"
      >
        {renderCounterfoilCard('STUDENT / PARENT COPY')}

        <div className="py-2 text-center font-mono text-xs font-bold text-slate-400 tracking-wider select-none">
          ------------------ Cut Here / Office Record Perforation ------------------
        </div>

        {renderCounterfoilCard('SCHOOL OFFICE / AUDIT COPY')}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(receiptModalContent, document.body)
    : receiptModalContent;
}
