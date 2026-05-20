import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Download, Clock, CheckCircle, TrendingUp,
  DollarSign, Users, XCircle, Zap, AlertTriangle, Info,
  Star, Calendar, Search, Filter, ChevronDown, ChevronLeft,
  ChevronRight, FileText, RefreshCw, Activity, Award,
  BarChart2, PieChart,
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/Bookinganalytics.css"

/* ─────────────────────────────────────
   SAMPLE / DEFAULT DATA
───────────────────────────────────── */
const DEFAULT_BOOKINGS = [
  { id: 1001, serviceName: "House Cleaning",    customer: "John",    date: "May 10", status: "pending",   revenue: 120 },
  { id: 1002, serviceName: "Plumbing",           customer: "Sarah",   date: "May 11", status: "confirmed", revenue: 90  },
  { id: 1003, serviceName: "Electrical Repair",  customer: "Mike",    date: "May 12", status: "completed", revenue: 150 },
  { id: 1004, serviceName: "House Cleaning",    customer: "Emily",   date: "May 13", status: "completed", revenue: 120 },
  { id: 1005, serviceName: "Plumbing",           customer: "John",    date: "May 14", status: "cancelled", revenue: 90  },
  { id: 1006, serviceName: "House Cleaning",    customer: "Priya",   date: "May 15", status: "confirmed", revenue: 120 },
  { id: 1007, serviceName: "Electrical Repair",  customer: "Raj",     date: "May 16", status: "pending",   revenue: 150 },
  { id: 1008, serviceName: "Garden Care",        customer: "Sarah",   date: "May 16", status: "completed", revenue: 80  },
  { id: 1009, serviceName: "Plumbing",           customer: "Mike",    date: "May 17", status: "confirmed", revenue: 90  },
  { id: 1010, serviceName: "House Cleaning",    customer: "Anita",   date: "May 17", status: "completed", revenue: 120 },
];

const DEFAULT_SERVICES = [
  { id: 1, name: "House Cleaning",   price: "120", category: "Home",       bookings: 12, rating: 4.8 },
  { id: 2, name: "Plumbing",          price: "90",  category: "Repair",     bookings: 8,  rating: 4.6 },
  { id: 3, name: "Electrical Repair", price: "150", category: "Repair",     bookings: 10, rating: 4.9 },
  { id: 4, name: "Garden Care",       price: "80",  category: "Outdoor",    bookings: 5,  rating: 4.7 },
];

const STATUS_COLORS = {
  pending:   { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  confirmed: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  completed: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

const ITEMS_PER_PAGE = 6;

/* ─────────────────────────────────────
   HELPERS
───────────────────────────────────── */
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────── */

// ── Skeleton ──
function Skeleton({ w = "100%", h = 16, r = 8 }) {
  return <div className="ba-skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

// ── KPI Card ──
function KpiCard({ icon: Icon, color, value, label, trend, delay = 0 }) {
  return (
    <motion.div
      className="ba-kpi-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}
    >
      <div className="ba-kpi-top">
        <div className="ba-kpi-icon" style={{ background: color }}>
          <Icon size={22} color="#fff" />
        </div>
        {trend !== undefined && (
          <span className={`ba-kpi-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="ba-kpi-value">{value}</div>
      <div className="ba-kpi-label">{label}</div>
    </motion.div>
  );
}

// ── Insight Card ──
function InsightCard({ type, icon: Icon, title, text, delay = 0 }) {
  return (
    <motion.div
      className={`ba-insight-card ${type}`}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="ba-insight-icon-wrap">
        <Icon size={20} />
      </div>
      <div>
        <div className="ba-insight-title">{title}</div>
        <div className="ba-insight-text">{text}</div>
      </div>
    </motion.div>
  );
}

// ── Charts ──
function ChartsSection({ bookings, services }) {
  const statusRef   = useRef(null);
  const weeklyRef   = useRef(null);
  const peakRef     = useRef(null);
  const customerRef = useRef(null);
  const growthRef   = useRef(null);
  const chartsRef   = useRef({});

  useEffect(() => {
    Object.values(chartsRef.current).forEach((c) => c?.destroy());
    chartsRef.current = {};

    const grid = "#f1f5f9", tick = "#94a3b8";

    // Status Doughnut
    if (statusRef.current) {
      chartsRef.current.status = new Chart(statusRef.current, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
          datasets: [{
            data: [
              bookings.filter(b => b.status === "pending").length,
              bookings.filter(b => b.status === "confirmed").length,
              bookings.filter(b => b.status === "completed").length,
              bookings.filter(b => b.status === "cancelled").length,
            ],
            backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"],
            borderWidth: 3, borderColor: "#fff",
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "70%",
          plugins: {
            legend: { position: "bottom", labels: { color: tick, padding: 16, font: { size: 12 }, usePointStyle: true } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } },
          },
        },
      });
    }

    // Weekly Trend Line
    if (weeklyRef.current) {
      chartsRef.current.weekly = new Chart(weeklyRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: "Bookings",
            data: [2, 5, 3, 8, 6, 9, 12],
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.1)",
            fill: true, tension: 0.4, borderWidth: 3,
            pointBackgroundColor: "#f97316", pointRadius: 5, pointHoverRadius: 7,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, stepSize: 2 } },
          },
        },
      });
    }

    // Peak Hours Bar
    if (peakRef.current) {
      chartsRef.current.peak = new Chart(peakRef.current, {
        type: "bar",
        data: {
          labels: ["9AM", "11AM", "1PM", "3PM", "5PM", "7PM"],
          datasets: [{
            label: "Bookings",
            data: [3, 8, 12, 6, 9, 4],
            backgroundColor: [
              "rgba(249,115,22,0.5)", "rgba(249,115,22,0.6)",
              "rgba(249,115,22,0.95)", "rgba(249,115,22,0.6)",
              "rgba(249,115,22,0.75)", "rgba(249,115,22,0.45)",
            ],
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, stepSize: 2 } },
          },
        },
      });
    }

    // Customer Frequency Pie
    if (customerRef.current) {
      const custMap = {};
      bookings.forEach(b => { custMap[b.customer || "Unknown"] = (custMap[b.customer || "Unknown"] || 0) + 1; });
      const customers = Object.keys(custMap);
      const counts = customers.map(c => custMap[c]);
      const palette = ["#f97316", "#3b82f6", "#22c55e", "#fbbf24", "#8b5cf6", "#ec4899"];
      chartsRef.current.customer = new Chart(customerRef.current, {
        type: "pie",
        data: {
          labels: customers,
          datasets: [{
            data: counts,
            backgroundColor: palette.slice(0, customers.length),
            borderWidth: 3, borderColor: "#fff",
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: tick, padding: 12, font: { size: 11 }, usePointStyle: true } },
          },
        },
      });
    }

    // Monthly Growth Bar (wide)
    if (growthRef.current) {
      chartsRef.current.growth = new Chart(growthRef.current, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: "Bookings",
            data: [5, 8, 12, 15, 18, bookings.length],
            backgroundColor: bookings.length >= 18
              ? ["#bbf7d0","#86efac","#4ade80","#22c55e","#16a34a","#15803d"]
              : ["#bbf7d0","#86efac","#4ade80","#22c55e","#16a34a", "rgba(34,197,94,0.5)"],
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.raw} bookings` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, stepSize: 5 } },
          },
        },
      });
    }

    return () => { Object.values(chartsRef.current).forEach(c => c?.destroy()); };
  }, [bookings]);

  const cards = [
    { ref: statusRef,   title: "Booking Status",           subtitle: "Current distribution",         icon: PieChart,  wide: false },
    { ref: weeklyRef,   title: "Weekly Booking Trend",     subtitle: "Bookings over last 7 days",    icon: TrendingUp, wide: false },
    { ref: peakRef,     title: "Peak Booking Hours",       subtitle: "Which hours are busiest",      icon: Clock,     wide: false },
    { ref: customerRef, title: "Customer Frequency",       subtitle: "Repeat vs new customers",      icon: Users,     wide: false },
    { ref: growthRef,   title: "Monthly Booking Growth",   subtitle: "6-month booking trajectory",   icon: BarChart2, wide: true  },
  ];

  return (
    <div className="ba-charts-grid">
      {cards.map(({ ref, title, subtitle, icon: Icon, wide }, i) => (
        <motion.div
          key={title}
          className={`ba-chart-card${wide ? " wide" : ""}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(249,115,22,0.12)" }}
        >
          <div className="ba-chart-header">
            <div className="ba-chart-icon-wrap"><Icon size={18} /></div>
            <div>
              <h3 className="ba-chart-title">{title}</h3>
              <p className="ba-chart-subtitle">{subtitle}</p>
            </div>
          </div>
          <div className="ba-chart-wrap"><canvas ref={ref} /></div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
export default function BookingAnalytics({ services: propServices, bookings: propBookings, onBack }) {
  const bookings = propBookings?.length ? propBookings : DEFAULT_BOOKINGS;
  const services = propServices?.length ? propServices : DEFAULT_SERVICES;

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("all");
  const [searchRaw,    setSearchRaw]    = useState("");
  const [sortKey,      setSortKey]      = useState("id");
  const [sortDir,      setSortDir]      = useState("desc");
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);

  const searchQuery = useDebounce(searchRaw, 300);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total     = bookings.length;
    const pending   = bookings.filter(b => b.status === "pending").length;
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;
    const compRate  = total > 0 ? Math.round((completed / total) * 100) : 0;
    const revenue   = bookings.filter(b => b.status === "completed").reduce((s, b) => s + Number(b.revenue || 0), 0);
    const uniqueCust = new Set(bookings.map(b => b.customer)).size;
    return { total, pending, confirmed, completed, cancelled, compRate, revenue, uniqueCust };
  }, [bookings]);

  // ── Filtered + sorted + paginated ──
  const filtered = useMemo(() => {
    let result = bookings.filter(b => {
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const matchSearch = !searchQuery || 
        b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
    result = [...result].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "revenue") { va = Number(a.revenue || 0); vb = Number(b.revenue || 0); }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return result;
  }, [bookings, statusFilter, searchQuery, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  useEffect(() => setPage(1), [statusFilter, searchQuery]);

  // ── CSV Export ──
  const exportCSV = useCallback(() => {
    const headers = ["ID", "Service", "Customer", "Date", "Status", "Revenue"];
    const rows = filtered.map(b => [b.id, b.serviceName, b.customer || "Unknown", b.date, b.status, Number(b.revenue || 0)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "booking_analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  // ── Insights ──
  const insights = useMemo(() => [
    {
      type: "success", icon: Award, title: "Completion Rate",
      text: `${kpis.compRate}% completion rate — excellent performance!`,
    },
    {
      type: "warning", icon: AlertTriangle, title: "Pending Actions",
      text: `${kpis.pending} booking${kpis.pending !== 1 ? "s" : ""} awaiting confirmation.`,
    },
    {
      type: "info", icon: Info, title: "Peak Booking Hour",
      text: "1PM is your busiest hour with 12 bookings on average.",
    },
    ...(kpis.cancelled > 0 ? [{
      type: "danger", icon: XCircle, title: "Cancellations",
      text: `${kpis.cancelled} cancelled booking${kpis.cancelled !== 1 ? "s" : ""}. Review cancellation reasons.`,
    }] : [{
      type: "success", icon: CheckCircle, title: "Zero Cancellations",
      text: "No cancellations — outstanding service consistency!",
    }]),
    {
      type: "info", icon: Users, title: "Repeat Customers",
      text: `${kpis.uniqueCust} unique customers — build loyalty programs to boost retention.`,
    },
    {
      type: "success", icon: TrendingUp, title: "Total Revenue",
      text: `Completed bookings earned ${fmt(kpis.revenue)} in revenue.`,
    },
  ], [kpis]);

  const SortIcon = ({ k }) => (
    <span className="ba-sort-icon" style={{ opacity: sortKey === k ? 1 : 0.3 }}>
      {sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : " ▼"}
    </span>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <motion.div
      className="ba-page"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ba-container">

        {/* ── Header ── */}
        <div className="ba-header">
          {onBack && (
            <motion.button
              className="ba-back-btn"
              onClick={onBack}
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} /> Back
            </motion.button>
          )}
          <div className="ba-header-text">
            <h1 className="ba-page-title">Booking Analytics</h1>
            <p className="ba-page-subtitle">Track and optimize your booking performance</p>
          </div>
          <div className="ba-header-actions">
            <motion.button className="ba-refresh-btn" whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
              <RefreshCw size={16} />
            </motion.button>
            <motion.button
              className="ba-export-btn"
              onClick={exportCSV}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} /> Export CSV
            </motion.button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="ba-kpi-grid">
          <KpiCard icon={Clock}       color="#fbbf24" value={kpis.pending}            label="Pending"         trend={+5}  delay={0.05} />
          <KpiCard icon={CheckCircle} color="#3b82f6" value={kpis.confirmed}          label="Confirmed"       trend={+12} delay={0.10} />
          <KpiCard icon={CheckCircle} color="#22c55e" value={kpis.completed}          label="Completed"       trend={+8}  delay={0.15} />
          <KpiCard icon={TrendingUp}  color="#f97316" value={`${kpis.compRate}%`}     label="Completion Rate" trend={kpis.compRate > 50 ? +3 : -2} delay={0.20} />
          <KpiCard icon={DollarSign}  color="#8b5cf6" value={fmt(kpis.revenue)}       label="Total Revenue"   trend={+15} delay={0.25} />
          <KpiCard icon={Users}       color="#ec4899" value={kpis.uniqueCust}          label="Unique Customers"            delay={0.30} />
        </div>

       

        {/* ── Charts ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
          <div className="ba-section-label">
            <Activity size={16} /> Performance Charts
          </div>
          <ChartsSection bookings={bookings} services={services} />
        </motion.div>

        {/* ── Insights ── */}
        <motion.div
          className="ba-insights-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <h2 className="ba-insights-title">
            <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <Zap size={22} className="ba-zap-icon" />
            </motion.span>
            Smart Insights
          </h2>
          <div className="ba-insights-grid">
            {insights.map((ins, i) => (
              <InsightCard key={ins.title} delay={i * 0.06} {...ins} />
            ))}
          </div>
        </motion.div>
         {/* ── Filters ── */}
        <motion.div
          className="ba-filters-bar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <div className="ba-search-wrap">
            <Search size={15} className="ba-search-icon" />
            <input
              className="ba-search-input"
              placeholder="Search service or customer…"
              value={searchRaw}
              onChange={e => setSearchRaw(e.target.value)}
            />
          </div>
          <div className="ba-filter-select-wrap">
            <Filter size={14} className="ba-filter-prefix-icon" />
            <select className="ba-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="ba-chevron" />
          </div>
          <div className="ba-filter-select-wrap">
            <Calendar size={14} className="ba-filter-prefix-icon" />
            <select className="ba-filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <ChevronDown size={14} className="ba-chevron" />
          </div>
          <span className="ba-result-count">{filtered.length} bookings</span>
        </motion.div>

        {/* ── Table ── */}
        <motion.div
          className="ba-table-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="ba-table-top">
            <div>
              <h2 className="ba-table-title">Booking Management</h2>
              <p className="ba-table-subtitle">Full ledger — sort, filter and track every booking</p>
            </div>
            <motion.button className="ba-export-btn-sm" onClick={exportCSV} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <FileText size={15} /> CSV
            </motion.button>
          </div>

          {filtered.length === 0 ? (
            <motion.div className="ba-empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Calendar size={52} className="ba-empty-icon" />
              <h3 className="ba-empty-title">No bookings found</h3>
              <p className="ba-empty-sub">Try adjusting your filters or search query</p>
            </motion.div>
          ) : (
            <>
              <div className="ba-table-wrap">
                <table className="ba-table" aria-label="Booking management table">
                  <thead>
                    <tr>
                      <th className="ba-sort-th" onClick={() => toggleSort("id")} tabIndex={0} aria-sort={sortKey === "id" ? sortDir : "none"}>
                        ID <SortIcon k="id" />
                      </th>
                      <th className="ba-sort-th" onClick={() => toggleSort("customer")} tabIndex={0}>
                        Customer <SortIcon k="customer" />
                      </th>
                      <th className="ba-sort-th" onClick={() => toggleSort("serviceName")} tabIndex={0}>
                        Service <SortIcon k="serviceName" />
                      </th>
                      <th className="ba-sort-th" onClick={() => toggleSort("date")} tabIndex={0}>
                        Date <SortIcon k="date" />
                      </th>
                      <th className="ba-sort-th" onClick={() => toggleSort("status")} tabIndex={0}>
                        Status <SortIcon k="status" />
                      </th>
                      <th className="ba-sort-th" onClick={() => toggleSort("revenue")} tabIndex={0}>
                        Revenue <SortIcon k="revenue" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginated.map((b, i) => (
                        <motion.tr
                          key={b.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                        >
                          <td className="ba-td-id">#{b.id}</td>
                          <td className="ba-td-customer">{b.customer || "Unknown"}</td>
                          <td className="ba-td-service">{b.serviceName}</td>
                          <td className="ba-td-date">{b.date}</td>
                          <td>
                            <span
                              className="ba-status-badge"
                              style={{
                                background: STATUS_COLORS[b.status]?.bg,
                                color:      STATUS_COLORS[b.status]?.text,
                                border:     `1px solid ${STATUS_COLORS[b.status]?.border}`,
                              }}
                            >
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </td>
                          <td className="ba-td-revenue">{fmt(b.revenue)}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="ba-pagination">
                  <motion.button
                    className="ba-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <motion.button
                      key={p}
                      className={`ba-page-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    >
                      {p}
                    </motion.button>
                  ))}
                  <motion.button
                    className="ba-page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight size={16} />
                  </motion.button>
                  <span className="ba-page-info">
                    {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="ba-page">
      <div className="ba-container">
        <div className="ba-header" style={{ marginBottom: "2rem" }}>
          <Skeleton w={80} h={40} r={12} />
          <div style={{ flex: 1, paddingLeft: "1rem" }}>
            <Skeleton w="50%" h={28} r={6} style={{ marginBottom: 8 }} />
            <Skeleton w="35%" h={16} r={4} />
          </div>
        </div>
        <div className="ba-kpi-grid" style={{ marginBottom: "2rem" }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="ba-kpi-card"><Skeleton w="100%" h={110} r={12} /></div>)}
        </div>
        <div className="ba-charts-grid" style={{ marginBottom: "2rem" }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className={`ba-chart-card${i === 4 ? " wide" : ""}`}>
              <Skeleton w="100%" h={300} r={8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}