import express from "express";
import mongoose from "mongoose";
import "dotenv/config.js";
import cors from "cors";
import routerCategory from "./routes/category.js";
import routerContact from "./routes/contact.js";
import routerInformation from "./routes/information.js";
import routerCart from "./routes/cart.js";
import routerFavoriteProduct from "./routes/favoriteProduct.js";
import routerComment from "./routes/comment.js";
import routerAddress from "./routes/address.js";
import routerRole from "./routes/role.js";
import orderRoute from "./routes/orderRoute.js";
import routerNews from "./routes/tb_new.js";
import routerimage_news from "./routes/image_news.js";
import routerImageProduct from "./routes/imageProduct.js";
import paymentRouter from "./routes/payment.router.js";
import saleRouter from "./routes/sale.router.js";
import routerPayment from "./routes/vnpay.router.js";
import routerProduct from "./routes/product.js";
import routerUser from "./routes/user.js";
import routerSize from "./routes/size.js";
import routerColor from "./routes/color.js";

import routerCustomer from "./routes/customer.js";

//config
const app = express();
const API_DB = process.env.API_DB;
// middleware
app.use(cors());
app.use(express.json());
// router
app.use("/api", routerCategory);
app.use("/api", routerContact);
app.use("/api", routerInformation);
app.use("/api", routerCart);
app.use("/api", routerFavoriteProduct);
app.use("/api", routerComment);
app.use("/api", routerAddress);
app.use("/api", routerNews);
app.use("/api", routerRole);
app.use("/api", orderRoute);
app.use("/api", routerNews);
app.use("/api", routerimage_news);
app.use("/api", routerImageProduct);
app.use("/api", routerPayment);
app.use("/api/payments", paymentRouter);
app.use("/api/sales", saleRouter);
app.use("/api", routerProduct);
app.use("/api", routerUser);
app.use("/api", routerSize);
app.use("/api", routerColor);

app.use("/api", routerCustomer);

// database config
mongoose.connect(API_DB);
export const viteNodeApp = app;
