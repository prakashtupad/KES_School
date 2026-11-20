import { SCHOOL_INFO } from '../constants/schoolData';

/**
 * Generates a pre-filled WhatsApp Absentee Alert link for a parent whose ward
 * was marked Absent on the given YYYY-MM-DD dateString.
 */
export const getAbsenteeWhatsAppUrl = (student, dateString) => {
  const rawPhone =
    student?.whatsappNumber ||
    student?.primaryPhone ||
    student?.father?.mobile ||
    student?.father?.mobileNumber ||
    '';
  const digits = String(rawPhone).replace(/\D/g, '');
  const targetPhone = digits.length === 10 ? `91${digits}` : digits;

  const parsedDate = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const formattedDate = Number.isNaN(parsedDate.getTime())
    ? dateString
    : parsedDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const rawFather = student?.father?.name || student?.fatherName || '';
  const parentName = rawFather ? `Mr. ${rawFather}` : 'Parent / Guardian';

  const secNorm = String(student?.section || '').trim().toUpperCase();
  const hasSec =
    secNorm &&
    secNorm !== 'N/A' &&
    secNorm !== 'NOT APPLICABLE' &&
    secNorm !== 'NONE' &&
    secNorm !== 'ALL';
  const classLabel = hasSec
    ? `${student?.grade || ''} - Sec ${student.section}`
    : `${student?.grade || ''}`;

  const remarkLine = student?.remarks
    ? `\n*Teacher Note:* ${student.remarks}\n`
    : '';

  const message =
    `⚠️ *ABSENTEE ALERT — ATTENDANCE NOTICE*\n` +
    `🏛 *${SCHOOL_INFO.schoolName}, Khanatti*\n` +
    `────────────────────────\n` +
    `Dear ${parentName},\n\n` +
    `This is to inform you that your ward *${student?.studentName || 'Student'}* (${classLabel}, Adm No: ${student?.admissionNumber || '—'}) has been marked *ABSENT* today (*${formattedDate}*).${remarkLine}\n` +
    `If your child is on leave due to health or personal reasons, kindly reply to this message or inform the class teacher.\n\n` +
    `For urgent queries, please contact the school office:\n` +
    `📞 ${SCHOOL_INFO.phoneDisplay || '+91 77957 70785'}\n\n` +
    `Warm regards,\n` +
    `*Class Teacher & Administration*\n` +
    `${SCHOOL_INFO.societyName || 'Khanatti Education Society'} (KES)`;

  if (!targetPhone) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};
