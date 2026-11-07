import { SCHOOL_INFO } from '../constants/schoolData';

/**
 * Load an image from URL into an HTMLImageElement for canvas drawing
 */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Draw a rounded rectangle path on a 2D canvas context
 */
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Generates a high-resolution PNG image (Blob & File) of the exact Student/Parent Copy
 * Official Fee Receipt matching the portal UI card.
 */
export async function generateReceiptImage({
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
  remarks,
}) {
  const width = 1200;
  const height = 770;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Outer Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // 2. Main Receipt Card Container with Navy Border
  const cardX = 24;
  const cardY = 24;
  const cardW = width - 48;
  const cardH = height - 48;

  ctx.save();
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1A365D';
  ctx.stroke();
  ctx.restore();

  // 3. Subtle Center Watermark ("KES KHANATTI")
  ctx.save();
  ctx.font = 'bold 82px Georgia, serif';
  ctx.fillStyle = 'rgba(26, 54, 93, 0.045)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KES KHANATTI', width / 2, height / 2 + 10);
  ctx.restore();

  // 4. Institutional Header
  const headerTop = cardY + 26;
  const innerLeft = cardX + 34;
  const innerRight = cardX + cardW - 34;

  // Load and draw circular School Logo
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoImg = await loadImage(`${origin}${SCHOOL_INFO.logoUrl || '/images/logo.jpg'}`);

  const logoCenterX = innerLeft + 44;
  const logoCenterY = headerTop + 44;
  const logoRadius = 42;

  ctx.save();
  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#D97706';
  ctx.stroke();
  ctx.clip();
  if (logoImg) {
    ctx.drawImage(
      logoImg,
      logoCenterX - logoRadius + 4,
      logoCenterY - logoRadius + 4,
      (logoRadius - 4) * 2,
      (logoRadius - 4) * 2
    );
  }
  ctx.restore();

  // Center School Titles (centered in the space between the logo on left and badge on right)
  const centerX = width / 2 - 42;
  ctx.textAlign = 'center';

  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText("KHANATTI EDUCATION SOCIETY'S", centerX, headerTop + 16);

  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#1A365D';
  ctx.fillText('SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL', centerX, headerTop + 46);

  ctx.font = '13.5px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    'Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026',
    centerX,
    headerTop + 70
  );

  ctx.font = '12.5px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Phone: +91 77957 70785 • Email: kes2026@gmail.com', centerX, headerTop + 90);

  // Right Copy Badge ("STUDENT / PARENT COPY") - Compact so it never overlaps the header
  const badgeW = 164;
  const badgeH = 26;
  const badgeX = innerRight - badgeW;
  const badgeY = headerTop + 14;

  roundRectPath(ctx, badgeX, badgeY, badgeW, badgeH, 5);
  ctx.fillStyle = '#1A365D';
  ctx.fill();

  ctx.font = 'bold 10.5px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('STUDENT / PARENT COPY', badgeX + badgeW / 2, badgeY + 17);

  ctx.font = '11.5px monospace';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'right';
  ctx.fillText(`Date: ${formattedDateTime}`, innerRight, badgeY + 46);

  // Header Divider Line
  const dividerY = headerTop + 110;
  ctx.beginPath();
  ctx.moveTo(innerLeft, dividerY);
  ctx.lineTo(innerRight, dividerY);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#1A365D';
  ctx.stroke();

  // 5. Receipt Meta Bar
  const metaY = dividerY + 18;
  const metaH = 46;
  const metaW = innerRight - innerLeft;

  roundRectPath(ctx, innerLeft, metaY, metaW, metaH, 8);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Receipt No: ', innerLeft + 16, metaY + 29);
  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#D97706';
  ctx.fillText(receiptNo, innerLeft + 102, metaY + 29);

  ctx.textAlign = 'center';
  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(
    `Admission No: ${student.admissionNumber || '—'}`,
    width / 2,
    metaY + 29
  );

  ctx.textAlign = 'right';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`Academic Year: ${academicYear}`, innerRight - 16, metaY + 29);

  // 6. Student Particulars Grid (2 columns x 3 rows)
  const gridTop = metaY + metaH + 24;
  const col1X = innerLeft + 4;
  const col2X = width / 2 + 10;
  const rowGap = 30;

  const drawLabelValue = (x, y, label, value) => {
    ctx.textAlign = 'left';
    ctx.font = '15px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(label, x, y);
    const lblWidth = ctx.measureText(label).width;
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(String(value || '—'), x + lblWidth + 6, y);
  };

  drawLabelValue(col1X, gridTop, 'Student Name:', student.studentName);
  drawLabelValue(
    col2X,
    gridTop,
    'Grade & Section:',
    `${student.grade || '—'} (Sec ${student.section || 'A'})`
  );

  drawLabelValue(col1X, gridTop + rowGap, 'Father / Guardian:', fatherName);
  drawLabelValue(col2X, gridTop + rowGap, 'Parent Mobile:', `+91 ${parentPhone || '—'}`);

  drawLabelValue(col1X, gridTop + rowGap * 2, 'Village / Town:', village);
  drawLabelValue(
    col2X,
    gridTop + rowGap * 2,
    'Payment Mode & Ref:',
    `${paymentMode} (${txnRef})`
  );

  // 7. Itemized Fee Table
  const tableTop = gridTop + rowGap * 2 + 24;
  const tableW = innerRight - innerLeft;
  const colHashW = 60;
  const colModeW = 220;
  const colAmtW = 180;
  const colPartW = tableW - colHashW - colModeW - colAmtW;

  const thH = 40;
  const rowH = 64;
  const totalH = 44;

  // Table Header Background
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(innerLeft, tableTop, tableW, thH);

  // Total Row Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(innerLeft, tableTop + thH + rowH, tableW, totalH);

  // Table Borders
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(innerLeft, tableTop, tableW, thH + rowH + totalH);

  // Horizontal row lines
  ctx.beginPath();
  ctx.moveTo(innerLeft, tableTop + thH);
  ctx.lineTo(innerRight, tableTop + thH);
  ctx.moveTo(innerLeft, tableTop + thH + rowH);
  ctx.lineTo(innerRight, tableTop + thH + rowH);
  ctx.stroke();

  // Vertical column lines
  const xPart = innerLeft + colHashW;
  const xMode = xPart + colPartW;
  const xAmt = xMode + colModeW;

  ctx.beginPath();
  ctx.moveTo(xPart, tableTop);
  ctx.lineTo(xPart, tableTop + thH + rowH);
  ctx.moveTo(xMode, tableTop);
  ctx.lineTo(xMode, tableTop + thH + rowH);
  ctx.moveTo(xAmt, tableTop);
  ctx.lineTo(xAmt, tableTop + thH + rowH + totalH);
  ctx.stroke();

  // Header Labels
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center';
  ctx.fillText('#', innerLeft + colHashW / 2, tableTop + 25);

  ctx.textAlign = 'left';
  ctx.fillText('Particulars', xPart + 14, tableTop + 25);
  ctx.fillText('Mode / Ref', xMode + 14, tableTop + 25);

  ctx.textAlign = 'right';
  ctx.fillText('Amount (₹)', innerRight - 14, tableTop + 25);

  // Row 1 Content
  const r1Y = tableTop + thH;
  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText('1', innerLeft + colHashW / 2, r1Y + 36);

  ctx.textAlign = 'left';
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`Admission & Registration Fee (AY ${academicYear})`, xPart + 14, r1Y + 26);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  const remarkText = remarks
    ? `Remarks: ${remarks}`
    : 'Official Admission & Registration Fee Receipt';
  ctx.fillText(remarkText.slice(0, 75), xPart + 14, r1Y + 48);

  ctx.font = '14px Arial, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.fillText(paymentMode, xMode + 14, r1Y + 26);
  ctx.font = '12.5px monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText(txnRef, xMode + 14, r1Y + 46);

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`₹ ${amountPaid.toFixed(2)}`, innerRight - 14, r1Y + 37);

  // Total Row Content
  const totY = r1Y + rowH;
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('TOTAL AMOUNT RECEIVED:', xAmt - 16, totY + 27);

  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#047857';
  ctx.fillText(`₹ ${amountPaid.toFixed(2)}`, innerRight - 14, totY + 28);

  // 8. Amount in Words Banner
  const wordsY = totY + totalH + 16;
  const wordsH = 44;

  roundRectPath(ctx, innerLeft, wordsY, tableW, wordsH, 8);
  ctx.fillStyle = '#fffbeb';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#fde68a';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '14.5px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Amount in Words: ', innerLeft + 14, wordsY + 27);

  const wordsLblW = ctx.measureText('Amount in Words: ').width;
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = '#1A365D';
  ctx.fillText(amountWords, innerLeft + 14 + wordsLblW, wordsY + 27);

  // Paid & Confirmed Green Badge inside Words Bar
  const pillW = 168;
  const pillH = 26;
  const pillX = innerRight - pillW - 12;
  const pillY = wordsY + 9;

  roundRectPath(ctx, pillX, pillY, pillW, pillH, 5);
  ctx.fillStyle = '#d1fae5';
  ctx.fill();
  ctx.strokeStyle = '#6ee7b7';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.fillText('✓ PAID & CONFIRMED', pillX + pillW / 2, pillY + 17);

  // 9. Signatures Footer
  const sigLineY = cardY + cardH - 46;

  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.2;

  // Left signature line
  ctx.beginPath();
  ctx.moveTo(innerLeft, sigLineY);
  ctx.lineTo(innerLeft + 260, sigLineY);
  ctx.stroke();

  // Right signature line
  ctx.beginPath();
  ctx.moveTo(innerRight - 340, sigLineY);
  ctx.lineTo(innerRight, sigLineY);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = 'bold 13.5px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Parent / Guardian Signature', innerLeft + 130, sigLineY + 22);

  ctx.fillStyle = '#1A365D';
  ctx.fillText(
    'Authorized Cashier / Principal Seal & Signature',
    innerRight - 170,
    sigLineY + 22
  );

  // Convert canvas to PNG Blob & File
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
  const safeFileName = `${receiptNo || 'KES-Receipt'}-${String(student.studentName || 'Student')
    .trim()
    .replace(/\s+/g, '_')}.png`;
  const file = blob ? new File([blob], safeFileName, { type: 'image/png' }) : null;

  return { blob, file, dataUrl, fileName: safeFileName };
}
