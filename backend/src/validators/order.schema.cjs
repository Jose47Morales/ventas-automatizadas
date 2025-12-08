module.exports = {
    createOrderSchema: {
        type: "object",
        required: ["client_name", "client_phone", "product_id", "quantity"],
        properties: {
            client_name: { type: "string", minLength: 3, maxLength: 80 },
            client_phone: { 
                type: "string", 
                pattern: "^\\+?[1-9]\\d{7,14}$" 
            },
            product_id: { type: "integer", minimum: 1 },
            quantity: { type: "integer", minimum: 1 },
        },
        additionalProperties: false,
    },

    updateOrderSchema: {
        type: "object",
        required: ["client_name", "client_phone", "product_id", "quantity", "payment_status"],
        properties: {
            client_name: { type: "string", minLength: 3, maxLength: 80 },
            client_phone: { 
                type: "string",
                pattern: "^\\+?[1-9]\\d{7,14}$" 
            },
            product_id: { type: "integer", minimum: 1 },
            quantity: { type: "integer", minimum: 1 },
            payment_status: { type: "string", enum: ["pending", "paid", "failed"] },
        },
        additionalProperties: false,
    }
};