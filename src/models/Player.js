const mongoose = require('mongoose');

// ── Sub-schemas ─────────────────────────────────────────────────────────────

const CultivationSchema = new mongoose.Schema({
  realm: { type: Number, default: 0 },       // índice do reino (0 = Refinamento do Qi)
  subLevel: { type: Number, default: 1 },    // 1-9
  xp: { type: Number, default: 0 },
  xpNeeded: { type: Number, default: 100 },
  technique: { type: mongoose.Schema.Types.ObjectId, ref: 'Technique', default: null },
}, { _id: false });

const AttributesSchema = new mongoose.Schema({
  // Físicos
  strength:    { type: Number, default: 10 },
  agility:     { type: Number, default: 10 },
  endurance:   { type: Number, default: 10 },
  // Espirituais
  spirit:      { type: Number, default: 10 },
  perception:  { type: Number, default: 10 },
  willpower:   { type: Number, default: 10 },
  // Sociais
  charisma:    { type: Number, default: 10 },
  // Secundários
  luck:        { type: Number, default: 10 },
  karma:       { type: Number, default: 0 },
  // Combate (calculados)
  hp:          { type: Number, default: 100 },
  maxHp:       { type: Number, default: 100 },
  qi:          { type: Number, default: 50 },
  maxQi:       { type: Number, default: 50 },
  attack:      { type: Number, default: 15 },
  defense:     { type: Number, default: 10 },
  speed:       { type: Number, default: 10 },
}, { _id: false });

const InventorySlotSchema = new mongoose.Schema({
  item:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const EquipmentSchema = new mongoose.Schema({
  weapon:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  offhand:   { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  head:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  body:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  hands:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  legs:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  feet:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  ring1:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  ring2:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  amulet:    { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  belt:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  cape:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
}, { _id: false });

const LifeHistorySchema = new mongoose.Schema({
  lifeNumber:   { type: Number },
  name:         { type: String },
  race:         { type: String },
  clan:         { type: String },
  talents:      [String],
  maxQiRealm:   { type: Number },
  maxBodyRealm: { type: Number },
  maxMindRealm: { type: Number },
  karma:        { type: Number },
  titles:       [String],
  destinyPoints:{ type: Number },
  causeOfDeath: { type: String },
  diedAt:       { type: Date },
}, { _id: false });

// ── Schema Principal ─────────────────────────────────────────────────────────

const PlayerSchema = new mongoose.Schema({
  // Identidade
  phone:     { type: String, required: true, unique: true, index: true }, // JID do WhatsApp
  name:      { type: String, required: true },
  gender:    { type: String, enum: ['M', 'F'], required: true },

  // Raça & Clã
  race:      { type: String, required: true },
  raceRarity:{ type: String, enum: ['mortal','awakened','ancient','divine','chaos'], default: 'mortal' },
  clan:      { type: String, default: 'Sem Clã' },

  // Talentos (sorteados na criação, até 2)
  talents:   [{ name: String, rarity: String, description: String }],

  // Atributos ocultos
  destinyScore: { type: Number, default: 0 },  // oculto ao player

  // Atributos visíveis
  attributes: { type: AttributesSchema, default: () => ({}) },

  // Sistemas de Cultivo
  qiCultivation:   { type: CultivationSchema, default: () => ({}) },
  bodyCultivation: { type: CultivationSchema, default: () => ({}) },
  mindCultivation: { type: CultivationSchema, default: () => ({}) },

  // Vidas
  lives:        { type: Number, default: 9, min: 0, max: 9 },
  lifeNumber:   { type: Number, default: 1 },
  lifeHistory:  [LifeHistorySchema],
  destinyPoints:{ type: Number, default: 0 },  // PD acumulados (entre vidas)

  // Inventário
  inventory:  { type: [InventorySlotSchema], default: [] },
  maxInventory:{ type: Number, default: 50 },
  equipment:  { type: EquipmentSchema, default: () => ({}) },

  // Moedas
  copper:     { type: Number, default: 0 },
  silver:     { type: Number, default: 0 },
  jade:       { type: Number, default: 0 },
  celestialJade:{ type: Number, default: 0 },

  // Profissão
  profession: { type: String, default: null },
  professionLevel: { type: Number, default: 0 },
  recipes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],

  // Seita
  sect:       { type: mongoose.Schema.Types.ObjectId, ref: 'Sect', default: null },
  sectRole:   { type: String, enum: ['leader','elder','inner','outer', null], default: null },

  // Social & Mundo
  location:   { type: String, default: 'Aldeia do Início' },
  region:     { type: String, default: 'Terras do Início' },
  titles:     [String],
  isOnline:   { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },

  // Cooldowns (timestamps)
  cooldowns: {
    cultivate:  { type: Date, default: null },
    walk:       { type: Date, default: null },
    craft:      { type: Date, default: null },
    dailyQuest: { type: Date, default: null },
  },

  // Status
  isInCombat: { type: Boolean, default: false },
  isDead:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
