const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "상품 정보는 필수입니다"],
  },
  quantity: {
    type: Number,
    required: [true, "수량은 필수입니다"],
    min: [1, "수량은 1개 이상이어야 합니다"],
    max: [10, "수량은 10개 이하여야 합니다"],
    default: 1,
  },
  price: {
    type: Number,
    required: [true, "가격은 필수입니다"],
    min: [0, "가격은 0 이상이어야 합니다"],
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "사용자 정보는 필수입니다"],
      unique: true, // 한 사용자당 하나의 장바구니만
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: [0, "총 상품 수는 0 이상이어야 합니다"],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, "총 가격은 0 이상이어야 합니다"],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 장바구니 아이템 추가/수정 시 총계 계산 미들웨어
cartSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.totalItems = this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.totalPrice = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    this.totalDiscountedPrice = this.items.reduce((total, item) => {
      const itemPrice = item.discountedPrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  }
  next();
});

// 장바구니 아이템 추가 메서드
cartSchema.methods.addItem = function (productId, quantity = 1, options = {}) {
  const existingItemIndex = this.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      item.selectedColor === (options.color || "") &&
      item.selectedSize === (options.size || "")
  );

  if (existingItemIndex > -1) {
    // 이미 존재하는 상품이면 수량 증가
    this.items[existingItemIndex].quantity += quantity;
    if (this.items[existingItemIndex].quantity > 10) {
      this.items[existingItemIndex].quantity = 10;
    }
  } else {
    // 새로운 상품 추가
    this.items.push({
      product: productId,
      quantity: quantity,
      selectedColor: options.color || "",
      selectedSize: options.size || "",
      price: options.price || 0,
      discountedPrice: options.discountedPrice,
    });
  }
  return this.save();
};

// 장바구니 아이템 수량 업데이트 메서드
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = Math.max(1, Math.min(10, quantity));
    return this.save();
  }
  throw new Error("장바구니 아이템을 찾을 수 없습니다");
};

// 장바구니 아이템 제거 메서드
cartSchema.methods.removeItem = function (itemId) {
  this.items.pull(itemId);
  return this.save();
};

// 장바구니 비우기 메서드
cartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

// 인덱스 생성
cartSchema.index({ user: 1 });
cartSchema.index({ isActive: 1 });
cartSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Cart", cartSchema);
