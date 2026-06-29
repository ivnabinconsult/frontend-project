const express = require('express');
const router = express.Router();

const { createOrder, getMyOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrder);          // guests + logged-in
router.get('/mine', protect, getMyOrders);
router.get('/:orderId', protect, getOrder);
router.patch('/:orderId/status', protect, restrictTo('admin'), updateOrderStatus);

module.exports = router;
