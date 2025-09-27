const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

// 모든 사용자 조회 (GET /api/users)
router.get("/", getAllUsers);

// 특정 사용자 조회 (GET /api/users/:id)
router.get("/:id", getUserById);

// 사용자 생성 (POST /api/users)
router.post("/", createUser);

// 사용자 로그인 (POST /api/users/login)
router.post("/login", loginUser);

// 사용자 수정 (PUT /api/users/:id)
router.put("/:id", updateUser);

// 사용자 삭제 (DELETE /api/users/:id)
router.delete("/:id", deleteUser);

module.exports = router;
