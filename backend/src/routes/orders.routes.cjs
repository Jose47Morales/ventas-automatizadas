const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders.controller.cjs');

// Middlewares
const validateSchema = require("../validators/validateSchema.cjs");
const { createOrderSchema, updateOrderSchema } = require("../validators/order.schema.cjs");
const { addOrderItemSchema } = require("../validators/orderItem.schema.cjs");
const validateId = require("../validators/validateUuid.cjs");


router.get('/', ordersCtrl.getOrders);
router.get('/:id', validateId, ordersCtrl.getOrder);

router.post('/', validateSchema(createOrderSchema), ordersCtrl.createOrder);
router.put('/:id', validateId, validateSchema(updateOrderSchema), ordersCtrl.updateOrder);

router.delete('/:id', validateId, ordersCtrl.deleteOrder);

router.post('/:id/items', validateId, validateSchema(addOrderItemSchema), ordersCtrl.addItemToOrder);

module.exports = router;