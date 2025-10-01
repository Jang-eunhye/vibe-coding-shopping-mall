import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { API_BASE_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsCheckingAuth(false);
          return;
        }

        // 토큰이 있으면 유효성 검증
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          // 이미 로그인된 상태이므로 메인 페이지로 리다이렉트
          navigate("/");
        } else {
          // 토큰이 유효하지 않으면 localStorage 정리
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error("인증 상태 확인 오류:", error);
        // 네트워크 오류 시에도 localStorage 정리
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // 토큰을 localStorage에 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        // 커스텀 이벤트 발생으로 Header 컴포넌트에 알림
        window.dispatchEvent(new CustomEvent("userLogin"));

        alert("로그인 성공!");
        navigate("/"); // 메인 페이지로 이동
      } else {
        setError(data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("서버 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  // 인증 상태 확인 중이면 로딩 표시
  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          paddingTop: "80px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "16px", color: "#666" }}>
            로그인 상태를 확인하는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        paddingTop: "80px", // 헤더 높이만큼 여백 추가
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        {/* 브랜드명 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#333",
            }}
          >
            쇼핑몰
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "30px",
            }}
          >
            로그인을 진행해주세요.
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <Input
            type="email"
            id="email"
            name="email"
            label="이메일"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* 비밀번호 */}
          <Input
            type="password"
            id="password"
            name="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* 자동 로그인 체크박스 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              id="autoLogin"
              style={{ marginRight: "8px" }}
            />
            <label htmlFor="autoLogin" style={{ color: "#666" }}>
              자동 로그인
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isFormValid && !isLoading ? "#000" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isFormValid && !isLoading ? "pointer" : "not-allowed",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div style={{ textAlign: "center" }}>
          <Link
            to="/signup"
            style={{
              color: "#666",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
