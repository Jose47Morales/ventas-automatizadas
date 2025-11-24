const ordersService = require("../services/products.service.cjs");

module.exports = {
    getProducts: async (req, res) => {
        try {
            const products = await productsService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await productsService.getProductById(id);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message }); 
        }
    },

    createProduct: async (req, res) => {
        try {
            const product = await productsService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },  

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const product = await productsService.updateProduct(id, req.body);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;  
            const product = await productsService.deleteProduct(id);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};