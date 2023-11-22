import express from "express";
import {
    signin, signup, getAll, remove, update, get, signupUser, signout
} from "../controllers/user";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();
router.get("/user", getAll);
router.get("/user/:id", get);
router.delete("/user/:id", remove);
router.put("/user/:id", update);
router.post("/signup", signup);
router.post("/signupuser", signupUser);
router.post("/signin", signin);
router.post("/signout", signout);

export default router;