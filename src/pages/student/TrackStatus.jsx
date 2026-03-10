import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./TrackStatus.css";

const token = () => localStorage.getItem("token");

const STATUS_ORDER = ["PENDING", "IN_REVIEW", "IN_PROGRESS", "RESOLVED"];
// Helper — add this once near the top of each file
const getDeptLabel = (value) =>
  DEPARTMENT_HEADS.find(d => d.value === value)?.label || value;

const STATUS_CFG = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: "⏳", desc: "Your complaint has been received and is waiting to be reviewed." },
  IN_REVIEW: { label: "In Review", color: "#6366F1", bg: "rgba(99,102,241,0.1)", icon: "🔍", desc: "An admin is currently reviewing your complaint." },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", icon: "🔄", desc: "Action is being taken to resolve your complaint." },
  RESOLVED: { label: "Resolved", color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: "✅", desc: "Your complaint has been successfully resolved." },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: "❌", desc: "Your complaint was reviewed but could not be actioned." },
};
const DEPARTMENT_HEADS = [
  { value: "CSE_HEAD", label: "🖥️ CSE Department Head" },
  { value: "ECE_HEAD", label: "⚡ ECE Department Head" },
  { value: "MECH_HEAD", label: "⚙️ Mech Department Head" },
  { value: "CIVIL_HEAD", label: "🏗️ Civil Department Head" },
  { value: "HOSTEL", label: "🏠 Hostel Warden" },
  { value: "EXAM_CELL", label: "📝 Examination Cell" },
  { value: "ADMIN", label: "🏛️ Administration" },
];

const CAT_ICONS = { ACADEMIC: "📚", HOSTEL: "🏠", EXAM: "📝", OTHER: "💬" };

const StatusStep = ({ step, currentStatus, index }) => {
  const cfg = STATUS_CFG[step] || {};
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const stepIdx = STATUS_ORDER.indexOf(step);
  const isDone = stepIdx < currentIdx;
  const isActive = step === currentStatus;
  const isPending = stepIdx > currentIdx;

  return (
    <div className={`ts-step${isDone ? " done" : ""}${isActive ? " active" : ""}${isPending ? " pending" : ""}`}>
      <div className="ts-step__line-top" />
      <div className="ts-step__dot" style={{ "--sc": cfg.color }}>
        {isDone ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isActive ? (
          <span className="ts-step__pulse" style={{ "--sc": cfg.color }} />
        ) : null}
      </div>
      <div className="ts-step__line-bot" />
      <div className="ts-step__info">
        <span className="ts-step__icon">{cfg.icon}</span>
        <span className="ts-step__label" style={isActive ? { color: cfg.color } : {}}>{cfg.label}</span>
        {isActive && <span className="ts-step__desc">{cfg.desc}</span>}
      </div>
    </div>
  );
};

const ComplaintCard = ({ c, isExpanded, onToggle }) => {
  const cfg = STATUS_CFG[c.status] || { label: c.status, color: "#94A3B8", bg: "rgba(148,163,184,0.1)", icon: "❓" };
  const isRejected = c.status === "REJECTED";

  return (
    <div
      className={`ts-card${isExpanded ? " ts-card--open" : ""}`}
      style={{ "--accent": cfg.color }}
    >
      {/* Card header — always visible */}
      <div className="ts-card__head" onClick={onToggle}>
        <div className="ts-card__left">
          <span className="ts-card__cat-icon">{CAT_ICONS[c.title] || "💬"}</span>
          <div>
            <span className="ts-card__cat">{c.title}</span>
            <p className="ts-card__desc">{c.description}</p>
          </div>
        </div>
        <div className="ts-card__right">
          <span className="ts-badge" style={{ "--bc": cfg.color, "--bb": cfg.bg }}>
            <span className="ts-badge__dot" />
            {cfg.label}
          </span>
          <span className="ts-card__date">
            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <span className={`ts-card__chevron${isExpanded ? " open" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5l4 4 4-4" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Expanded: timeline + details */}
      {isExpanded && (
        <div className="ts-card__body">
          {isRejected ? (
            <div className="ts-rejected">
              <div className="ts-rejected__icon">❌</div>
              <h4>Complaint Rejected</h4>
              <p>This complaint was reviewed but could not be actioned. Please contact the admin for more details.</p>
            </div>
          ) : (
            <>
              <div className="ts-timeline-label">Progress Timeline</div>
              <div className="ts-timeline">
                {STATUS_ORDER.map((step, i) => (
                  <StatusStep key={step} step={step} currentStatus={c.status} index={i} />
                ))}
              </div>
            </>
          )}

          <div className="ts-meta">
            <div className="ts-meta__item">
              <span className="ts-meta__key">Complaint ID</span>
              <span className="ts-meta__val">#{c.id}</span>
            </div>
            <div className="ts-meta__item">
              <span className="ts-meta__key">Category</span>
              <span className="ts-meta__val">{CAT_ICONS[c.title]} {c.title}</span>
            </div>
            <div className="ts-meta__item">
              <span className="ts-meta__key">Filed On</span>
              <span className="ts-meta__val">
                {new Date(c.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="ts-meta__item">
              <span className="ts-meta__key">Current Status</span>
              <span className="ts-meta__val" style={{ color: cfg.color, fontWeight: 700 }}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            {c.remark && (
              <div className="ts-meta__item" style={{ gridColumn: "1 / -1" }}>
                <span className="ts-meta__key">Admin Remark</span>
                <span className="ts-meta__val" style={{ color: "#a5b4fc", fontStyle: "italic" }}>
                  💬 {c.remark}
                </span>
              </div>
            )}
            {c.assignedTo && (
              <div className="ts-meta__item" style={{ gridColumn: "1 / -1" }}>
                <span className="ts-meta__key">Handled By</span>
                <span className="ts-meta__val" style={{ color: "#a5b4fc", fontWeight: 700 }}>
                  {getDeptLabel(c.assignedTo)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TrackStatus = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/my", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setComplaints(res.data);
      if (res.data.length > 0) setExpanded(res.data[res.data.length - 1].id);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const FILTERS = ["ALL", "PENDING", "IN_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];

  const filtered = filter === "ALL"
    ? complaints
    : complaints.filter((c) => c.status === filter);

  const counts = {};
  FILTERS.forEach((f) => {
    counts[f] = f === "ALL" ? complaints.length : complaints.filter((c) => c.status === f).length;
  });

  // Summary stats
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
  const pending = complaints.filter((c) => c.status === "PENDING" || c.status === "IN_REVIEW" || c.status === "IN_PROGRESS").length;
  const rejected = complaints.filter((c) => c.status === "REJECTED").length;
  const resolveRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  return (
    <div className="ts-root">
      <div className="ts-orb ts-orb--1" />
      <div className="ts-orb ts-orb--2" />

      <div className="ts-inner">

        {/* ── Header ── */}
        <div className="ts-header">
          <div>
            <button className="ts-back" onClick={() => navigate("/student")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2L4 7l5 5" strokeLinecap="round" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="ts-title">Track Complaint Status</h1>
            <p className="ts-subtitle">Monitor the progress of all your submitted complaints</p>
          </div>
          <button className="ts-refresh" onClick={fetchComplaints}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 7A6 6 0 0113 7M13 3v4H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Summary Strip ── */}
        {!loading && complaints.length > 0 && (
          <div className="ts-summary">
            <div className="ts-summary__item">
              <span className="ts-summary__num">{complaints.length}</span>
              <span className="ts-summary__label">Total</span>
            </div>
            <div className="ts-summary__divider" />
            <div className="ts-summary__item">
              <span className="ts-summary__num" style={{ color: "#F59E0B" }}>{pending}</span>
              <span className="ts-summary__label">Active</span>
            </div>
            <div className="ts-summary__divider" />
            <div className="ts-summary__item">
              <span className="ts-summary__num" style={{ color: "#10B981" }}>{resolved}</span>
              <span className="ts-summary__label">Resolved</span>
            </div>
            <div className="ts-summary__divider" />
            <div className="ts-summary__item">
              <span className="ts-summary__num" style={{ color: "#EF4444" }}>{rejected}</span>
              <span className="ts-summary__label">Rejected</span>
            </div>
            <div className="ts-summary__divider" />
            <div className="ts-summary__item">
              <div className="ts-progress-ring">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="#10B981" strokeWidth="3"
                    strokeDasharray={`${resolveRate * 0.942} 94.2`}
                    strokeDashoffset="23.55"
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <span>{resolveRate}%</span>
              </div>
              <span className="ts-summary__label">Resolved Rate</span>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        {!loading && complaints.length > 0 && (
          <div className="ts-filters">
            {FILTERS.map((f) => counts[f] > 0 || f === "ALL" ? (
              <button
                key={f}
                className={`ts-filter-btn${filter === f ? " active" : ""}`}
                style={filter === f && f !== "ALL" ? { "--fc": STATUS_CFG[f]?.color } : {}}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All" : STATUS_CFG[f]?.label}
                <span className="ts-filter-count">{counts[f]}</span>
              </button>
            ) : null)}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="ts-loading">
            <div className="ts-spinner" />
            <span>Fetching your complaints…</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty__icon">📭</div>
            <h3>No Complaints Found</h3>
            <p>You haven't filed any complaints yet.</p>
            <button className="ts-empty__btn" onClick={() => navigate("/student/new")}>
              File Your First Complaint
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ts-empty">
            <div className="ts-empty__icon">🔍</div>
            <h3>No {STATUS_CFG[filter]?.label} Complaints</h3>
            <p>You have no complaints with this status.</p>
          </div>
        ) : (
          <div className="ts-list">
            {[...filtered].reverse().map((c, i) => (
              <div key={c.id} style={{ animationDelay: `${i * 0.05}s` }} className="ts-list__item">
                <ComplaintCard
                  c={c}
                  isExpanded={expanded === c.id}
                  onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackStatus;