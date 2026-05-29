import "./Register.css";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ── Inline SVG icons ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const SpinnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

/* ── Password strength helper ── */
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)               score++;
  if (/[A-Z]/.test(pwd))             score++;
  if (/[0-9]/.test(pwd))             score++;
  if (/[^A-Za-z0-9]/.test(pwd))     score++;

  const map = [
    { label: "Too short",  color: "#ff6b6b",  width: "15%" },
    { label: "Weak",       color: "#ff6b6b",  width: "25%" },
    { label: "Fair",       color: "#f59e0b",  width: "50%" },
    { label: "Good",       color: "#a3e635",  width: "75%" },
    { label: "Strong",     color: "#4ade80",  width: "100%" },
  ];
  return { score, ...map[Math.min(score, 4)] };
}

/* ── Toast hook ── */
function useToast() {
  const [toast, setToast] = useState({ show: false, msg: "", type: "error" });

  const fire = useCallback((msg, type = "error") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  return { toast, fire };
}

/* ── Component ── */
function Register() {
  const navigate = useNavigate();
  const { toast, fire } = useToast();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const strength = getStrength(password);

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      fire("Passwords do not match");
      return;
    }
    if (strength.score < 2) {
      fire("Please choose a stronger password");
      return;
    }
    if (!agreed) {
      fire("Please accept the terms to continue");
      return;
    }

    setLoading(true);
    try {
      /* 1. Create Firebase user */
      await createUserWithEmailAndPassword(auth, email, password);

      /* 2. Persist to Spring Boot backend */
      await axios.post("http://localhost:8080/api/auth/register", {
        name,
        email,
        password,
      });

      fire("Account created! Redirecting…", "success");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ??
        error?.message ??
        "Registration failed. Please try again.";
      fire(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* Header */}
        <div className="register-header">
          <div className="register-icon">
            <ShieldIcon />
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Join us — it only takes a moment</p>
        </div>

        {/* Step dots (decorative progress feel) */}
        <div className="step-indicator">
          <div className="step-dot active" />
          <div className="step-line" />
          <div className="step-dot" />
          <div className="step-line" />
          <div className="step-dot" />
        </div>

        <form className="register-form" onSubmit={registerUser} noValidate>

          {/* Full name */}
          <div className="input-group">
            <label className="input-label" htmlFor="reg-name">Full name</label>
            <div className="input-wrap">
              <span className="input-icon"><UserIcon /></span>
              <input
                id="reg-name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                minLength={2}
              />
              <span className="input-check"><CheckIcon /></span>
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">Email address</label>
            <div className="input-wrap">
              <span className="input-icon"><MailIcon /></span>
              <input
                id="reg-email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <span className="input-check"><CheckIcon /></span>
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="reg-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {/* Strength bar */}
            <div className={`strength-bar-wrap ${password ? "visible" : ""}`}>
              <div className="strength-bar-track">
                <div
                  className="strength-bar-fill"
                  style={{ width: strength.width, background: strength.color }}
                />
              </div>
              <p className="strength-label" style={{ color: strength.color }}>
                {strength.label}
              </p>
            </div>
          </div>

          {/* Confirm password */}
          <div className="input-group">
            <label className="input-label" htmlFor="reg-confirm">Confirm password</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon /></span>
              <input
                id="reg-confirm"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={
                  confirm && confirm !== password
                    ? { borderColor: "rgba(255,107,107,0.5)", boxShadow: "0 0 0 3px rgba(255,107,107,0.1)" }
                    : {}
                }
              />
              {confirm && confirm === password && (
                <span className="input-check" style={{ opacity: 1 }}><CheckIcon /></span>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="terms-row">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree to the{" "}
              <Link to="/terms">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit */}
          <button
            className="register-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <SpinnerIcon />
                Creating account…
              </>
            ) : (
              <>
                <span style={{ fontSize: 15 }}>✦</span>
                Create Account
              </>
            )}
          </button>

        </form>

        {/* Login link */}
        <p className="login-link">
          Already have an account?
          <Link to="/">Sign in</Link>
        </p>

      </div>

      {/* Toast */}
      <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
        <span className="toast-dot" />
        {toast.msg}
      </div>
    </div>
  );
}

export default Register;