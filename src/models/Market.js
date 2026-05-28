const mongoose = require('mongoose');

// ── Mercado Global ────────────────────────────────────────────────────────────
const MarketListingSchema = new mongoose.Schema({
  seller:    { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  item:      { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity:  { type: Number, default: 1 },
  price:     { type: Number, required: true }, // em cobre
  currency:  { type: String, enum: ['copper','silver','jade','celestial_jade'], default: 'copper' },
  active:    { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 dias
}, { timestamps: true });

// ── Leilão Global ─────────────────────────────────────────────────────────────
const AuctionSchema = new mongoose.Schema({
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  item:        { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity:    { type: Number, default: 1 },
  minBid:      { type: Number, required: true },
  currentBid:  { type: Number, default: 0 },
  currentBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
  currency:    { type: String, enum: ['copper','silver','jade','celestial_jade'], default: 'jade' },
  bids: [{
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    amount: Number,
    at:     Date,
  }],
  active:    { type: Boolean, default: true },
  endsAt:    { type: Date, required: true },
}, { timestamps: true });

const MarketListing = mongoose.model('MarketListing', MarketListingSchema);
const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = { MarketListing, Auction };
