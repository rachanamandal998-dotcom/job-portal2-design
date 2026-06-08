import { useState, useRef, useEffect, useMemo } from "react";
import {
  Briefcase, Plus, Eye, Search, ChevronDown, Upload, Clock,
  CheckCircle, TrendingUp, X, FileText, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../Modal";

import "../styles/JobPortal.css";
import { DashboardShell } from "../shared/DashboardShell";

import SuccessRate from "../pages/job/SuccessRate";
import Applications from "../pages/job/Applications";
import OffersReceived from "../pages/job/OffersReceived";
import Rejections from "../pages/job/Rejections";
import CVViewer from "../pages/job/CVViewer";
import { ChartsGrid } from "../shared/DashboardShell";

export default function JobPortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [currentView, setCurrentView] = useState("dashboard");
  const [applicationsTab, setApplicationsTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const [applications, setApplications] = useState([
    { id: 1, title: "Frontend Developer", company: "Tech Corp", date: "May 10", status: "applied", location: "Remote", salary: "$80k-100k" },
    { id: 2, title: "UI/UX Designer", company: "Design Inc", date: "May 11", status: "shortlisted", location: "New York", salary: "$70k-90k" },
    { id: 3, title: "Backend Engineer", company: "Software Ltd", date: "May 12", status: "pending", location: "San Francisco", salary: "$100k-130k" },
    { id: 4, title: "Product Manager", company: "Startup Inc", date: "May 13", status: "shortlisted", location: "Remote", salary: "$120k-150k" },
    { id: 5, title: "Data Analyst", company: "Analytics Co", date: "May 9", status: "rejected", location: "Boston", salary: "$75k-95k" },
  ]);

  const [offers, setOffers] = useState([
    { id: 'OFF-2026-1001', company: 'Google', role: 'Frontend Developer', salaryDisplay: '₹18 LPA', location: 'Remote', status: 'Pending' },
    { id: 'OFF-2026-1002', company: 'Amazon', role: 'Backend Developer', salaryDisplay: '₹16 LPA', location: 'Bangalore', status: 'Accepted' }
  ]);

  const [cvData] = useState({
    name: "Rachana Sharma", email: "rachana@example.com", phone: "+1 234 567 8900",
    location: "San Francisco, CA", title: "Senior Frontend Developer",
    summary: "Passionate frontend developer with 5+ years of experience.",
    skills: ["React", "TypeScript", "Node.js", "CSS", "Figma", "Git"],
    experience: [
      { role: "Senior Frontend Dev", company: "Tech Corp", duration: "2022 - Present" },
      { role: "Frontend Developer", company: "Web Solutions", duration: "2020 - 2022" },
    ]
  });

  const applicationStats = useMemo(() => ({
    applied: applications.filter(a => a.status === "applied").length,
    pending: applications.filter(a => a.status === "pending").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  }), [applications]);

  const total = Object.values(applicationStats).reduce((a, b) => a + b, 0);
  const successRate = total > 0 ? Math.round((applicationStats.shortlisted / total) * 100) : 0;

  const filteredApplications = useMemo(() => {
    let filtered = applications;
    if (statusFilter !== "all") filtered = filtered.filter(app => app.status === statusFilter);
    if (searchQuery) filtered = filtered.filter(app => app.title.toLowerCase().includes(searchQuery.toLowerCase()) || app.company.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  }, [applications, statusFilter, searchQuery]);

  const jobCategories = ["Tech", "Design", "Marketing", "Sales", "Finance", "Remote"];

  // DYNAMIC CONFIGS
  const circles = [
    { primary: true, icon: <Briefcase size={32} strokeWidth={3} />, label: "Add Jobs", sub: "Applications", badge: applicationStats.applied, onClick: () => setModalOpen(true) },
    { icon: <Clock size={32} strokeWidth={3} />, label: "Pending", sub: "Under Review", badge: applicationStats.pending, color: "#f97316", onClick: () => { setApplicationsTab("pending"); setCurrentView("applications"); } },
    { icon: <CheckCircle size={32} strokeWidth={3} />, label: "Shortlisted", sub: "Approved", badge: applicationStats.shortlisted, color: "#f97316", onClick: () => { setApplicationsTab("shortlisted"); setCurrentView("applications"); } },
    { icon: <Eye size={32} strokeWidth={3} />, label: "View CV", sub: "Preview", badge: 1, color: "#f97316", onClick: () => setCurrentView("cvViewer") },
  ];

  const overviewStats = [
    { key: "applied", label: "Applied", value: applicationStats.applied, color: "#f97316" },
    { key: "pending", label: "Pending", value: applicationStats.pending, color: "#fbbf24" },
    { key: "shortlisted", label: "Shortlisted", value: applicationStats.shortlisted, color: "#22c55e" },
    { key: "rejected", label: "Rejected", value: applicationStats.rejected, color: "#ef4444" },
  ];

  const quickCards = [
    { icon: <Briefcase size={24} />, value: applicationStats.applied, label: "Applications", onClick: () => { setApplicationsTab("all"); setCurrentView("applications"); } },
    { icon: <FileText size={24} />, value: offers.length, label: "Offers Received", onClick: () => setCurrentView("offers") },
    { icon: <X size={24} />, value: applicationStats.rejected, label: "Rejections", onClick: () => setCurrentView("rejections") },
    { icon: <TrendingUp size={24} />, value: `${successRate}%`, label: "Success Rate", onClick: () => setCurrentView("successRate") },
  ];

  const jobCharts = [
    {
      id: 'trend', title: 'Weekly Application Trend', subtitle: 'Applications over the last 7 days', type: 'line',
      data: (orange, orangeAlpha) => ({ labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], datasets: [{ data: [1, 3, 2, 5, 4, 6, 3], borderColor: orange, backgroundColor: orangeAlpha, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }] })
    },
    {
      id: 'status', title: 'Application Status', subtitle: 'Current application breakdown', type: 'doughnut',
      data: () => ({ labels: ["Applied", "Pending", "Shortlisted", "Rejected"], datasets: [{ data: [applicationStats.applied, applicationStats.pending, applicationStats.shortlisted, applicationStats.rejected], backgroundColor: ["#f97316", "#fbbf24", "#22c55e", "#ef4444"], borderWidth: 2, borderColor: "#fff" }] })
    },
    {
      id: 'categories', title: 'Popular Categories', subtitle: 'Most applied job categories', type: 'bar',
      data: () => ({ labels: ["Tech", "Design", "Marketing", "Finance"], datasets: [{ data: [12, 8, 5, 7], backgroundColor: ["rgba(249,115,22,0.8)", "rgba(249,115,22,0.6)", "rgba(249,115,22,0.4)", "rgba(249,115,22,0.2)"], borderRadius: 6 }] })
    }
  ];

  const handleAddJob = (data) => {
    setApplications(prev => [...prev, { id: Date.now(), title: data.title, company: data.company, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), status: "applied", location: data.location || "Remote", salary: data.salary || "Not specified" }]);
    setModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (currentView === "successRate") return <SuccessRate applications={applications} onBack={() => setCurrentView("dashboard")} />;
  if (currentView === "applications") return <Applications applications={applications} onBack={() => setCurrentView("dashboard")} initialTab={applicationsTab} />;
  if (currentView === "offers") return <OffersReceived applications={applications} offers={offers} setOffers={setOffers} onBack={() => setCurrentView("dashboard")} />;
  if (currentView === "rejections") return <Rejections applications={applications} onBack={() => setCurrentView("dashboard")} />;
  if (currentView === "cvViewer") return <CVViewer onBack={() => setCurrentView("dashboard")} cvData={cvData} />;

  return (
    <DashboardShell>
      <div className="job-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your job applications</p>
            <span className="verified-badge"><CheckCircle size={16} /> Verified</span>
          </div>

          <div className="action-circles">
            {circles.map((c, i) => (
              <motion.button key={i} className={`action-circle-btn ${c.primary ? 'primary' : ''}`} onClick={c.onClick} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="action-circle-content">
                  <div className="circle-icon-wrapper" style={c.color ? { color: c.color } : {}}>{c.icon}</div>
                  <h3 className="circle-label">{c.label}</h3>
                  <p className="circle-sublabel">{c.sub}</p>
                  <span className="circle-badge">{c.badge}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="application-stats-section">
            <div className="overview-header">
              <h2 className="overview-title">Application Overview</h2>
              <span className="overview-badge">{total} Total</span>
            </div>
            <div className="overview-content">
              <DonutChart stats={applicationStats} />
              <div className="stats-bars">
                {overviewStats.map(s => (
                  <div key={s.key} className={`stat-row ${statusFilter === s.key ? 'active-filter' : ''}`} onClick={() => setStatusFilter(s.key)}>
                    <div className="stat-header">
                      <div className="stat-label"><span className="stat-dot" style={{ background: s.color }} />{s.label}</div>
                      <span className="stat-value">{s.value}</span>
                    </div>
                    <div className="stat-bar-bg"><div className="stat-bar" style={{ width: `${total ? (s.value / total) * 100 : 0}%`, background: s.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="quick-stats">
            {quickCards.map((card, i) => (
              <motion.div key={i} className="stat-card" whileHover={{ y: -5 }} onClick={card.onClick} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label-text">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <ChartsGrid charts={jobCharts} />

          <div className="search-section">
            <div className="search-input"><Search size={18} style={{ color: "#94a3b8" }} /><input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}><option>All categories</option>{jobCategories.map(cat => <option key={cat}>{cat}</option>)}</select>
          </div>

          <div className="products-section">
            <div className="section-header">
              <div><h2 className="section-title">My Applications</h2><p className="section-subtitle">{statusFilter === "all" ? "Latest applications" : `Showing ${filteredApplications.length} ${statusFilter} applications`}</p></div>
              <div className="section-actions"><div className="filter-wrapper"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="btn filter-select"><option value="all">All Status ({total})</option><option value="applied">Applied ({applicationStats.applied})</option><option value="pending">Pending ({applicationStats.pending})</option><option value="shortlisted">Shortlisted ({applicationStats.shortlisted})</option><option value="rejected">Rejected ({applicationStats.rejected})</option></select><Filter size={16} className="filter-icon" /></div></div>
            </div>
            {filteredApplications.length === 0 ? (
              <div className="empty-state"><Briefcase size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} /><p>No applications found.</p></div>
            ) : (
              <div className="applications-list">{filteredApplications.map(app => (<motion.div key={app.id} className="application-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="application-info"><h3 className="application-title">{app.title}</h3><div className="application-meta"><span>{app.company}</span><span>•</span><span>{app.date}</span><span>•</span><span>{app.location}</span></div></div><div className={`application-status ${app.status}`}>{app.status === "shortlisted" ? <CheckCircle size={14} /> : app.status === "rejected" ? <X size={14} /> : <Clock size={14} />}{app.status}</div></motion.div>))}</div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <div className="categories-dropdown" ref={dropdownRef}>
              <button className={`dropdown-trigger ${showDropdown ? "open" : ""}`} onClick={() => setShowDropdown(!showDropdown)}><Plus size={18} />Find Jobs<ChevronDown size={16} /></button>
              <div className={`dropdown-menu ${showDropdown ? "open" : ""}`}>
                <button className="dropdown-item" onClick={() => setCurrentView("successRate")}><Search size={16} /> View Analytics</button>
                <button className="dropdown-item"><Upload size={16} /> Import from LinkedIn</button>
                <div className="dropdown-divider" /><div className="dropdown-label">Quick Categories</div>
                {jobCategories.map(cat => (<button key={cat} className="dropdown-item" onClick={() => { setSelectedCategory(cat); setShowDropdown(false); }}><Briefcase size={16} /> {cat} Jobs</button>))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{modalOpen && <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddJob} type="job" />}</AnimatePresence>
    </DashboardShell>
  );
}

function DonutChart({ stats }) {
  const colors = { applied: "#f97316", pending: "#fbbf24", shortlisted: "#22c55e", rejected: "#ef4444" };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const radius = 45; const circumference = 2 * Math.PI * radius; let offset = 0;
  const segments = Object.entries(stats).map(([key, value]) => { const percent = total > 0 ? value / total : 0; const dash = percent * circumference; const segment = { key, dasharray: `${dash} ${circumference - dash}`, offset: -offset, color: colors[key] }; offset += dash; return segment; });
  return (<div className="donut-container"><svg width="140" height="140" viewBox="0 0 120 120"><circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />{segments.map(s => (<circle key={s.key} cx="60" cy="60" r={radius} fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={s.dasharray} strokeDashoffset={s.offset} strokeLinecap="round" transform="rotate(-90 60 60)" />))}</svg><div className="donut-center"><div className="donut-number">{total}</div><div className="donut-label">Apps</div></div></div>);
}

