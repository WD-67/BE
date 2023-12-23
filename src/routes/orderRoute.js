import express from "express";
import formdata from "express-form-data";
import * as Order from "../controllers/order.js";
import * as OrderValidator from "../Schema/order.schema.js";
import * as per from "../middlewares/checkPermission.js";

const router = express.Router();

router.route("/orders/:id").put(Order.updateStatus);
router.route("/orders").get(Order.getAll).post(OrderValidator.validation, Order.createOrder);
router.get("/GetDetailOrder", Order.GetDetailOrder);
router.get("/GetAllOrder", Order.GetAllOrder);

//
router.get("/deleteOrder", Order.deleteOrder);
router.get("/updateOrder", Order.updateOrder);

export default router;
