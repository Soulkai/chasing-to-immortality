const mongoose = require('mongoose');

// ── Região do Mundo ───────────────────────────────────────────────────────────
const RegionSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['city','forest','mountain','dungeon','ruins','sacred_ground','demon_territory','void_rift'],
    default: 'forest',
  },

  // Perigo e requisitos
  dangerLevel: { type: Number, default: 1, min: 1, max: 13 }, // corresponde ao reino
  minRealm:    { type: Number, default: 0 },

  // Recursos que podem ser coletados aqui
  resources: [{
    item:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    chance: Number, // 0.0 - 1.0
  }],

  // Mobs que aparecem aqui
  mobs: [{
    mob:    { type: mongoose.Schema.Types.ObjectId, ref: 'Mob' },
    chance: Number,
  }],

  // Conexões (regiões vizinhas)
  connections: [{ type: String }], // nomes das regiões vizinhas

  // Jogadores atualmente aqui (para sistema de encontro)
  playersPresent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],

  // Seita que controla o território
  controlledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Sect', default: null },

  // Eventos especiais ativos
  activeEvent: { type: String, default: null },
}, { timestamps: true });

// ── Mob / Besta ────────────────────────────────────────────────────────────────
const MobSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['beast','demon','undead','spirit','cultivator','boss'], default: 'beast' },

  realm:       { type: Number, default: 1 },  // reino equivalente
  hp:          { type: Number, default: 100 },
  attack:      { type: Number, default: 10 },
  defense:     { type: Number, default: 5 },
  speed:       { type: Number, default: 5 },

  // Drops
  drops: [{
    item:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    chance:    Number,
    minQty:    { type: Number, default: 1 },
    maxQty:    { type: Number, default: 1 },
  }],

  xpReward:    { type: Number, default: 10 },
  copperReward:{ type: Number, default: 0 },

  isBoss:      { type: Boolean, default: false },
  respawnTime: { type: Number, default: 3600 }, // segundos
}, { timestamps: true });

const Region = mongoose.model('Region', RegionSchema);
const Mob    = mongoose.model('Mob', MobSchema);

module.exports = { Region, Mob };
