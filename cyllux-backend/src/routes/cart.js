const express = require('express');
const router = express.Router();

const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require auth (guests use localStorage)
router.use(protect);

router.get('/', getCart);
router.post('/', addItem);
router.patch('/:productId', updateItem);
router.delete('/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
