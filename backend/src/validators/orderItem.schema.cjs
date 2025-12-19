module.exports = {
    addOrderItemSchema: {
        type: 'object',
        required: ['product_id', 'quantity'],
        properties: {
            product_id: { type: 'integer', minimum: 1 },
            quantity: { type: 'integer', minimum: 1 }
        },
        additionalProperties: false
    }
};