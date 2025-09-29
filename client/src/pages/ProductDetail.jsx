import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";

function ProductDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("sky blue");
  const [selectedSize, setSelectedSize] = useState("S");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 상품 정보 조회
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${sku}`);
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

  // 할인 가격 계산 (10% 할인)
  const calculateDiscountedPrice = (price) => {
    return Math.floor(price * 0.9);
  };

  // 할인율 계산
  const calculateDiscountRate = (originalPrice, discountedPrice) => {
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100
    );
  };

  // 색상 옵션
  const colorOptions = [
    { name: "sky blue", value: "sky blue", color: "#87CEEB" },
    { name: "cream", value: "cream", color: "#F5F5DC" },
    { name: "black", value: "black", color: "#000000" },
  ];

  // 사이즈 옵션
  const sizeOptions = ["S", "M", "L", "XL"];

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

      const response = await fetch("http://localhost:5000/api/carts/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
          color: selectedColor,
          size: selectedSize,
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

      const response = await fetch("http://localhost:5000/api/carts/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity,
          color: selectedColor,
          size: selectedSize,
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

  // 선물하기
  const handleGift = () => {
    alert("선물하기 기능은 준비 중입니다.");
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

  const discountedPrice = calculateDiscountedPrice(product.price);
  const discountRate = calculateDiscountRate(product.price, discountedPrice);

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
            <div className="price-row">
              <span className="original-price">
                {formatPrice(product.price)}
              </span>
              <span className="discount-rate">{discountRate}%</span>
            </div>
            <div className="discounted-price">
              {formatPrice(discountedPrice)}
            </div>
          </div>

          {/* 색상 선택 */}
          <div className="option-section">
            <label className="option-label">
              COLOR {selectedColor.toUpperCase()}
            </label>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${
                    selectedColor === color.value ? "selected" : ""
                  }`}
                  onClick={() => setSelectedColor(color.value)}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 사이즈 선택 */}
          <div className="option-section">
            <label className="option-label">SIZE</label>
            <div className="size-options">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  className={`size-option ${
                    selectedSize === size ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
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
            <button className="gift-button" onClick={handleGift}>
              선물하기
            </button>
          </div>

          {/* 간편 결제 */}
          <div className="quick-payment">
            <button className="npay-button">
              <span className="npay-logo">N</span>
              <span className="npay-text">N pay 구매하기</span>
            </button>
          </div>

          {/* 오프라인 재고 조회 */}
          <div className="offline-stock">
            <button className="stock-check-button">
              오프라인 매장 재고 조회
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
