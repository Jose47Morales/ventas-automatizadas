const ordersService = require("../services/orders.service.cjs");
const logService = require("../services/log.service.cjs");

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

            try {
                await logService.saveLog({
                    type: 'order_created',
                    messageId: newOrder?.id,
                    phone: body.customer?.phone || null,
                    data: newOrder,
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
                await logService.saveLog({
                    type: 'order_item_added',
                    messageId: id,
                    phone: req.body.customer?.phone || null,
                    data: item,
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