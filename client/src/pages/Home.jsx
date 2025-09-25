import { Link } from "react-router-dom";

function Home() {
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
          textAlign: "center",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          쇼핑몰
        </h1>
        <p
          style={{
            fontSize: "16px",
            marginBottom: "30px",
            color: "#666",
          }}
        >
          환영합니다!
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "12px 30px",
              backgroundColor: "#000",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            로그인
          </Link>
          <Link
            to="/signup"
            style={{
              display: "inline-block",
              padding: "12px 30px",
              backgroundColor: "transparent",
              color: "#000",
              textDecoration: "none",
              border: "1px solid #000",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
