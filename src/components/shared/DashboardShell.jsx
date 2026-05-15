import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

/* ─────────────────────────────
   DASHBOARD SHELL
───────────────────────────── */
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
      <div className="ds-blobs">
        <div className="ds-blob ds-blob-1" />
        <div className="ds-blob ds-blob-2" />
      </div>

      {/* HEADER */}
      <header className="ds-header">
        <div className="ds-header-inner">
          <Link to="/product-listing" className="ds-logo">
            <motion.div
              whileHover={{ rotateY: 180 }}
              transition={{ duration: 0.6 }}
              className="ds-logo-icon"
            >
              <Store size={20} />
            </motion.div>

            <div>
              <p className="ds-brand">Sindhuli Bazar</p>
              <h1 className="ds-title">{titleMap[active]}</h1>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="ds-nav-desktop">
            <NavItem
              to="/jobs"
              icon={Briefcase}
              label="Job Portal"
              active={active === "job"}
            />
            <NavItem
              to="/products"
              icon={Package}
              label="Product Listing"
              active={active === "product"}
            />
            <NavItem
              to="/services"
              icon={Wrench}
              label="Service Listing"
              active={active === "service"}
            />

            <button className="ds-logout">
              <LogOut size={16} /> Logout
            </button>
          </nav>

          <button
            className="ds-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={16} /> Menu
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ds-mobile-menu"
            >
              <NavItem
                to="/jobs"
                icon={Briefcase}
                label="Job Portal"
                active={active === "job"}
                onClick={() => setMenuOpen(false)}
              />
              <NavItem
                to="/products"
                icon={Package}
                label="Product Listing"
                active={active === "product"}
                onClick={() => setMenuOpen(false)}
              />
              <NavItem
                to="/services"
                icon={Wrench}
                label="Service Listing"
                active={active === "service"}
                onClick={() => setMenuOpen(false)}
              />

              <button className="ds-logout-mobile">
                <LogOut size={16} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="ds-main">{children}</main>
    </div>
  );
}

/* ─────────────────────────────
   NAV ITEM
───────────────────────────── */
function NavItem({ to, icon: Icon, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`ds-navitem ${active ? "active" : ""}`}
    >
      <Icon size={16} /> {label}
    </Link>
  );
}

/* ─────────────────────────────
   GREETING
───────────────────────────── */
export function Greeting({ title, subtitle, verified }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="greeting"
    >
      <div className="greeting-row">
        <div>
          <h2 className="greeting-name">{subtitle}</h2>
          <p className="greeting-sub">{title}</p>
        </div>

        {verified && (
          <span className="greeting-badge">
            <BadgeCheck size={16} /> Verified
          </span>
        )}
      </div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="greeting-orb"
      />
    </motion.div>
  );
}

/* ─────────────────────────────
   SECTION PANEL (IMPORTANT FIX HERE)
───────────────────────────── */
export function SectionPanel({
  title,
  description,
  emptyIcon: Icon,
  emptyTitle,
  emptyHint,
  cta,
  children,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p className="panel-desc">{description}</p>
        </div>
      </div>

      {/* IMPORTANT FIX:
          show children OR empty state */}
      {children ? (
        <div className="panel-content">{children}</div>
      ) : (
        <div className="panel-empty">
          {Icon && (
            <div className="panel-empty-icon">
              <Icon size={32} />
            </div>
          )}

          <p className="panel-empty-title">{emptyTitle}</p>
          <p className="panel-empty-hint">{emptyHint}</p>

          {cta && <div className="panel-empty-cta">{cta}</div>}
        </div>
      )}
    </section>
  );
}