const Product = require("../models/Product");

// 상품 생성
const createProduct = async (req, res) => {
  try {
    const { sku, name, price, category, image, description, stock } = req.body;

    // 필수 필드 검증
    if (!sku || !name || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "SKU, 상품명, 가격, 카테고리, 이미지는 필수입니다",
      });
    }

    // 가격 유효성 검증
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "가격은 0보다 커야 합니다",
      });
    }

    // 카테고리 유효성 검증
    const validCategories = ["outer", "top", "bottom", "acc"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 카테고리입니다",
      });
    }

    const product = new Product({
      sku: sku.toUpperCase(),
      name,
      price,
      category,
      image,
      description: description || "",
      stock: stock || 0,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "상품이 성공적으로 등록되었습니다",
      data: product,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "이미 존재하는 SKU입니다",
      });
    }
    res.status(500).json({
      success: false,
      message: "상품 등록에 실패했습니다",
      error: error.message,
    });
  }
};

// 모든 상품 조회
const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, isActive = true } = req.query;

    const query = { isActive };
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      message: "상품 목록을 성공적으로 조회했습니다",
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "상품 목록 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// SKU로 상품 조회
const getProductBySku = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOne({ sku: sku.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "상품을 성공적으로 조회했습니다",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "상품 조회에 실패했습니다",
      error: error.message,
    });
  }
};

// 상품 수정
const updateProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const updateData = req.body;

    // SKU 변경 시 중복 검사
    if (updateData.sku) {
      const existingProduct = await Product.findOne({
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: req.params.sku },
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "이미 존재하는 SKU입니다",
        });
      }
      updateData.sku = updateData.sku.toUpperCase();
    }

    const product = await Product.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "상품이 성공적으로 수정되었습니다",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "상품 수정에 실패했습니다",
      error: error.message,
    });
  }
};

// 상품 삭제 (소프트 삭제)
const deleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOneAndUpdate(
      { sku: sku.toUpperCase() },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "상품이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "상품 삭제에 실패했습니다",
      error: error.message,
    });
  }
};

// 상품 완전 삭제
const hardDeleteProduct = async (req, res) => {
  try {
    const { sku } = req.params;
    const product = await Product.findOneAndDelete({ sku: sku.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      message: "상품이 완전히 삭제되었습니다",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "상품 삭제에 실패했습니다",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductBySku,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
};
