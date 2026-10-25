const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const { getInvoices, getInvoiceById, createInvoice } = require('../controllers/invoiceController');

const router = express.Router();

router.use(protect);
router.get('/', allowRoles('admin', 'manager', 'salesman'), getInvoices);
router.get('/:id', allowRoles('admin', 'manager', 'salesman'), getInvoiceById);
router.post('/', allowRoles('admin', 'manager', 'salesman'), createInvoice);

module.exports = router;
