import "./Navbar.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const firstName = user.name?.split(" ")[0] || "User";

  useEffect(() => {
    if (user?.id) fetchCartCount();
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const fetchCartCount = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart?userId=${user.id}`);
      setCartCount(res.data?.length || 0);
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="nav-inner">

        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="brand-name">FreshCart</span>
        </div>

        {/* Desktop nav links — hidden on mobile */}
        <div className="nav-links">
          <span className={isActive("/home")} onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </span>
          <span className={isActive("/orders")} onClick={() => navigate("/orders")} style={{ cursor: "pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Orders
          </span>
        </div>

        {/* Desktop actions — hidden on mobile */}
        <div className="nav-actions desktop-only">
          <span className="nav-greeting">Hi, {firstName}</span>

          <button className="cart-nav-btn" onClick={() => navigate("/cart")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="nav-btn" onClick={() => navigate("/profile")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>

          <button className="logout-btn" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>

        {/* Mobile right: cart + profile + hamburger */}
        <div className="mobile-actions">
          <button className="cart-nav-btn" onClick={() => navigate("/cart")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* ✅ Profile icon always visible on mobile navbar */}
          <button className="nav-icon-btn" onClick={() => navigate("/profile")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>

          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
            <span className={menuOpen ? "open" : ""} />
          </button>
        </div>

      </div>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${menuOpen ? "open" : ""}`}>
        <span className={isActive("/home")} onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          🏠 Home
        </span>
        <span className={isActive("/orders")} onClick={() => navigate("/orders")} style={{ cursor: "pointer" }}>
          📋 Orders
        </span>
        <div className="nav-drawer-actions">
          <button className="logout-btn" onClick={logout}>↪ Logout</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;