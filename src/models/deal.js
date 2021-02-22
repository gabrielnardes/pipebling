const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    buyOrderCode: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    supplier: {
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    itens: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model('Deal', dealSchema);
