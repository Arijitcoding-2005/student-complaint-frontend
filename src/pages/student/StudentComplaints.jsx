import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import "./StudentComplaints.css";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", dot: "#F59E0B" },
  IN_REVIEW: { label: "In Review", color: "#3B82F6", bg: "rgba(59,130,246,0.1)", dot: "#3B82F6" },
  RESOLVED: { label: "Resolved", color: "#10B981", bg: "rgba(16,185,129,0.1)", dot: "#10B981" },
  REJECTED: { label: "Rejected", color: "#EF4444", bg: "rgba(239,68,68,0.1)", dot: "#EF4444" },
};
// Add these states at the top
const DEPARTMENT_HEADS = [
  { value: "CSE_HEAD", label: "🖥️ CSE Department Head" },
  { value: "ECE_HEAD", label: "⚡ ECE Department Head" },
  { value: "MECH_HEAD", label: "⚙️ Mech Department Head" },
  { value: "CIVIL_HEAD", label: "🏗️ Civil Department Head" },
  { value: "HOSTEL", label: "🏠 Hostel Warden" },
  { value: "EXAM_CELL", label: "📝 Examination Cell" },
  { value: "ADMIN", label: "🏛️ Administration" },
];


const CATEGORY_ICONS = {
  ACADEMIC: "📚",
  HOSTEL: "🏠",
  EXAM: "📝",
  OTHER: "💬",
};
const getDeptLabel = (value) =>
  DEPARTMENT_HEADS.find(d => d.value === value)?.label || value;

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status, color: "#94A3B8", bg: "rgba(148,163,184,0.1)", dot: "#94A3B8",
  };
  return (
    <span
      className="sc-badge"
      style={{ "--badge-color": cfg.color, "--badge-bg": cfg.bg }}
    >
      <span className="sc-badge-dot" />
      {cfg.label}
    </span>
  );
};

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [editModal, setEditModal] = useState(null); // complaint being edited
  const [withdrawId, setWithdrawId] = useState(null); // id being withdrawn
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get("/student/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="sc-root">
      <div className="sc-root__before" />
      <div className="sc-root__after" />
      {withdrawId && (
        <div className="sc-modal-overlay" onClick={() => setWithdrawId(null)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal__icon">🗑️</div>
            <h3>Withdraw Complaint?</h3>
            <p>This action cannot be undone. The complaint will be permanently withdrawn.</p>
            <div className="sc-modal__btns">
              <button className="sc-modal__btn--cancel" onClick={() => setWithdrawId(null)}>
                Cancel
              </button>
              <button
                className="sc-modal__btn--confirm"
                onClick={async () => {
                  try {
                    setActionLoading(withdrawId);
                    await api.delete(`/student/complaints/${withdrawId}`);
                    setComplaints(prev => prev.filter(c => c.id !== withdrawId));
                    setWithdrawId(null);
                  } catch (err) {
                    console.error(err);
                  } finally { setActionLoading(null); }
                }}
                disabled={actionLoading === withdrawId}
              >
                {actionLoading === withdrawId
                  ? <><span className="sc-mini-spinner" /> Withdrawing…</>
                  : "Yes, Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div className="sc-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="sc-modal sc-modal--edit" onClick={e => e.stopPropagation()}>
            <h3>✏️ Edit Complaint</h3>
            <p className="sc-modal__sub">Only PENDING complaints can be edited</p>

            <div className="sc-edit-field">
              <label>Category</label>
              <select
                value={editModal.title}
                onChange={e => setEditModal(prev => ({ ...prev, title: e.target.value }))}
              >
                <option value="ACADEMIC">📚 Academic</option>
                <option value="HOSTEL">🏠 Hostel</option>
                <option value="EXAM">📝 Exam</option>
                <option value="OTHER">💬 Other</option>
              </select>
            </div>

            <div className="sc-edit-field">
              <label>Description</label>
              <textarea
                value={editModal.description}
                onChange={e => setEditModal(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                maxLength={2000}
              />
              <span className="sc-edit-char">{editModal.description?.length}/2000</span>
            </div>

            <div className="sc-modal__btns">
              <button className="sc-modal__btn--cancel" onClick={() => setEditModal(null)}>
                Cancel
              </button>
              <button
                className="sc-modal__btn--save"
                onClick={async () => {
                  try {
                    setActionLoading("edit");
                    await api.put(`/student/complaints/${editModal.id}`, {
                      title: editModal.title,
                      description: editModal.description,
                      department: editModal.department,
                    });
                    setComplaints(prev =>
                      prev.map(c => c.id === editModal.id ? { ...c, ...editModal } : c)
                    );
                    setEditModal(null);
                  } catch (err) {
                    console.error(err);
                  } finally { setActionLoading(null); }
                }}
                disabled={actionLoading === "edit"}
              >
                {actionLoading === "edit"
                  ? <><span className="sc-mini-spinner" /> Saving…</>
                  : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sc-inner">
        {/* Header */}
        <div className="sc-header">
          <div>
            <h1 className="sc-title">My Complaints</h1>
            <p className="sc-subtitle">Track the status of your submitted grievances.</p>
          </div>
          <div className="sc-count">
            <span className="sc-count-num">{complaints.length}</span>
            <span className="sc-count-label">Total</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="sc-loading">
            <div className="sc-spinner" />
            <span>Loading complaints…</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="sc-empty">
            <div className="sc-empty-icon">📭</div>
            <h3>No Complaints Yet</h3>
            <p>You haven't filed any complaints. Use the Create Complaint page to get started.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="sc-table-head">
              <span>#</span>
              <span>Category</span>
              <span>Description</span>
              <span>Status</span>
              <span>Filed On</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            <div className="sc-list">
              {complaints.map((c, i) => (
                <div
                  className="sc-row"
                  key={c.id}
                  style={{ animationDelay: `${i * 0.05}s`, cursor: "pointer" }}
                  onClick={() => navigate(`/student/complaints/${c.id}`)}
                >
                  <span className="sc-cell sc-cell--id">#{c.id}</span>

                  <span className="sc-cell sc-cell--cat">
                    <span className="sc-cat-icon">
                      {CATEGORY_ICONS[c.title] || "💬"}
                    </span>
                    {c.title}
                  </span>

                  <span className="sc-cell sc-cell--desc">
                    {c.description}
                  </span>

                  <span className="sc-cell sc-cell--status">
                    <StatusBadge status={c.status} />
                    {c.assignedTo && (
                      <span style={{
                        display: "block", fontSize: "11px", marginTop: "4px",
                        color: "#a5b4fc", fontWeight: 600
                      }}>
                        {getDeptLabel(c.assignedTo)}
                      </span>
                    )}
                  </span>

                  <span className="sc-cell sc-cell--date">
                    {formatDate(c.createdAt)}
                  </span>
                  {c.status === "PENDING" && (
                    <div className="sc-row-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="sc-action-btn sc-action-btn--edit"
                        onClick={() => setEditModal(c)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="sc-action-btn sc-action-btn--withdraw"
                        onClick={() => setWithdrawId(c.id)}
                      >
                        🗑️ Withdraw
                      </button>
                    </div>
                  )}


                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentComplaints;