/**
 * Generates instant 1-Click WhatsApp URL for sending birthday wishes to a student's parents
 */
export const getStudentBirthdayWhatsAppUrl = (student) => {
  const phone =
    student.primaryPhone ||
    student.whatsappNumber ||
    student.father?.mobileNumber ||
    student.father?.mobile ||
    '';
  const cleanPhone = String(phone).replace(/\D/g, '');
  const targetPhone =
    cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone
      : cleanPhone;

  const parentName =
    student.father?.name || student.fatherName
      ? `Mr. ${student.father?.name || student.fatherName}`
      : 'Parent';
  const childName = student.studentName || 'Student';
  const secLabel =
    student.section && student.section !== 'N/A' ? ` (Sec ${student.section})` : '';
  const grade = `${student.grade || ''}${secLabel}`;

  const message =
`🎂 *HAPPY BIRTHDAY GREETINGS!*
🏛 *Shri Siddharoodha English Medium School, Khanatti*
────────────────────────
Dear ${parentName},

The Management, Headmaster, and Staff of Khanatti Education Society convey our heartfelt birthday greetings to *${childName}* (${grade}) on this special day! 🎉🌟

May the Almighty bless ${childName} with good health, happiness, bright intellect, and academic excellence in the coming year.

With Warmest Regards,
*Khanatti Education Society (KES)*
Khanatti, Mudalgi Taluk, Belagavi Dist.
📞 +91 77957 70785`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generates 1-Click WhatsApp URL for faculty/staff birthday
 */
export const getStaffBirthdayWhatsAppUrl = (staff) => {
  const cleanPhone = String(staff.phone || '').replace(/\D/g, '');
  const targetPhone =
    cleanPhone.length === 10
      ? `91${cleanPhone}`
      : cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? cleanPhone
      : cleanPhone;

  const message =
`💐 *HAPPY BIRTHDAY!*
🏛 *Khanatti Education Society (KES)*
────────────────────────
Dear *${staff.fullName}*,

On behalf of the Management and Colleagues at Shri Siddharoodha English Medium School, we wish you a very *Happy Birthday*! 🎂✨

Thank you for your valuable dedication and contribution toward the education and growth of our children. Wishing you peace, good health, and success!

Warm regards,
*Secretary / Headmaster*
KES Khanatti`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};
