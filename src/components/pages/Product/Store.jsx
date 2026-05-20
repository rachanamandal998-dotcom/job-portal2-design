import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Store as StoreIcon,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Download,
  Search,
  Filter,
  ArrowLeft,
  AlertCircle,
  TrendingDown,
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
import { Pie, Bar, Radar, Line, PolarArea, Doughnut } from "react-chartjs-2";
import "../../styles/Store.css";

// Register ChartJS components
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

export default function Store({ products = [], onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalRevenue = products.reduce(
      (sum, p) => sum + Number(p.price) * (p.soldCount || 0),
      0
    );
    const totalCost = products.reduce(
      (sum, p) => sum + Number(p.cost) * (p.soldCount || 0),
      0
    );
    const totalProfit = totalRevenue - totalCost;

    const bestSelling = products.reduce(
      (max, p) => ((p.soldCount || 0) > (max.soldCount || 0) ? p : max),
      products[0] || {}
    );

    const highestPrice = products.reduce(
      (max, p) => (Number(p.price) > Number(max.price) ? p : max),
      products[0] || {}
    );

    const lowestStock = products
      .filter((p) => p.stock > 0)
      .reduce(
        (min, p) => (p.stock < min.stock ? p : min),
        products[0] || { stock: Infinity }
      );

    return {
      totalRevenue,
      totalProfit,
      totalProducts: products.length,
      bestSelling: bestSelling?.name || "N/A",
      highestPrice: highestPrice?.name || "N/A",
      lowestStock: lowestStock?.name || "N/A",
    };
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stock <= 5 && p.stock > 0) ||
        (stockFilter === "out" && p.stock === 0) ||
        (stockFilter === "in" && p.stock > 5);

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "sold-asc") return (a.soldCount || 0) - (b.soldCount || 0);
      if (sortBy === "sold-desc") return (b.soldCount || 0) - (a.soldCount || 0);
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, stockFilter, sortBy]);

  // Chart Data
  const salesByCategoryData = useMemo(() => {
    const categoryTotals = {};
    products.forEach((p) => {
      const sales = (p.soldCount || 0) * Number(p.price);
      categoryTotals[p.category] = (categoryTotals[p.category] || 0) + sales;
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "rgba(249, 115, 22, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(234, 88, 12, 0.8)",
            "rgba(255, 237, 213, 0.8)",
            "rgba(194, 65, 12, 0.8)",
            "rgba(124, 45, 18, 0.8)",
            "rgba(253, 186, 116, 0.8)",
            "rgba(249, 115, 22, 0.6)",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [products]);

  const priceComparisonData = useMemo(() => ({
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: "Price (Rs)",
        data: products.map((p) => Number(p.price)),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 1,
      },
    ],
  }), [products]);

  const stockDistributionData = useMemo(() => ({
    labels: products.map((p) => p.name).slice(0, 10),
    datasets: [
      {
        label: "Stock",
        data: products.map((p) => p.stock).slice(0, 10),
        backgroundColor: "rgba(249, 115, 22, 0.3)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(249, 115, 22, 1)",
      },
    ],
  }), [products]);

  const revenueVsCostData = useMemo(() => ({
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: "Revenue (Rs)",
        data: products.map((p) => Number(p.price) * (p.soldCount || 0)),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
      },
      {
        label: "Cost (Rs)",
        data: products.map((p) => Number(p.cost) * (p.soldCount || 0)),
        backgroundColor: "rgba(251, 191, 36, 0.8)",
      },
    ],
  }), [products]);

  const popularityData = useMemo(() => ({
    labels: products.map((p) => p.name),
    datasets: [
      {
        data: products.map((p) => p.soldCount || 0),
        backgroundColor: [
          "rgba(249, 115, 22, 0.8)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(234, 88, 12, 0.8)",
          "rgba(255, 237, 213, 0.6)",
          "rgba(194, 65, 12, 0.8)",
          "rgba(124, 45, 18, 0.7)",
          "rgba(253, 186, 116, 0.8)",
          "rgba(249, 115, 22, 0.6)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  }), [products]);

  const dailySalesTrendData = useMemo(() => ({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 15, 25, 22, 30, 28],
        fill: true,
        backgroundColor: "rgba(249, 115, 22, 0.2)",
        borderColor: "rgba(249, 115, 22, 1)",
        tension: 0.4,
        pointBackgroundColor: "rgba(249, 115, 22, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  }), []);

  const profitMarginData = useMemo(() => {
    const margins = products.map((p) => {
      const revenue = Number(p.price) * (p.soldCount || 0);
      const cost = Number(p.cost) * (p.soldCount || 0);
      return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
    });

    return {
      labels: products.map((p) => p.name),
      datasets: [
        {
          data: margins,
          backgroundColor: [
            "rgba(249, 115, 22, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(234, 88, 12, 0.8)",
            "rgba(255, 237, 213, 0.8)",
            "rgba(194, 65, 12, 0.8)",
            "rgba(124, 45, 18, 0.8)",
            "rgba(253, 186, 116, 0.8)",
            "rgba(249, 115, 22, 0.6)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };
  }, [products]);

  const topSellingData = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => (b.soldCount || 0) - (a.soldCount || 0)
    );
    return {
      labels: sorted.slice(0, 10).map((p) => p.name),
      datasets: [
        {
          label: "Units Sold",
          data: sorted.slice(0, 10).map((p) => p.soldCount || 0),
          backgroundColor: "rgba(249, 115, 22, 0.8)",
          borderColor: "rgba(249, 115, 22, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [products]);

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#64748b",
          padding: 15,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        cornerRadius: 8,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: "y",
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#64748b" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
  };

  const verticalBarOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: { color: "#64748b" },
      },
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

  // Analytics Table Data
  const tableData = useMemo(() => {
    return filteredProducts.map((p) => {
      const revenue = Number(p.price) * (p.soldCount || 0);
      const cost = Number(p.cost) * (p.soldCount || 0);
      const profit = revenue - cost;
      const status =
        p.stock === 0 ? "Out" : p.stock <= 5 ? "Low" : "In Stock";

      return { ...p, revenue, cost: cost, profit, status };
    });
  }, [filteredProducts]);

  // Insights
  const insights = useMemo(() => {
    if (products.length === 0) return [];

    const categoryRevenue = {};
    products.forEach((p) => {
      const rev = Number(p.price) * (p.soldCount || 0);
      categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + rev;
    });

    const topCategory = Object.keys(categoryRevenue).reduce((a, b) =>
      categoryRevenue[a] > categoryRevenue[b] ? a : b, products[0]?.category
    );

    const highDemand = products.reduce((max, p) =>
      (p.soldCount || 0) > (max.soldCount || 0) ? p : max, products[0]
    );

    const needRestock = products.filter((p) => p.stock <= 5 && p.stock > 0);

    return [
      {
        icon: <TrendingUp size={20} />,
        text: `${topCategory} category has highest sales`,
        type: "success",
      },
      {
        icon: <ShoppingBag size={20} />,
        text: `${highDemand.name} has highest demand`,
        type: "success",
      },
      {
        icon: <AlertCircle size={20} />,
        text: `${needRestock.length} products need restock`,
        type: needRestock.length > 3 ? "warning" : "info",
      },
    ];
  }, [products]);

  const handleExport = () => {
    const csvContent = [
      ["Product", "Price", "Stock", "Sold", "Revenue", "Profit", "Status"],
      ...tableData.map((p) => [
        p.name,
        p.price,
        p.stock,
        p.soldCount || 0,
        p.revenue,
        p.profit,
        p.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "store-analytics.csv";
    a.click();
  };

  return (
    <div className="store-page">
      {/* Header */}
      <motion.div
        className="store-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <StoreIcon size={32} />
            </div>
            <div>
              <h1 className="store-title">Store Analytics Dashboard</h1>
              <p className="store-subtitle">
                Comprehensive insights for your handmade products
              </p>
            </div>
          </div>
          <button className="export-button" onClick={handleExport}>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="kpi-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Revenue</div>
            <div className="kpi-value">Rs {kpis.totalRevenue.toLocaleString()}</div>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="kpi-icon profit">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Profit</div>
            <div className="kpi-value">Rs {kpis.totalProfit.toLocaleString()}</div>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="kpi-icon products">
            <Package size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Products</div>
            <div className="kpi-value">{kpis.totalProducts}</div>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="kpi-icon best">
            <BarChart3 size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Best Selling</div>
            <div className="kpi-value-text">{kpis.bestSelling}</div>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="kpi-icon highest">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Highest Price</div>
            <div className="kpi-value-text">{kpis.highestPrice}</div>
          </div>
        </motion.div>

        <motion.div
          className="kpi-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="kpi-icon low-stock">
            <Box size={24} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Lowest Stock</div>
            <div className="kpi-value-text">{kpis.lowestStock}</div>
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        className="insights-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="section-title">Key Insights</h2>
        <div className="insights-grid">
          {insights.map((insight, idx) => (
            <div key={idx} className={`insight-card ${insight.type}`}>
              <div className="insight-icon">{insight.icon}</div>
              <p className="insight-text">{insight.text}</p>
            </div>
          ))}
        </div>
      </motion.div>



      {/* Charts Grid */}
      <div className="charts-section">
        <h2 className="section-title">Data Visualizations</h2>
        <div className="charts-grid-store">
          {/* Sales by Category */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="chart-header-store">
              <BarChart3 size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Sales by Category</h3>
                <p className="chart-subtitle-store">Revenue distribution</p>
              </div>
            </div>
            <div className="chart-body">
              <Pie data={salesByCategoryData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Price Comparison */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="chart-header-store">
              <TrendingUp size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Product Price Comparison</h3>
                <p className="chart-subtitle-store">Price analysis</p>
              </div>
            </div>
            <div className="chart-body">
              <Bar data={priceComparisonData} options={barOptions} />
            </div>
          </motion.div>

          {/* Stock Distribution */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="chart-header-store">
              <Package size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Stock Distribution</h3>
                <p className="chart-subtitle-store">Inventory levels</p>
              </div>
            </div>
            <div className="chart-body">
              <Radar data={stockDistributionData} options={radarOptions} />
            </div>
          </motion.div>

          {/* Revenue vs Cost */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="chart-header-store">
              <DollarSign size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Revenue vs Cost</h3>
                <p className="chart-subtitle-store">Financial comparison</p>
              </div>
            </div>
            <div className="chart-body">
              <Bar data={revenueVsCostData} options={verticalBarOptions} />
            </div>
          </motion.div>

          {/* Product Popularity */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <div className="chart-header-store">
              <ShoppingBag size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Product Popularity</h3>
                <p className="chart-subtitle-store">Sales distribution</p>
              </div>
            </div>
            <div className="chart-body">
              <PolarArea data={popularityData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Daily Sales Trend */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <div className="chart-header-store">
              <TrendingUp size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Daily Sales Trend</h3>
                <p className="chart-subtitle-store">Weekly performance</p>
              </div>
            </div>
            <div className="chart-body">
              <Line data={dailySalesTrendData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Profit Margin */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div className="chart-header-store">
              <TrendingDown size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Product Profit Margin</h3>
                <p className="chart-subtitle-store">Profitability %</p>
              </div>
            </div>
            <div className="chart-body">
              <Doughnut data={profitMarginData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Top Selling Products */}
          <motion.div
            className="chart-card-store"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <div className="chart-header-store">
              <BarChart3 size={20} className="chart-icon" />
              <div>
                <h3 className="chart-title-store">Top Selling Products</h3>
                <p className="chart-subtitle-store">Best performers</p>
              </div>
            </div>
            <div className="chart-body">
              <Bar data={topSellingData} options={verticalBarOptions} />
            </div>
          </motion.div>
        </div>
      </div>
      {/* Filters */}
      <motion.div
        className="filters-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="sold-asc">Sold: Low to High</option>
            <option value="sold-desc">Sold: High to Low</option>
          </select>
        </div>
      </motion.div>
      {/* Analytics Table */}
      <motion.div
        className="table-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
      >
        <h2 className="section-title">Product Analytics</h2>
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold Count</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.05)" }}
                >
                  <td className="product-name-cell">{p.name}</td>
                  <td>Rs {Number(p.price).toLocaleString()}</td>
                  <td>{p.stock}</td>
                  <td>{p.soldCount || 0}</td>
                  <td className="revenue-cell">
                    Rs {p.revenue.toLocaleString()}
                  </td>
                  <td
                    className={`profit-cell ${p.profit >= 0 ? "positive" : "negative"}`}
                  >
                    Rs {p.profit.toLocaleString()}
                  </td>
                  <td>
                    <span className={`status-badge ${p.status.toLowerCase().replace(" ", "-")}`}>
                      {p.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}