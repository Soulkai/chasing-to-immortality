const mongoose = require('mongoose');

const SectMissionSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  rewardDesc:    { type: String, required: true },  // líder descreve a recompensa
  generatedTask: { type: String },                   // bot gera a tarefa
  difficulty:    { type: String, enum: ['easy','medium','hard','extreme','legendary'] },
  rewardItems:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  rewardJade:    { type: Number, default: 0 },
  completedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  active:        { type: Boolean, default: true },
}, { _id: true, timestamps: true });

const SectBuildingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['technique_hall','herb_garden','training_tower','forge','pill_room','treasury'],
  },
  level:     { type: Number, default: 1, max: 10 },
  bonus:     { type: String, default: '' },
}, { _id: false });

const SectSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  emblem:      { type: String, default: '🏯' },

  // Liderança
  leader:  { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  elders:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  innerDisciples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  outerDisciples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],

  // Alinhamento
  alignment: {
    type: String,
    enum: ['orthodox','heterodox','neutral'],
    default: 'neutral',
  },

  // Nível da seita (calculado pelo poder médio + contribuições)
  level:       { type: Number, default: 1 },
  totalPower:  { type: Number, default: 0 },

  // Técnicas disponíveis aos membros
  techniques:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technique' }],

  // Missões criadas pelo líder
  missions:    [SectMissionSchema],

  // Território & Construções
  territory:   { type: String, default: null },
  buildings:   [SectBuildingSchema],

  // Tesouro da seita
  treasury: {
    copper: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    jade:   { type: Number, default: 0 },
  },

  // Requisito para entrar
  minRealm: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },

  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { timestamps: true });

module.exports = mongoose.model('Sect', SectSchema);
