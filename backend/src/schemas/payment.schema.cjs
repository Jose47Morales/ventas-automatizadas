module.exports = {
    createPaymentSchema: {
        type: 'object',
        required: ['order_id', 'gateway', 'status', 'amount'],
        properties: {
            order_id: { type: 'string', format: 'uuid' },
            gateway: { type: 'string', minLength: 2 },
            payment_link: { type: 'string', minLength: 5 },
            reference: { type: 'string', minLength: 3 },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'] },
            amount: { type: 'number', minimum: 0 }
        },
        additionalProperties: false
    },

    updatePaymentSchema: {
        type: 'object',
        properties: {
            gateway: { type: 'string' },
            payment_link: { type: 'string' },
            reference: { type: 'string' },
            status: { type: 'string' },
            amount: { type: 'number', minimum: 0 }
        },
        additionalProperties: false
    }
};