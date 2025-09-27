import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <div className="category-card">
      <h2 className="category-title">{category.name}</h2>
      <p className="category-description">{category.description}</p>
      <Link
        to={`/category/${category.name.toLowerCase()}`}
        className="category-link"
      >
        SHOP NOW
      </Link>
    </div>
  );
}

export default CategoryCard;
