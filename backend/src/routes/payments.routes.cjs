const express = require('express');
const router = express.Router();
const paymentsCtrl = require('../controllers/payments.controller.cjs');

router.get('/', paymentsCtrl.getPayments);
router.get('/:id', paymentsCtrl.getPayment);
router.post('/', paymentsCtrl.createPayment);
router.put('/:id', paymentsCtrl.updatePayment);
router.delete('/:id', paymentsCtrl.deletePayment);

module.exports = router;