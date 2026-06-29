const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ContactMessage = require('../models/ContactMessage');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalOrders, totalProducts, unreadMessages, recentOrders, orderStats] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments({ active: true }),
        ContactMessage.countDocuments({ read: false }),
        Order.find().sort({ createdAt: -1 }).limit(10).lean(),
        Order.aggregate([
          { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        unreadMessages,
        totalRevenue: orderStats[0]?.revenue || 0,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, page: Number(page), orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/messages
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/messages/:id/read
exports.markMessageRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id, { read: true }, { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};
