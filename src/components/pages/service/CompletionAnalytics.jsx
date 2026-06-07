import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Star, DollarSign, Users, Zap, Award, AlertTriangle,
  Search, Download, BarChart3, PieChart, Activity, Target, CheckCircle, XCircle, Clock
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/CompletionAnalytics.css";

// Mock data so page renders even without props
const mockServices = [
  { id: 1, name: "House Cleaning", rating: 4.8, image: "https://via.placeholder.com/100" },
  { id: 2, name: "Deep Cleaning", rating: 4.6, image: "https://via.placeholder.com/100" },
  { id: 3, name: "Personal Training", rating: 4.9, image: "https://via.placeholder.com/100" },
  { id: 4, name: "Makeup Artist", rating: 4.7, image: "https://via.placeholder.com/100" },
  { id: 5, name: "Plumbing", rating: 4.5, image: "https://via.placeholder.com/100" },
];

const mockBookings = [
  { id: 1, serviceName: "House Cleaning", status: "completed", date: "2026-05-01" },
  { id: 2, serviceName: "House Cleaning", status: "completed", date: "2026-05-05" },
  { id: 3, serviceName: "Deep Cleaning", status: "completed", date: "2026-05-10" },
  { id: 4, serviceName: "Personal Training", status: "completed", date: "2026-05-12" },
  { id: 5, serviceName: "Personal Training", status: "cancelled", date: "2026-05-15" },
  { id: 6, serviceName: "Makeup Artist", status: "completed", date: "2026-05-18" },
  { id: 7, serviceName: "Plumbing", status: "pending", date: "2026-05-20" },
  { id: 8, serviceName: "Plumbing", status: "confirmed", date: "2026-05-22" },
  { id: 9, serviceName: "House Cleaning", status: "cancelled", date: "2026-05-25" },
  { id: 10, serviceName: "Personal Training", status: "completed", date: "2026-05-28" },
];

export default function CompletionAnalytics({ bookings = mockBookings, services = mockServices, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const chartsRef = useRef({});

  // SAFE CALCULATIONS
  const safeBookings = useMemo(() => bookings.map(b => ({
 ...b,
    status: b.status || 'pending',
    serviceName: b.serviceName || 'Unknown'
  })), [bookings]);

  const safeServices = useMemo(() => services.map(s => ({
 ...s,
    rating: Number(s.rating) || 0,
    name: s.name || 'Unknown'
  })), [services]);

  const completed = useMemo(() => safeBookings.filter(b => b.status === "completed").length, [safeBookings]);
  const cancelled = useMemo(() => safeBookings.filter(b => b.status === "cancelled").length, [safeBookings]);
  const pending = useMemo(() => safeBookings.filter(b => b.status === "pending").length, [safeBookings]);
  const confirmed = useMemo(() => safeBookings.filter(b => b.status === "confirmed").length, [safeBookings]);

  const completionRate = useMemo(() =>
    safeBookings.length > 0? ((completed / safeBookings.length) * 100).toFixed(0) : 0
 , [completed, safeBookings]);

  const efficiencyScore = useMemo(() =>
    Math.round((completed / (completed + cancelled || 1)) * 100)
 , [completed, cancelled]);

  const avgResponseTime = "2.5h"; // Mock data

  // Filter for table
  const filteredBookings = useMemo(() => safeBookings.filter(b => {
    const matchSearch = b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  }), [safeBookings, searchTerm, filterStatus]);

  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};
    if (safeBookings.length === 0) return;

    // 1. Completion Rate Trend - Line Chart
    const trendCtx = document.getElementById('completion-trend');
    if (trendCtx) {
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: 'Completion Rate %',
            data: [75, 80, 85, Number(completionRate)],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#22c55e",
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } }
        }
      });
    }

    // 2. Success vs Failed - Doughnut
    const successCtx = document.getElementById('success-failed');
    if (successCtx) {
      chartsRef.current.success = new Chart(successCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Cancelled', 'Pending', 'Confirmed'],
          datasets: [{
            data: [completed, cancelled, pending, confirmed],
            backgroundColor: ['#22c55e', '#ef4444', '#fbbf24', '#3b82f6'],
            borderWidth: 0,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
      });
    }

    // 3. Service Efficiency Radar
    const efficiencyCtx = document.getElementById('efficiency-radar');
    if (efficiencyCtx) {
      const serviceEfficiency = safeServices.map(s => {
        const serviceBookings = safeBookings.filter(b => b.serviceName === s.name);
        const completedCount = serviceBookings.filter(b => b.status === "completed").length;
        return serviceBookings.length > 0? (completedCount / serviceBookings.length) * 100 : 0;
      });

      chartsRef.current.efficiency = new Chart(efficiencyCtx, {
        type: 'radar',
        data: {
          labels: safeServices.map(s => s.name),
          datasets: [{
            label: 'Efficiency %',
            data: serviceEfficiency,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139,92,246,0.2)",
            borderWidth: 2,
            pointBackgroundColor: "#8b5cf6",
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100 } } }
      });
    }

    // 4. Monthly Completion - Stacked Bar
    const monthlyCtx = document.getElementById('monthly-completion');
    if (monthlyCtx) {
      chartsRef.current.monthly = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: 'Completed',
            data: [5, 8, 12, 15, 18, completed],
            backgroundColor: "#22c55e",
            borderRadius: 8,
          }, {
            label: 'Cancelled',
            data: [2, 1, 3, 2, 1, cancelled],
            backgroundColor: "#ef4444",
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [safeBookings, safeServices, completed, cancelled, pending, confirmed, completionRate]);

  const exportCSV = () => {
    const headers = ['ID', 'Service', 'Status', 'Date'];
    const rows = safeBookings.map(b => [b.id, b.serviceName, b.status, b.date]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'completion_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (safeBookings.length === 0 && safeServices.length === 0) {
    return (
      <motion.div className="completion-analytics-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="completion-header">
          <motion.button className="completion-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={20} /> Back
          </motion.button>
          <div>
            <h1>Completion Analytics</h1>
            <p>No booking data found</p>
          </div>
        </div>
        <div className="completion-empty-state">
          <Activity size={64} color="#fed7aa" />
          <h2>No Bookings Yet</h2>
          <p>Booking data will appear here once customers start booking services</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="completion-analytics-page" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
      <div className="completion-header">
        <motion.button className="completion-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <ArrowLeft size={20} /> Back
        </motion.button>
        <div>
          <h1>Completion Analytics</h1>
          <p>Booking success & service efficiency insights</p>
        </div>
        <motion.button className="completion-export-btn" onClick={exportCSV} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Download size={18} /> Export CSV
        </motion.button>
      </div>

      <div className="completion-kpi-grid">
        <CompletionKpiCard icon={Target} label="Completion Rate" value={`${completionRate}%`} color="#22c55e" />
        <CompletionKpiCard icon={CheckCircle} label="Completed" value={completed} color="#3b82f6" />
        <CompletionKpiCard icon={XCircle} label="Cancelled" value={cancelled} color="#ef4444" />
        <CompletionKpiCard icon={Zap} label="Efficiency Score" value={efficiencyScore} color="#f97316" />
        <CompletionKpiCard icon={Clock} label="Avg Response" value={avgResponseTime} color="#8b5cf6" />
        <CompletionKpiCard icon={Activity} label="Pending" value={pending} color="#fbbf24" />
      </div>

      <div className="completion-filters-bar">
        <div className="completion-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search by service..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>

      <div className="completion-charts-grid">
        <div className="completion-chart-card wide">
          <div className="completion-chart-header">
            <TrendingUp size={20} color="#f97316" />
            <h3>Completion Rate Trend</h3>
          </div>
          <div className="completion-chart-wrap"><canvas id="completion-trend" /></div>
        </div>

        <div className="completion-chart-card">
          <div className="completion-chart-header">
            <PieChart size={20} color="#f97316" />
            <h3>Success vs Failed</h3>
          </div>
          <div className="completion-chart-wrap"><canvas id="success-failed" /></div>
        </div>

        <div className="completion-chart-card">
          <div className="completion-chart-header">
            <Target size={20} color="#f97316" />
            <h3>Service Efficiency</h3>
          </div>
          <div className="completion-chart-wrap"><canvas id="efficiency-radar" /></div>
        </div>

        <div className="completion-chart-card wide">
          <div className="completion-chart-header">
            <Activity size={20} color="#f97316" />
            <h3>Monthly Completion Analytics</h3>
          </div>
          <div className="completion-chart-wrap"><canvas id="monthly-completion" /></div>
        </div>
      </div>

      <div className="completion-insights-section">
        <h2><Zap size={24} /> AI Recommendations</h2>
        <div className="completion-insight-cards">
          <motion.div className="completion-insight-card success" whileHover={{ y: -5 }}>
            <TrendingUp size={24} />
            <div>
              <h4>High Performance</h4>
              <p>Your {completionRate}% completion rate is {completionRate >= 80? 'excellent' : 'good'}. {completionRate >= 80? 'Keep up the quality service!' : 'Focus on reducing cancellations.'}</p>
            </div>
          </motion.div>

          <motion.div className="completion-insight-card info" whileHover={{ y: -5 }}>
            <Clock size={24} />
            <div>
              <h4>Response Time</h4>
              <p>Average response time: {avgResponseTime}. Reduce to under 2 hours for better ratings.</p>
            </div>
          </motion.div>

          <motion.div className="completion-insight-card warning" whileHover={{ y: -5 }}>
            <XCircle size={24} />
            <div>
              <h4>Cancellation Alert</h4>
              <p>{cancelled} bookings cancelled. {cancelled > 0? 'Review cancellation reasons to improve retention.' : 'No cancellations - great job!'}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="completion-performance-table">
        <h3>Service Efficiency Breakdown</h3>
        <div className="completion-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Total Bookings</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>Efficiency</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {safeServices.map((s, i) => {
                const serviceBookings = safeBookings.filter(b => b.serviceName === s.name);
                const completedCount = serviceBookings.filter(b => b.status === "completed").length;
                const cancelledCount = serviceBookings.filter(b => b.status === "cancelled").length;
                const efficiency = serviceBookings.length > 0? ((completedCount / serviceBookings.length) * 100).toFixed(0) : 0;

                return (
                  <motion.tr key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="completion-service-name-cell">
                      {s.image && <img src={s.image} alt="" />}
                      <span>{s.name}</span>
                    </td>
                    <td>{serviceBookings.length}</td>
                    <td>{completedCount}</td>
                    <td>{cancelledCount}</td>
                    <td>
                      <div className="completion-perf-bar">
                        <motion.div
                          className="completion-perf-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${efficiency}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ background: efficiency >= 80? '#22c55e' : efficiency >= 60? '#fbbf24' : '#ef4444' }}
                        />
                        <span>{efficiency}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="completion-rating-cell">
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        {s.rating}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function CompletionKpiCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div className="completion-kpi-card" whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }} transition={{ type: "spring", stiffness: 300 }}>
      <div className="completion-kpi-icon" style={{ background: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="completion-kpi-value">{value}</div>
      <div className="completion-kpi-label">{label}</div>
    </motion.div>
  );
}