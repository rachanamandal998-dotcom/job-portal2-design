import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Download,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  AlertCircle, // <-- add this
  Star,
  ShoppingBag,
  Box,
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
import { Bar, Doughnut, Line, PolarArea, Radar, Pie } from "react-chartjs-2";
import "../../styles/ProductAnalytics.css";

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

// Mock data - replace with your API later
const mockProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 4500, cost: 2800, stock: 45, soldCount: 120, rating: 4.7, dateAdded: "2026-01-15" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 8900, cost: 5200, stock: 12, soldCount: 89, rating: 4.5, dateAdded: "2026-02-10" },
  { id: 3, name: "Coffee Maker", category: "Home", price: 3200, cost: 1900, stock: 8, soldCount: 67, rating: 4.8, dateAdded: "2026-03-05" },
  { id: 4, name: "Yoga Mat", category: "Sports", price: 1200, cost: 650, stock: 0, soldCount: 156, rating: 4.9, dateAdded: "2026-01-20" },
  { id: 5, name: "Desk Lamp", category: "Home", price: 2100, cost: 1200, stock: 23, soldCount: 98, rating: 4.6, dateAdded: "2026-02-28" },
  { id: 6, name: "Bluetooth Speaker", category: "Electronics", price: 3800, cost: 2200, stock: 5, soldCount: 134, rating: 4.8, dateAdded: "2026-03-18" },
  { id: 7, name: "Running Shoes", category: "Sports", price: 5500, cost: 3200, stock: 18, soldCount: 76, rating: 4.4, dateAdded: "2026-04-02" },
  { id: 8, name: "Water Bottle", category: "Sports", price: 850, cost: 400, stock: 67, soldCount: 203, rating: 4.7, dateAdded: "2026-01-10" },
];

export default function ProductAnalytics({ products = mockProducts, onBack }) {
  const [timeRange, setTimeRange] = useState("all");
  const [animatedKPIs, setAnimatedKPIs] = useState({
    revenue: 0,
    profit: 0,
    sold: 0,
  });

  // Core Analytics Calculations
  const analytics = useMemo(() => {
    const totalRevenue = products.reduce((sum, p) => sum + Number(p.price) * (p.soldCount || 0), 0);
    const totalCost = products.reduce((sum, p) => sum + Number(p.cost) * (p.soldCount || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const totalSold = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length;
    const avgMargin = products.reduce((sum, p) => {
      const profit = Number(p.price) - Number(p.cost);
      return sum + (Number(p.price) > 0? (profit / Number(p.price)) * 100 : 0);
    }, 0) / products.length;

    const bestSeller = products.reduce((max, p) => ((p.soldCount || 0) > (max.soldCount || 0)? p : max), products[0]);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStock = products.filter(p => p.stock === 0);
    const topRated = products.reduce((max, p) => (p.rating > max.rating? p : max), products[0]);

    // Category breakdown
    const categoryData = {};
    products.forEach(p => {
      if (!categoryData[p.category]) {
        categoryData[p.category] = { revenue: 0, sold: 0, count: 0, profit: 0 };
      }
      const rev = Number(p.price) * (p.soldCount || 0);
      const cost = Number(p.cost) * (p.soldCount || 0);
      categoryData[p.category].revenue += rev;
      categoryData[p.category].sold += p.soldCount || 0;
      categoryData[p.category].count += 1;
      categoryData[p.category].profit += rev - cost;
    });

    return {
      totalRevenue,
      totalProfit,
      totalSold,
      totalStock,
      avgRating,
      avgMargin,
      bestSeller,
      lowStock,
      outOfStock,
      topRated,
      categoryData,
    };
  }, [products]);

  // Animate KPIs on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const incRev = analytics.totalRevenue / steps;
    const incProfit = analytics.totalProfit / steps;
    const incSold = analytics.totalSold / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      setAnimatedKPIs({
        revenue: Math.min(incRev * current, analytics.totalRevenue),
        profit: Math.min(incProfit * current, analytics.totalProfit),
        sold: Math.min(incSold * current, analytics.totalSold),
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

  // Chart 2: Top Products by Sales
  const topProductsData = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 6);
    return {
      labels: sorted.map(p => p.name),
      datasets: [{
        label: "Units Sold",
        data: sorted.map(p => p.soldCount || 0),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 1,
        borderRadius: 8,
      }],
    };
  }, [products]);

  // Chart 3: Stock vs Sold
  const stockVsSoldData = useMemo(() => ({
    labels: products.map(p => p.name).slice(0, 8),
    datasets: [
      {
        label: "In Stock",
        data: products.map(p => p.stock).slice(0, 8),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
      {
        label: "Sold",
        data: products.map(p => p.soldCount || 0).slice(0, 8),
        backgroundColor: "rgba(249, 115, 22, 0.7)",
      },
    ],
  }), [products]);

  // Chart 4: Profit Margin by Product
  const profitMarginData = useMemo(() => ({
    labels: products.map(p => p.name).slice(0, 8),
    datasets: [{
      label: "Margin %",
      data: products.map(p => {
        const profit = Number(p.price) - Number(p.cost);
        return Number(p.price) > 0? (profit / Number(p.price)) * 100 : 0;
      }).slice(0, 8),
      backgroundColor: "rgba(249, 115, 22, 0.3)",
      borderColor: "rgba(249, 115, 22, 1)",
      borderWidth: 2,
      pointBackgroundColor: "rgba(249, 115, 22, 1)",
    }],
  }), [products]);

  // Chart 5: Category Performance
  const categoryPerformanceData = useMemo(() => ({
    labels: Object.keys(analytics.categoryData),
    datasets: [{
      data: Object.values(analytics.categoryData).map(c => c.sold),
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

  // Chart 6: Revenue Trend - simulated monthly
  const revenueTrendData = useMemo(() => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{
      label: "Revenue (Rs)",
      data: [85000, 92000, 110000, 105000, 125000, analytics.totalRevenue],
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
      ["Product", "Category", "Price", "Cost", "Stock", "Sold", "Revenue", "Profit", "Margin%"],
     ...products.map(p => {
        const rev = Number(p.price) * (p.soldCount || 0);
        const cost = Number(p.cost) * (p.soldCount || 0);
        const profit = rev - cost;
        const margin = Number(p.price) > 0? ((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100 : 0;
        return [p.name, p.category, p.price, p.cost, p.stock, p.soldCount || 0, rev, profit, margin.toFixed(1)];
      }),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-analytics.csv";
    a.click();
  };

  return (
    <div className="analytics-page">
      {/* Header */}
      <motion.div className="analytics-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
              <h1 className="analytics-title">Product Analytics</h1>
              <p className="analytics-subtitle">Deep insights into product performance</p>
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
          { icon: TrendingUp, label: "Total Profit", value: `Rs ${Math.round(animatedKPIs.profit).toLocaleString()}`, color: "orange" },
          { icon: ShoppingBag, label: "Units Sold", value: Math.round(animatedKPIs.sold).toLocaleString(), color: "blue" },
          { icon: Package, label: "Total Products", value: products.length, color: "purple" },
          { icon: Star, label: "Avg Rating", value: analytics.avgRating.toFixed(1), color: "yellow" },
          { icon: Target, label: "Avg Margin", value: `${analytics.avgMargin.toFixed(1)}%`, color: "pink" },
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
            <p className="insight-text">Best Seller: {analytics.bestSeller.name} with {analytics.bestSeller.soldCount} units sold</p>
          </div>
          <div className="insight-card info">
            <div className="insight-icon"><Star size={20} /></div>
            <p className="insight-text">Top Rated: {analytics.topRated.name} at {analytics.topRated.rating}★</p>
          </div>
          <div className="insight-card warning">
            <div className="insight-icon"><AlertTriangle size={20} /></div>
            <p className="insight-text">{analytics.lowStock.length} products need restock soon</p>
          </div>
          <div className="insight-card info">
            <div className="insight-icon"><AlertCircle size={20} /></div>
            <p className="insight-text">{analytics.outOfStock.length} products out of stock</p>
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
            <div className="chart-body"><Pie data={revenueByCategory} options={chartOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="chart-header">
              <BarChart3 size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Top Products</h3>
                <p className="chart-subtitle">By sales volume</p>
              </div>
            </div>
            <div className="chart-body"><Bar data={topProductsData} options={barOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <div className="chart-header">
              <Box size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Stock vs Sold</h3>
                <p className="chart-subtitle">Inventory status</p>
              </div>
            </div>
            <div className="chart-body"><Bar data={stockVsSoldData} options={barOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <div className="chart-header">
              <Activity size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Profit Margin</h3>
                <p className="chart-subtitle">By product</p>
              </div>
            </div>
            <div className="chart-body"><Radar data={profitMarginData} options={radarOptions} /></div>
          </motion.div>

          <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <div className="chart-header">
              <TrendingUp size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title">Category Performance</h3>
                <p className="chart-subtitle">Units sold per category</p>
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