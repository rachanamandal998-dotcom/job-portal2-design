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

import ServiceAnalytics from "../pages/service/ServiceAnalytics";
import BookingAnalytics from "../pages/service/BookingAnalytics";
import ServiceStore from "../pages/service/ServiceStore";
import RatingAnalytics from "../pages/service/RatingAnalytics";
import CompletionAnalytics from "../pages/service/CompletionAnalytics";

export default function ServiceListing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [showServiceAnalytics, setShowServiceAnalytics] = useState(false);
  const [showBookingAnalytics, setShowBookingAnalytics] = useState(false);
  const [showServiceStore, setShowServiceStore] = useState(false);
  const [showRatingAnalytics, setShowRatingAnalytics] = useState(false);
  const [showCompletionAnalytics, setShowCompletionAnalytics] = useState(false);

  const [services, setServices] = useState([
    { id: 1, name: "House Cleaning", price: "120", category: "Home", description: "Professional home cleaning service", bookings: 12, rating: 4.8, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
    { id: 2, name: "Plumbing", price: "90", category: "Repair", description: "Expert plumbing repairs", bookings: 8, rating: 4.6, image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80" },
    { id: 3, name: "Electrical Repair", price: "150", category: "Repair", description: "Electrical maintenance and repair", bookings: 10, rating: 4.9, image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80" },
  ]);

  const [bookings, setBookings] = useState([
    { id: 1001, serviceName: "House Cleaning", customer: "John", date: "May 10", status: "pending", revenue: 120 },
    { id: 1002, serviceName: "Plumbing", customer: "Sarah", date: "May 11", status: "confirmed", revenue: 90 },
    { id: 1003, serviceName: "Electrical Repair", customer: "Mike", date: "May 12", status: "completed", revenue: 150 },
    { id: 1004, serviceName: "House Cleaning", customer: "Priya", date: "May 13", status: "pending", revenue: 120 },
    { id: 1005, serviceName: "Plumbing", customer: "Raj", date: "May 14", status: "completed", revenue: 90 },
  ]);

  const handleAddService = (data) => {
    setServices(prev => [...prev, {...data, id: Date.now(), bookings: 0, rating: 0 }]);
    setFormOpen(false);
    setModalOpen(false);
  };

  const bookingStats = useMemo(() => ({
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  const filteredBookings = useMemo(() => statusFilter === "all"? bookings : bookings.filter(b => b.status === statusFilter), [bookings, statusFilter]);

  const totalBookings = Object.values(bookingStats).reduce((a, b) => a + b, 0);
  const completed = bookingStats.completed;
  const completionRate = totalBookings > 0? Math.round((completed / totalBookings) * 100) : 0;
  const avgRating = services.length > 0? (services.reduce((a, s) => a + s.rating, 0) / services.length).toFixed(1) : "0.0";

  // DYNAMIC CONFIGS
  const circles = [
    { primary: true, icon: <Plus size={32} strokeWidth={3} />, label: "Add Service", sub: "Create listing", onClick: () => setFormOpen(true) },
    { icon: <Eye size={32} strokeWidth={3} />, label: "View Services", sub: "Manage all", badge: services.length, color: "#f97316", onClick: () => setShowServiceAnalytics(true) },
    { icon: <Calendar size={32} strokeWidth={3} />, label: "Track Bookings", sub: "Updates", badge: bookings.length, color: "#f97316", onClick: () => setShowBookingAnalytics(true) },
    { icon: <Store size={32} strokeWidth={3} />, label: "Open Store", sub: "Showcase", color: "#f97316", onClick: () => setShowServiceStore(true) },
  ];

  const overviewStats = [
    { key: "pending", label: "Pending", value: bookingStats.pending, color: "#fbbf24" },
    { key: "confirmed", label: "Confirmed", value: bookingStats.confirmed, color: "#3b82f6" },
    { key: "completed", label: "Completed", value: bookingStats.completed, color: "#22c55e" },
    { key: "cancelled", label: "Cancelled", value: bookingStats.cancelled, color: "#ef4444" },
  ];

  const quickCards = [
    { icon: <Calendar size={24} />, value: bookings.length, label: "Total Bookings", onClick: () => setShowBookingAnalytics(true) },
    { icon: <Wrench size={24} />, value: services.length, label: "Active Services", onClick: () => setShowServiceAnalytics(true) },
    { icon: <Star size={24} />, value: avgRating, label: "Avg. Rating", onClick: () => setShowRatingAnalytics(true) },
    { icon: <TrendingUp size={24} />, value: `${completionRate}%`, label: "Completion Rate", onClick: () => setShowCompletionAnalytics(true) },
  ];

  const serviceCharts = [
    { id: 'trend', title: 'Weekly Booking Trend', subtitle: 'Bookings over the last 7 days', type: 'line', data: (orange, orangeAlpha) => ({ labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], datasets: [{ label: "Bookings", data: [1,3,2,5,4,6,7], borderColor: orange, backgroundColor: orangeAlpha, fill: true, tension: 0.4, borderWidth: 2 }] }) },
    { id: 'status', title: 'Status Breakdown', subtitle: 'Current booking distribution', type: 'doughnut', data: () => ({ labels: ["Pending","Confirmed","Completed","Cancelled"], datasets: [{ data: [bookingStats.pending, bookingStats.confirmed, bookingStats.completed, bookingStats.cancelled], backgroundColor: ["#fbbf24","#3b82f6","#22c55e","#ef4444"], borderWidth: 2, borderColor: "#fff" }] }) },
    { id: 'revenue', title: 'Revenue By Service', subtitle: 'Top performing services', type: 'bar', data: () => ({ labels: services.map(s => s.name), datasets: [{ label: "Revenue", data: services.map(s => Number(s.price) * s.bookings), backgroundColor: services.map((_, i) => `rgba(249,115,22,${0.85 - i * 0.2})`), borderRadius: 6 }] }) }
  ];

  if (showServiceAnalytics) return <ServiceAnalytics services={services} bookings={bookings} onBack={() => setShowServiceAnalytics(false)} />;
  if (showBookingAnalytics) return <BookingAnalytics services={services} bookings={bookings} onBack={() => setShowBookingAnalytics(false)} />;
  if (showServiceStore) return <ServiceStore services={services} bookings={bookings} onBack={() => setShowServiceStore(false)} />;
  if (showRatingAnalytics) return <RatingAnalytics services={services} onBack={() => setShowRatingAnalytics(false)} />;
  if (showCompletionAnalytics) return <CompletionAnalytics bookings={bookings} services={services} onBack={() => setShowCompletionAnalytics(false)} />;

  return (
    <DashboardShell>
      <motion.div className="service-page" style={{ paddingTop: "2px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your service listings</p>
            <span className="verified-badge">
              <svg width="16" height="16" viewBox="0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Verified
            </span>
          </div>

          <div className="action-circles">
            {circles.map((c, i) => (
              <motion.button key={i} className={`action-circle-btn ${c.primary? 'primary' : ''}`} onClick={c.onClick} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="action-circle-content">
                  <div className="circle-icon-wrapper" style={c.color? {color: c.color} : {}}>{c.icon}</div>
                  <h3 className="circle-label">{c.label}</h3>
                  <p className="circle-sublabel">{c.sub}</p>
                  {c.badge && <span className="circle-badge">{c.badge}</span>}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="booking-stats-section">
            <div className="overview-header">
              <h2 className="overview-title">Booking Overview</h2>
              <span className="overview-badge">{totalBookings} Total</span>
            </div>
            <div className="stats-content">
              <DonutChart stats={bookingStats} total={totalBookings} label="Bookings" />
              <div className="stats-bars">
                {overviewStats.map(s => (
                  <div key={s.key} className={`stat-row ${statusFilter === s.key? 'active-filter' : ''}`} onClick={() => setStatusFilter(s.key)} title={`Show ${s.label} bookings`}>
                    <div className="stat-header">
                      <div className="stat-label"><span className="stat-dot" style={{ background: s.color }} />{s.label}</div>
                      <span className="stat-value">{s.value}</span>
                    </div>
                    <div className="stat-bar-bg"><div className="stat-bar" style={{ width: `${totalBookings? (s.value / totalBookings) * 100 : 0}%`, background: s.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="quick-stats">
            {quickCards.map((card, i) => (
              <motion.div key={i} className="stat-card clickable" onClick={card.onClick} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }} whileTap={{ scale: 0.98 }}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label-text">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <ChartsGrid charts={serviceCharts} />

          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Bookings</h2>
                <p className="section-subtitle">{statusFilter === "all"? "Latest bookings — manage and confirm them here." : `Showing ${filteredBookings.length} ${statusFilter} bookings`}</p>
              </div>
              <div className="section-actions">
                <div className="filter-wrapper">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="btn filter-select">
                    <option value="all">All Status ({totalBookings})</option>
                    <option value="pending">Pending ({bookingStats.pending})</option>
                    <option value="confirmed">Confirmed ({bookingStats.confirmed})</option>
                    <option value="completed">Completed ({bookingStats.completed})</option>
                    <option value="cancelled">Cancelled ({bookingStats.cancelled})</option>
                  </select>
                  <Filter size={16} className="filter-icon" />
                </div>
                <motion.button className="btn btn-primary" onClick={() => setFormOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Plus size={16} />Add Service</motion.button>
              </div>
            </div>

            {filteredBookings.length === 0? (
              <div className="empty-state"><Calendar size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} /><p>No bookings found with this status.</p>{statusFilter!== "all" && (<button className="btn" onClick={() => setStatusFilter("all")} style={{ marginTop: "1rem" }}>Show All Bookings</button>)}</div>
            ) : (
              <div className="bookings-list">
                {filteredBookings.map((booking, i) => (
                  <motion.div key={booking.id} className="booking-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="booking-info"><h3 className="booking-service-name">{booking.serviceName}</h3><p className="booking-meta">{booking.customer} • {booking.date}</p></div>
                    <div className={`booking-status ${booking.status}`}>{booking.status === "pending" && <Clock size={14} />}{booking.status === "confirmed" && <CheckCircle size={14} />}{booking.status === "completed" && <CheckCircle size={14} />}{booking.status === "cancelled" && <XCircle size={14} />}{booking.status}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="products-section">
            <div className="section-header">
              <div><h2 className="section-title">My Services</h2><p className="section-subtitle">Manage your services with a polished view.</p></div>
            </div>
            <div className="services-grid">
              {services.map((service, i) => (
                <motion.div key={service.id} className="service-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -8 }}>
                  {service.image && (<img src={service.image} alt={service.name} className="service-image" />)}
                  <div className="service-body">
                    <div className="service-header"><h3 className="service-name">{service.name}</h3><div className="service-price">Rs {service.price}</div></div>
                    <p className="service-description">{service.description}</p>
                    <div className="service-footer"><div className="service-meta"><span>{service.bookings} bookings</span><div className="service-rating"><Star size={14} fill="#fbbf24" color="#fbbf24" />{service.rating}</div></div></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddService} type="service" />
        <AnimatePresence>{formOpen && (<ListingFormModal kind="service" onClose={() => setFormOpen(false)} onSubmit={handleAddService} />)}</AnimatePresence>
      </motion.div>
    </DashboardShell>
  );
}

export function DonutChart({ stats, total, label = "Total" }) {
  // works for any stats object - uses fallback colors
  const colors = {
    pending: "#fbbf24",
    confirmed: "#3b82f6",
    completed: "#22c55e",
    cancelled: "#ef4444",
    applied: "#f97316",
    shortlisted: "#22c55e",
    rejected: "#ef4444",
    inStock: "#22c55e",
    lowStock: "#fbbf24",
    outOfStock: "#ef4444",
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = Object.entries(stats).map(([key, value]) => {
    const percent = total > 0? value / total : 0;
    const dash = percent * circumference;
    const segment = {
      key,
      dasharray: `${dash} ${circumference - dash}`,
      offset: -offset,
      color: colors[key] || "#94a3b8",
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="donut-container">
      <svg width="140" height="140" viewBox="0 120 120">
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
        <div className="donut-label">{label}</div>
      </div>
    </div>
  );
}

export function ChartsGrid({ charts }) {
  const refs = useRef({});
  const instances = useRef({});

  useEffect(() => {
    // cleanup old charts
    Object.values(instances.current).forEach((c) => c?.destroy());
    instances.current = {};

    const orange = "rgb(249,115,22)";
    const orangeAlpha = "rgba(249,115,22,0.12)";
    const grid = "#f1f5f9";
    const tick = "#94a3b8";

    charts.forEach((chart) => {
      const canvas = refs.current[chart.id];
      if (!canvas) return;

      instances.current[chart.id] = new Chart(canvas, {
        type: chart.type,
        data: chart.data(orange, orangeAlpha),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              grid: {
                color: grid,
                display: chart.type!== "doughnut",
              },
              ticks: { color: tick },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: grid,
                display: chart.type!== "doughnut",
              },
              ticks: { color: tick },
            },
          },
          cutout: chart.type === "doughnut"? "60%" : undefined,
        },
      });
    });

    return () => {
      Object.values(instances.current).forEach((c) => c?.destroy());
    };
  }, [charts]);

  return (
    <div className="charts-grid">
      {charts.map((chart) => (
        <div key={chart.id} className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">{chart.title}</h3>
            <p className="chart-subtitle">{chart.subtitle}</p>
          </div>
          <div className="chart-container">
            <canvas ref={(el) => (refs.current[chart.id] = el)} />
          </div>
        </div>
      ))}
    </div>
  );
}

