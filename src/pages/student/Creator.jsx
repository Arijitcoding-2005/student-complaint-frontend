import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Creator.css";

const SKILLS = [
  { name: "React",         icon: "⚛️",  color: "#61DAFB" },
  { name: "Spring Boot",   icon: "🍃",  color: "#6DB33F" },
  { name: "Java",          icon: "☕",  color: "#F89820" },
  { name: "MySQL",         icon: "🐬",  color: "#00758F" },
  { name: "REST APIs",     icon: "🔗",  color: "#6366F1" },
  { name: "JWT Auth",      icon: "🔐",  color: "#F59E0B" },
  { name: "CSS / Tailwind",icon: "🎨",  color: "#38BDF8" },
  { name: "Git",           icon: "🌿",  color: "#F05032" },
];

const TIMELINE = [
  { year: "2024", title: "Started Full Stack Journey", desc: "Began learning React and Spring Boot, building the foundation." },
  { year: "2025", title: "Built Complaint Management System", desc: "Designed and developed this end-to-end complaint portal with JWT auth, role-based access, and a modern UI." },
  { year: "2025", title: "Mastered REST API Design", desc: "Implemented secure, scalable APIs with Spring Security and MySQL." },
  { year: "Now",  title: "Keep Building 🚀", desc: "Continuously improving and shipping new features." },
];

const Creator = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="cr-root">
      {/* Animated background grid */}
      <div className="cr-grid-bg" />
      <div className="cr-orb cr-orb--1" />
      <div className="cr-orb cr-orb--2" />
      <div className="cr-orb cr-orb--3" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="cr-float-particle" style={{ "--i": i }} />
      ))}

      <div className={`cr-inner${visible ? " visible" : ""}`}>

        {/* Back */}
        <button className="cr-back" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L4 7l5 5" strokeLinecap="round" />
          </svg>
          Back
        </button>

        {/* ── Hero ── */}
        <div className="cr-hero">
          <div className="cr-hero__glow" />

          {/* Avatar */}
          <div className="cr-avatar-wrap">
            <div className="cr-avatar">
              <span>AS</span>
              <div className="cr-avatar__ring cr-avatar__ring--1" />
              <div className="cr-avatar__ring cr-avatar__ring--2" />
            </div>
            <div className="cr-status-dot" />
          </div>

          <div className="cr-hero__text">
            <div className="cr-tag">👨‍💻 Full Stack Developer</div>
            <h1 className="cr-name">Arijit Saha</h1>
            <p className="cr-bio">
              Passionate developer who loves building clean, functional, and beautiful web applications.
              Specializes in Java + Spring Boot backends paired with modern React frontends.
            </p>
            <div className="cr-badges">
              <span className="cr-badge">🎓 ME Student VIT Vellore</span>
              <span className="cr-badge">☕ Java Enthusiast</span>
              <span className="cr-badge">🌟 Open Source</span>
            </div>
          </div>
        </div>

        {/* ── Project highlight ── */}
        <div className="cr-project">
          <div className="cr-project__accent" />
          <div className="cr-project__body">
            <div className="cr-project__label">Featured Project</div>
            <h2 className="cr-project__title">
              🏫 Student Complaint Management System
            </h2>
            <p className="cr-project__desc">
              A full-stack web application enabling students to file, track, and manage complaints
              with real-time status updates. Admins can review, update, and resolve grievances through
              a dedicated analytics dashboard.
            </p>
            <div className="cr-project__pills">
              {["React", "Spring Boot", "MySQL", "JWT", "Spring Security", "REST API"].map(t => (
                <span key={t} className="cr-pill">{t}</span>
              ))}
            </div>
            <div className="cr-project__stats">
              <div className="cr-pstat"><span>2</span><small>Roles</small></div>
              <div className="cr-pstat"><span>8+</span><small>Pages</small></div>
              <div className="cr-pstat"><span>15+</span><small>API Endpoints</small></div>
              <div className="cr-pstat"><span>JWT</span><small>Auth</small></div>
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="cr-section">
          <div className="cr-section__header">
            <span className="cr-section__label">Tech Stack</span>
            <div className="cr-section__line" />
          </div>
          <div className="cr-skills">
            {SKILLS.map((s, i) => (
              <div
                key={s.name}
                className={`cr-skill${activeSkill === i ? " active" : ""}`}
                style={{ "--sc": s.color, animationDelay: `${i * 0.06}s` }}
                onMouseEnter={() => setActiveSkill(i)}
                onMouseLeave={() => setActiveSkill(null)}
              >
                <span className="cr-skill__icon">{s.icon}</span>
                <span className="cr-skill__name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="cr-section">
          <div className="cr-section__header">
            <span className="cr-section__label">Journey</span>
            <div className="cr-section__line" />
          </div>
          <div className="cr-timeline">
            {TIMELINE.map((t, i) => (
              <div key={i} className="cr-tl-item" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="cr-tl-left">
                  <span className="cr-tl-year">{t.year}</span>
                  <div className="cr-tl-dot" />
                  {i < TIMELINE.length - 1 && <div className="cr-tl-line" />}
                </div>
                <div className="cr-tl-right">
                  <h4 className="cr-tl-title">{t.title}</h4>
                  <p className="cr-tl-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="cr-footer">
          <div className="cr-footer__sig">
            <span className="cr-footer__made">Made with</span>
            <span className="cr-footer__heart">❤️</span>
            <span className="cr-footer__made">by</span>
            <span className="cr-footer__name">Arijit Saha</span>
          </div>
          <p className="cr-footer__copy">© 2025 · Student Complaint Management System</p>
        </div>

      </div>
    </div>
  );
};

export default Creator;