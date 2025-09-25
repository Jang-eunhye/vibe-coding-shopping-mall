import { Link } from "react-router-dom";

function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        borderBottom: "1px solid #eee",
        padding: "15px 20px",
      }}
    >
      <Link
        to="/"
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333",
          textDecoration: "none",
        }}
      >
        eunhyeshop
      </Link>
    </header>
  );
}

export default Header;
