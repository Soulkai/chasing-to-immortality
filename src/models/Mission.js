const mongoose = require('mongoose');

const MissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  giverNPC: { type: mongoose.Schema.Types.ObjectId, ref: 'NPC', default: null },
  requesterPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  targetType: { type: String, enum: ['collect','hunt','deliver','escort','explore'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  targetQuantity: { type: Number, default: 1 },
  region: { type: mongoose.Schema.Types.ObjectId, ref: 'Region', default: null },
  minKarma: { type: Number, default: -100 },
  maxKarma: { type: Number, default: 100 },
  reward: {
    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    jade: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    reputation: { type: Number, default: 0 },
    karma: { type: Number, default: 0 },
  },
  status: { type: String, enum: ['open','accepted','completed','failed'], default: 'open' },
}, { timestamps: true });

module.exports = mongoose.model('Mission', MissionSchema);
