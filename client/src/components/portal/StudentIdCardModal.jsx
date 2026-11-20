import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  Download,
  X,
  CreditCard,
  RectangleVertical,
  RectangleHorizontal,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { SCHOOL_INFO } from '../../constants/schoolData';
import StudentIdCard, {
  formatIdCardDob,
  formatIndianPhone,
  PROMOTION_YEARS,
} from './StudentIdCard';
import { getStudentInitials } from './SiblingSwitcherHeader';
import { generateIdCardPng } from '../../utils/idCardImageGenerator';

export default function StudentIdCardModal({
  isOpen = true,
  student = null,
  students = null,
  title = '',
  onClose,
}) {
  const [orientation, setOrientation] = useState('portrait');
  const [includeBack, setIncludeBack] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const [downloadMsg, setDownloadMsg] = useState('');

  if (!isOpen) return null;

  const cardList =
    Array.isArray(students) && students.length > 0
      ? students
      : student
        ? [student]
        : [];

  if (cardList.length === 0) return null;

  const isBatchMode = cardList.length > 1;

  const triggerDownload = (dataUrl, fileName) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSinglePng = async (targetStudent) => {
    const sid = targetStudent._id || targetStudent.admissionNumber || 'single';
    setDownloadingId(sid);
    setDownloadMsg('');
    try {
      const { dataUrl, fileName } = await generateIdCardPng(targetStudent, {
        orientation,
        includeBack,
      });
      triggerDownload(dataUrl, fileName);
      setDownloadMsg(`Digital ID Card saved as "${fileName}"!`);
      setTimeout(() => setDownloadMsg(''), 4000);
    } catch (err) {
      console.error('Failed to generate PNG ID card:', err);
    } finally {
      setDownloadingId('');
    }
  };

  const handleDownloadAllPngs = async () => {
    setDownloadingId('ALL');
    setDownloadMsg('');
    try {
      for (const st of cardList) {
        const { dataUrl, fileName } = await generateIdCardPng(st, {
          orientation,
          includeBack,
        });
        triggerDownload(dataUrl, fileName);
        await new Promise((r) => setTimeout(r, 220));
      }
      setDownloadMsg(
        `Downloaded ${cardList.length} Digital ID Card PNG file${cardList.length > 1 ? 's' : ''}!`
      );
      setTimeout(() => setDownloadMsg(''), 5000);
    } finally {
      setDownloadingId('');
    }
  };

  const handlePrintA4Sheet = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoSrc = `${origin}${SCHOOL_INFO.logoUrl || '/images/logo.jpg'}`;
    const isPortrait = orientation === 'portrait';

    const printWin = window.open('', '_blank', 'width=1000,height=820');
    if (!printWin) {
      window.print();
      return;
    }

    const resolvePhotoSrc = (url) => {
      if (!url) return '';
      if (url.startsWith('data:') || url.startsWith('http')) return url;
      return `${origin}${url}`;
    };

    const promoGridHtml = (compact = false) => `
      <div class="promo-box ${compact ? 'compact' : ''}">
        <div class="promo-hdr">YEARLY VALIDATION</div>
        <div class="promo-grid">
          ${PROMOTION_YEARS.map(
            (yr) => `
              <div class="promo-cell">
                <div class="promo-yr">${yr}</div>
                <div class="promo-line"></div>
              </div>
            `
          ).join('')}
        </div>
      </div>
    `;

    const renderFrontHtml = (st) => {
      const photoSrc = resolvePhotoSrc(st.documents?.studentPhotoUrl || '');
      const initials = getStudentInitials(st.studentName);
      const father = st.father?.name || st.fatherName || '—';
      const phone = formatIndianPhone(
        st.primaryPhone || st.whatsappNumber || st.father?.mobile
      );
      const bg = st.bloodGroup && st.bloodGroup !== 'Unknown' ? st.bloodGroup : '';
      const sts = (st.stsNumber || st.previousStudy?.stsNumber || '').trim();
      const dob = formatIdCardDob(st.dateOfBirth);

      const photoBlock = photoSrc
        ? `<img src="${photoSrc}" alt="${st.studentName}" class="stu-photo" />`
        : `<div class="stu-initials">${initials}</div>`;

      const bgCell = bg
        ? `<span class="pill-bg">${bg}</span>`
        : `<strong class="muted">—</strong>`;

      if (isPortrait) {
        return `
          <div class="crop-cell">
            <div class="id-card portrait">
              <div class="hdr">
                <img src="${logoSrc}" class="logo" alt="Logo" />
                <div class="hdr-txt">
                  <div class="soc">KHANATTI EDUCATION SOCIETY'S</div>
                  <div class="sch">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</div>
                  <div class="loc">Khanatti, Mudalagi Taluk</div>
                  <div class="perm">PERMANENT STUDENT IDENTITY CARD</div>
                </div>
              </div>
              <div class="body-p">
                <div class="photo-block">
                  <div class="photo-wrap">${photoBlock}</div>
                  <div class="stu-badge">STUDENT</div>
                </div>
                <div class="stu-name">${(st.studentName || '—').toUpperCase()}</div>
                <div class="meta-rows">
                  <div><span class="lbl"><i class="dot"></i>Adm No:</span><strong class="mono navy">${st.admissionNumber || '—'}</strong></div>
                  <div><span class="lbl"><i class="dot"></i>D.O.B:</span><strong class="mono">${dob}</strong></div>
                  <div><span class="lbl"><i class="dot"></i>Blood Group:</span>${bgCell}</div>
                  <div><span class="lbl"><i class="dot"></i>Father's Name:</span><strong>${father}</strong></div>
                  <div><span class="lbl"><i class="dot"></i>Contact No:</span><strong class="mono navy">${phone}</strong></div>
                  ${
                    sts
                      ? `<div><span class="lbl"><i class="dot"></i>STS / SATS No:</span><strong class="mono">${sts}</strong></div>`
                      : ''
                  }
                </div>
                ${promoGridHtml(false)}
                <div class="sig-row">
                  <div class="sig"><span>PRINCIPAL</span></div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="crop-cell">
          <div class="id-card landscape">
            <div class="hdr-l">
              <img src="${logoSrc}" class="logo-l" alt="Logo" />
              <div class="hdr-txt">
                <div class="soc">KHANATTI EDUCATION SOCIETY'S</div>
                <div class="sch-l">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</div>
                <div class="loc">Khanatti, Mudalagi Taluk • Permanent Student Identity Card</div>
              </div>
            </div>
            <div class="body-l">
              <div class="left-l">
                <div class="photo-block">
                  <div class="photo-wrap-l">${photoBlock}</div>
                  <div class="stu-badge">STUDENT</div>
                </div>
              </div>
              <div class="right-l">
                <div>
                  <div class="stu-name-l">${(st.studentName || '—').toUpperCase()}</div>
                  <div class="meta-rows-l">
                    <div><span>Adm No:</span><strong class="mono navy">${st.admissionNumber || '—'}</strong></div>
                    <div><span>D.O.B:</span><strong class="mono">${dob}</strong></div>
                    <div><span>Blood Group:</span>${bgCell}</div>
                    <div><span>Father's Name:</span><strong>${father}</strong></div>
                    <div><span>Contact No:</span><strong class="mono navy">${phone}</strong></div>
                    ${
                      sts
                        ? `<div><span>STS / SATS No:</span><strong class="mono">${sts}</strong></div>`
                        : ''
                    }
                  </div>
                </div>
                <div class="foot-l">
                  ${promoGridHtml(true)}
                  <div class="sig"><span>PRINCIPAL</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    const renderBackHtml = (st) => {
      const village =
        st.residentialAddress?.villageOrTown || st.residentialVillage || 'Khanatti';
      const taluk = st.residentialAddress?.taluk || 'Mudalgi';
      const district = st.residentialAddress?.district || 'Belagavi';
      const pincode = st.residentialAddress?.pincode || '591312';

      return `
        <div class="crop-cell">
          <div class="id-card ${isPortrait ? 'portrait' : 'landscape'} back-card">
            <div class="hdr-l">
              <img src="${logoSrc}" class="logo-l" alt="Logo" />
              <div class="hdr-txt">
                <div class="soc">KHANATTI EDUCATION SOCIETY'S</div>
                <div class="sch-l">SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL</div>
                <div class="loc">Khanatti, Mudalagi Taluk</div>
              </div>
            </div>
            <div class="back-body ${isPortrait ? '' : 'back-body-l'}">
              <div class="${isPortrait ? 'back-stack' : 'back-grid'}">
                <div class="back-box">
                  <div class="back-lbl">RESIDENTIAL ADDRESS</div>
                  <div class="back-val">At &amp; Post: <strong>${village}</strong>, Taluk: <strong>${taluk}</strong>, District: <strong>${district}</strong> — Pin: <strong class="mono">${pincode}</strong></div>
                </div>
                <div class="back-box amber">
                  <div class="back-lbl amber-txt">EMERGENCY SCHOOL HELPLINE</div>
                  <div class="back-phone">Phone: <strong class="mono">${SCHOOL_INFO.phoneDisplay}</strong></div>
                  <div class="back-sub">Email: ${SCHOOL_INFO.email}</div>
                </div>
                <div class="back-box ${isPortrait ? '' : 'span-2'}">
                  <div class="back-lbl">IMPORTANT INSTRUCTIONS</div>
                  <ol class="inst-list">
                    <li>1. This card must be worn by the student daily.</li>
                    <li>2. In case of loss, report to the school office immediately.</li>
                    <li>3. Retain this card for the primary school duration.</li>
                  </ol>
                </div>
              </div>
              <div class="back-ret">
                If found, please return to: <strong>Shri Siddharoodha English Medium School, Khanatti, Mudalagi Taluk</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    const cardsMarkup = cardList
      .map((st) => `${renderFrontHtml(st)}${includeBack ? renderBackHtml(st) : ''}`)
      .join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Permanent Student ID Cards (${cardList.length}) - KES Khanatti</title>
          <style>
            @page { size: A4 portrait; margin: 6mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #fff; color: #0f172a; }
            .sheet {
              display: grid;
              grid-template-columns: ${isPortrait ? 'repeat(3, 56mm)' : 'repeat(2, 88mm)'};
              gap: ${isPortrait ? '3.5mm' : '2mm'};
              justify-content: center;
            }
            .crop-cell {
              padding: 0.8mm;
              border: 0.3mm dashed #94a3b8;
              display: flex;
              align-items: center;
              justify-content: center;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .id-card {
              background: #fff;
              border: 1.4pt solid #1A365D;
              border-radius: 3mm;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .id-card.portrait { width: 54mm; height: 86mm; }
            .id-card.landscape { width: 86mm; height: 54mm; }
            .hdr { background: #1A365D; color: #fff; padding: 2mm 2.2mm; display: flex; align-items: center; gap: 1.8mm; border-bottom: 1.8pt solid #D97706; }
            .logo { width: 8.8mm; height: 8.8mm; border-radius: 50%; background: #fff; border: 1pt solid #D97706; object-fit: contain; padding: 0.4mm; flex-shrink: 0; }
            .hdr-txt { min-width: 0; }
            .soc { font-size: 4.9pt; font-weight: bold; color: #FCD34D; letter-spacing: 0.3pt; }
            .sch { font-family: Georgia, serif; font-size: 6.4pt; font-weight: bold; line-height: 1.12; margin-top: 0.3mm; }
            .loc { font-size: 5.4pt; color: #e2e8f0; margin-top: 0.3mm; }
            .perm { font-size: 4.8pt; font-weight: bold; color: #fde68a; letter-spacing: 0.3pt; margin-top: 0.3mm; }
            .body-p { padding: 1.8mm 2.5mm 1.8mm; flex: 1; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
            .photo-block { position: relative; display: flex; justify-content: center; margin-bottom: 1.4mm; }
            .photo-wrap { width: 16.5mm; height: 18.8mm; border-radius: 2mm; border: 1.2pt solid #D97706; overflow: hidden; background: #1A365D; display: flex; align-items: center; justify-content: center; }
            .stu-photo { width: 100%; height: 100%; object-fit: cover; object-position: top; }
            .stu-initials { color: #D97706; font-family: Georgia, serif; font-size: 13pt; font-weight: bold; }
            .stu-badge { position: absolute; bottom: -1.4mm; background: #D97706; color: #fff; font-size: 4.9pt; font-weight: 800; padding: 0.3mm 2mm; border-radius: 2mm; letter-spacing: 0.4pt; }
            .stu-name { text-align: center; font-family: Georgia, serif; font-size: 8.4pt; font-weight: bold; color: #1A365D; margin-top: 0.6mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .meta-rows { margin-top: 1mm; font-size: 6.2pt; display: flex; flex-direction: column; gap: 0.65mm; }
            .meta-rows div, .meta-rows-l div { display: flex; justify-content: space-between; align-items: center; gap: 1.5mm; }
            .lbl { display: inline-flex; align-items: center; gap: 1mm; color: #475569; font-weight: 600; }
            .dot { width: 1.1mm; height: 1.1mm; border-radius: 50%; background: #D97706; display: inline-block; }
            .meta-rows strong, .meta-rows-l strong { color: #0f172a; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 28mm; }
            .mono { font-family: monospace; }
            .navy { color: #1A365D !important; }
            .muted { color: #94a3b8 !important; }
            .pill-bg { background: #B91C1C; color: #fff; font-family: monospace; font-size: 5.8pt; font-weight: bold; padding: 0.3mm 1.5mm; border-radius: 1mm; }
            .promo-box { margin-top: 1mm; border: 0.5pt solid #94a3b8; border-radius: 1.2mm; overflow: hidden; }
            .promo-box.compact { flex: 1; margin-top: 0; margin-right: 2mm; }
            .promo-hdr { background: #f1f5f9; color: #1A365D; font-size: 4.6pt; font-weight: bold; text-align: center; padding: 0.4mm; border-bottom: 0.4pt solid #cbd5e1; }
            .promo-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
            .promo-cell { border-right: 0.4pt solid #cbd5e1; padding: 0.6mm 0.4mm; text-align: center; }
            .promo-cell:last-child { border-right: none; }
            .promo-yr { font-size: 4.5pt; font-weight: bold; color: #1A365D; }
            .promo-line { height: 2mm; border-bottom: 0.4pt dashed #cbd5e1; margin: 0.5mm 0.8mm 0; }
            .sig-row { display: flex; justify-content: flex-end; align-items: flex-end; margin-top: 1.4mm; }
            .sig { border-top: 0.6pt solid #475569; width: 15mm; text-align: center; font-size: 5pt; font-weight: bold; color: #1A365D; letter-spacing: 0.5pt; padding-top: 0.4mm; }
            /* Landscape */
            .hdr-l { background: #1A365D; color: #fff; padding: 1.6mm 2.4mm; display: flex; align-items: center; gap: 1.8mm; border-bottom: 1.6pt solid #D97706; }
            .logo-l { width: 7.2mm; height: 7.2mm; border-radius: 50%; background: #fff; border: 0.8pt solid #D97706; object-fit: contain; padding: 0.3mm; flex-shrink: 0; }
            .sch-l { font-family: Georgia, serif; font-size: 6.8pt; font-weight: bold; line-height: 1.1; }
            .body-l { flex: 1; padding: 1.8mm 2.4mm; display: flex; gap: 2.5mm; align-items: stretch; background: #fff; }
            .left-l { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .photo-wrap-l { width: 18mm; height: 21.5mm; border-radius: 2mm; border: 1.2pt solid #D97706; overflow: hidden; background: #1A365D; display: flex; align-items: center; justify-content: center; }
            .right-l { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
            .stu-name-l { font-family: Georgia, serif; font-size: 8.6pt; font-weight: bold; color: #1A365D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-bottom: 0.6mm; border-bottom: 0.5pt solid #e2e8f0; }
            .meta-rows-l { font-size: 6pt; display: flex; flex-direction: column; gap: 0.55mm; margin-top: 0.6mm; }
            .meta-rows-l span { color: #475569; font-weight: 600; }
            .meta-rows-l strong { max-width: 36mm; }
            .foot-l { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 0.8mm; }
            /* Back Side */
            .back-body { flex: 1; padding: 2.2mm; display: flex; flex-direction: column; justify-content: space-between; font-size: 6.2pt; background: #fff; }
            .back-body-l { padding: 1.6mm 2.2mm; font-size: 5.8pt; }
            .back-stack { display: flex; flex-direction: column; gap: 1.8mm; }
            .back-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm; }
            .span-2 { grid-column: span 2; }
            .back-box { background: #F8FAFC; border: 0.6pt solid #cbd5e1; border-radius: 1.8mm; padding: 1.5mm 2mm; }
            .back-box.amber { background: #FFFBEB; border-color: #F59E0B; }
            .back-lbl { font-size: 5.3pt; font-weight: bold; color: #1A365D; letter-spacing: 0.3pt; }
            .amber-txt { color: #92400E !important; }
            .back-val { color: #334155; margin-top: 0.6mm; line-height: 1.3; }
            .back-val strong { color: #1A365D; }
            .back-phone { color: #1e293b; font-size: 6.4pt; margin-top: 0.6mm; }
            .back-phone strong { color: #1A365D; }
            .back-sub { font-size: 5.8pt; color: #475569; margin-top: 0.3mm; }
            .inst-list { list-style: none; margin: 0.7mm 0 0; padding: 0; color: #334155; font-size: 5.6pt; line-height: 1.35; }
            .inst-list li { margin-bottom: 0.4mm; }
            .back-ret { text-align: center; font-size: 5.5pt; color: #475569; border-top: 0.5pt solid #e2e8f0; padding-top: 1.2mm; line-height: 1.3; }
            .back-ret strong { color: #1A365D; }
          </style>
        </head>
        <body>
          <div class="sheet">${cardsMarkup}</div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.focus(); window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const modalNode = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 flex flex-col items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Permanent Digital Student ID Card Generator"
    >
      {/* Top Studio Toolbar */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-5 mb-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A365D] text-[#D97706] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D97706] block">
                Permanent Multi-Year CR80 Standard • A4 Sheet Print Studio
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A365D]">
                {title ||
                  (isBatchMode
                    ? `Batch Student ID Cards (${cardList.length} Students)`
                    : `Digital Student ID Card — ${cardList[0].studentName}`)}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Controls Bar: Orientation, Sides, Download PNG, Print A4 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Orientation Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  orientation === 'portrait'
                    ? 'bg-[#1A365D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                <RectangleVertical className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Portrait ID (54×86mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  orientation === 'landscape'
                    ? 'bg-[#1A365D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Landscape ID (86×54mm)</span>
              </button>
            </div>

            {/* Front vs Front + Back Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setIncludeBack(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !includeBack
                    ? 'bg-[#D97706] text-[#1A365D] shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => setIncludeBack(true)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  includeBack
                    ? 'bg-[#D97706] text-[#1A365D] shadow-xs'
                    : 'text-slate-600 hover:text-[#1A365D]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Front + Back Side</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={Boolean(downloadingId)}
              onClick={() =>
                isBatchMode
                  ? handleDownloadAllPngs()
                  : handleDownloadSinglePng(cardList[0])
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadingId
                  ? 'Generating PNG...'
                  : isBatchMode
                    ? `Download All (${cardList.length}) Digital PNGs`
                    : 'Download Digital Copy (PNG)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrintA4Sheet}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A365D] hover:bg-brand-navyDark text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>
                {isBatchMode
                  ? `Print A4 Sheet (${cardList.length} Cards)`
                  : 'Print ID Card (A4)'}
              </span>
            </button>
          </div>
        </div>

        {downloadMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{downloadMsg}</span>
          </div>
        )}
      </div>

      {/* Live Preview Canvas */}
      <div className="w-full max-w-5xl bg-[#F8FAFC] rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-start justify-center gap-6">
          {cardList.map((st, idx) => (
            <div
              key={st._id || st.admissionNumber || idx}
              className="flex flex-col items-center gap-2.5 p-3 rounded-2xl border border-dashed border-slate-300 bg-white/80"
            >
              <div className="flex flex-wrap items-center justify-center gap-4">
                <StudentIdCard
                  student={st}
                  orientation={orientation}
                  side="front"
                />
                {includeBack && (
                  <StudentIdCard
                    student={st}
                    orientation={orientation}
                    side="back"
                  />
                )}
              </div>

              {isBatchMode && (
                <button
                  type="button"
                  disabled={downloadingId === (st._id || st.admissionNumber)}
                  onClick={() => handleDownloadSinglePng(st)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-[#1A365D] hover:text-emerald-800 border border-slate-200 text-[11px] font-bold transition cursor-pointer"
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span>Download {st.admissionNumber} PNG</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode;
}
