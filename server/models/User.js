const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "이메일을 입력해주세요"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "이름을 입력해주세요"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "비밀번호를 입력해주세요"],
      minlength: 6,
    },
    user_type: {
      type: String,
      required: [true, "사용자 타입을 입력해주세요"],
      enum: ["customer", "admin"],
      default: "customer",
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
