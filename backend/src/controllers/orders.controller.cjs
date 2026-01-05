const ordersService = require("../services/orders.service.cjs");
const axios = require('axios');

module.exports = {
    getOrders: async (req, res) => {
        try {
            const orders = await ordersService.getAllOrders();

            return res.json({
                success: true,
                count: orders.length,
                data: orders
            });

        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    getOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const order = await ordersService.getOrderById(id);

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            return res.json({ success: true, data: order });

        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({ success: false, error: error.message }); 
        }
    },

    createOrder: async (req, res) => {
        try {
            const { customer, items } = req.body;

            if (
                !customer?.name ||
                !customer?.phone ||
                !Array.isArray(items) ||
                items.length === 0
            ) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid order data' 
                });
            }

            const payload = {
                client_name: customer.name,
                client_phone: customer.phone,
                items
            };

            const newOrder = await ordersService.createOrder(payload);
            const API_BASE_URL = process.env.API_BASE_URL;

            try {
                await axios.post(`${API_BASE_URL}/logs`, {
                    log_type: 'order_created',
                    from_number: customer.phone,
                    status: 'success',
                    raw_data: newOrder
                });
            } catch (logError) {
                console.error('Error saving log:', logError.message);
            }

            return res.status(201).json({ 
                success: true, 
                message: 'Order created successfully',
                data: newOrder 
            });

        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },  

    updateOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await ordersService.updateOrder(id, req.body);
            
            if (!updated) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            return res.json({ 
                success: true, 
                message: "Order updated successfully",
                data: updated 
            });

        } catch (error) {
            console.error('Error updating order:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    updateDeliveryAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const { delivery_address } = req.body;

            const updatedOrder = await ordersService.updateDeliveryAddress(id, delivery_address);

            if (!updatedOrder) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            return res.json({ 
                success: true, 
                message: "Delivery address updated successfully",
                data: updatedOrder 
            });

        } catch (error) {
            console.error('Error updating delivery address:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const { id } = req.params;  
            const deleted = await ordersService.deleteOrder(id);

            if (!deleted) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            return res.json({ 
                success: true, 
                message: 'Order deleted successfully' 
            });
            
        } catch (error) {
            console.error('Error deleting order:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },

    addItemToOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const item = await ordersService.addItemToOrder(id, req.body);

            try {
                await axios.post(`${API_BASE_URL}/logs`, {
                    log_type: 'order_item_added',
                    message_id: id,
                    status: 'success',
                    raw_data: item,
                });
            } catch (logError) {
                console.error('Error saving log:', logError.message);
            }

            return res.status(201).json({ 
                success: true, 
                message: 'Item added to order successfully',
                data: item 
            });

        } catch (error) {
            console.error('Error adding item to order:', error);
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
};