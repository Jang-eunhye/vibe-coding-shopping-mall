const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 주문 생성
const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, deliveryMemo } = req.body;

    // 장바구니 조회
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "sku name price image category isActive stock",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "장바구니가 비어있습니다",
      });
    }

    // 상품 재고 및 활성화 상태 확인
    for (const item of cart.items) {
      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `상품 "${item.product.name}"은 현재 판매하지 않습니다`,
        });
      }

      // 재고 확인 (재고 관리가 활성화된 경우)
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `상품 "${item.product.name}"의 재고가 부족합니다`,
        });
      }
    }

    // 주문 아이템 생성
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
    }));

    // 주문 생성
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal: cart.totalPrice,
      discountAmount: 0, // 할인 기능이 있다면 여기서 계산
      totalAmount: cart.totalPrice,
      shippingAddress: {
        ...shippingAddress,
        deliveryMemo: deliveryMemo || "",
      },
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
    });

    await order.save();

    // 장바구니 비우기
    await cart.clearCart();

    // 주문 정보와 함께 응답
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "sku name price image category",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.status(201).json({
      success: true,
      message: "주문이 성공적으로 생성되었습니다",
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "주문 생성에 실패했습니다",
      error: error.message,
    });
  }
};

// 주문 조회 (사용자별)
const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: "items.product",
        select: "sku name price image category",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      message: "주문 목록을 성공적으로 조회했습니다",
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "주문 목록 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// 주문 상세 조회
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate({
        path: "items.product",
        select: "sku name price image category description",
      })
      .populate({
        path: "user",
        select: "name email phone",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "주문을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "주문 상세 정보를 성공적으로 조회했습니다",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "주문 상세 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// 주문 취소
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "주문을 찾을 수 없습니다",
      });
    }

    // 취소 가능한 상태인지 확인
    if (!["pending", "paid", "processing"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "취소할 수 없는 주문 상태입니다",
      });
    }

    // 주문 취소 처리
    order.status = "cancelled";
    order.paymentStatus = "cancelled";
    await order.save();

    // 재고 복구 (재고 관리가 활성화된 경우)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: "주문이 성공적으로 취소되었습니다",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "주문 취소에 실패했습니다",
      error: error.message,
    });
  }
};

// 결제 완료 처리
const completePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "주문을 찾을 수 없습니다",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "결제할 수 없는 주문 상태입니다",
      });
    }

    // 결제 완료 처리
    order.paymentId = paymentId;
    await order.updateStatus("paid");

    // 재고 차감 (재고 관리가 활성화된 경우)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.json({
      success: true,
      message: "결제가 성공적으로 완료되었습니다",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "결제 완료 처리에 실패했습니다",
      error: error.message,
    });
  }
};

// 관리자용 주문 목록 조회
const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate({
        path: "items.product",
        select: "sku name price image category",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      message: "관리자 주문 목록을 성공적으로 조회했습니다",
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "관리자 주문 목록 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// 관리자용 주문 상태 변경
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, adminMemo } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "주문을 찾을 수 없습니다",
      });
    }

    // 주문 상태 변경
    order.status = status;

    // 배송 관련 상태 처리
    if (status === "shipped" && trackingNumber) {
      order.trackingNumber = trackingNumber;
      order.shippedAt = new Date();
    } else if (status === "delivered") {
      order.deliveredAt = new Date();
    } else if (status === "paid") {
      order.paymentStatus = "completed";
      order.paidAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "sku name price image category",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.json({
      success: true,
      message: "주문 상태가 성공적으로 변경되었습니다",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "주문 상태 변경에 실패했습니다",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  completePayment,
  getAdminOrders,
  updateOrderStatus,
};
