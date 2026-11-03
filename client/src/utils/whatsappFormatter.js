/**
 * Formats homework assignments into clean, bold WhatsApp-ready markdown strings.
 */
export const formatHomeworkWhatsApp = (
  hw,
  schoolName = 'Shri Siddharoodha EMS, Khanatti'
) => {
  const formattedDate = hw.dueDate
    ? new Date(hw.dueDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Next working day';

  const sectionLabel = hw.section ? ` (Section ${hw.section})` : '';

  const text = `📚 *${schoolName}*
🏛 *Khanatti Education Society*
─────────────────────
📝 *DAILY HOMEWORK UPDATE*
• *Class:* ${hw.grade}${sectionLabel}
• *Subject:* ${hw.subject}
• *Topic:* ${hw.title}
• *Due Date:* ${formattedDate}
─────────────────────
📌 *Instructions:*
${hw.description}
─────────────────────
_Please ensure your child completes and carries the notebook tomorrow._
📞 Office: +91 77957 70785`;

  return encodeURIComponent(text);
};

/**
 * Creates 1-Click WhatsApp Group broadcast URL (opens WhatsApp share drawer)
 */
export const getWhatsAppGroupBroadcastUrl = (hw) => {
  const encodedText = formatHomeworkWhatsApp(hw);
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Creates 1-Click direct message URL for a specific parent's mobile number
 */
export const getDirectParentWhatsAppUrl = (phone, hw, studentName) => {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedText = formatHomeworkWhatsApp(hw);
  const personalizedGreeting = encodeURIComponent(
    `Dear Parent, here is the homework update for *${studentName}*:\n\n`
  );
  return `https://wa.me/${phoneWithCountry}?text=${personalizedGreeting}${encodedText}`;
};

/**
 * Creates a general 1-Click WhatsApp chat URL for a parent's mobile number from the Student Directory
 */
export const getDirectStudentChatUrl = (phone, studentName, grade) => {
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const greeting = encodeURIComponent(
    `Namaste! This is from Khanatti Education Society's Shri Siddharoodha English Medium School, Khanatti regarding your child *${studentName}* (${grade}).`
  );
  return `https://wa.me/${phoneWithCountry}?text=${greeting}`;
};
