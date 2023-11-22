import mongoose from "mongoose";
const { Schema } = mongoose;
import paginate from "mongoose-paginate-v2";
const sizeQuantitySchema = new Schema({
  size: {
    type: mongoose.Types.ObjectId,
    ref: "size",
  },
  // quantity: {
  //   type: Number,
  //   default: 0,
  // },
});

const colorSizeSchema = new Schema({
  color: {
    type: mongoose.Types.ObjectId,
    ref: "Color",
  },

  sizes: [sizeQuantitySchema],
});
const productSchema = new Schema(
  {
    name: String,
    price: Number,
    image: Array,
    description: String,
    quantity: Number,
    sale: {
      type: mongoose.Types.ObjectId,
      ref: "sale",
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    colorSizes: [colorSizeSchema],
    is_deleted: {
      type: Boolean,
      default: false,
    },
    trang_thai: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    },
  },
  {
    timestamps: { currentTime: () => Date.now() + 7 * 60 * 60 * 1000 },
    versionKey: false,
  }
);
productSchema.pre("save", function (next) {
  if (this.isModified("hot_sale") || this.isModified("price")) {
    this.priceSale = this.price * (1 - this.hot_sale / 100);
  }
  let totalQuantity = 0;

  this.colorSizes.forEach((colorSize) => {
    colorSize.sizes.forEach((size) => {
      totalQuantity += size.quantity;
    });
  });

  this.quantity = totalQuantity;
  switch (true) {
    case this.quantity <= 0:
      this.inventoryStatus = "OUTOFSTOCK";
      break;
    case this.quantity <= 10:
      this.inventoryStatus = "LOWSTOCK";
      break;
    default:
      this.inventoryStatus = "INSTOCK";
  }
  next();
});
productSchema.plugin(paginate);
export default mongoose.model("Product", productSchema);
