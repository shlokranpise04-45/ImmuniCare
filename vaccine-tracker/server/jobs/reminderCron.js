const cron = require('node-cron');
const { checkAndSendUpcomingReminders } = require('../utils/reminderService');

function startReminderCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder job...');

    try {
      await checkAndSendUpcomingReminders();
    } catch (err) {
      console.error('Daily reminder job failed:', err);
    }

    console.log('Daily reminder job completed');
  });
}

module.exports = startReminderCron;
