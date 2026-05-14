import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";
import {
  Briefcase, FileText, Clock, CheckCircle, Eye,
  Search, Plus, ChevronDown, Upload, TrendingUp, XCircle,
} from "lucide-react";
import { DashboardShell, Greeting, SectionPanel } from "./DashboardShell";
import "./JobPortal.css";

/* ── Action Circles ── */
function ActionCircles({ stats }) {
  const items = [
    { icon: FileText, label: "Find Jobs", sub: "Browse all", badge: stats.Applied, primary: true },
    { icon: Clock, label: "Pending", sub: "Under review", badge: stats.Pending },
    { icon: CheckCircle, label: "Shortlisted", sub: "Approved", badge: stats.Shortlisted },
    { icon: Eye, label: "View CV", sub: "Preview", badge: 1 },
  ];
  return (
    <div className="circles-grid">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="circ-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <div className={`circ-outer ${item.primary ? "circ-outer--primary" : ""}`}>
            <div className={`circ-inner ${item.primary ? "circ-inner--primary" : ""}`}>
              <item.icon size={22} className="circ-icon" />
              <div className="circ-label">{item.label}</div>
              <div className="circ-sub">{item.sub}</div>
              <span className="circ-badge">{item.badge}</span>
            </div>
          </div>
          <span className="circ-card-label">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Application Overview Donut ── */
function ApplicationOverview({ stats }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
  const colors = { Applied: "#f97316", Pending: "#fbbf24", Shortlisted: "#22c55e", Rejected: "#ef4444" };
  const r = 45, circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = Object.entries(stats).map(([key, value]) => {
    const dash = (value / total) * circ;
    const arc = { key, value, color: colors[key], dasharray: `${dash} ${circ - dash}`, offset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="overview-wrap">
      <div className="overview-head">
        <h3 className="overview-title">Application Overview</h3>
        <span className="overview-badge">{total} Total</span>
      </div>
      <div className="overview-body">
        <div className="donut-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
            {arcs.map(s => (
              <circle
                key={s.key} cx="60" cy="60" r={r}
                fill="none" stroke={s.color} strokeWidth="12"
                strokeDasharray={s.dasharray} strokeDashoffset={s.offset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
              />
            ))}
          </svg>
          <div className="donut-center">
            <div className="donut-num">{total}</div>
            <div className="donut-lbl">Apps</div>
          </div>
        </div>
        <div className="stat-bars">
          {arcs.map(s => (
            <div key={s.key} className="stat-row">
              <div className="stat-row-top">
                <div className="stat-dot" style={{ background: s.color }} />
                <span className="stat-name">{s.key}</span>
                <span className="stat-val">{s.value}</span>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Quick Stats ── */
function QuickStats({ stats }) {
  const successRate = stats.Applied > 0
    ? Math.round((stats.Shortlisted / stats.Applied) * 100)
    : 0;

  const tiles = [
    { icon: Briefcase, label: "Applications", val: stats.Applied },
    { icon: Clock, label: "Pending", val: stats.Pending },
    { icon: CheckCircle, label: "Shortlisted", val: stats.Shortlisted },
    { icon: TrendingUp, label: "Success Rate", val: `${successRate}%` },
  ];

  return (
    <div className="qs-grid">
      {tiles.map((t, i) => (
        <motion.div key={t.label} className="qs-tile"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 + 0.1 }}
        >
          <div className="qs-tile-icon"><t.icon size={18} /></div>
          <div className="qs-tile-val">{t.val}</div>
          <div className="qs-tile-label">{t.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Charts ── */
function ChartsSection({ stats }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const lineInst = useRef(null);
  const pieInst = useRef(null);
  const barInst = useRef(null);

  const build = useCallback(() => {
    lineInst.current?.destroy();
    pieInst.current?.destroy();
    barInst.current?.destroy();

    const or = "#f97316";
    const orFill = "rgba(249,115,22,0.1)";
    const grid = "#f3f4f6";
    const tick = "#9ca3af";

    if (lineRef.current) {
      lineInst.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: "Applications",
            data: [1, 3, 2, 5, 4, 6, 3],
            borderColor: or, backgroundColor: orFill,
            fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
          },
        },
      });
    }

    if (pieRef.current) {
      pieInst.current = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Applied", "Pending", "Shortlisted", "Rejected"],
          datasets: [{
            data: [stats.Applied || 1, stats.Pending || 1, stats.Shortlisted || 1, stats.Rejected || 1],
            backgroundColor: ["#f97316", "#fbbf24", "#22c55e", "#ef4444"],
            borderWidth: 2, borderColor: "#fff",
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } } },
          cutout: "62%",
        },
      });
    }

    if (barRef.current) {
      barInst.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Tech", "Design", "Marketing", "Finance"],
          datasets: [{
            label: "Jobs",
            data: [12, 8, 5, 7],
            backgroundColor: ["rgba(249,115,22,0.85)", "rgba(249,115,22,0.65)", "rgba(249,115,22,0.45)", "rgba(249,115,22,0.25)"],
            borderRadius: 6, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick, font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
          },
        },
      });
    }
  }, [stats]);

  useEffect(() => {
    build();
    return () => {
      lineInst.current?.destroy();
      pieInst.current?.destroy();
      barInst.current?.destroy();
    };
  }, [build]);

  return (
    <div className="charts-grid jp-charts-4">
      <div className="chart-card">
        <div className="chart-card-title">Weekly Applications</div>
        <div className="chart-card-sub">Last 7 days trend</div>
        <div className="chart-wrap"><canvas ref={lineRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Application Status</div>
        <div className="chart-card-sub">Current breakdown</div>
        <div className="chart-wrap"><canvas ref={pieRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Popular Categories</div>
        <div className="chart-card-sub">Most applied sectors</div>
        <div className="chart-wrap"><canvas ref={barRef} /></div>
      </div>
      <div className="chart-card jp-activity-card">
        <div className="chart-card-title">Activity Feed</div>
        <div className="chart-card-sub">Latest updates</div>
        <div className="jp-activity">
          {[
            { dot: "orange", text: "Dashboard opened", time: "Just now" },
            { dot: "blue", text: "Resume updated", time: "Today" },
            { dot: "green", text: "New Tech jobs posted", time: "2 hrs ago" },
            { dot: "orange", text: "Application viewed", time: "Yesterday" },
          ].map((item, i) => (
            <div key={i} className="jp-activity-item">
              <div className={`jp-activity-dot jp-dot-${item.dot}`} />
              <div>
                <div className="jp-activity-text">{item.text}</div>
                <div className="jp-activity-time">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function JobPortal() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);

  const [stats] = useState({ Applied: 12, Pending: 4, Shortlisted: 5, Rejected: 3 });

  const categories = ["Tech", "Design", "Marketing", "Sales", "Finance", "Remote"];

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <DashboardShell>
      <Greeting title="Manage your job applications" subtitle="Hi, Rachana!" verified />

      <ActionCircles stats={stats} />
      <ApplicationOverview stats={stats} />
      <QuickStats stats={stats} />
      <ChartsSection stats={stats} />

      {/* Search */}
      <div className="jp-search-bar">
        <div className="jp-search-input">
          <Search size={15} className="jp-search-icon" />
          <input
            type="text"
            placeholder="Search job titles, companies…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="jp-category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option>All categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <SectionPanel
        title="My Applications"
        description="Jobs you've applied to recently"
        emptyIcon={Briefcase}
        emptyTitle="No applications yet"
        emptyHint="Apply for jobs below to see them here."
      />

      {/* Find Jobs dropdown */}
      <div className="jp-find-jobs-wrap" ref={menuRef}>
        <button
          className="brand-btn jp-find-btn"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <Plus size={16} />
          Find Jobs
          <ChevronDown size={14} className={`jp-chevron ${showDropdown ? "jp-chevron--open" : ""}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="jp-dropdown"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <button className="jp-dropdown-item" onClick={() => setShowDropdown(false)}>
                <Search size={15} /> Browse All Jobs
              </button>
              <button className="jp-dropdown-item" onClick={() => setShowDropdown(false)}>
                <Upload size={15} /> Import from LinkedIn
              </button>
              <div className="jp-dropdown-divider" />
              <div className="jp-dropdown-label">Quick Categories</div>
              {categories.map(cat => (
                <button
                  key={cat}
                  className="jp-dropdown-item"
                  onClick={() => { setSelectedCategory(cat); setShowDropdown(false); }}
                >
                  <Briefcase size={15} /> {cat} Jobs
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}