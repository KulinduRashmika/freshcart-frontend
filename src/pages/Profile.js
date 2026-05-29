import "./Profile.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser?.id) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/api/users/${savedUser.id}`);
      setUser(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      setUser(savedUser);
      setFormData(savedUser);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:8080/api/users/${user.id}`, formData);
      
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Please try again.");
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

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!user) return <div>User not found. Please login again.</div>;

  return (
    <div className="profile-page">
      

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>

          <div className="profile-info">
            {editing ? (
              <>
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name || ""} 
                  onChange={handleChange} 
                />

                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email || ""} 
                  onChange={handleChange} 
                />

                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone || ""} 
                  onChange={handleChange} 
                  placeholder="Enter phone number"
                />
              </>
            ) : (
              <>
                <div className="info-row">
                  <span className="label">Full Name</span>
                  <span>{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone</span>
                  <span>{user.phone || "Not provided"}</span>
                </div>
              </>
            )}
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                <button className="history-btn" onClick={() => navigate("/orders")}>📋 View Order History</button>
                <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;