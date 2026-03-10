import { useEffect, useState } from "react";
import api from "../../api/axios";


import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import "./AdminAnalytics.css";

const token = () => localStorage.getItem("token");

const STATUS_CFG = {
  PENDING:   { label: "Pending",     color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  IN_REVIEW: { label: "In Review",   color: "#3B82F6", bg: "rgba(59,130,246,0.1)"  },
  RESOLVED:  { label: "Resolved",    color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  REJECTED:  { label: "Rejected",    color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
};


const CAT_ICONS = { ACADEMIC:"📚", HOSTEL:"🏠", EXAM:"📝", OTHER:"💬" };

/* ── animated counter ── */
const useCounter = (target) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let cur = 0;
    const step = target / 40;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.ceil(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target]);
  return val;
};

/* ── Stat Card ── */
const StatCard = ({ title, value = 0, icon, accent, delay = 0 }) => {
  const display = useCounter(value);
  return (
    <div className="aa-stat" style={{ "--accent": accent, animationDelay: `${delay}s` }}>
      <div className="aa-stat__top">
        <span className="aa-stat__icon">{icon}</span>
        <span className="aa-stat__title">{title}</span>
      </div>
      <div className="aa-stat__value">{display}</div>
      <div className="aa-stat__bar">
        <div className="aa-stat__bar-fill" />
      </div>
    </div>
  );
};

/* ── Status Badge ── */
const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status, color: "#94A3B8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span className="aa-badge" style={{ "--bc": cfg.color, "--bb": cfg.bg }}>
      <span className="aa-badge__dot" />
      {cfg.label}
    </span>
  );
};

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="aa-tooltip">
      <span className="aa-tooltip__label">{payload[0].name}</span>
      <span className="aa-tooltip__value">{payload[0].value}</span>
    </div>
  );
};

/* ══════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const [data, setData]           = useState(null);
  const [studentId, setStudentId] = useState("");
  const [complaints, setComplaints] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setData(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) { setSearchErr("Please enter a student ID."); return; }
    try {
      setSearching(true);
      setSearchErr("");
      setComplaints(null);
      const res = await api.get(`/admin/students/${studentId.trim()}/complaints`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setComplaints(res.data);
      if (res.data.length === 0) setSearchErr("No complaints found for this student.");
    } catch (e) {
      setSearchErr(e?.response?.status === 404
        ? "Student not found."
        : "Failed to fetch complaints. Please try again.");
    } finally { setSearching(false); }
  };

  const clearSearch = () => {
    setStudentId("");
    setComplaints(null);
    setSearchErr("");
  };

  if (!data) return (
    <div className="aa-loading">
      <div className="aa-loading__spinner" />
      <span>Loading dashboard…</span>
    </div>
  );

  const pieData = [
    { name: "Pending",     value: data.pending    },
    { name: "In Progress", value: data.inProgress },
    { name: "Resolved",    value: data.resolved   },
  ];
  const PIE_COLORS = ["#F59E0B", "#3B82F6", "#10B981"];

  const barData = [
    { name: "Total",       value: data.total      },
    { name: "Pending",     value: data.pending    },
    { name: "In Progress", value: data.inProgress },
    { name: "Resolved",    value: data.resolved   },
  ];
  const BAR_COLORS = ["#6366F1", "#F59E0B", "#3B82F6", "#10B981"];

  return (
    <div className="aa-root">
      <div className="aa-orb aa-orb--1" />
      <div className="aa-orb aa-orb--2" />

      <div className="aa-inner">

        {/* ── Header ── */}
        <div className="aa-header">
          <div>
            <h1 className="aa-title">Analytics Dashboard</h1>
            <p className="aa-subtitle">
              Live overview · Auto-refreshes every 30s ·{" "}
              <span className="aa-refresh-time">
                Last updated {lastRefresh.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <button className="aa-refresh-btn" onClick={() => { fetchAnalytics(); setLastRefresh(new Date()); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 7A6 6 0 0113 7M13 3v4H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="aa-stats">
          <StatCard title="Total Complaints" value={data.total}      icon="📋" accent="#6366F1" delay={0}    />
          <StatCard title="Pending"          value={data.pending}    icon="⏳" accent="#F59E0B" delay={0.05} />
          <StatCard title="In Progress"      value={data.inProgress} icon="🔄" accent="#3B82F6" delay={0.1}  />
          <StatCard title="Resolved"         value={data.resolved}   icon="✅" accent="#10B981" delay={0.15} />
        </div>

        {/* ── Charts ── */}
        <div className="aa-charts">
          {/* Pie */}
          <div className="aa-card">
            <div className="aa-card__header">
              <span className="aa-card__title">Distribution</span>
              <span className="aa-card__tag">Pie</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div className="aa-card">
            <div className="aa-card__header">
              <span className="aa-card__title">Breakdown</span>
              <span className="aa-card__tag">Bar</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Student Complaints Lookup ── */}
        <div className="aa-card aa-lookup">
          <div className="aa-card__header">
            <div>
              <span className="aa-card__title">Student Complaint Lookup</span>
              <p className="aa-card__desc">Search all complaints filed by a specific student ID</p>
            </div>
            {complaints && (
              <button className="aa-clear-btn" onClick={clearSearch}>Clear</button>
            )}
          </div>

          <form className="aa-search-form" onSubmit={handleSearch}>
            <div className="aa-search-wrap">
              <span className="aa-search-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3 3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                className="aa-search-input"
                type="number"
                placeholder="Enter student ID (e.g. 42)"
                value={studentId}
                onChange={(e) => { setStudentId(e.target.value); setSearchErr(""); }}
                min="1"
              />
            </div>
            <button className="aa-search-btn" type="submit" disabled={searching}>
              {searching ? <span className="aa-mini-spinner" /> : "Search"}
            </button>
          </form>

          {searchErr && (
            <div className="aa-search-err">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="7" cy="7" r="6" />
                <line x1="7" y1="4.5" x2="7" y2="7.5" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.6" fill="currentColor" />
              </svg>
              {searchErr}
            </div>
          )}

          {complaints && complaints.length > 0 && (
            <div className="aa-results">
              <div className="aa-results__meta">
                Showing <strong>{complaints.length}</strong> complaint{complaints.length !== 1 ? "s" : ""} for Student #{studentId}
              </div>

              {/* Table head */}
              <div className="aa-tbl-head">
                <span>#</span>
                <span>Category</span>
                <span>Description</span>
                <span>Status</span>
                <span>Filed On</span>
              </div>

              {/* Rows */}
              <div className="aa-tbl-body">
                {complaints.map((c, i) => (
                  <div className="aa-tbl-row" key={c.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <span className="aa-tbl-cell aa-tbl-cell--id">#{c.id}</span>
                    <span className="aa-tbl-cell aa-tbl-cell--cat">
                      <span>{CAT_ICONS[c.title] || "💬"}</span>
                      {c.title}
                    </span>
                    <span className="aa-tbl-cell aa-tbl-cell--desc">{c.description}</span>
                    <span className="aa-tbl-cell"><Badge status={c.status} /></span>
                    <span className="aa-tbl-cell aa-tbl-cell--date">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;