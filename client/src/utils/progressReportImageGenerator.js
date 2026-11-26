import { SCHOOL_INFO } from '../constants/schoolData';
import { drawOfficialDigitalSignatureOnCanvas } from '../components/common/OfficialDigitalSignature';

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
 * Compute letter grade from percentage
 */
function computeLetterGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'E';
}

/**
 * Generates a high-resolution PNG image (Blob, DataURL & File) of the Official Progress Report Card
 * matching the portal's counterfoil and print styling.
 */
export async function generateProgressReportImage({
  student,
  selectedTerm,
  academicYear,
  formattedDate,
  gradeAndSectionLabel,
  fatherName,
  motherName,
  village,
  attendancePercentage,
  subjects = [],
  totalMaxMarks = 0,
  totalObtainedMarks = 0,
  overallPercentage = 0,
  overallGrade = '—',
  teacherRemarks = 'Consistent academic progress and active classroom participation.',
}) {
  const width = 1200;

  // Calculate dynamic card height based on subject rows
  const subjectList = Array.isArray(subjects) && subjects.length > 0 ? subjects : [];
  const rowCount = Math.max(1, subjectList.length);
  const rowH = 40;
  const tableRowsH = rowCount * rowH;

  // Header ~150 + Meta ~52 + Grid ~100 + Table Header 42 + Rows + Total Row 46 + Remarks 52 + Sigs 84 + padding ~120
  const cardInnerH = 150 + 52 + 104 + 42 + tableRowsH + 46 + 54 + 92 + 30;
  const cardMargin = 24;
  const height = cardInnerH + cardMargin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Outer Background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // 2. Main Card Container with Navy Border
  const cardX = cardMargin;
  const cardY = cardMargin;
  const cardW = width - cardMargin * 2;
  const cardH = height - cardMargin * 2;

  ctx.save();
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1A365D';
  ctx.stroke();
  ctx.restore();

  // 3. Subtle Center Watermark ("KES KHANATTI")
  ctx.save();
  ctx.font = 'bold 88px Georgia, serif';
  ctx.fillStyle = 'rgba(26, 54, 93, 0.04)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KES KHANATTI', width / 2, height / 2);
  ctx.restore();

  // 4. Institutional Header
  const headerTop = cardY + 22;
  const innerLeft = cardX + 32;
  const innerRight = cardX + cardW - 32;

  // School Logo
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const logoImg = await loadImage(`${origin}${SCHOOL_INFO.logoUrl || '/images/logo.jpg'}`);

  const logoCenterX = innerLeft + 42;
  const logoCenterY = headerTop + 42;
  const logoRadius = 40;

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

  // Center School Titles
  const centerX = width / 2 - 30;
  ctx.textAlign = 'center';

  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText("KHANATTI EDUCATION SOCIETY'S", centerX, headerTop + 14);

  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillStyle = '#1A365D';
  ctx.fillText('SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL', centerX, headerTop + 42);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    'Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026',
    centerX,
    headerTop + 66
  );

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Phone: +91 77957 70785 • Email: kes2026@gmail.com', centerX, headerTop + 86);

  // Right Copy Badge ("STUDENT / PARENT COPY") & Date
  const badgeW = 164;
  const badgeH = 26;
  const badgeX = innerRight - badgeW;
  const badgeY = headerTop + 12;

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
  ctx.fillText(`Date: ${formattedDate}`, innerRight, badgeY + 44);

  // Header Divider Line
  const dividerY = headerTop + 104;
  ctx.beginPath();
  ctx.moveTo(innerLeft, dividerY);
  ctx.lineTo(innerRight, dividerY);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#1A365D';
  ctx.stroke();

  // 5. Meta Bar
  const metaY = dividerY + 14;
  const metaH = 44;
  const tableW = innerRight - innerLeft;

  roundRectPath(ctx, innerLeft, metaY, tableW, metaH, 8);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '14.5px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Exam Term: ', innerLeft + 16, metaY + 27);
  const termLblW = ctx.measureText('Exam Term: ').width;
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#D97706';
  ctx.fillText(selectedTerm, innerLeft + 16 + termLblW, metaY + 27);

  ctx.textAlign = 'center';
  ctx.font = '14.5px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(`Admission No: ${student.admissionNumber || '—'}`, width / 2, metaY + 27);

  ctx.textAlign = 'right';
  ctx.font = 'bold 14.5px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`Academic Year: ${academicYear}`, innerRight - 16, metaY + 27);

  // 6. Student Particulars Grid (2 columns x 3 rows)
  const gridTop = metaY + metaH + 20;
  const col1X = innerLeft + 4;
  const col2X = width / 2 + 10;
  const rowGap = 28;

  const drawLabelValue = (x, y, label, value) => {
    ctx.textAlign = 'left';
    ctx.font = '14.5px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(label, x, y);
    const lblWidth = ctx.measureText(label).width;
    ctx.font = 'bold 14.5px Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(String(value || '—'), x + lblWidth + 6, y);
  };

  drawLabelValue(col1X, gridTop, 'Student Name:', student.studentName);
  drawLabelValue(col2X, gridTop, 'Grade / Class:', gradeAndSectionLabel);

  drawLabelValue(col1X, gridTop + rowGap, 'Father / Guardian:', fatherName);
  drawLabelValue(col2X, gridTop + rowGap, "Mother's Name:", motherName);

  drawLabelValue(col1X, gridTop + rowGap * 2, 'Village / Town:', village);
  drawLabelValue(
    col2X,
    gridTop + rowGap * 2,
    'Roll No & Attendance:',
    `Roll: ${student.rollNumber || '—'} • Attendance: ${attendancePercentage}%`
  );

  // 7. Itemized Subject Marks Table
  const tableTop = gridTop + rowGap * 2 + 20;
  const colHashW = 60;
  const colMaxW = 120;
  const colObtW = 150;
  const colGrdW = 110;
  const colRemW = 220;
  const colSubW = tableW - colHashW - colMaxW - colObtW - colGrdW - colRemW;

  const thH = 38;
  const totH = 44;

  // Table Header Background
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(innerLeft, tableTop, tableW, thH);

  // Table Total Row Background
  const totY = tableTop + thH + tableRowsH;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(innerLeft, totY, tableW, totH);

  // Outer Table Border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(innerLeft, tableTop, tableW, thH + tableRowsH + totH);

  // Horizontal row dividers
  ctx.beginPath();
  ctx.moveTo(innerLeft, tableTop + thH);
  ctx.lineTo(innerRight, tableTop + thH);

  for (let i = 1; i < rowCount; i++) {
    const yLine = tableTop + thH + i * rowH;
    ctx.moveTo(innerLeft, yLine);
    ctx.lineTo(innerRight, yLine);
  }

  ctx.moveTo(innerLeft, totY);
  ctx.lineTo(innerRight, totY);
  ctx.stroke();

  // Vertical column dividers
  const xSub = innerLeft + colHashW;
  const xMax = xSub + colSubW;
  const xObt = xMax + colMaxW;
  const xGrd = xObt + colObtW;
  const xRem = xGrd + colGrdW;

  ctx.beginPath();
  // Col dividers across header & subject rows
  [xSub, xMax, xObt, xGrd, xRem].forEach((xPos) => {
    ctx.moveTo(xPos, tableTop);
    ctx.lineTo(xPos, tableTop + thH + tableRowsH);
  });
  // In total row, keep colMax, colObt, colGrd, colRem lines
  [xMax, xObt, xGrd, xRem].forEach((xPos) => {
    ctx.moveTo(xPos, totY);
    ctx.lineTo(xPos, totY + totH);
  });
  ctx.stroke();

  // Header Labels
  ctx.font = 'bold 13.5px Arial, sans-serif';
  ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center';
  ctx.fillText('#', innerLeft + colHashW / 2, tableTop + 24);

  ctx.textAlign = 'left';
  ctx.fillText('Subject Particulars', xSub + 14, tableTop + 24);

  ctx.textAlign = 'center';
  ctx.fillText('Max Marks', xMax + colMaxW / 2, tableTop + 24);
  ctx.fillText('Marks Obtained', xObt + colObtW / 2, tableTop + 24);
  ctx.fillText('Grade', xGrd + colGrdW / 2, tableTop + 24);

  ctx.textAlign = 'left';
  ctx.fillText('Remarks', xRem + 14, tableTop + 24);

  // Subject Rows Content
  if (subjectList.length > 0) {
    subjectList.forEach((sub, idx) => {
      const curY = tableTop + thH + idx * rowH;
      const max = Number(sub.maxMarks) || 100;
      const obt = Number(sub.marksObtained) || 0;
      const pct = max > 0 ? Math.round((obt / max) * 100) : 0;
      const grade = sub.grade || computeLetterGrade(pct);

      ctx.textAlign = 'center';
      ctx.font = '13.5px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(String(idx + 1), innerLeft + colHashW / 2, curY + 25);

      ctx.textAlign = 'left';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillStyle = '#1A365D';
      ctx.fillText(sub.subjectName || `Subject ${idx + 1}`, xSub + 14, curY + 25);

      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.fillStyle = '#334155';
      ctx.fillText(String(max), xMax + colMaxW / 2, curY + 25);

      ctx.font = 'bold 14.5px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(String(obt), xObt + colObtW / 2, curY + 25);

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#1A365D';
      ctx.fillText(grade, xGrd + colGrdW / 2, curY + 25);

      ctx.textAlign = 'left';
      ctx.font = '13px Arial, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(sub.remarks || 'Good', xRem + 14, curY + 25);
    });
  } else {
    // Empty placeholder row
    const curY = tableTop + thH;
    ctx.textAlign = 'center';
    ctx.font = 'italic 13.5px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `Marks for ${selectedTerm} have not been published yet.`,
      innerLeft + tableW / 2,
      curY + 25
    );
  }

  // Total Row Content
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(
    `TOTAL MARKS OBTAINED (${overallPercentage}%):`,
    xMax - 14,
    totY + 27
  );

  ctx.textAlign = 'center';
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText(String(totalMaxMarks), xMax + colMaxW / 2, totY + 27);

  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#065f46';
  ctx.fillText(String(totalObtainedMarks), xObt + colObtW / 2, totY + 27);

  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#b45309';
  ctx.fillText(overallGrade, xGrd + colGrdW / 2, totY + 27);

  ctx.textAlign = 'left';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = overallPercentage >= 35 ? '#065f46' : '#b45309';
  ctx.fillText(
    overallPercentage >= 35 ? 'PASSED' : 'NEEDS SUPPORT',
    xRem + 14,
    totY + 27
  );

  // 8. Class Teacher Remarks & Result Status Bar
  const remarksY = totY + totH + 16;
  const remarksH = 46;

  roundRectPath(ctx, innerLeft, remarksY, tableW, remarksH, 8);
  ctx.fillStyle = '#fffbeb';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#fde68a';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '13.5px Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText("Class Teacher's Remarks: ", innerLeft + 14, remarksY + 28);

  const remLblW = ctx.measureText("Class Teacher's Remarks: ").width;
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.fillStyle = '#1A365D';
  ctx.fillText(teacherRemarks.slice(0, 72), innerLeft + 14 + remLblW, remarksY + 28);

  // Result Status Pill on right
  const pillW = 180;
  const pillH = 28;
  const pillX = innerRight - pillW - 12;
  const pillY = remarksY + 9;

  roundRectPath(ctx, pillX, pillY, pillW, pillH, 5);
  ctx.fillStyle = '#d1fae5';
  ctx.fill();
  ctx.strokeStyle = '#6ee7b7';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 11.5px Arial, sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.fillText(
    overallPercentage >= 35 ? '✓ PASSED & CONFIRMED' : '✓ PUBLISHED',
    pillX + pillW / 2,
    pillY + 18
  );

  // 9. Signatures Footer (3 Signature Columns)
  const sigLineY = remarksY + remarksH + 54;
  const sigColW = 240;

  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.2;

  // Left: Class Teacher
  ctx.beginPath();
  ctx.moveTo(innerLeft + 10, sigLineY);
  ctx.lineTo(innerLeft + 10 + sigColW, sigLineY);
  ctx.stroke();

  // Center: Parent / Guardian
  const centerSigX = width / 2 - sigColW / 2;
  ctx.beginPath();
  ctx.moveTo(centerSigX, sigLineY);
  ctx.lineTo(centerSigX + sigColW, sigLineY);
  ctx.stroke();

  // Right: Official Digital Signature & School Crest Stamp above Headmaster / Principal line
  drawOfficialDigitalSignatureOnCanvas(ctx, logoImg, {
    centerX: innerRight - 10 - sigColW / 2,
    baselineY: sigLineY - 4,
    scale: 0.9,
  });

  // Right: Headmaster / Principal
  ctx.beginPath();
  ctx.moveTo(innerRight - 10 - sigColW, sigLineY);
  ctx.lineTo(innerRight - 10, sigLineY);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('Class Teacher Signature', innerLeft + 10 + sigColW / 2, sigLineY + 20);

  ctx.fillText('Parent / Guardian Signature', centerSigX + sigColW / 2, sigLineY + 20);

  ctx.fillStyle = '#1A365D';
  ctx.fillText(
    'Headmaster / Principal Seal & Signature',
    innerRight - 10 - sigColW / 2,
    sigLineY + 20
  );

  // Convert canvas to PNG Blob & File
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));

  const cleanTerm = String(selectedTerm || 'Term').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanName = String(student.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = `KES_Progress_Report_${cleanTerm}_${cleanName}.png`;
  const file = blob ? new File([blob], safeFileName, { type: 'image/png' }) : null;

  return { blob, file, dataUrl, fileName: safeFileName };
}
