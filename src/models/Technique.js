const mongoose = require('mongoose');

const TechniqueSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },

  // Tipo de cultivo que habilita
  cultivationType: {
    type: String,
    enum: ['qi','body','mind','combat','movement','support'],
    required: true,
  },

  // Raridade
  rarity: {
    type: String,
    enum: ['mortal','earth','heaven','divine','chaos'],
    default: 'mortal',
  },

  // Afinidade elemental (compatibilidade com raízes)
  element: {
    type: String,
    enum: ['fire','water','earth','wind','thunder','ice','void','light','dark','chaos', null],
    default: null,
  },

  // Bônus de cultivo por uso
  xpBonus:         { type: Number, default: 1.0 },   // multiplicador
  spiritChance:    { type: Number, default: 0.05 },   // chance de epifania
  incompatibilityPenalty: { type: Number, default: 0.5 }, // se elemento diferente da raiz

  // Habilidades de combate que desbloqueia
  skills: [{
    name:        String,
    description: String,
    damage:      Number,
    qiCost:      Number,
    cooldown:    Number, // segundos
    realmUnlock: Number, // reino mínimo para usar
  }],

  // Requisitos
  requirements: {
    minRealm:  { type: Number, default: 0 },
    minSpirit: { type: Number, default: 0 },
    clan:      { type: String, default: null },
    race:      { type: String, default: null },
  },

  // Origem
  origin: {
    type: String,
    enum: ['world','sect','player_created','bot_shop','event'],
    default: 'world',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null }, // se criada por player

  basePrice:  { type: Number, default: 0 },
  tradeable:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Technique', TechniqueSchema);
