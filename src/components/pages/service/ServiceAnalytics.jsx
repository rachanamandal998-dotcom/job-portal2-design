import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Star, DollarSign, Users, Zap, Award, AlertTriangle,
  Search, Download, BarChart3, PieChart, Activity, Target
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/ServiceAnalytics.css";

// Mock data - so it shows even without props
const mockServices = [
  { id: 1, name: "House Cleaning", category: "Home", price: 1200, bookings: 45, rating: 4.8, cost: 400, image: "https://via.placeholder.com/100" },
  { id: 2, name: "Deep Cleaning", category: "Home", price: 2500, bookings: 32, rating: 4.6, cost: 800, image: "https://via.placeholder.com/100" },
  { id: 3, name: "Personal Training", category: "Fitness", price: 1800, bookings: 67, rating: 4.9, cost: 600, image: "https://via.placeholder.com/100" },
  { id: 4, name: "Makeup Artist", category: "Beauty", price: 3500, bookings: 28, rating: 4.7, cost: 1200, image: "https://via.placeholder.com/100" },
  { id: 5, name: "Plumbing", category: "Home", price: 1500, bookings: 52, rating: 4.5, cost: 500, image: "https://via.placeholder.com/100" },
  { id: 6, name: "Yoga Classes", category: "Fitness", price: 900, bookings: 89, rating: 4.8, cost: 300, image: "https://via.placeholder.com/100" },
];

export default function ServiceAnalytics({ services = mockServices, bookings = [], onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const chartsRef = useRef({});

  const safeServices = useMemo(() => services.map(s => ({
   ...s,
    price: Number(s.price) || 0,
    bookings: Number(s.bookings) || 0,
    rating: Number(s.rating) || 0,
    cost: Number(s.cost) || 0,
    category: s.category || 'Uncategorized'
  })), [services]);

  const totalRevenue = useMemo(() =>
    safeServices.reduce((a, s) => a + s.price * s.bookings, 0), [safeServices]
  );

  const avgRating = useMemo(() =>
    safeServices.length > 0
     ? (safeServices.reduce((a, s) => a + s.rating, 0) / safeServices.length).toFixed(1)
      : "0.0", [safeServices]
  );

  const totalBookings = useMemo(() =>
    safeServices.reduce((a, s) => a + s.bookings, 0), [safeServices]
  );

  const topService = useMemo(() =>
    safeServices.length > 0? [...safeServices].sort((a, b) => b.bookings - a.bookings)[0] : null, [safeServices]
  );

  const worstService = useMemo(() =>
    safeServices.length > 0? [...safeServices].sort((a, b) => a.bookings - b.bookings)[0] : null, [safeServices]
  );

  const highestRated = useMemo(() =>
    safeServices.length > 0? [...safeServices].sort((a, b) => b.rating - a.rating)[0] : null, [safeServices]
  );

  const categories = useMemo(() =>
    ['all',...new Set(safeServices.map(s => s.category))], [safeServices]
  );

  const filteredServices = useMemo(() => safeServices
   .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === "all" || s.category === filterCategory;
      return matchSearch && matchCat;
    })
   .map(s => ({
     ...s,
      revenue: s.price * s.bookings,
      profit: (s.price - s.cost) * s.bookings
    }))
   .sort((a, b) => {
      if (sortBy === "revenue") return b.revenue - a.revenue;
      if (sortBy === "bookings") return b.bookings - a.bookings;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    }), [safeServices, searchTerm, filterCategory, sortBy]);

  useEffect(() => {
    const colors = ["#f97316", "#3b82f6", "#22c55e", "#fbbf24", "#8b5cf6", "#ec4899"];
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};
    if (filteredServices.length === 0) return;

    // 1. Revenue by Service
    const revCtx = document.getElementById('revenue-service-chart');
    if (revCtx) {
      chartsRef.current.revenue = new Chart(revCtx, {
        type: 'bar',
        data: {
          labels: filteredServices.map(s => s.name),
          datasets: [{
            label: 'Revenue (₹)',
            data: filteredServices.map(s => s.revenue || 0),
            backgroundColor: colors,
            borderRadius: 8,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `₹${(ctx.parsed.y || 0).toLocaleString()}` } } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => `₹${(v || 0).toLocaleString()}` } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Rating Radar
    const radarCtx = document.getElementById('rating-radar-chart');
    if (radarCtx) {
      chartsRef.current.radar = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: filteredServices.map(s => s.name),
          datasets: [{
            label: 'Ratings',
            data: filteredServices.map(s => s.rating || 0),
            borderColor: "#f97316",
            backgroundColor: 'rgba(249,115,22,0.2)',
            borderWidth: 2,
            pointBackgroundColor: "#f97316",
            pointRadius: 5,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } } }
      });
    }

    // 3. Popularity Polar
    const polarCtx = document.getElementById('popularity-polar');
    if (polarCtx) {
      chartsRef.current.polar = new Chart(polarCtx, {
        type: 'polarArea',
        data: {
          labels: filteredServices.map(s => s.name),
          datasets: [{
            label: 'Bookings',
            data: filteredServices.map(s => s.bookings || 0),
            backgroundColor: colors.map(c => c + '80'),
            borderColor: colors,
            borderWidth: 2,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 4. Revenue Trend
    const trendCtx = document.getElementById('revenue-trend-chart');
    if (trendCtx) {
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: filteredServices.slice(0, 3).map((s, i) => ({
            label: s.name,
            data: [(s.revenue || 0) * 0.6, (s.revenue || 0) * 0.8, (s.revenue || 0) * 0.9, s.revenue || 0],
            borderColor: colors[i],
            backgroundColor: colors[i] + '20',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true, ticks: { callback: v => `₹${(v || 0).toLocaleString()}` } } }
        }
      });
    }

    // 5. Bookings Doughnut
    const doughnutCtx = document.getElementById('bookings-doughnut');
    if (doughnutCtx) {
      chartsRef.current.doughnut = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: filteredServices.map(s => s.name),
          datasets: [{
            data: filteredServices.map(s => s.bookings || 0),
            backgroundColor: colors,
            borderWidth: 0,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
      });
    }

    // 6. Growth Area
    const growthCtx = document.getElementById('growth-area');
    if (growthCtx) {
      chartsRef.current.growth = new Chart(growthCtx, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: 'Total Bookings',
            data: [8, 12, 15, 18, 22, totalBookings],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.2)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [filteredServices, totalBookings]);

  const exportCSV = () => {
    const headers = ['Service', 'Category', 'Price', 'Bookings', 'Revenue', 'Rating'];
    const rows = filteredServices.map(s => [s.name, s.category, s.price || 0, s.bookings || 0, s.revenue || 0, s.rating || 0]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (safeServices.length === 0) {
    return (
      <motion.div className="analytics-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="analytics-header">
          <motion.button className="analytics-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={20} /> Back
          </motion.button>
          <div>
            <h1>Service Analytics</h1>
            <p>No services found</p>
          </div>
        </div>
        <div className="analytics-empty-state">
          <Award size={64} color="#fed7aa" />
          <h2>No Services Yet</h2>
          <p>Add services to see detailed analytics and insights</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="analytics-page" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
      <div className="analytics-header">
        <motion.button className="analytics-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <ArrowLeft size={20} /> Back
        </motion.button>
        <div>
          <h1>Service Analytics</h1>
          <p>Deep insights into your service performance</p>
        </div>
        <motion.button className="analytics-export-btn" onClick={exportCSV} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Download size={18} /> Export CSV
        </motion.button>
      </div>

      <div className="analytics-kpi-grid">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} trend={15.3} color="#22c55e" />
        <KpiCard icon={Star} label="Avg Rating" value={avgRating} trend={5.2} color="#fbbf24" />
        <KpiCard icon={Award} label="Top Service" value={topService?.name || 'N/A'} sub={`${topService?.bookings || 0} bookings`} color="#f97316" />
        <KpiCard icon={Users} label="Total Bookings" value={totalBookings} trend={18.9} color="#3b82f6" />
      </div>

      <div className="analytics-filters-bar">
        <div className="analytics-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c === 'all'? 'All Categories' : c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="revenue">Sort by Revenue</option>
          <option value="bookings">Sort by Bookings</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      <div className="analytics-charts-grid">
        <div className="analytics-chart-card wide">
          <div className="analytics-chart-header">
            <BarChart3 size={20} color="#f97316" />
            <h3>Revenue by Service</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="revenue-service-chart" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <Star size={20} color="#f97316" />
            <h3>Ratings Distribution</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="rating-radar-chart" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <PieChart size={20} color="#f97316" />
            <h3>Service Popularity</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="popularity-polar" /></div>
        </div>

        <div className="analytics-chart-card wide">
          <div className="analytics-chart-header">
            <TrendingUp size={20} color="#f97316" />
            <h3>Revenue Trend</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="revenue-trend-chart" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <Activity size={20} color="#f97316" />
            <h3>Bookings per Service</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="bookings-doughnut" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <Target size={20} color="#f97316" />
            <h3>Service Growth</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="growth-area" /></div>
        </div>
      </div>

      <div className="analytics-insights-section">
        <h2><Zap size={24} /> AI-Powered Insights</h2>
        <div className="analytics-insight-cards">
          <motion.div className="analytics-insight-card success" whileHover={{ y: -5 }}>
            <TrendingUp size={24} />
            <div>
              <h4>Best Performing Service</h4>
              <p><strong>{topService?.name || 'N/A'}</strong> generates ₹{(topService?.price * topService?.bookings || 0).toLocaleString()} with {topService?.bookings || 0} bookings</p>
              <span className="analytics-insight-action">Boost promotion →</span>
            </div>
          </motion.div>

          <motion.div className="analytics-insight-card warning" whileHover={{ y: -5 }}>
            <AlertTriangle size={24} />
            <div>
              <h4>Growth Opportunity</h4>
              <p><strong>{worstService?.name || 'N/A'}</strong> has only {worstService?.bookings || 0} bookings. Consider discounts or marketing.</p>
              <span className="analytics-insight-action">View strategy →</span>
            </div>
          </motion.div>

          <motion.div className="analytics-insight-card info" whileHover={{ y: -5 }}>
            <Star size={24} />
            <div>
              <h4>Highest Rated</h4>
              <p><strong>{highestRated?.name || 'N/A'}</strong> leads with {highestRated?.rating || 0}★ rating. Leverage for testimonials.</p>
              <span className="analytics-insight-action">Create campaign →</span>
            </div>
          </motion.div>

          <motion.div className="analytics-insight-card danger" whileHover={{ y: -5 }}>
            <AlertTriangle size={24} />
            <div>
              <h4>Low Booking Alert</h4>
              <p>{filteredServices.filter(s => s.bookings < 5).length} services have less than 5 bookings this month</p>
              <span className="analytics-insight-action">Optimize listings →</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="analytics-performance-table">
        <h3>Service Performance Breakdown</h3>
        <div className="analytics-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Price</th>
                <th>Bookings</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Profit</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <td className="analytics-service-name-cell">
                    {s.image && <img src={s.image} alt="" />}
                    <span>{s.name}</span>
                  </td>
                  <td><span className="analytics-badge">{s.category}</span></td>
                  <td>₹{(s.price || 0).toLocaleString()}</td>
                  <td>{s.bookings || 0}</td>
                  <td className="analytics-revenue-cell">₹{(s.revenue || 0).toLocaleString()}</td>
                  <td>
                    <div className="analytics-rating-cell">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {s.rating || 0}
                    </div>
                  </td>
                  <td className="analytics-profit-cell">₹{(s.profit || 0).toLocaleString()}</td>
                  <td>
                    <div className="analytics-perf-bar">
                      <motion.div
                        className="analytics-perf-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${topService? ((s.bookings || 0) / (topService.bookings || 1)) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ background: (s.bookings || 0) > 10? '#22c55e' : (s.bookings || 0) > 5? '#fbbf24' : '#ef4444' }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, trend, color }) {
  const isUp = (trend || 0) >= 0;
  return (
    <motion.div className="analytics-kpi-card" whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }} transition={{ type: "spring", stiffness: 300 }}>
      <div className="analytics-kpi-top">
        <div className="analytics-kpi-icon" style={{ background: color }}>
          <Icon size={24} color="white" />
        </div>
        {trend!== undefined && (
          <div className={`analytics-kpi-trend ${isUp? 'up' : 'down'}`}>
            {isUp? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="analytics-kpi-value">{value}</div>
      <div className="analytics-kpi-label">{label}</div>
      {sub && <div className="analytics-kpi-sub">{sub}</div>}
    </motion.div>
  );
}