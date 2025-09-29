const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU는 필수입니다"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, "SKU는 대문자, 숫자, 하이픈만 사용 가능합니다"],
    },
    name: {
      type: String,
      required: [true, "상품명은 필수입니다"],
      trim: true,
      maxlength: [100, "상품명은 100자를 초과할 수 없습니다"],
    },
    price: {
      type: Number,
      required: [true, "가격은 필수입니다"],
      min: [0, "가격은 0 이상이어야 합니다"],
    },
    category: {
      type: String,
      required: [true, "카테고리는 필수입니다"],
      enum: {
        values: ["outer", "top", "bottom", "acc"],
        message: "카테고리는 outer, top, bottom, acc 중 하나여야 합니다",
      },
    },
    image: {
      type: String,
      required: [true, "이미지는 필수입니다"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "설명은 1000자를 초과할 수 없습니다"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "재고는 0 이상이어야 합니다"],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// SKU 중복 검사 미들웨어
productSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("sku")) {
    const existingProduct = await this.constructor.findOne({
      sku: this.sku,
      _id: { $ne: this._id },
    });
    if (existingProduct) {
      const error = new Error("이미 존재하는 SKU입니다");
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// 인덱스 생성
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
