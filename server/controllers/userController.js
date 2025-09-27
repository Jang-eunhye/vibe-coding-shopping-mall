const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
    const { email, name, password } = req.body;

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
      user_type: "customer", // 기본값으로 customer 설정
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

// 사용자 로그인
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일과 비밀번호가 제공되었는지 확인
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일과 비밀번호를 입력해주세요",
      });
    }

    // 이메일로 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 비밀번호 제외하고 사용자 정보 반환
    const userResponse = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      message: "로그인 성공",
      data: userResponse,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "로그인 실패",
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
  loginUser,
};
