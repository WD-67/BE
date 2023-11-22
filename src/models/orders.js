import mongoose from 'mongoose';
const Orders = new mongoose.Schema({
    id_order: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        type: String,
    },
    phone: {
        type: Number,
    },
    status: {
        type: String,
    },
    date_created: {
        type: Date,
    },
    id_user: {
        type: String,
    },
    id_product: {
        type: String,
    },
    size: String,
    color: String,
    quantity: String,
}, {
    collection: 'Orders',
    versionKey: false,
    timestamp: true
})

export default mongoose.model("Orders", Orders);