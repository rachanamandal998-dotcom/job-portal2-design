import { useState, useRef, useEffect, useMemo } from "react";
import {
  Package, Plus, Eye, Store as StoreIcon, ShoppingBag,
  BarChart2, TrendingUp, Filter,
} from "lucide-react";
import Chart from "chart.js/auto";
import { Modal } from "../Modal";
import { DashboardShell } from "../shared/DashboardShell";
import { ListingFormModal } from "../shared/ListingFormModal";
import { AnimatePresence, motion } from "framer-motion";

import TotalOrdersPage from "../pages/Product/TotalOrdersPage";
import TotalProductsPage from "../pages/Product/TotalProductsPage";
import TotalStock from "../pages/Product/TotalStock";
import Store from "../pages/Product/Store";
import AvgPrice from "../pages/Product/AvgPrice";
import ProductAnalytics from "../pages/Product/ProductAnalytics";

import "../styles/Global.css";
import "../styles/Productlisting.css";

export default function ProductListing() {
  const [showProductsPage, setShowProductsPage] = useState(false);
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [showTotalStock, setShowTotalStock] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showAvgPrice, setShowAvgPrice] = useState(false);
  const [showProductAnalytics, setShowProductAnalytics] = useState(false);

  const [productFilter, setProductFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [products, setProducts] = useState([
    { id: 1, name: "Handmade Bag", price: "2990", stock: 12, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", category: "Bags", cost: 1800, soldCount: 8, dateAdded: "2026-03-15", avgDailySales: 0.3 },
    { id: 4, name: "Handmade Bag", price: "3440", stock: 17, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", category: "Bags", cost: 7000, soldCount: 8, dateAdded: "2026-04-15", avgDailySales: 0.3 },
    { id: 2, name: "Wooden Toy", price: "1400", stock: 3, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f", category: "Toys", cost: 600, soldCount: 15, dateAdded: "2026-04-01", avgDailySales: 0.5 },
    { id: 3, name: "Silk Scarf", price: "1900", stock: 0, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", category: "Accessories", cost: 1100, soldCount: 12, dateAdded: "2026-02-10", avgDailySales: 0.2 },
    { id: 5, name: "Clay Flower Vase", price: "2500", stock: 9, image: "https://images.unsplash.com/photo-1517705008128-361805f42e86", category: "Home Decor", cost: 1400, soldCount: 18, dateAdded: "2026-01-18", avgDailySales: 0.6 },
    { id: 6, name: "Knitted Sweater", price: "4200", stock: 6, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", category: "Clothing", cost: 2500, soldCount: 22, dateAdded: "2026-02-22", avgDailySales: 0.7 },
    { id: 7, name: "Leather Wallet", price: "1800", stock: 14, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", category: "Accessories", cost: 900, soldCount: 30, dateAdded: "2026-03-05", avgDailySales: 1.1 },
    { id: 8, name: "Ceramic Mug", price: "990", stock: 25, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a", category: "Kitchen", cost: 450, soldCount: 40, dateAdded: "2026-04-12", avgDailySales: 1.5 },
    { id: 9, name: "Wool Beanie", price: "1200", stock: 11, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee", category: "Clothing", cost: 500, soldCount: 19, dateAdded: "2026-01-30", avgDailySales: 0.4 },
    { id: 10, name: "Bamboo Basket", price: "2100", stock: 5, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85", category: "Home Decor", cost: 1000, soldCount: 10, dateAdded: "2026-03-28", avgDailySales: 0.3 },
    { id: 11, name: "Hand-painted Plate", price: "1650", stock: 8, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085", category: "Kitchen", cost: 750, soldCount: 13, dateAdded: "2026-02-14", avgDailySales: 0.5 },
    { id: 12, name: "Macrame Wall Hanging", price: "3600", stock: 4, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f", category: "Home Decor", cost: 2100, soldCount: 9, dateAdded: "2026-04-08", avgDailySales: 0.2 },
    { id: 13, name: "Organic Soap Set", price: "850", stock: 30, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519", category: "Beauty", cost: 350, soldCount: 50, dateAdded: "2026-01-10", avgDailySales: 1.8 },
    { id: 14, name: "Crochet Plush Bear", price: "2700", stock: 7, image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11", category: "Toys", cost: 1300, soldCount: 16, dateAdded: "2026-03-18", avgDailySales: 0.6 },
    { id: 15, name: "Handmade Notebook", price: "1100", stock: 20, image: "https://images.unsplash.com/photo-1517842645767-c639042777db", category: "Stationery", cost: 500, soldCount: 27, dateAdded: "2026-02-25", avgDailySales: 0.9 },
    { id: 16, name: "Silver Pendant", price: "5200", stock: 2, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338", category: "Jewelry", cost: 3200, soldCount: 6, dateAdded: "2026-04-20", avgDailySales: 0.2 },
  ]);

  const [orders] = useState([
    { id: 1001, product: "Handmade Bag", status: "pending", date: "2026-05-10", revenue: 2990, cost: 3500, quantity: 1, customer: "John" },
    { id: 1002, product: "Wooden Toy", status: "shipped", date: "2026-05-11", revenue: 1400, cost: 600, quantity: 2, customer: "Sarah" },
    { id: 1003, product: "Silk Scarf", status: "delivered", date: "2026-05-12", revenue: 1900, cost: 2200, quantity: 1, customer: "Mike" },
    { id: 1004, product: "Cotton Kurta", status: "pending", date: "2026-05-13", revenue: 3200, cost: 1500, quantity: 1, customer: "Priya" },
    { id: 1005, product: "Brass Lamp", status: "delivered", date: "2026-05-14", revenue: 4500, cost: 5000, quantity: 1, customer: "Raj" },
  ]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (productFilter === "inStock") result = result.filter(p => (p.stock || 0) > 5);
    else if (productFilter === "lowStock") result = result.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
    else if (productFilter === "outOfStock") result = result.filter(p => (p.stock || 0) === 0);
    if (categoryFilter !== "all") result = result.filter(p => p.category === categoryFilter);
    return result;
  }, [products, productFilter, categoryFilter]);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  if (showProductsPage) return <TotalProductsPage products={products} onBack={() => setShowProductsPage(false)} />;
  if (showTotalStock) return <TotalStock products={products} onBack={() => setShowTotalStock(false)} />;
  if (showStore) return <Store products={products} onBack={() => setShowStore(false)} />;
  if (showAvgPrice) return <AvgPrice products={products} onBack={() => setShowAvgPrice(false)} />;
  if (showProductAnalytics) return <ProductAnalytics products={products} onBack={() => setShowProductAnalytics(false)} />;
  if (showOrdersPage) return <TotalOrdersPage orders={orders} onBack={() => setShowOrdersPage(false)} />;

  const handleAddProduct = (data) => {
    setProducts(prev => [...prev, { ...data, id: Date.now() }]);
    setFormOpen(false);
    setModalOpen(false);
  };

  const inStock = products.filter(p => (p.stock || 0) > 5).length;
  const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outStock = products.filter(p => (p.stock || 0) === 0).length;
  const total = products.length;
  const totalOrders = orders.length;
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const avgPrice = products.length > 0 ? (products.reduce((a, p) => a + Number(p.price), 0) / products.length).toFixed(2) : "0.00";

  const circles = [
    { primary: true, icon: <Plus size={32} strokeWidth={3} />, label: "Add Products", sub: "Create listing", onClick: () => setFormOpen(true) },
    { icon: <Eye size={32} strokeWidth={3} />, label: "View Products", sub: "Your items", badge: products.length, color: "#f97316", onClick: () => setShowProductsPage(true) },
    { icon: <BarChart2 size={32} strokeWidth={3} />, label: "Analytics", sub: "Product stats", badge: products.length, color: "#f97316", onClick: () => setShowProductAnalytics(true) },
    { icon: <StoreIcon size={32} strokeWidth={3} />, label: "Store", sub: "Open shop", color: "#f97316", onClick: () => setShowStore(true) },
  ];

  const stockStats = [
    { key: "inStock", label: "In Stock", value: inStock, color: "#22c55e" },
    { key: "lowStock", label: "Low Stock", value: lowStock, color: "#fbbf24" },
    { key: "outOfStock", label: "Out of Stock", value: outStock, color: "#ef4444" },
  ];

  const quickCards = [
    { icon: <ShoppingBag size={24} />, value: totalOrders, label: "Total Orders", onClick: () => setShowOrdersPage(true) },
    { icon: <Package size={24} />, value: products.length, label: "Total Products", onClick: () => setShowProductsPage(true) },
    { icon: <BarChart2 size={24} />, value: totalStock, label: "Total Stock", onClick: () => setShowTotalStock(true) },
    { icon: <TrendingUp size={24} />, value: `Rs ${avgPrice}`, label: "Avg. Price", onClick: () => setShowAvgPrice(true) },
  ];

  const productCharts = [
    { id: 'orders', title: 'Weekly Order Trend', subtitle: 'Orders over the last 7 days', type: 'line', data: (orange, orangeAlpha) => ({ labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], datasets: [{ label: "Orders", data: [1, 3, 2, 5, 4, 6, 3], borderColor: orange, backgroundColor: orangeAlpha, fill: true, tension: 0.4, borderWidth: 2 }] }) },
    { id: 'status', title: 'Order Status', subtitle: 'Current order breakdown', type: 'doughnut', data: () => ({ labels: ["Pending", "Shipped", "Delivered"], datasets: [{ data: [orders.filter(o => o.status === "pending").length, orders.filter(o => o.status === "shipped").length, orders.filter(o => o.status === "delivered").length], backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e"], borderWidth: 2, borderColor: "#fff" }] }) },
    { id: 'stock', title: 'Product Stock', subtitle: 'Current inventory levels', type: 'bar', data: () => ({ labels: products.slice(0, 6).map(p => p.name), datasets: [{ label: "Stock", data: products.slice(0, 6).map(p => p.stock), backgroundColor: "rgba(249,115,22,0.7)", borderRadius: 6 }] }) }
  ];

  return (
    <DashboardShell>
      <div className="product-page" style={{ paddingTop: "2px" }}>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Hi, Rachana!</h1>
            <p className="page-subtitle">Manage your product listings</p>
            <span className="verified-badge">
              <svg width="16" height="16" viewBox="0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Verified
            </span>
          </div>

          <div className="action-circles">
            {circles.map((c, i) => (
              <motion.button key={i} className={`action-circle-btn ${c.primary ? 'primary' : ''}`} onClick={c.onClick} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <div className="action-circle-content">
                  <div className="circle-icon-wrapper" style={c.color ? { color: c.color } : {}}>{c.icon}</div>
                  <h3 className="circle-label">{c.label}</h3>
                  <p className="circle-sublabel">{c.sub}</p>
                  {c.badge && <span className="circle-badge">{c.badge}</span>}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="overview-section">
            <div className="overview-header">
              <h2 className="overview-title">Product List Overview</h2>
              <span className="overview-badge">{products.length} Products</span>
            </div>
            <div className="overview-content">
              <DonutChart stats={stockStats} total={total} label="Products" />
              <div className="stats-bars">
                {stockStats.map(stat => (
                  <div key={stat.key} className="stat-row" onClick={() => setProductFilter(stat.key === "inStock" ? "inStock" : stat.key === "lowStock" ? "lowStock" : "outOfStock")}>
                    <div className="stat-header">
                      <div className="stat-label"><span className="stat-dot" style={{ background: stat.color }} />{stat.label}</div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                    <div className="stat-bar-bg"><div className="stat-bar" style={{ width: `${total ? (stat.value / total) * 100 : 0}%`, background: stat.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="quick-stats">
            {quickCards.map((card, i) => (
              <motion.div key={i} className="stat-card" whileHover={{ y: -5 }} onClick={card.onClick} style={{ cursor: "pointer" }}>
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label-text">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <ChartsGrid charts={productCharts} />

          <div className="products-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Products</h2>
                <p className="section-subtitle">{productFilter === "all" && categoryFilter === "all" ? "Manage your listings with a polished product view." : `Showing ${filteredProducts.length} filtered products`}</p>
              </div>
              <div className="section-actions">
                <div className="filter-wrapper">
                  <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="btn filter-select">
                    <option value="all">All Stock ({total})</option>
                    <option value="inStock">In Stock ({inStock})</option>
                    <option value="lowStock">Low Stock ({lowStock})</option>
                    <option value="outOfStock">Out of Stock ({outStock})</option>
                  </select>
                  <Filter size={16} className="filter-icon" />
                </div>
                <div className="filter-wrapper">
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="btn filter-select">
                    <option value="all">All Categories</option>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <Filter size={16} className="filter-icon" />
                </div>
                <button className="btn btn-primary" onClick={() => setFormOpen(true)}><Plus size={16} /> Add Product</button>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}><Package size={48} style={{ color: '#cbd5e1' }} /><p>No products match your filters</p></div>
              ) : (
                filteredProducts.map(product => (
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
                ))
              )}
            </div>
          </div>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddProduct} type="product" />
        <AnimatePresence>{formOpen && <ListingFormModal kind="product" onClose={() => setFormOpen(false)} onSubmit={handleAddProduct} />}</AnimatePresence>
      </div>
    </DashboardShell>
  );
}

function DonutChart({ stats, total, label = "Total" }) {
  const radius = 45; const circumference = 2 * Math.PI * radius; let offset = 0;
  const segments = stats.map(stat => { const percent = total > 0 ? stat.value / total : 0; const dash = percent * circumference; const seg = { ...stat, dasharray: `${dash} ${circumference - dash}`, offset: -offset }; offset += dash; return seg; });
  return (<div className="donut-container"><svg width="140" height="140" viewBox="0 0 120 120"><circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />{segments.map(s => (<circle key={s.label} cx="60" cy="60" r={radius} fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={s.dasharray} strokeDashoffset={s.offset} strokeLinecap="round" transform="rotate(-90 60 60)" />))}</svg><div className="donut-center"><div className="donut-number">{total}</div><div className="donut-label">{label}</div></div></div>);
}
function ChartsGrid({ charts }) {
  const refs = useRef({});
  const instances = useRef({});

  useEffect(() => {
    Object.values(instances.current).forEach(c => c?.destroy());
    instances.current = {};

    const orange = "rgb(249,115,22)";
    const orangeAlpha = "rgba(249,115,22,0.12)";
    const grid = "#f1f5f9";
    const tick = "#94a3b8";

    charts.forEach(chart => {
      const canvas = refs.current[chart.id];
      if (!canvas) return;

      instances.current[chart.id] = new Chart(canvas, {
        type: chart.type,
        data: chart.data(orange, orangeAlpha),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: {
                color: grid,
                display: chart.type!== 'doughnut'
              },
              ticks: { color: tick }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: grid,
                display: chart.type!== 'doughnut'
              },
              ticks: { color: tick }
            }
          },
          cutout: chart.type === 'doughnut'? '60%' : undefined
        }
      });
    });

    return () => {
      Object.values(instances.current).forEach(c => c?.destroy());
    };
  }, [charts]);

  return (
    <div className="charts-grid">
      {charts.map(chart => (
        <div key={chart.id} className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">{chart.title}</h3>
            <p className="chart-subtitle">{chart.subtitle}</p>
          </div>
          <div className="chart-container">
            <canvas ref={el => refs.current[chart.id] = el} />
          </div>
        </div>
      ))}
    </div>
  );
}