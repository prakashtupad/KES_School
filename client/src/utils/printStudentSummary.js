import { SCHOOL_INFO } from '../constants/schoolData';

/**
 * Resolve an asset path (like '/images/logo.jpg') to an absolute URL
 * so that popup print windows (about:blank) always load the school logo reliably.
 */
function resolveAbsoluteUrl(urlPath) {
  if (!urlPath) return '';
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://') || urlPath.startsWith('data:')) {
    return urlPath;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`;
}

/**
 * Print an individual student's Official Admission Summary with the School Logo in the header.
 */
export function printStudentAdmissionSummary(student) {
  if (!student) return;

  const printWin = window.open('', '_blank', 'width=880,height=740');
  if (!printWin) {
    window.print();
    return;
  }

  const logoSrc = resolveAbsoluteUrl(SCHOOL_INFO.logoUrl || '/images/logo.jpg');
  const studentPhotoSrc = student.documents?.studentPhotoUrl
    ? resolveAbsoluteUrl(student.documents.studentPhotoUrl)
    : '';

  const dobFormatted = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString('en-IN')
    : '—';

  const fatherName = student.father?.name || student.fatherName || '—';
  const motherName =
    student.mother?.name && String(student.mother.name) !== 'true'
      ? student.mother.name
      : student.motherName && String(student.motherName) !== 'true'
        ? student.motherName
        : '—';

  const village =
    student.residentialAddress?.villageOrTown || student.residentialVillage || 'Khanatti';

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Admission Summary - ${student.admissionNumber || student.studentName}</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body {
            font-family: Georgia, 'Times New Roman', serif;
            color: #1e293b;
            padding: 20px 24px;
            max-width: 780px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2.5px solid #1A365D;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .logo-wrap {
            width: 78px;
            height: 78px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-img {
            width: 74px;
            height: 74px;
            border-radius: 50%;
            object-fit: contain;
            border: 2px solid #D97706;
            padding: 2px;
            background: #ffffff;
          }
          .header-center {
            flex: 1;
            text-align: center;
          }
          .society {
            font-family: Arial, sans-serif;
            font-size: 10.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #475569;
          }
          .school {
            font-size: 20px;
            font-weight: bold;
            color: #1A365D;
            margin: 3px 0;
            line-height: 1.2;
          }
          .subline {
            font-family: Arial, sans-serif;
            font-size: 11.5px;
            color: #475569;
          }
          .badge {
            display: inline-block;
            font-family: Arial, sans-serif;
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #F59E0B;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-top: 7px;
          }
          .photo-box {
            width: 78px;
            height: 92px;
            flex-shrink: 0;
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 9px;
            color: #64748b;
            overflow: hidden;
            background: #f8fafc;
          }
          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .section-title {
            font-family: Arial, sans-serif;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1A365D;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 16px 0 8px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          td {
            padding: 6px 9px;
            border: 1px solid #cbd5e1;
          }
          td.label {
            font-weight: bold;
            background: #f8fafc;
            width: 26%;
            color: #334155;
          }
          td.val {
            width: 24%;
            color: #0f172a;
          }
          .sigs {
            display: flex;
            justify-content: space-between;
            margin-top: 52px;
            padding-top: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: bold;
            color: #334155;
          }
          .sig-line {
            border-top: 1px solid #94a3b8;
            padding-top: 6px;
            min-width: 170px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-wrap">
            <img class="logo-img" src="${logoSrc}" alt="School Logo" />
          </div>
          <div class="header-center">
            <div class="society">KHANATTI EDUCATION SOCIETY'S (REG- DRBG/SOR/1243/2025-2026)</div>
            <div class="school">Shri Siddharoodha English Medium School, Khanatti</div>
            <div class="subline">Taluk: Mudalgi, District: Belagavi • Phone: +91 77957 70785 • Email: kes2026@gmail.com</div>
            <div class="badge">OFFICIAL STUDENT ADMISSION SUMMARY (${student.academicYear || '2026-2027'})</div>
          </div>
          <div class="photo-box">
            ${
              studentPhotoSrc
                ? `<img src="${studentPhotoSrc}" alt="Student Photo" />`
                : '<span>Student<br/>Passport<br/>Photo</span>'
            }
          </div>
        </div>

        <div class="section-title">1. Institutional &amp; Student Particulars</div>
        <table>
          <tr>
            <td class="label">Admission No</td>
            <td class="val"><strong>${student.admissionNumber || '—'}</strong></td>
            <td class="label">Class &amp; Section</td>
            <td class="val"><strong>${student.grade || '—'} (Sec ${student.section || 'A'})</strong></td>
          </tr>
          <tr>
            <td class="label">Student Full Name</td>
            <td class="val"><strong>${student.studentName || '—'}</strong></td>
            <td class="label">Date of Birth &amp; Gender</td>
            <td class="val">${dobFormatted} (${student.gender || '—'})</td>
          </tr>
          <tr>
            <td class="label">Student Aadhaar No</td>
            <td class="val">${student.aadhaarNumber || student.studentAadhaarNo || '—'}</td>
            <td class="label">Blood Group &amp; Category</td>
            <td class="val">${student.bloodGroup || '—'} / ${student.category || 'General'}</td>
          </tr>
          <tr>
            <td class="label">Mother Tongue &amp; 3rd Lang</td>
            <td class="val">${student.motherTongue || 'Kannada'} / ${student.languageIII || 'Kannada'}</td>
            <td class="label">School Van / Transport</td>
            <td class="val">${student.transportRequired || student.schoolTransportOptIn ? 'Yes (Opted In)' : 'No (Self)'}</td>
          </tr>
        </table>

        <div class="section-title">2. Parent / Guardian &amp; Address Details</div>
        <table>
          <tr>
            <td class="label">Father's Name</td>
            <td class="val">${fatherName}</td>
            <td class="label">Mother's Name</td>
            <td class="val">${motherName}</td>
          </tr>
          <tr>
            <td class="label">Primary WhatsApp / Mobile</td>
            <td class="val"><strong>+91 ${student.primaryPhone || student.whatsappNumber || '—'}</strong></td>
            <td class="label">Village / Town</td>
            <td class="val">${village}</td>
          </tr>
        </table>

        <div class="section-title">3. Karnataka State Compliance (SATS / STS / PEN / APAAR)</div>
        <table>
          <tr>
            <td class="label">Karnataka STS No</td>
            <td class="val">${student.previousStudy?.stsNumber || '—'}</td>
            <td class="label">National PEN No</td>
            <td class="val">${student.previousStudy?.penNumber || '—'}</td>
          </tr>
          <tr>
            <td class="label">APAAR Edu ID</td>
            <td class="val">${student.previousStudy?.apaarId || '—'}</td>
            <td class="label">Previous School</td>
            <td class="val">${student.previousStudy?.schoolName || '—'}</td>
          </tr>
        </table>

        <div class="sigs">
          <div class="sig-line">Parent / Guardian Signature</div>
          <div class="sig-line">Office Clerk</div>
          <div class="sig-line">Headmaster / Principal Seal</div>
        </div>

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
              var loadedCount = 0;
              function checkDone() {
                loadedCount++;
                if (loadedCount >= imgs.length) {
                  setTimeout(triggerPrint, 120);
                }
              }
              imgs.forEach(function(img) {
                if (img.complete) {
                  checkDone();
                } else {
                  img.addEventListener('load', checkDone);
                  img.addEventListener('error', checkDone);
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
}

/**
 * Print the complete Student Directory table report with the School Logo in the header.
 */
export function printStudentDirectoryTable(students = [], gradeFilter = 'All Classes', sectionFilter = 'All') {
  if (!Array.isArray(students) || students.length === 0) return;

  const printWin = window.open('', '_blank', 'width=1050,height=760');
  if (!printWin) {
    window.print();
    return;
  }

  const logoSrc = resolveAbsoluteUrl(SCHOOL_INFO.logoUrl || '/images/logo.jpg');
  const rowsHtml = students
    .map((st, idx) => {
      const dob = st.dateOfBirth ? new Date(st.dateOfBirth).toLocaleDateString('en-IN') : '—';
      const father = st.father?.name || st.fatherName || '—';
      const sts = st.previousStudy?.stsNumber || '—';
      const pen = st.previousStudy?.penNumber || '—';
      return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${st.admissionNumber || '—'}</strong></td>
          <td><strong>${st.studentName || '—'}</strong></td>
          <td>${st.grade || '—'} (${st.section || 'A'})</td>
          <td>${dob} / ${st.gender || '—'}</td>
          <td>${father}</td>
          <td>+91 ${st.primaryPhone || st.whatsappNumber || '—'}</td>
          <td>${sts} / ${pen}</td>
          <td>${st.residentialAddress?.villageOrTown || st.residentialVillage || 'Khanatti'}</td>
        </tr>
      `;
    })
    .join('');

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Student Directory Report - Shri Siddharoodha EMS, Khanatti</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-family: Arial, sans-serif; color: #1e293b; padding: 12px; margin: 0; }
          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            border-bottom: 2.5px solid #1A365D;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .logo-img {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            object-fit: contain;
            border: 2px solid #D97706;
            padding: 2px;
            background: #ffffff;
          }
          .header-text { text-align: center; }
          .society { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; }
          .school { font-family: Georgia, serif; font-size: 19px; font-weight: bold; color: #1A365D; margin: 2px 0; }
          .subline { font-size: 11px; color: #475569; }
          .badge {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #F59E0B;
            padding: 3px 10px;
            border-radius: 4px;
            font-size: 10.5px;
            font-weight: bold;
            margin-top: 5px;
          }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #1A365D; color: #ffffff; padding: 6px 7px; text-align: left; border: 1px solid #1A365D; }
          td { padding: 5px 7px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo-img" src="${logoSrc}" alt="School Logo" />
          <div class="header-text">
            <div class="society">KHANATTI EDUCATION SOCIETY'S (REG- DRBG/SOR/1243/2025-2026)</div>
            <div class="school">Shri Siddharoodha English Medium School, Khanatti</div>
            <div class="subline">Taluk: Mudalgi, District: Belagavi • Phone: +91 77957 70785 • Email: kes2026@gmail.com</div>
            <div class="badge">STUDENT DIRECTORY REPORT • ${gradeFilter} (${sectionFilter === 'All' ? 'All Sections' : 'Sec ' + sectionFilter}) • Total: ${students.length}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Adm No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>DOB / Gender</th>
              <th>Father / Guardian</th>
              <th>Mobile / WhatsApp</th>
              <th>STS / PEN</th>
              <th>Village</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
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
              function done() {
                loaded++;
                if (loaded >= imgs.length) setTimeout(triggerPrint, 120);
              }
              imgs.forEach(function(img) {
                if (img.complete) done();
                else {
                  img.addEventListener('load', done);
                  img.addEventListener('error', done);
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
}
