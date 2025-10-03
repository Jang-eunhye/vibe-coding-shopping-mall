import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function ProtectedRoute({ children, requireAdmin = false }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token) {
        navigate("/login");
        return;
      }

      // 관리자 권한이 필요한 경우 체크
      if (requireAdmin) {
        try {
          const userData = user ? JSON.parse(user) : null;
          if (!userData || userData.role !== "admin") {
            alert("관리자 권한이 필요합니다.");
            navigate("/");
            return;
          }
        } catch (error) {
          console.error("사용자 데이터 파싱 오류:", error);
          navigate("/login");
          return;
        }
      }

      // 토큰이 있으면 일단 허용하고, 백그라운드에서 유효성 검사
      setIsAuthenticated(true);
      setIsLoading(false);

      // 백그라운드에서 토큰 유효성 검사 (선택적)
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          // 토큰이 유효하지 않으면 정리
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
      } catch (error) {
        // 네트워크 오류는 무시 (토큰은 유지)
        console.log(
          "토큰 유효성 검사 중 네트워크 오류 (무시됨):",
          error.message
        );
      }
    };

    checkAuth();
  }, [navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        로딩 중...
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
