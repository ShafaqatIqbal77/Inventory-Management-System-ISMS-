const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

const router = express.Router();

router.use(protect);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', allowRoles('admin', 'manager', 'salesman'), createCustomer);
router.put('/:id', allowRoles('admin', 'manager'), updateCustomer);
router.delete('/:id', allowRoles('admin'), deleteCustomer);

module.exports = router;
