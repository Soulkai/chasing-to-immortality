const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  profession:  {
    type: String,
    enum: ['alchemist','blacksmith','formation_master','talisman_master','herbalist','hunter'],
    required: true,
  },
  minProfessionLevel: { type: Number, default: 1 },

  // Ingredientes necessários
  ingredients: [{
    item:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: Number,
  }],

  // Resultado
  result: {
    item:     { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 },
    chance:   { type: Number, default: 1.0 }, // chance de sucesso
  },

  rarity:      { type: String, enum: ['common','uncommon','rare','epic','legendary'], default: 'common' },
  tradeable:   { type: Boolean, default: true },
  discoverable:{ type: Boolean, default: true }, // pode ser descoberta ao explorar
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);
