import "./Home.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

// ✅ Single source of truth for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function Home() {
  const [products,         setProducts]         = useState([]);
  const [filtered,         setFiltered]         = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm,       setSearchTerm]       = useState("");
  const [loading,          setLoading]          = useState(true);
  const [addingId,         setAddingId]         = useState(null);
  const [addedId,          setAddedId]          = useState(null);
  const [toast,            setToast]            = useState({ show: false, msg: "", type: "success" });

  const navigate = useNavigate();

  const getUser = () => JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== "All")
      result = result.filter(p => p.category === selectedCategory);
    if (searchTerm)
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFiltered(result);
  }, [selectedCategory, searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // ✅ Fixed: was hardcoded localhost
      const res = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(res.data);
      setFiltered(res.data);
      const cats = ["All", ...new Set(res.data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    const user = getUser();
    if (!user?.id) {
      showToast("Please login first", "error");
      navigate("/");
      return;
    }

    setAddingId(product.id);
    try {
      // ✅ Fixed: was hardcoded http://localhost:8080
      await axios.post(
        `${API_BASE_URL}/api/cart/add` +
        `?userId=${user.id}&productId=${product.id}&quantity=1`
      );
      setAddedId(product.id);
      showToast(`${product.name} added to cart!`, "success");
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg = err.response?.data?.error || "Failed to add item";
      showToast(msg, "error");
    } finally {
      setAddingId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const getCategoryEmoji = (cat) => {
    const map = {
      Vegetables: "🥦", Fruits: "🍎", Cakes: "🎂",
      Biscuits: "🍪", Dairy: "🥛", Beverages: "☕",
      Snacks: "🥨", Groceries: "🛒", All: "✦"
    };
    return map[cat] || "🏷️";
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="hero-content">
          <p className="hero-eyebrow">Fresh · Local · Delivered</p>
          <h1 className="hero-title">
            Your everyday<br />
            <em>fresh market</em>
          </h1>
          <p className="hero-sub">Browse vegetables, fruits, cakes and more</p>
        </div>
      </section>

      <main className="home-main">

        {/* ── Search row ── */}
        <div className="search-row">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          <span className="results-count">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Category pills ── */}
        <div className="category-strip">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="cat-emoji">{getCategoryEmoji(cat)}</span>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No products found</p>
            <span>Try a different category or search term</span>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="product-card"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="product-img-wrap">
                  {/* ✅ Fixed: was hardcoded http://localhost:8080 */}
                  <img
                    src={`${API_BASE_URL}${product.imageUrl}`}
                    alt={product.name}
                    className="product-img"
                    onError={e =>
                      e.target.src = `https://via.placeholder.com/300x200/1a1d27/c9a84c?text=${encodeURIComponent(product.name[0])}`
                    }
                  />
                  <div className="product-cat-badge">{product.category}</div>
                </div>

                <div className="product-body">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">
                    {product.description?.substring(0, 75)}
                    {product.description?.length > 75 ? "…" : ""}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">LKR {Number(product.price).toFixed(2)}</span>
                    <button
                      className={`add-btn ${addedId === product.id ? "added" : ""}`}
                      onClick={() => addToCart(product)}
                      disabled={addingId === product.id}
                    >
                      {addingId === product.id ? (
                        <span className="btn-spinner" />
                      ) : addedId === product.id ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Added
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Toast ── */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />
        {toast.msg}
      </div>
    </div>
  );
}

export default Home;