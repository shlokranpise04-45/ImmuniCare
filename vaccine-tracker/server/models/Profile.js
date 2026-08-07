const mongoose = require('mongoose');

// Optional category-specific fields must be absent rather than an empty string;
// otherwise Mongoose's enum validator treats "" as an invalid selected value.
const emptyStringToUndefined = value => (typeof value === 'string' && value.trim() === '' ? undefined : value);
 
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  isPregnant: { type: Boolean, default: false },
  pregnancyStatus: {
    type: String,
    enum: ['not_pregnant', 'pregnant', 'postpartum', 'unknown'],
    default: 'not_pregnant',
  },
  pregnancyDueDate: { type: Date },
  relationship: {
    type: String,
    enum: ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'],
    set: emptyStringToUndefined,
    required: function requiredRelationship() { return this.category === 'Family'; },
  },
  category: { type: String, enum: ['Family', 'Pet'], default: 'Family', required: true },
  petType: {
    type: String,
    enum: ['Dog', 'Cat'],
    set: emptyStringToUndefined,
    required: function requiredPetType() { return this.category === 'Pet'; },
  },
  breed: { type: String, trim: true, set: emptyStringToUndefined },
}, { timestamps: true });
 
module.exports = mongoose.model('Profile', profileSchema);
