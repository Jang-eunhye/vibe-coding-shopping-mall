import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Order.css";

function Order() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState({
    // 배송지 정보
    shippingAddress: {
      recipientName: "",
      phone: "",
      address: "",
      detailAddress: "",
      deliveryMemo: "",
    },

    // 결제 정보
    paymentMethod: "card",
  });

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
        // 사용자 정보로 배송지 정보 초기화
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setOrderData((prev) => ({
            ...prev,
            shippingAddress: {
              ...prev.shippingAddress,
              recipientName: user.name || "",
              phone: "010-0000-0000", // 기본값
            },
          }));
        }
      } else {
        console.error("장바구니 조회 실패:", data.message);
        navigate("/cart");
      }
    } catch (error) {
      console.error("장바구니 조회 오류:", error);
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    initializePortOne();
  }, []);

  // 포트원 결제모듈 초기화
  const initializePortOne = () => {
    try {
      // 포트원이 로드될 때까지 대기
      if (window.IMP) {
        window.IMP.init("imp57512102");
        console.log("포트원 결제모듈 초기화 완료");
      } else {
        // 스크립트가 아직 로드되지 않은 경우 잠시 후 재시도
        setTimeout(() => {
          if (window.IMP) {
            window.IMP.init(
              process.env.REACT_APP_PORTONE_IMP_KEY || "imp57512102"
            );
            console.log("포트원 결제모듈 초기화 완료 (지연)");
          } else {
            console.error("포트원 스크립트 로드 실패");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("포트원 초기화 실패:", error);
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setOrderData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // 결제 요청
  const handlePayment = () => {
    if (!cart || cart.items.length === 0) {
      alert("주문할 상품이 없습니다.");
      return;
    }

    // 필수 정보 검증
    if (!orderData.shippingAddress.recipientName) {
      alert("받는사람 이름을 입력해주세요.");
      return;
    }
    if (!orderData.shippingAddress.phone) {
      alert("받는사람 연락처를 입력해주세요.");
      return;
    }
    if (!orderData.shippingAddress.address) {
      alert("주소를 입력해주세요.");
      return;
    }

    // 포트원이 초기화되지 않은 경우
    if (!window.IMP) {
      alert("결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 결제 요청
    const paymentData = {
      pg: getPaymentPG(orderData.paymentMethod),
      pay_method: orderData.paymentMethod,
      merchant_uid: `order_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      name:
        cart.items.length === 1
          ? cart.items[0].product.name
          : `${cart.items[0].product.name} 외 ${cart.items.length - 1}건`,
      amount: totalPrice,
      buyer_email: user?.email || "test@example.com",
      buyer_name: orderData.shippingAddress.recipientName,
      buyer_tel: orderData.shippingAddress.phone,
      buyer_addr: orderData.shippingAddress.address,
      buyer_postcode: "12345",
    };

    window.IMP.request_pay(paymentData, paymentCallback);
  };

  // 결제 방법에 따른 PG사 설정
  const getPaymentPG = (paymentMethod) => {
    // 테스트 환경에서는 간단한 PG 설정 사용
    return "html5_inicis";
  };

  // 결제 콜백 함수
  const paymentCallback = async (response) => {
    const { success, error_msg, imp_uid, merchant_uid } = response;

    if (success) {
      // 결제 성공 시 주문 생성
      try {
        await createOrder(imp_uid, merchant_uid);
        alert("결제가 완료되었습니다!");
        navigate("/");
      } catch (error) {
        console.error("주문 생성 오류:", error);
        alert(
          `결제는 완료되었지만 주문 생성 중 오류가 발생했습니다.\n\n오류 내용: ${error.message}\n\n고객센터에 문의해주세요.`
        );
      }
    } else {
      // 결제 실패
      alert(`결제 실패: ${error_msg}`);
    }
  };

  // 주문 생성 (결제 성공 후)
  const createOrder = async (imp_uid, merchant_uid) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        deliveryMemo: orderData.shippingAddress.deliveryMemo,
        paymentId: imp_uid,
        merchantUid: merchant_uid,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      // HTTP 상태 코드와 서버 에러 메시지를 포함한 상세 에러 정보
      const errorMessage = `HTTP ${response.status}: ${
        data.message || "주문 생성에 실패했습니다."
      }${data.error ? `\n상세 오류: ${data.error}` : ""}`;
      throw new Error(errorMessage);
    }

    return data;
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
      <div className="order-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="order-page">
        <div className="empty-cart">
          <h2>주문할 상품이 없습니다</h2>
          <button onClick={() => navigate("/cart")}>장바구니로 이동</button>
        </div>
      </div>
    );
  }

  const totalPrice = cart.totalPrice;

  // 사용자 정보 안전하게 가져오기
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("사용자 정보 파싱 오류:", error);
      return null;
    }
  };

  const user = getUserInfo();

  return (
    <div className="order-page">
      {/* 주문 진행 단계 */}
      <div className="order-progress">
        <div className="progress-step completed">1. 장바구니</div>
        <div className="progress-arrow"></div>
        <div className="progress-step active">2. 주문서 작성</div>
        <div className="progress-arrow"></div>
        <div className="progress-step">3. 주문완료</div>
      </div>

      <div className="order-content">
        <div className="order-form">
          {/* 주문 상품 */}
          <div className="order-section">
            <h2 className="section-title">주문 상품</h2>
            <div className="order-items">
              {cart.items.map((item) => (
                <div key={item._id} className="order-item">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <h3 className="item-name">{item.product.name}</h3>
                    <p className="item-quantity">수량: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    <div className="price-value">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주문자 정보 */}
          <div className="order-section">
            <h2 className="section-title">주문자 정보</h2>
            <div className="orderer-info">
              <div className="info-item">
                <span className="info-label">주문자</span>
                <span className="info-value">{user?.name || ""}</span>
              </div>
              <div className="info-item">
                <span className="info-label">이메일</span>
                <span className="info-value">{user?.email || ""}</span>
              </div>
              <div className="info-item">
                <span className="info-label">휴대전화</span>
                <span className="info-value">010-0000-0000</span>
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="order-section">
            <h2 className="section-title">배송지</h2>

            <div className="form-group">
              <label>받는사람</label>
              <input
                type="text"
                value={orderData.shippingAddress.recipientName}
                onChange={(e) =>
                  handleInputChange(
                    "shippingAddress.recipientName",
                    e.target.value
                  )
                }
                placeholder="받는사람 이름"
              />
            </div>

            <div className="form-group">
              <label>주소</label>
              <div className="address-inputs">
                <input
                  type="text"
                  placeholder="우편번호"
                  className="postal-code"
                />
                <button className="address-search-btn">우편번호 검색</button>
              </div>
              <input
                type="text"
                value={orderData.shippingAddress.address}
                onChange={(e) =>
                  handleInputChange("shippingAddress.address", e.target.value)
                }
                placeholder="기본주소"
                className="address-main"
              />
              <input
                type="text"
                value={orderData.shippingAddress.detailAddress}
                onChange={(e) =>
                  handleInputChange(
                    "shippingAddress.detailAddress",
                    e.target.value
                  )
                }
                placeholder="나머지주소"
                className="address-detail"
              />
            </div>

            <div className="form-group">
              <label>휴대전화</label>
              <input
                type="tel"
                value={orderData.shippingAddress.phone}
                onChange={(e) =>
                  handleInputChange("shippingAddress.phone", e.target.value)
                }
                placeholder="휴대전화 번호"
              />
            </div>

            <div className="form-group">
              <label>배송 메시지</label>
              <select
                value={orderData.shippingAddress.deliveryMemo}
                onChange={(e) =>
                  handleInputChange(
                    "shippingAddress.deliveryMemo",
                    e.target.value
                  )
                }
              >
                <option value="">- 메시지 선택 (선택사항) -</option>
                <option value="부재시 경비실에 맡겨주세요">
                  부재시 경비실에 맡겨주세요
                </option>
                <option value="부재시 문앞에 놓아주세요">
                  부재시 문앞에 놓아주세요
                </option>
                <option value="배송 전 연락바랍니다">
                  배송 전 연락바랍니다
                </option>
              </select>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="order-section">
            <h2 className="section-title">결제 수단</h2>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="toss_pay"
                  checked={orderData.paymentMethod === "toss_pay"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
                토스페이 <span className="discount-badge">0.3% 즉시 할인</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="naver_pay"
                  checked={orderData.paymentMethod === "naver_pay"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
                네이버페이
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="kakao_pay"
                  checked={orderData.paymentMethod === "kakao_pay"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
                카카오페이
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={orderData.paymentMethod === "card"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
                신용카드
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={orderData.paymentMethod === "bank_transfer"}
                  onChange={(e) =>
                    handleInputChange("paymentMethod", e.target.value)
                  }
                />
                가상계좌
              </label>
            </div>

            {orderData.paymentMethod === "bank_transfer" && (
              <div className="form-group">
                <label>예금주명</label>
                <input type="text" placeholder="예금주명을 입력하세요" />
              </div>
            )}

            <div className="payment-note">
              <p>소액결제의 경우 PG사에 제한이 있을 수 있습니다.</p>
            </div>

            <div className="cash-receipt">
              <h3>현금영수증</h3>
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="cashReceipt" />
                  현금영수증 신청
                </label>
                <label className="radio-option">
                  <input type="radio" name="cashReceipt" defaultChecked />
                  신청안함
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-option">
                <input type="checkbox" />
                결제수단과 입력정보를 다음에도 사용
              </label>
            </div>
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="order-summary">
          <div className="summary-box">
            <h3>결제 정보</h3>
            <div className="summary-row">
              <span>주문상품</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>+0원</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row final">
              <span>최종 결제 금액</span>
              <span className="final-amount">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button className="order-button" onClick={handlePayment}>
            {formatPrice(totalPrice)} 결제하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Order;
