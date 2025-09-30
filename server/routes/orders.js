const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  completePayment,
  getAdminOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const {
  createOrderValidation,
  cancelOrderValidation,
  completePaymentValidation,
  updateOrderStatusValidation,
} = require("../middleware/orderValidation");

const router = express.Router();

// 일반 사용자 주문 관련 라우트
router.post("/", auth, createOrderValidation, createOrder); // 새 주문 생성
router.get("/", auth, getOrders); // 사용자 주문 목록 조회
router.get("/:orderId", auth, getOrderById); // 특정 주문 상세 조회
router.patch("/:orderId/cancel", auth, cancelOrderValidation, cancelOrder); // 주문 취소
router.patch(
  "/:orderId/payment",
  auth,
  completePaymentValidation,
  completePayment
); // 결제 완료

// 관리자 주문 관리 라우트
router.get("/admin/orders", adminAuth, getAdminOrders); // 관리자용 전체 주문 목록
router.patch(
  "/admin/:orderId/status",
  adminAuth,
  updateOrderStatusValidation,
  updateOrderStatus
); // 주문 상태 업데이트

module.exports = router;
