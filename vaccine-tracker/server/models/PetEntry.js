const mongoose = require('mongoose');

const petEntrySchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['medical', 'weight', 'document', 'note'], required: true },
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  details: { type: String, trim: true, default: '' },
  weightKg: { type: Number, min: 0 },
  documentUrl: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('PetEntry', petEntrySchema);
