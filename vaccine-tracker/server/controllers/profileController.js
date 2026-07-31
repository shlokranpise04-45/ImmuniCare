const Profile = require('../models/Profile');
 
exports.getProfiles = async (req, res) => {
  const category = req.query.category;
  const filter = { userId: req.userId };
  if (category === 'Family') {
    // Profiles created before categories were introduced remain family profiles.
    filter.$or = [{ category: 'Family' }, { category: { $exists: false } }];
  } else if (category === 'Pet') {
    filter.category = 'Pet';
  }
  const profiles = await Profile.find(filter).sort({ createdAt: 1 });
  res.json(profiles);
};
 
exports.createProfile = async (req, res) => {
  try {
    const { name, dob, gender, relationship, petType, breed } = req.body;
    const category = req.body.category === 'Pet' ? 'Pet' : 'Family';
    if (!name || !dob || !gender || (category === 'Family' && !relationship) || (category === 'Pet' && !petType)) {
      return res.status(400).json({ message: category === 'Pet' ? 'Name, date of birth, gender, and pet type are required' : 'Name, date of birth, gender, and relationship are required' });
    }

    const profile = await Profile.create({ userId: req.userId, name, dob, gender, relationship, category, petType, breed });
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
