require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');
const VaccineRecord = require('../models/VaccineRecord');

async function run() {
  let profileId;
  const user = await User.create({
    name: 'Dose Test',
    email: `dose-test-${Date.now()}@example.test`,
    passwordHash: 'not-used-by-this-test',
  });

  try {
    const profile = await Profile.create({
      userId: user._id,
      name: 'Dose Test Pet',
      dob: new Date('2024-01-01'),
      gender: 'Other',
      category: 'Pet',
      petType: 'Dog',
    });
    profileId = profile._id;

    await VaccineRecord.create({ profileId: profile._id, vaccineName: 'DHPP', doseNumber: 1, dateTaken: new Date('2024-03-01') });
    await VaccineRecord.create({ profileId: profile._id, vaccineName: 'DHPP', doseNumber: 2, dateTaken: new Date('2024-04-01') });
    await VaccineRecord.create({ profileId: profile._id, vaccineName: 'DHPP', doseNumber: 3, dateTaken: new Date('2024-05-01') });

    let duplicateBlocked = false;
    try {
      await VaccineRecord.create({ profileId: profile._id, vaccineName: 'DHPP', doseNumber: 2, dateTaken: new Date('2024-04-02') });
    } catch (err) {
      duplicateBlocked = err.code === 11000;
    }
    if (!duplicateBlocked) throw new Error('Duplicate Dose 2 was not blocked');

    console.log('Vaccine dose duplicate test passed');
  } finally {
    if (profileId) await VaccineRecord.deleteMany({ profileId });
    await Profile.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(run)
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  });
