import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chart from "chart.js/auto";
import {
  Wrench, Plus, Eye, Calendar, Store,
  Clock, CheckCircle, XCircle, Star, TrendingUp, ClipboardList,
} from "lucide-react";
import { DashboardShell, Greeting, SectionPanel } from "./DashboardShell";
import { ListingFormModal } from "./ListingFormModal";
import "./ServiceListing.css";

/* ── Action Circles ── */
function ActionCircles({ services, bookings, onAdd }) {
  const items = [
    { icon: Plus, label: "Add Service", sub: "New listing", primary: true, onClick: onAdd },
    { icon: Eye, label: "View All", sub: "My services", badge: services.length },
    { icon: Calendar, label: "Bookings", sub: "Track status", badge: bookings.length },
    { icon: Store, label: "Showcase", sub: "Open store" },
  ];
  return (
    <div className="circles-grid">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="circ-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={item.onClick}
        >
          <div className={`circ-outer ${item.primary ? "circ-outer--primary" : ""}`}>
            <div className={`circ-inner ${item.primary ? "circ-inner--primary" : ""}`}>
              <item.icon size={22} className="circ-icon" />
              <div className="circ-label">{item.label}</div>
              <div className="circ-sub">{item.sub}</div>
              {item.badge !== undefined && <span className="circ-badge">{item.badge}</span>}
            </div>
          </div>
          <span className="circ-card-label">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Booking Overview Donut ── */
function BookingOverview({ stats }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0) || 1;
  const colors = { Pending: "#fbbf24", Confirmed: "#3b82f6", Completed: "#22c55e", Cancelled: "#ef4444" };
  const r = 45, circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = Object.entries(stats).map(([key, value]) => {
    const dash = (value / total) * circ;
    const arc = { key, value, color: colors[key], dasharray: `${dash} ${circ - dash}`, offset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="overview-wrap">
      <div className="overview-head">
        <h3 className="overview-title">Booking Overview</h3>
        <span className="overview-badge">{total} Total</span>
      </div>
      <div className="overview-body">
        <div className="donut-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
            {arcs.map(s => (
              <circle
                key={s.key} cx="60" cy="60" r={r}
                fill="none" stroke={s.color} strokeWidth="12"
                strokeDasharray={s.dasharray} strokeDashoffset={s.offset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
              />
            ))}
          </svg>
          <div className="donut-center">
            <div className="donut-num">{total}</div>
            <div className="donut-lbl">Bookings</div>
          </div>
        </div>
        <div className="stat-bars">
          {arcs.map(s => (
            <div key={s.key} className="stat-row">
              <div className="stat-row-top">
                <div className="stat-dot" style={{ background: s.color }} />
                <span className="stat-name">{s.key}</span>
                <span className="stat-val">{s.value}</span>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Quick Stats ── */
function QuickStats({ services, bookings }) {
  const completed = bookings.filter(b => b.status === "completed").length;
  const rate = bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0;
  const ratings = services.filter(s => s.rating).map(s => s.rating);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  const tiles = [
    { icon: Calendar, label: "Total Bookings", val: bookings.length },
    { icon: Wrench, label: "Active Services", val: services.length },
    { icon: Star, label: "Avg Rating", val: avgRating },
    { icon: TrendingUp, label: "Completion", val: `${rate}%` },
  ];

  return (
    <div className="qs-grid">
      {tiles.map((t, i) => (
        <motion.div key={t.label} className="qs-tile"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 + 0.1 }}
        >
          <div className="qs-tile-icon"><t.icon size={18} /></div>
          <div className="qs-tile-val">{t.val}</div>
          <div className="qs-tile-label">{t.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Charts ── */
function ChartsSection({ bookings, services }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const lineInst = useRef(null);
  const pieInst = useRef(null);
  const barInst = useRef(null);

  useEffect(() => {
    lineInst.current?.destroy();
    pieInst.current?.destroy();
    barInst.current?.destroy();

    const or = "#f97316";
    const orFill = "rgba(249,115,22,0.1)";
    const grid = "#f3f4f6";
    const tick = "#9ca3af";

    if (lineRef.current) {
      lineInst.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: "Bookings",
            data: [1, 3, 2, 5, 4, 6, 7],
            borderColor: or, backgroundColor: orFill,
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
          },
        },
      });
    }

    if (pieRef.current) {
      const counts = ["pending", "confirmed", "completed", "cancelled"].map(
        s => bookings.filter(b => b.status === s).length || 1
      );
      pieInst.current = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
          datasets: [{
            data: counts,
            backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"],
            borderWidth: 2, borderColor: "#fff",
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } } },
          cutout: "62%",
        },
      });
    }

    if (barRef.current) {
      barInst.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: services.length > 0 ? services.map(s => s.name) : ["No Services"],
          datasets: [{
            label: "Revenue",
            data: services.length > 0 ? services.map(s => s.revenue || 0) : [0],
            backgroundColor: ["rgba(249,115,22,0.8)", "rgba(249,115,22,0.55)", "rgba(249,115,22,0.35)"],
            borderRadius: 6, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick, font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
          },
        },
      });
    }

    return () => {
      lineInst.current?.destroy();
      pieInst.current?.destroy();
      barInst.current?.destroy();
    };
  }, [bookings, services]);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-card-title">Weekly Bookings</div>
        <div className="chart-card-sub">Trend last 7 days</div>
        <div className="chart-wrap"><canvas ref={lineRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Status Breakdown</div>
        <div className="chart-card-sub">Booking statuses</div>
        <div className="chart-wrap"><canvas ref={pieRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Revenue by Service</div>
        <div className="chart-card-sub">Earnings per service</div>
        <div className="chart-wrap"><canvas ref={barRef} /></div>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function ServiceListing() {
  const [formOpen, setFormOpen] = useState(false);

  const [bookingStats] = useState({ Pending: 4, Confirmed: 3, Completed: 6, Cancelled: 1 });

  const [services] = useState([
    { name: "House Cleaning", price: 120, description: "Professional home cleaning service", bookings: 12, rating: 4.8, revenue: 400 },
    { name: "Plumbing", price: 90, description: "Expert plumbing repairs and fixes", bookings: 8, rating: 4.6, revenue: 250 },
    { name: "Electrical Repair", price: 150, description: "Electrical maintenance and repair", bookings: 10, rating: 4.9, revenue: 500 },
  ]);

  const [bookings] = useState([
    { serviceName: "House Cleaning", customer: "John", date: "May 10", status: "pending" },
    { serviceName: "Plumbing", customer: "Sarah", date: "May 11", status: "confirmed" },
    { serviceName: "Electrical Repair", customer: "Mike", date: "May 12", status: "completed" },
  ]);

  return (
    <DashboardShell>
      <Greeting title="Manage your service listings" subtitle="Hi, Rachana!" verified />

      <ActionCircles services={services} bookings={bookings} onAdd={() => setFormOpen(true)} />
      <BookingOverview stats={bookingStats} />
      <QuickStats services={services} bookings={bookings} />
      <ChartsSection bookings={bookings} services={services} />

      {/* Bookings */}
      <SectionPanel
        title="Recent Bookings"
        description="Your latest service bookings"
        emptyIcon={ClipboardList}
        emptyTitle="No bookings yet"
        emptyHint="New bookings will appear here."
      >
        <div className="sl-booking-list">
          {bookings.map((b, i) => (
            <div key={i} className="sl-booking-row">
              <div className="sl-booking-info">
                <span className="sl-booking-service">{b.serviceName}</span>
                <span className="sl-booking-meta">{b.customer} · {b.date}</span>
              </div>
              <span className={`status-pill status-${b.status}`}>
                {b.status === "pending" && <Clock size={11} />}
                {(b.status === "confirmed" || b.status === "completed") && <CheckCircle size={11} />}
                {b.status === "cancelled" && <XCircle size={11} />}
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </SectionPanel>

      {/* Services grid */}
      <SectionPanel
        title="My Services"
        description="Manage your service listings"
        emptyIcon={Wrench}
        emptyTitle="No services yet"
        emptyHint="Add your first service to start taking bookings."
        cta={
          <button className="brand-btn" onClick={() => setFormOpen(true)}>
            <Plus size={14} /> Add Service
          </button>
        }
      >
        <div className="sl-services-grid">
          {services.map((s, i) => (
            <motion.div
              key={i}
              className="sl-service-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="sl-service-header">
                <div className="sl-service-icon">
                  <Wrench size={18} />
                </div>
                <div className="sl-service-price">Rs. {s.price}</div>
              </div>
              <div className="sl-service-name">{s.name}</div>
              <div className="sl-service-desc">{s.description}</div>
              <div className="sl-service-footer">
                <span className="sl-service-meta">{s.bookings} bookings</span>
                <span className="sl-service-rating">★ {s.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionPanel>

      <div className="sl-bottom-cta">
        <button className="brand-btn sl-big-btn" onClick={() => setFormOpen(true)}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <AnimatePresence>
        {formOpen && (
          <ListingFormModal kind="Service" onClose={() => setFormOpen(false)} onSubmit={() => setFormOpen(false)} />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}