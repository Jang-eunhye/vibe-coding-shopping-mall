import { useNavigate } from "react-router-dom";
import CategoryCard from "./CategoryCard";

function CategoryGrid() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "BEST",
      description:
        "Bitter Cells' Steady Best Item! Meet popular products every season at a glance.",
      path: null, // BEST는 별도 페이지 없음
    },
    {
      name: "OUTER",
      description:
        "Discover our premium outerwear collection for every season.",
      path: "/category/outer",
    },
    {
      name: "TOP",
      description: "Explore our curated selection of tops and shirts.",
      path: "/category/top",
    },
    {
      name: "BOTTOM",
      description: "Find the perfect bottoms to complete your look.",
      path: "/category/bottom",
    },
    {
      name: "ACC",
      description: "Accessorize with our unique and stylish accessories.",
      path: "/category/acc",
    },
  ];

  const handleCategoryClick = (category) => {
    if (category.path) {
      navigate(category.path);
    }
  };

  return (
    <div className="category-grid-container">
      <div className="category-grid">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            category={category}
            onClick={() => handleCategoryClick(category)}
            clickable={!!category.path}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryGrid;
