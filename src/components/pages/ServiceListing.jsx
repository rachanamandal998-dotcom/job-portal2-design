import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Eye,
  Calendar,
  Store,
  Wrench,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Chart from "chart.js/auto";
import { Modal } from "../Modal";
import "../styles/Global.css";
import "../styles/ServiceListing.css";
import { ListingFormModal } from "../shared/ListingFormModal";
import {
  DashboardShell,
  Greeting,
  SectionPanel,
} from "../shared/DashboardShell";
import { AnimatePresence } from "framer-motion";

export default function ServiceList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const [services, setServices] = useState([
    {
      id: 1,
      name: "House Cleaning",
      price: "120",
      description: "Professional home cleaning service",
      bookings: 12,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Plumbing",
      price: "90",
      description: "Expert plumbing repairs",
      bookings: 8,
      rating: 4.6,
    },
    {
      id: 3,
      name: "Electrical Repair",
      price: "150",
      description: "Electrical maintenance and repair",
      bookings: 10,
      rating: 4.9,
    },
  ]);

  const [bookings] = useState([
    {
      id: 1001,
      serviceName: "House Cleaning",
      customer: "John",
      date: "May 10",
      status: "pending",
    },
    {
      id: 1002,
      serviceName: "Plumbing",
      customer: "Sarah",
      date: "May 11",
      status: "confirmed",
    },
    {
      id: 1003,
      serviceName: "Electrical Repair",
      customer: "Mike",
      date: "May 12",
      status: "completed",
    },
  ]);

  const handleAddService = (data) => {
    setServices((prev) => [...prev, {...data, id: Date.now(), bookings: 0, rating: 0 }]);
    setFormOpen(false);
    setModalOpen(false);
  };

  // Calculate stats
  const bookingStats = {
    Pending: bookings.filter((b) => b.status === "pending").length,
    Confirmed: bookings.filter((b) => b.status === "confirmed").length,
    Completed: bookings.filter((b) => b.status === "completed").length,
    Cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const completed = bookings.filter((b) => b.status === "completed").length;

  const completionRate =
    bookings.length > 0
 ? Math.round((completed / bookings.length) * 100)
      : 0;

  const avgRating =
    services.length > 0
 ? (
          services.reduce((a, s) => a + s.rating, 0) / services.length
        ).toFixed(1)
      : "0.0";

  const totalBookings = Object.values(bookingStats).reduce((a, b) => a + b, 0);

  return (
    <DashboardShell> {/* FIX 1: Wrap entire page so navbar shows */}
      <div className="service-page" style={{ paddingTop: '2px' }}>
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your service listings</p>

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

          {/* Action Buttons */}
          <div className="action-circles">
            <button
              className="action-circle-btn primary"
              onClick={() => setFormOpen(true)}
            >
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Plus size={32} strokeWidth={3} />
                </div>

                <h3 className="circle-label">Add Service</h3>
                <p className="circle-sublabel">Create listing</p>
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

                <h3 className="circle-label">View Services</h3>
                <p className="circle-sublabel">Manage all</p>

                <span className="circle-badge">{services.length}</span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Calendar
                    size={32}
                    strokeWidth={3}
                    style={{ color: "#f97316" }}
                  />
                </div>

                <h3 className="circle-label">Track Bookings</h3>
                <p className="circle-sublabel">Updates</p>

                <span className="circle-badge">{bookings.length}</span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Store
                    size={32}
                    strokeWidth={3}
                    style={{ color: "#f97316" }}
                  />
                </div>

                <h3 className="circle-label">Open Store</h3>
                <p className="circle-sublabel">Showcase</p>
              </div>
            </button>
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
                    Pending: "#fbbf24",
                    Confirmed: "#3b82f6",
                    Completed: "#22c55e",
                    Cancelled: "#ef4444",
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

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} />
              </div>

              <div className="stat-value">{bookings.length}</div>

              <div className="stat-label-text">Total Bookings</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Wrench size={24} />
              </div>

              <div className="stat-value">{services.length}</div>

              <div className="stat-label-text">Active Services</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>

              <div className="stat-value">{avgRating}</div>

              <div className="stat-label-text">Avg. Rating</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>

              <div className="stat-value">{completionRate}%</div>

              <div className="stat-label-text">Completion Rate</div>
            </div>
          </div>

          {/* Charts */}
          <ChartsSection bookings={bookings} services={services} />

          {/* Bookings */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Bookings</h2>

                <p className="section-subtitle">
                  Latest bookings — manage and confirm them here.
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setFormOpen(true)}
              >
                <Plus size={16} />
                Add Service
              </button>
            </div>

            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <h3 className="booking-service-name">
                      {booking.serviceName}
                    </h3>

                    <p className="booking-meta">
                      {booking.customer} • {booking.date}
                    </p>
                  </div>

                  <div className={`booking-status ${booking.status}`}>
                    {booking.status === "pending" && <Clock size={14} />}

                    {booking.status === "confirmed" && (
                      <CheckCircle size={14} />
                    )}

                    {booking.status === "completed" && (
                      <CheckCircle size={14} />
                    )}

                    {booking.status === "cancelled" && <XCircle size={14} />}

                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">My Services</h2>

                <p className="section-subtitle">
                  Manage your services with a polished view.
                </p>
              </div>
            </div>

            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>

                    <div className="service-price">${service.price}</div>
                  </div>

                  <p className="service-description">{service.description}</p>

                  <div className="service-footer">
                    <div className="service-meta">
                      <span>{service.bookings} bookings</span>

                      <div className="service-rating">
                        <Star size={14} fill="#fbbf24" />
                        {service.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
    </DashboardShell>
  );
}

// Donut Chart
function DonutChart({ stats }) {
  const colors = {
    Pending: "#fbbf24",
    Confirmed: "#3b82f6",
    Completed: "#22c55e",
    Cancelled: "#ef4444",
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
        <div className="donut-label">Bookings</div>
      </div>
    </div>
  );
}

// Charts Section - FIX 2: Remove DashboardShell wrapper here
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

    // Destroy old charts before creating new ones
    Object.values(chartsRef.current).forEach((chart) => chart?.destroy());

    if (lineRef.current) {
      chartsRef.current.line = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Bookings",
              data: [1, 3, 2, 5, 4, 6, 7],
              borderColor: orange,
              backgroundColor: orangeAlpha,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
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
              grid: { color: grid },
              ticks: { color: tick },
            },
            y: {
              beginAtZero: true,
              grid: { color: grid },
              ticks: { color: tick },
            },
          },
        },
      });
    }

    if (pieRef.current) {
      chartsRef.current.pie = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Confirmed", "Completed", "Cancelled"],
          datasets: [
            {
              data: [
                bookings.filter((b) => b.status === "pending").length,
                bookings.filter((b) => b.status === "confirmed").length,
                bookings.filter((b) => b.status === "completed").length,
                bookings.filter((b) => b.status === "cancelled").length,
              ],
              backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e", "#ef4444"],
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
          labels: services.map((s) => s.name),
          datasets: [
            {
              label: "Revenue",
              data: services.map((s) => Number(s.price) * s.bookings),
              backgroundColor: services.map(
                (_, i) => `rgba(249,115,22,${0.85 - i * 0.2})`
              ),
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
              grid: { display: false },
              ticks: { color: tick },
            },
            y: {
              beginAtZero: true,
              grid: { color: grid },
              ticks: { color: tick },
            },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
    };
  }, [bookings, services]);

  return (
    // FIX 2: Removed DashboardShell wrapper - it's already in parent
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Weekly Booking Trend</h3>

          <p className="chart-subtitle">Bookings over the last 7 days</p>
        </div>

        <div className="chart-container">
          <canvas ref={lineRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Status Breakdown</h3>

          <p className="chart-subtitle">Current booking distribution</p>
        </div>

        <div className="chart-container">
          <canvas ref={pieRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Revenue By Service</h3>

          <p className="chart-subtitle">Top performing services</p>
        </div>

        <div className="chart-container">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
}