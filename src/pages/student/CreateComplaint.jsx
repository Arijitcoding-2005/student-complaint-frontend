import React, { useState } from "react";
import axios from "axios";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./CreateComplaint.css";

const categories = [
  {
    value: "ACADEMIC",
    label: "Academic",
    icon: "📚",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    desc: "Course content, faculty, grading issues",
  },
  {
    value: "HOSTEL",
    label: "Hostel",
    icon: "🏠",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    desc: "Room, facilities, maintenance issues",
  },
  {
    value: "EXAM",
    label: "Exam",
    icon: "📝",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    desc: "Scheduling, results, hall ticket issues",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: "💬",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    desc: "Any other concern or grievance",
  },
];

const CreateComplaint = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 500;

  const handleDescChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setDescription(val);
      setCharCount(val.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please select a category and describe your issue.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await api.post(
        "/student/complaints",
        { title, description, department },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate("/student"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many requests. Please wait a minute before trying again.");
      } else {
        setError(err.response?.data?.message || "Something went wrong.");
      }
      console.error(err);
      setError("Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const charcountClass = `cc-charcount${charCount > 450 ? " near" : ""}${charCount >= MAX_CHARS ? " full" : ""
    }`;

  return (
    <div className="cc-root">
      <div className="cc-card">
        {success && (
          <div className="cc-success">
            <div className="cc-success-icon">✅</div>
            <h3>Submitted Successfully</h3>
            <p>Redirecting you back to dashboard…</p>
          </div>
        )}

        <div className="cc-header">
          <div className="cc-header-accent" />
          <button className="cc-back" onClick={() => navigate("/student")}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2L4 7l5 5" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="cc-title">File a Complaint</h1>
          <p className="cc-subtitle">
            Your concern will be reviewed within 2–3 business days.
          </p>
        </div>

        <div className="cc-body">
          <form onSubmit={handleSubmit}>
            <div className="cc-section-label">Category</div>
            <div className="cc-grid">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`cc-cat-btn${title === cat.value ? " selected" : ""}`}
                  style={{ "--cat-color": cat.color, "--cat-bg": cat.bg }}
                  onClick={() => setTitle(cat.value)}
                >
                  <span className="cc-cat-icon">{cat.icon}</span>
                  <span className="cc-cat-name">{cat.label}</span>
                  <span className="cc-cat-desc">{cat.desc}</span>
                  <span className="cc-check">
                    <svg viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            <div className="cc-field">
              <label className="cc-label">Department</label>
              <select
                className="cc-select"
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="">Select department</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
                <option value="HOSTEL">Hostel</option>
                <option value="EXAM">Examination Cell</option>
                <option value="ADMIN">Administration</option>
              </select>
              <div className="cc-field-header">
                <span className="cc-section-label" style={{ marginTop: "18px" }}>
                  Description
                </span>
                <span className={charcountClass}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              <textarea
                className="cc-textarea"
                rows={6}
                placeholder="Describe your issue in detail — include dates, names, or any relevant context that can help resolve it faster."
                value={description}
                onChange={handleDescChange}
              />
            </div>

            {error && (
              <div className="cc-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="cc-submit"
              disabled={loading || !title || !description.trim()}
            >
              <span className="cc-submit-inner">
                {loading ? (
                  <>
                    <span className="cc-spinner" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 8h12M9 3l5 5-5 5" />
                    </svg>
                    Submit Complaint
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaint;