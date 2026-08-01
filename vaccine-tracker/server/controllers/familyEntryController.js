const Profile = require('../models/Profile');
const FamilyEntry = require('../models/FamilyEntry');

const RECORD_TYPES = ['medical_history', 'vaccination', 'prescription', 'allergy', 'lab_report', 'surgery', 'hospital_visit', 'insurance', 'note', 'other'];

async function ownedFamilyProfile(profileId, userId) {
  return Profile.findOne({ _id: profileId, userId, category: { $ne: 'Pet' } });
}

exports.listEntries = async (req, res) => {
  try {
    const profile = await ownedFamilyProfile(req.params.profileId, req.userId);
    if (!profile) return res.status(404).json({ message: 'Family profile not found' });
    const entries = await FamilyEntry.find({ profileId: profile._id, userId: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Failed to load family entries:', err.message);
    res.status(500).json({ message: 'Failed to load family records' });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const profile = await ownedFamilyProfile(req.params.profileId, req.userId);
    if (!profile) return res.status(404).json({ message: 'Family profile not found' });
    const { type, title, date, details } = req.body;
    if (!RECORD_TYPES.includes(type) || !title?.trim() || !date) {
      return res.status(400).json({ message: 'A valid record type, title, and date are required' });
    }
    const entry = await FamilyEntry.create({ profileId: profile._id, userId: req.userId, type, title: title.trim(), date, details: details?.trim() || '' });
    res.status(201).json(entry);
  } catch (err) {
    console.error('Failed to create family entry:', err.message);
    res.status(400).json({ message: 'Failed to save family record', error: err.message });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const profile = await ownedFamilyProfile(req.params.profileId, req.userId);
    if (!profile) return res.status(404).json({ message: 'Family profile not found' });
    const { type, title, date, details } = req.body;
    if (!RECORD_TYPES.includes(type) || !title?.trim() || !date) {
      return res.status(400).json({ message: 'A valid record type, title, and date are required' });
    }
    const entry = await FamilyEntry.findOneAndUpdate(
      { _id: req.params.entryId, profileId: profile._id, userId: req.userId },
      { type, title: title.trim(), date, details: details?.trim() || '' },
      { new: true, runValidators: true },
    );
    if (!entry) return res.status(404).json({ message: 'Family record not found' });
    res.json(entry);
  } catch (err) {
    console.error('Failed to update family entry:', err.message);
    res.status(400).json({ message: 'Failed to update family record', error: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const profile = await ownedFamilyProfile(req.params.profileId, req.userId);
    if (!profile) return res.status(404).json({ message: 'Family profile not found' });
    const entry = await FamilyEntry.findOneAndDelete({ _id: req.params.entryId, profileId: profile._id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: 'Family record not found' });
    res.json({ message: 'Family record deleted' });
  } catch (err) {
    console.error('Failed to delete family entry:', err.message);
    res.status(500).json({ message: 'Failed to delete family record' });
  }
};
