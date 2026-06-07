import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, TrendingUp, DollarSign, BarChart3, Download,
  PieChart, Activity, Star, ShoppingBag, AlertCircle, Award, Eye,
  Users, Zap,// ✅ Users is from lucide-react, not chart.js
} from "lucide-react";
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";
import "../../styles/ServiceStore.css";

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// Mock data - replace with your API
const mockServices = [
  { id: 1, name: "Hair Styling", category: "Beauty", price: 1200, bookings: 45, rating: 4.8, dateAdded: "2026-01-15", image: "https://via.placeholder.com/400x300" },
  { id: 2, name: "Deep Cleaning", category: "Home", price: 2500, bookings: 32, rating: 4.6, dateAdded: "2026-02-10", image: "https://via.placeholder.com/400x300" },
  { id: 3, name: "Personal Training", category: "Fitness", price: 1800, bookings: 67, rating: 4.9, dateAdded: "2026-03-05", image: "https://via.placeholder.com/400x300" },
  { id: 4, name: "Makeup Artist", category: "Beauty", price: 3500, bookings: 28, rating: 4.7, dateAdded: "2026-01-20", image: "https://via.placeholder.com/400x300" },
  { id: 5, name: "Plumbing Repair", category: "Home", price: 1500, bookings: 52, rating: 4.5, dateAdded: "2026-02-28", image: "https://via.placeholder.com/400x300" },
  { id: 6, name: "Yoga Classes", category: "Fitness", price: 900, bookings: 89, rating: 4.8, dateAdded: "2026-03-18", image: "https://via.placeholder.com/400x300" },
];

export default function ServiceStore({ services = mockServices, onBack }) {
  const [timeRange, setTimeRange] = useState("all");
  const [animatedKPIs, setAnimatedKPIs] = useState({ revenue: 0, bookings: 0, rating: 0 });
  const chartsRef = useRef({});

  // SAFE CALCULATIONS WITH DEFAULTS
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
    safeServices.length > 0 ? [...safeServices].sort((a, b) => b.bookings - a.bookings)[0] : null, [safeServices]
  );

  const worstService = useMemo(() =>
    safeServices.length > 0 ? [...safeServices].sort((a, b) => a.bookings - b.bookings)[0] : null, [safeServices]
  );

  const highestRated = useMemo(() =>
    safeServices.length > 0 ? [...safeServices].sort((a, b) => b.rating - a.rating)[0] : null, [safeServices]
  );

  const categories = useMemo(() =>
    ['all', ...new Set(safeServices.map(s => s.category))], [safeServices]
  );

  const categoryData = useMemo(() => {
    const data = {};
    safeServices.forEach(s => {
      if (!data[s.category]) data[s.category] = { revenue: 0, bookings: 0, count: 0 };
      data[s.category].revenue += s.price * s.bookings;
      data[s.category].bookings += s.bookings;
      data[s.category].count += 1;
    });
    return data;
  }, [safeServices]);

  // Animate KPIs
  useEffect(() => {
    const duration = 1200, steps = 60;
    const incRev = totalRevenue / steps;
    const incBook = totalBookings / steps;
    const incRate = parseFloat(avgRating) / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setAnimatedKPIs({
        revenue: Math.min(incRev * current, totalRevenue),
        bookings: Math.min(incBook * current, totalBookings),
        rating: Math.min(incRate * current, parseFloat(avgRating)),
      });
      if (current >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalRevenue, totalBookings, avgRating]);

  // CHARTS
  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};
    if (safeServices.length === 0) return;

    const colors = ["#f97316", "#3b82f6", "#22c55e", "#fbbf24", "#8b5cf6", "#ec4899"];

    // 1. Revenue by Category
    const revCtx = document.getElementById('store-revenue-category');
    if (revCtx) {
      chartsRef.current.revenue = new ChartJS(revCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categoryData),
          datasets: [{
            data: Object.values(categoryData).map(c => c.revenue),
            backgroundColor: colors,
            borderWidth: 0,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
      });
    }

    // 2. Top Services by Bookings
    const topCtx = document.getElementById('store-top-services');
    if (topCtx) {
      const sorted = [...safeServices].sort((a, b) => b.bookings - a.bookings).slice(0, 6);
      chartsRef.current.top = new ChartJS(topCtx, {
        type: 'bar',
        data: {
          labels: sorted.map(s => s.name),
          datasets: [{
            label: 'Bookings',
            data: sorted.map(s => s.bookings),
            backgroundColor: "rgba(249, 115, 22, 0.8)",
            borderRadius: 8,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' } }, x: { grid: { display: false } } }
        }
      });
    }

    // 3. Bookings vs Rating
    const compareCtx = document.getElementById('store-bookings-rating');
    if (compareCtx) {
      chartsRef.current.compare = new ChartJS(compareCtx, {
        type: 'bar',
        data: {
          labels: safeServices.slice(0, 8).map(s => s.name),
          datasets: [
            { label: 'Bookings', data: safeServices.slice(0, 8).map(s => s.bookings), backgroundColor: "rgba(249, 115, 22, 0.7)", yAxisID: 'y' },
            { label: 'Rating', data: safeServices.slice(0, 8).map(s => s.rating), backgroundColor: "rgba(251, 191, 36, 0.7)", yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { position: 'left' }, y1: { position: 'right', max: 5, grid: { drawOnChartArea: false } } }
        }
      });
    }

    // 4. Price Distribution
    const priceCtx = document.getElementById('store-price-dist');
    if (priceCtx) {
      chartsRef.current.price = new ChartJS(priceCtx, {
        type: 'line',
        data: {
          labels: safeServices.slice(0, 8).map(s => s.name),
          datasets: [{
            label: 'Price (Rs)',
            data: safeServices.slice(0, 8).map(s => s.price),
            fill: true,
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            borderColor: "rgba(249, 115, 22, 1)",
            tension: 0.4,
            borderWidth: 3,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 5. Category Performance
    const catCtx = document.getElementById('store-category-perf');
    if (catCtx) {
      chartsRef.current.category = new ChartJS(catCtx, {
        type: 'polarArea',
        data: {
          labels: Object.keys(categoryData),
          datasets: [{
            data: Object.values(categoryData).map(c => c.bookings),
            backgroundColor: colors.map(c => c + '80'),
            borderColor: colors,
            borderWidth: 2,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // 6. Revenue Trend
    const trendCtx = document.getElementById('store-revenue-trend');
    if (trendCtx) {
      chartsRef.current.trend = new ChartJS(trendCtx, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: 'Revenue (Rs)',
            data: [45000, 52000, 68000, 72000, 85000, totalRevenue],
            fill: true,
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            borderColor: "rgba(249, 115, 22, 1)",
            tension: 0.4,
            pointBackgroundColor: "rgba(249, 115, 22, 1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [safeServices, categoryData, totalRevenue]);

  const handleExport = () => {
    const headers = ['Service', 'Category', 'Price', 'Bookings', 'Revenue', 'Rating'];
    const rows = safeServices.map(s => [s.name, s.category, s.price, s.bookings, s.price * s.bookings, s.rating]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'service_store_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (safeServices.length === 0) {
    return (
      <motion.div className="service-store-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="store-header">
          <motion.button className="store-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={20} /> Back
          </motion.button>
          <div>
            <h1>Service Store</h1>
            <p>No services found</p>
          </div>
        </div>
        <div className="store-empty-state">
          <Award size={64} color="#fed7aa" />
          <h2>No Services Yet</h2>
          <p>Add services to see detailed analytics and insights</p>
        </div>
      </motion.div>
    );
  }

  const kpiData = [
    { icon: DollarSign, label: "Total Revenue", value: `Rs ${Math.round(animatedKPIs.revenue).toLocaleString()}`, trend: 15.3, color: "green" },
    { icon: Users, label: "Total Bookings", value: Math.round(animatedKPIs.bookings).toLocaleString(), trend: 18.9, color: "blue" },
    { icon: Star, label: "Avg Rating", value: animatedKPIs.rating.toFixed(1), trend: 5.2, color: "yellow" },
    { icon: Package, label: "Total Services", value: safeServices.length, color: "purple" },
    { icon: Award, label: "Best Seller", value: topService?.name || 'N/A', sub: `${topService?.bookings || 0} bookings`, color: "pink" },
    { icon: TrendingUp, label: "Avg Price", value: `Rs ${Math.round(safeServices.reduce((a, s) => a + s.price, 0) / safeServices.length).toLocaleString()}`, color: "orange" },
  ];

  return (
    <motion.div className="service-store-page" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="store-header">
        <motion.button className="store-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <ArrowLeft size={20} /> Back
        </motion.button>
        <div>
          <h1>Service Store</h1>
          <p>Complete analytics and performance insights</p>
        </div>
        <motion.button className="store-export-btn" onClick={handleExport} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Download size={18} /> Export CSV
        </motion.button>
      </div>

      {/* KPI Grid */}
      <div className="store-kpi-grid">
        {kpiData.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            className="store-kpi-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="store-kpi-top">
              <div className={`store-kpi-icon ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              {kpi.trend !== undefined && (
                <div className={`store-kpi-trend ${kpi.trend >= 0 ? 'up' : 'dn'}`}>
                  {kpi.trend >= 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            <div className="store-kpi-value">{kpi.value}</div>
            <div className="store-kpi-label">{kpi.label}</div>
            {kpi.sub && <div className="store-kpi-sub">{kpi.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <motion.div className="store-insights-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2><Zap size={24} /> AI-Powered Insights</h2>
        <div className="store-insight-cards">
          <motion.div className="store-insight-card success" whileHover={{ y: -5 }}>
            <TrendingUp size={24} />
            <div>
              <h4>Best Performing Service</h4>
              <p><strong>{topService?.name || 'N/A'}</strong> generates ₹{(topService?.price * topService?.bookings || 0).toLocaleString()} with {topService?.bookings || 0} bookings</p>
              <span className="store-insight-action">Boost promotion →</span>
            </div>
          </motion.div>

          <motion.div className="store-insight-card warning" whileHover={{ y: -5 }}>
            <AlertCircle size={24} />
            <div>
              <h4>Growth Opportunity</h4>
              <p><strong>{worstService?.name || 'N/A'}</strong> has only {worstService?.bookings || 0} bookings. Consider discounts or marketing.</p>
              <span className="store-insight-action">View strategy →</span>
            </div>
          </motion.div>

          <motion.div className="store-insight-card info" whileHover={{ y: -5 }}>
            <Star size={24} />
            <div>
              <h4>Highest Rated</h4>
              <p><strong>{highestRated?.name || 'N/A'}</strong> leads with {highestRated?.rating || 0}★ rating. Leverage for testimonials.</p>
              <span className="store-insight-action">Create campaign →</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="store-charts-grid">
        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="store-chart-header">
            <PieChart size={20} color="#f97316" />
            <h3>Revenue by Category</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-revenue-category" /></div>
        </motion.div>

        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="store-chart-header">
            <BarChart3 size={20} color="#f97316" />
            <h3>Top Services by Bookings</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-top-services" /></div>
        </motion.div>

        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <div className="store-chart-header">
            <Activity size={20} color="#f97316" />
            <h3>Bookings vs Rating</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-bookings-rating" /></div>
        </motion.div>

        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <div className="store-chart-header">
            <DollarSign size={20} color="#f97316" />
            <h3>Price Distribution</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-price-dist" /></div>
        </motion.div>

        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <div className="store-chart-header">
            <TrendingUp size={20} color="#f97316" />
            <h3>Category Performance</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-category-perf" /></div>
        </motion.div>

        <motion.div className="store-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <div className="store-chart-header">
            <DollarSign size={20} color="#f97316" />
            <h3>Revenue Trend</h3>
          </div>
          <div className="store-chart-wrap"><canvas id="store-revenue-trend" /></div>
        </motion.div>
      </div>
    </motion.div>
  );
}