import Product from "../models/product";
import { productSchema, UpdateProduct } from "../Schema/product";
import mongoose from "mongoose";

export const getAll = async (req, res) => {
  try {
    const products = await Product.find({ is_deleted: false })
      .populate("sale")
      .populate("categoryId")
      .populate("colorSizes.color")
      .populate("colorSizes.sizes.size");
    if (products.length === 0) {
      return res.json({
        message: "Không có sản phẩm nào !",
      });
    }
    const productsWithSaleName = products.map((product) => ({
      ...product._doc,
      sale: product.sale ? product.sale.sale : "No sale", // Thay đổi trường 'sale' thành tên của 'sale'
      categoryId: product.categoryId ? product.categoryId.name : "No category",
      colorSizes: product.colorSizes.map((colorSize) => ({
        ...colorSize._doc,
        color:
          colorSize.color && colorSize.color.name
            ? colorSize.color.name
            : "No color", // Thay đổi trường 'color' thành tên của 'color'
        sizes: colorSize.sizes.map((size) => ({
          ...size._doc,
          size: size.size ? size.size.size : "No size", // Thay đổi trường 'size' thành tên của 'size'
        })),
      })),
      categoryId: product.categoryId ? product.categoryId.name : "No category",
    }));

    return res.json({
      message: "Lấy danh sách sản phẩm thành công !",
      products: productsWithSaleName,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const get = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sale")
      .populate("categoryId")
      .populate("colorSizes.color")
      .populate("colorSizes.sizes.size");

    if (!product) {
      return res.json({
        message: "Lấy sản phẩm không thành công !",
      });
    }
    const productWithSaleName = {
      ...product._doc,
      sale: product.sale ? product.sale.sale : "No sale", // Thay đổi trường 'sale' thành tên của 'sale'
      categoryId: product.categoryId.name,
      colorSizes: product.colorSizes.map((colorSize) => ({
        ...colorSize._doc,
        color: colorSize.color ? colorSize.color.name : "No color", // Thay đổi trường 'color' thành tên của 'color'
        sizes: colorSize.sizes.map((size) => ({
          ...size._doc,
          size: size.size ? size.size.size : "No size", // Thay đổi trường 'size' thành tên của 'size'
        })),
      })),
      categoryId: product.categoryId.name,
    };
    return res.json({
      message: "Lấy 1 sản phẩm thành công !",
      product: productWithSaleName,
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
    const { error } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((error) => error.message),
      });
    }

    const id = req.params.id;

    // Kiểm tra xem ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Lấy thông tin sản phẩm từ yêu cầu
    const updatedProduct = req.body;
    const { quantity, colorSizes } = updatedProduct;

    // Tính toán số lượng tổng cộng từng kích thước và màu sắc
    // let totalQuantity = 0;
    // for (let colorSize of colorSizes) {
    //   for (let size of colorSize.sizes) {
    //     if (!isNaN(size.quantity)) {
    //       totalQuantity += size.quantity;
    //     } else {
    //       return res.status(400).json({
    //         message: "Giá trị quantity không hợp lệ",
    //       });
    //     }
    //   }
    // }

    // // Cập nhật số lượng tổng cộng và trạng thái tồn kho
    // updatedProduct.quantity = totalQuantity;
    // switch (true) {
    //   case totalQuantity <= 0:
    //     updatedProduct.inventoryStatus = "OUTOFSTOCK";
    //     break;
    //   case totalQuantity <= 10:
    //     updatedProduct.inventoryStatus = "LOWSTOCK";
    //     break;
    //   default:
    //     updatedProduct.inventoryStatus = "INSTOCK";
    // }

    const product = await Product.findByIdAndUpdate(id, updatedProduct, {
      new: true,
    });

    if (!product) {
      return res.status(400).json({
        message: "Không tìm thấy sản phẩm để cập nhật",
      });
    }

    return res.json(product);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
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
export const searchProducts = async (req, res) => {
  try {
    const searchQuery = new RegExp(req.params.name, "i");
    const products = await Product.find({ name: searchQuery });
    return res.status(200).json({
      message: "Sản phẩm tìm thấy",
      products,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
