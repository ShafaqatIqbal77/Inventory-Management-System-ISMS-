const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router.use(protect);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', allowRoles('admin', 'manager'), createProduct);
router.put('/:id', allowRoles('admin', 'manager'), updateProduct);
router.delete('/:id', allowRoles('admin'), deleteProduct);

module.exports = router;
