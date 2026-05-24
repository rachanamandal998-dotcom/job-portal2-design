import { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus, Eye, Calendar, Store, Wrench, Star, TrendingUp, Clock, CheckCircle, XCircle, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";
import { Modal } from "../Modal";
import "../styles/Global.css";
import "../styles/ServiceListing.css";
import { ListingFormModal } from "../shared/ListingFormModal";
import { DashboardShell } from "../shared/DashboardShell";

// Import analytics pages
import ServiceAnalytics from "../pages/service/ServiceAnalytics";
import BookingAnalytics from "../pages/service/BookingAnalytics";
import ServiceStore from "../pages/service/ServiceStore";
import RatingAnalytics from "../pages/service/RatingAnalytics";
import CompletionAnalytics from "../pages/service/CompletionAnalytics";

const getBookingStatus = (status) => {
  return status; // pending | confirmed | completed | cancelled
};

export default function ServiceListing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | confirmed | completed | cancelled

  // ROUTING STATE
  const [showServiceAnalytics, setShowServiceAnalytics] = useState(false);
  const [showBookingAnalytics, setShowBookingAnalytics] = useState(false);
  const [showServiceStore, setShowServiceStore] = useState(false);
  const [showRatingAnalytics, setShowRatingAnalytics] = useState(false);
  const [showCompletionAnalytics, setShowCompletionAnalytics] = useState(false);

  const [services, setServices] = useState([
    {
      id: 1,
      name: "House Cleaning",
      price: "120",
      category: "Home",
      description: "Professional home cleaning service",
      bookings: 12,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    },
    {
      id: 2,
      name: "Plumbing",
      price: "90",
      category: "Repair",
      description: "Expert plumbing repairs",
      bookings: 8,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80",
    },
    {
      id: 3,
      name: "Electrical Repair",
      price: "150",
      category: "Repair",
      description: "Electrical maintenance and repair",
      bookings: 10,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80",
    },
  ]);

  const [bookings, setBookings] = useState([
    { id: 1001, serviceName: "House Cleaning", customer: "John", date: "May 10", status: "pending", revenue: 120 },
    { id: 1002, serviceName: "Plumbing", customer: "Sarah", date: "May 11", status: "confirmed", revenue: 90 },
    { id: 1003, serviceName: "Electrical Repair", customer: "Mike", date: "May 12", status: "completed", revenue: 150 },
    { id: 1004, serviceName: "House Cleaning", customer: "Priya", date: "May 13", status: "pending", revenue: 120 },
    { id: 1005, serviceName: "Plumbing", customer: "Raj", date: "May 14", status: "completed", revenue: 90 },
  ]);

  const handleAddService = (data) => {
    setServices((prev) => [
    ...prev,
      {...data, id: Date.now(), bookings: 0, rating: 0 },
    ]);
    setFormOpen(false);
    setModalOpen(false);
  };

  const bookingStats = useMemo(() => ({
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === "all") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const completed = bookings.filter((b) => b.status === "completed").length;
  const completionRate = bookings.length > 0? Math.round((completed / bookings.length) * 100) : 0;
  const avgRating = services.length > 0
  ? (services.reduce((a, s) => a + s.rating, 0) / services.length).toFixed(1)
    : "0.0";
  const totalBookings = Object.values(bookingStats).reduce((a, b) => a + b, 0);

  // CONDITIONAL RENDERING - NAVIGATE TO PAGES
  if (showServiceAnalytics) {
    return <ServiceAnalytics services={services} bookings={bookings} onBack={() => setShowServiceAnalytics(false)} />;
  }
  if (showBookingAnalytics) {
    return <BookingAnalytics services={services} bookings={bookings} onBack={() => setShowBookingAnalytics(false)} />;
  }
  if (showServiceStore) {
    return <ServiceStore services={services} bookings={bookings} onBack={() => setShowServiceStore(false)} />;
  }
  if (showRatingAnalytics) {
    return <RatingAnalytics services={services} onBack={() => setShowRatingAnalytics(false)} />;
  }
  if (showCompletionAnalytics) {
    return <CompletionAnalytics bookings={bookings} services={services} onBack={() => setShowCompletionAnalytics(false)} />;
  }

  return (
    <DashboardShell>
      <motion.div
        className="service-page"
        style={{ paddingTop: "2px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="container">

          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your service listings</p>
            <span className="verified-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
            <motion.button
              className="action-circle-btn primary"
              onClick={() => setFormOpen(true)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Plus size={32} strokeWidth={3} />
                </div>
                <h3 className="circle-label">Add Service</h3>
                <p className="circle-sublabel">Create listing</p>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => setShowServiceAnalytics(true)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Eye size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">View Services</h3>
                <p className="circle-sublabel">Manage all</p>
                <span className="circle-badge">{services.length}</span>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => setShowBookingAnalytics(true)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Calendar size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Track Bookings</h3>
                <p className="circle-sublabel">Updates</p>
                <span className="circle-badge">{bookings.length}</span>
              </div>
            </motion.button>

            <motion.button
              className="action-circle-btn"
              onClick={() => setShowServiceStore(true)}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Store size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Open Store</h3>
                <p className="circle-sublabel">Showcase</p>
              </div>
            </motion.button>
          </div>

          {/* Booking Stats */}
          <div className="booking-stats-section">
            <div className="overview-header">
              <h2 className="overview-title">Booking Overview</h2>
              <span className="overview-badge">{totalBookings} Total</span>
            </div>

            <div className="stats-content">
              <DonutChart stats={bookingStats} />

              <div className="stats-bars">
                {Object.entries(bookingStats).map(([key, value]) => {
                  const colors = {
                    pending: "#fbbf24",
                    confirmed: "#3b82f6",
                    completed: "#22c55e",
                    cancelled: "#ef4444",
                  };
                  const labels = {
                    pending: "Pending",
                    confirmed: "Confirmed",
                    completed: "Completed",
                    cancelled: "Cancelled",
                  };
                  return (
                    <div
                      key={key}
                      className={`stat-row ${statusFilter === key? 'active-filter' : ''}`}
                      onClick={() => setStatusFilter(key)}
                      title={`Show ${labels[key]} bookings`}
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
                            width: `${totalBookings > 0? (value / totalBookings) * 100 : 0}%`,
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

          {/* Quick Stats - CLICKABLE */}
          <div className="quick-stats">
            <motion.div
              className="stat-card clickable"
              onClick={() => setShowBookingAnalytics(true)}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="stat-icon"><Calendar size={24} /></div>
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label-text">Total Bookings</div>
            </motion.div>

            <motion.div
              className="stat-card clickable"
              onClick={() => setShowServiceAnalytics(true)}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="stat-icon"><Wrench size={24} /></div>
              <div className="stat-value">{services.length}</div>
              <div className="stat-label-text">Active Services</div>
            </motion.div>

            <motion.div
              className="stat-card clickable"
              onClick={() => setShowRatingAnalytics(true)}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="stat-icon"><Star size={24} /></div>
              <div className="stat-value">{avgRating}</div>
              <div className="stat-label-text">Avg. Rating</div>
            </motion.div>

            <motion.div
              className="stat-card clickable"
              onClick={() => setShowCompletionAnalytics(true)}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="stat-icon"><TrendingUp size={24} /></div>
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label-text">Completion Rate</div>
            </motion.div>
          </div>

          {/* Charts */}
          <ChartsSection bookings={bookings} services={services} />

          {/* Bookings List - WITH FILTER */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Bookings</h2>
                <p className="section-subtitle">
                  {statusFilter === "all"
                  ? "Latest bookings — manage and confirm them here."
                    : `Showing ${filteredBookings.length} ${statusFilter} bookings`
                  }
                </p>
              </div>
              <div className="section-actions">
                <div className="filter-wrapper">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="btn filter-select"
                  >
                    <option value="all">All Status ({totalBookings})</option>
                    <option value="pending">Pending ({bookingStats.pending})</option>
                    <option value="confirmed">Confirmed ({bookingStats.confirmed})</option>
                    <option value="completed">Completed ({bookingStats.completed})</option>
                    <option value="cancelled">Cancelled ({bookingStats.cancelled})</option>
                  </select>
                  <Filter size={16} className="filter-icon" />
                </div>

                <motion.button
                  className="btn btn-primary"
                  onClick={() => setFormOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={16} />
                  Add Service
                </motion.button>
              </div>
            </div>

            {filteredBookings.length === 0? (
              <div className="empty-state">
                <Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p>No bookings found with this status.</p>
                {statusFilter!== "all" && (
                  <button className="btn" onClick={() => setStatusFilter("all")} style={{ marginTop: "1rem" }}>
                    Show All Bookings
                  </button>
                )}
              </div>
            ) : (
              <div className="bookings-list">
                {filteredBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    className="booking-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="booking-info">
                      <h3 className="booking-service-name">{booking.serviceName}</h3>
                      <p className="booking-meta">{booking.customer} • {booking.date}</p>
                    </div>
                    <div className={`booking-status ${booking.status}`}>
                      {booking.status === "pending" && <Clock size={14} />}
                      {booking.status === "confirmed" && <CheckCircle size={14} />}
                      {booking.status === "completed" && <CheckCircle size={14} />}
                      {booking.status === "cancelled" && <XCircle size={14} />}
                      {booking.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Services Grid */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Services</h2>
                <p className="section-subtitle">Manage your services with a polished view.</p>
              </div>
            </div>

            <div className="services-grid">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  className="service-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="service-image"
                    />
                  )}
                  <div className="service-body">
                    <div className="service-header">
                      <h3 className="service-name">{service.name}</h3>
                      <div className="service-price">Rs {service.price}</div>
                    </div>
                    <p className="service-description">{service.description}</p>
                    <div className="service-footer">
                      <div className="service-meta">
                        <span>{service.bookings} bookings</span>
                        <div className="service-rating">
                          <Star size={14} fill="#fbbf24" color="#fbbf24" />
                          {service.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAddService}
          type="service"
        />

        <AnimatePresence>
          {formOpen && (
            <ListingFormModal
              kind="service"
              onClose={() => setFormOpen(false)}
              onSubmit={handleAddService}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardShell>
  );
}

// ── Donut Chart ──
function DonutChart({ stats }) {
  const colors = {
    pending: "#fbbf24",
    confirmed: "#3b82f6",
    completed: "#22c55e",
    cancelled: "#ef4444",
  };

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = Object.entries(stats).map(([key, value]) => {
    const dash = (total > 0? value / total : 0) * circumference;
    const segment = {
      key, value,
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
            cx="60" cy="60" r={radius}
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
        <div className="donut-label">Bookings</div>
      </div>
    </div>
  );
}

// ── Charts Section ──
function ChartsSection({ bookings, services }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    const orange = "rgb(249,115,22)";
    const orangeAlpha = "rgba(249,115,22,0.12)";
    const grid = "#f1f5f9";
    const tick = "#94a3b8";

    Object.values(chartsRef.current).forEach((c) => c?.destroy());

    if (lineRef.current) {
      chartsRef.current.line = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: "Bookings",
            data: [1, 3, 2, 5, 4, 6, 7],
            borderColor: orange,
            backgroundColor: orangeAlpha,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
          }],
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
          labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
          datasets: [{
            data: [
              bookings.filter((b) => b.status === "pending").length,
              bookings.filter((b) => b.status === "confirmed").length,
              bookings.filter((b) => b.status === "completed").length,
              bookings.filter((b) => b.status === "cancelled").length,
            ],
            backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"],
            borderWidth: 2,
            borderColor: "#fff",
          }],
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
          labels: services.map((s) => s.name),
          datasets: [{
            label: "Revenue",
            data: services.map((s) => Number(s.price) * s.bookings),
            backgroundColor: services.map((_, i) => `rgba(249,115,22,${0.85 - i * 0.2})`),
            borderRadius: 6,
          }],
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
      Object.values(chartsRef.current).forEach((c) => c?.destroy());
    };
  }, [bookings, services]);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Weekly Booking Trend</h3>
          <p className="chart-subtitle">Bookings over the last 7 days</p>
        </div>
        <div className="chart-container"><canvas ref={lineRef} /></div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Status Breakdown</h3>
          <p className="chart-subtitle">Current booking distribution</p>
        </div>
        <div className="chart-container"><canvas ref={pieRef} /></div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Revenue By Service</h3>
          <p className="chart-subtitle">Top performing services</p>
        </div>
        <div className="chart-container"><canvas ref={barRef} /></div>
      </div>
    </div>
  );
}