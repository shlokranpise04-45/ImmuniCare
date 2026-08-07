const dns = require('dns');
const path = require('path');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');

const cors = require('cors');
const connectDB = require('./config/db');
const startReminderCron = require('./jobs/reminderCron');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const recordRoutes = require('./routes/recordRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const petRoutes = require('./routes/petRoutes');
const petEntryRoutes = require('./routes/petEntryRoutes');
const familyEntryRoutes = require('./routes/familyEntryRoutes');

const app = express();
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/profiles', familyEntryRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/pets', petEntryRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notify', notifyRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startReminderCron();
  });
});
