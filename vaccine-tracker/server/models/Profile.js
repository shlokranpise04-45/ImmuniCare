const mongoose = require('mongoose');
 
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  relationship: {
    type: String,
    enum: ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    required: true,
  },
}, { timestamps: true });
 
module.exports = mongoose.model('Profile', profileSchema);