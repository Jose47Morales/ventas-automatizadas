const express = require('express');
const router = express.Router();
const productsCtrl = require('../controllers/products.controller.cjs');

// Middlewares
const validateId = require("../validators/validateId.cjs");

router.get('/', productsCtrl.getProducts);
router.get('/search', productsCtrl.searchProducts);
router.get('/:id', validateId, productsCtrl.getProduct);
router.post('/', productsCtrl.createProduct);
router.put('/:id', validateId, productsCtrl.updateProduct);
router.delete('/:id', validateId, productsCtrl.deleteProduct);

module.exports = router;