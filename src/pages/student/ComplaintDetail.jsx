import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./ComplaintDetail.css";

const STATUS_ORDER = ["PENDING", "IN_REVIEW", "IN_PROGRESS", "RESOLVED"];
// Helper — add this once near the top of each file
const getDeptLabel = (value) =>
  DEPARTMENT_HEADS.find(d => d.value === value)?.label || value;

const STATUS_CFG = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: "⏳", desc: "Your complaint has been received and is awaiting review." },
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
const CAT_COLORS = { ACADEMIC: "#6366F1", HOSTEL: "#F59E0B", EXAM: "#3B82F6", OTHER: "#10B981" };

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [printReady, setPrintReady] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/my");
      const found = res.data.find(c => String(c.id) === String(id));
      if (!found) navigate("/student/complaints");
      else setComplaint(found);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const copyId = () => {
    navigator.clipboard.writeText(`#${complaint.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    setPrintReady(true);
    setTimeout(() => { window.print(); setPrintReady(false); }, 100);
  };

  if (loading) return (
    <div className="cd-loading">
      <div className="cd-loading__spinner" />
      <span>Loading complaint…</span>
    </div>
  );

  if (!complaint) return null;

  const cfg = STATUS_CFG[complaint.status] || { label: complaint.status, color: "#94A3B8", icon: "❓" };
  const isRejected = complaint.status === "REJECTED";
  const currentIdx = STATUS_ORDER.indexOf(complaint.status);
  const catColor = CAT_COLORS[complaint.title] || "#6366F1";

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "N/A";

  return (
    <div className={`cd-root${printReady ? " cd-print" : ""}`}>
      <div className="cd-orb cd-orb--1" />
      <div className="cd-orb cd-orb--2" />

      <div className="cd-inner">

        {/* ── Top bar ── */}
        <div className="cd-topbar">
          <button className="cd-back" onClick={() => navigate("/student/complaints")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L4 7l5 5" strokeLinecap="round" />
            </svg>
            Back to My Complaints
          </button>
          <div className="cd-topbar__actions">
            <button className="cd-action-btn" onClick={copyId}>
              {copied ? "✅ Copied!" : "📋 Copy ID"}
            </button>
            <button className="cd-action-btn cd-action-btn--print" onClick={handlePrint}>
              🖨️ Print / Export
            </button>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="cd-hero" style={{ "--ac": cfg.color, "--cc": catColor }}>
          <div className="cd-hero__accent" />
          <div className="cd-hero__top">
            <div className="cd-hero__cat-badge" style={{ "--cc": catColor }}>
              <span className="cd-hero__cat-icon">{CAT_ICONS[complaint.title] || "💬"}</span>
              <span className="cd-hero__cat-name">{complaint.title}</span>
            </div>
            <span className="cd-status-badge" style={{ "--bc": cfg.color, "--bb": cfg.bg }}>
              <span className="cd-status-badge__dot" />
              {cfg.label}
            </span>
          </div>

          <div className="cd-hero__id" onClick={copyId}>
            Complaint #{complaint.id}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="4" width="7" height="7" rx="1.5" /><path d="M4 4V2.5A1.5 1.5 0 015.5 1H9.5A1.5 1.5 0 0111 2.5v4A1.5 1.5 0 019.5 8H8" />
            </svg>
          </div>

          <p className="cd-hero__desc">{complaint.description}</p>

          <div className="cd-hero__meta">
            {complaint.department && (
              <span className="cd-meta-pill">
                🏛️ {complaint.department}
              </span>
            )}
            <span className="cd-meta-pill">
              📅 {formatDate(complaint.createdAt)}
            </span>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="cd-section">
          <div className="cd-section__title">
            <span className="cd-section__icon">🗺️</span>
            Progress Timeline
          </div>

          {isRejected ? (
            <div className="cd-rejected">
              <div className="cd-rejected__icon">❌</div>
              <h4>Complaint Rejected</h4>
              <p>This complaint was reviewed but could not be actioned.</p>
              {complaint.remark && (
                <div className="cd-rejected__remark">
                  <span className="cd-rejected__remark-label">Admin's Reason</span>
                  <span className="cd-rejected__remark-text">💬 {complaint.remark}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="cd-timeline">
              {STATUS_ORDER.map((step, i) => {
                const scfg = STATUS_CFG[step];
                const stepIdx = STATUS_ORDER.indexOf(step);
                const isDone = stepIdx < currentIdx;
                const isActive = step === complaint.status;
                const isFuture = stepIdx > currentIdx;
                return (
                  <div
                    key={step}
                    className={`cd-tl-step${isDone ? " done" : ""}${isActive ? " active" : ""}${isFuture ? " future" : ""}`}
                    style={{ "--sc": scfg.color }}
                  >
                    <div className="cd-tl-step__left">
                      <div className="cd-tl-step__dot">
                        {isDone && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {isActive && <span className="cd-tl-step__pulse" />}
                      </div>
                      {i < STATUS_ORDER.length - 1 && (
                        <div className={`cd-tl-step__line${isDone ? " filled" : ""}`} />
                      )}
                    </div>
                    <div className="cd-tl-step__right">
                      <div className="cd-tl-step__label">
                        <span className="cd-tl-step__icon">{scfg.icon}</span>
                        <span className="cd-tl-step__name">{scfg.label}</span>
                        {isActive && <span className="cd-tl-step__now">Current</span>}
                        {isDone && <span className="cd-tl-step__done-tag">Done</span>}
                      </div>
                      {isActive && <p className="cd-tl-step__desc">{scfg.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Details Grid ── */}
        <div className="cd-section">
          <div className="cd-section__title">
            <span className="cd-section__icon">📄</span>
            Complaint Details
          </div>
          <div className="cd-details-grid">
            <div className="cd-detail">
              <span className="cd-detail__key">Complaint ID</span>
              <span className="cd-detail__val">#{complaint.id}</span>
            </div>
            <div className="cd-detail">
              <span className="cd-detail__key">Category</span>
              <span className="cd-detail__val">{CAT_ICONS[complaint.title]} {complaint.title}</span>
            </div>
            <div className="cd-detail">
              <span className="cd-detail__key">Department</span>
              <span className="cd-detail__val">{complaint.department || "—"}</span>
            </div>
            <div className="cd-detail">
              <span className="cd-detail__key">Current Status</span>
              <span className="cd-detail__val" style={{ color: cfg.color, fontWeight: 700 }}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
               {complaint.assignedTo && (
              <div className="cd-detail">
                <span className="cd-detail__key">Handled By</span>
                <span className="cd-detail__val" style={{ color: "#a5b4fc" }}>
                  {getDeptLabel(complaint.assignedTo)}
                </span>
              </div>
            )}
            <div className="cd-detail cd-detail--full">
              <span className="cd-detail__key">Filed On</span>
              <span className="cd-detail__val">{formatDate(complaint.createdAt)}</span>
            </div>
            <div className="cd-detail cd-detail--full">
              <span className="cd-detail__key">Description</span>
              <span className="cd-detail__val cd-detail__val--desc">{complaint.description}</span>
            </div>
         
          </div>
        </div>

        {/* ── Admin Remark ── */}
        {complaint.remark && !isRejected && (
          <div className="cd-section">
            <div className="cd-section__title">
              <span className="cd-section__icon">💬</span>
              Admin Remark
            </div>
            <div className="cd-remark">
              <div className="cd-remark__avatar">A</div>
              <div className="cd-remark__bubble">
                <div className="cd-remark__from">Admin</div>
                <p className="cd-remark__text">{complaint.remark}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Actions ── */}
        <div className="cd-footer-actions">
          <button className="cd-footer-btn cd-footer-btn--back" onClick={() => navigate("/student/complaints")}>
            ← Back to Complaints
          </button>
          <button className="cd-footer-btn cd-footer-btn--track" onClick={() => navigate("/student/track")}>
            📍 View in Track Status
          </button>
          <button className="cd-footer-btn cd-footer-btn--print" onClick={handlePrint}>
            🖨️ Print / Export PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;