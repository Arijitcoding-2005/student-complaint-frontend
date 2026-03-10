import React, { useState, useEffect } from "react";

import api from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 40;
      const y = (window.innerHeight / 2 - e.pageY) / 40;
      const container = document.querySelector(".lg-container");
      if (container) {
        container.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) { setError("Please enter both email and password."); return; }

    try {
      setLoading(true);
      setError("");
      const response = await api.post(
        "/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" }, timeout: 10000 }
      );
      const { token, role } = response.data;
      if (!token || !role) throw new Error("Invalid response from server");
      login(token);
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 1600));
      if (role === "ADMIN") navigate("/admin", { replace: true });
      else navigate("/student", { replace: true });
    } catch (err) {
      if (err.response) setError(err.response.data?.message || "Invalid email or password.");
      else if (err.request) setError("Unable to connect to server. Please try again.");
      else setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-container">
      {/* Floating sparkle dots */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="lg-sparkle" style={{ "--i": i }} />
      ))}

      <div className={`lg-card${success ? " lg-card--success" : ""}`}>
        {/* Success overlay */}
        {success && (
          <div className="lg-success">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="lg-success-particle" style={{ "--i": i }} />
            ))}
            <div className="lg-success-ring">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="#667eea" strokeWidth="3"
                  strokeDasharray="176" strokeDashoffset="176" className="lg-ring-circle" />
                <path d="M20 32l9 9 15-15" stroke="#667eea" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="33" strokeDashoffset="33" className="lg-ring-check" />
              </svg>
            </div>
            <p className="lg-success-text">Welcome back! Redirecting…</p>
          </div>
        )}

        {/* Header */}
        <div className="lg-header">
          <div className="lg-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="8" r="4" />
              <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="lg-title">Welcome Back 👋</h1>
          <p className="lg-subtitle">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="lg-form" onSubmit={handleLogin}>

          {/* Email */}
          <div className="lg-field">
            <label className="lg-label">Email</label>
            <div className="lg-input-wrap">
              <span className="lg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="5" width="16" height="11" rx="2" />
                  <path d="M2 7l8 5 8-5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="lg-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="lg-field">
            <label className="lg-label">Password</label>
            <div className="lg-input-wrap">
              <span className="lg-input-icon">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="9" width="12" height="9" rx="2" />
                  <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="lg-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? (
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

          {/* Error */}
          {error && (
            <div className="lg-error">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="5.5" />
                <line x1="6.5" y1="4" x2="6.5" y2="7" strokeLinecap="round" />
                <circle cx="6.5" cy="9.5" r="0.5" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button className="lg-btn" type="submit" disabled={loading}>
            <span className="lg-btn-inner">
              {loading ? (
                <><span className="lg-spinner" /> Signing in…</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Login
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer */}
        <p className="lg-register-text">
          Don't have an account?{" "}
          <Link to="/register" className="lg-register-link">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;