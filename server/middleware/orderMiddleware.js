// Order 모델 관련 Mongoose 미들웨어들

// 주문번호 자동 생성 미들웨어
const generateOrderNumber = async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // 같은 날짜의 주문 수를 세어서 순번 생성
    const todayStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayOrderCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd },
    });

    const orderSequence = (todayOrderCount + 1).toString().padStart(4, "0");
    this.orderNumber = `ORD${year}${month}${day}${orderSequence}`;
  }
  next();
};

// 총 금액 계산 미들웨어
const calculateOrderAmount = function (next) {
  if (this.isModified("items") || this.isModified("subtotal")) {
    this.subtotal = this.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    this.totalAmount = this.subtotal;
  }
  next();
};

// Order 스키마에 미들웨어 적용하는 함수
const applyOrderMiddlewares = (orderSchema) => {
  // pre("save") 미들웨어들
  orderSchema.pre("save", generateOrderNumber);
  orderSchema.pre("save", calculateOrderAmount);

  // 인덱스 생성
  orderSchema.index({ orderNumber: 1 });
  orderSchema.index({ user: 1 });
  orderSchema.index({ status: 1 });
  orderSchema.index({ paymentStatus: 1 });
  orderSchema.index({ createdAt: -1 });
};

module.exports = {
  generateOrderNumber,
  calculateOrderAmount,
  applyOrderMiddlewares,
};
