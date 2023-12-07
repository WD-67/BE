import express from "express";
import {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  cartDeleteByUser,
  updateCartCheck,
} from "../controllers/cart";
import Cart from "../models/cart.js";
import Orders from "../models/orders.js";
const router = express.Router();
router.get("/cart", getAllCarts);
router.get("/cart/:id", getCartById);
router.post("/cart", createCart);


router.put("/cart/:id", updateCart);
router.delete("/cart/:userId/products/:productId", deleteCart);
router.get("/cart-delete/:userId/:idProduct", cartDeleteByUser);
router.put("/cart-check/:id", updateCartCheck);


router.post('/SuccessOrder', async (req, res) => {
  //cp nhat order
  var body = req.body;
  const ress = await Orders.find({ id_user: body.data })
  console.log(body);

  var objsId = ress[ress.length - 1];

  const r = await Orders.updateMany({ date_created: objsId.date_created }, { $set: { type_pay: "online", pay_status: true, updatedAt: new Date(), } })
  res.json({ pay_success: true })

})
router.post("/updateCart/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body
  var lastData = await Cart.findOne({ userId: id }); lastData = lastData.items;
  // console.log(lastData);
  var ListOrder = [];
  var count = 1;
  for (let i = 0; i < lastData.length; i++) {
    let arr = lastData[i];
    //
    let strI = (i) + "";
    // console.log(strI)
    if (body[strI] !== undefined) {
      // ListOrder.puh?
      var size = arr.size;
      if (body[strI].size !== undefined) size = [body[strI].size];
      var color = arr.color;
      if (body[strI].color !== undefined) color = [body[strI].color];
      var quantity = arr.quantity;
      if (body[strI].quantity !== undefined) quantity = body[strI].quantity;

      ListOrder.push({
        _id: arr._id,
        productId: arr.productId,
        size,
        color,
        quantity,
        image: arr.image,
        price: arr.price,

        priceSale: arr.priceSale,
        checkOrder: arr.checkOrder,
        createdAt: arr.createdAt,
        updatedAt: arr.updatedAt,

      })
    }
    else {
      ListOrder.push(arr);
    }

    count++;
  }
  if (count != 1) {
    //update 
    const result = await Cart.updateOne({ userId: id }, {
      $set: {
        //es go here
        items: ListOrder
      },
    }
    );
    console.log(result)
    return result

  }

  return res.json(ListOrder)
  console.log(ListOrder)
});



export default router;
