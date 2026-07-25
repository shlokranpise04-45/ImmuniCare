const Profile = require('../models/Profile');
 
exports.getProfiles = async (req, res) => {
  const profiles = await Profile.find({ userId: req.userId }).sort({ createdAt: 1 });
  res.json(profiles);
};
 
exports.createProfile = async (req, res) => {
  try {
    const { name, dob, gender, relationship } = req.body;
    if (!name || !dob || !gender || !relationship) {
      return res.status(400).json({ message: 'Name, dob, gender, and relationship are required' });
    }
 
    const profile = await Profile.create({ userId: req.userId, name, dob, gender, relationship });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create profile', error: err.message });
  }
};
 
exports.getProfileById = async (req, res) => {
  const profile = await Profile.findOne({ _id: req.params.id, userId: req.userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};
 
exports.deleteProfile = async (req, res) => {
  const profile = await Profile.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json({ message: 'Profile deleted' });
};
