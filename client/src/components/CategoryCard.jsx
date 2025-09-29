function CategoryCard({ category, onClick, clickable }) {
  return (
    <div
      className={`category-card ${clickable ? "clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
    >
      <h2 className="category-title">{category.name}</h2>
      <p className="category-description">{category.description}</p>
      {clickable && <div className="category-link">SHOP NOW</div>}
    </div>
  );
}

export default CategoryCard;
