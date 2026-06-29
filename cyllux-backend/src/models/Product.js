const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true, unique: true, trim: true },   // matches frontend id slug
    name:     { type: String, required: true, trim: true },
    cat:      { type: String, required: true },                             // display label
    catKey:   { type: String, required: true, enum: ['tech', 'interior', 'furniture', 'lighting'] },
    price:    { type: Number, required: true, min: 0 },
    desc:     { type: String, required: true },
    imgs:     { type: [String], required: true, validate: v => v.length > 0 },
    stock:    { type: Number, default: 100, min: 0 },
    featured: { type: Boolean, default: false },
    active:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ catKey: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model('Product', productSchema);
