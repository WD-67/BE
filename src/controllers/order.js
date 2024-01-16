import mongoose from "mongoose";
import Orders from "../models/orders.js";
import Product from "../models/product";
import {productSchema, UpdateProduct} from "../Schema/product";
import * as functions from "../service/functions.js";
// đặt hàng
export const OrderUser = async (req, res, next) => {
    try {
        let { address, phone, id_user, id_product } = req.body;
        if (!address) return functions.setError(res, "Vui lòng nhập vào địa chỉ", 400);
        if (!phone) return functions.setError(res, "Vui lòng nhập vào số điện thoại", 400);
        if (!id_product) return functions.setError(res, "Vui lòng nhập vào id sản phẩm", 400);
        if (!id_user) return functions.setError(res, "Vui lòng nhập vào id người mua", 400);

        if (id_user && id_product && phone && address) {
            let checkId = await Orders.findOne({}, { id_order: 1 }).sort({ id_order: -1 }).lean();
            let id_order = checkId ? checkId.id_order + 1 : 1;

            console.log('Creating Order with ID:', id_order);

            await Orders.create({
                id_order,
                address,
                phone,
                user_id: id_user,
                // You need to define 'products', 'total_price', 'sale_id' before using them.
                products: [], // Replace with the actual array of products
                status: "pending",
                total_price: 0, // Replace with the actual total price
                sale_id: null, // Replace with the actual sale ID
            });

            return functions.success(res, `Đặt hàng thành công với id_order: ${id_order}`);
        }
    } catch (error) {
        console.error('Error in OrderUser:', error);
        return functions.setError(res, error.message);
    }
};


// get order
export const getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "createdAt", order = -1, ...query } = req.query;
        const skip = (page - 1) * limit;
        const sortOptions = {
            [sort]: order === 1 ? 1 : -1,
        };
        const condition = req.query.user_id ? { user_id: new mongoose.Types.ObjectId(req.query.user_id) } : query;

        const orders = await Orders.aggregate([
            { $match: condition },
            { $unwind: "$products" },
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
                $lookup: {
                    from: "users", // Assuming your User model is named "User" and is stored in the "users" collection
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
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
                    total_amount_paid: 1,
                    total_price:1,
                    address: 1,
                    payment_type: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    payment: 1,
                    product: { $arrayElemAt: ["$product", 0] },
                    quantity: "$products.quantity",
                    color: "$products.color",
                    size: "$products.size",
                    user: { $arrayElemAt: ["$user", 0] },
                },
            },
            {
                $group: {
                    _id: {
                        _id: "$_id",
                        user_id: "$user_id",
                        address: "$address",
                        status: "$status",
                        total_amount_paid: "$total_amount_paid",
                        payment_type: "$payment_type",
                        payment: "$payment",
                        total_price: "$total_price",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    },
                    products: {
                        $push: { product: "$product",
                         quantity: "$quantity" ,
                         color: "$color" ,
                         size: "$size"
                        },
                    },
                    user: { $first: "$user" },
                },
            },
            {
                $project: {
                    _id: "$_id",
                    user_id: "$_id.user_id",
                    address: "$_id.address",
                    status: "$_id.status",
                    total_amount_paid: "$_id.total_amount_paid",
                    payment_type: "$_id.payment_type",
                    total_price: "$_id.total_price",
                    payment: "$_id.payment",
                    createdAt: "$_id.createdAt",
                    updatedAt: "$_id.updatedAt",
                    products: 1,
                    user: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: skip,
            },
            // {
            //     $limit: limit,
            // },
        ]);

        return res.status(200).json({
            message: "Get all order successfully",
            data: orders,
        });
    } catch (error) {
        console.error('Error in getAll:', error);
        return functions.setError(res, error.message);
    }
};

    export const updateStatus = async (req, res, next) => {
        try {
            let order = await Orders.findOne({_id: req.params.id}).lean();

            for (const product of order.products) {
                const {product_id, color, size, quantity} = product;
                const existingProduct = await Product.findById(product_id);

                if (!existingProduct) {
                    return res.status(404).json({
                        error: true,
                        message: `Không tìm thấy san phẩm ${existingProduct.name}`,
                    });
                }
                const quantityInfoIndex = existingProduct.listQuantityRemain.findIndex(
                    (item) => item.nameColor === color && item.nameSize === size
                );
                existingProduct.listQuantityRemain[quantityInfoIndex].quantity += quantity;

                // Tạo một bản sao của listQuantityRemain để cập nhật mảng
                const updatedListQuantityRemain = [...existingProduct.listQuantityRemain];
                updatedListQuantityRemain[quantityInfoIndex] = {
                    ...updatedListQuantityRemain[quantityInfoIndex],
                    quantity: existingProduct.listQuantityRemain[quantityInfoIndex].quantity,
                };

                await Product.findByIdAndUpdate(
                    product_id,
                    {$set: {listQuantityRemain: updatedListQuantityRemain}},
                    {new: true}
                );

            }
            const posts = await Orders.findByIdAndUpdate(req.params.id, req.body, {new: true});
            return res.status(200).json({
                message: "Update order successfully",
                data: posts,
            });
        } catch (error) {
            res.status(500).json({error: true, message: error.message});
        }
    };

// Create order
    export const createOrder = async (req, res) => {
        try {
            const newOrder = new Orders(req.body);
            for (const product of newOrder.products) {
                const {product_id, color, size, quantity} = product;

                // Kiểm tra product_id
                const existingProduct = await Product.findById(product_id);

                if (!existingProduct) {
                    return res.status(404).json({
                        error: true,
                        message: `Không tìm thấy san phẩm ${existingProduct.name}`,
                    });
                }

                // Kiểm tra logic xử lý số lượng còn lại tại đây nếu cần
                const quantityInfoIndex = existingProduct.listQuantityRemain.findIndex(
                    (item) => item.nameColor === color && item.nameSize === size
                );

                if (quantityInfoIndex === -1 || existingProduct.listQuantityRemain[quantityInfoIndex].quantity < quantity) {
                    return res.status(400).json({
                        error: true,
                        message: `Sản phẩm: ${existingProduct.name} có màu  ${existingProduct.listQuantityRemain[quantityInfoIndex].nameColor} và kích cỡ ${size} đã không đủ số lượng trong kho`,
                    });
                }

                // Cập nhật số lượng còn lại
                existingProduct.listQuantityRemain[quantityInfoIndex].quantity -= quantity;

                // Tạo một bản sao của listQuantityRemain để cập nhật mảng
                const updatedListQuantityRemain = [...existingProduct.listQuantityRemain];
                updatedListQuantityRemain[quantityInfoIndex] = {
                    ...updatedListQuantityRemain[quantityInfoIndex],
                    quantity: existingProduct.listQuantityRemain[quantityInfoIndex].quantity,
                };

                // Cập nhật lại listQuantityRemain trong existingProduct
                await Product.findByIdAndUpdate(
                    product_id,
                    {$set: {listQuantityRemain: updatedListQuantityRemain}},
                    {new: true}
                );

                // Các kiểm tra khác nếu cần
                // ...
            }

            const order = await newOrder.save();

            return res.status(200).json({
                message: "Create order successfully",
                data: newOrder.products,
            });
        } catch (error) {
            res.status(500).json({error: true, message: error.message});
        }
    };

// chi tiết đơn hàng
    export const GetDetailOrder = async (req, res, next) => {
        try {
            let id = Number(req.query.id);
            let data = await Orders.findOne({id_order: id}).lean();
            return functions.success(res, "get data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };
    export const GetAllOrder = async (req, res, next) => {
        try {
            let data = await Orders.find({});
            return functions.success(res, "get data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };

    export const deleteOrder = async (req, res, next) => {
        try {
            const {_id} = req.query;
            let data = await Orders.deleteOne({_id});
            return functions.success(res, "delete data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };

    export const updateOrder = async (req, res, next) => {
        try {
            const {_id, address, phone, status} = req.query;
            var dd = {};
            if (address != "") dd = {...dd, ...{address}};
            if (phone != "") dd = {...dd, ...{phone}};
            if (status != "") dd = {...dd, ...{status}};

            console.log(req.query);
            let data = await Orders.updateOne({_id}, {$set: dd});
            return functions.success(res, "update data success", {data});
        } catch (error) {
            return functions.setError(res, error.message);
        }
    };
// get order by ID
export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id; // Assuming the order ID is passed as a parameter in the request URL

        // Add any additional validation for orderId if needed
        const order = await Orders.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(orderId),
                },
            },
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
                $lookup: {
                    from: "users", // Assuming your User model is named "User" and is stored in the "users" collection
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
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
                    total_amount_paid: 1,
                    payment_type: 1,
                    address:1,
                    createdAt: 1,
                    updatedAt: 1,
                    payment: 1,
                    product: {$arrayElemAt: ["$product", 0]},
                    quantity: "$products.quantity",
                    color: "$products.color",
                    size: "$products.size",
                    user: {$arrayElemAt: ["$user", 0]},
                },
            },
            {
                $group: {
                    _id: {
                        _id: "$_id",
                        user_id: "$user_id",
                        total_amount_paid: "$total_amount_paid",
                        payment_type: "$payment_type",
                        address: "$address",
                        status: "$status",
                        payment: "$payment",
                        total_price: "$total_price",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    },
                    products: {
                        $push: { product: "$product",
                         quantity: "$quantity" ,
                         color: "$color" ,
                         size: "$size"
                        },
                    },
                    user: {$first: "$user"},
                },
            },
            {
                $project: {
                    _id: "$_id",
                    user_id: "$_id.user_id",
                    total_amount_paid: "$_id.total_amount_paid",
                    payment_type: "$_id.payment_type",
                    address: "$_id.address",
                    status: "$_id.status",
                    total_price: "$_id.total_price",
                    payment: "$_id.payment",
                    createdAt: "$_id.createdAt",
                    updatedAt: "$_id.updatedAt",
                    products: 1,
                    user: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        ]);

        if (order.length === 0) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            message: "Get order by ID successfully",
            data: order[0], // Assuming there should be only one order with the given ID
        });
    } catch (error) {
        console.error('Error in getOrderById:', error);
        return functions.setError(res, error.message);
    }
};

