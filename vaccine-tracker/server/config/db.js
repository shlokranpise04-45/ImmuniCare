const mongoose = require('mongoose');

async function ensureVaccineDoseIndex() {
  const collection = mongoose.connection.collection('vaccinerecords');
  const collections = await mongoose.connection.db.listCollections({ name: 'vaccinerecords' }).toArray();
  if (collections.length === 0) {
    await collection.createIndex(
      { profileId: 1, vaccineName: 1, doseNumber: 1 },
      { unique: true, name: 'profileId_1_vaccineName_1_doseNumber_1' },
    );
    return;
  }
  const indexes = await collection.indexes();
  const legacyIndex = indexes.find(index => index.unique
    && Object.keys(index.key).length === 2
    && index.key.profileId === 1
    && index.key.vaccineName === 1);

  if (legacyIndex) {
    await collection.dropIndex(legacyIndex.name);
    console.log(`Removed legacy vaccine index: ${legacyIndex.name}`);
  }

  await collection.createIndex(
    { profileId: 1, vaccineName: 1, doseNumber: 1 },
    { unique: true, name: 'profileId_1_vaccineName_1_doseNumber_1' },
  );
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await ensureVaccineDoseIndex();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
