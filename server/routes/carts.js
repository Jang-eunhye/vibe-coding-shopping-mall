const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const authenticateToken = require("../middleware/auth");

// 장바구니 조회 (GET /api/carts) - 로그인 필요
router.get("/", authenticateToken, getCart);

// 장바구니에 상품 추가 (POST /api/carts/items) - 로그인 필요
router.post("/items", authenticateToken, addToCart);

// 장바구니 아이템 수량 수정 (PUT /api/carts/items/:itemId) - 로그인 필요
router.put("/items/:itemId", authenticateToken, updateCartItem);

// 장바구니에서 상품 제거 (DELETE /api/carts/items/:itemId) - 로그인 필요
router.delete("/items/:itemId", authenticateToken, removeFromCart);

// 장바구니 비우기 (DELETE /api/carts) - 로그인 필요
router.delete("/", authenticateToken, clearCart);

module.exports = router;
