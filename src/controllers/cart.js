import Cart from "../models/cart";
import Product from "../models/product";
// Get all carts
const getAllCarts = async (req, res) => {
  try {
    if (!req.query.userId) {
      const carts = await Cart.find()
        .populate({
          path: "items.productId",
          model: "Product",
        })
        .populate({
          path: "userId",
          model: "User",
        });
      if (carts.length === 0) {
        return res.status(200).json({
          message: "Lấy danh sách Cart không thành công",
        });
      }
      return res.status(200).json(carts);
    } else {
      const carts = await Cart.find({ userId: req.query.userId })
        .populate({
          path: "items.productId",
          model: "Product",
        })
        .populate({
          path: "userId",
          model: "User",
        })
        .where("userId", req.query.userId);
      if (carts.length === 0) {
        return res.status(200).json({
          message: "Lấy danh sách Cart không thành công",
        });
      }
      return res.status(200).json(carts);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single cart by ID
const getCartById = async (req, res) => {
  console.log("1")
  try {
    const cart = await Cart.findOne({ userId: req.params.id }).populate({
      path: "items.productId",
      model: "Product",
    });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new cart
const createCart = async (req, res) => {
  const { items, userId } = req.body;
  const { size, color, image, quantity, productId, checkOrder } = items[0];
  // console.log(items[0], "đã được tạo");

  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      const existingItem = cart.items.find(item => item.productId == productId);
      console.log(existingItem)

      if (existingItem) {
        // Nếu sản phẩm đã tồn tại trong giỏ hàng, chỉ cập nhật số lượng và giá
        existingItem.quantity += Number(quantity);
        const product = await Product.findById(productId).populate("sale");
        existingItem.price = Number(product.price) * existingItem.quantity;
        existingItem.priceSale = Number(product.sale.sale) * existingItem.quantity;
      } else {
        // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm vào giỏ hàng
        const product = await Product.findById(productId).populate("sale");
        cart.items.push({
          productId,
          size: [...size],
          color: [...color],
          image: [...image],
          quantity: Number(quantity),
          price: Number(product.price) * Number(quantity),
          priceSale: Number(product.sale.sale) * Number(quantity),
          checkOrder: checkOrder
        });
      }

      // Cập nhật tổng số lượng và giá trị giỏ hàng
      cart.totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
      cart.totalpriceSale = cart.items.reduce((total, item) => total + item.priceSale, 0);
      await cart.save();
      res.status(200).json({
        message: "Cập nhật giỏ hàng thành công",
        cart: cart,
      });
    } else {
      // Nếu giỏ hàng chưa tồn tại, tạo mới giỏ hàng
      const newCart = await Cart.create(req.body);
      const product = await Product.findById(productId).populate("sale");

      if (!product) {
        return res.status(404).json({ error: "Sản phẩm không tồn tại" });
      }

      // Cập nhật tổng số lượng và giá trị giỏ hàng
      newCart.totalQuantity = newCart.items.reduce((total, item) => total + item.quantity, 0);
      newCart.totalPrice = newCart.items.reduce((total, item) => total + item.price, 0);
      newCart.totalpriceSale = newCart.items.reduce((total, item) => total + item.priceSale, 0);

      await newCart.save();

      res.status(201).json({
        message: "Thêm Cart thành công",
        cart: newCart,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Update a cart by ID
const updateCart = async (req, res) => {
  const { id } = req.params; // id của user
  const { _id, quantity } = req.body; // id của từng sản phẩm và số lượng chứ không phải id của product

  try {
    const cart = await Cart.findOne({ userId: id });
    // Nếu cart không tồn tại
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Kiểm tra sản phẩm có tồn tại trong giỏ hàng không
    const existingItem = cart.items.find((item) => item._id.toString() === _id);
    if (existingItem) {
      const product = await Product.findById(existingItem.productId).populate(
        "sale"
      );

      // Nếu product không tồn tại
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      existingItem.quantity = quantity;
      existingItem.price = product.price * quantity;
      existingItem.priceSale = Number(product.sale.sale) * quantity;
    } else {
      return res.status(200).json({
        message: "Cập nhật giỏ hàng không thành công",
      });
    }
    // }

    await cart.save();

    res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      cart: cart,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Delete a product from cart by userId and productId
const deleteProductFromCart = async (userId, productId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    // Tìm sản phẩm cần xóa trong giỏ hàng
    const deletedItem = cart.items.find(
      (item) => item._id.toString() === productId
    );

    if (!deletedItem) {
      throw new Error("Product not found in cart");
    }

    // Lấy thông tin về giá và số lượng của sản phẩm
    const { price, priceSale, quantity } = deletedItem;

    // Xóa sản phẩm từ mảng items
    cart.items = cart.items.filter((item) => item._id.toString() !== productId);

    // Cập nhật lại tổng giá trị của giỏ hàng
    cart.totalPrice -= price * quantity;
    cart.totalPriceSale -= priceSale * quantity;

    await cart.save();
    // Kiểm tra và xóa sản phẩm từ mảng items
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: productId } } },
      { new: true }
    );

    if (!updatedCart) {
      throw new Error("Product not found in cart");
    }

    return updatedCart;
  } catch (error) {
    throw error;
  }
};

// Delete a cart by ID
const deleteCart = async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const cart = await deleteProductFromCart(userId, productId);
    res.status(200).json({ message: "Product deleted from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const cartDeleteByUser = async (req, res) => {
  try {
    const { userId, idProduct } = req.params;
    console.log(userId, idProduct);
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { productId: idProduct } } },
      { new: true }
    );
    return res.json(updatedCart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const updateCartCheck = async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  try {
    for (const item of items) {
      await Cart.updateOne(
        { userId: id, 'items._id': item._id },
        { $set: { 'items.$.checkOrder': item.checkOrder } }
      );
    }
    const updatedData = await Cart.findOne({ userId: id }).select('items');
    return res.json({ data: updatedData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



// Export the controller functions
export { getAllCarts, getCartById, createCart, updateCart, deleteCart, cartDeleteByUser, updateCartCheck };
