import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";
import { API_BASE_URL } from "../config/api";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 로그인/회원가입 페이지인지 확인
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isHomePage = location.pathname === "/";

  // 사용자 정보 조회 함수
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setCartItemCount(0);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        // 사용자 정보를 localStorage에 저장
        localStorage.setItem("user", JSON.stringify(data.data));
        // 사용자 정보 조회 성공 시 장바구니 아이템 개수도 조회
        fetchCartItemCount();
      } else {
        // 토큰이 유효하지 않으면 localStorage에서 제거
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      // 네트워크 오류 시에도 localStorage 정리
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setCartItemCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 장바구니 아이템 개수 조회 함수
  const fetchCartItemCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItemCount(0);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/carts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCartItemCount(data.data.totalItems || 0);
      } else {
        setCartItemCount(0);
      }
    } catch (error) {
      console.error("장바구니 조회 오류:", error);
      setCartItemCount(0);
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // localStorage 변화 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        // 토큰이 있으면 사용자 정보 다시 조회
        fetchUserProfile();
      } else {
        // 토큰이 없으면 사용자 정보 초기화
        setUser(null);
        setIsLoading(false);
      }
    };

    // storage 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange);

    // 커스텀 이벤트 리스너 등록 (같은 탭에서의 변화 감지)
    window.addEventListener("userLogin", handleStorageChange);
    window.addEventListener("userLogout", handleStorageChange);
    window.addEventListener("cartUpdated", fetchCartItemCount);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleStorageChange);
      window.removeEventListener("userLogout", handleStorageChange);
      window.removeEventListener("cartUpdated", fetchCartItemCount);
    };
  }, []);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      // 히어로 이미지가 거의 끝나는 지점(화면 높이의 80%)에서 색상 변경
      setIsScrolled(scrollTop > windowHeight * 0.8);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCartItemCount(0);
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent("userLogout"));
    // 로그아웃 후 자동 새로고침
    window.location.reload();
  };

  // 장바구니 클릭 핸들러
  const handleCartClick = () => {
    if (user) {
      navigate("/cart");
    } else {
      navigate("/login");
    }
  };

  // 드롭다운 토글 핸들러
  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 드롭다운 외부 클릭 시 닫기
  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  // 주문목록 클릭 핸들러
  const handleOrderListClick = () => {
    navigate("/order-list");
    setIsDropdownOpen(false);
  };

  // 장바구니 드롭다운 클릭 핸들러
  const handleCartDropdownClick = () => {
    handleCartClick();
    setIsDropdownOpen(false);
  };

  // 로그아웃 드롭다운 클릭 핸들러
  const handleLogoutDropdownClick = () => {
    handleLogout();
    setIsDropdownOpen(false);
  };

  // 텍스트 색상 동적 설정
  const textColor = isHomePage && !isScrolled ? "white" : "#333";

  return (
    <header
      className={`header ${
        isHomePage && !isScrolled ? "header--transparent" : "header--solid"
      }`}
    >
      {/* 좌측: 로고 */}
      <div className="header-left">
        {/* 로고 */}
        <Link to="/" className="logo">
          EUNHYESHOP
        </Link>
      </div>

      {/* 우측 상단 사용자 정보 */}
      <div className="header-right">
        {isLoading ? (
          <span className="loading-text" style={{ color: textColor }}>
            로딩 중...
          </span>
        ) : user ? (
          <div className="user-info">
            {/* 사용자 이름 드롭다운 */}
            <div className="user-dropdown">
              <button
                className="user-dropdown-toggle"
                onClick={handleDropdownToggle}
                style={{ color: textColor }}
              >
                {user.name}님
                <span
                  className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}
                >
                  ⋮
                </span>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={handleCartDropdownClick}
                  >
                    🛍️ 장바구니
                    {cartItemCount > 0 && (
                      <span className="cart-badge-small">{cartItemCount}</span>
                    )}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={handleOrderListClick}
                  >
                    📋 주문목록
                  </button>
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogoutDropdownClick}
                  >
                    🚪 로그아웃
                  </button>
                </div>
              )}
            </div>

            {/* 어드민 버튼 - 기존처럼 별도 표시 */}
            {user.user_type === "admin" && (
              <Link
                to="/admin"
                className={`header-button admin-button ${
                  isHomePage && !isScrolled ? "admin-button--transparent" : ""
                }`}
              >
                어드민
              </Link>
            )}
          </div>
        ) : !isAuthPage ? (
          <div className="user-info">
            <Link
              to="/login"
              className={`header-button login-button ${
                isHomePage && !isScrolled ? "login-button--transparent" : ""
              }`}
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className={`header-button signup-button ${
                isHomePage && !isScrolled
                  ? "signup-button--transparent"
                  : "signup-button--solid"
              }`}
              style={{ color: textColor }}
            >
              회원가입
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
