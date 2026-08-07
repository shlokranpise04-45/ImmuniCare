const mongoose = require('mongoose');

const familyEntrySchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['medical_history', 'pregnancy', 'prescription', 'allergy', 'lab_report', 'surgery', 'hospital_visit', 'insurance', 'note', 'other'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  details: { type: String, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('FamilyEntry', familyEntrySchema);
