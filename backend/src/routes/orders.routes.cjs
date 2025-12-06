const express = require('express');
const router = express.Router();
const ordersCtrl = require('../controllers/orders.controller.cjs');

// Middlewares
const validateOrderCreate = require("../validators/orderCreate.validator.cjs");
const validateOrderUpdate = require("../validators/orderUpdate.validator.cjs");
const validateId = require("../validators/validateId.cjs");

/**
 * @route GET /orders
 * @desc Get all orders
 */
router.get('/', ordersCtrl.getOrders);

/**
 * @route GET /orders/:id
 * @desc Get order by ID
 */
router.get('/:id', validateId, ordersCtrl.getOrder);
/**
 * @route POST /orders
 * @desc Create a new order
 */
router.post('/', validateOrderCreate, ordersCtrl.createOrder);

/**
 * @route PUT /orders/:id
 * @desc Update an existing order
 */
router.put('/:id', validateId, validateOrderUpdate, ordersCtrl.updateOrder);

/**
 * @route DELETE /orders/:id
 * @desc Delete an order
 */
router.delete('/:id', validateId, ordersCtrl.deleteOrder);

module.exports = router;