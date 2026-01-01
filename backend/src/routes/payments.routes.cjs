const express = require('express');
const router = express.Router();
const paymentsCtrl = require('../controllers/payments.controller.cjs');

// Middlewares
const validateId = require("../validators/validateUuid.cjs");

router.get('/', paymentsCtrl.getPayments);
router.get('/:id', validateId, paymentsCtrl.getPayment);
router.post('/', paymentsCtrl.createPayment);
router.put('/:id', validateId, paymentsCtrl.updatePayment);
router.delete('/:id', validateId, paymentsCtrl.deletePayment);

router.post('/prepare', paymentsCtrl.preparePayment);

module.exports = router;