const mongoose = require('mongoose');

const TechniqueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic'], default: 'common' },
  cultivationType: { type: String, enum: ['qi','body','mind','multi','support','combat','movement'], required: true },
  paths: [{ type: String, enum: ['qi','body','mind'] }],
  element: { type: String, enum: ['none','metal','wood','water','fire','earth','yin','yang','lightning','wind','ice'], default: 'none' },
  grade: { type: Number, default: 1, min: 1, max: 9 },
  maxMastery: { type: Number, default: 10 },
  baseXpBonus: { type: Number, default: 1.0 },
  breakthroughBonus: { type: Number, default: 0 },
  clanAffinity: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Technique', TechniqueSchema);
