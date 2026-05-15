import { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Eye,
  Search,
  ChevronDown,
  Upload,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

import Chart from "chart.js/auto";
import { Modal } from "../Modal";

import "../styles/Global.css";
import "../styles/JobPortal.css";
import {
  DashboardShell,
  Greeting,
  SectionPanel,
} from "../shared/DashboardShell";

export default function JobPortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  const [applications] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Corp",
      date: "May 10",
      status: "applied",
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Design Inc",
      date: "May 11",
      status: "shortlisted",
    },
    {
      id: 3,
      title: "Backend Engineer",
      company: "Software Ltd",
      date: "May 12",
      status: "pending",
    },
  ]);

  const applicationStats = {
    Applied: 12,
    Pending: 4,
    Shortlisted: 5,
    Rejected: 3,
  };

  const jobCategories = [
    "Tech",
    "Design",
    "Marketing",
    "Sales",
    "Finance",
    "Remote",
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setShowDropdown(false);
  };

  const total = Object.values(applicationStats).reduce((a, b) => a + b, 0);

  const successRate =
    applicationStats.Applied > 0
   ? Math.round(
          (applicationStats.Shortlisted / applicationStats.Applied) * 100
        )
      : 0;

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

  return (
    <DashboardShell>
      <div className="job-page" style={{ paddingTop: '2px' }}>
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>

            <p className="page-subtitle">Manage your job applications</p>

            <span className="verified-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <polyline
                  points="22 4 12 14.01 9 11.01"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Verified
            </span>
          </div>

          {/* Action Circles */}
          <div className="action-circles">
            <button
              className="action-circle-btn primary"
              onClick={() => setModalOpen(true)}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Briefcase size={32} strokeWidth={3} />
                </div>

                <h3 className="circle-label">Add Jobs</h3>

                <p className="circle-sublabel">Applications</p>

                <span className="circle-badge">
                  {applicationStats.Applied}
                </span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Clock
                    size={32}
                    strokeWidth={3}
                    style={{ color: "#f97316" }}
                  />
                </div>

                <h3 className="circle-label">Pending</h3>

                <p className="circle-sublabel">Under Review</p>

                <span className="circle-badge">
                  {applicationStats.Pending}
                </span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <CheckCircle
                    size={32}
                    strokeWidth={3}
                    style={{ color: "#f97316" }}
                  />
                </div>

                <h3 className="circle-label">Shortlisted</h3>

                <p className="circle-sublabel">Approved</p>

                <span className="circle-badge">
                  {applicationStats.Shortlisted}
                </span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Eye
                    size={32}
                    strokeWidth={3}
                    style={{ color: "#f97316" }}
                  />
                </div>

                <h3 className="circle-label">View CV</h3>

                <p className="circle-sublabel">Preview</p>

                <span className="circle-badge">1</span>
              </div>
            </button>
          </div>

          {/* Application Stats */}
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
                  };

                  return (
                    <div key={key} className="stat-row">
                      <div className="stat-header">
                        <div className="stat-label">
                          <span
                            className="stat-dot"
                            style={{
                              background: colors[key],
                            }}
                          />

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

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Briefcase size={24} />
              </div>

              <div className="stat-value">{applicationStats.Applied}</div>

              <div className="stat-label-text">Applications</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>

              <div className="stat-value">{applicationStats.Pending}</div>

              <div className="stat-label-text">Pending</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle size={24} />
              </div>

              <div className="stat-value">{applicationStats.Shortlisted}</div>

              <div className="stat-label-text">Shortlisted</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>

              <div className="stat-value">{successRate}%</div>

              <div className="stat-label-text">Success Rate</div>
            </div>
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

          {/* Applications */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Applications</h2>

                <p className="section-subtitle">Latest applications</p>
              </div>
            </div>

            <div className="applications-list">
              {applications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="application-info">
                    <h3 className="application-title">{app.title}</h3>

                    <div className="application-meta">
                      <span>{app.company}</span>

                      <span>•</span>

                      <span>{app.date}</span>
                    </div>
                  </div>

                  <div className={`application-status ${app.status}`}>
                    {(app.status === "applied" || app.status === "pending") && (
                      <Clock size={14} />
                    )}

                    {app.status === "shortlisted" && <CheckCircle size={14} />}

                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropdown */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
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
                <button className="dropdown-item">
                  <Search size={16} />
                  Browse All Jobs
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

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={() => {}}
          type="job"
        />
      </div>
    </DashboardShell>
  );
}

// Donut Chart
function DonutChart({ stats }) {
  const colors = {
    Applied: "#f97316",
    Pending: "#fbbf24",
    Shortlisted: "#22c55e",
    Rejected: "#ef4444",
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
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
        />

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

// Charts Section - FIXED: Removed DashboardShell wrapper
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

    // Destroy existing charts before creating new ones
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
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: grid,
              },
              ticks: {
                color: tick,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: grid,
              },
              ticks: {
                color: tick,
              },
            },
          },
        },
      });
    }

    if (pieRef.current) {
      chartsRef.current.pie = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Applied", "Pending", "Shortlisted", "Rejected"],
          datasets: [
            {
              data: [
                stats.Applied,
                stats.Pending,
                stats.Shortlisted,
                stats.Rejected,
              ],
              backgroundColor: ["#f97316", "#fbbf24", "#22c55e", "#ef4444"],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
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
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: tick,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: grid,
              },
              ticks: {
                color: tick,
              },
            },
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

          <p className="chart-subtitle">
            Applications over the last 7 days
          </p>
        </div>

        <div className="chart-container">
          <canvas ref={lineRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Application Status</h3>

          <p className="chart-subtitle">
            Current application breakdown
          </p>
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