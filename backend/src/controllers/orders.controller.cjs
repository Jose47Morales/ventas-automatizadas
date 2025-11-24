const ordersService = require("../services/orders.service.cjs");

module.exports = {
    getOrders: async (req, res) => {
        try {
            const orders = await ordersService.getAllOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const order = await ordersService.getOrderById(id);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
            res.json(order);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message }); 
        }
    },

    createOrder: async (req, res) => {
        try {
            const order = await ordersService.createOrder(req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },  

    updateOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const order = await ordersService.updateOrder(id, req.body);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
            res.json(order);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;  
            const order = await ordersService.deleteOrder(id);
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
            res.json({ success: true, message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};