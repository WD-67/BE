import Color from "../models/color";
import { colorSchema } from "../Schema/product";
export const getAllColor = async (req, res) => {
  try {
    const color = await Color.find();
    if (color.length === 0) {
      return res.json([]);
    }
    return res.json(color
    );
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const getColor = async (req, res) => {
  try {
    const color = await Color.findById(req.params.id);
    if (!color) {
      return res.json({
        message: "Lấy color không thành công !",
      });
    }
    return res.json(

      color,
    );
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};
export const createColor = async (req, res) => {
  // try {

  //check name
  // const colorAll = await Color.find();
  const colorName = await Color.findOne({
    name: req.body.name
  });
  // console.log(colorName)
  if (colorName) {
    return res.status(400).json({
      message: "Tên color đã tồn tại !",
    });
  }
  const color = await Color.create(req.body);
  if (!color) {
    return res.json({
      message: "Thêm color không thành công! ",
    });
  }

  return res.json(
    color,
  );
  // } catch (error) {
  //   return res.json({
  //     message: error,
  //   });
  // }
};
export const updateColor = async (req, res) => {
  try {
    //validate
    // const { error } = colorSchema.validate(req.body, { abortEarly: false });
    // if (error) {
    //   return res.status(400).json({
    //     message: error.details.map((error) => error.message),
    //   });
    // }
    const colorAll = await Color.find();
    const colorName = colorAll.find(
      (color) => color.name.toLowerCase() === req.body.name.toLowerCase()
    );
    if (colorName) {
      return res.status(400).json({
        message: "Tên color đã có trong danh sách hoặc đã tồn tại !",
      });
    }
    const color = await Color.findByIdAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    });
    if (!color) {
      return res.json({
        message: "Cập nhật color không thành công !",
      });
    }
    return res.json({
      message: "Cập nhật color thành công !",
      color,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};
export const removeColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.id);
    if (!color) {
      return res.json({
        message: "Xóa color không thành công !",
      });
    }
    return res.json({
      message: "Xóa color thành công !",
      color,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};
