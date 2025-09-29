import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats] = useState({
    totalOrders: 1234,
    totalProducts: 156,
    totalCustomers: 2345,
    totalRevenue: 45678,
    ordersGrowth: 12,
    productsGrowth: 3,
    customersGrowth: 8,
    revenueGrowth: 15,
  });

  const [recentOrders] = useState([
    {
      id: "ORD-001234",
      customer: "김민수",
      date: "2024-12-30",
      amount: "$219",
    },
    {
      id: "ORD-001233",
      customer: "이영희",
      date: "2024-12-29",
      amount: "$156",
    },
    { id: "ORD-001232", customer: "박철수", date: "2024-12-29", amount: "$89" },
  ]);

  const quickActions = [
    { title: "새상품 등록", icon: "📦", action: "add-product" },
    { title: "상품 관리", icon: "🛍️", action: "manage-products" },
    { title: "주문 관리", icon: "📋", action: "manage-orders" },
    { title: "매출 분석", icon: "📊", action: "sales-analysis" },
    { title: "고객 관리", icon: "👥", action: "manage-customers" },
  ];

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);

    switch (action) {
      case "add-product":
        navigate("/admin/products/new");
        break;
      case "manage-products":
        navigate("/admin/products");
        break;
      case "manage-orders":
        console.log("주문 관리 페이지로 이동");
        break;
      case "sales-analysis":
        console.log("매출 분석 페이지로 이동");
        break;
      case "manage-customers":
        console.log("고객 관리 페이지로 이동");
        break;
      default:
        console.log(`알 수 없는 액션: ${action}`);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* 헤더 섹션 */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">관리자 대시보드</h1>
        <p className="dashboard-subtitle">
          eunhyeshop 쇼핑몰 관리 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3 className="stat-title">총 주문</h3>
            <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
            <p className="stat-growth positive">+{stats.ordersGrowth}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-title">총 상품</h3>
            <p className="stat-value">{stats.totalProducts}</p>
            <p className="stat-growth positive">+{stats.productsGrowth}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-title">총 고객</h3>
            <p className="stat-value">
              {stats.totalCustomers.toLocaleString()}
            </p>
            <p className="stat-growth positive">+{stats.customersGrowth}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3 className="stat-title">총 매출</h3>
            <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
            <p className="stat-growth positive">+{stats.revenueGrowth}%</p>
          </div>
        </div>
      </div>

      {/* 하단 섹션 */}
      <div className="dashboard-bottom">
        {/* 빠른 작업 */}
        <div className="quick-actions">
          <h2 className="section-title">빠른 작업</h2>
          <div className="action-buttons">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`action-button ${
                  action.action === "add-product" ? "primary" : ""
                }`}
                onClick={() => handleQuickAction(action.action)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-text">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="recent-orders">
          <div className="orders-header">
            <h2 className="section-title">최근 주문</h2>
            <a href="#" className="view-all-link">
              전체보기
            </a>
          </div>
          <div className="orders-list">
            {recentOrders.map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-info">
                  <span className="order-id">{order.id}</span>
                  <span className="order-customer">{order.customer}</span>
                </div>
                <div className="order-details">
                  <span className="order-date">{order.date}</span>
                  <span className="order-amount">{order.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
