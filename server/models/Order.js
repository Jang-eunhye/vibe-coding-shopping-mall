const mongoose = require("mongoose");
const { applyOrderMiddlewares } = require("../middleware/orderModel");

// 주문 아이템 스키마
const orderItemSchema = new mongoose.Schema({
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
  },
  price: {
    type: Number,
    required: [true, "가격은 필수입니다"],
    min: [0, "가격은 0 이상이어야 합니다"],
  },
});

// 배송지 정보 스키마
const shippingAddressSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: [true, "수령인 이름은 필수입니다"],
    trim: true,
    maxlength: [50, "수령인 이름은 50자를 초과할 수 없습니다"],
  },
  phone: {
    type: String,
    required: [true, "연락처는 필수입니다"],
    trim: true,
    match: [/^[0-9-+().\s]+$/, "올바른 연락처 형식이 아닙니다"],
  },
  address: {
    type: String,
    required: [true, "주소는 필수입니다"],
    trim: true,
    maxlength: [200, "주소는 200자를 초과할 수 없습니다"],
  },
  detailAddress: {
    type: String,
    trim: true,
    maxlength: [100, "상세주소는 100자를 초과할 수 없습니다"],
  },
  deliveryMemo: {
    type: String,
    trim: true,
    maxlength: [200, "배송 메모는 200자를 초과할 수 없습니다"],
  },
});

// 주문 스키마
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "주문번호는 필수입니다"],
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "사용자 정보는 필수입니다"],
    },
    items: [orderItemSchema],

    // 가격 정보
    subtotal: {
      type: Number,
      required: [true, "상품 총액은 필수입니다"],
      min: [0, "상품 총액은 0 이상이어야 합니다"],
    },
    totalAmount: {
      type: Number,
      required: [true, "총 결제 금액은 필수입니다"],
      min: [0, "총 결제 금액은 0 이상이어야 합니다"],
    },

    // 배송 정보
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "배송지 정보는 필수입니다"],
    },

    // 주문 상태
    status: {
      type: String,
      required: [true, "주문 상태는 필수입니다"],
      enum: {
        values: [
          "pending", // 결제 대기
          "paid", // 결제 완료
          "processing", // 주문 처리 중
          "shipped", // 배송 중
          "delivered", // 배송 완료
          "cancelled", // 주문 취소
          // "refunded", // 환불 완료
        ],
        message: "올바른 주문 상태가 아닙니다",
      },
      default: "paid",
    },

    // 결제 정보
    paymentMethod: {
      type: String,
      required: [true, "결제 방법은 필수입니다"],
      enum: {
        values: ["card", "bank_transfer", "kakao_pay", "naver_pay", "toss_pay"],
        message: "올바른 결제 방법이 아닙니다",
      },
    },
    paymentStatus: {
      type: String,
      required: [true, "결제 상태는 필수입니다"],
      enum: {
        values: ["pending", "completed", "failed", "cancelled", "refunded"],
        message: "올바른 결제 상태가 아닙니다",
      },
      default: "pending",
    },
    paymentId: {
      type: String,
      trim: true,
    },
    merchantUid: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },

    // 배송 정보
    trackingNumber: {
      type: String,
      trim: true,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 미들웨어 적용
applyOrderMiddlewares(orderSchema);

module.exports = mongoose.model("Order", orderSchema);
