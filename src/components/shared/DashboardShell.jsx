import { useState,useRef, useEffect  } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Chart } from "chart.js";

import {
  Store,
  Menu,
  LogOut,
  Briefcase,
  Package,
  Wrench,
  BadgeCheck,
} from "lucide-react";

import "./DashboardShell.css";

/* ── DASHBOARD SHELL ── */
export function DashboardShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const active = pathname.startsWith("/jobs")
   ? "job"
    : pathname.startsWith("/services")
   ? "service"
    : "product";

  const titleMap = {
    product: "Product Listing",
    job: "Job Portal",
    service: "Service Listing",
  };

  const logoLinkMap = {
    product: "/products",
    job: "/jobs",
    service: "/services",
  };

  return (
    <div className="ds-root">
      <div className="ds-blobs">
        <div className="ds-blob ds-blob-1" />
        <div className="ds-blob ds-blob-2" />
      </div>

      <header className="ds-header">
        <div className="ds-header-inner">
          <Link to={logoLinkMap[active]} className="ds-logo">
            <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.6 }} className="ds-logo-icon">
              <Store size={20} />
            </motion.div>
            <div>
              <p className="ds-brand">Sindhuli Bazar</p>
              <h1 className="ds-title">{titleMap[active]}</h1>
            </div>
          </Link>

          <nav className="ds-nav-desktop">
            <NavItem to="/jobs" icon={Briefcase} label="Job Portal" active={active === "job"} />
            <NavItem to="/products" icon={Package} label="Product Listing" active={active === "product"} />
            <NavItem to="/services" icon={Wrench} label="Service Listing" active={active === "service"} />
            <button className="ds-logout"><LogOut size={16} /> Logout</button>
          </nav>

          <button className="ds-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={16} /> Menu
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ds-mobile-menu">
              <NavItem to="/jobs" icon={Briefcase} label="Job Portal" active={active === "job"} onClick={() => setMenuOpen(false)} />
              <NavItem to="/products" icon={Package} label="Product Listing" active={active === "product"} onClick={() => setMenuOpen(false)} />
              <NavItem to="/services" icon={Wrench} label="Service Listing" active={active === "service"} onClick={() => setMenuOpen(false)} />
              <button className="ds-logout-mobile"><LogOut size={16} /> Logout</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="ds-main">{children}</main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`ds-navitem ${active? "active" : ""}`}>
      <Icon size={16} /> {label}
    </Link>
  );
}

/* ── REUSABLE PIECES FOR YOUR 3 PAGES ── */

// 1. Action Circles - replaces your 4 duplicated buttons
export function ActionCircles({ items }) {
  return (
    <div className="actions-grid">
      {items.map((it, i) => (
        <motion.button key={i} className="action-card" onClick={it.onClick} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
          <div className="action-row">
            <div className={`action-icon ${it.primary? "primary" : ""}`}>{it.icon}</div>
            {it.badge!= null && <span className="action-badge">{it.badge}</span>}
          </div>
          <p className="action-label">{it.label}</p>
          <p className="action-sub">{it.sublabel}</p>
          <div className="action-glow" />
        </motion.button>
      ))}
    </div>
  );
}

// 2. Donut Chart
export function DonutChart({ stats }) {
  const total = stats.reduce((a, s) => a + s.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-container">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {stats.map(s => {
          const dash = total? (s.value / total) * circumference : 0;
          const el = (
            <circle key={s.key} cx="70" cy="70" r={radius} fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset} strokeLinecap="round" transform="rotate(-90 70 70)" />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="donut-center">
        <div className="donut-number">{total}</div>
        <div className="donut-label">Total</div>
      </div>
    </div>
  );
}

// 3. Overview Section - replaces your overview-section
export function OverviewSection({ title, totalLabel, stats, onStatClick }) {
  const total = stats.reduce((a, s) => a + s.value, 0);
  return (
    <div className="overview-section">
      <div className="overview-header">
        <h2 className="overview-title">{title}</h2>
        <span className="overview-badge">{total} {totalLabel}</span>
      </div>
      <div className="overview-content">
        <DonutChart stats={stats} />
        <div className="stats-bars">
          {stats.map(s => (
            <div key={s.key} className="stat-row" onClick={() => onStatClick?.(s.key)} style={{ cursor: onStatClick? 'pointer' : 'default' }}>
              <div className="stat-header">
                <div className="stat-label">
                  <span className="stat-dot" style={{ background: s.color }} />
                  {s.label}
                </div>
                <span className="stat-value">{s.value}</span>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar" style={{ width: `${total? (s.value / total) * 100 : 0}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Quick Stats - replaces your quick-stats grid
export function QuickStats({ cards }) {
  return (
    <div className="quick-stats">
      {cards.map((c, i) => (
        <div key={i} className="stat-card" onClick={c.onClick}>
          <div className="stat-icon">{c.icon}</div>
          <div className="stat-value">{c.value}</div>
          <div className="stat-label-text">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// Keep your existing Greeting and SectionPanel
export function Greeting({ title, subtitle, verified }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="greeting">
      <div className="greeting-row">
        <div>
          <h2 className="greeting-name">{subtitle}</h2>
          <p className="greeting-sub">{title}</p>
        </div>
        {verified && (<span className="greeting-badge"><BadgeCheck size={16} /> Verified</span>)}
      </div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="greeting-orb" />
    </motion.div>
  );
}

export function SectionPanel({ title, description, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p className="panel-desc">{description}</p>
        </div>
      </div>
      <div className="panel-content">{children}</div>
    </section>
  );
}


export function ChartsGrid({ charts }) {
  const refs = useRef({}); const instances = useRef({});
  useEffect(() => {
    Object.values(instances.current).forEach(c => c?.destroy()); instances.current = {};
    const orange = "rgb(249,115,22)"; const orangeAlpha = "rgba(249,115,22,0.12)"; const grid = "#f1f5f9"; const tick = "#94a3b8";
    charts.forEach(chart => {
      const canvas = refs.current[chart.id]; if (!canvas) return;
      instances.current[chart.id] = new Chart(canvas, { type: chart.type, data: chart.data(orange, orangeAlpha), options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid, display: chart.type !== 'doughnut' }, ticks: { color: tick } }, y: { beginAtZero: true, grid: { color: grid, display: chart.type !== 'doughnut' }, ticks: { color: tick } } }, cutout: chart.type === 'doughnut' ? '60%' : undefined } });
    });
    return () => Object.values(instances.current).forEach(c => c?.destroy());
  }, [charts]);
  return (<div className="charts-grid">{charts.map(chart => (<div key={chart.id} className="chart-card"><div className="chart-header">
    <h3 className="chart-title">{chart.title}</h3><p className="chart-subtitle">{chart.subtitle}</p></div><div className="chart-container"><canvas ref={el => refs.current[chart.id] = el} /></div></div>))}</div>);
}
