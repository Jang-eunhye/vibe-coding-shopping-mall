import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/Input";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 로그인 API 호출 (나중에 구현)
      console.log("로그인 시도:", formData);
      alert("로그인 기능은 추후 구현됩니다.");
    } catch (error) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

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
            disabled={!isFormValid}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isFormValid ? "#000" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isFormValid ? "pointer" : "not-allowed",
              marginBottom: "20px",
            }}
          >
            로그인
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
