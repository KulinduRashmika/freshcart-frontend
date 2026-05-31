import "./Cart.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "../components/Navbar";

// ✅ Single source of truth for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function Cart() {
  const [cartItems,     setCartItems]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [placing,       setPlacing]       = useState(false);
  const [orderData,     setOrderData]     = useState({ customerName: "", address: "", phone: "" });
  const [toast,         setToast]         = useState({ show: false, msg: "", type: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const navigate = useNavigate();

  const getUser = () => JSON.parse(localStorage.getItem("user"));

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    const user = getUser();
    if (!user) { navigate("/"); return; }
    try {
      // ✅ Fixed: was API_BASE (undefined)
      const res = await axios.get(`${API_BASE_URL}/api/cart/${user.id}`);
      setCartItems(res.data || []);
    } catch (err) {
      showToast("Failed to load cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      // ✅ Fixed: was API_BASE (undefined)
      await axios.delete(`${API_BASE_URL}/api/cart/${cartId}`);
      const user = getUser();
      const item = cartItems.find(i => i.id === cartId);
      await axios.post(`${API_BASE_URL}/api/cart/add?userId=${user.id}&productId=${item.product.id}&quantity=${newQuantity}`);
      fetchCart();
    } catch (err) {
      showToast("Failed to update quantity", "error");
    }
  };

  const removeItem = async (cartId) => {
    try {
      // ✅ Fixed: was API_BASE (undefined)
      await axios.delete(`${API_BASE_URL}/api/cart/${cartId}`);
      setCartItems(prev => prev.filter(i => i.id !== cartId));
      showToast("Item removed", "success");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  const confirmClear = async () => {
    const user = getUser();
    try {
      // ✅ Fixed: was API_BASE (undefined)
      await axios.delete(`${API_BASE_URL}/api/cart/clear/${user.id}`);
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
    if (!user?.id) { navigate("/"); return; }
    setPlacing(true);
    try {
      // ✅ Fixed: was API_BASE (undefined)
      await axios.post(
        `${API_BASE_URL}/api/orders/place?userId=${user.id}` +
        `&customerName=${encodeURIComponent(customerName)}` +
        `&address=${encodeURIComponent(address)}` +
        `&phone=${encodeURIComponent(phone)}`
      );
      setShowOrderForm(false);
      setCartItems([]);
      setOrderData({ customerName: "", address: "", phone: "" });
      showToast("🎉 Order placed successfully!", "success");
      setTimeout(() => navigate("/orders"), 1800);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to place order", "error");
    } finally {
      setPlacing(false);
    }
  };

  const handleCardPayment = async () => {
    const { customerName, address, phone } = orderData;
    if (!customerName.trim() || !address.trim() || !phone.trim()) {
      showToast("Please fill all delivery details", "error");
      return;
    }
    try {
      // ✅ Fixed: was API_BASE (undefined)
      const response = await axios.post(`${API_BASE_URL}/api/payment/create-checkout-session`, { amount: getTotal() });
      localStorage.setItem("pendingOrder", JSON.stringify(orderData));
      window.location.href = response.data.url;
    } catch {
      showToast("Payment failed", "error");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

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
      <Navbar />

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
            <button className="shop-btn" onClick={() => navigate("/home")}>Continue Shopping</button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-col">
              <p className="col-label">Your Items</p>
              <div className="cart-items-list">
                {cartItems.map((item, i) => (
                  <div key={item.id} className="cart-item-row" style={{ animationDelay: `${i * 0.06}s` }}>
                    {/* ✅ Fixed: was API_BASE (undefined) */}
                    <img
                      src={product.imageUrl}
                      alt={item.product?.name}
                      className="item-img"
                      onError={e => e.target.src = `https://via.placeholder.com/72x72/1a1d27/c9a84c?text=${encodeURIComponent(item.product?.name?.[0] || "?")}`}
                    />
                    <div className="item-details">
                      <p className="item-name">{item.product?.name}</p>
                      <p className="item-cat">{item.product?.category}</p>
                      <p className="item-unit">LKR {Number(item.product?.price).toFixed(2)} each</p>
                    </div>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className="quantity">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-right">
                      <p className="item-total">LKR {(item.product?.price * item.quantity).toFixed(2)}</p>
                      <button className="remove-item-btn" onClick={() => removeItem(item.id)} title="Remove">
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
              <button className="clear-cart-btn" onClick={() => setDeleteConfirm("clear")}>Clear entire cart</button>
            </div>

            <div className="cart-summary-col">
              <div className="summary-card">
                <p className="col-label">Order Summary</p>
                <div className="summary-lines">
                  {cartItems.map(item => (
                    <div key={item.id} className="summary-line">
                      <span className="summary-item-name">{item.product?.name}<span className="summary-qty"> ×{item.quantity}</span></span>
                      <span>LKR {(item.product?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-divider" />
                <div className="summary-row"><span>Subtotal</span><span>LKR {getTotal().toFixed(2)}</span></div>
                <div className="summary-row"><span>Delivery</span><span className="free-tag">Free</span></div>
                <div className="summary-divider" />
                <div className="summary-total-row"><span>Total</span><strong>LKR {getTotal().toFixed(2)}</strong></div>
                <button className="checkout-btn" onClick={() => setShowOrderForm(true)}>Proceed to Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {[
                { label: "Full Name",        name: "customerName", type: "text", placeholder: "Jane Smith",               autoComplete: "name" },
                { label: "Delivery Address", name: "address",      type: "text", placeholder: "Street, City, Postal Code", autoComplete: "address-line1" },
                { label: "Phone Number",     name: "phone",        type: "tel",  placeholder: "07X XXX XXXX",              autoComplete: "tel" },
              ].map(f => (
                <div className="modal-field" key={f.name}>
                  <label>{f.label}</label>
                  <input type={f.type} name={f.name} placeholder={f.placeholder} autoComplete={f.autoComplete} value={orderData[f.name]} onChange={handleInputChange} />
                </div>
              ))}
              <div className="modal-mini-summary">
                <div className="mini-row"><span>Total items</span><strong>{cartItems.reduce((s, i) => s + i.quantity, 0)}</strong></div>
                <div className="mini-row mini-total"><span>Amount to pay</span><strong>LKR {getTotal().toFixed(2)}</strong></div>
              </div>
            </div>
            <div className="payment-methods">
              <label className="payment-option">
                <input type="radio" value="COD" checked={paymentMethod === "COD"} onChange={e => setPaymentMethod(e.target.value)} />
                Cash on Delivery
              </label>
              <label className="payment-option">
                <input type="radio" value="CARD" checked={paymentMethod === "CARD"} onChange={e => setPaymentMethod(e.target.value)} />
                Credit / Debit Card
              </label>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowOrderForm(false)}>Cancel</button>
              {paymentMethod === "COD"
                ? <button className="modal-confirm" onClick={placeOrder} disabled={placing}>{placing ? "Placing..." : "Place Order"}</button>
                : <button className="modal-confirm" onClick={handleCardPayment}>Pay with Card</button>
              }
            </div>
          </div>
        </div>
      )}

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

      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />{toast.msg}
      </div>
    </div>
  );
}

export default Cart;