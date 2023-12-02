import express from "express";
import * as SaleController from "../controllers/sale.controller";
import * as SaleValidator from "../Schema/sale.schema";

const saleRouter = express.Router();

saleRouter.route("/decrease-sale/:id").patch(SaleController.decreaseSale)
saleRouter.route("/:id").get(SaleController.getById).put(SaleValidator.validation, SaleController.update).delete(SaleController.destroy);
saleRouter.route("/").get(SaleController.getList).post(SaleValidator.validation, SaleController.create);

export default saleRouter;
