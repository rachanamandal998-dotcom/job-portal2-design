import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Clock, TrendingUp, Target, Zap, Star, Activity } from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/CompletionAnalytics.css";

export default function CompletionAnalytics({ bookings, services, onBack }) {
  const chartsRef = useRef({});

  const completed = bookings.filter(b => b.status === "completed").length;
  const cancelled = bookings.filter(b => b.status === "cancelled").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const completionRate = bookings.length > 0 ? ((completed / bookings.length) * 100).toFixed(0) : 0;
  const efficiencyScore = Math.round((completed / (completed + cancelled || 1)) * 100);
  const avgResponseTime = "2.5h"; // Mock data

  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());

    // 1. Completion Rate Trend - Line Chart
    const trendCtx = document.getElementById('completion-trend');
    if (trendCtx) {
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: 'Completion Rate %',
            data: [75, 80, 85, completionRate],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
      });
    }

    // 3. Service Efficiency Radar
    const efficiencyCtx = document.getElementById('efficiency-radar');
    if (efficiencyCtx) {
      const serviceEfficiency = services.map(s => {
        const serviceBookings = bookings.filter(b => b.serviceName === s.name);
        const completedCount = serviceBookings.filter(b => b.status === "completed").length;
        return serviceBookings.length > 0 ? (completedCount / serviceBookings.length) * 100 : 0;
      });

      chartsRef.current.efficiency = new Chart(efficiencyCtx, {
        type: 'radar',
        data: {
          labels: services.map(s => s.name),
          datasets: [{
            label: 'Efficiency %',
            data: serviceEfficiency,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139,92,246,0.2)",
            borderWidth: 2,
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
          scales: { x: { stacked: true }, y: { stacked: true } }
        }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [bookings, services, completed, cancelled, pending, confirmed, completionRate]);

  return (
    <motion.div className="analytics-page" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }}>
      <div className="analytics-header">
        <div className="context">
          <motion.button className="back-btn" onClick={onBack} whileHover={{ x: -5 }}>
            <ArrowLeft size={20} /> Back
          </motion.button>
        </div>
        <div>
          <h1>Completion Analytics</h1>
          <p>Booking success & service efficiency insights</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard icon={Target} label="Completion Rate" value={`${completionRate}%`} color="#22c55e" />
        <KpiCard icon={CheckCircle} label="Completed" value={completed} color="#3b82f6" />
        <KpiCard icon={XCircle} label="Cancelled" value={cancelled} color="#ef4444" />
        <KpiCard icon={Zap} label="Efficiency Score" value={efficiencyScore} color="#f97316" />
        <KpiCard icon={Clock} label="Avg Response" value={avgResponseTime} color="#8b5cf6" />
        <KpiCard icon={Activity} label="Pending" value={pending} color="#fbbf24" />
      </div>

      <div className="charts-grid">
        <div className="chart-card wide">
          <div className="chart-header">
            <TrendingUp size={20} color="#f97316" />
            <h3>Completion Rate Trend</h3>
          </div>
          <div className="chart-wrap"><canvas id="completion-trend" /></div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <CheckCircle size={20} color="#f97316" />
            <h3>Success vs Failed</h3>
          </div>
          <div className="chart-wrap"><canvas id="success-failed" /></div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Target size={20} color="#f97316" />
            <h3>Service Efficiency</h3>
          </div>
          <div className="chart-wrap"><canvas id="efficiency-radar" /></div>
        </div>

        <div className="chart-card wide">
          <div className="chart-header">
            <Activity size={20} color="#f97316" />
            <h3>Monthly Completion Analytics</h3>
          </div>
          <div className="chart-wrap"><canvas id="monthly-completion" /></div>
        </div>
      </div>

      <div className="insights-section">
        <h2><Zap size={24} /> AI Recommendations</h2>
        <div className="insight-cards">
          <div className="insight-card success">
            <TrendingUp size={24} />
            <div>
              <h4>High Performance</h4>
              <p>Your {completionRate}% completion rate is excellent. Keep up the quality service!</p>
            </div>
          </div>
          <div className="insight-card info">
            <Clock size={24} />
            <div>
              <h4>Response Time</h4>
              <p>Average response time: {avgResponseTime}. Reduce to under 2 hours for better ratings.</p>
            </div>
          </div>
          <div className="insight-card warning">
            <XCircle size={24} />
            <div>
              <h4>Cancellation Alert</h4>
              <p>{cancelled} bookings cancelled. Review cancellation reasons to improve retention.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-table">
        <h3>Service Efficiency Breakdown</h3>
        <div className="table-wrap">
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
              {services.map((s, i) => {
                const serviceBookings = bookings.filter(b => b.serviceName === s.name);
                const completedCount = serviceBookings.filter(b => b.status === "completed").length;
                const cancelledCount = serviceBookings.filter(b => b.status === "cancelled").length;
                const efficiency = serviceBookings.length > 0 ? ((completedCount / serviceBookings.length) * 100).toFixed(0) : 0;

                return (
                  <motion.tr key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <td className="service-name-cell">
                      {s.image && <img src={s.image} alt="" />}
                      <span>{s.name}</span>
                    </td>
                    <td>{serviceBookings.length}</td>
                    <td>{completedCount}</td>
                    <td>{cancelledCount}</td>
                    <td>
                      <div className="perf-bar">
                        <motion.div
                          className="perf-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${efficiency}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ background: efficiency >= 80 ? '#22c55e' : efficiency >= 60 ? '#fbbf24' : '#ef4444' }}
                        />
                        <span>{efficiency}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
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

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div className="kpi-card" whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }}>
      <div className="kpi-icon" style={{ background: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </motion.div>
  );
}