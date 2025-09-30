import CategoryGrid from "../components/CategoryGrid";
import "../styles/Home.css";

function Home() {
  return (
    <div>
      {/* 히어로 이미지 섹션 */}
      <div className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">eunhyeshop</h1>
          <p className="hero-subtitle">
            We Love It! Let's share and enjoy every moment together.
          </p>
        </div>
      </div>

      {/* 카테고리 카드 섹션 */}
      <CategoryGrid />
    </div>
  );
}

export default Home;
