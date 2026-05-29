import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const user = auth.currentUser;

  /* ── Secure: get JWT token → call /api/cart/my ── */
  const getAuthHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCartCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

const res = await axios.get(
  `http://localhost:8080/api/cart/${user.id}`
);
      const count = (res.data || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  /* ── Check if logged-in user is ADMIN ── */
  const checkAdminRole = async () => {
  setIsAdmin(false);
  return;
};

  useEffect(() => {
    fetchCartCount();
    checkAdminRole();
    // Refresh cart count every 5s
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path ? "active" : "";

  const handleLogout = async () => {

  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  try {

    // Firebase logout
    await signOut(auth);

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect and prevent back navigation
    navigate("/", { replace: true });

    // Clear browser history cache
    window.location.reload();

  } catch (error) {

    console.error("Logout failed:", error);

  }
};

  // Get user's first name for greeting
  const getGreeting = () => {
    if (!user) return "Guest";
    return user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User";
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="" className="nav-brand">
          <span className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </span>
          <span className="brand-name">FreshCart</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/home" className={`nav-link ${isActive("/home")}`}>
            🏠 Home
          </Link>
          <Link to="/cart" className={`nav-link ${isActive("/cart")}`}>
            🛍️ Cart
          </Link>
          <Link to="/orders" className={`nav-link ${isActive("/orders")}`}>
            📋 Orders
          </Link>
          {/* Admin link only visible to ADMIN role users */}
          {isAdmin && (
            <Link to="/admin" className={`nav-link admin-link ${isActive("/admin")}`}>
              ⚙️ Admin
            </Link>
          )}
        </div>

        {/* Right side actions */}
        <div className="nav-actions">
          {/* Greeting */}
          {user && (
            <span className="nav-greeting">
              Hi, {getGreeting()}
            </span>
          )}

          {/* Cart button with live count */}
          <button className="cart-nav-btn" onClick={() => navigate("/cart")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Profile */}
<button
  className="nav-btn"
  onClick={() => navigate("/profile")}
>
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  Profile
</button>

          {/* Logout button */}
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;