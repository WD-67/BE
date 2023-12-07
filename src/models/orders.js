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



    timestamps: { currentTime: () => Date.now() + 7 * 60 * 60 * 1000 }, versionKey: false
})

export default mongoose.model("Orders", Orders);