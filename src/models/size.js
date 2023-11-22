import mongoose from "mongoose";
const sizeSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true, versionKey: false }
);
export default mongoose.model("Size", sizeSchema);
