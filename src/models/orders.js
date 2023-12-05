import { bool, boolean, string } from 'joi';
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
    id_user: String,
    id_product: String,
    price: String,
    quantity: String,
    color: String,
    size: String,
    pay_status: Boolean,

    type_pay: String,
}, {
    collection: 'Orders',
    versionKey: false,
    timestamp: true
})

export default mongoose.model("Orders", Orders);