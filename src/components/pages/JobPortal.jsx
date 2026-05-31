import { useState, useRef, useEffect, useMemo } from "react";
import {
  Briefcase, Plus, Eye, Search, ChevronDown, Upload, Clock,
  CheckCircle, TrendingUp, X, FileText, Mail, Phone, MapPin, Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";
import { Modal } from "../Modal";

import "../styles/JobPortal.css";
import { DashboardShell } from "../shared/DashboardShell";

// Import sub-pages (Fixed CVViewer import path to match others)
import SuccessRate from "../pages/job/SuccessRate";
import Applications from "../pages/job/Applications";
import OffersReceived from "../pages/job/OffersReceived";
import Rejections from "../pages/job/Rejections";
import CVViewer from "../pages/job/CVViewer"; 

export default function JobPortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ROUTING STATE - 6 possible views
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
    {
      id: 'OFF-2026-1001',
      company: 'Google',
      logo: '🔍',
      role: 'Frontend Developer',
      department: 'Engineering',
      salary: 18,
      salaryDisplay: '₹18 LPA',
      bonus: 3,
      stocks: 5,
      location: 'Remote',
      workMode: 'Remote',
      offerDate: '2026-05-15',
      joiningDate: '2026-06-01',
      expiryDate: '2026-05-30',
      expiryDays: 6,
      recruiter: 'Sarah Johnson',
      recruiterEmail: 'sarah@google.com',
      recruiterPhone: '+91 98765 43210',
      status: 'Pending',
      source: 'LinkedIn',
      probation: '3 Months',
      benefits: ['Health Insurance', 'Bonus', 'Stock Options', 'Paid Leaves', 'Flexible Hours'],
      leavePolicy: '24 days annual + 12 sick leaves',
      notes: '',
      bookmarked: false
    },
    {
      id: 'OFF-2026-1002',
      company: 'Amazon',
      logo: '📦',
      role: 'Backend Developer',
      department: 'AWS',
      salary: 16,
      salaryDisplay: '₹16 LPA',
      bonus: 2,
      stocks: 3,
      location: 'Bangalore',
      workMode: 'Hybrid',
      offerDate: '2026-05-10',
      joiningDate: '2026-06-15',
      expiryDate: '2026-05-25',
      expiryDays: 1,
      recruiter: 'Michael Chen',
      recruiterEmail: 'michael@amazon.com',
      recruiterPhone: '+91 98765 43211',
      status: 'Accepted',
      source: 'Referral',
      probation: '3 Months',
      benefits: ['Health Insurance', 'Bonus', 'Relocation', 'Paid Leaves'],
      leavePolicy: '20 days annual',
      notes: '',
      bookmarked: true
    }
  ]);

  const [cvData] = useState({
    name: "Rachana Sharma",
    email: "rachana@example.com",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
    title: "Senior Frontend Developer",
    summary: "Passionate frontend developer with 5+ years of experience building scalable web applications.",
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

  const jobCategories = ["Tech", "Design", "Marketing", "Sales", "Finance", "Remote"];

  const total = Object.values(applicationStats).reduce((a, b) => a + b, 0);
  const successRate = applicationStats.applied > 0
    ? Math.round((applicationStats.shortlisted / applicationStats.applied) * 100)
    : 0;

  // Restored the truncated filteredApplications logic
  const filteredApplications = useMemo(() => {
    let filtered = applications;
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [applications, statusFilter, searchQuery]);

  const handleAddJob = (data) => {
    setApplications(prev => [
      ...prev,
      {
        id: Date.now(),
        title: data.title,
        company: data.company,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: "applied",
        location: data.location || "Remote",
        salary: data.salary || "Not specified"
      }
    ]);
    setModalOpen(false);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CONDITIONAL RENDERING - ROUTE TO SUB-PAGES
  if (currentView === "successRate") {
    return <SuccessRate applications={applications} onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "applications") {
    return <Applications applications={applications} onBack={() => setCurrentView("dashboard")} initialTab={applicationsTab} />;
  }

  if (currentView === "offers") {
    return <OffersReceived applications={applications} offers={offers} setOffers={setOffers} onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "rejections") {
    return <Rejections applications={applications} onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "cvViewer") {
    return <CVViewer onBack={() => setCurrentView("dashboard")} cvData={cvData} />;
  }

  return (
    <DashboardShell>
      <div className="job-page">
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your job applications</p>
            <span className="verified-badge">
              <CheckCircle size={16} />
              Verified
            </span>
          </div>

          {/* Action Circles */}
          <div className="action-circles">
            <motion.button
              className="action-circle-btn primary"
              onClick={() => setModalOpen(true)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Briefcase size={32} strokeWidth={3} />
                </div>
                <h3 className="circle-label">Add Jobs</h3>
                <p className="circle-sublabel">Applications</p>
                <span className="circle-badge">{applicationStats.applied}</span>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => {
                setApplicationsTab("pending");
                setCurrentView("applications");
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Clock size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Pending</h3>
                <p className="circle-sublabel">Under Review</p>
                <span className="circle-badge">{applicationStats.pending}</span>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => {
                setApplicationsTab("shortlisted");
                setCurrentView("applications");
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <CheckCircle size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Shortlisted</h3>
                <p className="circle-sublabel">Approved</p>
                <span className="circle-badge">{applicationStats.shortlisted}</span>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => setCurrentView("cvViewer")}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Eye size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">View CV</h3>
                <p className="circle-sublabel">Preview</p>
                <span className="circle-badge">1</span>
              </div>
            </motion.button>
          </div>

          {/* Application Stats Section */}
          <div className="application-stats-section">
            <div className="overview-header">
              <h2 className="overview-title">Application Overview</h2>
              <span className="overview-badge">{total} Total</span>
            </div>
            <div className="overview-content">
              <DonutChart stats={applicationStats} />
              <div className="stats-bars">
                {Object.entries(applicationStats).map(([key, value]) => {
                  const colors = { applied: "#f97316", pending: "#fbbf24", shortlisted: "#22c55e", rejected: "#ef4444" };
                  const labels = { applied: "Applied", pending: "Pending", shortlisted: "Shortlisted", rejected: "Rejected" };
                  return (
                    <div
                      key={key}
                      className={`stat-row ${statusFilter === key ? 'active-filter' : ''}`}
                      onClick={() => setStatusFilter(key)}
                      title={`Show ${labels[key]} applications`}
                    >
                      <div className="stat-header">
                        <div className="stat-label">
                          <span className="stat-dot" style={{ background: colors[key] }} />
                          {labels[key]}
                        </div>
                        <span className="stat-value">{value}</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar"
                          style={{
                            width: `${total > 0 ? (value / total) * 100 : 0}%`,
                            background: colors[key],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="quick-stats">
            <motion.div className="stat-card" whileHover={{ y: -5 }} onClick={() => { setApplicationsTab("all"); setCurrentView("applications"); }} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><Briefcase size={24} /></div>
              <div className="stat-value">{applicationStats.applied}</div>
              <div className="stat-label-text">Applications</div>
            </motion.div>

            <motion.div className="stat-card" whileHover={{ y: -5 }} onClick={() => setCurrentView("offers")} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ color: "#ffffff" }}><FileText size={24} /></div>
              <div className="stat-value">{offers.length}</div>
              <div className="stat-label-text">Offers Received</div>
            </motion.div>

            <motion.div className="stat-card" whileHover={{ y: -5 }} onClick={() => setCurrentView("rejections")} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ color: "#f0e9e9" }}><X size={24} /></div>
              <div className="stat-value">{applicationStats.rejected}</div>
              <div className="stat-label-text">Rejections</div>
            </motion.div>
                  
            <motion.div className="stat-card" whileHover={{ y: -5 }} onClick={() => setCurrentView("successRate")} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><TrendingUp size={24} /></div>
              <div className="stat-value">{successRate}%</div>
              <div className="stat-label-text">Success Rate</div>
            </motion.div>
          </div>

          {/* Charts */}
          <ChartsSection stats={applicationStats} />

          {/* Search */}
          <div className="search-section">
            <div className="search-input">
              <Search size={18} style={{ color: "#94a3b8" }} />
              <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option>All categories</option>
              {jobCategories.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Applications List */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Applications</h2>
                <p className="section-subtitle">
                  {statusFilter === "all" ? "Latest applications" : `Showing ${filteredApplications.length} ${statusFilter} applications`}
                </p>
              </div>
              <div className="section-actions">
                <div className="filter-wrapper">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="btn filter-select">
                    <option value="all">All Status ({total})</option>
                    <option value="applied">Applied ({applicationStats.applied})</option>
                    <option value="pending">Pending ({applicationStats.pending})</option>
                    <option value="shortlisted">Shortlisted ({applicationStats.shortlisted})</option>
                    <option value="rejected">Rejected ({applicationStats.rejected})</option>
                  </select>
                  <Filter size={16} className="filter-icon" />
                </div>
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p>No applications found with this status.</p>
                {statusFilter !== "all" && (
                  <button className="btn" onClick={() => setStatusFilter("all")} style={{ marginTop: "1rem" }}>Show All Applications</button>
                )}
              </div>
            ) : (
              <div className="applications-list">
                {filteredApplications.map((app) => (
                  <motion.div key={app.id} className="application-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="application-info">
                      <h3 className="application-title">{app.title}</h3>
                      <div className="application-meta">
                        <span>{app.company}</span>
                        <span>•</span>
                        <span>{app.date}</span>
                        <span>•</span>
                        <span>{app.location}</span>
                      </div>
                    </div>
                    <div className={`application-status ${app.status}`}>
                      {(app.status === "applied" || app.status === "pending") && <Clock size={14} />}
                      {app.status === "shortlisted" && <CheckCircle size={14} />}
                      {app.status === "rejected" && <X size={14} />}
                      {app.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <div className="categories-dropdown" ref={dropdownRef}>
              <button className={`dropdown-trigger ${showDropdown ? "open" : ""}`} onClick={() => setShowDropdown(!showDropdown)}>
                <Plus size={18} />
                Find Jobs
                <ChevronDown size={16} />
              </button>
              <div className={`dropdown-menu ${showDropdown ? "open" : ""}`}>
                <button className="dropdown-item" onClick={() => setCurrentView("successRate")}>
                  <Search size={16} /> View Analytics
                </button>
                <button className="dropdown-item">
                  <Upload size={16} /> Import from LinkedIn
                </button>
                <div className="dropdown-divider" />
                <div className="dropdown-label">Quick Categories</div>
                {jobCategories.map((cat) => (
                  <button key={cat} className="dropdown-item" onClick={() => handleCategorySelect(cat)}>
                    <Briefcase size={16} /> {cat} Jobs
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddJob} type="job" />}
      </AnimatePresence>
    </DashboardShell>
  );
}

// Donut Chart Component
function DonutChart({ stats }) {
  const colors = { applied: "#f97316", pending: "#fbbf24", shortlisted: "#22c55e", rejected: "#ef4444" };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = Object.entries(stats).map(([key, value]) => {
    const percent = total > 0 ? value / total : 0;
    const dash = percent * circumference;
    const segment = { key, value, color: colors[key], dasharray: `${dash} ${circumference - dash}`, offset: -offset };
    offset += dash;
    return segment;
  });

  return (
    <div className="donut-container">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((s) => (
          <circle key={s.key} cx="60" cy="60" r={radius} fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={s.dasharray} strokeDashoffset={s.offset} strokeLinecap="round" transform="rotate(-90 60 60)" />
        ))}
      </svg>
      <div className="donut-center">
        <div className="donut-number">{total}</div>
        <div className="donut-label">Apps</div>
      </div>
    </div>
  );
}

// Charts Section Component
function ChartsSection({ stats }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    const orange = "rgb(249,115,22)";
    const orangeAlpha = "rgba(249,115,22,0.12)";
    const grid = "#f1f5f9";
    const tick = "#94a3b8";

    Object.values(chartsRef.current).forEach((chart) => chart?.destroy());

    if (lineRef.current) {
      chartsRef.current.line = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{ label: "Applications", data: [1, 3, 2, 5, 4, 6, 3], borderColor: orange, backgroundColor: orangeAlpha, fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick } },
          },
        },
      });
    }

    if (pieRef.current) {
      chartsRef.current.pie = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Applied", "Pending", "Shortlisted", "Rejected"],
          datasets: [{ data: [stats.applied, stats.pending, stats.shortlisted, stats.rejected], backgroundColor: ["#f97316", "#fbbf24", "#22c55e", "#ef4444"], borderWidth: 2, borderColor: "#fff" }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: "60%" },
      });
    }

    if (barRef.current) {
      chartsRef.current.bar = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Tech", "Design", "Marketing", "Finance"],
          datasets: [{ label: "Jobs", data: [12, 8, 5, 7], backgroundColor: ["rgba(249,115,22,0.8)", "rgba(249,115,22,0.6)", "rgba(249,115,22,0.4)", "rgba(249,115,22,0.2)"], borderRadius: 6 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick } },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
    };
  }, [stats]);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Weekly Application Trend</h3>
          <p className="chart-subtitle">Applications over the last 7 days</p>
        </div>
        <div className="chart-container"><canvas ref={lineRef} /></div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Application Status</h3>
          <p className="chart-subtitle">Current application breakdown</p>
        </div>
        <div className="chart-container"><canvas ref={pieRef} /></div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Popular Categories</h3>
          <p className="chart-subtitle">Most applied job categories</p>
        </div>
        <div className="chart-container"><canvas ref={barRef} /></div>
      </div>
    </div>
  );
}