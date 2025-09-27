const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "액세스 토큰이 필요합니다.",
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // 사용자 정보 조회
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다.",
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다.",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "토큰이 만료되었습니다.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "토큰 검증 중 오류가 발생했습니다.",
        error: error.message,
      });
    }
  }
};

module.exports = { authenticateToken };
