import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인/회원가입 페이지인지 확인
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

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

  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent("userLogout"));
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        borderBottom: "1px solid #eee",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333",
          textDecoration: "none",
        }}
      >
        eunhyeshop
      </Link>

      {/* 우측 상단 사용자 정보 */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {isLoading ? (
          <span style={{ color: "#666", fontSize: "14px" }}>로딩 중...</span>
        ) : user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span
              style={{ color: "#333", fontSize: "16px", fontWeight: "bold" }}
            >
              {user.name}님 반갑습니다
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
                e.target.style.borderColor = "#ccc";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "#ddd";
              }}
            >
              로그아웃
            </button>
          </div>
        ) : !isAuthPage ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to="/login"
              style={{
                padding: "8px 16px",
                backgroundColor: "#000",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              로그인
            </Link>
            <Link
              to="/signup"
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                color: "#000",
                textDecoration: "none",
                border: "1px solid #000",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
              }}
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
