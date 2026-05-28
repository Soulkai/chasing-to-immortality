const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  dangerLevel: { type: Number, default: 1, min: 1, max: 10 },
  minRealmQi: { type: Number, default: 0 },
  maxRealmQi: { type: Number, default: 3 },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  beasts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beast' }],
  npcs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NPC' }],
  cultivationBonus: {
    qiXpMultiplier: { type: Number, default: 1.0 },
    bodyXpMultiplier: { type: Number, default: 1.0 },
    mindXpMultiplier: { type: Number, default: 1.0 },
    epiphanyChanceBonus: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Region', RegionSchema);
