const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 장바구니 조회
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "sku name price image category",
    });

    // 장바구니가 없으면 새로 생성
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      await cart.save();
    }

    res.json({
      success: true,
      message: "장바구니를 성공적으로 조회했습니다",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "장바구니 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// 장바구니에 상품 추가
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, color = "", size = "" } = req.body;

    // 상품 존재 여부 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다",
      });
    }

    // 상품이 비활성화된 경우
    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "현재 판매하지 않는 상품입니다",
      });
    }

    // 재고 확인 (현재는 무제한으로 처리)
    // TODO: 재고 관리 기능 구현 시 활성화
    // if (product.stock < quantity) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "재고가 부족합니다",
    //   });
    // }

    // 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    // 상품 추가
    await cart.addItem(productId, quantity, {
      color,
      size,
      price: product.price,
    });

    // 업데이트된 장바구니 조회 (populate 포함)
    const updatedCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "sku name price image category",
    });

    res.status(201).json({
      success: true,
      message: "상품이 장바구니에 추가되었습니다",
      data: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "장바구니에 상품 추가에 실패했습니다",
      error: error.message,
    });
  }
};

// 장바구니 아이템 수량 수정
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: "수량은 1-10 사이여야 합니다",
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "장바구니를 찾을 수 없습니다",
      });
    }

    // 아이템 수량 업데이트
    await cart.updateItemQuantity(itemId, quantity);

    // 업데이트된 장바구니 조회 (populate 포함)
    const updatedCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "sku name price image category",
    });

    res.json({
      success: true,
      message: "장바구니 아이템이 수정되었습니다",
      data: updatedCart,
    });
  } catch (error) {
    if (error.message === "장바구니 아이템을 찾을 수 없습니다") {
      return res.status(404).json({
        success: false,
        message: "장바구니 아이템을 찾을 수 없습니다",
      });
    }

    res.status(500).json({
      success: false,
      message: "장바구니 아이템 수정에 실패했습니다",
      error: error.message,
    });
  }
};

// 장바구니에서 상품 제거
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "장바구니를 찾을 수 없습니다",
      });
    }

    // 아이템 제거
    await cart.removeItem(itemId);

    // 업데이트된 장바구니 조회 (populate 포함)
    const updatedCart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "sku name price image category",
    });

    res.json({
      success: true,
      message: "상품이 장바구니에서 제거되었습니다",
      data: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "장바구니에서 상품 제거에 실패했습니다",
      error: error.message,
    });
  }
};

// 장바구니 비우기
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "장바구니를 찾을 수 없습니다",
      });
    }

    // 장바구니 비우기
    await cart.clearCart();

    res.json({
      success: true,
      message: "장바구니가 비워졌습니다",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "장바구니 비우기에 실패했습니다",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
