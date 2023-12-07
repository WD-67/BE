import express from "express";
import formdata from "express-form-data";
import * as Order from "../controllers/order.js";
import * as per from "../middlewares/checkPermission.js";

const router = express.Router();

router.post("/order", Order.OrderUser);
router.post("/add/many/order", Order.addManyOrder);

router.get("/GetDetailOrder", Order.GetDetailOrder);
router.get("/GetAllOrder", Order.GetAllOrder);
//
router.delete("/deleteOrder/:id", Order.deleteOrder);
router.put("/updateOrder/:id", Order.updateOrder);


//get
import Orders from "../models/orders.js";
import Users from "../models/user.js";
router.get("/allOrderDesc", async (req, res) => {
    const dat = await Orders.find({});
    var data = [];
    // return res.json(dat)
    for (const value of dat) {
        const usersOh = await Users.findOne({ _id: value.id_user });

        data.push({
            user_booking: {

                fullname: usersOh.fullname,
                email: usersOh.email,
            },

            totalPrice: value.price * value.quantity,
            payment_function: value.type_pay == "online" ? "online" : "cash",
            status: value.pay_status == true ? "yes" : "no",
            createdAt: value.createdAt




        })
    }
    res.json(data)
})


export default router;
