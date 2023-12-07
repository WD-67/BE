import User from "../models/user";
import Role from "../models/role";
import { signinSchema, signupSchema, updateSchema, updateAdminSchema, changePasswordSchema } from "../Schema/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Product from "../models/product";
dotenv.config();
let isLoggedOut = false;
const { SECRET_CODE, EMAIL_USERNAME, EMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

export const signout = async (req, res) => {
  try {
    if (isLoggedOut) {
      return res.status(400).json({
        message: "Bạn đã đăng xuất rồi",
      });
    }
    // Xóa token bằng cách xóa cookie chứa token
    res.clearCookie("token");

    // Đánh dấu người dùng đã đăng xuất
    isLoggedOut = true;

    return res.status(200).json({
      message: "Đăng xuất thành công",
    });
    //res.redirect("/");  Chuyển hướng người dùng về trang chủ
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const signupUser = async (req, res) => {
  const { name, fullname, ngaysinh, trang_thai, email, password, image_url } =
    req.body;

  try {
    // validate đầu vào
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        messages: errors,
      });
    }

    // Kiểm tra trong db có tk không?
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(400).json({
        messages: "Email đã tồn tại",
      });
    }

    // Tìm vai trò "user" trong cơ sở dữ liệu
    let userRole = await Role.findOne({ role_name: "user" });
    if (!userRole) {
      // Nếu vai trò "user" chưa tồn tại, tạo mới nó
      userRole = await Role.create({
        role_name: "user",
        description: "người dùng",
      });
    }

    // Tạo người dùng với vai trò "user" và các thông tin khác
    const user = await User.create({
      name,
      fullname,
      ngaysinh,
      email,
      image_url,
      password,
      role: userRole._id, // Gán vai trò "user"
    });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Gửi email thông báo tạo tài khoản thành công
    const mailOptions = {
      from: "your-email@example.com", // Địa chỉ email gửi
      to: email, // Địa chỉ email người nhận
      subject: "Chào Mừng", // Tiêu đề email
      text: "Chúc mừng bạn đã đăng ký thành công tài khoản", // Nội dung email
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const signup = async (req, res) => {
  const {
    name,
    fullname,
    ngaysinh,
    trang_thai,
    email,
    password,
    role: role_name,
    image_url,
  } = req.body;

  try {
    // validate đầu vào
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        messages: errors,
      });
    }

    // Kiểm tra trong db có tk không?
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(400).json({
        messages: "Email đã tồn tại",
      });
    }

    // Tìm vai trò trong db dựa trên role_name
    const role = await Role.findOne({ role_name });
    if (!role) {
      return res.status(400).json({
        messages: "Không tìm thấy vai trò",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Tạo người dùng với vai trò và các thông tin khác
    const user = await User.create({
      name,
      fullname,
      ngaysinh,
      email,
      image_url,
      password: hashedPassword,
      role: role._id,
    });
    user.password = undefined;
    // Gửi email thông báo tạo tài khoản thành công
    const mailOptions = {
      from: "your-email@example.com", // Địa chỉ email gửi
      to: email, // Địa chỉ email người nhận
      subject: "Chào Mừng", // Tiêu đề email
      text: "Chúc mừng bạn đã đăng ký thành công tài khoản", // Nội dung email
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.status(201).json({
      message: "Tạo tài khoản thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = signinSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.json({
        success: false,
        messages: error.details.map((detail) => detail.message),
      });
    }
    const haveUser = await User.findOne({ email }).populate(
      "role",
      "id role_name"
    );
    if (!haveUser) {
      return res.status(400).json({
        message: "Email không tồn tại",
      });
    }
    // if (haveUser.isBlocked) {
    //   return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
    // }
    const checkPass = await bcrypt.compare(password, haveUser.password);
    if (!checkPass) {
      return res.status(400).json({
        message: "Mật khẩu không chính xác",
      });
    }
    const token = jwt.sign(
      {
        id: haveUser._id,
      },
      SECRET_CODE,
      { expiresIn: "1d" }
    );

    // Đặt JWT vào cookie thay vì accessToken
    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 }); // 1 ngày

    haveUser.password = undefined;
    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: haveUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { error } = signinSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);

      return res.status(400).json({
        messages: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email }).populate(
      "role",
      "id role_name"
    );
    if (!user) {
      return res.status(400).json({
        messages: "Email không tồn tại",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        messages: "Sai mật khẩu",
      });
    }
    const token = jwt.sign({ id: user._id }, SECRET_CODE, { expiresIn: "1d" });
    user.password = undefined;

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken: token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Loi server!",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await User.find().populate("role", "role_name");

    if (users.length === 0) {
      return res.json({
        message: "Không có user nào!",
      });
    }

    return res.json({
      message: "Lấy danh sách user thành công!",
      users,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.json({
        message: "Xóa user không thành công",
      });
    }
    return res.json({
      message: "Xóa user thành công",
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};

export const update = async (req, res) => {
  try {
    // Lấy thông tin user từ cơ sở dữ liệu
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // So sánh mật khẩu cũ đã hash với mật khẩu mới được gửi từ client

    // Validate thông tin cần update
    const { error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: error.details.map((error) => error.message),
      });
    }
    const passwordsMatch = await bcrypt.compare(
      req.body.confirmPassword,
      user.password
    );
    if (!passwordsMatch) {
      return res.status(400).json({ message: "Mật khẩu không khớp" });
    }

    // Thực hiện update thông tin user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.json({
      message: "Cập nhật thông tin user thành công!",
      user: updatedUser,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateAdmin = async (req, res) => {
  try {
  // Lấy thông tin user từ cơ sở dữ liệu
  const user = await User.findById(req.params.id);
  if (!user) {
  return res.status(404).json({ message: "Không tìm thấy user" });
  }
  const { error } = updateAdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
  return res.status(400).json({
  message: error.details.map((error) => error.message),
  });
  }
  
  // Lấy thông tin role từ cơ sở dữ liệu nếu có thay đổi
  let role = user.role;
  if (req.body.role_name && req.body.role_name !== user.role.role_name) {
    role = await Role.findOne({ role_name: req.body.role_name });
    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }
  }
  
  // Thực hiện update thông tin user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { role: role._id },
    {
      new: true,
    }
  ).populate('role', 'role_name');
  
  return res.json({
    message: "Cập nhật thông tin user thành công!",
    user: updatedUser,
  });
  } catch (error) {
  if (error.name === "CastError") {
  return res.status(400).json({ message: "Id không hợp lệ" });
  }
  return res.status(500).json({ message: "Lỗi server" });
  }
  };
export const get = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "role",
      "id role_name"
    );
    const favoriteProduct = await Product.find({
      _id: { $in: user.favoriteProducts },
    });
    if (!user) {
      return res.json({
        message: "Lấy user không thành công!",
      });
    }
    return res.json({
      message: "Lấy thông tin user thành công!",
      user,
      favoriteProduct,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Id không hợp lệ" });
    }
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const { error } = changePasswordSchema.validate({ oldPassword, newPassword, confirmPassword }, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Lỗi xác nhận mật khẩu mới',
        details: error.details.map((detail) => detail.message),
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới và xác nhận mật khẩu không khớp' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
