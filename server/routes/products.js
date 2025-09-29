const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductBySku,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
} = require("../controllers/productController");
const { authenticateToken } = require("../middleware/auth");

// 모든 상품 조회 (공개)
router.get("/", getAllProducts);

// SKU로 상품 조회 (공개)
router.get("/:sku", getProductBySku);

// 상품 생성 (관리자만)
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자만 상품을 등록할 수 있습니다",
      });
    }
    next();
  },
  createProduct
);

// 상품 수정 (관리자만)
router.put(
  "/:sku",
  authenticateToken,
  (req, res, next) => {
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자만 상품을 수정할 수 있습니다",
      });
    }
    next();
  },
  updateProduct
);

// 상품 삭제 (관리자만)
router.delete(
  "/:sku",
  authenticateToken,
  (req, res, next) => {
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자만 상품을 삭제할 수 있습니다",
      });
    }
    next();
  },
  deleteProduct
);

// 상품 완전 삭제 (관리자만)
router.delete(
  "/:sku/hard",
  authenticateToken,
  (req, res, next) => {
    if (req.user.user_type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자만 상품을 완전 삭제할 수 있습니다",
      });
    }
    next();
  },
  hardDeleteProduct
);

module.exports = router;
