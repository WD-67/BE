import express from "express";
import {
  createColor,
  getAllColor,
  getColor,
  removeColor,
  updateColor,
} from "../controllers/color";
import { checkPermission } from "../middlewares/checkPermission.js";
const router = express.Router();
router.get("/color", getAllColor);
router.get("/color/:id", getColor);
router.post("/color/", createColor);
router.put("/color/:id", updateColor);
router.delete("/color/:id", removeColor);
import Colors from "../models/color.js";
router.get("/loadColor", getAllColor);

export default router;
