import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Download,
  PieChart,
  Activity,
  Star,
  ShoppingBag,
  AlertCircle,
  Award,
  Eye,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";
import "../../styles/ServiceStore.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
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
  const [animatedKPIs, setAnimatedKPIs] = useState({
    revenue: 0,
    bookings: 0,
    rating: 0,
  });

  // Core Analytics Calculations
  const analytics = useMemo(() => {
    const totalRevenue = services.reduce((sum, s) => sum + Number(s.price) * s.bookings, 0);
    const totalBookings = services.reduce((sum, s) => sum + s.bookings, 0);
    const avgRating = services.reduce((sum, s) => sum + s.rating, 0) / services.length;
    const avgPrice = services.reduce((sum, s) => sum + Number(s.price), 0) / services.length;

    const bestSeller = services.reduce((max, s) => (s.bookings > max.bookings? s : max), services[0]);
    const topRated = services.reduce((max, s) => (s.rating > max.rating? s : max), services[0]);
    const lowDemand = services.filter(s => s.bookings < 30);
    const highDemand = services.filter(s => s.bookings > 60);

    // Category breakdown
    const categoryData = {};
    services.forEach(s => {
      if (!categoryData[s.category]) {
        categoryData[s.category] = { revenue: 0, bookings: 0, count: 0 };
      }
      const rev = Number(s.price) * s.bookings;
      categoryData[s.category].revenue += rev;
      categoryData[s.category].bookings += s.bookings;
      categoryData[s.category].count += 1;
    });

    return {
      totalRevenue,
      totalBookings,
      avgRating,
      avgPrice,
      bestSeller,
      topRated,
      lowDemand,
      highDemand,
      categoryData,
    };
  }, [services]);

  // Animate KPIs on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const incRev = analytics.totalRevenue / steps;
    const incBook = analytics.totalBookings / steps;
    const incRate = analytics.avgRating / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setAnimatedKPIs({
        revenue: Math.min(incRev * current, analytics.totalRevenue),
        bookings: Math.min(incBook * current, analytics.totalBookings),
        rating: Math.min(incRate * current, analytics.avgRating),
      });
      if (current >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [analytics]);

  // Chart 1: Revenue by Category
  const revenueByCategory = useMemo(() => ({
    labels: Object.keys(analytics.categoryData),
    datasets: [{
      label: "Revenue (Rs)",
      data: Object.values(analytics.categoryData).map(c => c.revenue),
      backgroundColor: [
        "rgba(249, 115, 22, 0.8)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(234, 88, 12, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(59, 130, 246, 0.8)",
      ],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  }), [analytics.categoryData]);

  // Chart 2: Top Services by Bookings
  const topServicesData = useMemo(() => {
    const sorted = [...services].sort((a, b) => b.bookings - a.bookings).slice(0, 6);
    return {
      labels: sorted.map(s => s.name),
      datasets: [{
        label: "Bookings",
        data: sorted.map(s => s.bookings),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 1,
        borderRadius: 8,
      }],
    };
  }, [services]);

  // Chart 3: Bookings vs Rating
  const bookingsVsRatingData = useMemo(() => ({
    labels: services.map(s => s.name).slice(0, 8),
    datasets: [
      {
        label: "Bookings",
        data: services.map(s => s.bookings).slice(0, 8),
        backgroundColor: "rgba(249, 115, 22, 0.7)",
        yAxisID: 'y',
      },
      {
        label: "Rating",
        data: services.map(s => s.rating).slice(0, 8),
        backgroundColor: "rgba(251, 191, 36, 0.7)",
        yAxisID: 'y1',
      },
    ],
  }), [services]);

  // Chart 4: Price Distribution
  const priceDistributionData = useMemo(() => ({
    labels: services.map(s => s.name).slice(0, 8),
    datasets: [{
      label: "Price (Rs)",
      data: services.map(s => Number(s.price)).slice(0, 8),
      backgroundColor: "rgba(249, 115, 22, 0.3)",
      borderColor: "rgba(249, 115, 22, 1)",
      borderWidth: 2,
      pointBackgroundColor: "rgba(249, 115, 22, 1)",
    }],
  }), [services]);

  // Chart 5: Category Performance
  const categoryPerformanceData = useMemo(() => ({
    labels: Object.keys(analytics.categoryData),
    datasets: [{
      data: Object.values(analytics.categoryData).map(c => c.bookings),
      backgroundColor: [
        "rgba(249, 115, 22, 0.8)",
        "rgba(251, 191, 36, 0.7)",
        "rgba(234, 88, 12, 0.8)",
        "rgba(34, 197, 94, 0.7)",
        "rgba(59, 130, 246, 0.8)",
      ],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  }), [analytics.categoryData]);

  // Chart 6: Revenue Trend
  const revenueTrendData = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Revenue (Rs)",
      data: [45000, 52000, 68000, 72000, 85000, analytics.totalRevenue],
      fill: true,
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      borderColor: "rgba(249, 115, 22, 1)",
      tension: 0.4,
      pointBackgroundColor: "rgba(249, 115, 22, 1)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  }), [analytics.totalRevenue]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#475569", padding: 15, font: { size: 11, weight: 600 } },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barOptions = {
   ...chartOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } },
      y: { grid: { color: "rgba(148, 163, 184, 0.1)" }, ticks: { color: "#64748b" } },
    },
  };

  const radarOptions = {
   ...chartOptions,
    scales: {
      r: {
        angleLines: { color: "rgba(148, 163, 184, 0.2)" },
        grid: { color: "rgba(148, 163, 184, 0.2)" },
        pointLabels: { color: "#64748b", font: { size: 10 } },
        ticks: { color: "#64748b", backdropColor: "transparent" },
      },
    },
  };

  const handleExport = () => {
    const csv = [
      ["Service", "Category", "Price", "Bookings", "Rating", "Revenue"],
     ...services.map(s => [
        s.name,
        s.category,
        s.price,
        s.bookings,
        s.rating,
        Number(s.price) * s.bookings
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "service-analytics.csv";
    a.click();
  };

  return (
    <div className="service-store-page">
      {/* Header */}
      <motion.div className="service-store-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1 className="store-title">Service Analytics</h1>
              <p className="store-subtitle">Deep insights into service performance</p>
            </div>
          </div>
          <button className="export-btn" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { icon: DollarSign, label: "Total Revenue", value: `Rs ${Math.round(animatedKPIs.revenue).toLocaleString()}`, color: "green" },
          { icon: ShoppingBag, label: "Total Bookings", value: Math.round(animatedKPIs.bookings).toLocaleString(), color: "orange" },
          { icon: Star, label: "Avg Rating", value: animatedKPIs.rating.toFixed(1), color: "yellow" },
          { icon: Package, label: "Total Services", value: services.length, color: "purple" },
          { icon: Award, label: "Best Seller", value: analytics.bestSeller.name, color: "pink" },
          { icon: TrendingUp, label: "Avg Price", value: `Rs ${Math.round(analytics.avgPrice).toLocaleString()}`, color: "blue" },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className={`kpi-icon ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights */}
      <motion.div className="insights-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 className="section-title">Smart Insights</h2>
        <div className="insights-grid">
          <div className="insight-card success">
            <div className="insight-icon"><TrendingUp size={20} /></div>
            <p className="insight-text">Best Seller: {analytics.bestSeller.name} with {analytics.bestSeller.bookings} bookings</p>
          </div>
          <div className="insight-card info">
            <div className="insight-icon"><Star size={20} /></div>
            <p className="insight-text">Top Rated: {analytics.topRated.name} at {analytics.topRated.rating}★</p>
          </div>
          <div className="insight-card warning">
            <div className="insight-icon"><AlertCircle size={20} /></div>
            <p className="insight-text">{analytics.lowDemand.length} services need promotion</p>
          </div>
          <div className="insight-card info">
            <div className="insight-icon"><Eye size={20} /></div>
            <p className="insight-text">{analytics.highDemand.length} services in high demand</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="charts-section">
        <h2 className="section-title">Visual Analytics</h2>
        <div className="charts-grid">
          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <div className="chart-header">
              <PieChart size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Revenue by Category</h3>
                <p className="chart-subtitle">Category performance</p>
              </div>
            </div>
            <div className="chart-body"><Doughnut data={revenueByCategory} options={chartOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="chart-header">
              <BarChart3 size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Top Services</h3>
                <p className="chart-subtitle">By bookings volume</p>
              </div>
              </div>
            <div className="chart-body"><Bar data={topServicesData} options={barOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <div className="chart-header">
              <Activity size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Bookings vs Rating</h3>
                <p className="chart-subtitle">Performance correlation</p>
              </div>
            </div>
            <div className="chart-body"><Bar data={bookingsVsRatingData} options={barOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <div className="chart-header">
              <DollarSign size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Price Distribution</h3>
                <p className="chart-subtitle">By service</p>
              </div>
              </div>
            <div className="chart-body"><Line data={priceDistributionData} options={radarOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <div className="chart-header">
              <TrendingUp size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Category Performance</h3>
                <p className="chart-subtitle">Bookings per category</p>
              </div>
            </div>
            <div className="chart-body"><PolarArea data={categoryPerformanceData} options={chartOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <div className="chart-header">
              <DollarSign size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Revenue Trend</h3>
                <p className="chart-subtitle">Last 6 months</p>
              </div>
            </div>
            <div className="chart-body"><Line data={revenueTrendData} options={barOptions} /></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}