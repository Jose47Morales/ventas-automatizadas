module.exports = {
    addOrderItemSchema: {
        type: 'object',
        required: ['product_id', 'quantity'],
        properties: {
            product_id: { 
                type: 'string', 
                format: 'uuid' 
            },
            quantity: { 
                type: 'integer', 
                minimum: 1 
            }
        },
        additionalProperties: false
    }
};