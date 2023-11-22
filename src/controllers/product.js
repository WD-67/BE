import Product from "../models/product";
import { productSchema, UpdateProduct } from "../Schema/product";
export const getAll = async (req, res) => {
  // const { _sort = "priceSale", _limit = 100, _order = "asc" } = req.query;
  // const option = {
  //   limit: _limit,
  //   sort: {
  //     [_sort]: _order === "asc" ? 1 : -1,
  //   },
  //   populate: "categoryId",
  // };
  try {
    const products = await Product.find({ is_deleted: false }).populate(
      "image"
    );
    // .paginate({}, option);
    if (products.length === 0) {
      return res.json({
        message: "Không có sản phẩm nào !",
      });
    }
    return res.json({
      message: "Lấy danh sách sản phẩm thành công !",
      products,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const get = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("image");

    if (!product) {
      return res.json({
        message: "Lấy sản phẩm không thành công !",
      });
    }
    return res.json({
      message: "Lấy 1 sản phẩm thành công !",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};
export const create = async (req, res) => {
  try {
    //validate
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((error) => error.message),
      });
    }
    const {
      name,
      price,
      image,
      quantity,
      sale,
      categoryId,
      description,
      colorSizes,
    } = req.body;
    const formattedColorSizes = colorSizes.map((colorSize) => {
      const { color, sizes } = colorSize;
      const formattedSizes = sizes.map((size) => {
        return {
          size: size.size,
          quantity: size.quantity,
        };
      });
      return {
        color,
        sizes: formattedSizes,
      };
    });

    //check name
    const productAll = await Product.find();
    const productName = productAll.find(
      (product) => product.name.toLowerCase() === req.body.name.toLowerCase()
    );
    if (productName) {
      return res.status(400).json({
        message: "Tên sản phẩm đã tồn tại !",
      });
    }
    const product = await Product.create({
      name,
      price,
      image,
      quantity,
      sale,
      categoryId,
      description,
      colorSizes: formattedColorSizes,
    });
    if (!product) {
      return res.json({
        message: "Thêm sản phẩm không thành công !",
      });
    }
    return res.json({
      message: "Thêm sản phẩm thành công !",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    // Validate
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((error) => error.message),
      });
    }

    // Lấy thông tin sản phẩm từ yêu cầu
    const updatedProduct = req.body;
    const { quantity, colorSizes } = updatedProduct;

    // Tính toán số lượng tổng cộng từng kích thước và màu sắc
    let totalQuantity = 0;
    colorSizes.forEach((colorSize) => {
      colorSize.sizes.forEach((size) => {
        totalQuantity += size.quantity;
      });
    });

    // Cập nhật số lượng tổng cộng và trạng thái tồn kho
    updatedProduct.quantity = totalQuantity;
    switch (true) {
      case totalQuantity <= 0:
        updatedProduct.inventoryStatus = "OUTOFSTOCK";
        break;
      case totalQuantity <= 10:
        updatedProduct.inventoryStatus = "LOWSTOCK";
        break;
      default:
        updatedProduct.inventoryStatus = "INSTOCK";
    }

    // Cập nhật sản phẩm
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedProduct,
      {
        new: true,
      }
    );

    if (!product) {
      return res.json({
        message: "Cập nhật sản phẩm không thành công!",
      });
    }

    return res.json({
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
    return res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { is_deleted: true },
      { new: true }
    );
    if (!product) {
      return res.json({
        message: "Xóa sản phẩm không thành công !",
      });
    }
    return res.json({
      message: "Xóa sản phẩm thành công !",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};
//xóa vinh viễn
export const removeProduct = async (req, res) => {
  try {
    // Find and remove the product by ID
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.json({
        message: "Xóa sản phẩm không thành công hoặc sản phẩm không tồn tại!",
      });
    }

    return res.json({
      message: "Xóa sản phẩm thành công!",
      product: deletedProduct,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getDeletedProducts = async (req, res) => {
  try {
    const products = await Product.find({ is_deleted: true }).populate("image");
    if (products.length === 0) {
      return res.json({
        message: "Không có sản phẩm nào !",
      });
    }
    return res.json({
      message: "Lấy danh sách sản phẩm thành công !",
      products,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
//khôi phục
export const restoreProduct = async (req, res) => {
  try {
    const updatedProduct = req.body;
    if (updatedProduct.hot_sale >= 0 && updatedProduct.price) {
      updatedProduct.priceSale =
        updatedProduct.price * (1 - updatedProduct.hot_sale / 100);
    }
    switch (true) {
      case updatedProduct.quantity <= 0:
        updatedProduct.inventoryStatus = "OUTOFSTOCK";
        break;
      case updatedProduct.quantity <= 10:
        updatedProduct.inventoryStatus = "LOWSTOCK";
        break;
      default:
        updatedProduct.inventoryStatus = "INSTOCK";
    }
    // Find the product by ID and update is_deleted to false
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { is_deleted: false },
      { new: true }
    );

    if (!product) {
      return res.json({
        message:
          "Khôi phục sản phẩm không thành công hoặc sản phẩm không tồn tại!",
      });
    }

    return res.json({
      message: "Khôi phục sản phẩm thành công!",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
    return res.status(400).json({
      message: error.message,
    });
  }
};
