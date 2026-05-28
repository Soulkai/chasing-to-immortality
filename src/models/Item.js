const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },

  // Classificação
  type: {
    type: String,
    enum: ['weapon','armor','accessory','pill','material','technique_scroll','formation','talisman','mount','pet','special','currency'],
    required: true,
  },
  slot: {
    type: String,
    enum: ['weapon','offhand','head','body','hands','legs','feet','ring1','ring2','amulet','belt','cape', null],
    default: null,
  },
  rarity: {
    type: String,
    enum: ['common','uncommon','rare','epic','legendary','divine','primordial'],
    default: 'common',
  },

  // Atributos que concede (equipamentos)
  bonuses: {
    strength:   { type: Number, default: 0 },
    agility:    { type: Number, default: 0 },
    endurance:  { type: Number, default: 0 },
    spirit:     { type: Number, default: 0 },
    perception: { type: Number, default: 0 },
    willpower:  { type: Number, default: 0 },
    charisma:   { type: Number, default: 0 },
    luck:       { type: Number, default: 0 },
    attack:     { type: Number, default: 0 },
    defense:    { type: Number, default: 0 },
    speed:      { type: Number, default: 0 },
    maxHp:      { type: Number, default: 0 },
    maxQi:      { type: Number, default: 0 },
  },

  // Refinamento
  refinementLevel: { type: Number, default: 0, min: 0, max: 10 },
  maxRefinement:   { type: Number, default: 10 },

  // Efeitos especiais (pílulas, talismãs, etc)
  effects: [{
    type:     String, // ex: 'boost_xp', 'heal', 'teleport'
    value:    Number,
    duration: Number, // em minutos, 0 = instantâneo
  }],

  // Requisitos para usar/equipar
  requirements: {
    minRealm:     { type: Number, default: 0 },
    minStrength:  { type: Number, default: 0 },
    minSpirit:    { type: Number, default: 0 },
    race:         { type: String, default: null },
    clan:         { type: String, default: null },
  },

  // Econômico
  basePrice:   { type: Number, default: 0 },     // em cobre
  tradeable:   { type: Boolean, default: true },
  stackable:   { type: Boolean, default: false },
  maxStack:    { type: Number, default: 1 },

  // Se é item da loja do bot
  isBotShop:   { type: Boolean, default: false },
  shopPrice:   { type: Number, default: 0 },     // em Jade Celestial
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
