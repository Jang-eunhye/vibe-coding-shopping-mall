const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/shopping-mall")
  .then(() => {
    console.log("MongoDB에 성공적으로 연결되었습니다.");
  })
  .catch((error) => {
    console.error("MongoDB 연결 오류:", error);
    process.exit(1);
  });

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "쇼핑몰 API 서버가 실행 중입니다.",
    version: "1.0.0",
    status: "success",
  });
});

// API 라우트
app.use("/api/users", require("./routes/users"));

// 404 에러 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    message: "요청한 리소스를 찾을 수 없습니다.",
    status: "error",
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "서버 내부 오류가 발생했습니다.",
    status: "error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || "development"}`);
});
