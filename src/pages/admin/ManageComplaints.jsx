import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageComplaints.css";
import api from "../../api/axios";

const token = () => localStorage.getItem("token");

const STATUS_CFG = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  IN_PROGRESS: { label: "In Progress", color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  RESOLVED: { label: "Resolved", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
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

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, color: "#94A3B8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span className="mc-badge" style={{ "--bc": cfg.color, "--bb": cfg.bg }}>
      <span className="mc-badge__dot" />
      {cfg.label}
    </span>
  );
};

const FILTERS = ["ALL", "PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"];

/* ── Remark Modal ── */
const RemarkModal = ({ complaint, mode, onConfirm, onClose }) => {
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isReject = mode === "REJECTED";

  const handleSubmit = async () => {
    if (isReject && !remark.trim()) return;
    setSubmitting(true);
    await onConfirm(complaint.id, mode, remark.trim());
    setSubmitting(false);
  };

  return (
    <div className="mc-modal-overlay" onClick={onClose}>
      <div className="mc-modal" onClick={e => e.stopPropagation()}>
        <div className="mc-modal__header" style={{ "--mc": isReject ? "#EF4444" : "#10B981" }}>
          <span className="mc-modal__icon">{isReject ? "❌" : "✅"}</span>
          <div>
            <h3 className="mc-modal__title">
              {isReject ? "Reject Complaint" : "Resolve Complaint"}
            </h3>
            <p className="mc-modal__sub">#{complaint.id} · {complaint.title}</p>
          </div>
          <button className="mc-modal__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mc-modal__body">
          <p className="mc-modal__complaint-desc">"{complaint.description}"</p>

          <div className="mc-modal__field">
            <label className="mc-modal__label">
              {isReject ? "Reason for rejection" : "Resolution remark"}
              {isReject && <span className="mc-modal__required">Required</span>}
              {!isReject && <span className="mc-modal__optional">Optional</span>}
            </label>
            <textarea
              className="mc-modal__textarea"
              placeholder={isReject
                ? "Explain why this complaint is being rejected…"
                : "Add a note about how this was resolved…"}
              value={remark}
              onChange={e => setRemark(e.target.value)}
              maxLength={500}
              rows={4}
              autoFocus
            />
            <div className="mc-modal__char">{remark.length}/500</div>
          </div>

          {isReject && !remark.trim() && (
            <div className="mc-modal__warn">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="6.5" cy="6.5" r="5.5" />
                <line x1="6.5" y1="4" x2="6.5" y2="7" strokeLinecap="round" />
                <circle cx="6.5" cy="9.5" r="0.5" fill="currentColor" />
              </svg>
              A reason is required when rejecting a complaint.
            </div>
          )}
        </div>

        <div className="mc-modal__footer">
          <button className="mc-modal__btn mc-modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`mc-modal__btn${isReject ? " mc-modal__btn--reject" : " mc-modal__btn--resolve"}`}
            onClick={handleSubmit}
            disabled={submitting || (isReject && !remark.trim())}
          >
            {submitting
              ? <><span className="mc-mini-spinner" /> Processing…</>
              : isReject ? "❌ Confirm Reject" : "✅ Confirm Resolve"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ── */
const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { complaint, mode }
  const [assignModal, setAssignModal] = useState(null); // complaint
  const [assignTo, setAssignTo] = useState("");

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/complaints', {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setComplaints(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status, remark = "") => {
    try {
      setUpdating(id + status);
      // Update status
      await api.patch(
        `/admin/complaints/${id}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      // If remark provided, send it
      if (remark) {
        await api.patch(
          `/admin/complaints/${id}/remark`,
          { remark },
          { headers: { Authorization: `Bearer ${token()}` } }
        );
      }
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, status, remark } : c)
      );
      setModal(null);
      showToast(
        status === "RESOLVED" ? "✅ Complaint resolved" :
          status === "REJECTED" ? "❌ Complaint rejected" :
            "🔄 Marked as In Progress"
      );
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const filtered = complaints.filter(c => {
    const matchFilter = filter === "ALL" || c.status === filter;
    const matchSearch = !search.trim() ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {};
  FILTERS.forEach(f => {
    counts[f] = f === "ALL" ? complaints.length : complaints.filter(c => c.status === f).length;
  });
  const assignComplaint = async () => {
    if (!assignTo) return;
    try {
      setUpdating(assignModal.id + "ASSIGN");
      await api.patch(`/admin/complaints/${assignModal.id}/assign`, { assignedTo: assignTo });
      setComplaints(prev =>
        prev.map(c => c.id === assignModal.id
          ? { ...c, assignedTo: assignTo, status: c.status === "PENDING" ? "IN_REVIEW" : c.status }
          : c
        )
      );
      setAssignModal(null);
      setAssignTo("");
      showToast("📌 Complaint assigned successfully");
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  return (
    <div className="mc-root">
      <div className="mc-orb mc-orb--1" />
      <div className="mc-orb mc-orb--2" />

      {/* Toast */}
      {toast && <div className="mc-toast">{toast}</div>}

      {/* Remark Modal */}
      {modal && (
        <RemarkModal
          complaint={modal.complaint}
          mode={modal.mode}
          onConfirm={updateStatus}
          onClose={() => setModal(null)}
        />
      )}
      {assignModal && (
        <div className="mc-modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal__header" style={{ "--mc": "#6366F1" }}>
              <span className="mc-modal__icon">📌</span>
              <div>
                <h3 className="mc-modal__title">Assign Complaint</h3>
                <p className="mc-modal__sub">#{assignModal.id} · {assignModal.title}</p>
              </div>
              <button className="mc-modal__close" onClick={() => setAssignModal(null)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mc-modal__body">
              <p className="mc-modal__complaint-desc">"{assignModal.description}"</p>
              <div className="mc-modal__field">
                <label className="mc-modal__label">
                  Assign To
                  <span className="mc-modal__required">Required</span>
                </label>
                <div className="mc-assign-grid">
                  {DEPARTMENT_HEADS.map(d => (
                    <div
                      key={d.value}
                      className={`mc-assign-option${assignTo === d.value ? " selected" : ""}`}
                      onClick={() => setAssignTo(d.value)}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mc-modal__footer">
              <button className="mc-modal__btn mc-modal__btn--cancel" onClick={() => setAssignModal(null)}>
                Cancel
              </button>
              <button
                className="mc-modal__btn mc-modal__btn--assign"
                onClick={assignComplaint}
                disabled={!assignTo || updating === assignModal.id + "ASSIGN"}
              >
                {updating === assignModal.id + "ASSIGN"
                  ? <><span className="mc-mini-spinner" /> Assigning…</>
                  : "📌 Confirm Assign"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mc-inner">

        {/* Header */}
        <div className="mc-header">
          <div>
            <h1 className="mc-title">Manage Complaints</h1>
            <p className="mc-subtitle">Review, update and resolve student grievances</p>
          </div>
          <button className="mc-refresh-btn" onClick={fetchComplaints}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 7A6 6 0 0113 7M13 3v4H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="mc-toolbar">
          <div className="mc-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`mc-filter-btn${filter === f ? " active" : ""}`}
                style={filter === f && f !== "ALL" ? { "--fc": STATUS_CFG[f]?.color } : {}}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All" : STATUS_CFG[f]?.label}
                <span className="mc-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="mc-search-wrap">
            <svg className="mc-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10 10l3 3" strokeLinecap="round" />
            </svg>
            <input
              className="mc-search"
              type="text"
              placeholder="Search title, description or student…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="mc-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mc-loading"><div className="mc-spinner" /><span>Loading complaints…</span></div>
        ) : filtered.length === 0 ? (
          <div className="mc-empty">
            <div className="mc-empty__icon">📭</div>
            <h3>No complaints found</h3>
            <p>{search || filter !== "ALL" ? "Try adjusting your filters." : "No complaints submitted yet."}</p>
          </div>
        ) : (
          <>
            <div className="mc-tbl-head">
              <span>Category</span>
              <span>Description</span>
              <span>Student</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            <div className="mc-list">
              {filtered.map((c, i) => (
                <div className="mc-row" key={c.id} style={{ animationDelay: `${i * 0.04}s` }}>

                  {/* Category */}
                  <div className="mc-cell mc-cell--cat">
                    <span className="mc-cat-icon">{CAT_ICONS[c.title] || "💬"}</span>
                    <span className="mc-cat-name">{c.title}</span>
                  </div>

                  {/* Description + remark */}
                  <div className="mc-cell mc-cell--desc-wrap">
                    <span className="mc-cell mc-cell--desc" title={c.description}>{c.description}</span>
                    {c.remark && (
                      <span className="mc-remark" title={c.remark}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M1 1h9v6H6.5L4 9.5V7H1z" strokeLinejoin="round" />
                        </svg>
                        {c.remark}
                      </span>
                    )}
                    {c.assignedTo && (
                      <span className="mc-assigned">
                        📌 {DEPARTMENT_HEADS.find(d => d.value === c.assignedTo)?.label || c.assignedTo}
                      </span>
                    )}
                  </div>

                  {/* Student */}
                  <div className="mc-cell mc-cell--student">
                    <span className="mc-avatar">{(c.name || "?")[0].toUpperCase()}</span>
                    {c.name || <span className="mc-na">N/A</span>}
                  </div>

                  {/* Status */}
                  <div className="mc-cell"><Badge status={c.status} /></div>

                  {/* Actions */}
                  <div className="mc-cell mc-cell--actions">

                    {/* Assign — show for any non-closed complaint */}
                    {c.status !== "RESOLVED" && c.status !== "REJECTED" && (
                      <button
                        className="mc-action-btn mc-action-btn--assign"
                        onClick={() => { setAssignModal(c); setAssignTo(c.assignedTo || ""); }}
                      >
                        📌 {c.assignedTo ? "Reassign" : "Assign"}
                      </button>
                    )}

                    {/* In Progress — only for PENDING and IN_REVIEW */}
                    {c.status !== "IN_PROGRESS" && c.status !== "RESOLVED" && c.status !== "REJECTED" && (
                      <button
                        className="mc-action-btn mc-action-btn--progress"
                        onClick={() => updateStatus(c.id, "IN_PROGRESS")}
                        disabled={updating === c.id + "IN_PROGRESS"}
                      >
                        {updating === c.id + "IN_PROGRESS" ? <span className="mc-mini-spinner" /> : "🔄"}
                        In Progress
                      </button>
                    )}

                    {/* Resolve */}
                    {c.status !== "RESOLVED" && c.status !== "REJECTED" && (
                      <button
                        className="mc-action-btn mc-action-btn--resolve"
                        onClick={() => setModal({ complaint: c, mode: "RESOLVED" })}
                      >
                        ✅ Resolve
                      </button>
                    )}

                    {/* Reject */}
                    {c.status !== "RESOLVED" && c.status !== "REJECTED" && (
                      <button
                        className="mc-action-btn mc-action-btn--reject"
                        onClick={() => setModal({ complaint: c, mode: "REJECTED" })}
                      >
                        ❌ Reject
                      </button>
                    )}

                    {/* Closed label */}
                    {(c.status === "RESOLVED" || c.status === "REJECTED") && (
                      <span className="mc-done">
                        {c.status === "RESOLVED" ? "Closed" : "Rejected"}
                      </span>
                    )}

                  </div>
                </div>
              ))}
            </div>

            <div className="mc-footer">
              Showing <strong>{filtered.length}</strong> of <strong>{complaints.length}</strong> complaints
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageComplaints;