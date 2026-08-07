const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('./statusCalc');

const getLatestRecordsByVaccine = (records) => {
  const latestByVaccine = new Map();
  for (const record of records) {
    const current = latestByVaccine.get(record.vaccineName);
    if (!current || record.doseNumber > current.doseNumber) {
      latestByVaccine.set(record.vaccineName, record);
    }
  }
  return latestByVaccine;
};

const getUpcomingEntryKey = (entry) => `${entry.name}::${entry.nextDoseNumber ?? 0}`;

const getUpcomingEntryKeys = (status = {}) => new Set((status.upcoming || []).map(getUpcomingEntryKey));

const getNewUpcomingEntryKeys = (previousStatus = {}, currentStatus = {}) => {
  const previousKeys = getUpcomingEntryKeys(previousStatus);
  return (currentStatus.upcoming || [])
    .map((item) => getUpcomingEntryKey(item))
    .filter((key) => !previousKeys.has(key));
};

const resetUpcomingReminderFlagsForProfile = async (profile, previousRecords = null) => {
  const currentRecords = await VaccineRecord.find({ profileId: profile._id });
  const previousStatus = previousRecords ? getVaccineStatus(profile, previousRecords) : { upcoming: [] };
  const currentStatus = getVaccineStatus(profile, currentRecords);
  const newUpcomingKeys = new Set(getNewUpcomingEntryKeys(previousStatus, currentStatus));
  if (!newUpcomingKeys.size) return;

  const latestByVaccine = getLatestRecordsByVaccine(currentRecords);
  const recordIdsToReset = [];

  for (const upcoming of currentStatus.upcoming) {
    const key = getUpcomingEntryKey(upcoming);
    if (!newUpcomingKeys.has(key)) continue;
    const latestRecord = latestByVaccine.get(upcoming.name);
    if (latestRecord) recordIdsToReset.push(latestRecord._id);
  }

  if (!recordIdsToReset.length) return;
  await VaccineRecord.updateMany({ _id: { $in: recordIdsToReset } }, { $set: { upcomingReminderSent: false } });
};

module.exports = { resetUpcomingReminderFlagsForProfile };
