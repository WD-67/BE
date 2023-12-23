import mongoose from "mongoose";
import Orders from "../models/orders.js";
import * as functions from "../service/functions.js";
// đặt hàng
export const OrderUser = async (req, res, next) => {
    try {
        let { address, phone, id_user, id_product } = req.body;
        if (!address) return functions.setError(res, "Vui lòng nhập vào địa chỉ", 400);
        if (!phone) return functions.setError(res, "Vui lòng nhập vào số điện thoại", 400);
        if (!id_product) return functions.setError(res, "Vui lòng nhập vào id sản phẩm", 400);
        if (!address) return functions.setError(res, "Vui lòng nhập vào iid người mua", 400);

        if (id_user && id_product && phone && address) {
            let checkId = await Orders.findOne({}, { id_order: 1 }).sort({ id_order: -1 }).lean();
            let id_order = checkId ? checkId.id_order + 1 : 1;
            await Orders.create({
                id_order,
                address,
                phone,
                status: 1,
                date_created: new Date(),
                id_user,
                id_product,
            });
            return functions.success(res, `Đặt hàng thành công với id_product: ${id_product}`);
        }
        return functions.setError(res, "Missing data", 400);
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

// get order
export const getAll = async (req, res) => {
    const { page = 1, limit = 10, sort = "createdAt", order = -1, ...query } = req.query;
    const skip = (page - 1) * limit;
    const sortOptions = {
        [sort]: order === 1 ? 1 : -1,
    };
    const condition = req.query.user_id ? { user_id: new mongoose.Types.ObjectId(req.query.user_id) } : query;

    const orders = await Orders.aggregate([
        { $match: condition },
        {
            $unwind: "$products",
        },
        {
            $lookup: {
                from: "products",
                localField: "products.product_id",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $lookup: {
                from: "payment",
                localField: "payment_id",
                foreignField: "_id",
                as: "payment",
            },
        },
        {
            $unwind: {
                path: "$payment",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                user_id: 1,
                status: 1,
                total_price: 1,
                createdAt: 1,
                updatedAt: 1,
                payment: 1,
                product: { $arrayElemAt: ["$product", 0] },
                quantity: "$products.quantity",
            },
        },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    user_id: "$user_id",
                    address: "$address",
                    status: "$status",
                    payment: "$payment",
                    total_price: "$total_price",
                    createdAt: "$createdAt",
                    updatedAt: "$updatedAt",
                },
                products: {
                    $push: { product: "$product", quantity: "$quantity" },
                },
            },
        },
        {
            $project: {
                _id: "$_id",
                user_id: "$_id.user_id",
                address: "$_id.address",
                status: "$_id.status",
                total_price: "$_id.total_price",
                payment: "$_id.payment",
                createdAt: "$_id.createdAt",
                updatedAt: "$_id.updatedAt",
                products: 1,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);

    return res.status(200).json({
        message: "Get all order successfully",
        data: orders,
    });
};

export const updateStatus = async (req, res, next) => {
    try {
        const posts = await Orders.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return res.status(200).json({
            message: "Update order successfully",
            data: posts,
        });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};

// Create order
export const createOrder = async (req, res) => {
    try {
        const newOrder = new Orders(req.body);
        const order = await newOrder.save();

        return res.status(200).json({
            message: "Create order successfully",
            data: order,
        });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};

// chi tiết đơn hàng
export const GetDetailOrder = async (req, res, next) => {
    try {
        let id = Number(req.query.id);
        let data = await Orders.findOne({ id_order: id }).lean();
        return functions.success(res, "get data success", { data });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
export const GetAllOrder = async (req, res, next) => {
    try {
        let data = await Orders.find({});
        return functions.success(res, "get data success", { data });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const { _id } = req.query;
        let data = await Orders.deleteOne({ _id });
        return functions.success(res, "delete data success", { data });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
export const updateOrder = async (req, res, next) => {
    try {
        const { _id, address, phone, status } = req.query;
        var dd = {};
        if (address != "") dd = { ...dd, ...{ address } };
        if (phone != "") dd = { ...dd, ...{ phone } };
        if (status != "") dd = { ...dd, ...{ status } };

        console.log(req.query);
        let data = await Orders.updateOne({ _id }, { $set: dd });
        return functions.success(res, "update data success", { data });
    } catch (error) {
        return functions.setError(res, error.message);
    }
};
