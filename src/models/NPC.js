const mongoose = require('mongoose');

const NPCSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['master','rival','friend','merchant','quest_giver','cultist','elder'], required: true },
  sect: { type: mongoose.Schema.Types.ObjectId, ref: 'Sect', default: null },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
  minKarma: { type: Number, default: -100 },
  maxKarma: { type: Number, default: 100 },
  personality: { type: String, default: '' },
  affinityElement: { type: String, enum: ['none','metal','wood','water','fire','earth','yin','yang','lightning','wind','ice'], default: 'none' },
  initialOpinion: { type: Number, default: 0, min: -100, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('NPC', NPCSchema);
