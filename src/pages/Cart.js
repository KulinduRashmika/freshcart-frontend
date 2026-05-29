import "./Cart.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "../components/Navbar";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
);
function Cart() {
  const [cartItems,      setCartItems]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showOrderForm,  setShowOrderForm]  = useState(false);
  const [placing,        setPlacing]        = useState(false);
  const [orderData,      setOrderData]      = useState({ customerName: "", address: "", phone: "" });
  const [toast,          setToast]          = useState({ show: false, msg: "", type: "success" });
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);
  const [paymentMethod, setPaymentMethod] =
  useState("COD");

  const navigate = useNavigate();

  // ── Read userId from localStorage (matches your actual backend) ──
  const getUser = () => {
  const user =
    JSON.parse(localStorage.getItem("user"));

  console.log(user);

  return user;
};

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    const user = getUser();
    if (!user) { navigate("/"); return; }
    try {
      const res = await axios.get(`http://localhost:8080/api/cart/${user.id}`);
      setCartItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch cart", err);
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  // Update Quantity
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // For simplicity: remove old and add new (or you can add a proper update endpoint)
      await axios.delete(`http://localhost:8080/api/cart/${cartId}`);

      const user = getUser();
      const item = cartItems.find(i => i.id === cartId);
      
      await axios.post(`http://localhost:8080/api/cart/add?userId=${user.id}&productId=${item.product.id}&quantity=${newQuantity}`);

      fetchCart(); // Refresh cart
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    }
  };

  const removeItem = async (cartId) => {
    try {
      await axios.delete(`http://localhost:8080/api/cart/${cartId}`);
      setCartItems(prev => prev.filter(i => i.id !== cartId));
      showToast("Item removed", "success");
    } catch (err) {
      showToast("Failed to remove item", "error");
    }
  };

  const clearCart = async () => {
    setDeleteConfirm("clear");
  };

  const confirmClear = async () => {
    const user = getUser();
    try {
      await axios.delete(`http://localhost:8080/api/cart/clear/${user.id}`);
      setCartItems([]);
      setDeleteConfirm(null);
      showToast("Cart cleared", "success");
    } catch {
      showToast("Failed to clear cart", "error");
    }
  };

  const getTotal = () =>
    cartItems.reduce((t, i) => t + (i.product?.price || 0) * i.quantity, 0);

  const handleInputChange = (e) =>
    setOrderData({ ...orderData, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    const { customerName, address, phone } = orderData;

    if (!customerName.trim() || !address.trim() || !phone.trim()) {
      showToast("Please fill all delivery details", "error");
      return;
    }

    const user = getUser();

    if (!user?.id) {
      showToast(
        "Session expired. Please login again.",
        "error"
      );
      navigate("/");
      return;
    }

    setPlacing(true);

    try {
      await axios.post(
        `http://localhost:8080/api/orders/place` +
          `?userId=${user.id}` +
          `&customerName=${encodeURIComponent(customerName)}` +
          `&address=${encodeURIComponent(address)}` +
          `&phone=${encodeURIComponent(phone)}`
      );

      setShowOrderForm(false);
      setCartItems([]);
      setOrderData({ customerName: "", address: "", phone: "" });

      showToast("🎉 Order placed successfully!", "success");

      setTimeout(() => {
        navigate("/orders");
      }, 1800);
    } catch (err) {
      console.error("Order error:", err);

      const msg = err.response?.data?.error || "Failed to place order";
      showToast(msg, "error");
    } finally {
      setPlacing(false);
    }
  };

  /* ───────── STRIPE PAYMENT ───────── */

const handleCardPayment = async () => {

  const { customerName, address, phone } = orderData;

  if (
    !customerName.trim() ||
    !address.trim() ||
    !phone.trim()
  ) {
    showToast("Please fill all delivery details", "error");
    return;
  }

  try {

    const response = await axios.post(
      "http://localhost:8080/api/payment/create-checkout-session",
      {
        amount: getTotal(),
      }
    );

    // SAVE ORDER DATA
    localStorage.setItem(
      "pendingOrder",
      JSON.stringify(orderData)
    );

    // NEW REDIRECT METHOD
    window.location.href = response.data.url;

  } catch (err) {

    console.error(err);

    showToast("Payment failed", "error");
  }
};

  function showToast(msg, type) {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    }

  if (loading) return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-loading">
        <div className="loading-spinner" />
        <p>Loading your cart…</p>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-items-list">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item-row">
            <img
              src={`http://localhost:8080${item.product?.imageUrl || ""}`}
              alt={item.product?.name}
              className="item-img"
            />

            <div className="item-details">
              <p className="item-name">{item.product?.name}</p>
              <p className="item-cat">{item.product?.category}</p>
              <p className="item-price">LKR {Number(item.product?.price).toFixed(2)}</p>
            </div>

            {/* Quantity Controls */}
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span className="quantity">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>

            <div className="item-total">
              LKR {(item.product?.price * item.quantity).toFixed(2)}
            </div>

            <button className="remove-item-btn" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* ── Page header ── */}
      <div className="cart-page-header">
        <div className="cart-page-header-inner">
          <button className="back-btn" onClick={() => navigate("/home")}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Shop
          </button>
          <div className="cart-title-row">
            <h1>Shopping Cart</h1>
            {cartItems.length > 0 && (
              <span className="item-count-badge">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cart-main">
        {/* ── Empty state ── */}
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Add some fresh products and come back here</p>
            <button className="shop-btn" onClick={() => navigate("/home")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Items column ── */}
            <div className="cart-items-col">
              <p className="col-label">Your Items</p>

              <div className="cart-items-list">
                {cartItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="cart-item-row"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <img
                      src={`http://localhost:8080${item.product?.imageUrl || ""}`}
                      alt={item.product?.name}
                      className="item-img"
                      onError={e =>
                        e.target.src = `https://via.placeholder.com/72x72/1a1d27/c9a84c?text=${encodeURIComponent(item.product?.name?.[0] || "?")}`
                      }
                    />

                    <div className="item-details">
                      <p className="item-name">{item.product?.name}</p>
                      <p className="item-cat">{item.product?.category}</p>
                      <p className="item-unit">LKR {Number(item.product?.price).toFixed(2)} each</p>
                    </div>

                    <div className="item-right">
                      <span className="qty-badge">× {item.quantity}</span>
                      <p className="item-total">
                        LKR {(item.product?.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        className="remove-item-btn"
                        onClick={() => removeItem(item.id)}
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="clear-cart-btn" onClick={clearCart}>
                Clear entire cart
              </button>
            </div>

            {/* ── Summary sidebar ── */}
            <div className="cart-summary-col">
              <div className="summary-card">
                <p className="col-label">Order Summary</p>

                <div className="summary-lines">
                  {cartItems.map(item => (
                    <div key={item.id} className="summary-line">
                      <span className="summary-item-name">
                        {item.product?.name}
                        <span className="summary-qty"> ×{item.quantity}</span>
                      </span>
                      <span>LKR {(item.product?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider" />
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>LKR {getTotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="free-tag">Free</span>
                </div>
                <div className="summary-divider" />

                <div className="summary-total-row">
                  <span>Total</span>
                  <strong>LKR {getTotal().toFixed(2)}</strong>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => setShowOrderForm(true)}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Checkout modal ── */}
      {showOrderForm && (
        <div className="modal-overlay" onClick={() => setShowOrderForm(false)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>

            <div className="modal-head">
              <div className="modal-title">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Delivery Details
              </div>
              <button className="modal-close" onClick={() => setShowOrderForm(false)}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {[
                { label: "Full Name",         name: "customerName", type: "text", placeholder: "Jane Smith",              autoComplete: "name" },
                { label: "Delivery Address",  name: "address",      type: "text", placeholder: "Street, City, Postal Code", autoComplete: "address-line1" },
                { label: "Phone Number",      name: "phone",        type: "tel",  placeholder: "07X XXX XXXX",             autoComplete: "tel" },
              ].map(f => (
                <div className="modal-field" key={f.name}>
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    autoComplete={f.autoComplete}
                    value={orderData[f.name]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}

              <div className="modal-mini-summary">
                <div className="mini-row">
                  <span>Total items</span>
                  <strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong>
                </div>
                <div className="mini-row mini-total">
                  <span>Amount to pay</span>
                  <strong>LKR {getTotal().toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="payment-methods">

  <label className="payment-option">
    <input
      type="radio"
      value="COD"
      checked={paymentMethod === "COD"}
      onChange={(e) =>
        setPaymentMethod(e.target.value)
      }
    />
    Cash on Delivery
  </label>

  <label className="payment-option">
    <input
      type="radio"
      value="CARD"
      checked={paymentMethod === "CARD"}
      onChange={(e) =>
        setPaymentMethod(e.target.value)
      }
    />
    Credit / Debit Card
  </label>

</div>

<div className="modal-actions">

  <button
    className="modal-cancel"
    onClick={() => setShowOrderForm(false)}
  >
    Cancel
  </button>

  {paymentMethod === "COD" ? (

    <button
      className="modal-confirm"
      onClick={placeOrder}
      disabled={placing}
    >
      {placing
        ? "Placing..."
        : "Place Order"}
    </button>

  ) : (

    <button
      className="modal-confirm"
      onClick={handleCardPayment}
    >
      Pay with Card
    </button>

  )}

</div>
          </div>
        </div>
      )}

      {/* ── Clear confirm modal ── */}
      {deleteConfirm === "clear" && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Clear Cart?</h3>
            <p>All items will be removed. This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="confirm-delete" onClick={confirmClear}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />
        {toast.msg}
      </div>
    </div>
  );
}

export default Cart;