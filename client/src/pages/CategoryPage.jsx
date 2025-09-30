import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CategoryPage.css";

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categoryNames = {
    outer: "OUTER",
    top: "TOP",
    bottom: "BOTTOM",
    acc: "ACC",
  };

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 6, // 2열 3행으로 6개씩 표시
        category: category,
      });

      const response = await fetch(
        `http://localhost:5000/api/products?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error("상품 목록 조회 실패:", data.message);
      }
    } catch (error) {
      console.error("상품 목록 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, currentPage]);

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 상품 클릭 핸들러
  const handleProductClick = (product) => {
    navigate(`/product/${product.sku}`);
  };

  return (
    <div className="category-page">
      {/* 헤더 */}
      <div className="category-header">
        <h1 className="category-title">
          {categoryNames[category] || category.toUpperCase()}
        </h1>
        <p className="category-description">
          {categoryNames[category] || category.toUpperCase()} 카테고리의
          상품들을 만나보세요
        </p>
      </div>

      {/* 상품 그리드 */}
      <div className="products-section">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-prices">
                    <span className="product-price">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-button ${
                page === currentPage ? "active" : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
