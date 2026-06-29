const Order = require('../models/Order');
const Product = require('../models/Product');

const VAT_RATE = 0.075;

// POST /api/orders  — place order (guest or logged-in)
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }
    if (!shipping?.firstName || !shipping?.lastName || !shipping?.email) {
      return res.status(400).json({ success: false, message: 'Shipping information is incomplete.' });
    }

    // Validate items against DB and recalculate prices server-side (never trust client prices)
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findOne({ id: item.productId, active: true });
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${item.productId}" not found.` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}".` });
      }
      enrichedItems.push({
        productId: product.id,
        name:      product.name,
        price:     product.price,   // server-authoritative price
        qty:       item.qty,
        img:       product.imgs[0] || '',
      });
    }

    const subtotal = enrichedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const vat      = Math.round(subtotal * VAT_RATE);
    const total    = subtotal + vat;

    const order = await Order.create({
      user:          req.user?._id || null,
      guestEmail:    req.user ? null : shipping.email,
      items:         enrichedItems,
      shipping,
      subtotal,
      vat,
      total,
      paymentMethod: paymentMethod || 'card',
    });

    // Decrement stock
    for (const item of enrichedItems) {
      await Product.findOneAndUpdate({ id: item.productId }, { $inc: { stock: -item.qty } });
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  — logged-in user's own orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:orderId
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Users can only see their own orders; admins see all
    if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:orderId/status  (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
