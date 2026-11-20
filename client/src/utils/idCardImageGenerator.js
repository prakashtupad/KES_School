import { SCHOOL_INFO } from '../constants/schoolData';
import { getStudentInitials } from '../components/portal/SiblingSwitcherHeader';
import {
  formatIdCardDob,
  formatIndianPhone,
  PROMOTION_YEARS,
} from '../components/portal/StudentIdCard';

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCoverTopImage(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = 0; // object-top so face/head is never cropped
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Generates a high-resolution PNG Digital Copy of the Permanent Multi-Year Student ID Card
 * (Portrait 640x1016 or Landscape 1016x640; Front only or Front+Back side-by-side).
 */
export async function generateIdCardPng(
  student,
  { orientation = 'portrait', includeBack = false } = {}
) {
  const isPortrait = orientation === 'portrait';
  const cardW = isPortrait ? 640 : 1016;
  const cardH = isPortrait ? 1016 : 640;
  const gap = includeBack ? 48 : 0;
  const pad = 36;

  const canvas = document.createElement('canvas');
  canvas.width = includeBack ? cardW * 2 + gap + pad * 2 : cardW + pad * 2;
  canvas.height = cardH + pad * 2;
  const ctx = canvas.getContext('2d');

  // Soft Slate background around card
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const [logoImg, photoImg] = await Promise.all([
    loadImage(SCHOOL_INFO.logoUrl || '/images/logo.jpg'),
    loadImage(student.documents?.studentPhotoUrl || ''),
  ]);

  const fatherName = student.father?.name || student.fatherName || '—';
  const phoneDisplay = formatIndianPhone(
    student.primaryPhone || student.whatsappNumber || student.father?.mobile
  );
  const bloodGroup =
    student.bloodGroup && student.bloodGroup !== 'Unknown'
      ? student.bloodGroup
      : '';
  const stsNo = (
    student.stsNumber ||
    student.previousStudy?.stsNumber ||
    ''
  ).trim();
  const dobText = formatIdCardDob(student.dateOfBirth);
  const initials = getStudentInitials(student.studentName);
  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';
  const taluk = student.residentialAddress?.taluk || 'Mudalgi';
  const district = student.residentialAddress?.district || 'Belagavi';
  const pincode = student.residentialAddress?.pincode || '591312';

  const drawFrontCard = (ox, oy) => {
    ctx.save();
    drawRoundedRect(ctx, ox, oy, cardW, cardH, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip();

    const rows = [
      { label: 'Adm No:', value: student.admissionNumber || '—', mono: true, navy: true },
      { label: 'D.O.B:', value: dobText, mono: true },
      { label: 'Blood Group:', value: bloodGroup || '—', isBlood: Boolean(bloodGroup) },
      { label: "Father's Name:", value: fatherName },
      { label: 'Contact No:', value: phoneDisplay, mono: true, navy: true },
      ...(stsNo ? [{ label: 'STS / SATS No:', value: stsNo, mono: true }] : []),
    ];

    if (isPortrait) {
      // Navy Header
      ctx.fillStyle = '#1A365D';
      ctx.fillRect(ox, oy, cardW, 186);

      // Gold accent line under header
      ctx.fillStyle = '#D97706';
      ctx.fillRect(ox, oy + 186, cardW, 9);

      // Logo circle
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ox + 78, oy + 93, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#D97706';
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(logoImg, ox + 32, oy + 47, 92, 92);
        ctx.restore();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText("KHANATTI EDUCATION SOCIETY'S", ox + 144, oy + 46);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 23px Georgia, serif';
      ctx.fillText('SHRI SIDDHAROODHA ENGLISH', ox + 144, oy + 80);
      ctx.fillText('MEDIUM SCHOOL', ox + 144, oy + 110);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('Khanatti, Gokak Taluk', ox + 144, oy + 138);

      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillText('PERMANENT STUDENT IDENTITY CARD', ox + 144, oy + 164);

      // Student Photo Frame
      const pw = 194;
      const ph = 220;
      const px = ox + (cardW - pw) / 2;
      const py = oy + 220;

      ctx.save();
      drawRoundedRect(ctx, px, py, pw, ph, 20);
      ctx.fillStyle = '#1A365D';
      ctx.fill();
      ctx.clip();
      if (photoImg) {
        drawCoverTopImage(ctx, photoImg, px, py, pw, ph);
      } else {
        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(initials, px + pw / 2, py + ph / 2 + 22);
      }
      ctx.restore();

      drawRoundedRect(ctx, px, py, pw, ph, 20);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      // Overlapping STUDENT pill
      const pillW = 128;
      const pillH = 30;
      const pillX = ox + (cardW - pillW) / 2;
      const pillY = py + ph - 15;
      drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 15);
      ctx.fillStyle = '#D97706';
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('STUDENT', ox + cardW / 2, pillY + 21);

      // Student Full Name
      const nameY = pillY + 58;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 30px Georgia, serif';
      ctx.fillText(
        String(student.studentName || 'Student').toUpperCase().slice(0, 26),
        ox + cardW / 2,
        nameY
      );

      // Permanent Fields
      let ry = nameY + 42;
      const stepY = 38;

      rows.forEach((row) => {
        ctx.beginPath();
        ctx.arc(ox + 50, ry - 7, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#D97706';
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(row.label, ox + 66, ry);

        if (row.isBlood) {
          const bgW = 72;
          const bgH = 28;
          const bgX = ox + cardW - 46 - bgW;
          const bgY = ry - 21;
          drawRoundedRect(ctx, bgX, bgY, bgW, bgH, 8);
          ctx.fillStyle = '#B91C1C';
          ctx.fill();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px monospace';
          ctx.fillText(row.value, bgX + bgW / 2, ry - 1);
        } else {
          ctx.textAlign = 'right';
          ctx.fillStyle = row.navy ? '#1A365D' : '#0F172A';
          ctx.font = row.mono ? 'bold 20px monospace' : 'bold 20px Arial, sans-serif';
          ctx.fillText(String(row.value).slice(0, 22), ox + cardW - 46, ry);
        }

        ry += stepY;
      });

      // Always-Shown YEARLY VALIDATION Box
      const boxX = ox + 42;
      const boxW = cardW - 84;
      const boxY = oy + cardH - 184;
      const boxH = 88;

      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#94A3B8';
      ctx.stroke();

      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 28);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('YEARLY VALIDATION', ox + cardW / 2, boxY + 20);

      const colW = boxW / PROMOTION_YEARS.length;
      PROMOTION_YEARS.forEach((yr, i) => {
        const cx = boxX + i * colW;
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(cx, boxY + 29);
          ctx.lineTo(cx, boxY + boxH);
          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1A365D';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText(yr, cx + colW / 2, boxY + 52);

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx + 14, boxY + 76);
        ctx.lineTo(cx + colW - 14, boxY + 76);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

      // Clean Bottom Footer: White space left + PRINCIPAL signature line bottom right
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + cardW - 224, oy + cardH - 52);
      ctx.lineTo(ox + cardW - 46, oy + cardH - 52);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('PRINCIPAL', ox + cardW - 135, oy + cardH - 26);
    } else {
      // LANDSCAPE FRONT (1016 x 640)
      ctx.fillStyle = '#1A365D';
      ctx.fillRect(ox, oy, cardW, 134);

      ctx.fillStyle = '#D97706';
      ctx.fillRect(ox, oy + 134, cardW, 9);

      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ox + 72, oy + 67, 42, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#D97706';
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(logoImg, ox + 32, oy + 27, 80, 80);
        ctx.restore();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FCD34D';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText("KHANATTI EDUCATION SOCIETY'S", ox + 132, oy + 42);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px Georgia, serif';
      ctx.fillText('SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL', ox + 132, oy + 78);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText(
        'Khanatti, Gokak Taluk  •  PERMANENT STUDENT IDENTITY CARD',
        ox + 132,
        oy + 110
      );

      // Left Photo
      const px = ox + 46;
      const py = oy + 186;
      const pw = 216;
      const ph = 260;
      ctx.save();
      drawRoundedRect(ctx, px, py, pw, ph, 20);
      ctx.fillStyle = '#1A365D';
      ctx.fill();
      ctx.clip();
      if (photoImg) {
        drawCoverTopImage(ctx, photoImg, px, py, pw, ph);
      } else {
        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 64px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(initials, px + pw / 2, py + ph / 2 + 20);
      }
      ctx.restore();
      drawRoundedRect(ctx, px, py, pw, ph, 20);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      const pillW = 120;
      const pillH = 28;
      drawRoundedRect(ctx, px + (pw - pillW) / 2, py + ph - 14, pillW, pillH, 14);
      ctx.fillStyle = '#D97706';
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Arial, sans-serif';
      ctx.fillText('STUDENT', px + pw / 2, py + ph + 5);

      // Right Details
      const rx = ox + 300;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 31px Georgia, serif';
      ctx.fillText(
        String(student.studentName || 'Student').toUpperCase().slice(0, 28),
        rx,
        oy + 206
      );

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, oy + 222);
      ctx.lineTo(ox + cardW - 44, oy + 222);
      ctx.stroke();

      let ry = oy + 262;
      const stepY = 39;

      rows.forEach((row) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(row.label, rx, ry);

        if (row.isBlood) {
          const bgW = 74;
          const bgH = 28;
          const bgX = ox + cardW - 44 - bgW;
          const bgY = ry - 21;
          drawRoundedRect(ctx, bgX, bgY, bgW, bgH, 8);
          ctx.fillStyle = '#B91C1C';
          ctx.fill();
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px monospace';
          ctx.fillText(row.value, bgX + bgW / 2, ry - 1);
        } else {
          ctx.textAlign = 'right';
          ctx.fillStyle = row.navy ? '#1A365D' : '#0F172A';
          ctx.font = row.mono ? 'bold 20px monospace' : 'bold 20px Arial, sans-serif';
          ctx.fillText(String(row.value).slice(0, 28), ox + cardW - 44, ry);
        }

        ry += stepY;
      });

      // Always-Shown YEARLY VALIDATION Box bottom-left of right column
      const boxX = rx;
      const boxW = 436;
      const boxY = oy + cardH - 96;
      const boxH = 68;
      drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#94A3B8';
      ctx.stroke();

      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, 22);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('YEARLY VALIDATION', boxX + boxW / 2, boxY + 16);

      const colW = boxW / PROMOTION_YEARS.length;
      PROMOTION_YEARS.forEach((yr, i) => {
        const cx = boxX + i * colW;
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(cx, boxY + 23);
          ctx.lineTo(cx, boxY + boxH);
          ctx.strokeStyle = '#CBD5E1';
          ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1A365D';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillText(yr, cx + colW / 2, boxY + 42);
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx + 12, boxY + 58);
        ctx.lineTo(cx + colW - 12, boxY + 58);
        ctx.strokeStyle = '#CBD5E1';
        ctx.stroke();
        ctx.restore();
      });

      // Clean Bottom Footer: PRINCIPAL signature line bottom right
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + cardW - 220, oy + cardH - 52);
      ctx.lineTo(ox + cardW - 44, oy + cardH - 52);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('PRINCIPAL', ox + cardW - 132, oy + cardH - 26);
    }

    ctx.restore();

    // Outer navy border
    drawRoundedRect(ctx, ox, oy, cardW, cardH, 28);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1A365D';
    ctx.stroke();
  };

  const drawBackCard = (ox, oy) => {
    ctx.save();
    drawRoundedRect(ctx, ox, oy, cardW, cardH, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip();

    // Navy Header matching front
    const hdrH = isPortrait ? 168 : 124;
    ctx.fillStyle = '#1A365D';
    ctx.fillRect(ox, oy, cardW, hdrH);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(ox, oy + hdrH, cardW, 9);

    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ox + 76, oy + hdrH / 2, isPortrait ? 44 : 38, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#D97706';
      ctx.stroke();
      ctx.clip();
      const r = isPortrait ? 42 : 36;
      ctx.drawImage(logoImg, ox + 76 - r, oy + hdrH / 2 - r, r * 2, r * 2);
      ctx.restore();
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FCD34D';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText("KHANATTI EDUCATION SOCIETY'S", ox + 138, oy + (isPortrait ? 46 : 38));
    ctx.fillStyle = '#FFFFFF';
    ctx.font = isPortrait ? 'bold 22px Georgia, serif' : 'bold 24px Georgia, serif';
    if (isPortrait) {
      ctx.fillText('SHRI SIDDHAROODHA ENGLISH', ox + 138, oy + 80);
      ctx.fillText('MEDIUM SCHOOL', ox + 138, oy + 110);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('Khanatti, Gokak Taluk', ox + 138, oy + 140);
    } else {
      ctx.fillText('SHRI SIDDHAROODHA ENGLISH MEDIUM SCHOOL', ox + 138, oy + 74);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillText('Khanatti, Gokak Taluk', ox + 138, oy + 104);
    }

    if (isPortrait) {
      // Box 1: Residential Address
      drawRoundedRect(ctx, ox + 36, oy + 206, cardW - 72, 146, 16);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('RESIDENTIAL ADDRESS', ox + 58, oy + 244);
      ctx.fillStyle = '#1E293B';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText(`At & Post: ${village}, Taluk: ${taluk},`, ox + 58, oy + 286);
      ctx.fillText(`District: ${district} — Pin: ${pincode}`, ox + 58, oy + 320);

      // Box 2: Emergency School Helpline
      drawRoundedRect(ctx, ox + 36, oy + 378, cardW - 72, 148, 16);
      ctx.fillStyle = '#FFFBEB';
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('EMERGENCY SCHOOL HELPLINE', ox + 58, oy + 416);
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 23px monospace';
      ctx.fillText(`Phone: ${SCHOOL_INFO.phoneDisplay}`, ox + 58, oy + 458);
      ctx.fillStyle = '#475569';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText(`Email: ${SCHOOL_INFO.email}`, ox + 58, oy + 494);

      // Box 3: Important Instructions
      drawRoundedRect(ctx, ox + 36, oy + 552, cardW - 72, 268, 16);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();

      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText('IMPORTANT INSTRUCTIONS', ox + 58, oy + 592);
      ctx.fillStyle = '#334155';
      ctx.font = '19px Arial, sans-serif';
      ctx.fillText('1. This card must be worn by the student daily.', ox + 58, oy + 636);
      ctx.fillText('2. In case of loss, report to the school office', ox + 58, oy + 678);
      ctx.fillText('    immediately.', ox + 58, oy + 706);
      ctx.fillText('3. Retain this card for the primary school', ox + 58, oy + 748);
      ctx.fillText('    duration.', ox + 58, oy + 776);

      // Divider & Return notice
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox + 36, oy + cardH - 134);
      ctx.lineTo(ox + cardW - 36, oy + cardH - 134);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#334155';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(
        'If found, please return to: Shri Siddharoodha English',
        ox + cardW / 2,
        oy + cardH - 92
      );
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(
        'Medium School, Khanatti, Gokak Taluk',
        ox + cardW / 2,
        oy + cardH - 60
      );
    } else {
      // Landscape Back: 2-column top boxes + full-width instructions
      const halfW = (cardW - 96) / 2;

      // Residential Address
      drawRoundedRect(ctx, ox + 36, oy + 158, halfW, 134, 14);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('RESIDENTIAL ADDRESS', ox + 54, oy + 190);
      ctx.fillStyle = '#1E293B';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`At & Post: ${village}, Taluk: ${taluk},`, ox + 54, oy + 226);
      ctx.fillText(`District: ${district} — Pin: ${pincode}`, ox + 54, oy + 258);

      // Helpline
      drawRoundedRect(ctx, ox + 60 + halfW, oy + 158, halfW, 134, 14);
      ctx.fillStyle = '#FFFBEB';
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('EMERGENCY SCHOOL HELPLINE', ox + 78 + halfW, oy + 190);
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 21px monospace';
      ctx.fillText(`Phone: ${SCHOOL_INFO.phoneDisplay}`, ox + 78 + halfW, oy + 228);
      ctx.fillStyle = '#475569';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText(`Email: ${SCHOOL_INFO.email}`, ox + 78 + halfW, oy + 260);

      // Important Instructions
      drawRoundedRect(ctx, ox + 36, oy + 314, cardW - 72, 200, 14);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 17px Arial, sans-serif';
      ctx.fillText('IMPORTANT INSTRUCTIONS', ox + 56, oy + 348);
      ctx.fillStyle = '#334155';
      ctx.font = '18px Arial, sans-serif';
      ctx.fillText('1. This card must be worn by the student daily.', ox + 56, oy + 388);
      ctx.fillText(
        '2. In case of loss, report to the school office immediately.',
        ox + 56,
        oy + 428
      );
      ctx.fillText(
        '3. Retain this card for the primary school duration.',
        ox + 56,
        oy + 468
      );

      // Return notice
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1A365D';
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(
        'If found, please return to: Shri Siddharoodha English Medium School, Khanatti, Gokak Taluk',
        ox + cardW / 2,
        oy + cardH - 48
      );
    }

    ctx.restore();

    drawRoundedRect(ctx, ox, oy, cardW, cardH, 28);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1A365D';
    ctx.stroke();
  };

  drawFrontCard(pad, pad);
  if (includeBack) {
    drawBackCard(pad + cardW + gap, pad);
  }

  const safeAdm = String(student.admissionNumber || 'Student').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeName = String(student.studentName || 'IDCard')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `KES_Permanent_ID_${safeAdm}_${safeName}.png`;

  return {
    dataUrl: canvas.toDataURL('image/png', 1.0),
    fileName,
  };
}
