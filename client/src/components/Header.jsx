import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setUser(data.data);
        } else {
          // 토큰이 유효하지 않으면 localStorage에서 제거
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("사용자 정보 조회 오류:", error);
        // 네트워크 오류 시에도 localStorage 정리
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
          <span style={{ color: "#333", fontSize: "16px", fontWeight: "500" }}>
            {user.name}님 반갑습니다
          </span>
        ) : (
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
        )}
      </div>
    </header>
  );
}

export default Header;
