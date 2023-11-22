import express from "express";
import formdata from "express-form-data";
import * as Order from "../controllers/order.js";
import * as per from "../middlewares/checkPermission.js";

const router = express.Router();

router.post("/order", Order.OrderUser);
router.get("/GetDetailOrder", Order.GetDetailOrder);
router.get("/GetAllOrder", Order.GetAllOrder);

//
router.delete("/deleteOrder/:id", Order.deleteOrder);
router.put("/updateOrder/:id", Order.updateOrder);



//add
import Size from '../models/size.js';
router.get('/loadSize', async (req, res) => {
    const size = await Size.find({});
    res.json(size)
})



export default router;
