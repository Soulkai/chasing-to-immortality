const mongoose = require('mongoose');

const FormationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['defensive','offensive','support','sealing','trap'], required: true },
  grade: { type: Number, default: 1, min: 1, max: 9 },
  requiredItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  regionBonus: {
    qiXpMultiplier: { type: Number, default: 1.0 },
    bodyXpMultiplier: { type: Number, default: 1.0 },
    mindXpMultiplier: { type: Number, default: 1.0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Formation', FormationSchema);
