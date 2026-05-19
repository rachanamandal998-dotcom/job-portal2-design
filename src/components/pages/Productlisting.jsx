import { useState, useRef, useEffect } from "react";
import {
  Package,
  Plus,
  Eye,
  Truck,
  Store,
  ShoppingBag,
  BarChart2,
  TrendingUp,
} from "lucide-react";

import Chart from "chart.js/auto";
import { Modal } from "../Modal";
import { DashboardShell } from "../shared/DashboardShell";
import { ListingFormModal } from "../shared/ListingFormModal";
import { AnimatePresence } from "framer-motion";
import TotalOrdersPage from "../pages/Product/TotalOrdersPage";
import TotalProductsPage from "../pages/Product/TotalProductsPage";
import TotalStock from "../pages/Product/TotalStock"; // ← ADDED

import "../styles/Global.css";
import "../styles/Productlisting.css";

export default function ProductListing() {
  const [showProductsPage, setShowProductsPage] = useState(false);
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [showTotalStock, setShowTotalStock] = useState(false); // ← ADDED

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Handmade Bag",
      price: "2990",
      stock: 12,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      category: "Bags",
      cost: 1800,
      soldCount: 8,
      dateAdded: "2026-03-15",
      avgDailySales: 0.3,
    },
    {
      id: 4,
      name: "Handmade Bag",
      price: "3440",
      stock: 17,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      category: "Bags",
      cost: 7000,
      soldCount: 8,
      dateAdded: "2026-04-15",
      avgDailySales: 0.3,
    },
    {
      id: 2,
      name: "Wooden Toy",
      price: "1400",
      stock: 3,
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      category: "Toys",
      cost: 600,
      soldCount: 15,
      dateAdded: "2026-04-01",
      avgDailySales: 0.5,
    },
    {
      id: 3,
      name: "Silk Scarf",
      price: "1900",
      stock: 0,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      category: "Accessories",
      cost: 1100,
      soldCount: 12,
      dateAdded: "2026-02-10",
      avgDailySales: 0.2,
    },
    {
      id: 5,
      name: "Clay Flower Vase",
      price: "2500",
      stock: 9,
      image: "https://images.unsplash.com/photo-1517705008128-361805f42e86",
      category: "Home Decor",
      cost: 1400,
      soldCount: 18,
      dateAdded: "2026-01-18",
      avgDailySales: 0.6,
    },
    {
      id: 6,
      name: "Knitted Sweater",
      price: "4200",
      stock: 6,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      category: "Clothing",
      cost: 2500,
      soldCount: 22,
      dateAdded: "2026-02-22",
      avgDailySales: 0.7,
    },
    {
      id: 7,
      name: "Leather Wallet",
      price: "1800",
      stock: 14,
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",
      category: "Accessories",
      cost: 900,
      soldCount: 30,
      dateAdded: "2026-03-05",
      avgDailySales: 1.1,
    },
    {
      id: 8,
      name: "Ceramic Mug",
      price: "990",
      stock: 25,
      image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a",
      category: "Kitchen",
      cost: 450,
      soldCount: 40,
      dateAdded: "2026-04-12",
      avgDailySales: 1.5,
    },
    {
      id: 9,
      name: "Wool Beanie",
      price: "1200",
      stock: 11,
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee",
      category: "Clothing",
      cost: 500,
      soldCount: 19,
      dateAdded: "2026-01-30",
      avgDailySales: 0.4,
    },
    {
      id: 10,
      name: "Bamboo Basket",
      price: "2100",
      stock: 5,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      category: "Home Decor",
      cost: 1000,
      soldCount: 10,
      dateAdded: "2026-03-28",
      avgDailySales: 0.3,
    },
    {
      id: 11,
      name: "Hand-painted Plate",
      price: "1650",
      stock: 8,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
      category: "Kitchen",
      cost: 750,
      soldCount: 13,
      dateAdded: "2026-02-14",
      avgDailySales: 0.5,
    },
    {
      id: 12,
      name: "Macrame Wall Hanging",
      price: "3600",
      stock: 4,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f",
      category: "Home Decor",
      cost: 2100,
      soldCount: 9,
      dateAdded: "2026-04-08",
      avgDailySales: 0.2,
    },
    {
      id: 13,
      name: "Organic Soap Set",
      price: "850",
      stock: 30,
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
      category: "Beauty",
      cost: 350,
      soldCount: 50,
      dateAdded: "2026-01-10",
      avgDailySales: 1.8,
    },
    {
      id: 14,
      name: "Crochet Plush Bear",
      price: "2700",
      stock: 7,
      image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11",
      category: "Toys",
      cost: 1300,
      soldCount: 16,
      dateAdded: "2026-03-18",
      avgDailySales: 0.6,
    },
    {
      id: 15,
      name: "Handmade Notebook",
      price: "1100",
      stock: 20,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db",
      category: "Stationery",
      cost: 500,
      soldCount: 27,
      dateAdded: "2026-02-25",
      avgDailySales: 0.9,
    },
    {
      id: 16,
      name: "Silver Pendant",
      price: "5200",
      stock: 2,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
      category: "Jewelry",
      cost: 3200,
      soldCount: 6,
      dateAdded: "2026-04-20",
      avgDailySales: 0.2,
    },
  ]);

  const [orders] = useState([
    {
      id: 1001,
      product: "Handmade Bag",
      status: "pending",
      date: "2026-05-10",
      revenue: 2990,
      cost: 3500,
      quantity: 1,
      customer: "John"
    },
    {
      id: 1002,
      product: "Wooden Toy",
      status: "shipped",
      date: "2026-05-11",
      revenue: 1400,
      cost: 600,
      quantity: 2,
      customer: "Sarah"
    },
    {
      id: 1003,
      product: "Silk Scarf",
      status: "delivered",
      date: "2026-05-12",
      revenue: 1900,
      cost: 2200,
      quantity: 1,
      customer: "Mike"
    },
    {
      id: 1004,
      product: "Cotton Kurta",
      status: "pending",
      date: "2026-05-13",
      revenue: 3200,
      cost: 1500,
      quantity: 1,
      customer: "Priya"
    },
    {
      id: 1005,
      product: "Brass Lamp",
      status: "delivered",
      date: "2026-05-14",
      revenue: 4500,
      cost: 5000,
      quantity: 1,
      customer: "Raj"
    },
  ]);

  // ── CONDITIONAL RETURNS ────────────────────────────────────
  if (showProductsPage) {
    return (
      <TotalProductsPage
        products={products}
        onBack={() => setShowProductsPage(false)}
      />
    );
  }

if (showTotalStock) {  // ← ADD THIS
  return (
    <TotalStock 
      products={products} 
      onBack={() => setShowTotalStock(false)} 
    />
  );
}

  if (showOrdersPage) {
    return (
      <TotalOrdersPage
        orders={orders}
        onBack={() => setShowOrdersPage(false)}
      />
    );
  }

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleAddProduct = (data) => {
    setProducts((prev) => [...prev, {...data, id: Date.now() }]);
    setFormOpen(false);
    setModalOpen(false);
  };

  // ── DERIVED STATS ─────────────────────────────────────────────────────────
  const inStock = products.filter((p) => (p.stock || 0) > 5).length;
  const lowStock = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outStock = products.filter((p) => (p.stock || 0) === 0).length;
  const total = products.length;

  const stockStats = [
    { label: "In Stock", value: inStock, color: "#22c55e" },
    { label: "Low Stock", value: lowStock, color: "#fbbf24" },
    { label: "Out of Stock", value: outStock, color: "#ef4444" },
  ];

  const totalOrders = orders.length;
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const avgPrice =
    products.length > 0
     ? (products.reduce((a, p) => a + Number(p.price), 0) / products.length).toFixed(2)
      : "0.00";

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <DashboardShell>
      <div className="product-page" style={{ paddingTop: "2px" }}>
        <div className="container">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your product listings</p>
            <span className="verified-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verified
            </span>
          </div>

          {/* Action Circles */}
          <div className="action-circles">
            <button className="action-circle-btn primary" onClick={() => setFormOpen(true)}>
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Plus size={32} strokeWidth={3} />
                </div>
                <h3 className="circle-label">Add Products</h3>
                <p className="circle-sublabel">Create listing</p>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Eye size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">View Products</h3>
                <p className="circle-sublabel">Your items</p>
                <span className="circle-badge">{products.length}</span>
              </div>
            </button>

            <button className="action-circle-btn" onClick={() => setShowProductsPage(true)}>
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <BarChart2 size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Analytics</h3>
                <p className="circle-sublabel">Product stats</p>
                <span className="circle-badge">{products.length}</span>
              </div>
            </button>

            <button className="action-circle-btn">
              <div className="action-circle-content">
                <div className="circle-icon-wrapper">
                  <Store size={32} strokeWidth={3} style={{ color: "#f97316" }} />
                </div>
                <h3 className="circle-label">Store</h3>
                <p className="circle-sublabel">Open shop</p>
              </div>
            </button>
          </div>

          {/* Overview */}
          <div className="overview-section">
            <div className="overview-header">
              <h2 className="overview-title">Product List Overview</h2>
              <span className="overview-badge">{products.length} Products</span>
            </div>
            <div className="overview-content">
              <DonutChart stats={stockStats} total={total} />
              <div className="stats-bars">
                {stockStats.map((stat) => (
                  <div key={stat.label} className="stat-row">
                    <div className="stat-header">
                      <div className="stat-label">
                        <span className="stat-dot" style={{ background: stat.color }} />
                        {stat.label}
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                    <div className="stat-bar-bg">
                      <div
                        className="stat-bar"
                        style={{
                          width: `${total > 0? (stat.value / total) * 100 : 0}%`,
                          background: stat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats - ALL CLICKABLE */}
          <div className="quick-stats">
            <div className="stat-card" onClick={() => setShowOrdersPage(true)} style={{ cursor: "pointer" }} title="View all orders">
              <div className="stat-icon"><ShoppingBag size={24} /></div>
              <div className="stat-value">{totalOrders}</div>
              <div className="stat-label-text">Total Orders</div>
            </div>

            <div className="stat-card" onClick={() => setShowProductsPage(true)} style={{ cursor: "pointer" }} title="View product analytics">
              <div className="stat-icon"><Package size={24} /></div>
              <div className="stat-value">{products.length}</div>
              <div className="stat-label-text">Total Products</div>
            </div>

            <div className="stat-card" onClick={() => setShowTotalStock(true)} style={{ cursor: "pointer" }} title="View stock details">
              <div className="stat-icon"><BarChart2 size={24} /></div>
              <div className="stat-value">{totalStock}</div>
              <div className="stat-label-text">Total Stock</div>
            </div>

            <div className="stat-card" onClick={() => setShowTotalStock(true)} style={{ cursor: "pointer" }} title="View pricing details">
              <div className="stat-icon"><TrendingUp size={24} /></div>
              <div className="stat-value">Rs {avgPrice}</div>
              <div className="stat-label-text">Avg. Price</div>
            </div>
          </div>

          {/* Charts */}
          <ChartsSection orders={orders} products={products} />

          {/* Products Grid */}
          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Products</h2>
                <p className="section-subtitle">Manage your listings with a polished product view.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">Rs {product.price}</div>
                    <div className="product-stock">
                      {product.stock > 5 && <span className="stock-badge in-stock">In Stock</span>}
                      {product.stock > 0 && product.stock <= 5 && <span className="stock-badge low-stock">Low Stock</span>}
                      {product.stock === 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
                      {product.stock} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modals */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddProduct} type="product" />
        <AnimatePresence>
          {formOpen && <ListingFormModal kind="product" onClose={() => setFormOpen(false)} onSubmit={handleAddProduct} />}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}

// Donut Chart
function DonutChart({ stats, total }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const segments = stats.map((stat) => {
    const percent = total > 0? stat.value / total : 0;
    const dash = percent * circumference;
    const segment = {
     ...stat,
      dasharray: `${dash} ${circumference - dash}`,
      offset: -offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="donut-container">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((s) => (
          <circle
            key={s.label}
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
        <div className="donut-label">Products</div>
      </div>
    </div>
  );
}

// Charts Section
function ChartsSection({ orders, products }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    const orange = "rgb(249,115,22)";
    const orangeAlpha = "rgba(249,115,22,0.12)";
    const grid = "#f1f5f9";
    const tick = "#94a3b8";

    Object.values(chartsRef.current).forEach((chart) => chart?.destroy());

    if (lineRef.current) {
      chartsRef.current.line = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Orders",
              data: [1, 3, 2, 5, 4, 6, 3],
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
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick } },
          },
        },
      });
    }

    if (pieRef.current) {
      chartsRef.current.pie = new Chart(pieRef.current, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Shipped", "Delivered"],
          datasets: [
            {
              data: [
                orders.filter((o) => o.status === "pending").length,
                orders.filter((o) => o.status === "shipped").length,
                orders.filter((o) => o.status === "delivered").length,
              ],
              backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e"],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          cutout: "60%",
        },
      });
    }

    if (barRef.current) {
      chartsRef.current.bar = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: products.map((p) => p.name),
          datasets: [
            {
              label: "Stock",
              data: products.map((p) => p.stock),
              backgroundColor: "rgba(249,115,22,0.7)",
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick } },
          },
        },
      });
    }

    return () => {
      Object.values(chartsRef.current).forEach((chart) => chart?.destroy());
    };
  }, [orders, products]);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Weekly Order Trend</h3>
          <p className="chart-subtitle">Orders over the last 7 days</p>
        </div>
        <div className="chart-container">
          <canvas ref={lineRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Order Status</h3>
          <p className="chart-subtitle">Current order breakdown</p>
        </div>
        <div className="chart-container">
          <canvas ref={pieRef} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Product Stock</h3>
          <p className="chart-subtitle">Current inventory levels</p>
        </div>
        <div className="chart-container">
          <canvas ref={barRef} />
        </div>
      </div>
    </div>
  );
}