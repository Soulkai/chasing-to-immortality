const mongoose = require('mongoose');

// Chat entre players que se encontram no mundo (cross-grupo)
const ChatMessageSchema = new mongoose.Schema({
  from:    { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  to:      { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

// Trade entre players
const TradeSchema = new mongoose.Schema({
  playerA:   { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  playerB:   { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },

  offersA:   [{ item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, quantity: Number }],
  offersB:   [{ item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, quantity: Number }],

  confirmedA:{ type: Boolean, default: false },
  confirmedB:{ type: Boolean, default: false },

  status: {
    type: String,
    enum: ['pending','confirmed','cancelled','completed'],
    default: 'pending',
  },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000) }, // 5 min
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
const Trade       = mongoose.model('Trade', TradeSchema);

module.exports = { ChatMessage, Trade };
