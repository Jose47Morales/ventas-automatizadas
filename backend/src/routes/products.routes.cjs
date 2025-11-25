const express = require('express');
const router = express.Router();
const productsCtrl = require('../controllers/products.controller.cjs');

router.get('/', productsCtrl.getProducts);
router.get('/:id', productsCtrl.getProduct);
router.get('/search', productsCtrl.searchProducts);
router.post('/', productsCtrl.createProduct);
router.put('/:id', productsCtrl.updateProduct);
router.delete('/:id', productsCtrl.deleteProduct);

module.exports = router;