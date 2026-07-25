const Profile = require('../models/Profile');
const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('../utils/statusCalc');
 
// verifies the profile belongs to the logged-in user before touching records
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
 
    const record = await VaccineRecord.create({
      profileId: profile._id,
      vaccineName,
      dateTaken,
      doseNumber: doseNumber || 1, // defaults to dose 1 if the frontend doesn't send it yet
    });
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
 
  const record = await VaccineRecord.findOneAndDelete({
    _id: req.params.recordId,
    profileId: profile._id,
  });
  if (!record) return res.status(404).json({ message: 'Record not found' });
  res.json({ message: 'Record deleted' });
};