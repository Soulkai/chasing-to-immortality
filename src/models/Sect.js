const mongoose = require('mongoose');

const SectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  philosophy: { type: String, default: '' },
  alignment: { type: String, enum: ['orthodox','neutral','demonic'], default: 'neutral' },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Sect', SectSchema);
