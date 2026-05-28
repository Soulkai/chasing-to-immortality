const mongoose = require('mongoose');

const WorldEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['beast_invasion','sect_war','heavenly_tribulation','resource_bloom','cult_ritual'], required: true },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date, required: true },
  isGlobal: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('WorldEvent', WorldEventSchema);
