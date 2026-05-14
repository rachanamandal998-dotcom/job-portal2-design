import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Briefcase, Package, Wrench, LogOut, Menu, X, BadgeCheck } from "lucide-react";
import "./DashboardShell.css";

export function DashboardShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const active = pathname.includes("job")
    ? "job"
    : pathname.includes("service")
    ? "service"
    : "product";

  const titleMap = {
    product: "Product Listing",
    job: "Job Portal",
    service: "Service Listing",
  };

  return (
    <div className="ds-root">
      {/* Background texture */}
      <div className="ds-bg-grid" />
      <div className="ds-bg-blob ds-bg-blob--1" />
      <div className="ds-bg-blob ds-bg-blob--2" />

      {/* HEADER */}
      <header className="ds-header">
        <div className="ds-header-inner">
          <Link to="/products" className="ds-logo">
            <div className="ds-logo-icon">
              <Store size={18} strokeWidth={2.5} />
            </div>
            <div className="ds-logo-text">
              <span className="ds-logo-brand">Sindhuli</span>
              <span className="ds-logo-accent">Bazar</span>
            </div>
          </Link>

          <nav className="ds-nav">
            <NavItem to="/jobs" icon={Briefcase} label="Jobs" active={active === "job"} />
            <NavItem to="/products" icon={Package} label="Products" active={active === "product"} />
            <NavItem to="/services" icon={Wrench} label="Services" active={active === "service"} />
          </nav>

          <div className="ds-header-right">
            <div className="ds-page-badge">{titleMap[active]}</div>
            <button className="ds-logout-btn">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
            <button className="ds-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="ds-mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <NavItem to="/jobs" icon={Briefcase} label="Job Portal" active={active === "job"} onClick={() => setMenuOpen(false)} mobile />
              <NavItem to="/products" icon={Package} label="Products" active={active === "product"} onClick={() => setMenuOpen(false)} mobile />
              <NavItem to="/services" icon={Wrench} label="Services" active={active === "service"} onClick={() => setMenuOpen(false)} mobile />
              <button className="ds-logout-mobile"><LogOut size={15} /> Logout</button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="ds-main">{children}</main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active, onClick, mobile }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`ds-nav-item ${active ? "ds-nav-item--active" : ""} ${mobile ? "ds-nav-item--mobile" : ""}`}
    >
      <Icon size={15} strokeWidth={2.2} />
      {label}
    </Link>
  );
}

export function Greeting({ title, subtitle, verified }) {
  return (
    <motion.div
      className="greeting"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="greeting-left">
        <p className="greeting-eyebrow">Welcome back</p>
        <h2 className="greeting-name">{subtitle}</h2>
        <p className="greeting-sub">{title}</p>
      </div>
      {verified && (
        <motion.div
          className="greeting-verified"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BadgeCheck size={18} />
          <span>CV Verified</span>
        </motion.div>
      )}
      <div className="greeting-ring greeting-ring--1" />
      <div className="greeting-ring greeting-ring--2" />
    </motion.div>
  );
}

export function SectionPanel({ title, description, emptyIcon: Icon, emptyTitle, emptyHint, cta, children }) {
  return (
    <section className="sp-panel">
      <div className="sp-panel-head">
        <div>
          <h3 className="sp-panel-title">{title}</h3>
          {description && <p className="sp-panel-desc">{description}</p>}
        </div>
        {cta && !children && <div className="sp-panel-cta">{cta}</div>}
      </div>
      {children ? (
        <div className="sp-panel-body">{children}</div>
      ) : (
        <div className="sp-panel-empty">
          {Icon && <div className="sp-empty-icon"><Icon size={28} /></div>}
          <p className="sp-empty-title">{emptyTitle}</p>
          <p className="sp-empty-hint">{emptyHint}</p>
          {cta && <div className="sp-empty-cta">{cta}</div>}
        </div>
      )}
    </section>
  );
}