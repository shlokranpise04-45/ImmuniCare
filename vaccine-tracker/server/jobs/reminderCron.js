const cron = require('node-cron');
const Profile = require('../models/Profile');
const User = require('../models/User');
const VaccineRecord = require('../models/VaccineRecord');
const { getVaccineStatus } = require('../utils/statusCalc');
const { sendReminderEmail } = require('../config/mailer');


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
