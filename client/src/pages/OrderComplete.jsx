import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderComplete.css";

function OrderComplete() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 주문 정보 가져오기
    const orderData = localStorage.getItem("lastOrder");
    const orderStatus = localStorage.getItem("orderStatus");

    if (orderData) {
      setOrder(JSON.parse(orderData));
      // 주문 정보를 한 번만 사용하고 삭제
      localStorage.removeItem("lastOrder");
    }

    if (orderStatus) {
      setIsSuccess(orderStatus === "success");
      localStorage.removeItem("orderStatus");
    }

    setLoading(false);
  }, []);

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    return new Date(date).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="order-complete-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!order && isSuccess) {
    return (
      <div className="order-complete-page">
        <div className="no-order">
          <h2>주문 정보를 찾을 수 없습니다</h2>
          <button onClick={() => navigate("/")}>홈으로 이동</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-complete-page">
      <div className="order-complete-content">
        {/* 주문 완료/실패 메시지 */}
        <div
          className={`complete-message ${isSuccess ? "success" : "failure"}`}
        >
          <div className={`status-icon ${isSuccess ? "success" : "failure"}`}>
            {isSuccess ? "✓" : "✗"}
          </div>
          <h1>
            {isSuccess ? "주문이 완료되었습니다!" : "주문이 실패했습니다"}
          </h1>
          {isSuccess && order && (
            <>
              <p className="order-number">주문번호: {order.orderNumber}</p>
              <p className="order-date">
                주문일시: {formatDate(order.createdAt)}
              </p>
            </>
          )}
          {!isSuccess && (
            <p className="failure-message">
              결제 처리 중 오류가 발생했습니다.
              <br />
              다시 시도해주세요.
            </p>
          )}
        </div>

        {/* 주문 성공 시에만 상세 정보 표시 */}
        {isSuccess && order && (
          <>
            {/* 주문 정보 요약 */}
            <div className="order-summary">
              <h2>주문 정보</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">주문자</span>
                  <span className="value">{order.user.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">이메일</span>
                  <span className="value">{order.user.email}</span>
                </div>
                <div className="summary-item">
                  <span className="label">결제 방법</span>
                  <span className="value">
                    {order.paymentMethod === "card" && "신용카드"}
                    {order.paymentMethod === "toss_pay" && "토스페이"}
                    {order.paymentMethod === "kakao_pay" && "카카오페이"}
                    {order.paymentMethod === "naver_pay" && "네이버페이"}
                    {order.paymentMethod === "bank_transfer" && "가상계좌"}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">결제 금액</span>
                  <span className="value amount">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 배송지 정보 */}
            <div className="shipping-info">
              <h2>배송지 정보</h2>
              <div className="shipping-details">
                <div className="shipping-item">
                  <span className="label">받는사람</span>
                  <span className="value">
                    {order.shippingAddress.recipientName}
                  </span>
                </div>
                <div className="shipping-item">
                  <span className="label">연락처</span>
                  <span className="value">{order.shippingAddress.phone}</span>
                </div>
                <div className="shipping-item">
                  <span className="label">주소</span>
                  <span className="value">
                    {order.shippingAddress.address}
                    {order.shippingAddress.detailAddress && (
                      <span className="detail-address">
                        <br />
                        {order.shippingAddress.detailAddress}
                      </span>
                    )}
                  </span>
                </div>
                {order.shippingAddress.deliveryMemo && (
                  <div className="shipping-item">
                    <span className="label">배송 메시지</span>
                    <span className="value">
                      {order.shippingAddress.deliveryMemo}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 주문 상품 */}
            <div className="order-items">
              <h2>주문 상품</h2>
              <div className="items-list">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="item-image"
                    />
                    <div className="item-info">
                      <h3 className="item-name">{item.product.name}</h3>
                      <p className="item-quantity">수량: {item.quantity}개</p>
                    </div>
                    <div className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 액션 버튼들 */}
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate("/")}>
            {isSuccess ? "쇼핑 계속하기" : "홈으로 이동"}
          </button>
          {!isSuccess && (
            <button className="btn-secondary" onClick={() => navigate("/cart")}>
              장바구니로 이동
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderComplete;
