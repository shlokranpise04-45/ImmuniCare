const Profile = require('../models/Profile');
const User = require('../models/User');
const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('../utils/statusCalc');
const { generateVaccinationPdf, sendGroupedUpcomingReminderEmail } = require('../config/mailer');

const addMonths = (date, months) => {
  if (!date) return null;
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

async function checkAndSendUpcomingReminders(userId) {
  const targetUserId = userId ? String(userId) : null;
  const userIds = targetUserId
    ? [targetUserId]
    : (await Profile.distinct('userId')).map((id) => String(id));

  for (const currentUserId of userIds) {
    const user = await User.findById(currentUserId);
    if (!user) continue;

    const profiles = await Profile.find({ userId: currentUserId });
    const reminder = {
      user,
      upcomingItems: [],
      recordIds: [],
      profileReports: [],
      profileIds: new Set(),
    };

    for (const profile of profiles) {
      const records = await VaccineRecord.find({ profileId: profile._id });
      const status = getVaccineStatus(profile, records);
      if (!status.upcoming.length) continue;

      const latestRecordByVaccine = new Map();
      for (const record of records) {
        const existing = latestRecordByVaccine.get(record.vaccineName);
        if (!existing || record.doseNumber > existing.doseNumber) {
          latestRecordByVaccine.set(record.vaccineName, record);
        }
      }

      const upcomingEntries = status.upcoming
        .map((entry) => {
          const latestRecord = latestRecordByVaccine.get(entry.name);
          if (!latestRecord || latestRecord.upcomingReminderSent) return null;
          return { entry, latestRecord };
        })
        .filter(Boolean);

      if (!upcomingEntries.length) continue;

      for (const { entry, latestRecord } of upcomingEntries) {
        reminder.upcomingItems.push({
          vaccineName: entry.name,
          profileName: profile.name,
          dueDate: formatDate(addMonths(profile.dob, entry.nextDose?.ageMonths)),
        });
        reminder.recordIds.push(latestRecord._id);
      }

      if (!reminder.profileIds.has(String(profile._id))) {
        reminder.profileReports.push({ profile, status, records });
        reminder.profileIds.add(String(profile._id));
      }
    }

    if (!reminder.upcomingItems.length) continue;

    const attachments = [];
    for (const report of reminder.profileReports) {
      const pdfBuffer = await generateVaccinationPdf(report.profile, report.status, []);
      attachments.push({
        content: pdfBuffer.toString('base64'),
        name: `${report.profile.name.replace(/\s+/g, '_')}_vaccination_report.pdf`,
      });
    }

    const emailResult = await sendGroupedUpcomingReminderEmail(
      reminder.user.email,
      reminder.user.name || reminder.user.email,
      reminder.upcomingItems,
      attachments,
    );

    if (!emailResult.success) {
      console.error(`Upcoming vaccine reminder failed for ${reminder.user.email}:`, emailResult.message);
      continue;
    }

    await VaccineRecord.updateMany(
      { _id: { $in: reminder.recordIds } },
      { $set: { upcomingReminderSent: true } },
    );
  }
}

module.exports = {
  checkAndSendUpcomingReminders,
};
