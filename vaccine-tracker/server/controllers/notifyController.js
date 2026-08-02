const Profile = require('../models/Profile');
const User = require('../models/User');
const VaccineRecord = require('../models/VaccineRecord');
const PetEntry = require('../models/PetEntry');
const { getVaccineStatus } = require('../utils/statusCalc');
const { sendReminderEmail } = require('../config/mailer');

// Manual "Send reminder now" trigger — used for the live demo, since a daily
// cron job won't visibly fire in front of judges.
exports.sendNow = async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.profileId, userId: req.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const user = await User.findById(req.userId);
    if (!user?.email) return res.status(400).json({ message: 'Your account does not have a valid recipient email address.' });
    const records = await VaccineRecord.find({ profileId: profile._id });
    const status = getVaccineStatus(profile, records);

    const petHistory =
  profile.category === 'Pet'
    ? await PetEntry.find({
        profileId: profile._id,
        userId: req.userId,
      }).sort({ date: -1, createdAt: -1 })
    : [];
    if (!status.overdue.length && !status.upcoming.length) {
      return res.json({ message: 'No overdue or upcoming vaccines — nothing to send' });
    }

    const result = await sendReminderEmail(
  user.email,
  profile,
  status,
  petHistory
);
    if (!result.success) return res.status(502).json({ message: result.message || 'Email failed to send' });

    res.json({ message: `Reminder email sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reminder', error: err.message });
  }
};
