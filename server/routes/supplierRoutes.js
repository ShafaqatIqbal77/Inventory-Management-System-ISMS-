const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');

const router = express.Router();

router.use(protect);
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', allowRoles('admin', 'manager'), createSupplier);
router.put('/:id', allowRoles('admin', 'manager'), updateSupplier);
router.delete('/:id', allowRoles('admin'), deleteSupplier);

module.exports = router;
