import "./AdminOrders.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function AdminOrders() {
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast,         setToast]         = useState({ show: false, msg: "", type: "success" });

  const navigate = useNavigate();

  const getAuthHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${API_BASE}/api/orders/all`, { headers });
      setOrders(res.data);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const parseProducts = (itemsString) => {
    if (!itemsString) return [];
    try {
      const matches = itemsString.match(/{.*?}/g);
      if (!matches) return [];
      return matches.map(item => JSON.parse(item));
    } catch { return []; }
  };

  const handleRemoveOrder = async (id) => {
    if (!window.confirm("Mark this order as delivered and remove it?")) return;
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${API_BASE}/api/orders/${id}`, { headers });
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast("Order marked as delivered", "success");
    } catch {
      showToast("Failed to remove order", "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="admin-orders-page">

      {/* ── Header ── */}
      <div className="admin-hero">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="admin-hero-inner">
          <div className="admin-hero-text">
            <p className="hero-eyebrow">Dashboard</p>
            <h1 className="hero-title">Customer <em>Orders</em></h1>
          </div>
          <div className="admin-hero-actions">
            <button className="admin-btn secondary" onClick={() => navigate("/admin")}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>
            <button className="admin-btn primary" onClick={fetchOrders}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="admin-main">

        {/* ── Stats ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon orders-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <div>
              <h2>{orders.length}</h2>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div>
              <h2>LKR {totalRevenue.toFixed(2)}</h2>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        {/* ── Orders ── */}
        {loading ? (
          <div className="admin-loading">
            <div className="loading-spinner" />
            <p>Loading orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <h3>No orders yet</h3>
            <p>Customer orders will appear here</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order, i) => {
              const products  = parseProducts(order.orderItems);
              const isExpanded = expandedOrder === order.id;
              return (
                <div className="order-card" key={order.id} style={{ animationDelay: `${i * 0.05}s` }}>

                  <div className="order-header">
                    <div className="order-header-left">
                      <div className="order-id-badge">#{order.id}</div>
                      <div className="order-customer">
                        <h3>{order.customerName || "Customer"}</h3>
                        <p>
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {order.address || "No Address"}
                        </p>
                        <p>
                          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.18 2 2 0 014 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15v1.92z"/>
                          </svg>
                          {order.phone || "No Phone"}
                        </p>
                      </div>
                    </div>
                    <div className="order-header-right">
                      <span className="status-badge">Placed</span>
                      <button className="delivered-btn" onClick={() => handleRemoveOrder(order.id)}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Delivered
                      </button>
                    </div>
                  </div>

                  <div className="order-meta">
                    <div className="meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                      </svg>
                      LKR {Number(order.totalAmount || 0).toFixed(2)}
                    </div>
                    <div className="meta-chip">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "No Date"}
                    </div>
                  </div>

                  <button className="toggle-btn" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    {isExpanded ? "Hide Products" : "View Products"}
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="products-list">
                      {products.length > 0 ? products.map((product, idx) => (
                        <div className="product-row" key={idx}>
                          <div className="product-icon">🛒</div>
                          <div className="product-info">
                            <h4>{product.productName || "Product"}</h4>
                            <p>Qty: {product.quantity || 1}</p>
                          </div>
                          <div className="product-price">LKR {Number(product.price || 0).toFixed(2)}</div>
                        </div>
                      )) : (
                        <div className="no-products">No products found</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />{toast.msg}
      </div>
    </div>
  );
}

export default AdminOrders;