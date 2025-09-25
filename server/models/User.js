const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

// 비밀번호 암호화 (저장 전에 실행)
userSchema.pre("save", async function (next) {
  // 비밀번호가 수정되지 않았으면 암호화하지 않음
  if (!this.isModified("password")) return next();

  try {
    // 비밀번호를 12자리 salt로 암호화
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 확인 메서드
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
