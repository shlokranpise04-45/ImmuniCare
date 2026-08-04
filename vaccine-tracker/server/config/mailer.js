require('dotenv').config();
const PDFDocument = require('pdfkit');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim();
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || 'ImmuniCare';

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    return { error: 'Brevo is not configured. Set BREVO_API_KEY to an active Brevo transactional-email API key in server/.env.' };
  }
  if (!fromEmail || !EMAIL_PATTERN.test(fromEmail)) {
    return { error: 'Brevo sender is not configured. Set EMAIL_FROM to a valid, verified sender email address in server/.env.' };
  }
  return { apiKey, fromEmail, fromName };
}

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

const formatMonths = (months) => {
  if (months == null) return 'N/A';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem}m`;
  if (rem === 0) return `${years}y`;
  return `${years}y ${rem}m`;
};

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const generateVaccinationPdf = (profile, status, petHistory = []) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  const pdf = new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const brandBlue = '#2563eb';
  const brandTeal = '#0f766e';
  const headingColor = '#0f172a';
  const bodyColor = '#475569';

  doc.fillColor(brandTeal).font('Helvetica-Bold').fontSize(24).text('ImmuniCare', { align: 'center' });
  doc.moveDown(0.2);
  doc.fillColor(bodyColor).font('Helvetica').fontSize(10).text('Preventive care insights and vaccination follow-up', { align: 'center' });
  doc.moveDown(0.6);

  doc.fillColor('#f8fafc').rect(40, 95, 515, 95).fill();
  doc.strokeColor('#dbeafe').lineWidth(1).rect(40, 95, 515, 95).stroke();

  doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(12).text('Patient Overview', 60, 110);
  doc.font('Helvetica').fontSize(11).fillColor(bodyColor);
  doc.text(`Patient name: ${profile.name}`, 60, 130);
  doc.text(`Date of birth: ${formatDate(profile.dob)}`, 60, 148);
  doc.text(`Gender: ${profile.gender || 'N/A'}`, 60, 166);
  doc.text(`Report generated: ${formatDate(new Date())}`, 340, 130);
  doc.text(`Care category: ${profile.category || 'General'}`, 340, 148);
  doc.moveDown(2.2);

  doc.moveDown(0.9);
  doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(14).text('At-a-glance Summary', 45, doc.y, { underline: false });
  doc.moveDown(0.7);

  const renderSummaryCard = (x, y, label, value, accentColor) => {
    doc.fillColor('#ffffff').rect(x, y, 140, 58).fill();
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(x, y, 140, 58).stroke();
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(9).text(label.toUpperCase(), x + 12, y + 10);
    doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(20).text(String(value), x + 12, y + 24);
  };

  renderSummaryCard(45, 240, 'Completed', status.completed.length, brandTeal);
  renderSummaryCard(205, 240, 'Overdue', status.overdue.length, '#dc2626');
  renderSummaryCard(365, 240, 'Upcoming', status.upcoming.length, '#d97706');
  doc.moveDown(3.6);

  const renderTable = (title, items, type) => {
    if (doc.y > 670) {
      doc.addPage();
    }
    doc.moveDown(0.7);
    doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(12).text(title, 45, doc.y);
    doc.moveDown(0.45);

    if (!items.length) {
      doc.fillColor(bodyColor).font('Helvetica').fontSize(10).text('No entries recorded at this time.', { indent: 14 });
      doc.moveDown();
      return;
    }

    const startX = 45;
    const rowHeight = 18;
    const col1Width = 220;
    const col2Width = 120;
    const col3Width = 120;
    const tableWidth = col1Width + col2Width + col3Width;

    doc.fillColor('#f8fafc').rect(startX, doc.y, tableWidth, 20).fill();
    doc.strokeColor('#dbeafe').lineWidth(0.7).rect(startX, doc.y, tableWidth, 20).stroke();
    doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(9).text('Vaccine / Item', startX + 8, doc.y + 5);
    doc.text('Status', startX + col1Width + 8, doc.y + 5);
    doc.text('Timing', startX + col1Width + col2Width + 8, doc.y + 5);
    doc.moveDown(0.9);

    items.forEach((item, index) => {
      const y = doc.y;
      const rowY = y;
      doc.strokeColor('#e2e8f0').lineWidth(0.5).rect(startX, rowY, tableWidth, rowHeight).stroke();
      const fillColor = type === 'overdue' ? '#fef2f2' : type === 'upcoming' ? '#fffbeb' : '#f0fdf4';
      doc.fillColor(fillColor).rect(startX, rowY, tableWidth, rowHeight).fill();

      const label = item.name || item.title || 'Untitled item';
      const statusText = type === 'completed' ? `${item.dosesTaken}/${item.totalDoses} doses` : type === 'overdue' ? 'Needs attention' : 'Scheduled';
      const timingText = type === 'completed' ? formatDate(item.dateTaken) : type === 'overdue' ? `Age ${formatMonths(item.nextDose?.ageMonths)}` : `Age ${formatMonths(item.nextDose?.ageMonths)}`;

      doc.fillColor(headingColor).font('Helvetica').fontSize(8).text(label, startX + 6, rowY + 4, { width: col1Width - 8 });
      doc.fillColor(bodyColor).font('Helvetica').fontSize(8).text(statusText, startX + col1Width + 6, rowY + 4, { width: col2Width - 8 });
      doc.fillColor(bodyColor).font('Helvetica').fontSize(8).text(timingText, startX + col1Width + col2Width + 6, rowY + 4, { width: col3Width - 8 });

      doc.moveDown(0.8);
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.moveDown(0.4);
  };

  renderTable('Completed Vaccinations', status.completed, 'completed');
  renderTable('Overdue Vaccines', status.overdue, 'overdue');
  renderTable('Upcoming Vaccines', status.upcoming, 'upcoming');

  if (profile.category === 'Pet') {
    renderTable('Pet History', petHistory, 'history');
  }

  if (doc.y > 680) {
    doc.addPage();
  }

  doc.moveDown(0.8);
  doc.fillColor(headingColor).font('Helvetica-Bold').fontSize(12).text('Care Notes', 45, doc.y, { underline: false });
  doc.moveDown(0.35);
  doc.fillColor(bodyColor).font('Helvetica').fontSize(10).text('This report is a concise summary of recorded and pending preventive care actions for the selected patient. Please review overdue items and plan follow-up doses as recommended.');
  doc.moveDown(1.2);
  doc.fillColor(brandBlue).font('Helvetica-Bold').fontSize(10).text('Prepared by ImmuniCare');
  doc.end();
  return pdf;
};

const sendReminderEmail = async (toEmail, profile, status, petHistory = []) => {
  const config = getBrevoConfig();
  if (config.error) {
    console.error('Email configuration error:', config.error);
    return { success: false, message: config.error };
  }
  if (!toEmail || !EMAIL_PATTERN.test(toEmail)) {
    return { success: false, message: 'Recipient email is invalid. Update the account email before sending a report.' };
  }

  try {
    const pdfBuffer = await generateVaccinationPdf(profile, status, petHistory);
    const pdfBase64 = pdfBuffer.toString('base64');
    const safeName = escapeHtml(profile.name || 'your patient');
    const overdueList = status.overdue.map(v => `<li style="margin-bottom:8px;">${escapeHtml(v.name)} — ${escapeHtml(v.nextDoseLabel)} <span style="color:#64748b;">(recommended at ${escapeHtml(formatMonths(v.nextDose?.ageMonths))})</span></li>`).join('');
    const upcomingList = status.upcoming.map(v => `<li style="margin-bottom:8px;">${escapeHtml(v.name)} — ${escapeHtml(v.nextDoseLabel)} <span style="color:#64748b;">(recommended at ${escapeHtml(formatMonths(v.nextDose?.ageMonths))})</span></li>`).join('');

    const html = `
    <div style="background:#f8fafc;padding:32px;font-family:Segoe UI, Arial, sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(135deg,#0f766e 0%,#2563eb 100%);padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.9;">ImmuniCare</div>
          <h1 style="margin:8px 0 8px;font-size:26px;line-height:1.2;">Vaccination report attached</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;opacity:0.95;">This report contains the latest vaccination summary for ${safeName}, including completed doses, overdue items, and upcoming care recommendations.</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 12px;font-size:15px;">Hello,</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">We’ve prepared a clear and professional summary for ${safeName}. The attached report outlines the current vaccination status and highlights the next steps that may need attention.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">At ImmuniCare, we help families stay on top of preventive care with simple, reliable updates and clear follow-up guidance.</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;margin:10px 0 20px;color:#334155;">
            <strong style="color:#0f172a;">What’s included in the report:</strong>
            <ul style="margin:8px 0 0 18px;padding:0;line-height:1.7;">
              <li>Completed vaccination records</li>
              <li>Overdue items requiring attention</li>
              <li>Upcoming recommendations for future care</li>
            </ul>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">Please review the attached PDF at your convenience and contact your care provider if you would like help planning the next steps.</p>
        </div>
        <div style="padding:0 32px 28px;color:#64748b;font-size:13px;line-height:1.6;">
          Kind regards,<br/>
          <strong>The ImmuniCare team</strong>
        </div>
      </div>
    </div>
    `;
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: config.fromEmail, name: config.fromName },
        to: [{ email: toEmail }],
        subject: `ImmuniCare vaccination report — ${profile.name}`,
        htmlContent: html,
        attachment: [
          {
            content: pdfBase64,
            name: `${profile.name.replace(/\s+/g, '_')}_vaccination_report.pdf`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Email send failed:', response.status, errText);
      if (response.status === 401) {
        return { success: false, message: 'Brevo rejected the API key. Set BREVO_API_KEY to an active Brevo API key (not a Resend key) and restart the server.' };
      }
      if ((response.status === 400 || response.status === 403) && /sender|from|verified/i.test(errText)) {
        return { success: false, message: `Brevo rejected EMAIL_FROM (${config.fromEmail}). Verify this sender email or its domain in Brevo before sending.` };
      }
      return { success: false, message: `Email service rejected the request (${response.status}): ${errText}` };
    }
    return { success: true };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, message: `Email send failed: ${err.message}` };
  }
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const config = getBrevoConfig();
  if (config.error) {
    console.error('Email configuration error:', config.error);
    return { success: false, message: config.error };
  }
  if (!toEmail || !EMAIL_PATTERN.test(toEmail)) {
    return { success: false, message: 'Recipient email is invalid.' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: config.fromEmail, name: config.fromName },
        to: [{ email: toEmail }],
        subject: 'Reset your ImmuniCare password',
        htmlContent: `
          <div style="background:#f8fafc;padding:32px;font-family:Segoe UI, Arial, sans-serif;color:#0f172a;">
            <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              <div style="background:linear-gradient(135deg,#0f766e 0%,#2563eb 100%);padding:24px 28px;color:#ffffff;">
                <h2 style="margin:0;font-size:24px;">Reset your password</h2>
                <p style="margin:8px 0 0;opacity:0.95;">We received a request to reset your ImmuniCare account password.</p>
              </div>
              <div style="padding:28px;line-height:1.7;color:#334155;">
                <p style="margin:0 0 12px;">Use the secure link below to continue and create a new password.</p>
                <p style="margin:0 0 16px;"><a href="${resetUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;">Reset password</a></p>
                <p style="margin:0;color:#64748b;">If you did not request this, you can safely ignore this message.</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Password reset email failed:', response.status, errText);
      return { success: false, message: `Email service rejected the request (${response.status})` };
    }

    return { success: true };
  } catch (err) {
    console.error('Password reset email failed:', err);
    return { success: false, message: `Email send failed: ${err.message}` };
  }
};

module.exports = { sendReminderEmail, sendPasswordResetEmail };
