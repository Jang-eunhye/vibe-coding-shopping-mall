import CategoryCard from "./CategoryCard";

function CategoryGrid() {
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
    <div className="category-grid-container">
      <div className="category-grid">
        {categories.map((category, index) => (
          <CategoryCard key={index} category={category} />
        ))}
      </div>
    </div>
  );
}

export default CategoryGrid;
