const Profile = require('../models/Profile');
const PetEntry = require('../models/PetEntry');
const FamilyEntry = require('../models/FamilyEntry');
const VaccineRecord = require('../models/VaccineRecord');
const { resetUpcomingReminderFlagsForProfile } = require('../utils/reminderUtils');
const { checkAndSendUpcomingReminders } = require('../utils/reminderService');
 
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
 
async function createProfile(req, res, forcedCategory) {
  try {
    const { name, dob, gender, relationship, petType, breed, isPregnant, pregnancyStatus, pregnancyDueDate } = req.body;
    const category = forcedCategory || (req.body.category === 'Pet' ? 'Pet' : 'Family');
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanBreed = typeof breed === 'string' ? breed.trim() : '';
    const validGender = ['Male', 'Female', 'Other'].includes(gender);
    const validRelationship = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'].includes(relationship);
    const validPetType = ['Dog', 'Cat'].includes(petType);

    if (!cleanName || !dob || !validGender || (category === 'Family' && !validRelationship) || (category === 'Pet' && !validPetType)) {
      return res.status(400).json({ message: category === 'Pet' ? 'Name, date of birth, gender, and pet type are required' : 'Name, date of birth, gender, and relationship are required' });
    }

    // Do not pass fields from the other category. Empty strings trigger Mongoose enum validation.
    const normalizedPregnancyStatus = typeof pregnancyStatus === 'string' && ['not_pregnant', 'pregnant', 'postpartum', 'unknown'].includes(pregnancyStatus)
      ? pregnancyStatus
      : (typeof isPregnant === 'boolean' ? (isPregnant ? 'pregnant' : 'not_pregnant') : 'not_pregnant');

    const profileData = category === 'Pet'
      ? { userId: req.userId, name: cleanName, dob, gender, category, petType, ...(cleanBreed ? { breed: cleanBreed } : {}) }
      : {
          userId: req.userId,
          name: cleanName,
          dob,
          gender,
          category,
          relationship,
          ...(typeof isPregnant === 'boolean' ? { isPregnant } : {}),
          pregnancyStatus: normalizedPregnancyStatus,
          ...(pregnancyDueDate ? { pregnancyDueDate } : {}),
        };
    const profile = await Profile.create(profileData);
    // New profiles may not yet have any vaccine records saved. Do not trigger reminders until there are saved VaccineRecord documents.
    res.status(201).json(profile);
  } catch (err) {
    console.error(`Failed to create ${forcedCategory || 'profile'}:`, err.message);
    res.status(400).json({ message: 'Failed to create profile', error: err.message });
  }
}

exports.createProfile = (req, res) => createProfile(req, res);
exports.createPet = (req, res) => createProfile(req, res, 'Pet');
 
exports.getProfileById = async (req, res) => {
  const profile = await Profile.findOne({ _id: req.params.id, userId: req.userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
};
 
exports.deleteProfile = async (req, res) => {
  const profile = await Profile.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  if (profile.category === 'Pet') await PetEntry.deleteMany({ profileId: profile._id, userId: req.userId });
  else await FamilyEntry.deleteMany({ profileId: profile._id, userId: req.userId });
  res.json({ message: 'Profile deleted' });
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id, userId: req.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const previousRecords = await VaccineRecord.find({ profileId: profile._id });
    const fields = profile.category === 'Pet'
      ? ['name', 'dob', 'gender', 'petType', 'breed']
      : ['name', 'dob', 'gender', 'relationship', 'isPregnant', 'pregnancyStatus', 'pregnancyDueDate'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    });
    await profile.save();

    resetUpcomingReminderFlagsForProfile(profile, previousRecords).catch((resetErr) => {
      console.error('Failed to reset upcoming reminder flags after updating profile:', resetErr);
    });
    res.json(profile);
  } catch (err) {
    console.error('Failed to update profile:', err.message);
    res.status(400).json({ message: 'Failed to update profile', error: err.message });
  }
};
