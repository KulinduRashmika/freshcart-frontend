import "./OrderHistory.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id;

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/my?userId=${user.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (order) => {
    try {
      const items = typeof order.orderItems === "string"
        ? JSON.parse(order.orderItems)
        : order.orderItems;
      setSelectedOrder({ ...order, items });
    } catch {
      setSelectedOrder({ ...order, items: [] });
    }
    setShowDetails(true);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });

  const formatDateTime = (date) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusColor = (status) => {
    const map = { DELIVERED: "#22c55e", PENDING: "#f59e0b", CANCELLED: "#ef4444", PROCESSING: "#3b82f6" };
    return map[status?.toUpperCase()] || "#94a3b8";
  };

  if (loading) return (
    <div className="oh-page">
      <Navbar />
      <div className="oh-loading-screen">
        <div className="oh-spinner" />
        <p>Loading your orders…</p>
      </div>
    </div>
  );

  return (
    <div className="oh-page">
      <Navbar />

      <div className="oh-main">

        {/* Header */}
        <div className="oh-header">
          <div className="oh-header-left">
            <button className="oh-back-btn" onClick={() => navigate("/home")}>
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back to Shop
            </button>
            <div>
              <h1 className="oh-title">Order History</h1>
              <p className="oh-subtitle">Track and review your past purchases</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="oh-empty">
            <div className="oh-empty-icon">🛍️</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet. Start shopping!</p>
            <button className="oh-shop-btn" onClick={() => navigate("/home")}>Start Shopping</button>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="oh-stats-bar">
              <div className="oh-stat">
                <span className="oh-stat-value">{orders.length}</span>
                <span className="oh-stat-label">Total Orders</span>
              </div>
              <div className="oh-stat-divider" />
              <div className="oh-stat">
                <span className="oh-stat-value">LKR {totalSpent.toFixed(2)}</span>
                <span className="oh-stat-label">Total Spent</span>
              </div>
              <div className="oh-stat-divider" />
              <div className="oh-stat">
                <span className="oh-stat-value">{orders.filter(o => o.status?.toUpperCase() === "DELIVERED").length}</span>
                <span className="oh-stat-label">Delivered</span>
              </div>
            </div>

            {/* Order List */}
            <div className="oh-order-list">
              {orders.map((order, i) => (
                <div
                  key={order.id}
                  className="oh-order-card"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="oh-order-left">
                    <div className="oh-order-id">Order #{order.id}</div>
                    <div className="oh-order-date">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(order.orderDate)}
                    </div>
                    {order.customerName && (
                      <div className="oh-order-name">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {order.customerName}
                      </div>
                    )}
                  </div>

                  <div className="oh-order-right">
                    {order.status && (
                      <span className="oh-status-badge" style={{ color: getStatusColor(order.status), borderColor: getStatusColor(order.status) + "40", background: getStatusColor(order.status) + "15" }}>
                        {order.status}
                      </span>
                    )}
                    <div className="oh-order-amount">LKR {Number(order.totalAmount).toFixed(2)}</div>
                    <button className="oh-details-btn" onClick={() => viewDetails(order)}>
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedOrder && (
        <div className="oh-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="oh-modal" onClick={e => e.stopPropagation()}>
            <div className="oh-modal-header">
              <div>
                <h2 className="oh-modal-title">Order #{selectedOrder.id}</h2>
                <p className="oh-modal-date">{formatDateTime(selectedOrder.orderDate)}</p>
              </div>
              <button className="oh-modal-close" onClick={() => setShowDetails(false)}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="oh-modal-body">
              {/* Delivery Info */}
              <div className="oh-modal-section">
                <h3 className="oh-modal-section-title">Delivery Details</h3>
                <div className="oh-info-grid">
                  {selectedOrder.customerName && (
                    <div className="oh-info-row">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                  )}
                  {selectedOrder.address && (
                    <div className="oh-info-row">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{selectedOrder.address}</span>
                    </div>
                  )}
                  {selectedOrder.phone && (
                    <div className="oh-info-row">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      <span>{selectedOrder.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="oh-modal-section">
                <h3 className="oh-modal-section-title">Items Ordered</h3>
                <div className="oh-items-list">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="oh-item-row">
                      <div className="oh-item-info">
                        <span className="oh-item-name">{item.productName}</span>
                        <span className="oh-item-qty">× {item.quantity}</span>
                      </div>
                      <span className="oh-item-price">LKR {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="oh-modal-total">
                <span>Total</span>
                <span>LKR {Number(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="oh-modal-footer">
              <button className="oh-modal-close-btn" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;