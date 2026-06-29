const Product = require('../models/Product');

// GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { catKey, minPrice, maxPrice, sort, featured } = req.query;

    const filter = { active: true };
    if (catKey) filter.catKey = catKey;
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    if (sort === 'price-asc')  query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else query = query.sort({ featured: -1, createdAt: -1 }); // default: featured first

    const products = await query.lean();
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id  (slug id, e.g. "smart-mirror")
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: req.params.id, active: true }).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products  (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id  (admin)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (admin — soft delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { active: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    next(err);
  }
};
