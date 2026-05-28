const mongoose = require('mongoose');

const WorldEventSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['boss_invasion','chaos_portal','tournament','tribulation_storm','treasure_reveal','sect_war'],
    required: true,
  },

  active:     { type: Boolean, default: true },
  startsAt:   { type: Date, required: true },
  endsAt:     { type: Date, required: true },

  // Região afetada (null = mundo todo)
  region:     { type: String, default: null },

  // Participantes
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],

  // Recompensas globais
  rewards: [{
    rank:     Number,
    items:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
    jade:     Number,
    title:    String,
  }],

  // Resultado
  resolved:   { type: Boolean, default: false },
  winner:     { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
}, { timestamps: true });

module.exports = mongoose.model('WorldEvent', WorldEventSchema);
