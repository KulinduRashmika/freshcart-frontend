import "./OrderHistory.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const navigate = useNavigate();

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.id;

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const API_BASE_URL = 'https://freshcart-backend-gsss.onrender.com';
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
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
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return <div className="oh-loading">Loading your orders...</div>;

  return (
    <div className="oh-page">
      

      <div className="oh-main">
        <div className="oh-header">
          <h1>Order History</h1>
          <button onClick={() => navigate("/home")} className="back-btn">Back to Shop</button>
        </div>

        {orders.length === 0 ? (
          <div className="oh-empty">
            <h2>No orders yet</h2>
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate("/home")}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="oh-stats">
              <div><strong>{orders.length}</strong> Orders</div>
              <div>Total Spent: <strong>LKR {totalSpent.toFixed(2)}</strong></div>
            </div>

            <div className="oh-order-list">
              {orders.map(order => (
                <div key={order.id} className="oh-order-card">
                  <div className="oh-order-info">
                    <div><strong>Order #{order.id}</strong></div>
                    <div>{formatDate(order.orderDate)}</div>
                    <div>LKR {order.totalAmount}</div>
                  </div>
                  <button onClick={() => viewDetails(order)}>View Details</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedOrder && (
        <div className="modal" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Order #{selectedOrder.id}</h2>
            <p><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
            <p><strong>Name:</strong> {selectedOrder.customerName}</p>
            <p><strong>Address:</strong> {selectedOrder.address}</p>
            <p><strong>Phone:</strong> {selectedOrder.phone}</p>

            <h3>Items</h3>
            <ul>
              {(selectedOrder.items || []).map((item, i) => (
                <li key={i}>
                  {item.productName} × {item.quantity} = LKR {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>

            <h3>Total: LKR {selectedOrder.totalAmount}</h3>

            <button onClick={() => setShowDetails(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;