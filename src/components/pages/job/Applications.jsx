import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Download, Eye, Mail, Calendar, Filter, CheckCircle,
  XCircle, Phone, MapPin, Briefcase, Star, Trash2, RefreshCw, Moon, Sun,
  TrendingUp, Users, Clock, Award, Target, ChevronDown, ChevronUp, Save,
  BookOpen, Activity, X
} from "lucide-react";
import { Chart, registerables } from "chart.js";
import "../../styles/Applications.css";

Chart.register(...registerables);

/* ─────────────────── DATA GENERATION ─────────────────── */
const NAMES = [
  "Aarav Sharma", "Priya Thapa", "Bikash Adhikari", "Sujata Rai", "Rohan Karki",
  "Maya Gurung", "Dipesh Paudel", "Anita Shrestha", "Sujan Tamang", "Rekha Pokhrel",
  "Amit Joshi", "Kabita Bhandari", "Nabin Neupane", "Sunita Magar", "Arjun Basnet",
  "Puja Dahal", "Krishna Khatri", "Binita Limbu", "Sanjay Giri", "Nisha Bhatt",
  "Gaurav Acharya", "Sima Chaudhary", "Rajan Bhusal", "Pooja Devkota", "Sachin Mishra",
  "Laxmi Chhetri", "Nishant Dhakal", "Meena Sapkota", "Prabin Koirala", "Sarita Bajracharya"
];
const POSITIONS = [
  "Frontend Developer", "Backend Engineer", "UI/UX Designer", "Product Manager",
  "Data Analyst", "DevOps Engineer", "QA Engineer", "Marketing Manager",
  "Sales Executive", "HR Specialist", "Flutter Developer", "SEO Specialist",
  "Content Writer", "Finance Analyst", "Operations Manager"
];
const DEPTS = ["IT", "HR", "Marketing", "Finance", "Sales", "Operations", "Design", "Customer Support"];
const STATUSES = [
  "applied", "screening", "assessment", "shortlisted", "interview",
  "selected", "offer_sent", "joined", "rejected", "withdrawn"
];
const SOURCES = ["LinkedIn", "Website", "Facebook", "Instagram", "Referral", "Indeed", "Naukri", "Internal Database"];
const LOCATIONS = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Butwal", "Chitwan", "Biratnagar"];
const SKILLS = [
  "React", "Node.js", "Python", "Java", "Flutter", "PHP", "Vue.js", "Angular",
  "Django", "SQL", "MongoDB", "AWS", "Docker", "Figma", "Marketing", "Finance",
  "Excel", "SEO", "Tailwind", "TypeScript"
];
const EDUS = ["Bachelor", "Master", "PhD", "Diploma", "Certification"];
const RECRUITERS = ["Rachana Sharma", "Admin User", "HR Team", "Manager A", "Manager B"];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateApplications = () =>
  Array.from({ length: 327 }, (_, i) => {
    const msAgo = Math.random() * 365 * 24 * 3600 * 1000;
    const date = new Date(Date.now() - msAgo);
    const exp = rnd(0, 14);
    const nm = NAMES[i % NAMES.length];
    const rawSkills = Array.from({ length: rnd(2, 5) }, (_, j) => SKILLS[(i * 3 + j * 7) % SKILLS.length]);
    return {
      id: i + 1,
      name: nm,
      email: `${nm.toLowerCase().replace(/ /g, ".")}${rnd(10, 99)}@email.com`,
      phone: `+977-98${rnd(10000000, 99999999)}`,
      position: POSITIONS[i % POSITIONS.length],
      department: DEPTS[i % DEPTS.length],
      location: LOCATIONS[i % LOCATIONS.length],
      experience: exp,
      experienceLabel:
        exp === 0 ? "Fresher" : exp <= 2 ? "1–2 Yrs" : exp <= 5 ? "2–5 Yrs" : exp <= 10 ? "5–10 Yrs" : "10+ Yrs",
      education: EDUS[i % EDUS.length],
      skills: [...new Set(rawSkills)],
      expectedSalary: rnd(20, 120),
      appliedDate: date.toISOString().split("T")[0],
      appliedTs: date.getTime(),
      resumeScore: rnd(55, 99),
      matchScore: rnd(50, 99),
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      source: SOURCES[i % SOURCES.length],
      recruiter: RECRUITERS[i % RECRUITERS.length],
      bookmarked: Math.random() > 0.8,
      notes: "",
      interviewScore: {
        communication: rnd(55, 99),
        technical: rnd(50, 99),
        problemSolving: rnd(55, 99),
        leadership: rnd(50, 99),
        teamwork: rnd(60, 99),
        cultureFit: rnd(55, 99),
      },
      activityLog: [
        { action: "Applied", date: date.toISOString().split("T")[0], user: "System" },
        {
          action: "Screened",
          date: new Date(date.getTime() + 2 * 86400000).toISOString().split("T")[0],
          user: RECRUITERS[i % RECRUITERS.length],
        },
      ],
    };
  });

/* ─────────────────── DATE CHIP DEFINITIONS ─────────────────── */
const DATE_CHIPS = [
  { label: "Today", val: "today" },
  { label: "Yesterday", val: "yesterday" },
  { label: "Last 3 days", val: "3d" },
  { label: "Last 7 days", val: "7d" },
  { label: "Last 14 days", val: "14d" },
  { label: "Last 30 days", val: "30d" },
  { label: "Last 60 days", val: "60d" },
  { label: "Last 90 days", val: "90d" },
  { label: "Last 6 months", val: "6m" },
  { label: "Last year", val: "1y" },
  { label: "All time", val: "all" },
];

const getDateRange = (chip) => {
  const now = new Date(); now.setHours(23, 59, 59, 999);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const map = {
    today: [today, now],
    yesterday: [yesterday, new Date(yesterday.getTime() + 86399999)],
    "3d": [new Date(now - 3 * 86400000), now],
    "7d": [new Date(now - 7 * 86400000), now],
    "14d": [new Date(now - 14 * 86400000), now],
    "30d": [new Date(now - 30 * 86400000), now],
    "60d": [new Date(now - 60 * 86400000), now],
    "90d": [new Date(now - 90 * 86400000), now],
    "6m": [new Date(now - 180 * 86400000), now],
    "1y": [new Date(now - 365 * 86400000), now],
    all: [null, null],
  };
  return map[chip] || [null, null];
};

/* ─────────────────── STATUS BADGE COLORS ─────────────────── */
const STATUS_CLASS = {
  applied: "badge-applied", screening: "badge-screening", assessment: "badge-assessment",
  shortlisted: "badge-shortlisted", interview: "badge-interview", selected: "badge-selected",
  offer_sent: "badge-offer", joined: "badge-joined", rejected: "badge-rejected", withdrawn: "badge-withdrawn",
};

/* ─────────────────── MAIN COMPONENT ─────────────────── */
export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState(generateApplications);
  const [darkMode, setDarkMode] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("appliedDate");
  const [sortDir, setSortDir] = useState("desc");
  const [activeDateChip, setActiveDateChip] = useState("all");
  const [noteText, setNoteText] = useState("");

  const [filters, setFilters] = useState({
    status: "all", department: "all", location: "all",
    experience: "all", education: "all", source: "all",
    scoreMin: "", dateStart: "", dateEnd: "",
  });

  const chartRefs = {
    dept: useRef(null), status: useRef(null),
    exp: useRef(null), source: useRef(null), trend: useRef(null),
  };
  const chartInstances = useRef({});

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    const [rangeStart, rangeEnd] = getDateRange(activeDateChip);
    const q = search.toLowerCase();
    let result = applications.filter((a) => {
      if (q && ![a.name, a.email, a.position, a.department, a.location, ...a.skills]
        .some((v) => v.toLowerCase().includes(q))) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.department !== "all" && a.department !== filters.department) return false;
      if (filters.location !== "all" && a.location !== filters.location) return false;
      if (filters.education !== "all" && a.education !== filters.education) return false;
      if (filters.source !== "all" && a.source !== filters.source) return false;
      if (filters.experience !== "all") {
        const e = a.experience;
        if (filters.experience === "fresher" && e > 0) return false;
        if (filters.experience === "1-2" && (e < 1 || e > 2)) return false;
        if (filters.experience === "2-5" && (e < 2 || e > 5)) return false;
        if (filters.experience === "5-10" && (e < 5 || e > 10)) return false;
        if (filters.experience === "10+" && e < 10) return false;
      }
      if (filters.scoreMin && a.matchScore < parseInt(filters.scoreMin)) return false;
      if (rangeStart && new Date(a.appliedDate) < rangeStart) return false;
      if (rangeEnd && new Date(a.appliedDate) > rangeEnd) return false;
      if (filters.dateStart && a.appliedDate < filters.dateStart) return false;
      if (filters.dateEnd && a.appliedDate > filters.dateEnd) return false;
      return true;
    });

    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [applications, search, filters, sortKey, sortDir, activeDateChip]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  /* ── KPIs ── */
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const src = filtered.length ? filtered : applications;
    return {
      total: src.length,
      newToday: src.filter((a) => a.appliedDate === today).length,
      shortlisted: src.filter((a) => a.status === "shortlisted").length,
      pending: src.filter((a) => ["applied", "screening"].includes(a.status)).length,
      interviews: src.filter((a) => a.status === "interview").length,
      hired: src.filter((a) => a.status === "joined").length,
      rejected: src.filter((a) => a.status === "rejected").length,
      avgMatch: src.length ? Math.round(src.reduce((s, a) => s + a.matchScore, 0) / src.length) : 0,
      avgExp: src.length ? (src.reduce((s, a) => s + a.experience, 0) / src.length).toFixed(1) : "0",
    };
  }, [filtered, applications]);

  /* ── Charts ── */
  useEffect(() => {
    const src = filtered.length ? filtered : applications;
    Object.values(chartInstances.current).forEach((c) => { try { c.destroy(); } catch (_) { } });
    chartInstances.current = {};

    const O = "#f97316";

    // Department bar
    if (chartRefs.dept.current) {
      chartInstances.current.dept = new Chart(chartRefs.dept.current, {
        type: "bar",
        data: {
          labels: DEPTS.map((d) => (d.length > 8 ? d.slice(0, 8) + "…" : d)),
          datasets: [{ label: "Applications", data: DEPTS.map((d) => src.filter((a) => a.department === d).length), backgroundColor: O, borderRadius: 6 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } },
      });
    }

    // Status doughnut
    if (chartRefs.status.current) {
      const sColors = ["#f97316", "#3b82f6", "#fbbf24", "#8b5cf6", "#ec4899", "#22c55e", "#10b981", "#14b8a6", "#ef4444", "#6b7280"];
      chartInstances.current.status = new Chart(chartRefs.status.current, {
        type: "doughnut",
        data: {
          labels: STATUSES.map((s) => s.replace("_", " ")),
          datasets: [{ data: STATUSES.map((s) => src.filter((a) => a.status === s).length), backgroundColor: sColors, borderWidth: 2 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: "55%", plugins: { legend: { position: "right", labels: { font: { size: 9 }, boxWidth: 10, padding: 4 } } } },
      });
    }

    // Experience bar
    if (chartRefs.exp.current) {
      chartInstances.current.exp = new Chart(chartRefs.exp.current, {
        type: "bar",
        data: {
          labels: ["Fresher", "1–2y", "2–5y", "5–10y", "10y+"],
          datasets: [{
            label: "Candidates",
            data: [
              src.filter((a) => a.experience === 0).length,
              src.filter((a) => a.experience >= 1 && a.experience <= 2).length,
              src.filter((a) => a.experience > 2 && a.experience <= 5).length,
              src.filter((a) => a.experience > 5 && a.experience <= 10).length,
              src.filter((a) => a.experience > 10).length,
            ],
            backgroundColor: [O, "#3b82f6", "#22c55e", "#8b5cf6", "#ef4444"],
            borderRadius: 6,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 } } }, y: { ticks: { font: { size: 10 } } } } },
      });
    }

    // Source pie
    if (chartRefs.source.current) {
      const srcColors = ["#3b82f6", "#10b981", "#f97316", "#ec4899", "#8b5cf6", "#fbbf24", "#22c55e", "#14b8a6"];
      chartInstances.current.source = new Chart(chartRefs.source.current, {
        type: "pie",
        data: {
          labels: SOURCES,
          datasets: [{ data: SOURCES.map((s) => src.filter((a) => a.source === s).length), backgroundColor: srcColors, borderWidth: 2 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { font: { size: 9 }, boxWidth: 10, padding: 4 } } } },
      });
    }

    // 14-day trend line
    if (chartRefs.trend.current) {
      const days = [], labels = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString("en", { month: "short", day: "numeric" }));
        const ds = d.toISOString().split("T")[0];
        days.push(src.filter((a) => a.appliedDate === ds).length);
      }
      chartInstances.current.trend = new Chart(chartRefs.trend.current, {
        type: "line",
        data: { labels, datasets: [{ label: "Applications", data: days, borderColor: O, backgroundColor: O + "22", fill: true, tension: 0.4, pointRadius: 3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 9 }, maxRotation: 45 } }, y: { ticks: { font: { size: 10 } }, beginAtZero: true } } },
      });
    }

    return () => Object.values(chartInstances.current).forEach((c) => { try { c.destroy(); } catch (_) { } });
  }, [filtered, applications, darkMode]);

  /* ── Funnel data ── */
  const funnelStages = ["applied", "screening", "shortlisted", "interview", "selected", "joined"];
  const funnelLabels = ["Applied", "Screening", "Shortlisted", "Interview", "Selected", "Hired"];
  const src = filtered.length ? filtered : applications;
  const funnelCounts = funnelStages.map((s) => src.filter((a) => a.status === s).length);
  const maxFunnel = Math.max(...funnelCounts, 1);

  /* ── Actions ── */
  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const setStatus = useCallback((id, status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const toggleBookmark = useCallback((id) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, bookmarked: !a.bookmarked } : a)));
  }, []);

  const saveNote = (id) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, notes: noteText } : a)));
  };

  const bulkAction = (status) => {
    setApplications((prev) => prev.map((a) => (selectedIds.has(a.id) ? { ...a, status } : a)));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? new Set(paginated.map((a) => a.id)) : new Set());
  };

  const exportCSV = (data = filtered) => {
    const rows = data.map((a) => ({
      Name: a.name, Email: a.email, Phone: a.phone, Position: a.position,
      Department: a.department, Experience: a.experience, Location: a.location,
      Applied: a.appliedDate, Match: a.matchScore, Status: a.status,
    }));
    const csv = [Object.keys(rows[0]).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = "applications.csv"; el.click();
  };

  const resetFilters = () => {
    setSearch(""); setActiveDateChip("all"); setCurrentPage(1);
    setFilters({ status: "all", department: "all", location: "all", experience: "all", education: "all", source: "all", scoreMin: "", dateStart: "", dateEnd: "" });
  };

  const aiTag = (score) =>
    score >= 85 ? "🏆 Top candidate" : score >= 75 ? "⭐ Strong fit" : score >= 60 ? "✓ Good candidate" : "⚠ Needs review";

  const SortIcon = ({ k }) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  /* ────────────────────── RENDER ────────────────────── */
  return (
    <div className={`apps-page ${darkMode ? 'dark' : ''}`}>
      {/* ── Header ── */}
      <div className="apps-header glass-card">
        <button className="btn-back" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="header-title">
          <h1>Applications Management</h1>
          <p>Manage, filter, evaluate and track all {applications.length} candidates</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="btn-icon" onClick={() => setApplications(generateApplications())} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="btn-primary" onClick={() => exportCSV()}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        {[
          { label: "Total applications", value: kpis.total, icon: Users, color: "#f97316", trend: "+12%" },
          { label: "New today", value: kpis.newToday, icon: TrendingUp, color: "#22c55e", trend: "+5%" },
          { label: "Shortlisted", value: kpis.shortlisted, icon: CheckCircle, color: "#3b82f6", trend: "+8%" },
          { label: "Pending review", value: kpis.pending, icon: Clock, color: "#fbbf24", trend: "-3%" },
          { label: "Interviews", value: kpis.interviews, icon: Calendar, color: "#8b5cf6", trend: "+15%" },
          { label: "Hired", value: kpis.hired, icon: Award, color: "#10b981", trend: "+7%" },
          { label: "Rejected", value: kpis.rejected, icon: XCircle, color: "#ef4444", trend: "-2%" },
          { label: "Avg match score", value: `${kpis.avgMatch}%`, icon: Target, color: "#ec4899", trend: "+4%" },
          { label: "Avg experience", value: `${kpis.avgExp}y`, icon: Briefcase, color: "#14b8a6", trend: "0%" },
        ].map((k, i) => (
          <motion.div
            key={k.label} className="kpi-card glass-card"
            style={{ borderLeftColor: k.color }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="kpi-icon" style={{ background: k.color + "20" }}>
              <k.icon size={20} style={{ color: k.color }} />
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className={`kpi-trend ${k.trend.startsWith("+") ? "up" : k.trend === "0%" ? "" : "dn"}`}>{k.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="filters-card glass-card">
        <div className="filter-row-top">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text" placeholder="Search name, email, skill, position…"
              value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button className="btn-secondary" onClick={() => setShowFilters((s) => !s)}>
            <Filter size={15} /> Filters {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button className="btn-secondary" onClick={resetFilters}>
            <XCircle size={15} /> Reset
          </button>
        </div>

        {/* Date chips */}
        <div className="chip-row">
          {DATE_CHIPS.map((c) => (
            <button
              key={c.val}
              className={`chip${activeDateChip === c.val ? " active" : ""}`}
              onClick={() => { setActiveDateChip(c.val); setCurrentPage(1); }}
            >{c.label}</button>
          ))}
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="advanced-filters"
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            >
              {[
                { id: "status", label: "Status", options: STATUSES },
                { id: "department", label: "Department", options: DEPTS },
                { id: "location", label: "Location", options: LOCATIONS },
                { id: "education", label: "Education", options: EDUS },
                { id: "source", label: "Source", options: SOURCES },
              ].map(({ id, label, options }) => (
                <select
                  key={id} value={filters[id]}
                  onChange={(e) => { setFilters((f) => ({ ...f, [id]: e.target.value })); setCurrentPage(1); }}
                >
                  <option value="all">All {label}s</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <select value={filters.experience} onChange={(e) => { setFilters((f) => ({ ...f, experience: e.target.value })); setCurrentPage(1); }}>
                <option value="all">All experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-2">1–2 Yrs</option>
                <option value="2-5">2–5 Yrs</option>
                <option value="5-10">5–10 Yrs</option>
                <option value="10+">10+ Yrs</option>
              </select>
              <input type="number" placeholder="Min match score %" value={filters.scoreMin}
                onChange={(e) => { setFilters((f) => ({ ...f, scoreMin: e.target.value })); setCurrentPage(1); }} />
              <input type="date" value={filters.dateStart}
                onChange={(e) => { setFilters((f) => ({ ...f, dateStart: e.target.value })); setCurrentPage(1); }} />
              <input type="date" value={filters.dateEnd}
                onChange={(e) => { setFilters((f) => ({ ...f, dateEnd: e.target.value })); setCurrentPage(1); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bulk Action Bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div className="bulk-bar" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <span>{selectedIds.size} selected</span>
            <button onClick={() => bulkAction("shortlisted")}><CheckCircle size={14} /> Shortlist</button>
            <button onClick={() => bulkAction("interview")}><Calendar size={14} /> Interview</button>
            <button onClick={() => bulkAction("rejected")}><XCircle size={14} /> Reject</button>
            <button onClick={() => exportCSV(applications.filter((a) => selectedIds.has(a.id)))}><Download size={14} /> Export</button>
            <button onClick={() => setSelectedIds(new Set())}><Trash2 size={14} /> Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Charts ── */}
      <div className="charts-grid">
        <div className="chart-card glass-card">
          <h3>Applications by department</h3>
          <div className="chart-wrap"><canvas ref={chartRefs.dept} /></div>
        </div>
        <div className="chart-card glass-card">
          <h3>Status distribution</h3>
          <div className="chart-wrap"><canvas ref={chartRefs.status} /></div>
        </div>
        <div className="chart-card glass-card">
          <h3>Hiring funnel</h3>
          <div className="funnel-chart">
            {funnelCounts.map((c, i) => (
              <div key={i} className="funnel-row">
                <span className="funnel-label">{funnelLabels[i]}</span>
                <div className="funnel-bg">
                  <motion.div
                    className="funnel-fill"
                    initial={{ width: 0 }} animate={{ width: `${Math.round((c / maxFunnel) * 100)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  >{c}</motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card glass-card">
          <h3>Experience distribution</h3>
          <div className="chart-wrap"><canvas ref={chartRefs.exp} /></div>
        </div>
        <div className="chart-card glass-card">
          <h3>Candidate sources</h3>
          <div className="chart-wrap"><canvas ref={chartRefs.source} /></div>
        </div>
        <div className="chart-card glass-card">
          <h3>Daily trend — last 14 days</h3>
          <div className="chart-wrap"><canvas ref={chartRefs.trend} /></div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-card glass-card">
        <div className="table-toolbar">
          <span className="table-info">
            Showing {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} candidates
          </span>
          <div className="table-controls">
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <select value={`${sortKey}-${sortDir}`} onChange={(e) => {
              const [k, d] = e.target.value.split("-");
              setSortKey(k); setSortDir(d); setCurrentPage(1);
            }}>
              <option value="appliedDate-desc">Newest first</option>
              <option value="appliedDate-asc">Oldest first</option>
              <option value="matchScore-desc">Highest score</option>
              <option value="name-asc">Name A–Z</option>
              <option value="experience-desc">Most experienced</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={paginated.length > 0 && paginated.every((a) => selectedIds.has(a.id))}
                  />
                </th>
                <th onClick={() => handleSort("name")} className="sortable">
                  Candidate <SortIcon k="name" />
                </th>
                <th onClick={() => handleSort("position")} className="sortable">
                  Position <SortIcon k="position" />
                </th>
                <th onClick={() => handleSort("experience")} className="sortable">
                  Exp <SortIcon k="experience" />
                </th>
                <th onClick={() => handleSort("location")} className="sortable">
                  Location <SortIcon k="location" />
                </th>
                <th onClick={() => handleSort("appliedDate")} className="sortable">
                  Applied <SortIcon k="appliedDate" />
                </th>
                <th onClick={() => handleSort("matchScore")} className="sortable">
                  Match <SortIcon k="matchScore" />
                </th>
                <th onClick={() => handleSort("status")} className="sortable">
                  Status <SortIcon k="status" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((app) => (
                <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                    />
                  </td>
                  <td>
                    <div className="candidate-cell">
                      <div className="avatar">{app.name.charAt(0)}</div>
                      <div>
                        <div className="cand-name">{app.name}</div>
                        <div className="cand-email">{app.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cand-name">{app.position}</div>
                    <div className="cand-email">{app.department}</div>
                  </td>
                  <td>{app.experienceLabel}</td>
                  <td>{app.location}</td>
                  <td>{app.appliedDate}</td>
                  <td>
                    <div className="score-cell">
                      <div className="score-track">
                        <div
                          className={`score-fill ${app.matchScore >= 80 ? "high" : app.matchScore >= 60 ? "mid" : "low"}`}
                          style={{ width: `${app.matchScore}%` }}
                        />
                      </div>
                      <span className="score-num">{app.matchScore}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[app.status] || ""}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="act-btn" title="View" onClick={() => { setSelectedCandidate(app); setNoteText(app.notes); }}>
                        <Eye size={14} />
                      </button>
                      <button className="act-btn" title="Shortlist" onClick={() => setStatus(app.id, "shortlisted")}>
                        <CheckCircle size={14} />
                      </button>
                      <button className="act-btn" title={app.bookmarked ? "Unbookmark" : "Bookmark"} onClick={() => toggleBookmark(app.id)}>
                        <Star size={14} fill={app.bookmarked ? "#fbbf24" : "none"} color={app.bookmarked ? "#fbbf24" : "currentColor"} />
                      </button>
                      <button className="act-btn danger" title="Reject" onClick={() => setStatus(app.id, "rejected")}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* ── Candidate Drawer ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCandidate(null)} />
            <motion.div className="drawer glass-card" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
              <div className="drawer-header">
                <h2>Candidate Details</h2>
                <button className="btn-icon" onClick={() => setSelectedCandidate(null)}><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="drawer-profile">
                  <div className="avatar-large">{selectedCandidate.name.charAt(0)}</div>
                  <h3>{selectedCandidate.name}</h3>
                  <p>{selectedCandidate.position} • {selectedCandidate.department}</p>
                  <span className="tag-ai">{aiTag(selectedCandidate.matchScore)}</span>
                </div>
                <hr />
                <div className="drawer-info-section">
                  <h4>Contact Information</h4>
                  <p><Mail size={14} /> {selectedCandidate.email}</p>
                  <p><Phone size={14} /> {selectedCandidate.phone}</p>
                  <p><MapPin size={14} /> {selectedCandidate.location}</p>
                </div>
                <hr />
                <div className="drawer-info-section">
                  <h4>Application Details</h4>
                  <p><Briefcase size={14} /> Experience: {selectedCandidate.experienceLabel} ({selectedCandidate.experience} years)</p>
                  <p><BookOpen size={14} /> Education: {selectedCandidate.education}</p>
                  <p><Calendar size={14} /> Applied on: {selectedCandidate.appliedDate}</p>
                  <p><Activity size={14} /> Source: {selectedCandidate.source}</p>
                </div>
                <hr />
                <div className="drawer-info-section">
                  <h4>Skills</h4>
                  <div className="skills-wrap">
                    {selectedCandidate.skills.map(skill => (
                      <span key={skill} className="skill-chip">{skill}</span>
                    ))}
                  </div>
                </div>
                <hr />
                <div className="drawer-info-section">
                  <h4>Notes</h4>
                  <textarea 
                    value={noteText} 
                    onChange={(e) => setNoteText(e.target.value)} 
                    placeholder="Add private evaluation notes here..."
                  />
                  <button className="btn-secondary" style={{ marginTop: '8px' }} onClick={() => saveNote(selectedCandidate.id)}>
                    <Save size={14} /> Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}