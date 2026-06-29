const express = require('express');
const router = express.Router();

const {
  getAllProducts, getProduct, createProduct, updateProduct, deleteProduct
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Admin only
router.post('/', protect, restrictTo('admin'), createProduct);
router.patch('/:id', protect, restrictTo('admin'), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;
