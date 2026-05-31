import "./Login.css";
import axios from "axios";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://freshcart-backend-gsss.onrender.com';

const GoogleIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email === "admin@gmail.com" && password === "admin123") {
  localStorage.setItem(
    "user",
    JSON.stringify({
      email: "admin@gmail.com",
      role: "ADMIN"
    })
  );

  navigate("/admin");
  setLoading(false);
  return;
}

    try {
      // ✅ Fixed: was API_BASE (undefined), now API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (response.data?.message === "Login successful") {
        localStorage.setItem("user",  JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        setError(response.data?.error || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || "Invalid email or password");
      } else if (err.request) {
        setError("Cannot connect to server.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const facebookLogin = async () => {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, facebookProvider);
      navigate("/home");
    } catch {
      setError("Facebook login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <div className="brand-icon-lg">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </div>
            <span className="brand-name-lg">FreshCart</span>
          </div>
          <h1 className="login-headline">Fresh market,<br/><em>delivered daily</em></h1>
          <p className="login-sub">Vegetables, fruits, cakes and more — right to your door.</p>
          <div className="login-features">
            {["Fresh produce every day", "Free delivery on all orders", "Secure checkout"].map(f => (
              <div className="login-feature" key={f}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="login-orb-a" /><div className="login-orb-b" />
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={loginUser}>
            <div className="field-group">
              <label>Email address</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="field-icon">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
                </svg>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" disabled={loading} />
              </div>
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label>Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="field-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" disabled={loading} />
              </div>
            </div>

            <button className="login-submit-btn" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          <div className="login-divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button className="social-btn" onClick={googleLogin} disabled={loading}>
              <GoogleIcon /> Google
            </button>
            <button className="social-btn" onClick={facebookLogin} disabled={loading}>
              <FacebookIcon /> Facebook
            </button>
          </div>

          <p className="login-register-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;