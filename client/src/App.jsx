import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ProductRegistration from "./pages/ProductRegistration";
import ProductManagement from "./pages/ProductManagement";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="/admin/products/new" element={<ProductRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
