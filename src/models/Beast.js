const mongoose = require('mongoose');

const BeastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic'], default: 'common' },
  element: { type: String, enum: ['none','metal','wood','water','fire','earth','yin','yang','lightning','wind','ice'], default: 'none' },
  baseStats: {
    hp: { type: Number, default: 100 },
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    speed: { type: Number, default: 5 },
  },
  tamable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Beast', BeastSchema);
