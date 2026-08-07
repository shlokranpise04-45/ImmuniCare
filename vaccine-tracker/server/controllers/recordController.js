const Profile = require('../models/Profile');
const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('../utils/statusCalc');
const { resetUpcomingReminderFlagsForProfile } = require('../utils/reminderUtils');
const { checkAndSendUpcomingReminders } = require('../utils/reminderService');
 

async function ownedProfile(profileId, userId) {
  return Profile.findOne({ _id: profileId, userId });
}
 
exports.getRecordsForProfile = async (req, res) => {
  const profile = await ownedProfile(req.params.profileId, req.userId);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
 
  const records = await VaccineRecord.find({ profileId: profile._id }).sort({ dateTaken: -1 });
  const status = getVaccineStatus(profile, records);
 
  res.json({ profile, records, status });
};
 
exports.addRecord = async (req, res) => {
  try {
    const profile = await ownedProfile(req.params.profileId, req.userId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
 
    const { vaccineName, dateTaken, doseNumber } = req.body;
    if (!vaccineName || !dateTaken) {
      return res.status(400).json({ message: 'vaccineName and dateTaken are required' });
    }
 
    const previousRecords = await VaccineRecord.find({ profileId: profile._id });
    const record = await VaccineRecord.create({
      profileId: profile._id,
      vaccineName,
      dateTaken,
      doseNumber: doseNumber || 1,
    });

    resetUpcomingReminderFlagsForProfile(profile, previousRecords).catch((resetErr) => {
      console.error('Failed to reset upcoming reminder flags after adding record:', resetErr);
    });
    try {
      const profiles = await Profile.find({ userId: req.userId });
      const upcomingRecords = [];
      for (const currentProfile of profiles) {
        const profileRecords = await VaccineRecord.find({ profileId: currentProfile._id });
        const status = getVaccineStatus(currentProfile, profileRecords);
        if (!status.upcoming.length) continue;

        const latestRecordByVaccine = new Map();
        for (const r of profileRecords) {
          const existing = latestRecordByVaccine.get(r.vaccineName);
          if (!existing || r.doseNumber > existing.doseNumber) {
            latestRecordByVaccine.set(r.vaccineName, r);
          }
        }

        for (const entry of status.upcoming) {
          const latestRecord = latestRecordByVaccine.get(entry.name);
          if (!latestRecord || latestRecord.upcomingReminderSent) continue;
          upcomingRecords.push({
            profileId: String(currentProfile._id),
            profileName: currentProfile.name,
            vaccineName: latestRecord.vaccineName,
            doseNumber: latestRecord.doseNumber,
            dateTaken: latestRecord.dateTaken,
            upcomingReminderSent: latestRecord.upcomingReminderSent,
            nextDoseNumber: entry.nextDoseNumber,
            nextDoseLabel: entry.nextDoseLabel,
          });
        }
      }
      console.log(`Upcoming vaccine records for user ${req.userId} before sending reminder:`, JSON.stringify(upcomingRecords, null, 2));
      await checkAndSendUpcomingReminders(req.userId);
    } catch (reminderErr) {
      console.error('Failed to send instant upcoming reminder after adding vaccine record:', reminderErr);
    }
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This dose is already recorded for this profile' });
    }
    res.status(500).json({ message: 'Failed to add record', error: err.message });
  }
};
 
exports.deleteRecord = async (req, res) => {
  const profile = await ownedProfile(req.params.profileId, req.userId);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
 
  const previousRecords = await VaccineRecord.find({ profileId: profile._id });
  const record = await VaccineRecord.findOneAndDelete({
    _id: req.params.recordId,
    profileId: profile._id,
  });
  if (!record) return res.status(404).json({ message: 'Record not found' });

  resetUpcomingReminderFlagsForProfile(profile, previousRecords).catch((resetErr) => {
    console.error('Failed to reset upcoming reminder flags after deleting record:', resetErr);
  });
  res.json({ message: 'Record deleted' });
};