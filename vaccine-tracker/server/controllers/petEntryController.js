const Profile = require('../models/Profile');
const PetEntry = require('../models/PetEntry');
const { checkAndSendUpcomingReminders } = require('../utils/reminderService');

async function ownedPet(profileId, userId) {
  return Profile.findOne({ _id: profileId, userId, category: 'Pet' });
}

exports.listEntries = async (req, res) => {
  try {
    const pet = await ownedPet(req.params.petId, req.userId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    const entries = await PetEntry.find({ profileId: pet._id, userId: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Failed to load pet entries:', err.message);
    res.status(500).json({ message: 'Failed to load pet records' });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const pet = await ownedPet(req.params.petId, req.userId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    const { type, title, date, details, weightKg, documentUrl } = req.body;
    if (!type || !title || !date) return res.status(400).json({ message: 'Type, title, and date are required' });
    if (type === 'weight' && (weightKg === undefined || Number.isNaN(Number(weightKg)))) {
      return res.status(400).json({ message: 'A valid weight is required' });
    }
    if (type === 'document' && !documentUrl) return res.status(400).json({ message: 'A document link is required' });
    const entry = await PetEntry.create({ profileId: pet._id, userId: req.userId, type, title, date, details, weightKg, documentUrl });
    try {
      await checkAndSendUpcomingReminders(req.userId);
    } catch (reminderErr) {
      console.error('Failed to send instant upcoming reminder after creating pet entry:', reminderErr);
    }
    res.status(201).json(entry);
  } catch (err) {
    console.error('Failed to create pet entry:', err.message);
    res.status(400).json({ message: 'Failed to save pet record', error: err.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const pet = await ownedPet(req.params.petId, req.userId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    const entry = await PetEntry.findOneAndDelete({ _id: req.params.entryId, profileId: pet._id, userId: req.userId });
    if (!entry) return res.status(404).json({ message: 'Pet record not found' });
    res.json({ message: 'Pet record deleted' });
  } catch (err) {
    console.error('Failed to delete pet entry:', err.message);
    res.status(500).json({ message: 'Failed to delete pet record' });
  }
};
