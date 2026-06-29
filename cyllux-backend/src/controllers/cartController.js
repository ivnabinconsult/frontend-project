/**
 * Server-side cart (stored in MongoDB for logged-in users).
 * Guests continue to use localStorage on the frontend.
 *
 * Schema lives inline here (embedded in User is overkill; a lightweight
 * in-memory approach via a simple CartItem collection keeps it clean).
 */

const mongoose = require('mongoose');

// Simple ephemeral cart schema (TTL 7 days)
const cartItemSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  qty:       { type: Number, required: true, min: 1 },
  img:       { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 }, // TTL 7d
});
cartItemSchema.index({ user: 1, productId: 1 }, { unique: true });

const CartItem = mongoose.models.CartItem || mongoose.model('CartItem', cartItemSchema);

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const items = await CartItem.find({ user: req.user._id }).lean();
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// POST /api/cart  — add/increment item
exports.addItem = async (req, res, next) => {
  try {
    const { productId, name, price, img, qty = 1 } = req.body;
    if (!productId || !name || !price) {
      return res.status(400).json({ success: false, message: 'productId, name and price are required.' });
    }

    const existing = await CartItem.findOne({ user: req.user._id, productId });
    if (existing) {
      existing.qty += qty;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ success: true, item: existing });
    }

    const item = await CartItem.create({ user: req.user._id, productId, name, price, img, qty });
    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

// PATCH /api/cart/:productId
exports.updateItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    if (qty < 1) {
      // treat as remove
      await CartItem.findOneAndDelete({ user: req.user._id, productId: req.params.productId });
      return res.json({ success: true, message: 'Item removed.' });
    }
    const item = await CartItem.findOneAndUpdate(
      { user: req.user._id, productId: req.params.productId },
      { qty, updatedAt: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res, next) => {
  try {
    await CartItem.findOneAndDelete({ user: req.user._id, productId: req.params.productId });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (err) { next(err); }
};

// DELETE /api/cart  — clear entire cart
exports.clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { next(err); }
};
