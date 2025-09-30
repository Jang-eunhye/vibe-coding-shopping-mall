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

// 일반 사용자 라우트
router.post("/", auth, createOrderValidation, createOrder);
router.get("/", auth, getOrders);
router.get("/:orderId", auth, getOrderById);
router.patch("/:orderId/cancel", auth, cancelOrderValidation, cancelOrder);
router.patch(
  "/:orderId/payment",
  auth,
  completePaymentValidation,
  completePayment
);

// 관리자 라우트
router.get("/admin/orders", adminAuth, getAdminOrders);
router.patch(
  "/admin/:orderId/status",
  adminAuth,
  updateOrderStatusValidation,
  updateOrderStatus
);

module.exports = router;
