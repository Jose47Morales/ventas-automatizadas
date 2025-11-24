const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders.controller.cjs');

router.get('/', ordersCtrl.getOrders);
router.get('/:id', ordersCtrl.getOrder);
router.post('/', ordersCtrl.createOrder);
router.put('/:id', ordersCtrl.updateOrder);
router.delete('/:id', ordersCtrl.deleteOrder);

module.exports = router;