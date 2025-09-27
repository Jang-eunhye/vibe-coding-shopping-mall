import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";

function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

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
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      } else {
        // 토큰이 유효하지 않으면 localStorage에서 제거
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } catch (error) {
      console.error("사용자 정보 조회 오류:", error);
      // 네트워크 오류 시에도 localStorage 정리
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
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

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleStorageChange);
      window.removeEventListener("userLogout", handleStorageChange);
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

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent("userLogout"));
  };

  // 텍스트 색상 동적 설정
  const textColor = isHomePage && !isScrolled ? "white" : "#333";

  return (
    <header
      className={`header ${
        isHomePage && !isScrolled ? "header--transparent" : "header--solid"
      }`}
    >
      {/* 좌측: 햄버거 버튼 + 로고 */}
      <div className="header-left">
        {/* 햄버거 버튼 */}
        <button className="hamburger-button">
          <div
            className="hamburger-line"
            style={{ backgroundColor: textColor }}
          />
          <div
            className="hamburger-line"
            style={{ backgroundColor: textColor }}
          />
          <div
            className="hamburger-line"
            style={{ backgroundColor: textColor }}
          />
        </button>

        {/* 로고 */}
        <Link to="/" className="logo">
          eunhyeshop
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
            <span className="user-name" style={{ color: textColor }}>
              {user.name}님
            </span>
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
            <button
              onClick={handleLogout}
              className={`header-button logout-button ${
                isHomePage && !isScrolled
                  ? "logout-button--transparent"
                  : "logout-button--solid"
              }`}
              style={{ color: textColor }}
            >
              로그아웃
            </button>
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
