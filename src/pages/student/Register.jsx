import React, { useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("STUDENT");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", secretKey: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setForm((prev) => ({ ...prev, secretKey: "" }));
    setError("");
  };

  const validate = () => {
    if (!form.name.trim())                return "Full name is required.";
    if (!form.email.trim())               return "Email address is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 6)         return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (role === "ADMIN" && !form.secretKey.trim()) return "Admin secret key is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    const endpoint =
      role === "STUDENT"
        ? "/student/register"
        : "/admin/register";

    try {
      setLoading(true);
      setError("");
      await api.post(endpoint, {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(role === "ADMIN" && { secretKey: form.secretKey }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rg-root">
      <div className="rg-bg-orb rg-bg-orb--1" />
      <div className="rg-bg-orb rg-bg-orb--2" />
      <div className="rg-bg-orb rg-bg-orb--3" />

      <div className="rg-card">
        {success && (
          <div className="rg-success">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="rg-particle" style={{ "--i": i }} />
            ))}
            <div className="rg-success-figure">
              <svg viewBox="0 0 120 160" fill="none" className="rg-student-svg">
                <ellipse cx="60" cy="34" rx="22" ry="5" fill="#6366f1" className="rg-svg-part" style={{"--d":"0s"}} />
                <rect x="48" y="22" width="24" height="14" rx="3" fill="#4f46e5" className="rg-svg-part" style={{"--d":"0.05s"}} />
                <line x1="82" y1="34" x2="88" y2="46" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" className="rg-svg-part" style={{"--d":"0.1s"}} />
                <circle cx="88" cy="49" r="3.5" fill="#a78bfa" className="rg-svg-part" style={{"--d":"0.12s"}} />
                <circle cx="60" cy="54" r="14" fill="#fbbf24" className="rg-svg-part" style={{"--d":"0.15s"}} />
                <circle cx="55" cy="52" r="2" fill="#1e293b" className="rg-svg-part" style={{"--d":"0.2s"}} />
                <circle cx="65" cy="52" r="2" fill="#1e293b" className="rg-svg-part" style={{"--d":"0.2s"}} />
                <path d="M54 58 Q60 65 66 58" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" className="rg-svg-part" style={{"--d":"0.25s"}} />
                <rect x="46" y="70" width="28" height="34" rx="6" fill="#6366f1" className="rg-svg-part" style={{"--d":"0.3s"}} />
                <path d="M46 78 Q32 84 30 94" stroke="#6366f1" strokeWidth="9" strokeLinecap="round" className="rg-svg-part" style={{"--d":"0.35s"}} />
                <path d="M74 78 Q88 84 90 94" stroke="#6366f1" strokeWidth="9" strokeLinecap="round" className="rg-svg-part" style={{"--d":"0.35s"}} />
                <rect x="22" y="88" width="14" height="18" rx="2" fill="#10b981" className="rg-svg-part" style={{"--d":"0.4s"}} />
                <line x1="29" y1="88" x2="29" y2="106" stroke="#059669" strokeWidth="1.5" className="rg-svg-part" style={{"--d":"0.42s"}} />
                <rect x="50" y="102" width="9" height="22" rx="4" fill="#4f46e5" className="rg-svg-part" style={{"--d":"0.45s"}} />
                <rect x="61" y="102" width="9" height="22" rx="4" fill="#4f46e5" className="rg-svg-part" style={{"--d":"0.45s"}} />
                <ellipse cx="54" cy="125" rx="7" ry="4" fill="#1e293b" className="rg-svg-part" style={{"--d":"0.5s"}} />
                <ellipse cx="66" cy="125" rx="7" ry="4" fill="#1e293b" className="rg-svg-part" style={{"--d":"0.5s"}} />
              </svg>
              <div className="rg-success-ring">
                <svg viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="3" strokeDasharray="176" strokeDashoffset="176" className="rg-ring-circle" strokeLinecap="round" />
                  <path d="M20 32l9 9 15-15" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="33" strokeDashoffset="33" className="rg-ring-check" />
                </svg>
              </div>
            </div>
            <h3 className="rg-success-title">
              {role === "STUDENT" ? "Welcome, Scholar! 🎓" : "Access Granted! 🛡️"}
            </h3>
            <p className="rg-success-sub">Account created — redirecting to login…</p>
            <div className="rg-success-bar"><div className="rg-success-bar-fill" /></div>
          </div>
        )}

        {/* Top accent bar */}
        <div className="rg-accent-bar" />

        {/* Header */}
        <div className="rg-header">
          <div className="rg-logo">✦</div>
          <h1 className="rg-title">Create Account</h1>
          <p className="rg-subtitle">Join the complaint management system</p>
        </div>

        {/* Role Toggle */}
        <div className="rg-role-wrap">
          <div className="rg-role-toggle">
            <button
              type="button"
              className={`rg-role-btn${role === "STUDENT" ? " active" : ""}`}
              onClick={() => switchRole("STUDENT")}
            >
              <span className="rg-role-icon">🎓</span>
              Student
            </button>
            <button
              type="button"
              className={`rg-role-btn${role === "ADMIN" ? " active" : ""}`}
              onClick={() => switchRole("ADMIN")}
            >
              <span className="rg-role-icon">🛡️</span>
              Admin
            </button>
            <div className={`rg-role-slider${role === "ADMIN" ? " right" : ""}`} />
          </div>
        </div>

        {/* Form */}
        <form className="rg-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="rg-field">
            <label className="rg-label">Full Name</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="10" cy="7" r="3.5" />
                  <path d="M2.5 17c0-3.5 3.36-6 7.5-6s7.5 2.5 7.5 6" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="rg-input"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="rg-field">
            <label className="rg-label">Email Address</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="5" width="16" height="11" rx="2" />
                  <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="rg-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="rg-field">
            <label className="rg-label">Password</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2" />
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="rg-input"
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="rg-eye" onClick={() => setShowPass((p) => !p)}>
                {showPass ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                    <circle cx="10" cy="10" r="2.5" />
                    <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                    <circle cx="10" cy="10" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="rg-field">
            <label className="rg-label">Confirm Password</label>
            <div className="rg-input-wrap">
              <span className="rg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2" />
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
                  <path d="M8 14l1.5 1.5L12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                className="rg-input"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="rg-eye" onClick={() => setShowConfirm((p) => !p)}>
                {showConfirm ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                    <circle cx="10" cy="10" r="2.5" />
                    <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                    <circle cx="10" cy="10" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password strength hint */}
          {form.password.length > 0 && (
            <div className="rg-strength">
              <div className="rg-strength-bars">
                {[1,2,3,4].map((n) => (
                  <div
                    key={n}
                    className={`rg-strength-bar${form.password.length >= n * 3 ? " filled" : ""}`}
                    style={{
                      "--bar-color":
                        form.password.length < 6 ? "#EF4444" :
                        form.password.length < 9 ? "#F59E0B" : "#10B981"
                    }}
                  />
                ))}
              </div>
              <span className="rg-strength-label">
                {form.password.length < 6 ? "Weak" : form.password.length < 9 ? "Fair" : "Strong"}
              </span>
            </div>
          )}

          {/* Admin Secret Key */}
          {role === "ADMIN" && (
            <div className="rg-field rg-field--secret">
              <label className="rg-label">
                Admin Secret Key
                <span className="rg-label-required">required</span>
              </label>
              <div className="rg-secret-hint">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="6.5" cy="6.5" r="5.5" />
                  <line x1="6.5" y1="5" x2="6.5" y2="6.5" strokeLinecap="round" />
                  <circle cx="6.5" cy="9" r="0.5" fill="currentColor" />
                </svg>
                Only authorised administrators have this key.
              </div>
              <div className="rg-input-wrap">
                <span className="rg-input-icon">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M8 11a4 4 0 118 0 4 4 0 01-8 0z" />
                    <path d="M11.93 14.5L11 18H9l-.5-2-.5 2H6l-.93-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  className="rg-input rg-input--secret"
                  type={showSecret ? "text" : "password"}
                  name="secretKey"
                  placeholder="Enter admin secret key"
                  value={form.secretKey}
                  onChange={handleChange}
                  autoComplete="off"
                />
                <button type="button" className="rg-eye" onClick={() => setShowSecret((p) => !p)}>
                  {showSecret ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                      <circle cx="10" cy="10" r="2.5" />
                      <line x1="3" y1="3" x2="17" y2="17" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" />
                      <circle cx="10" cy="10" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="rg-error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="7" r="6" />
                <line x1="7" y1="4" x2="7" y2="7.5" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.5" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="rg-submit" disabled={loading}>
            <span className="rg-submit-inner">
              {loading ? (
                <><span className="rg-spinner" /> Creating account…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 1v14M1 8h14" strokeLinecap="round" />
                  </svg>
                  Create {role === "STUDENT" ? "Student" : "Admin"} Account
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <div className="rg-footer">
          Already have an account?{" "}
          <Link to="/login" className="rg-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;