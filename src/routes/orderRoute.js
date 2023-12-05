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





export default router;
