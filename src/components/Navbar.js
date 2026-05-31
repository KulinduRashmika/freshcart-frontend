import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = user?.email === "admin@gmail.com";

  useEffect(() => {
    if (user?.id) fetchCartCount();
  }, [location]);

  const fetchCartCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart/${user.id}`);
      const items = res.data || [];
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      setCartCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="nav-inner">

        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <span className="brand-name">FreshCart</span>
        </div>

        {/* Nav Links */}
        <div className="nav-links">
          <span className={isActive("/home")} onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            🏠 Home
          </span>
          <span className={isActive("/orders")} onClick={() => navigate("/orders")} style={{ cursor: "pointer" }}>
            📦 Orders
          </span>
          {isAdmin && (
            <span className="nav-link admin-link" onClick={() => navigate("/admin")} style={{ cursor: "pointer" }}>
              ⚙️ Admin
            </span>
          )}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {user?.name && (
            <span className="nav-greeting">Hi, {user.name.split(" ")[0]}</span>
          )}

          {/* Cart */}
          <button className="cart-nav-btn" onClick={() => navigate("/cart")}>
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
            </svg>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Profile */}
          <button className="nav-btn" onClick={() => navigate("/profile")}>
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>

          {/* Logout */}
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;