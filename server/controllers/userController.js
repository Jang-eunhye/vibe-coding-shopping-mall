const User = require("../models/User");

// 모든 사용자 조회
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "사용자 조회 실패",
      error: error.message,
    });
  }
};

// 특정 사용자 조회
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "사용자 조회 실패",
      error: error.message,
    });
  }
};

// 사용자 생성
const createUser = async (req, res) => {
  try {
    const { email, name, password, user_type, address } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 이메일입니다",
      });
    }

    const user = new User({
      email,
      name,
      password,
      user_type,
      address,
    });

    await user.save();

    // 비밀번호 제외하고 응답
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "사용자가 생성되었습니다",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "사용자 생성 실패",
      error: error.message,
    });
  }
};

// 사용자 수정
const updateUser = async (req, res) => {
  try {
    const { name, user_type, address } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    // 수정할 필드만 업데이트
    if (name) user.name = name;
    if (user_type) user.user_type = user_type;
    if (address !== undefined) user.address = address;

    await user.save();

    // 비밀번호 제외하고 응답
    const userResponse = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "사용자 정보가 수정되었습니다",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "사용자 수정 실패",
      error: error.message,
    });
  }
};

// 사용자 삭제
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "사용자가 삭제되었습니다",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "사용자 삭제 실패",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
