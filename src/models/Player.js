const mongoose = require('mongoose');

const CultivationSchema = new mongoose.Schema({
  realm: { type: Number, default: 0 },
  subLevel: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpNeeded: { type: Number, default: 100 },
  technique: { type: mongoose.Schema.Types.ObjectId, ref: 'Technique', default: null },
  mastery: { type: Number, default: 0 },
}, { _id: false });

const FriendRelationSchema = new mongoose.Schema({
  targetPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  affection: { type: Number, default: 0, min: -100, max: 100 },
}, { _id: false });

const NPCRelationSchema = new mongoose.Schema({
  npc: { type: mongoose.Schema.Types.ObjectId, ref: 'NPC' },
  opinion: { type: Number, default: 0, min: -100, max: 100 },
}, { _id: false });

const AttributesSchema = new mongoose.Schema({
  strength: { type: Number, default: 10 },
  agility: { type: Number, default: 10 },
  endurance: { type: Number, default: 10 },
  spirit: { type: Number, default: 10 },
  perception: { type: Number, default: 10 },
  willpower: { type: Number, default: 10 },
  charisma: { type: Number, default: 10 },
  luck: { type: Number, default: 10 },
  karma: { type: Number, default: 0 },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  qi: { type: Number, default: 50 },
  maxQi: { type: Number, default: 50 },
  attack: { type: Number, default: 15 },
  defense: { type: Number, default: 10 },
  speed: { type: Number, default: 10 },
  hunger: { type: Number, default: 100 },
}, { _id: false });

const InventorySlotSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const EquipmentSchema = new mongoose.Schema({
  weapon: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  offhand: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  body: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  hands: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  legs: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  feet: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  ring1: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  ring2: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  amulet: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  belt: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  cape: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
}, { _id: false });

const LifeHistorySchema = new mongoose.Schema({
  lifeNumber: { type: Number },
  name: { type: String },
  race: { type: String },
  clan: { type: String },
  talents: [String],
  maxQiRealm: { type: Number },
  maxBodyRealm: { type: Number },
  maxMindRealm: { type: Number },
  karma: { type: Number },
  titles: [String],
  destinyPoints: { type: Number },
  causeOfDeath: { type: String },
  diedAt: { type: Date },
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['M','F'], required: true },
  race: { type: String, required: true },
  raceRarity: { type: String, enum: ['mortal','awakened','ancient','divine','chaos'], default: 'mortal' },
  clan: { type: String, default: 'Sem Clã' },
  avatarUrl: { type: String, default: null },
  talents: [{ name: String, rarity: String, description: String }],
  destinyScore: { type: Number, default: 0 },
  attributes: { type: AttributesSchema, default: () => ({}) },
  qiCultivation: { type: CultivationSchema, default: () => ({}) },
  bodyCultivation: { type: CultivationSchema, default: () => ({}) },
  mindCultivation: { type: CultivationSchema, default: () => ({}) },
  lives: { type: Number, default: 9, min: 0, max: 9 },
  lifeNumber: { type: Number, default: 1 },
  lifeHistory: [LifeHistorySchema],
  destinyPoints: { type: Number, default: 0 },
  weeklyCultivationCount: { type: Number, default: 0 },
  weeklyCultivationReset: { type: Date, default: null },
  isInClosedCultivation: { type: Boolean, default: false },
  closedCultivationEndAt: { type: Date, default: null },
  friends: [FriendRelationSchema],
  npcRelations: [NPCRelationSchema],
  inventory: { type: [InventorySlotSchema], default: [] },
  maxInventory: { type: Number, default: 50 },
  equipment: { type: EquipmentSchema, default: () => ({}) },
  copper: { type: Number, default: 0 },
  silver: { type: Number, default: 0 },
  jade: { type: Number, default: 0 },
  celestialJade: { type: Number, default: 0 },
  profession: { type: String, default: null },
  professionLevel: { type: Number, default: 0 },
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  sect: { type: mongoose.Schema.Types.ObjectId, ref: 'Sect', default: null },
  sectRole: { type: String, enum: ['leader','elder','inner','outer', null], default: null },
  location: { type: String, default: 'Aldeia do Início' },
  region: { type: String, default: 'Terras do Início' },
  titles: [String],
  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  cooldowns: {
    cultivate: { type: Date, default: null },
    walk: { type: Date, default: null },
    craft: { type: Date, default: null },
    dailyQuest: { type: Date, default: null },
  },
  isInCombat: { type: Boolean, default: false },
  isDead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Player', PlayerSchema);
