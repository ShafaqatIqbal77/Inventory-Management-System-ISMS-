const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/invoiceController');

const router = express.Router();

router.use(protect);
router.get('/', getDashboardStats);
router.get('/stats', getDashboardStats);

module.exports = router;
