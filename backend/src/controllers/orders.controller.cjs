const ordersService = require("../services/orders.service.cjs");
const sessionService = require("../services/session.service.cjs");
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

            const payload = {
                client_name: customer.name,
                client_phone: customer.phone,
                product_id: items[0].product_id,
                quantity: items[0].quantity
            }

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
    }
};