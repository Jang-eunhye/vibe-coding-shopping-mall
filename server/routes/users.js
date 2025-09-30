const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");

// 모든 사용자 조회 (GET /api/users)
router.get("/", getAllUsers);

// 현재 사용자 정보 조회 (GET /api/users/profile) - 토큰 필요
router.get("/profile", authenticateToken, getCurrentUser);

// 사용자 생성 (POST /api/users)
router.post("/", createUser);

// 사용자 로그인 (POST /api/users/login)
router.post("/login", loginUser);

// 특정 사용자 조회 (GET /api/users/:id) - 마지막에 위치
router.get("/:id", getUserById);

// 사용자 수정 (PUT /api/users/:id)
router.put("/:id", updateUser);

// 사용자 삭제 (DELETE /api/users/:id)
router.delete("/:id", deleteUser);

module.exports = router;
