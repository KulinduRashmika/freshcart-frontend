import "./Admin.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";

const CATEGORIES = ["Vegetables", "Fruits", "Cakes", "Biscuits", "Beverages", "Snacks", "Dairy", "Groceries"];

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", category: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const getAuthHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchProducts = async () => {
    setFetching(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.get(`${API_BASE_URL}/api/products`, { headers });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    if (imageFile) data.append("image", imageFile);

    try {
      const headers = await getAuthHeader();
      const config = { headers: { ...headers, "Content-Type": "multipart/form-data" } };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/products/${editingId}`, data, config);
        showToast("Product updated successfully!", "success");
      } else {
        await axios.post(`${API_BASE_URL}/api/products`, data, config);
        showToast("Product added successfully!", "success");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
    setEditingId(product.id);
    setImageFile(null);
    setImagePreview(`${API_BASE_URL}${product.imageUrl}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers });
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
      showToast("Product deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete product", "error");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", category: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-main">

        {/* Page Header */}
        <div className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Dashboard</p>
            <h1 className="admin-title">Admin Panel</h1>
          </div>

          <div className="admin-header-actions">
            <button className="view-orders-btn" onClick={() => navigate("/admin/orders")}>
              📦 View User Orders
            </button>

            <button
              className="admin-signout-btn"
              onClick={() => {
                localStorage.clear();
                auth.signOut();
                navigate("/", { replace: true });
              }}
            >
              🚪 Sign Out
            </button>

            <div className="admin-stats">
              <div className="stat-chip">
                <span className="stat-chip-num">{products.length}</span>
                <span className="stat-chip-label">Products</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-num">{CATEGORIES.length}</span>
                <span className="stat-chip-label">Categories</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-layout">
          {/* Form */}
          <aside className="form-panel">
            <div className="panel-header">
              <h2>{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
              {editingId && <button className="cancel-edit-btn" onClick={resetForm}>✕ Cancel</button>}
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div className="image-upload-area">
                <label className="image-upload-label" htmlFor="img-upload">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">🖼️</span>
                      <span className="upload-text">Click to upload image</span>
                      <span className="upload-hint">JPG, PNG, WEBP</span>
                    </div>
                  )}
                  <div className="upload-overlay">
                    <span>📷 Change</span>
                  </div>
                </label>
                <input
                  id="img-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingId}
                  style={{ display: "none" }}
                />
              </div>

              {/* Other Fields */}
              <div className="field-group">
                <label className="field-label">Product Name *</label>
                <input type="text" name="name" placeholder="e.g. Organic Carrots" value={formData.name} onChange={handleChange} className="field-input" required />
              </div>

              <div className="field-group">
                <label className="field-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="field-input field-select" required>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Price (LKR) *</label>
                <div className="price-wrap">
                  <span className="price-prefix">LKR</span>
                  <input type="number" name="price" placeholder="0.00" min="0" step="0.01" value={formData.price} onChange={handleChange} className="field-input price-input" required />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Description *</label>
                <textarea name="description" placeholder="Describe the product…" value={formData.description} onChange={handleChange} className="field-input field-textarea" rows={3} required />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Saving…</> : editingId ? "✔ Update Product" : "+ Add Product"}
              </button>
            </form>
          </aside>

          {/* Products List */}
          <section className="products-panel">
            <div className="panel-header">
              <h2>All Products <span className="count-badge">{filtered.length}</span></h2>
              <div className="product-search-wrap">
                <span className="psearch-icon">🔍</span>
                <input type="search" placeholder="Search products…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="product-search" />
              </div>
            </div>

            {fetching ? (
              <div className="products-loading">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.1}s` }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-products">
                <span>📦</span>
                <p>{searchTerm ? "No products match your search" : "No products yet. Add one!"}</p>
              </div>
            ) : (
              <div className="products-list">
                {filtered.map((product, i) => (
                  <div key={product.id} className="product-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="row-img-wrap">
                      <img
                        src={`${API_BASE_URL}${product.imageUrl}`}
                        alt={product.name}
                        className="row-img"
                        onError={e => e.target.src = `https://via.placeholder.com/72x72/1a1d27/c9a84c?text=${encodeURIComponent(product.name?.[0] || "?")}`}
                      />
                    </div>

                    <div className="row-info">
                      <p className="row-name">{product.name}</p>
                      <div className="row-meta">
                        <span className="row-cat">{product.category}</span>
                        <span className="row-price">LKR {Number(product.price).toFixed(2)}</span>
                      </div>
                      {product.description && (
                        <p className="row-desc">
                          {product.description.substring(0, 65)}{product.description.length > 65 ? "…" : ""}
                        </p>
                      )}
                    </div>

                    <div className="row-actions">
                      <button className="row-edit-btn" onClick={() => handleEdit(product)} title="Edit">✏️ Edit</button>
                      <button className="row-delete-btn" onClick={() => setDeleteConfirm(product.id)} title="Delete">🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Delete Product?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="confirm-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`admin-toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />
        {toast.msg}
      </div>
    </div>
  );
}

export default Admin;