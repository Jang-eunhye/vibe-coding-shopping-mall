const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

console.log("🚀 서버 시작 중...");

const app = express();
const PORT = process.env.PORT;

console.log("📋 환경변수 확인:");
console.log("- PORT:", PORT);
console.log("- PORT 타입:", typeof PORT);
console.log("- PORT 값이 undefined인가?", PORT === undefined);
console.log("- process.env 전체:", Object.keys(process.env).length, "개");
console.log("- process.env.PORT 직접 확인:", process.env.PORT);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log(
  "- MONGODB_ATLAS_URI:",
  process.env.MONGODB_ATLAS_URI ? "설정됨" : "설정 안됨"
);
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "설정됨" : "설정 안됨");

// 포트 관련 추가 디버깅
if (PORT === undefined) {
  console.log("⚠️ WARNING: PORT가 undefined입니다!");
  console.log("🔍 process.env에서 PORT 관련 키들 찾기:");
  const portKeys = Object.keys(process.env).filter((key) =>
    key.toLowerCase().includes("port")
  );
  console.log("- PORT 관련 환경변수들:", portKeys);

  if (portKeys.length > 0) {
    portKeys.forEach((key) => {
      console.log(`  - ${key}:`, process.env[key]);
    });
  }
}

console.log("⚙️ 미들웨어 설정 중...");

// CORS 설정
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", // Vite 개발 서버
    "https://vibe-coding-shopping-mall.vercel.app", // 실제 Vercel URL
    "https://*.vercel.app", // Vercel의 모든 서브도메인 허용
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("✅ 미들웨어 설정 완료");

console.log("🔌 MongoDB 연결 시도 중...");
// MongoDB 연결
mongoose
  .connect(
    process.env.MONGODB_ATLAS_URI ||
      "mongodb://localhost:27017/shopping-mall-demo"
  )
  .then(() => {
    console.log("✅ MongoDB에 성공적으로 연결되었습니다.");
  })
  .catch((error) => {
    console.error("❌ MongoDB 연결 오류:", error);
    process.exit(1);
  });

console.log("🛣️ 라우트 설정 중...");
// 기본 라우트
app.get("/", (req, res) => {
  console.log("📡 루트 라우트 호출됨");
  res.json({
    message: "쇼핑몰 API 서버가 실행 중입니다.",
    version: "1.0.0",
    status: "success",
  });
});

// API 라우트
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/products"));
app.use("/api/carts", require("./routes/carts"));
app.use("/api/orders", require("./routes/orders"));
console.log("✅ 라우트 설정 완료");

// 404 에러 핸들러
app.use("*", (req, res) => {
  console.log("❌ 404 에러:", req.originalUrl);
  res.status(404).json({
    message: "요청한 리소스를 찾을 수 없습니다.",
    status: "error",
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error("❌ 서버 에러:", err.stack);
  res.status(500).json({
    message: "서버 내부 오류가 발생했습니다.",
    status: "error",
    error: process.env.NODE_ENV ? err.message : "Internal Server Error",
  });
});

console.log("🌐 서버 시작 시도 중...");
console.log("🔍 서버 시작 전 PORT 최종 확인:", PORT);

// 서버 시작
if (PORT === undefined) {
  console.log(
    "❌ CRITICAL ERROR: PORT가 undefined이므로 서버를 시작할 수 없습니다!"
  );
  console.log("🛠️ 기본값 5000으로 서버를 시작합니다.");
  const FALLBACK_PORT = 5000;
  app.listen(FALLBACK_PORT, "0.0.0.0", () => {
    console.log("🎉 서버 시작 성공! (기본값 사용)");
    console.log(`📍 서버가 포트 ${FALLBACK_PORT}에서 실행 중입니다.`);
    console.log(`🌍 환경: ${process.env.NODE_ENV}`);
    console.log(`🔗 서버 주소: http://0.0.0.0:${FALLBACK_PORT}`);
  });
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("🎉 서버 시작 성공!");
    console.log(`📍 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`🌍 환경: ${process.env.NODE_ENV}`);
    console.log(`🔗 서버 주소: http://0.0.0.0:${PORT}`);
  });
}

console.log("⏳ 서버 시작 대기 중...");
