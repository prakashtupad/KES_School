const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const escapeHtml = (unsafe = '') => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sends an HTML admission enquiry notification to ADMISSIONS_OFFICE_EMAIL / MAIL_TO_OFFICE.
 * @param {Object} enquiryData - Saved Enquiry document or object
 * @param {string} referenceId - Generated KES-XXXXXX reference ID
 */
const sendEnquiryNotification = async (enquiryData, referenceId) => {
  const recipientEmail =
    process.env.ADMISSIONS_OFFICE_EMAIL ||
    process.env.MAIL_TO_OFFICE ||
    'kes2026@gmail.com';

  const senderEmail =
    process.env.MAIL_FROM ||
    `"Shri Siddharoodha EMS Desk" <${process.env.SMTP_USER || 'kes2026@gmail.com'}>`;

  if (
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS === 'your-app-specific-password'
  ) {
    throw new Error('SMTP credentials are not configured with a live password.');
  }

  const transporter = createTransporter();

  const ref = escapeHtml(referenceId || enquiryData.referenceId);
  const guardianName = escapeHtml(enquiryData.guardianName);
  const studentName = escapeHtml(enquiryData.studentName);
  const classOfInterest = escapeHtml(enquiryData.classOfInterest);
  const phone = escapeHtml(enquiryData.phone || enquiryData.phoneNumber);
  const location = escapeHtml(enquiryData.location || enquiryData.villageTown);
  const needSchoolVan = escapeHtml(enquiryData.needSchoolVan || 'Not specified');
  const message = escapeHtml(enquiryData.message || enquiryData.optionalMessage || 'None provided');
  const submittedAt = new Date(enquiryData.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>New Admission Enquiry - ${ref}</title>
      </head>
      <body style="margin:0;padding:24px;background-color:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;color:#1E293B;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0F2342;padding:20px 24px;border-bottom:3px solid #D97706;">
              <p style="margin:0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#F59E0B;font-weight:700;">
                Khanatti Education Society’s
              </p>
              <h1 style="margin:4px 0 0;font-size:18px;color:#FFFFFF;font-family:Georgia,serif;">
                Shri Siddharoodha English Medium School, Khanatti
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="display:inline-block;background:#FEF3C7;color:#92400E;border:1px dashed #D97706;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:16px;">
                Reference ID: ${ref}
              </div>
              <h2 style="margin:0 0 12px;font-size:16px;color:#1A365D;">
                New Online Admission Enquiry Received
              </h2>
              <p style="margin:0 0 20px;font-size:13px;color:#475569;line-height:1.5;">
                A parent or guardian has submitted an admission enquiry via the official school website. Please review the details below and follow up by phone.
              </p>

              <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td width="38%" style="font-weight:700;color:#475569;background:#F8FAFC;">Reference Code</td>
                  <td style="font-weight:700;color:#1A365D;font-family:monospace;">${ref}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Parent / Guardian</td>
                  <td style="color:#0F172A;">${guardianName}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Student Name</td>
                  <td style="color:#0F172A;font-weight:600;">${studentName}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Class of Interest</td>
                  <td style="color:#0F172A;">${classOfInterest}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Phone Number</td>
                  <td style="color:#0F172A;font-family:monospace;font-weight:700;">
                    <a href="tel:+91${phone}" style="color:#1A365D;text-decoration:none;">+91 ${phone}</a>
                  </td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Village / Town</td>
                  <td style="color:#0F172A;">${location}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Need School Van?</td>
                  <td style="color:#0F172A;font-weight:700;">${needSchoolVan}</td>
                </tr>
                <tr style="border-bottom:1px solid #F1F5F9;">
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Message / Query</td>
                  <td style="color:#334155;line-height:1.5;">${message}</td>
                </tr>
                <tr>
                  <td style="font-weight:700;color:#475569;background:#F8FAFC;">Submitted On (IST)</td>
                  <td style="color:#64748B;">${submittedAt}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#F8FAFC;padding:14px 24px;border-top:1px solid #E2E8F0;font-size:11px;color:#64748B;text-align:center;">
              Automated notification from Shri Siddharoodha English Medium School Admissions Portal (Reg- DRBG/SOR/1243/2025-2026) • Khanatti, Gokak Taluk<br/>
              📞 +91 77957 70785 • ✉️ kes2026@gmail.com • <a href="https://www.instagram.com/khanatti_edu_society/" style="color:#1A365D;">Instagram</a> • <a href="https://www.facebook.com/profile.php?id=61590568034704" style="color:#1A365D;">Facebook</a>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject: `New Admission Enquiry [${ref}] - ${enquiryData.studentName} (${enquiryData.classOfInterest})`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEnquiryNotification,
  sendAdmissionsEmail: sendEnquiryNotification,
};
