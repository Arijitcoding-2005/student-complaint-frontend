import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const token = () => localStorage.getItem("token");
const role  = () => localStorage.getItem("role");

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [stats, setStats]     = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/my", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const complaints = res.data;
      if (complaints.length > 0) {
        setUser({ name: complaints[0].name, id: complaints[0].studentId });
      }
      setStats({
        total:      complaints.length,
        pending:    complaints.filter(c => c.status === "PENDING").length,
        resolved:   complaints.filter(c => c.status === "RESOLVED").length,
        inProgress: complaints.filter(c => c.status === "IN_PROGRESS" || c.status === "IN_REVIEW").length,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Student ID: ${user?.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const resolveRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="pf-root">
      <div className="pf-orb pf-orb--1" />
      <div className="pf-orb pf-orb--2" />

      <div className="pf-inner">

        {/* Back */}
        <button className="pf-back" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L4 7l5 5" strokeLinecap="round" />
          </svg>
          Back
        </button>

        {loading ? (
          <div className="pf-loading"><div className="pf-spinner" /><span>Loading profile…</span></div>
        ) : (
          <>
            {/* ── Hero Card ── */}
            <div className="pf-hero">
              <div className="pf-hero__bg" />
              <div className="pf-hero__body">
                <div className="pf-avatar">
                  <span className="pf-avatar__initials">{initials}</span>
                  <span className="pf-avatar__ring" />
                </div>
                <div className="pf-hero__info">
                  <h1 className="pf-name">{user?.name || "Student"}</h1>
                  <div className="pf-role-badge">
                    <span>{role() === "ADMIN" ? "🛡️ Administrator" : "🎓 Student"}</span>
                  </div>
                  <div className="pf-id-row">
                    <span className="pf-id">ID #{user?.id}</span>
                    <button className="pf-copy" onClick={handleCopy}>
                      {copied ? "✅ Copied" : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="4" y="4" width="7" height="7" rx="1.5" />
                            <path d="M1 8V2a1 1 0 011-1h6" strokeLinecap="round" />
                          </svg>
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Resolve ring */}
                <div className="pf-ring-wrap">
                  <svg viewBox="0 0 80 80" className="pf-ring-svg">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke="url(#ringGrad)" strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${resolveRate * 2.136} 213.6`}
                      strokeDashoffset="53.4"
                      style={{ transition: "stroke-dasharray 1.2s ease" }}
                    />
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="pf-ring-label">
                    <span className="pf-ring-pct">{resolveRate}%</span>
                    <span className="pf-ring-sub">Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="pf-stats">
              {[
                { label: "Total",       value: stats.total,      icon: "📋", color: "#6366f1" },
                { label: "Pending",     value: stats.pending,    icon: "⏳", color: "#f59e0b" },
                { label: "In Progress", value: stats.inProgress, icon: "🔄", color: "#3b82f6" },
                { label: "Resolved",    value: stats.resolved,   icon: "✅", color: "#10b981" },
              ].map((s, i) => (
                <div className="pf-stat" key={s.label} style={{ "--ac": s.color, animationDelay: `${i * 0.07}s` }}>
                  <span className="pf-stat__icon">{s.icon}</span>
                  <span className="pf-stat__value">{s.value}</span>
                  <span className="pf-stat__label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── Info Card ── */}
            <div className="pf-card">
              <div className="pf-card__title">Account Details</div>
              <div className="pf-detail-list">
                <div className="pf-detail">
                  <span className="pf-detail__key">Full Name</span>
                  <span className="pf-detail__val">{user?.name || "—"}</span>
                </div>
                <div className="pf-detail">
                  <span className="pf-detail__key">Student ID</span>
                  <span className="pf-detail__val">#{user?.id}</span>
                </div>
                <div className="pf-detail">
                  <span className="pf-detail__key">Role</span>
                  <span className="pf-detail__val">{role() === "ADMIN" ? "Administrator" : "Student"}</span>
                </div>
                <div className="pf-detail">
                  <span className="pf-detail__key">Total Complaints</span>
                  <span className="pf-detail__val">{stats.total}</span>
                </div>
                <div className="pf-detail">
                  <span className="pf-detail__key">Resolution Rate</span>
                  <span className="pf-detail__val" style={{ color: "#10b981", fontWeight: 700 }}>{resolveRate}%</span>
                </div>
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="pf-card">
              <div className="pf-card__title">Quick Actions</div>
              <div className="pf-actions">
                <button className="pf-action-btn" onClick={() => navigate("/student/new")}>
                  <span>📝</span> New Complaint
                </button>
                <button className="pf-action-btn" onClick={() => navigate("/student/complaints")}>
                  <span>📋</span> My Complaints
                </button>
                <button className="pf-action-btn" onClick={() => navigate("/student/track")}>
                  <span>📈</span> Track Status
                </button>
                <button className="pf-action-btn pf-action-btn--danger" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>

            {/* ── Creator credit ── */}
            <div className="pf-creator-credit" onClick={() => navigate("/creator")}>
              <span>Built with ❤️ by</span>
              <span className="pf-creator-name">Arijit Saha</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;