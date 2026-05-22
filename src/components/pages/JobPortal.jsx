import { useState, useRef, useEffect } from "react";
import {
  Briefcase, Plus, Eye, Search, ChevronDown, Upload, Clock,
  CheckCircle, TrendingUp, X, FileText, Mail, Phone, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";
import { Modal } from "../Modal";
import "../styles/Global.css";
import "../styles/JobPortal.css";
import { DashboardShell } from "../shared/DashboardShell";

// Import sub-pages
import SuccessRate from "../pages/job/SuccessRate";
import Applications from "../pages/job/Applications";
import InterviewCalls from "../pages/job/InterviewCalls";
import Rejections from "../pages/job/Rejections";
import CVViewer from "../pages/job/CVViewer";

export default function JobPortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ROUTING STATE - 6 possible views
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard | applications | successRate | interviews | rejections | cvViewer
  const [applicationsTab, setApplicationsTab] = useState("all"); // all | pending | shortlisted

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const [applications, setApplications] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      date: "May 10",
      status: "applied",
      location: "Remote",
      salary: "$80k-100k",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Design Inc",
      date: "May 11",
      status: "shortlisted",
      location: "New York",
      salary: "$70k-90k",
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "Software Ltd",
      date: "May 12",
      status: "pending",
      location: "San Francisco",
      salary: "$100k-130k",
    },
    {
      id: 4,
      title: "Product Manager",
      company: "Startup Inc",
      date: "May 13",
      status: "interview",
      location: "Remote",
      salary: "$120k-150k",
    },
    {
      id: 5,
      title: "Data Analyst",
      company: "Analytics Co",
      date: "May 9",
      status: "rejected",
      location: "Boston",
      salary: "$75k-95k",
    },
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

  const applicationStats = {
    Applied: applications.filter(a => a.status === "applied").length,
    Pending: applications.filter(a => a.status === "pending").length,
    Shortlisted: applications.filter(a => a.status === "shortlisted").length,
    Rejected: applications.filter(a => a.status === "rejected").length,
    Interview: applications.filter(a => a.status === "interview").length,
  };

  const jobCategories = ["Tech", "Design", "Marketing", "Sales", "Finance", "Remote"];

  const total = Object.values(applicationStats).reduce((a, b) => a + b, 0);
  const successRate = applicationStats.Applied > 0
   ? Math.round((applicationStats.Shortlisted / applicationStats.Applied) * 100)
    : 0;

  const interviewCount = applicationStats.Interview;

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current &&!dropdownRef.current.contains(e.target)) {
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
    return <Applications
      applications={applications}
      onBack={() => setCurrentView("dashboard")}
      initialTab={applicationsTab}
    />;
  }

  if (currentView === "interviews") {
    return <InterviewCalls
      applications={applications}
      onBack={() => setCurrentView("dashboard")}
    />;
  }

  if (currentView === "rejections") {
    return <Rejections
      applications={applications}
      onBack={() => setCurrentView("dashboard")}
    />;
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
            {/* 1. Add Jobs - Modal */}
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
                <span className="circle-badge">{applicationStats.Applied}</span>
              </div>
            </motion.button>

            {/* 2. Pending - Applications page with pending filter */}
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
                <span className="circle-badge">{applicationStats.Pending}</span>
              </div>
            </motion.button>

            {/* 3. Shortlisted - Applications page with shortlisted filter */}
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
                <span className="circle-badge">{applicationStats.Shortlisted}</span>
              </div>
            </motion.button>

            {/* 4. View CV - CVViewer page */}
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
                  const colors = {
                    Applied: "#f97316",
                    Pending: "#fbbf24",
                    Shortlisted: "#22c55e",
                    Rejected: "#ef4444",
                    Interview: "#3b82f6",
                  };
                  return (
                    <div key={key} className="stat-row">
                      <div className="stat-header">
                        <div className="stat-label">
                          <span className="stat-dot" style={{ background: colors[key] }} />
                          {key}
                        </div>
                        <span className="stat-value">{value}</span>
                      </div>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar"
                          style={{
                            width: `${total > 0? (value / total) * 100 : 0}%`,
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

          {/* Quick Stats Grid - Updated with new routes */}
          <div className="quick-stats">
            {/* Card 1: Applications */}
            <motion.div
              className="stat-card"
              whileHover={{ y: -5 }}
              onClick={() => {
                setApplicationsTab("all");
                setCurrentView("applications");
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon"><Briefcase size={24} /></div>
              <div className="stat-value">{applicationStats.Applied}</div>
              <div className="stat-label-text">Applications</div>
            </motion.div>

            {/* Card 2: Interviews Call - Opens InterviewCalls page */}
            <motion.div
              className="stat-card"
              whileHover={{ y: -5 }}
              onClick={() => setCurrentView("interviews")}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon" style={{ color: "#3b82f6" }}><Mail size={24} /></div>
              <div className="stat-value">{interviewCount}</div>
              <div className="stat-label-text">Interviews Call</div>
            </motion.div>

            {/* Card 3: Rejections - Opens Rejections page */}
            <motion.div
              className="stat-card"
              whileHover={{ y: -5 }}
              onClick={() => setCurrentView("rejections")}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon" style={{ color: "#ef4444" }}><X size={24} /></div>
              <div className="stat-value">{applicationStats.Rejected}</div>
              <div className="stat-label-text">Rejections</div>
            </motion.div>

            {/* Card 4: Success Rate */}
            <motion.div
              className="stat-card"
              whileHover={{ y: -5 }}
              onClick={() => setCurrentView("successRate")}
              style={{ cursor: 'pointer' }}
            >
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
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All categories</option>
              {jobCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Applications List */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Applications</h2>
                <p className="section-subtitle">Latest applications</p>
              </div>
            </div>
            <div className="applications-list">
              {applications.filter(app =>
                app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.company.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((app) => (
                <motion.div
                  key={app.id}
                  className="application-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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
                    {app.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dropdown */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <div className="categories-dropdown" ref={dropdownRef}>
              <button
                className={`dropdown-trigger ${showDropdown? "open" : ""}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Plus size={18} />
                Find Jobs
                <ChevronDown size={16} />
              </button>
              <div className={`dropdown-menu ${showDropdown? "open" : ""}`}>
                <button className="dropdown-item" onClick={() => setCurrentView("successRate")}>
                  <Search size={16} />
                  View Analytics
                </button>
                <button className="dropdown-item">
                  <Upload size={16} />
                  Import from LinkedIn
                </button>
                <div className="dropdown-divider" />
                <div className="dropdown-label">Quick Categories</div>
                {jobCategories.map((cat) => (
                  <button
                    key={cat}
                    className="dropdown-item"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <Briefcase size={16} />
                    {cat} Jobs
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddJob}
            type="job"
          />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

// Donut Chart Component
function DonutChart({ stats }) {
  const colors = {
    Applied: "#f97316",
    Pending: "#fbbf24",
    Shortlisted: "#22c55e",
    Rejected: "#ef4444",
    Interview: "#3b82f6",
  };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = Object.entries(stats).map(([key, value]) => {
    const percent = total > 0? value / total : 0;
    const dash = percent * circumference;
    const segment = {
      key,
      value,
      color: colors[key],
      dasharray: `${dash} ${circumference - dash}`,
      offset: -offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="donut-container">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
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
          datasets: [
            {
              label: "Applications",
              data: [1, 3, 2, 5, 4, 6, 3],
              borderColor: orange,
              backgroundColor: orangeAlpha,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
            },
          ],
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
          labels: ["Applied", "Pending", "Shortlisted", "Rejected", "Interview"],
          datasets: [
            {
              data: [stats.Applied, stats.Pending, stats.Shortlisted, stats.Rejected, stats.Interview],
              backgroundColor: ["#f97316", "#fbbf24", "#22c55e", "#ef4444", "#3b82f6"],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: "60%",
        },
      });
    }

    if (barRef.current) {
      chartsRef.current.bar = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: ["Tech", "Design", "Marketing", "Finance"],
          datasets: [
            {
              label: "Jobs",
              data: [12, 8, 5, 7],
              backgroundColor: [
                "rgba(249,115,22,0.8)",
                "rgba(249,115,22,0.6)",
                "rgba(249,115,22,0.4)",
                "rgba(249,115,22,0.2)",
              ],
              borderRadius: 6,
            },
          ],
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
        <div className="chart-container">
          <canvas ref={lineRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Application Status</h3>
          <p className="chart-subtitle">Current application breakdown</p>
        </div>
        <div className="chart-container">
          <canvas ref={pieRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Popular Categories</h3>
          <p className="chart-subtitle">Most applied job categories</p>
        </div>
        <div className="chart-container">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
}