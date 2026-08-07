const fs = require('fs');
const path = require('path');
const { generateVaccinationPdf } = require('../config/mailer');

(async () => {
  const profile = {
    name: 'Sample Patient',
    dob: '2018-01-10',
    gender: 'Female',
    category: 'General',
  };

  const status = {
    completed: Array.from({ length: 3 }, (_, i) => ({
      name: `Completed Vaccine ${i + 1}`,
      dosesTaken: 1,
      totalDoses: 1,
      dateTaken: '2024-01-01',
    })),
    overdue: Array.from({ length: 24 }, (_, i) => ({
      name: `MMR (Measles, Mumps, Rubella) ${i + 1}`,
      nextDoseLabel: 'Needs attention',
      nextDose: { ageMonths: 9 },
    })),
    upcoming: Array.from({ length: 3 }, (_, i) => ({
      name: `Upcoming Vaccine ${i + 1}`,
      nextDoseLabel: 'Scheduled',
      nextDose: { ageMonths: 12 + i },
    })),
  };

  const pdfBuffer = await generateVaccinationPdf(profile, status, []);
  const outputPath = path.join(__dirname, '..', 'tmp-sample-report.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`Generated ${outputPath}`);
})();
