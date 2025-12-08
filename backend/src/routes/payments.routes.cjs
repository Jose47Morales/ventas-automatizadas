const express = require('express');
const router = express.Router();
const paymentsCtrl = require('../controllers/payments.controller.cjs');

// Middlewares
const validateId = require("../validators/validateId.cjs");

router.get('/', paymentsCtrl.getPayments);
router.get('/:id', validateId, paymentsCtrl.getPayment);
router.post('/', paymentsCtrl.createPayment);
router.put('/:id', validateId, paymentsCtrl.updatePayment);
router.delete('/:id', validateId, paymentsCtrl.deletePayment);

module.exports = router;