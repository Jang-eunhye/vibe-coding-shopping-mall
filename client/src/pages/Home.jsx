import { Link } from "react-router-dom";

function Home() {
  const categories = [
    {
      name: "BEST",
      description:
        "Bitter Cells' Steady Best Item! Meet popular products every season at a glance.",
    },
    {
      name: "OUTER",
      description:
        "Discover our premium outerwear collection for every season.",
    },
    {
      name: "TOP",
      description: "Explore our curated selection of tops and shirts.",
    },
    {
      name: "BOTTOM",
      description: "Find the perfect bottoms to complete your look.",
    },
    {
      name: "ACC",
      description: "Accessorize with our unique and stylish accessories.",
    },
  ];

  return (
    <div>
      {/* 히어로 이미지 섹션 */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundImage: "url('/images/bittercells.JPG')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              marginBottom: "20px",
              fontFamily: "serif",
            }}
          >
            eunhyeshop
          </h1>
          <p
            style={{
              fontSize: "18px",
              marginBottom: "30px",
              opacity: 0.9,
            }}
          >
            We Love It! Let's share and enjoy every moment together.
          </p>
        </div>
      </div>

      {/* 카테고리 카드 섹션 */}
      <div
        style={{
          padding: "80px 20px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}
        >
          {categories.map((category, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "40px 30px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  marginBottom: "20px",
                  color: "#333",
                  fontFamily: "serif",
                }}
              >
                {category.name}
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  lineHeight: "1.6",
                  marginBottom: "30px",
                }}
              >
                {category.description}
              </p>
              <Link
                to={`/category/${category.name.toLowerCase()}`}
                style={{
                  display: "inline-block",
                  padding: "12px 30px",
                  backgroundColor: "#000",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "background-color 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#333";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#000";
                }}
              >
                SHOP NOW
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
