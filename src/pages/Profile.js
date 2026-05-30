import "./Profile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import API_BASE from "../api";

function Profile() {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState({ show: false, msg: "", type: "success" });

  useEffect(() => { loadUserProfile(); }, []);

  const loadUserProfile = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser?.id) { navigate("/"); return; }
    try {
      const res = await axios.get(`${API_BASE}/api/users/${savedUser.id}`);
      setUser(res.data);
      setFormData(res.data);
    } catch {
      setUser(savedUser);
      setFormData(savedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/api/users/${user.id}`, formData);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  if (loading) return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-loading">
        <div className="loading-spinner" />
        <p>Loading profile…</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-loading"><p>User not found. Please login again.</p></div>
    </div>
  );

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-hero">
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
        <div className="profile-hero-content">
          <p className="hero-eyebrow">Account</p>
          <h1 className="hero-title">Your <em>Profile</em></h1>
        </div>
      </div>

      <div className="profile-main">
        <div className="profile-card">

          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="profile-avatar-ring" />
          </div>

          <div className="profile-identity">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>

          <div className="profile-divider" />

          <div className="profile-fields">
            <p className="section-label">Personal Information</p>

            {editing ? (
              <div className="edit-fields">
                {[
                  { label: "Full Name",    name: "name",  type: "text",  placeholder: "Your full name" },
                  { label: "Email",        name: "email", type: "email", placeholder: "Your email" },
                  { label: "Phone Number", name: "phone", type: "tel",   placeholder: "07X XXX XXXX" },
                ].map(f => (
                  <div className="field-group" key={f.name}>
                    <label>{f.label}</label>
                    <input
                      type={f.type} name={f.name}
                      value={formData[f.name] || ""}
                      placeholder={f.placeholder}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="info-rows">
                {[
                  { label: "Full Name", value: user.name },
                  { label: "Email",     value: user.email },
                  { label: "Phone",     value: user.phone || "Not provided" },
                ].map(r => (
                  <div className="info-row" key={r.label}>
                    <span className="info-label">{r.label}</span>
                    <span className="info-value">{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-divider" />

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="action-btn secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button className="action-btn primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="btn-spinner" /> Saving…</> : "Save Changes"}
                </button>
              </>
            ) : (
              <div className="action-grid">
                <button className="action-btn primary" onClick={() => setEditing(true)}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
                <button className="action-btn secondary" onClick={() => navigate("/orders")}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="2"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="16" x2="13" y2="16"/>
                  </svg>
                  Order History
                </button>
                <button className="action-btn danger" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />{toast.msg}
      </div>
    </div>
  );
}

export default Profile;