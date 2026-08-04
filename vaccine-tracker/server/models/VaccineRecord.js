const mongoose = require('mongoose');
 
const vaccineRecordSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  vaccineName: { type: String, required: true },
  doseNumber: { type: Number, required: true, default: 1 },
  dateTaken: { type: Date, required: true },
}, { timestamps: true });
 
vaccineRecordSchema.index({ profileId: 1, vaccineName: 1, doseNumber: 1 }, { unique: true });
 
module.exports = mongoose.model('VaccineRecord', vaccineRecordSchema);