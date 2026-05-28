const mongoose = require('mongoose');

// Registro permanente de personagens que chegaram ao fim das 9 vidas
const LegendSchema = new mongoose.Schema({
  player:      { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerPhone: { type: String, required: true },

  // Resumo da vida
  totalLives:   { type: Number, default: 9 },
  lifeHistory:  [{
    lifeNumber:   Number,
    name:         String,
    race:         String,
    clan:         String,
    talents:      [String],
    maxQiRealm:   Number,
    maxBodyRealm: Number,
    maxMindRealm: Number,
    karma:        Number,
    titles:       [String],
    destinyPoints:Number,
    causeOfDeath: String,
    diedAt:       Date,
  }],

  // Pontos de Destino totais ganhos
  totalDestinyPoints: { type: Number, default: 0 },

  // Feitos notáveis
  achievements: [String],

  // Título na Hall da Imortalidade
  hallTitle: { type: String, default: null },

  // Rank no Hall
  hallRank:  { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Legend', LegendSchema);
