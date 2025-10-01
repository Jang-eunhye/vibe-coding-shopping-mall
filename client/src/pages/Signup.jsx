import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { API_BASE_URL } from "../config/api";

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData; // confirmPassword 제외
      const response = await fetch("${API_BASE_URL}/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        alert("회원가입이 완료되었습니다!");
        // 홈으로 이동하거나 로그인 페이지로 이동
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  // 모든 필드가 입력되었는지 확인
  const isFormValid =
    formData.email.trim() !== "" &&
    formData.name.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "";

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
            회원가입을 진행해주세요.
          </p>
        </div>

        {/* 회원가입 폼 */}
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

          {/* 이름 */}
          <Input
            type="text"
            id="name"
            name="name"
            label="이름"
            placeholder="홍길동"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* 비밀번호 */}
          <Input
            type="password"
            id="password"
            name="password"
            label="비밀번호"
            placeholder="6자리 이상 입력해주세요"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* 비밀번호 확인 */}
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해주세요"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* 회원가입 버튼 */}
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
            회원가입
          </button>
        </form>

        {/* 로그인 링크 */}
        <div style={{ textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              color: "#666",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
