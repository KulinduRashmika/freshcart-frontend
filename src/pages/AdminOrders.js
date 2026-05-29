import "./AdminOrders.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const navigate = useNavigate();

  /* ───────────────── AUTH HEADER ───────────────── */
  const getAuthHeader = async () => {

    const token = await auth.currentUser?.getIdToken();

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  /* ───────────────── FETCH ORDERS ───────────────── */
  const fetchOrders = async () => {

    try {

      const headers = await getAuthHeader();

      const res = await axios.get(
        "http://localhost:8080/api/orders/all",
        { headers }
      );

      setOrders(res.data);

    } catch (err) {

      console.error(err);
      alert("Failed to load orders");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchOrders();

  }, []);

  /* ───────────────── PARSE PRODUCTS ───────────────── */
  const parseProducts = (itemsString) => {

    if (!itemsString) return [];

    try {

      // find all { ... }
      const matches = itemsString.match(/{.*?}/g);

      if (!matches) return [];

      return matches.map((item) => JSON.parse(item));

    } catch (err) {

      console.error("Product parse error:", err);
      return [];

    }
  };

  /* ───────────────── DELETE ORDER ───────────────── */
  const handleRemoveOrder = async (id) => {

    const confirmDelete = window.confirm(
      "Mark this order as delivered and remove it?"
    );

    if (!confirmDelete) return;

    try {

      const headers = await getAuthHeader();

      await axios.delete(
        `http://localhost:8080/api/orders/${id}`,
        { headers }
      );

      setOrders((prev) =>
        prev.filter((order) => order.id !== id)
      );

    } catch (err) {

      console.error(err);
      alert("Failed to remove order");

    }
  };

  return (

    <div className="admin-orders-page">

      {/* ───────────────── HEADER ───────────────── */}
      <div className="orders-topbar">

        <div>

          <p className="orders-mini-title">
            Dashboard
          </p>

          <h1>
            Customer Orders
          </h1>

        </div>

        <div className="topbar-actions">

          <button
            className="back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back
          </button>

          <button
            className="refresh-btn"
            onClick={fetchOrders}
          >
            🔄 Refresh
          </button>

        </div>

      </div>

      {/* ───────────────── STATS ───────────────── */}
      <div className="orders-stats">

        <div className="orders-stat-card">

          <h2>
            {orders.length}
          </h2>

          <p>
            Total Orders
          </p>

        </div>

        <div className="orders-stat-card">

          <h2>

            LKR{" "}

            {orders
              .reduce(
                (sum, order) =>
                  sum + (order.totalAmount || 0),
                0
              )
              .toFixed(2)}

          </h2>

          <p>
            Total Revenue
          </p>

        </div>

      </div>

      {/* ───────────────── LOADING ───────────────── */}
      {loading ? (

        <div className="loading-orders">
          Loading orders...
        </div>

      ) : orders.length === 0 ? (

        <div className="no-orders">
          No customer orders found.
        </div>

      ) : (

        <div className="orders-grid">

          {orders.map((order) => {

            const products = parseProducts(
              order.orderItems
            );

            const isExpanded =
              expandedOrder === order.id;

            return (

              <div
                className="order-card"
                key={order.id}
              >

                {/* ───────────────── ORDER HEADER ───────────────── */}
                <div className="order-header">

                  <div>

                    <h3>
                      Order #{order.id}
                    </h3>

                    <p>
                      👤{" "}
                      {order.customerName || "Customer"}
                    </p>

                    <p>
                      📍{" "}
                      {order.address || "No Address"}
                    </p>

                    <p>
                      📞{" "}
                      {order.phone || "No Phone"}
                    </p>

                  </div>

                  <div className="header-right">

                    <span className="order-status">
                      PLACED
                    </span>

                    <button
                      className="remove-order-btn"
                      onClick={() =>
                        handleRemoveOrder(order.id)
                      }
                    >
                      ✅ Delivered
                    </button>

                  </div>

                </div>

                {/* ───────────────── ORDER INFO ───────────────── */}
                <div className="order-info">

                  <div className="info-box">

                    💰 LKR{" "}

                    {Number(
                      order.totalAmount || 0
                    ).toFixed(2)}

                  </div>

                  <div className="info-box">

                    📅{" "}

                    {order.orderDate
                      ? new Date(
                          order.orderDate
                        ).toLocaleString()
                      : "No Date"}

                  </div>

                </div>

                {/* ───────────────── TOGGLE BUTTON ───────────────── */}
                <button
                  className="toggle-products-btn"
                  onClick={() =>
                    setExpandedOrder(
                      isExpanded
                        ? null
                        : order.id
                    )
                  }
                >

                  {isExpanded
                    ? "Hide Products ▲"
                    : "View Products ▼"}

                </button>

                {/* ───────────────── PRODUCTS ───────────────── */}
                {isExpanded && (

                  <div className="products-container">

                    {products.length > 0 ? (

                      products.map((product, index) => (

                        <div
                          className="product-item"
                          key={index}
                        >

                          <div className="product-left">

                            <div className="product-image">
                              🛒
                            </div>

                            <div>

                              <h4>
                                {product.productName || "Product"}
                              </h4>

                              <p>
                                Qty: {product.quantity || 1}
                              </p>

                            </div>

                          </div>

                          <div className="product-price">

                            LKR{" "}

                            {Number(
                              product.price || 0
                            ).toFixed(2)}

                          </div>

                        </div>

                      ))

                    ) : (

                      <div className="no-products">
                        No products found
                      </div>

                    )}

                  </div>

                )}

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default AdminOrders;