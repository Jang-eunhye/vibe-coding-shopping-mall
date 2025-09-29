import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductManagement.css";

function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: "", label: "전체 카테고리" },
    { value: "outer", label: "OUTER" },
    { value: "top", label: "TOP" },
    { value: "bottom", label: "BOTTOM" },
    { value: "acc", label: "ACC" },
  ];

  // 상품 목록 조회
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 2,
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory && { category: filterCategory }),
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
  }, [currentPage, searchTerm, filterCategory]);

  // 상품 삭제
  const handleDeleteProduct = async (sku) => {
    if (!window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/products/${sku}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("상품이 성공적으로 삭제되었습니다.");
        fetchProducts(); // 목록 새로고침
      } else {
        alert(data.message || "상품 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  // 상품 수정
  const handleEditProduct = (sku) => {
    navigate(`/admin/products/edit/${sku}`);
  };

  // 검색 처리
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  // 필터 변경
  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1);
  };

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

  return (
    <div className="product-management">
      {/* 헤더 */}
      <div className="management-header">
        <button className="back-button" onClick={() => navigate("/admin")}>
          ← 상품 관리
        </button>
        <button
          className="new-product-button"
          onClick={() => navigate("/admin/products/new")}
        >
          + 새상품 등록
        </button>
      </div>

      {/* 탭 */}
      <div className="tabs">
        <div className="tab active">상품 목록</div>
        <div className="tab">상품 등록</div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Q 상품명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </form>

        <div className="filter-section">
          <button className="filter-button">
            <span className="filter-icon">▼</span>
            필터
          </button>
          <select
            value={filterCategory}
            onChange={handleFilterChange}
            className="category-filter"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 상품 목록 테이블 */}
      <div className="products-table-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>이미지</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-products">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="product-image-cell">
                      <div className="product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-thumbnail"
                          />
                        ) : (
                          <div className="no-image">이미지 없음</div>
                        )}
                      </div>
                    </td>
                    <td className="product-name-cell">
                      <span className="product-name">{product.name}</span>
                    </td>
                    <td className="product-category-cell">
                      <span className="product-category">
                        {categories.find(
                          (cat) => cat.value === product.category
                        )?.label || product.category}
                      </span>
                    </td>
                    <td className="product-price-cell">
                      <span className="product-price">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="product-actions-cell">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditProduct(product.sku)}
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteProduct(product.sku)}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default ProductManagement;
