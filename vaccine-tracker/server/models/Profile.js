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
    required: function requiredRelationship() { return this.category === 'Family'; },
  },
  category: { type: String, enum: ['Family', 'Pet'], default: 'Family', required: true },
  petType: {
    type: String,
    enum: ['Dog', 'Cat'],
    required: function requiredPetType() { return this.category === 'Pet'; },
  },
  breed: { type: String, trim: true },
}, { timestamps: true });
 
module.exports = mongoose.model('Profile', profileSchema);
