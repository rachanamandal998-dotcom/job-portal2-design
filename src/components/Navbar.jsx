import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Job Portal", path: "/jobs", icon: "💼", tag: "Hire" },
  { label: "Product Listing", path: "/products", icon: "🛒", tag: "Shop" },
  { label: "Service Listing", path: "/services", icon: "🛠️", tag: "Work" },
];

export default function Navbar({ userName = "Rachana", verified = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    navigate("/jobs");
  };

  return (
    <>
      <nav className="nb-root">
        <div className="nb-inner">

          {/* ── LOGO ── */}
          <button className="nb-logo" onClick={() => navigate("/jobs")}>
            <span className="nb-logo-mark">SB</span>
            <span className="nb-logo-text">
              Sindhuli<span>Bazar</span>
            </span>
          </button>

          {/* ── DESKTOP LINKS ── */}
          <div className="nb-links">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `nb-link ${isActive ? "nb-link--active" : ""}`
                }
              >
                <span className="nb-link-icon">{link.icon}</span>
                <span className="nb-link-label">{link.label}</span>
                <span className="nb-link-tag">{link.tag}</span>
              </NavLink>
            ))}
          </div>

          {/* ── RIGHT SIDE ── */}
          <div className="nb-right">
            {verified && (
              <span className="nb-verified">
                <span className="nb-verified-dot" />
                Verified
              </span>
            )}

            <div className="nb-avatar" title={userName}>
              {userName.charAt(0).toUpperCase()}
              <span className="nb-avatar-ring" />
            </div>

            <button className="nb-logout" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>

          {/* ── HAMBURGER ── */}
          <button
            className={`nb-burger ${menuOpen ? "nb-burger--open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* ── MOBILE PROGRESS BAR (active indicator) ── */}
        <div className="nb-progress" />
      </nav>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`nb-drawer ${menuOpen ? "nb-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="nb-drawer-top">
          <div className="nb-drawer-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="nb-drawer-info">
            <p className="nb-drawer-name">Hi, {userName}!</p>
            {verified && (
              <p className="nb-drawer-verified">
                <span className="nb-verified-dot" /> CV Verified
              </p>
            )}
          </div>
        </div>

        <div className="nb-drawer-links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nb-drawer-link ${isActive ? "nb-drawer-link--active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span className="nb-drawer-link-icon">{link.icon}</span>
              <span>{link.label}</span>
              <span className="nb-drawer-link-arrow">→</span>
            </NavLink>
          ))}
        </div>

        <button className="nb-drawer-logout" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* ── OVERLAY ── */}
      {menuOpen && (
        <div className="nb-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}