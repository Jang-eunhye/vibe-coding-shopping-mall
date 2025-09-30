import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 장바구니 조회
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/carts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
      } else {
        console.error("장바구니 조회 실패:", data.message);
        setCart(null);
      }
    } catch (error) {
      console.error("장바구니 조회 오류:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 수량 수정
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/carts/items/${itemId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
        // 헤더의 장바구니 개수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "수량 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("수량 수정 오류:", error);
      alert("수량 수정 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  // 아이템 제거
  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("정말로 이 상품을 장바구니에서 제거하시겠습니까?")) {
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/carts/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
        // 헤더의 장바구니 개수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "상품 제거에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 제거 오류:", error);
      alert("상품 제거 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  // 장바구니 비우기
  const handleClearCart = async () => {
    if (!window.confirm("정말로 장바구니를 비우시겠습니까?")) {
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/carts", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data);
        // 헤더의 장바구니 개수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "장바구니 비우기에 실패했습니다.");
      }
    } catch (error) {
      console.error("장바구니 비우기 오류:", error);
      alert("장바구니 비우기 중 오류가 발생했습니다.");
    } finally {
      setUpdating(false);
    }
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1 className="cart-title">장바구니</h1>
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛍️</div>
          <h2>장바구니가 비어있습니다</h2>
          <p>원하는 상품을 장바구니에 추가해보세요!</p>
          <button
            className="continue-shopping-button"
            onClick={() => navigate("/")}
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">장바구니</h1>
        <p className="cart-subtitle">총 {cart.totalItems}개 상품</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="product-image"
                />
              </div>

              <div className="item-details">
                <h3 className="item-name">{item.product.name}</h3>
                <p className="item-category">
                  {item.product.category.toUpperCase()}
                </p>
                <p className="item-sku">SKU: {item.product.sku}</p>
              </div>

              <div className="item-quantity">
                <label className="quantity-label">수량</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-button"
                    onClick={() =>
                      handleQuantityChange(item._id, item.quantity - 1)
                    }
                    disabled={updating || item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="quantity-button"
                    onClick={() =>
                      handleQuantityChange(item._id, item.quantity + 1)
                    }
                    disabled={updating || item.quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="item-price">
                <div className="price-value">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>

              <button
                className="remove-button"
                onClick={() => handleRemoveItem(item._id)}
                disabled={updating}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="order-summary-box">
            <div className="summary-row">
              <span className="summary-label">총 상품금액</span>
              <span className="summary-value">
                {formatPrice(cart.totalPrice)}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">총 배송비</span>
              <span className="summary-value">0원</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row final-payment">
              <span className="summary-label">결제 예정 금액</span>
              <span className="summary-value final-amount">
                {formatPrice(cart.totalPrice)} 원
              </span>
            </div>
          </div>

          <div className="order-buttons">
            <button
              className="order-all-button"
              onClick={() => navigate("/order")}
            >
              전체 상품 주문하기
            </button>
            <button
              className="order-selected-button"
              onClick={() => alert("선택 상품 주문 기능은 준비 중입니다.")}
            >
              선택 상품 주문하기
            </button>
          </div>

          <div className="cart-actions">
            <button
              className="clear-cart-button"
              onClick={handleClearCart}
              disabled={updating}
            >
              장바구니 비우기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
