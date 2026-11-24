import { SCHOOL_INFO } from '../constants/schoolData';

const COLORS = {
  NAVY: 'FF1A365D',
  NAVY_DARK: 'FF0F2544',
  GOLD: 'FFD97706',
  GOLD_BG: 'FFFEF3C7',
  GOLD_TEXT: 'FF92400E',
  WHITE: 'FFFFFFFF',
  SLATE_LIGHT: 'FFE2E8F0',
  SLATE_ZEBRA: 'FFF8FAFC',
  SLATE_BORDER: 'FFCBD5E1',
  SLATE_TEXT: 'FF1E293B',
  SLATE_MUTED: 'FF475569',
  EMERALD: 'FF059669',
  EMERALD_BG: 'FFD1FAE5',
  EMERALD_TEXT: 'FF065F46',
  ROSE_BG: 'FFFEE2E2',
  ROSE_TEXT: 'FF991B1B',
};

const THIN_SLATE_BORDER = {
  top: { style: 'thin', color: { argb: COLORS.SLATE_BORDER } },
  left: { style: 'thin', color: { argb: COLORS.SLATE_BORDER } },
  bottom: { style: 'thin', color: { argb: COLORS.SLATE_BORDER } },
  right: { style: 'thin', color: { argb: COLORS.SLATE_BORDER } },
};

const HEADER_BORDER = {
  top: { style: 'thin', color: { argb: COLORS.NAVY_DARK } },
  left: { style: 'thin', color: { argb: 'FF334E73' } },
  bottom: { style: 'medium', color: { argb: COLORS.GOLD } },
  right: { style: 'thin', color: { argb: 'FF334E73' } },
};

function formatDateDDMMYYYY(date = new Date()) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function cleanText(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str === 'true' || str === 'false' || str === 'undefined' || str === 'null') return '';
  return str;
}

function isSectionApplicable(sec) {
  if (!sec) return false;
  const normalized = String(sec).trim().toUpperCase();
  return normalized !== 'N/A' && normalized !== 'NOT APPLICABLE' && normalized !== 'NONE';
}

async function fetchSchoolLogoBuffer() {
  const candidates = [
    SCHOOL_INFO?.logoUrl,
    '/images/logo.jpg',
    '/logo.jpg',
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) continue;
      const buffer = await res.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        const extension = contentType.includes('png') ? 'png' : 'jpeg';
        return { buffer, extension };
      }
    } catch {
      // Try next candidate or fall back cleanly without logo
    }
  }
  return null;
}

/**
 * Generate and download a branded Excel Workbook (.xlsx) for the Student Directory.
 */
export async function exportStudentDirectoryExcel(
  students = [],
  { gradeFilter = 'All Classes', sectionFilter = 'All' } = {}
) {
  if (!Array.isArray(students) || students.length === 0) return;

  const ExcelJSModule = await import('exceljs');
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Khanatti Education Society's Shri Siddharoodha EMS";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Student Directory', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 6, showGridLines: true }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  // 19 Columns (A through S) with generous widths so nothing clips
  const columns = [
    { key: 'admNo', header: 'Adm No', width: 15, align: 'center', isText: true },
    { key: 'studentName', header: 'Student Name', width: 26, align: 'left', isText: true },
    { key: 'rollNo', header: 'Roll No', width: 11, align: 'center', isText: true },
    { key: 'grade', header: 'Class / Grade', width: 16, align: 'center', isText: true },
    { key: 'section', header: 'Section', width: 11, align: 'center', isText: true },
    { key: 'gender', header: 'Gender', width: 12, align: 'center', isText: true },
    { key: 'dob', header: 'Date of Birth', width: 15, align: 'center', isText: true },
    { key: 'bloodGroup', header: 'Blood Group', width: 13, align: 'center', isText: true },
    { key: 'category', header: 'Category', width: 14, align: 'center', isText: true },
    { key: 'aadhaar', header: 'Student Aadhaar No', width: 21, align: 'center', isText: true },
    { key: 'fatherName', header: 'Father / Guardian', width: 24, align: 'left', isText: true },
    { key: 'motherName', header: 'Mother Name', width: 22, align: 'left', isText: true },
    { key: 'mobile', header: 'Parent Mobile', width: 18, align: 'center', isText: true },
    { key: 'cabFee', header: 'Cab Fee (₹)', width: 15, align: 'right', isCurrency: true },
    { key: 'totalFee', header: 'Total Applicable Fee (₹)', width: 22, align: 'right', isCurrency: true },
    { key: 'paidAmt', header: 'Paid Amount (₹)', width: 18, align: 'right', isCurrency: true },
    { key: 'balanceDue', header: 'Balance Due (₹)', width: 18, align: 'right', isCurrency: true },
    { key: 'feeStatus', header: 'Fee Status', width: 15, align: 'center', isText: true },
    { key: 'status', header: 'Status', width: 14, align: 'center', isText: true },
  ];

  worksheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  // =========================================================================
  // 1. BRANDED SCHOOL HEADER & LOGO (ROWS 1–5)
  // =========================================================================
  worksheet.getRow(1).height = 20;
  worksheet.getRow(2).height = 28;
  worksheet.getRow(3).height = 20;
  worksheet.getRow(4).height = 24;
  worksheet.getRow(5).height = 10; // Clean spacer row

  // Logo container cell block A1:B4 with Navy background & gold bottom border
  worksheet.mergeCells('A1:B4');
  const logoBlock = worksheet.getCell('A1');
  logoBlock.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: COLORS.NAVY },
  };
  logoBlock.border = {
    bottom: { style: 'thin', color: { argb: COLORS.GOLD } },
  };

  // Embed School Crest Logo (/images/logo.jpg or /logo.jpg)
  const logoAsset = await fetchSchoolLogoBuffer();
  if (logoAsset) {
    const imageId = workbook.addImage({
      buffer: logoAsset.buffer,
      extension: logoAsset.extension,
    });
    worksheet.addImage(imageId, {
      tl: { col: 0.35, row: 0.18 },
      ext: { width: 84, height: 84 },
      editAs: 'oneCell',
    });
  } else {
    logoBlock.value = 'KES';
    logoBlock.font = { name: 'Calibri', size: 18, bold: true, color: { argb: COLORS.GOLD } };
    logoBlock.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // Row 1 (C1:S1): Society Name
  worksheet.mergeCells('C1:S1');
  const row1Cell = worksheet.getCell('C1');
  row1Cell.value = "KHANATTI EDUCATION SOCIETY'S";
  row1Cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.GOLD } };
  row1Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY } };
  row1Cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  // Row 2 (C2:S2): School Name
  worksheet.mergeCells('C2:S2');
  const row2Cell = worksheet.getCell('C2');
  row2Cell.value = 'SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL';
  row2Cell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.WHITE } };
  row2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY } };
  row2Cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  // Row 3 (C3:S3): Address, Registration & Phone
  worksheet.mergeCells('C3:S3');
  const row3Cell = worksheet.getCell('C3');
  row3Cell.value =
    'Khanatti, Mudalgi Taluk, Belagavi Dist - 591312 | Reg: DRBG/SOR/1243/2025-2026 | Phone: +91 77957 70785';
  row3Cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.SLATE_LIGHT } };
  row3Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY } };
  row3Cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  // Row 4 (C4:S4): Gold Accent Report Subtitle Bar
  worksheet.mergeCells('C4:S4');
  const filterSuffix =
    gradeFilter && gradeFilter !== 'All Classes'
      ? `  •  Class: ${gradeFilter}${sectionFilter && sectionFilter !== 'All' ? ` (${sectionFilter})` : ''}`
      : '';
  const row4Cell = worksheet.getCell('C4');
  row4Cell.value = `OFFICIAL STUDENT DIRECTORY & FEE LEDGER REPORT  •  Academic Year: 2026–2027  •  Exported on: ${formatDateDDMMYYYY()}${filterSuffix}`;
  row4Cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.GOLD_TEXT } };
  row4Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GOLD_BG } };
  row4Cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  row4Cell.border = {
    bottom: { style: 'thin', color: { argb: COLORS.GOLD } },
  };

  // =========================================================================
  // 2. TABLE HEADER ROW (ROW 6)
  // =========================================================================
  const headerRow = worksheet.getRow(6);
  headerRow.height = 28;
  columns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY } };
    cell.alignment = {
      horizontal: col.align === 'right' ? 'right' : col.align === 'left' ? 'left' : 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = HEADER_BORDER;
  });

  // Enable AutoFilter across all header columns A6:S6
  worksheet.autoFilter = 'A6:S6';

  // =========================================================================
  // 3. STUDENT DATA ROWS (ROW 7+)
  // =========================================================================
  const firstDataRow = 7;
  let sumCabFee = 0;
  let sumTotalFee = 0;
  let sumPaidFee = 0;
  let sumBalanceDue = 0;

  students.forEach((st, idx) => {
    const rowNum = firstDataRow + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 22;

    const cabOptedIn = Boolean(st.transportDetails?.optedIn);
    const cabFee = cabOptedIn ? Number(st.transportDetails?.annualCabFee || 0) : 0;
    const paidAmt = Number(st.feeDetails?.amountPaid || 0);
    const totalFee = Math.max(
      Number(st.feeDetails?.admissionFeeAmount || paidAmt || 500),
      paidAmt
    );
    const balanceDue = Math.max(
      0,
      Number(st.feeDetails?.balanceDue ?? totalFee - paidAmt)
    );

    sumCabFee += cabFee;
    sumTotalFee += totalFee;
    sumPaidFee += paidAmt;
    sumBalanceDue += balanceDue;

    let feeStatusLabel = cleanText(st.feeDetails?.paymentStatus) || 'Pending';
    if (paidAmt > 0 && balanceDue === 0) {
      feeStatusLabel = 'Paid';
    } else if (paidAmt > 0 && balanceDue > 0) {
      feeStatusLabel = 'Partial';
    }

    const statusLabel = cleanText(st.status) || 'Active';

    const rowValues = [
      cleanText(st.admissionNumber),
      cleanText(st.studentName),
      cleanText(st.rollNumber),
      cleanText(st.grade),
      isSectionApplicable(st.section) ? cleanText(st.section) : '—',
      cleanText(st.gender),
      st.dateOfBirth ? formatDateDDMMYYYY(st.dateOfBirth) : '',
      cleanText(st.bloodGroup),
      cleanText(st.category),
      cleanText(st.aadhaarNumber || st.studentAadhaarNo),
      cleanText(st.father?.name || st.fatherName),
      cleanText(st.mother?.name || st.motherName),
      cleanText(st.primaryPhone || st.whatsappNumber),
      cabFee,
      totalFee,
      paidAmt,
      balanceDue,
      feeStatusLabel,
      statusLabel,
    ];

    const isEvenRow = idx % 2 === 1;
    const zebraFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isEvenRow ? COLORS.SLATE_ZEBRA : COLORS.WHITE },
    };

    rowValues.forEach((val, colIdx) => {
      const colMeta = columns[colIdx];
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.fill = zebraFill;
      cell.border = THIN_SLATE_BORDER;
      cell.font = {
        name: 'Calibri',
        size: 10,
        bold: colMeta.key === 'admNo' || colMeta.key === 'studentName',
        color: {
          argb:
            colMeta.key === 'admNo' || colMeta.key === 'studentName'
              ? COLORS.NAVY
              : COLORS.SLATE_TEXT,
        },
      };
      cell.alignment = {
        horizontal: colMeta.align,
        vertical: 'middle',
      };

      // Explicit Text format so 10-digit mobiles & 12-digit Aadhaar never show scientific notation
      if (colMeta.isText) {
        cell.numFmt = '@';
      }

      // Indian Rupee currency format
      if (colMeta.isCurrency) {
        cell.numFmt = '₹#,##0';
        if (colMeta.key === 'balanceDue' && Number(val) > 0) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.ROSE_TEXT } };
        } else if (colMeta.key === 'paidAmt' && Number(val) > 0) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.EMERALD_TEXT } };
        }
      }

      // Conditional styling for Fee Status column (U)
      if (colMeta.key === 'feeStatus') {
        const lower = String(val).toLowerCase();
        if (lower === 'paid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.EMERALD_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.EMERALD_TEXT } };
        } else if (lower === 'partial') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.GOLD_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.GOLD_TEXT } };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.ROSE_BG } };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.ROSE_TEXT } };
        }
      }

      // Conditional styling for Status column (V)
      if (colMeta.key === 'status') {
        const lower = String(val).toLowerCase();
        if (lower === 'active' || lower === 'enrolled') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.EMERALD } };
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.SLATE_MUTED } };
        }
      }
    });
  });

  // =========================================================================
  // 4. GRAND TOTAL SUMMARY ROW WITH EXCEL SUM FORMULAS
  // =========================================================================
  const lastDataRow = firstDataRow + students.length - 1;
  const totalRowNum = lastDataRow + 1;
  const totalRow = worksheet.getRow(totalRowNum);
  totalRow.height = 26;

  worksheet.mergeCells(`A${totalRowNum}:M${totalRowNum}`);
  const totalLabelCell = worksheet.getCell(`A${totalRowNum}`);
  totalLabelCell.value = `GRAND TOTAL (${students.length} ${students.length === 1 ? 'Student' : 'Students'})`;
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };

  // Set Excel SUM formulas for Cab Fee (N), Total Applicable Fee (O), Paid Amount (P), Balance Due (Q)
  totalRow.getCell(14).value = {
    formula: `SUM(N${firstDataRow}:N${lastDataRow})`,
    result: sumCabFee,
  };
  totalRow.getCell(15).value = {
    formula: `SUM(O${firstDataRow}:O${lastDataRow})`,
    result: sumTotalFee,
  };
  totalRow.getCell(16).value = {
    formula: `SUM(P${firstDataRow}:P${lastDataRow})`,
    result: sumPaidFee,
  };
  totalRow.getCell(17).value = {
    formula: `SUM(Q${firstDataRow}:Q${lastDataRow})`,
    result: sumBalanceDue,
  };
  totalRow.getCell(18).value = '';
  totalRow.getCell(19).value = '';

  for (let c = 1; c <= 19; c += 1) {
    const cell = totalRow.getCell(c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.NAVY } };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: c === 17 && sumBalanceDue > 0 ? 'FFFDE68A' : COLORS.WHITE },
    };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.GOLD } },
      left: { style: 'thin', color: { argb: 'FF334E73' } },
      bottom: { style: 'medium', color: { argb: COLORS.NAVY_DARK } },
      right: { style: 'thin', color: { argb: 'FF334E73' } },
    };
    if (c >= 14 && c <= 17) {
      cell.numFmt = '₹#,##0';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }
  }

  // =========================================================================
  // 5. TRIGGER NATIVE BROWSER .XLSX DOWNLOAD
  // =========================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayIso = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `KES_Student_Directory_Report_${todayIso}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
