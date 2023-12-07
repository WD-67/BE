import express from "express";
import {
  create,
  get,
  getAll,
  remove,
  update,
  getDeletedProducts,
  restoreProduct,
  removeProduct,
  searchProducts,
  // updatePartial,
} from "../controllers/product.js";
import { checkPermission } from "../middlewares/checkPermission.js";
const router = express.Router();
router.get("/products", getAll);
router.get("/products-daleted", getDeletedProducts);
router.delete("/products/hard-delete/:id", removeProduct);
router.get("/products/:id", get);
router.get("/products/search/:name", searchProducts);
router.post("/products/", create);
router.put("/products/:id", update);
router.delete("/products/:id", remove);
router.patch("/products/restore/:id", restoreProduct);
// router.patch("/products/:id", updatePartial);

import Products from "../models/product.js";
router.get("/loadProduct",async(req,res)=>{
    const data=await Products.find({});
    res.json(data);
})
export default router;
