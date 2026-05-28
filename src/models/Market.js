const mongoose = require('mongoose');

const MarketListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, default: 1 },
  priceCopper: { type: Number, default: 0 },
  priceSilver: { type: Number, default: 0 },
  priceJade: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  isSold: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MarketListing', MarketListingSchema);
