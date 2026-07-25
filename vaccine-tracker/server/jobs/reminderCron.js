const cron = require('node-cron');
const Profile = require('../models/Profile');
const User = require('../models/User');
const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('../utils/statusCalc');
const { sendReminderEmail } = require('../config/mailer');

// Runs daily at 9:00 AM server time.
// NOTE: on a free-tier host that spins down when idle, this won't fire
// reliably unless something keeps the app awake — fine for demo purposes,
// but for real production use you'd want an external scheduler (e.g. a
// hosted cron pinging a /api/notify endpoint) instead of relying on uptime.
function startReminderCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder job...');
    const profiles = await Profile.find();

    for (const profile of profiles) {
      const user = await User.findById(profile.userId);
      if (!user) continue;

      const records = await VaccineRecord.find({ profileId: profile._id });
      const status = getVaccineStatus(profile, records);

      if (status.overdue.length || status.upcoming.length) {
        await sendReminderEmail(user.email, profile, status);
      }
    }

    console.log('Daily reminder job completed');
  });
}

module.exports = startReminderCron;
