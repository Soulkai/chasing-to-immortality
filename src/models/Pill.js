const mongoose = require('mongoose');

const PillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic'], default: 'common' },
  tier: { type: Number, default: 1, min: 1, max: 9 },
  effects: {
    hpRestore: { type: Number, default: 0 },
    qiRestore: { type: Number, default: 0 },
    cultivationXpQi: { type: Number, default: 0 },
    cultivationXpBody: { type: Number, default: 0 },
    cultivationXpMind: { type: Number, default: 0 },
    temporaryBuffMinutes: { type: Number, default: 0 },
  },
  sideEffects: {
    karma: { type: Number, default: 0 },
    deviationChance: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Pill', PillSchema);
