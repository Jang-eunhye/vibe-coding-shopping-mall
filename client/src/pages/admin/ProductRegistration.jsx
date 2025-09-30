import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CloudinaryContext, Image, Transformation } from "cloudinary-react";
import "../../styles/ProductRegistration.css";

function ProductRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  // Cloudinary 위젯 초기화
  useEffect(() => {
    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;
    } else {
      console.error("Cloudinary 스크립트가 로드되지 않았습니다.");
    }
  }, []);

  const categories = [
    { value: "outer", label: "OUTER" },
    { value: "top", label: "TOP" },
    { value: "bottom", label: "BOTTOM" },
    { value: "acc", label: "ACC" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU는 필수입니다";
    } else if (!/^[A-Z0-9-]+$/.test(formData.sku)) {
      newErrors.sku = "SKU는 대문자, 숫자, 하이픈만 사용 가능합니다";
    }

    if (!formData.name.trim()) {
      newErrors.name = "상품명은 필수입니다";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "가격은 0보다 커야 합니다";
    }

    if (!formData.category) {
      newErrors.category = "카테고리는 필수입니다";
    }

    if (!formData.image.trim()) {
      newErrors.image = "이미지는 필수입니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          sku: formData.sku.toUpperCase(),
          price: Number(formData.price),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("상품이 성공적으로 등록되었습니다!");
        navigate("/admin");
      } else {
        alert(data.message || "상품 등록에 실패했습니다");
      }
    } catch (error) {
      console.error("상품 등록 오류:", error);
      alert("상품 등록 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/admin");
  };

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = () => {
    if (!cloudinaryRef.current) {
      console.error("Cloudinary가 로드되지 않았습니다.");
      alert(
        "이미지 업로드 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (
      !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
      !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    ) {
      console.error("Cloudinary 환경변수가 설정되지 않았습니다.");
      alert("이미지 업로드 설정이 완료되지 않았습니다. 관리자에게 문의하세요.");
      return;
    }

    try {
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          sources: ["local", "url", "camera"],
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: false,
          croppingShowDimensions: true,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary 업로드 오류:", error);
            alert("이미지 업로드 중 오류가 발생했습니다.");
            return;
          }

          if (result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            setFormData((prev) => ({
              ...prev,
              image: imageUrl,
            }));
            setImagePreview(imageUrl);
          }
        }
      );

      widgetRef.current.open();
    } catch (error) {
      console.error("Cloudinary 위젯 생성 오류:", error);
      alert("이미지 업로드 위젯을 열 수 없습니다.");
    }
  };

  // 이미지 URL 직접 입력 처리
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  return (
    <CloudinaryContext cloudName={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}>
      <div className="product-registration">
        {/* 헤더 */}
        <div className="registration-header">
          <button className="back-button" onClick={handleBack}>
            ← 상품 관리
          </button>
          <button
            className="new-product-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            + 새 상품 등록
          </button>
        </div>

        {/* 탭 */}
        <div className="tabs">
          <div className="tab">상품 목록</div>
          <div className="tab active">상품 등록</div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="registration-content">
          <h1 className="page-title">새 상품 등록</h1>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-columns">
              {/* 좌측 컬럼 - 기본 정보 */}
              <div className="form-left">
                <div className="form-group">
                  <label htmlFor="sku" className="form-label">
                    SKU <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="SKU를 입력하세요 (예: OUTER-001)"
                    className={`form-input ${errors.sku ? "error" : ""}`}
                  />
                  {errors.sku && (
                    <span className="error-message">{errors.sku}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    상품명 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="상품명을 입력하세요"
                    className={`form-input ${errors.name ? "error" : ""}`}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    판매가격 <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className={`form-input ${errors.price ? "error" : ""}`}
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    카테고리 <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`form-select ${errors.category ? "error" : ""}`}
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="error-message">{errors.category}</span>
                  )}
                </div>
              </div>

              {/* 우측 컬럼 - 이미지 및 설명 */}
              <div className="form-right">
                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    메인 이미지 <span className="required">*</span>
                  </label>

                  {/* 이미지 업로드 버튼 */}
                  <div className="image-upload-section">
                    <button
                      type="button"
                      onClick={openCloudinaryWidget}
                      className="upload-button"
                    >
                      📷 이미지 업로드
                    </button>

                    <div className="image-input-container">
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleImageUrlChange}
                        placeholder="또는 이미지 URL을 직접 입력하세요"
                        className={`form-input ${errors.image ? "error" : ""}`}
                      />
                    </div>
                  </div>

                  {/* 이미지 미리보기 */}
                  {imagePreview && (
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        alt="상품 미리보기"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                        className="remove-image-button"
                      >
                        ✕ 이미지 제거
                      </button>
                    </div>
                  )}

                  {errors.image && (
                    <span className="error-message">{errors.image}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    상품 설명
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                    className="form-textarea"
                    rows="6"
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleBack}
              >
                취소
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "등록 중..." : "상품 등록"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CloudinaryContext>
  );
}

export default ProductRegistration;
