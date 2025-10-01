import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ProductDetail.css";
import { API_BASE_URL } from "../config/api";

function ProductDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 상품 정보 조회
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products/${sku}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        console.error("상품 조회 실패:", data.message);
        alert("상품을 찾을 수 없습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("상품 조회 오류:", error);
      alert("상품 조회 중 오류가 발생했습니다.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [sku]);

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 수량 변경
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // 구매하기
  const handleBuyNow = async () => {
    try {
      setIsAddingToCart(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 상품 정보가 없으면 조회
      if (!product) {
        alert("상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/carts/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("상품이 장바구니에 추가되었습니다!");
        // 헤더의 장바구니 개수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        // 장바구니 페이지로 이동
        navigate("/cart");
      } else {
        alert(data.message || "장바구니 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("장바구니 추가 오류:", error);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // 장바구니 추가
  const handleAddToBag = async () => {
    try {
      setIsAddingToCart(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 상품 정보가 없으면 조회
      if (!product) {
        alert("상품 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/carts/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("상품이 장바구니에 추가되었습니다!");
        // 헤더의 장바구니 개수 업데이트를 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        alert(data.message || "장바구니 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("장바구니 추가 오류:", error);
      alert("장바구니 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail">
        <div className="no-product">상품을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      {/* 공유/북마크 아이콘 */}
      <div className="product-actions-top">
        <button className="action-icon" title="공유">
          📤
        </button>
        <button className="action-icon" title="북마크">
          ❤️
        </button>
      </div>

      <div className="product-detail-container">
        {/* 좌측 - 상품 이미지 */}
        <div className="product-image-section">
          <div className="main-image-container">
            <img
              src={product.image}
              alt={product.name}
              className="main-product-image"
            />
          </div>
        </div>

        {/* 우측 - 상품 정보 */}
        <div className="product-info-section">
          {/* 브랜드 로고 */}
          <div className="brand-logo">GIRBAUD PARIS</div>

          {/* 상품명 */}
          <h1 className="product-title">{product.name}</h1>

          {/* 가격 정보 */}
          <div className="price-section">
            <div className="product-price">{formatPrice(product.price)}</div>
          </div>

          {/* 수량 선택 */}
          <div className="option-section">
            <label className="option-label">수량</label>
            <div className="quantity-controls">
              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* 쿠폰/멤버십 정보 */}
          <div className="coupon-section">
            <div className="coupon-box">
              <span className="coupon-icon">🎁</span>
              <span className="coupon-text">
                공식몰 단독 멤버십 쿠폰 다운로드
              </span>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="action-buttons">
            <button
              className="buy-now-button"
              onClick={handleBuyNow}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "추가 중..." : "BUY NOW"}
            </button>
            <button
              className="add-to-bag-button"
              onClick={handleAddToBag}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "추가 중..." : "ADD TO BAG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
