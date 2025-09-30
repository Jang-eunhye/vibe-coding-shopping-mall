import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/OrderList.css";

function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState([]);

  // 탭 목록
  const tabs = [
    { id: "all", label: "전체", status: null },
    { id: "pending", label: "결제대기", status: "pending" },
    { id: "paid", label: "결제완료", status: "paid" },
    { id: "processing", label: "처리중", status: "processing" },
    { id: "shipping", label: "배송중", status: "shipped" },
    { id: "completed", label: "배송완료", status: "delivered" },
    { id: "cancelled", label: "주문취소", status: "cancelled" },
  ];

  console.log("OrderList 탭 목록:", tabs);

  // 주문 목록 조회
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // 서버에서 data.data.orders로 반환하므로 orders 배열을 추출
        const ordersData = Array.isArray(data.data?.orders)
          ? data.data.orders
          : [];
        setOrders(ordersData);
        console.log("주문 목록 조회 성공:", ordersData);
      } else {
        console.error("주문 목록 조회 실패:", data.message);
        setOrders([]);
        alert("주문 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("주문 목록 조회 오류:", error);
      setOrders([]);
      alert("주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경 시 주문 필터링
  useEffect(() => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    if (activeTab === "all") {
      setFilteredOrders(orders);
    } else {
      const tab = tabs.find((tab) => tab.id === activeTab);
      let filtered;

      if (Array.isArray(tab.status)) {
        // 여러 상태를 포함하는 경우
        filtered = orders.filter((order) => tab.status.includes(order.status));
      } else {
        // 단일 상태인 경우
        filtered = orders.filter((order) => order.status === tab.status);
      }

      setFilteredOrders(filtered);
    }
  }, [activeTab, orders]);

  useEffect(() => {
    fetchOrders();
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

  // 주문 상태 한글 변환
  const getStatusText = (status) => {
    const statusMap = {
      pending: "결제대기",
      paid: "결제완료",
      processing: "처리중",
      shipped: "배송중",
      delivered: "배송완료",
      cancelled: "취소됨",
    };
    return statusMap[status] || status;
  };

  // 주문 상태 색상
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#fbbf24", // 결제대기 - 노란색
      paid: "#8b5cf6", // 결제완료 - 보라색
      processing: "#06b6d4", // 주문처리중 - 청록색
      shipped: "#3b82f6", // 배송중 - 파란색
      delivered: "#10b981", // 배송완료 - 초록색
      cancelled: "#ef4444", // 주문취소 - 빨간색
    };
    return colorMap[status] || "#6c757d";
  };

  // 주문 상세 보기 함수 제거됨

  if (loading) {
    return (
      <div className="order-list-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="order-list-page">
      <div className="order-list-content">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <h1>주문 목록</h1>
          <p>주문하신 상품의 상태를 확인하실 수 있습니다.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="tab-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id !== "all" && (
                <span className="tab-count">
                  {Array.isArray(tab.status)
                    ? orders.filter((order) =>
                        tab.status.includes(order.status)
                      ).length
                    : orders.filter((order) => order.status === tab.status)
                        .length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 주문 목록 */}
        <div className="orders-container">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <h3>주문 내역이 없습니다</h3>
              <p>
                {activeTab === "all"
                  ? "아직 주문하신 상품이 없습니다."
                  : `${
                      tabs.find((tab) => tab.id === activeTab)?.label
                    } 상태의 주문이 없습니다.`}
              </p>
              <button className="btn-primary" onClick={() => navigate("/")}>
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="order-card"
                  data-status={order.status}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-date">
                        {formatDate(order.createdAt)}
                      </h3>
                      <p className="order-number">
                        주문번호: {order.orderNumber}
                      </p>
                    </div>
                    <div
                      className="order-status"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="item-image"
                        />
                        <div className="item-info">
                          <h4 className="item-name">{item.product.name}</h4>
                          <p className="item-quantity">
                            수량: {item.quantity}개
                          </p>
                        </div>
                        <div className="item-price">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <div className="quantity-info">
                        <span className="quantity-label">총 주문수량</span>
                        <span className="quantity-amount">
                          {order.items.reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}
                          개
                        </span>
                      </div>
                      <div className="total-info">
                        <span className="total-label">총 결제금액</span>
                        <span className="total-amount">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderList;
