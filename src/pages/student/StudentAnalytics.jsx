import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
  RadialBarChart, RadialBar,
} from "recharts";
import "./StudentAnalytics.css";

const STATUS_CFG = {
  PENDING:     { color: "#F59E0B", label: "Pending"     },
  IN_PROGRESS: { color: "#3B82F6", label: "In Progress" },
  IN_REVIEW:   { color: "#6366F1", label: "In Review"   },
  RESOLVED:    { color: "#10B981", label: "Resolved"    },
  REJECTED:    { color: "#EF4444", label: "Rejected"    },
};

const CAT_COLORS = {
  ACADEMIC: "#6366F1",
  HOSTEL:   "#F59E0B",
  EXAM:     "#3B82F6",
  OTHER:    "#10B981",
};

const CAT_ICONS = { ACADEMIC:"📚", HOSTEL:"🏠", EXAM:"📝", OTHER:"💬" };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sa-tooltip">
      {label && <div className="sa-tooltip__label">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="sa-tooltip__row">
          <span className="sa-tooltip__dot" style={{ background: p.color || p.fill }} />
          <span className="sa-tooltip__name">{p.name}</span>
          <span className="sa-tooltip__val">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Animated counter ── */
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
const StatCard = ({ icon, label, value, accent, delay }) => {
  const display = useCounter(value);
  return (
    <div className="sa-stat" style={{ "--ac": accent, animationDelay: delay }}>
      <div className="sa-stat__top">
        <span className="sa-stat__icon">{icon}</span>
        <span className="sa-stat__label">{label}</span>
      </div>
      <div className="sa-stat__value">{display}</div>
      <div className="sa-stat__bar"><div className="sa-stat__bar-fill" /></div>
    </div>
  );
};

/* ══════════════ MAIN ══════════════ */
const StudentAnalytics = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/my");
      setComplaints(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Derived data ── */
  const total      = complaints.length;
  const resolved   = complaints.filter(c => c.status === "RESOLVED").length;
  const pending    = complaints.filter(c => c.status === "PENDING").length;
  const inProgress = complaints.filter(c => c.status === "IN_PROGRESS" || c.status === "IN_REVIEW").length;
  const rejected   = complaints.filter(c => c.status === "REJECTED").length;
  const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  /* Status pie data */
  const statusData = Object.entries(STATUS_CFG)
    .map(([key, cfg]) => ({
      name: cfg.label,
      value: complaints.filter(c => c.status === key).length,
      color: cfg.color,
    }))
    .filter(d => d.value > 0);

  /* Category bar data */
  const categoryData = ["ACADEMIC","HOSTEL","EXAM","OTHER"].map(cat => ({
    name: `${CAT_ICONS[cat]} ${cat}`,
    count: complaints.filter(c => c.title === cat).length,
    color: CAT_COLORS[cat],
  }));

  /* Monthly trend (last 6 months) */
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthComplaints = complaints.filter(c => {
      if (!c.createdAt) return false;
      const cd = new Date(c.createdAt);
      return cd.getMonth() === m && cd.getFullYear() === y;
    });
    return {
      month: MONTHS[m],
      total:    monthComplaints.length,
      resolved: monthComplaints.filter(c => c.status === "RESOLVED").length,
      pending:  monthComplaints.filter(c => c.status === "PENDING").length,
    };
  });

  /* Resolution time (days) per resolved complaint */
  const resolutionTimes = complaints
    .filter(c => c.status === "RESOLVED" && c.createdAt)
    .map((c, i) => ({
      name: `#${c.id}`,
      days: Math.max(1, Math.floor((Date.now() - new Date(c.createdAt)) / 86400000)),
    }))
    .slice(-8);

  /* Radial data for resolve rate */
  const radialData = [{ name: "Resolved", value: resolveRate, fill: "#10B981" }];

  if (loading) return (
    <div className="sa-loading">
      <div className="sa-loading__spinner" />
      <span>Analysing your complaints…</span>
    </div>
  );

  return (
    <div className="sa-root">
      <div className="sa-orb sa-orb--1" />
      <div className="sa-orb sa-orb--2" />
      <div className="sa-orb sa-orb--3" />

      <div className="sa-inner">

        {/* ── Header ── */}
        <div className="sa-header">
          <div>
            <button className="sa-back" onClick={() => navigate("/student")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 2L4 7l5 5" strokeLinecap="round" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="sa-title">My Complaint Analytics</h1>
            <p className="sa-subtitle">Visual insights into your complaint history and trends</p>
          </div>
          <button className="sa-refresh" onClick={fetchData}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 7A6 6 0 0113 7M13 3v4H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>

        {total === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty__icon">📊</div>
            <h3>No Data Yet</h3>
            <p>File your first complaint to start seeing analytics.</p>
            <button className="sa-empty__btn" onClick={() => navigate("/student/new")}>
              File a Complaint
            </button>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="sa-stats">
              <StatCard icon="📋" label="Total Filed"   value={total}      accent="#6366F1" delay="0s"     />
              <StatCard icon="⏳" label="Pending"       value={pending}    accent="#F59E0B" delay="0.06s"  />
              <StatCard icon="🔄" label="In Progress"   value={inProgress} accent="#3B82F6" delay="0.12s"  />
              <StatCard icon="✅" label="Resolved"      value={resolved}   accent="#10B981" delay="0.18s"  />
              <StatCard icon="❌" label="Rejected"      value={rejected}   accent="#EF4444" delay="0.24s"  />
            </div>

            {/* ── Resolve Rate Hero ── */}
            <div className="sa-resolve-hero">
              <div className="sa-resolve-hero__left">
                <div className="sa-resolve-hero__label">Overall Resolution Rate</div>
                <div className="sa-resolve-hero__pct" style={{ color: resolveRate >= 70 ? "#10B981" : resolveRate >= 40 ? "#F59E0B" : "#EF4444" }}>
                  {resolveRate}%
                </div>
                <div className="sa-resolve-hero__sub">
                  {resolved} out of {total} complaints resolved
                </div>
                <div className="sa-resolve-bar">
                  <div className="sa-resolve-bar__fill" style={{
                    width: `${resolveRate}%`,
                    background: resolveRate >= 70 ? "linear-gradient(90deg,#059669,#10b981)"
                              : resolveRate >= 40 ? "linear-gradient(90deg,#d97706,#f59e0b)"
                              : "linear-gradient(90deg,#dc2626,#ef4444)"
                  }} />
                </div>
                <div className="sa-resolve-hero__tags">
                  {resolveRate >= 70 && <span className="sa-tag sa-tag--green">🎉 Excellent resolution</span>}
                  {resolveRate >= 40 && resolveRate < 70 && <span className="sa-tag sa-tag--amber">⚡ Good progress</span>}
                  {resolveRate < 40 && total > 0 && <span className="sa-tag sa-tag--red">📌 Needs attention</span>}
                </div>
              </div>
              <div className="sa-resolve-hero__right">
                <ResponsiveContainer width={160} height={160}>
                  <RadialBarChart
                    innerRadius={50} outerRadius={75}
                    data={[{ value: resolveRate, fill: "#10B981" }, { value: 100 - resolveRate, fill: "rgba(255,255,255,0.05)" }]}
                    startAngle={90} endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="sa-radial-center">
                  <span>{resolveRate}%</span>
                </div>
              </div>
            </div>

            {/* ── Charts Row 1: Pie + Bar ── */}
            <div className="sa-charts-row">

              {/* Status Distribution Pie */}
              <div className="sa-chart-card">
                <div className="sa-chart-card__header">
                  <div>
                    <span className="sa-chart-card__title">Status Distribution</span>
                    <p className="sa-chart-card__sub">Breakdown by current status</p>
                  </div>
                  <span className="sa-chart-tag">Donut</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle" iconSize={8}
                      formatter={v => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Bar */}
              <div className="sa-chart-card">
                <div className="sa-chart-card__header">
                  <div>
                    <span className="sa-chart-card__title">By Category</span>
                    <p className="sa-chart-card__sub">Which type you file most</p>
                  </div>
                  <span className="sa-chart-tag">Bar</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categoryData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="count" name="Complaints" radius={[6,6,0,0]}>
                      {categoryData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Charts Row 2: Area trend ── */}
            <div className="sa-chart-card sa-chart-card--wide">
              <div className="sa-chart-card__header">
                <div>
                  <span className="sa-chart-card__title">Complaint Trend</span>
                  <p className="sa-chart-card__sub">Last 6 months — filed vs resolved</p>
                </div>
                <span className="sa-chart-tag">Area</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total"    name="Filed"    stroke="#6366f1" strokeWidth={2} fill="url(#gradTotal)"    dot={{ fill:"#6366f1", r:4 }} activeDot={{ r:6 }} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={{ fill:"#10b981", r:4 }} activeDot={{ r:6 }} />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{v}</span>}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ── Charts Row 3: Resolution time + Category status ── */}
            <div className="sa-charts-row">

              {/* Resolution time bar */}
              <div className="sa-chart-card">
                <div className="sa-chart-card__header">
                  <div>
                    <span className="sa-chart-card__title">Days Since Filed</span>
                    <p className="sa-chart-card__sub">Resolved complaints age</p>
                  </div>
                  <span className="sa-chart-tag">Bar</span>
                </div>
                {resolutionTimes.length === 0 ? (
                  <div className="sa-chart-empty">No resolved complaints yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={resolutionTimes} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="days" name="Days" radius={[6,6,0,0]} fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category × Status stacked */}
              <div className="sa-chart-card">
                <div className="sa-chart-card__header">
                  <div>
                    <span className="sa-chart-card__title">Category × Status</span>
                    <p className="sa-chart-card__sub">Resolved vs pending per category</p>
                  </div>
                  <span className="sa-chart-tag">Stacked</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={["ACADEMIC","HOSTEL","EXAM","OTHER"].map(cat => ({
                      name: `${CAT_ICONS[cat]}`,
                      Resolved:   complaints.filter(c => c.title === cat && c.status === "RESOLVED").length,
                      Pending:    complaints.filter(c => c.title === cat && c.status === "PENDING").length,
                      InProgress: complaints.filter(c => c.title === cat && (c.status === "IN_PROGRESS" || c.status === "IN_REVIEW")).length,
                      Rejected:   complaints.filter(c => c.title === cat && c.status === "REJECTED").length,
                    }))}
                    barSize={32}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:14 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"rgba(255,255,255,0.3)", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
                    <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{v}</span>} />
                    <Bar dataKey="Resolved"   stackId="a" fill="#10B981" radius={[0,0,0,0]} />
                    <Bar dataKey="InProgress" stackId="a" fill="#3B82F6" radius={[0,0,0,0]} />
                    <Bar dataKey="Pending"    stackId="a" fill="#F59E0B" radius={[0,0,0,0]} />
                    <Bar dataKey="Rejected"   stackId="a" fill="#EF4444" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Summary Insight Cards ── */}
            <div className="sa-insights">
              <div className="sa-insight">
                <span className="sa-insight__icon">🏆</span>
                <div>
                  <div className="sa-insight__title">Most Filed Category</div>
                  <div className="sa-insight__val">
                    {categoryData.sort((a,b) => b.count - a.count)[0]?.count > 0
                      ? categoryData.sort((a,b) => b.count - a.count)[0]?.name
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="sa-insight">
                <span className="sa-insight__icon">⚡</span>
                <div>
                  <div className="sa-insight__title">Active Complaints</div>
                  <div className="sa-insight__val">{pending + inProgress}</div>
                </div>
              </div>
              <div className="sa-insight">
                <span className="sa-insight__icon">📅</span>
                <div>
                  <div className="sa-insight__title">This Month</div>
                  <div className="sa-insight__val">
                    {complaints.filter(c => {
                      if (!c.createdAt) return false;
                      const d = new Date(c.createdAt);
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length} filed
                  </div>
                </div>
              </div>
              <div className="sa-insight">
                <span className="sa-insight__icon">✅</span>
                <div>
                  <div className="sa-insight__title">Resolution Rate</div>
                  <div className="sa-insight__val" style={{ color: resolveRate >= 70 ? "#10B981" : resolveRate >= 40 ? "#F59E0B" : "#EF4444" }}>
                    {resolveRate}%
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default StudentAnalytics;