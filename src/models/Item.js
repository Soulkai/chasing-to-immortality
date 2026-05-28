const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  rarity: { type: String, enum: ['common','uncommon','rare','epic','legendary','mythic'], default: 'common' },
  type: { type: String, enum: ['material','equipment','tool','pill','formation','beast_core','consumable','quest'], required: true },
  slot: { type: String, enum: [null,'weapon','offhand','head','body','hands','legs','feet','ring','amulet','belt','cape'], default: null },
  stats: {
    hp: { type: Number, default: 0 },
    qi: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    strength: { type: Number, default: 0 },
    endurance: { type: Number, default: 0 },
    spirit: { type: Number, default: 0 },
    perception: { type: Number, default: 0 },
  },
  requirements: {
    minRealmQi: { type: Number, default: 0 },
    minRealmBody: { type: Number, default: 0 },
    minRealmMind: { type: Number, default: 0 },
  },
  element: { type: String, enum: ['none','metal','wood','water','fire','earth','yin','yang','lightning','wind','ice'], default: 'none' },
  isFood: { type: Boolean, default: false },
  price: {
    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    jade: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
