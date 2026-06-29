const express = require('express');
const router = express.Router();

const {
  getDashboard, getAllOrders, getAllUsers, getMessages, markMessageRead
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboard);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.get('/messages', getMessages);
router.patch('/messages/:id/read', markMessageRead);

module.exports = router;
