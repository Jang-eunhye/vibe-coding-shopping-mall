const { body } = require("express-validator");

// 주문 생성 검증 미들웨어
const createOrderValidation = [
  body("shippingAddress.recipientName")
    .notEmpty()
    .withMessage("수령인 이름은 필수입니다")
    .isLength({ max: 50 })
    .withMessage("수령인 이름은 50자를 초과할 수 없습니다"),
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("연락처는 필수입니다")
    .matches(/^[0-9-+().\s]+$/)
    .withMessage("올바른 연락처 형식이 아닙니다"),
  body("shippingAddress.address")
    .notEmpty()
    .withMessage("주소는 필수입니다")
    .isLength({ max: 200 })
    .withMessage("주소는 200자를 초과할 수 없습니다"),
  body("paymentMethod")
    .notEmpty()
    .withMessage("결제 방법은 필수입니다")
    .isIn(["card", "bank_transfer", "kakao_pay", "naver_pay", "toss_pay"])
    .withMessage("올바른 결제 방법이 아닙니다"),
  body("deliveryMemo")
    .optional()
    .isLength({ max: 200 })
    .withMessage("배송 메모는 200자를 초과할 수 없습니다"),
];

// 주문 취소 검증 미들웨어
const cancelOrderValidation = [];

// 결제 완료 검증 미들웨어
const completePaymentValidation = [
  body("paymentId")
    .notEmpty()
    .withMessage("결제 ID는 필수입니다")
    .isLength({ min: 1, max: 100 })
    .withMessage("결제 ID는 1-100자 사이여야 합니다"),
];

// 관리자 주문 상태 변경 검증 미들웨어
const updateOrderStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("주문 상태는 필수입니다")
    .isIn([
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .withMessage("올바른 주문 상태가 아닙니다"),
  body("trackingNumber")
    .optional()
    .isLength({ max: 50 })
    .withMessage("운송장 번호는 50자를 초과할 수 없습니다"),
];

module.exports = {
  createOrderValidation,
  cancelOrderValidation,
  completePaymentValidation,
  updateOrderStatusValidation,
};
