import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Chart from "chart.js/auto";
import {
  Package, Plus, Eye, Truck, Store,
  Clock, CheckCircle, TrendingUp, ShoppingBag, BarChart2,
} from "lucide-react";
import { DashboardShell, Greeting, SectionPanel } from "../shared/DashboardShell";
import { ListingFormModal } from "../shared/ListingFormModal";
import "./ProductListing.css";

/* ── Circle Actions ── */
function ActionCircles({ products, orders, onAdd }) {
  const items = [
    { icon: Plus, label: "Add Product", sub: "New listing", primary: true, onClick: onAdd },
    { icon: Eye, label: "View All", sub: "Browse items", badge: products.length },
    { icon: Truck, label: "Track Orders", sub: "Order status", badge: orders.length },
    { icon: Store, label: "My Store", sub: "Open shop" },
  ];

  return (
    <div className="circles-grid">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="circ-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          onClick={item.onClick}
        >
          <div className={`circ-outer ${item.primary ? "circ-outer--primary" : ""}`}>
            <div className={`circ-inner ${item.primary ? "circ-inner--primary" : ""}`}>
              <item.icon size={22} className="circ-icon" />
              <div className="circ-label">{item.label}</div>
              <div className="circ-sub">{item.sub}</div>
              {item.badge !== undefined && (
                <span className="circ-badge">{item.badge}</span>
              )}
            </div>
          </div>
          <span className="circ-card-label">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Product Overview Donut ── */
function ProductOverview({ products, orders }) {
  const total = products.length || 1;
  const inStock = products.filter(p => (p.stock || 0) > 5).length;
  const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
  const outStock = products.filter(p => (p.stock || 0) === 0).length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const avgPrice = products.length > 0
    ? (products.reduce((a, p) => a + (Number(p.price) || 0), 0) / products.length).toFixed(2)
    : "0.00";

  const segments = [
    { key: "In Stock", value: inStock, color: "#22c55e" },
    { key: "Low Stock", value: lowStock, color: "#fbbf24" },
    { key: "Out of Stock", value: outStock, color: "#ef4444" },
  ];

  const r = 45, circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(s => {
    const dash = (s.value / total) * circ;
    const arc = { ...s, dasharray: `${dash} ${circ - dash}`, offset: -offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="overview-wrap">
      <div className="overview-head">
        <h3 className="overview-title">Product Overview</h3>
        <span className="overview-badge">{products.length} Products</span>
      </div>
      <div className="overview-body">
        <div className="donut-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
            {arcs.map(s => (
              <circle
                key={s.key} cx="60" cy="60" r={r}
                fill="none" stroke={s.color} strokeWidth="12"
                strokeDasharray={s.dasharray} strokeDashoffset={s.offset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
              />
            ))}
          </svg>
          <div className="donut-center">
            <div className="donut-num">{products.length}</div>
            <div className="donut-lbl">Items</div>
          </div>
        </div>
        <div className="stat-bars">
          {arcs.map(s => (
            <div key={s.key} className="stat-row">
              <div className="stat-row-top">
                <div className="stat-dot" style={{ background: s.color }} />
                <span className="stat-name">{s.key}</span>
                <span className="stat-val">{s.value}</span>
              </div>
              <div className="stat-bar-bg">
                <div className="stat-bar" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="metrics-row">
          <div className="metric-tile">
            <div className="metric-val">${avgPrice}</div>
            <div className="metric-lbl">Avg Price</div>
          </div>
          <div className="metric-tile">
            <div className="metric-val">{delivered}</div>
            <div className="metric-lbl">Delivered</div>
          </div>
          <div className="metric-tile">
            <div className="metric-val">{orders.length}</div>
            <div className="metric-lbl">Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Quick Stats ── */
function QuickStats({ products, orders }) {
  const delivered = orders.filter(o => o.status === "delivered").length;
  const rate = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);

  const tiles = [
    { icon: ShoppingBag, label: "Total Orders", val: orders.length },
    { icon: Package, label: "Products", val: products.length },
    { icon: BarChart2, label: "Total Stock", val: totalStock },
    { icon: TrendingUp, label: "Delivery Rate", val: `${rate}%` },
  ];

  return (
    <div className="qs-grid">
      {tiles.map((t, i) => (
        <motion.div
          key={t.label}
          className="qs-tile"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 + 0.1 }}
        >
          <div className="qs-tile-icon"><t.icon size={18} /></div>
          <div className="qs-tile-val">{t.val}</div>
          <div className="qs-tile-label">{t.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Charts ── */
function ChartsSection({ products, orders }) {
  const lineRef = useRef(null);
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const lineInst = useRef(null);
  const pieInst = useRef(null);
  const barInst = useRef(null);

  useEffect(() => {
    if (!lineRef.current || !pieRef.current || !barRef.current) return;

    lineInst.current?.destroy();
    pieInst.current?.destroy();
    barInst.current?.destroy();

    const or = "#f97316";
    const orFill = "rgba(249,115,22,0.1)";
    const grid = "#f3f4f6";
    const tick = "#9ca3af";

    lineInst.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Orders",
          data: [2, 4, 3, 6, 5, 8, 4],
          borderColor: or,
          backgroundColor: orFill,
          borderWidth: 2,
          pointBackgroundColor: or,
          pointRadius: 4,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
        },
      },
    });

    const pending = orders.filter(o => o.status === "pending").length;
    const shipped = orders.filter(o => o.status === "shipped").length;
    const delivered = orders.filter(o => o.status === "delivered").length;

    pieInst.current = new Chart(pieRef.current, {
      type: "doughnut",
      data: {
        labels: ["Pending", "Shipped", "Delivered"],
        datasets: [{
          data: [pending || 1, shipped || 1, delivered || 1],
          backgroundColor: ["#fbbf24", "#3b82f6", "#22c55e"],
          borderWidth: 2,
          borderColor: "#fff",
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } } },
        cutout: "62%",
      },
    });

    barInst.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: products.length > 0 ? products.map(p => p.name) : ["No Products"],
        datasets: [{
          label: "Stock",
          data: products.length > 0 ? products.map(p => p.stock || 0) : [0],
          backgroundColor: "rgba(249,115,22,0.75)",
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tick, font: { size: 11 } } },
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, font: { size: 11 } } },
        },
      },
    });

    return () => {
      lineInst.current?.destroy();
      pieInst.current?.destroy();
      barInst.current?.destroy();
    };
  }, [products, orders]);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-card-title">Weekly Orders</div>
        <div className="chart-card-sub">Order trend last 7 days</div>
        <div className="chart-wrap"><canvas ref={lineRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Order Status</div>
        <div className="chart-card-sub">Current breakdown</div>
        <div className="chart-wrap"><canvas ref={pieRef} /></div>
      </div>
      <div className="chart-card">
        <div className="chart-card-title">Stock Levels</div>
        <div className="chart-card-sub">Per product inventory</div>
        <div className="chart-wrap"><canvas ref={barRef} /></div>
      </div>
    </div>
  );
}

/* ── PAGE ── */
export default function ProductListing() {
  const [formOpen, setFormOpen] = useState(false);
  const [products, setProducts] = useState([
    { name: "Handmade Bag", price: "29.99", stock: 12, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Wooden Toy", price: "14.50", stock: 3, image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400" },
    { name: "Silk Scarf", price: "19.00", stock: 0, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
  ]);
  const [orders] = useState([
    { id: 1001, product: "Handmade Bag", status: "pending", date: "2026-05-10" },
    { id: 1002, product: "Wooden Toy", status: "shipped", date: "2026-05-11" },
    { id: 1003, product: "Silk Scarf", status: "delivered", date: "2026-05-12" },
  ]);

  const handleAdd = (data) => {
    setProducts(prev => [...prev, data]);
    setFormOpen(false);
  };

  return (
    <DashboardShell>
      <Greeting title="Manage your product listings" subtitle="Hi, Rachana!" verified />

      <ActionCircles products={products} orders={orders} onAdd={() => setFormOpen(true)} />
      <ProductOverview products={products} orders={orders} />
      <QuickStats products={products} orders={orders} />
      <ChartsSection products={products} orders={orders} />

      {/* Orders */}
      <SectionPanel
        title="Recent Orders"
        description="Your latest 3 orders"
        emptyIcon={Package}
        emptyTitle="No orders yet"
        emptyHint="Orders will appear once customers purchase."
      >
        {orders.length > 0 && (
          <div className="pl-order-list">
            {orders.slice(0, 3).map((o, i) => (
              <div key={i} className="pl-order-row">
                <div className="pl-order-info">
                  <span className="pl-order-id">#{o.id}</span>
                  <span className="pl-order-meta">{o.product} · {o.date}</span>
                </div>
                <span className={`status-pill status-${o.status}`}>
                  {o.status === "pending" && <Clock size={11} />}
                  {o.status === "shipped" && <Truck size={11} />}
                  {o.status === "delivered" && <CheckCircle size={11} />}
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionPanel>

      {/* Products grid */}
      <SectionPanel
        title="My Products"
        description="All your listed products"
        emptyIcon={Package}
        emptyTitle="No products yet"
        emptyHint="Add your first product to start selling."
        cta={
          <button className="brand-btn" onClick={() => setFormOpen(true)}>
            <Plus size={14} /> Add Product
          </button>
        }
      >
        {products.length > 0 && (
          <div className="pl-products-grid">
            {products.map((p, i) => (
              <motion.div
                key={i}
                className="pl-product-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="pl-product-img">
                  <img src={p.image} alt={p.name} />
                  <div className={`pl-product-stock-badge ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "in"}`}>
                    {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `${p.stock} left` : "In stock"}
                  </div>
                </div>
                <div className="pl-product-info">
                  <div className="pl-product-name">{p.name}</div>
                  <div className="pl-product-price">Rs. {p.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionPanel>

      <div className="pl-bottom-cta">
        <button className="brand-btn pl-big-btn" onClick={() => setFormOpen(true)}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <AnimatePresence>
        {formOpen && (
          <ListingFormModal kind="Product" onClose={() => setFormOpen(false)} onSubmit={handleAdd} />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}