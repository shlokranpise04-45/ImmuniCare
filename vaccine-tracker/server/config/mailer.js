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

const generateVaccinationPdf = (profile, status, petHistory = []) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];
  const pdf = new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  doc.fontSize(20).fillColor('#0f172a').text('Vaccination Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#475569');
  doc.text(`Patient: ${profile.name}`);
  doc.text(`Date of birth: ${formatDate(profile.dob)}`);
  doc.text(`Gender: ${profile.gender || 'N/A'}`);
  doc.text(`Report date: ${formatDate(new Date())}`);
  doc.moveDown();

  doc.fillColor('#0f766e').fontSize(14).text('Summary', { underline: true });
  doc.moveDown(0.25);
  doc.fillColor('#0f172a').fontSize(11);
  doc.text(`Completed vaccines: ${status.completed.length}`);
  doc.text(`Overdue vaccines: ${status.overdue.length}`);
  doc.text(`Upcoming vaccines: ${status.upcoming.length}`);
  doc.moveDown();

  const renderList = (title, items, renderRow) => {
    doc.fillColor('#0f172a').fontSize(13).text(title);
    doc.moveDown(0.2);
    if (!items.length) {
      doc.fillColor('#64748b').fontSize(11).text('None recorded.', { indent: 20 });
      doc.moveDown();
      return;
    }
    items.forEach(item => {
      renderRow(item);
      doc.moveDown(0.4);
      if (doc.y > 720) {
        doc.addPage();
      }
    });
    doc.moveDown();
  };

  renderList('Completed Vaccinations', status.completed, (item) => {
    doc.fillColor('#0f172a').fontSize(11).text(`${item.name} — ${item.dosesTaken}/${item.totalDoses} doses`, { indent: 20 });
    doc.fillColor('#64748b').fontSize(10).text(`Last dose taken: ${formatDate(item.dateTaken)}`, { indent: 36 });
  });

  renderList('Overdue Vaccines', status.overdue, (item) => {
    doc.fillColor('#991b1b').fontSize(11).text(`${item.name} — ${item.nextDoseLabel}`, { indent: 20 });
    doc.fillColor('#64748b').fontSize(10).text(`Recommended age: ${formatMonths(item.nextDose.ageMonths)}`, { indent: 36 });
    doc.text(`Reason: overdue now`, { indent: 36 });
  });

  renderList('Upcoming Vaccines', status.upcoming, (item) => {
    doc.fillColor('#ca8a04').fontSize(11).text(`${item.name} — ${item.nextDoseLabel}`, { indent: 20 });
    doc.fillColor('#64748b').fontSize(10).text(`Recommended age: ${formatMonths(item.nextDose.ageMonths)}`, { indent: 36 });
    doc.text(`Status: due soon`, { indent: 36 });
  });

  if (profile.category === 'Pet') {
  renderList('Pet History', petHistory, (entry) => {
    doc.fillColor('#0f172a').fontSize(11).text(entry.title, { indent: 20 });

    doc.fillColor('#64748b').fontSize(10).text(
      `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} • ${formatDate(entry.date)}`,
      { indent: 36 }
    );

    if (entry.weightKg !== undefined) {
      doc.text(`Weight: ${entry.weightKg} kg`, { indent: 36 });
    }

    if (entry.details) {
      doc.text(`Details: ${entry.details}`, { indent: 36 });
    }

    if (entry.documentUrl) {
      doc.text(`Document: ${entry.documentUrl}`, { indent: 36 });
    }
  });
}

  doc.fillColor('#0f172a').fontSize(14).text('Important Notes', { underline: true });
  doc.moveDown(0.2);
  doc.fillColor('#475569').fontSize(11).text('This report is a summary of recorded and pending vaccinations for the selected patient. Please review overdue items and schedule follow-up doses as recommended.');
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
    const overdueList = status.overdue.map(v => `<li>${v.name} — ${v.nextDoseLabel} (recommended at ${formatMonths(v.nextDose?.ageMonths)})</li>`).join('');
    const upcomingList = status.upcoming.map(v => `<li>${v.name} — ${v.nextDoseLabel} (recommended at ${formatMonths(v.nextDose?.ageMonths)})</li>`).join('');

    const html = `
    <div style="font-family: Arial, sans-serif; color: #102a43; line-height: 1.5;">
      <h2 style="color: #0f766e;">Vaccination report for ${profile.name}</h2>
      <p>This email includes a full PDF report attachment with the patient’s vaccination status, completed doses, overdue doses, and upcoming recommendations.</p>
      ${status.overdue.length ? `<h3 style="color: #991b1b;">Overdue vaccines</h3><ul>${overdueList}</ul>` : ''}
      ${status.upcoming.length ? `<h3 style="color: #ca8a04;">Upcoming vaccines</h3><ul>${upcomingList}</ul>` : ''}
      <p style="margin-top: 16px; color: #475569;">Open the attached PDF to review the complete vaccination summary and next steps.</p>
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
        subject: `Vaccination report — ${profile.name}`,
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

module.exports = { sendReminderEmail };
