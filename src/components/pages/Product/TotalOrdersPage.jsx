import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ShoppingBag, Clock, Truck, CheckCircle, ArrowLeft,
  Search, Filter, TrendingUp, TrendingDown, AlertTriangle,
  Star, DollarSign, BarChart2, Award, Zap, ChevronDown, Sun, Moon
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/TotalOrders.css";

/* ─── Constants ─── */
const WEEKDAY_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TODAY = new Date();

const STATUS_COLOR = {
  pending: { bg: "rgba(251, 191, 36, 0.15)", text: "#b45309", border: "#fde68a" },
  shipped: { bg: "rgba(59, 130, 246, 0.15)", text: "#1d4ed8", border: "#bfdbfe" },
  delivered: { bg: "rgba(34, 197, 94, 0.15)", text: "#15803d", border: "#a7f3d0" },
  cancelled: { bg: "rgba(239, 68, 68, 0.15)", text: "#b91c1c", border: "#fecaca" },
};

/* ─── Sample Data ─── */
function generateSampleData() {
  const products = [
    "Handmade Bag",
    "Wooden Toy",
    "Silk Scarf",
    "Cotton Kurta",
    "Brass Lamp"
  ];

  const statuses = ["pending", "shipped", "delivered"];
  const data = [];
  let id = 9001;

  for (let i = 119; i >= 0; i--) {
    const date = new Date(TODAY);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const product = products[Math.floor(Math.random() * products.length)];
    const status = i < 7
      ? statuses[Math.floor(Math.random() * 2)]
      : statuses[Math.floor(Math.random() * statuses.length)];

    const basePrice = {
      "Handmade Bag": 1800,
      "Wooden Toy": 1200,
      "Silk Scarf": 2200,
      "Cotton Kurta": 3200,
      "Brass Lamp": 4500,
    }[product];

    const revenue = basePrice;
    const cost = Math.random() > 0.85
      ? Math.round(revenue * (1 + Math.random() * 0.3))
      : Math.round(revenue * (0.3 + Math.random() * 0.4));

    data.push({
      id: id++,
      product,
      status,
      date: dateStr,
      revenue,
      cost,
    });
  }
  return data;
}

export const SAMPLE_ORDERS = generateSampleData();

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString("en-IN")}`;

function groupByWeekday(orders) {
  const map = {};
  WEEKDAY_FULL.forEach((d) => { map[d] = { orders: [], profit: 0, loss: 0 }; });
  orders.forEach((o) => {
    const day = new Date(o.date).toLocaleDateString("en-US", { weekday: "long" });
    if (!map[day]) return;
    const pl = (o.revenue || 0) - (o.cost || 0);
    map[day].orders.push(o);
    if (pl >= 0) map[day].profit += pl;
    else map[day].loss += Math.abs(pl);
  });
  return map;
}

/* ─── Skeleton loader ─── */
function LoadingPage() {
  return (
    <div className="orders-analytics-wrapper">
      <div className="oa-loading-page">
        <div className="oa-skel" style={{ height: 60, borderRadius: 12 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="oa-skel" style={{ height: 110, borderRadius: 16 }} />
          ))}
        </div>
        <div className="oa-skel" style={{ height: 280, borderRadius: 16 }} />
        <div className="oa-skel" style={{ height: 280, borderRadius: 16 }} />
      </div>
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="oa-kpi-card">
      <div className="oa-kpi-icon" style={{ background: color }}>
        <Icon size={20} color="white" />
      </div>
      <div className="oa-kpi-body">
        <div className="oa-kpi-value">{value}</div>
        <div className="oa-kpi-label">{label}</div>
        {sub && <div className="oa-kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Insight Card ─── */
function InsightCard({ icon, title, text, color, border }) {
  return (
    <div className="oa-insight-card" style={{ background: color, border: `1.5px solid ${border}` }}>
      <div className="oa-insight-icon">{icon}</div>
      <div>
        <div className="oa-insight-title">{title}</div>
        <div className="oa-insight-text">{text}</div>
      </div>
    </div>
  );
}

/* ─── Heatmap ─── */
function HeatmapSection({ orders }) {
  const byDay = useMemo(() => groupByWeekday(orders), [orders]);
  return (
    <div className="oa-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title">Day Performance Heatmap</h3>
        <p className="oa-section-subtitle">Profit intensity by day of week</p>
      </div>
      <div className="oa-heatmap-grid">
        {WEEKDAY_FULL.map((day) => {
          const safe = byDay[day] || { profit: 0, loss: 0, orders: [] };
          const { profit, loss, orders: dayOrders } = safe;
          const net = profit - loss;
          const isProfit = net > 0;
          const isNeutral = net === 0 && dayOrders.length === 0;
          let bg, border, textColor, label;
          if (isNeutral) {
            bg = "rgba(254, 247, 237, 0.8)"; border = "#fed7aa"; textColor = "#9a3412"; label = "No data";
          } else if (isProfit) {
            const intensity = Math.min(net / 10000, 1);
            bg = `rgba(249,115,22,${0.15 + intensity * 0.5})`; border = "#f97316"; textColor = "#9a3412"; label = `+${fmt(net)}`;
          } else {
            const intensity = Math.min(Math.abs(net) / 10000, 1);
            bg = `rgba(239,68,68,${0.15 + intensity * 0.5})`; border = "#ef4444"; textColor = "#991b1b"; label = `-${fmt(Math.abs(net))}`;
          }
          return (
            <div key={day} className="oa-heatmap-cell" style={{ background: bg, border: `2px solid ${border}`, color: textColor }}>
              <div className="oa-heatmap-day">{day.slice(0, 3)}</div>
              <div className="oa-heatmap-orders">{dayOrders.length} orders</div>
              <div className="oa-heatmap-net">{label}</div>
            </div>
          );
        })}
      </div>
      <div className="oa-heatmap-legend">
        <span><span className="oa-legend-dot" style={{ background: "#ef4444" }} /> Loss</span>
        <span><span className="oa-legend-dot" style={{ background: "#fed7aa" }} /> Neutral</span>
        <span><span className="oa-legend-dot" style={{ background: "#f97316" }} /> Profit</span>
      </div>
    </div>
  );
}

/* ─── Revenue Forecast ─── */
function RevenueForecast({ orders }) {
  const forecast = useMemo(() => {
    const last7 = orders.filter((o) => (TODAY - new Date(o.date)) / 86400000 <= 7);
    const dailyAvg = last7.length > 0 ? last7.reduce((s, o) => s + (o.revenue || 0), 0) / 7 : 0;
    const next30 = Math.round(dailyAvg * 30);
    const prev7 = orders.filter((o) => {
      const d = (TODAY - new Date(o.date)) / 86400000;
      return d > 7 && d <= 14;
    });
    const prevAvg = prev7.length > 0 ? prev7.reduce((s, o) => s + (o.revenue || 0), 0) / 7 : 0;
    const trend = dailyAvg > prevAvg ? "up" : dailyAvg < prevAvg ? "down" : "flat";
    return { next30, dailyAvg, trend };
  }, [orders]);

  return (
    <div className="oa-section oa-forecast-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={18} color="#f97316" /> 30-Day Revenue Forecast
        </h3>
        <p className="oa-section-subtitle">Based on last 7 days average</p>
      </div>
      <div className="oa-forecast-grid">
        <div className="oa-forecast-card">
          <div className="oa-forecast-label">Projected Revenue</div>
          <div className="oa-forecast-value">{fmt(forecast.next30)}</div>
          <div className="oa-forecast-sub">Next 30 days</div>
        </div>
        <div className="oa-forecast-card">
          <div className="oa-forecast-label">Daily Average</div>
          <div className="oa-forecast-value">{fmt(Math.round(forecast.dailyAvg))}</div>
          <div className="oa-forecast-sub">Per day</div>
        </div>
        <div className="oa-forecast-card">
          <div className="oa-forecast-label">Trend</div>
          <div
            className="oa-forecast-value"
            style={{ color: forecast.trend === "up" ? "#22c55e" : forecast.trend === "down" ? "#ef4444" : "#9a3412" }}
          >
            {forecast.trend === "up" ? "▲ Growing" : forecast.trend === "down" ? "▼ Declining" : "― Stable"}
          </div>
          <div className="oa-forecast-sub">vs last week</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Fulfillment Speed ─── */
function FulfillmentSpeed({ orders }) {
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    if (delivered.length === 0) return { avgDays: 0, slow: 0, total: 0 };
    const days = delivered.map((o) => Math.max(0, Math.ceil((TODAY - new Date(o.date)) / 86400000)));
    const avgDays = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    const slow = orders.filter((o) => o.status === "pending" && (TODAY - new Date(o.date)) / 86400000 > 3).length;
    return { avgDays, slow, total: delivered.length };
  }, [orders]);

  return (
    <div className="oa-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={18} color="#f97316" /> Fulfillment Speed
        </h3>
        <p className="oa-section-subtitle">How fast orders get delivered</p>
      </div>
      <div className="oa-forecast-grid">
        <div className="oa-forecast-card">
          <div className="oa-forecast-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Clock size={14} /> Avg Delivery Time
          </div>
          <div className="oa-forecast-value">{stats.avgDays} days</div>
          <div className="oa-forecast-sub">{stats.avgDays <= 3 ? "Fast ✓" : "Slow down"}</div>
        </div>
        <div className="oa-forecast-card">
          <div className="oa-forecast-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <AlertTriangle size={14} color={stats.slow > 0 ? "#ef4444" : "#22c55e"} /> Stuck Orders
          </div>
          <div className="oa-forecast-value" style={{ color: stats.slow > 0 ? "#ef4444" : "#22c55e" }}>
            {stats.slow}
          </div>
          <div className="oa-forecast-sub">Pending 3+ days</div>
        </div>
        <div className="oa-forecast-card">
          <div className="oa-forecast-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <CheckCircle size={14} color="#22c55e" /> Delivered Total
          </div>
          <div className="oa-forecast-value">{stats.total}</div>
          <div className="oa-forecast-sub">Completed orders</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product Matrix ─── */
function ProductMatrix({ orders }) {
  const productStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.product]) map[o.product] = { units: 0, profit: 0, revenue: 0 };
      map[o.product].units += 1;
      map[o.product].profit += (o.revenue || 0) - (o.cost || 0);
      map[o.product].revenue += (o.revenue || 0);
    });
    return Object.entries(map)
      .map(([name, s]) => ({
        name,
        units: s.units,
        profit: s.profit,
        margin: s.revenue > 0 ? Math.round((s.profit / s.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6);
  }, [orders]);

  if (productStats.length === 0) {
    return (
      <div className="oa-section">
        <div className="oa-section-header">
          <h3 className="oa-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="#f97316" /> Product Performance Matrix
          </h3>
        </div>
        <div className="oa-empty-state">
          <div className="oa-empty-icon">📦</div>
          <div className="oa-empty-title">No product data</div>
          <div className="oa-empty-sub">No orders in selected date range</div>
        </div>
      </div>
    );
  }

  return (
    <div className="oa-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Award size={18} color="#f97316" /> Product Performance Matrix
        </h3>
        <p className="oa-section-subtitle">Top products by total profit</p>
      </div>
      <div className="oa-product-grid">
        {productStats.map((p) => {
          const isCashCow = p.units >= 3 && p.margin >= 30;
          const isDog = p.profit < 0;
          let badge = "Average";
          let badgeColor = "#22c55e";
          if (isCashCow) { badge = "Cash Cow ★"; badgeColor = "#16a34a"; }
          if (isDog) { badge = "Loss Maker"; badgeColor = "#ef4444"; }
          return (
            <div key={p.name} className="oa-product-card">
              <div className="oa-product-badge" style={{ background: badgeColor }}>{badge}</div>
              <div className="oa-product-name">{p.name}</div>
              <div className="oa-product-stats">
                <div className="oa-product-stat">
                  <span className="oa-product-stat-label">Units Sold</span>
                  <span className="oa-product-stat-val">{p.units}</span>
                </div>
                <div className="oa-product-stat">
                  <span className="oa-product-stat-label">Total Profit</span>
                  <span className="oa-product-stat-val" style={{ color: p.profit >= 0 ? "#16a34a" : "#ef4444" }}>
                    {p.profit >= 0 ? "+" : ""}{fmt(p.profit)}
                  </span>
                </div>
                <div className="oa-product-stat">
                  <span className="oa-product-stat-label">Margin</span>
                  <span className="oa-product-stat-val">{p.margin}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Day List (Profit / Loss) ─── */
function DayListSection({ orders }) {
  const [listType, setListType] = useState("profit");
  const [dayFilter, setDayFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => {
      const pl = (o.revenue || 0) - (o.cost || 0);
      const isProfit = pl >= 0;
      const matchesType = listType === "profit" ? isProfit : !isProfit;
      if (!matchesType) return false;
      if (dayFilter === "all") return true;
      const orderDay = new Date(o.date).toLocaleDateString("en-US", { weekday: "long" });
      return orderDay === dayFilter;
    });
    return result.sort((a, b) => Math.abs((b.revenue || 0) - (b.cost || 0)) - Math.abs((a.revenue || 0) - (a.cost || 0)));
  }, [orders, listType, dayFilter]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const totalPL = filteredOrders.reduce((sum, o) => sum + ((o.revenue || 0) - (o.cost || 0)), 0);
    const avgPL = total > 0 ? totalPL / total : 0;
    return { total, totalPL, avgPL };
  }, [filteredOrders]);

  return (
    <div className="oa-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title">{listType === "profit" ? "Profit Day List" : "Loss Day List"}</h3>
        <p className="oa-section-subtitle">
          {listType === "profit"
            ? "All orders that made money, filterable by weekday"
            : "All orders that lost money, filterable by weekday"}
        </p>
      </div>

      <div className="oa-filter-bar">
        <div className="oa-toggle-wrap">
          <button
            className={`oa-toggle-btn ${listType === "profit" ? "active" : ""}`}
            onClick={() => { setListType("profit"); setDayFilter("all"); }}
          >
            <TrendingUp size={14} /> Profit List
          </button>
          <button
            className={`oa-toggle-btn ${listType === "loss" ? "active" : ""}`}
            onClick={() => { setListType("loss"); setDayFilter("all"); }}
          >
            <TrendingDown size={14} /> Loss List
          </button>
        </div>

        <div className="oa-select-wrap">
          <Filter size={14} color="#ea580c" />
          <select className="oa-filter-select" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
            <option value="all">All Days</option>
            {WEEKDAY_FULL.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="oa-select-icon" />
        </div>

        <div className="oa-daylist-stats">
          <div className="oa-daylist-stat"><strong>{stats.total}</strong> orders</div>
          <div className="oa-daylist-stat">
            <strong style={{ color: stats.totalPL >= 0 ? "#16a34a" : "#ef4444" }}>
              {stats.totalPL >= 0 ? "+" : ""}{fmt(stats.totalPL)}
            </strong> total
          </div>
          <div className="oa-daylist-stat"><strong>{fmt(Math.abs(stats.avgPL))}</strong> avg</div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="oa-empty-state">
          <div className="oa-empty-icon">{listType === "profit" ? "💰" : "📉"}</div>
          <div className="oa-empty-title">No {listType === "profit" ? "profitable" : "loss"} orders</div>
          <div className="oa-empty-sub">
            {dayFilter === "all" ? `No ${listType} orders found` : `No ${listType} orders on ${dayFilter}`}
          </div>
        </div>
      ) : (
        <div className="oa-table-wrap">
          <table className="oa-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Day</th>
                <th>Date</th>
                <th>Status</th>
                <th>Revenue</th>
                <th>Cost</th>
                <th>{listType === "profit" ? "Profit" : "Loss"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const pl = (o.revenue || 0) - (o.cost || 0);
                const day = new Date(o.date).toLocaleDateString("en-US", { weekday: "long" });
                const sc = STATUS_COLOR[o.status] || STATUS_COLOR.pending;
                return (
                  <tr key={o.id}>
                    <td className="oa-order-id">#{o.id}</td>
                    <td className="oa-product">{o.product}</td>
                    <td><span className="oa-day-badge">{day.slice(0, 3)}</span></td>
                    <td className="oa-date">{o.date}</td>
                    <td>
                      <span
                        className="oa-badge"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="oa-revenue">{fmt(o.revenue)}</td>
                    <td className="oa-cost">{fmt(o.cost)}</td>
                    <td className="oa-pl">
                      <span style={{ color: pl >= 0 ? "#16a34a" : "#ef4444", fontWeight: 800 }}>
                        {pl >= 0 ? "+" : ""}{fmt(pl)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Top Loss Orders ─── */
function TopLossOrders({ orders }) {
  const topLosses = useMemo(() => {
    return orders
      .map((o) => ({...o, pl: (o.revenue || 0) - (o.cost || 0) }))
      .filter((o) => o.pl < 0)
      .sort((a, b) => a.pl - b.pl)
      .slice(0, 5);
  }, [orders]);

  if (topLosses.length === 0) return null;

  return (
    <div className="oa-section oa-loss-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={18} color="#ef4444" /> Top 5 Loss-Making Orders
        </h3>
        <p className="oa-section-subtitle">Orders losing the most money — investigate these first</p>
      </div>
      <div className="oa-table-wrap">
        <table className="oa-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Date</th>
              <th>Revenue</th>
              <th>Cost</th>
              <th>Loss Amount</th>
              <th>Loss %</th>
            </tr>
          </thead>
          <tbody>
            {topLosses.map((o) => {
              const lossPct = o.revenue > 0 ? Math.round((Math.abs(o.pl) / o.revenue) * 100) : 100;
              return (
                <tr key={o.id}>
                  <td className="oa-order-id">#{o.id}</td>
                  <td className="oa-product">{o.product}</td>
                  <td className="oa-date">{o.date}</td>
                  <td className="oa-revenue">{fmt(o.revenue)}</td>
                  <td className="oa-cost">{fmt(o.cost)}</td>
                  <td><span className="oa-loss-badge">-{fmt(Math.abs(o.pl))}</span></td>
                  <td><span className="oa-loss-badge">{lossPct}%</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Charts Section ─── */
function ChartsSection({ orders, darkMode }) {
  const lineRef = useRef(null);
  const donutRef = useRef(null);
  const barRef = useRef(null);
  const stackRef = useRef(null);
  const chartsRef = useRef({});

  useEffect(() => {
    Object.values(chartsRef.current).forEach((c) => c?.destroy());
    chartsRef.current = {};

    const grid = darkMode ? "#374151" : "#fff7ed";
    const tick = darkMode ? "#9ca3af" : "#9a3412";
    const green = "#16a34a", red = "#ef4444";
    const orange = "#f97316", orangeAlpha = "rgba(249,115,22,0.12)";
    const yellow = "#fbbf24";

    const dates = [...new Set(orders.map((o) => o.date))]
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-7);
    const netByDay = dates.map((d) =>
      orders.filter((o) => o.date === d).reduce((sum, o) => sum + ((o.revenue || 0) - (o.cost || 0)), 0)
    );

    if (lineRef.current) {
      chartsRef.current.line = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: dates.map((d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
          datasets: [{
            label: "Net Profit", data: netByDay,
            borderColor: orange, backgroundColor: orangeAlpha,
            fill: true, tension: 0.4, borderWidth: 2,
            pointBackgroundColor: netByDay.map((v) => (v >= 0 ? green : red)),
            pointRadius: 5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` Net: ₹${ctx.raw.toLocaleString("en-IN")}` } } },
          scales: {
            x: { grid: { color: grid }, ticks: { color: tick } },
            y: { grid: { color: grid }, ticks: { color: tick, callback: (v) => `₹${(v / 1000).toFixed(0)}k` } },
          },
        },
      });
    }

    if (donutRef.current) {
      chartsRef.current.donut = new Chart(donutRef.current, {
        type: "doughnut",
        data: {
          labels: ["Pending", "Shipped", "Delivered"],
          datasets: [{
            data: [
              orders.filter((o) => o.status === "pending").length,
              orders.filter((o) => o.status === "shipped").length,
              orders.filter((o) => o.status === "delivered").length,
            ],
            backgroundColor: [yellow, orange, green],
            borderWidth: 2, borderColor: darkMode ? "#1e1e1e" : "#fff",
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "62%",
          plugins: {
            legend: { display: true, position: "bottom", labels: { color: tick, font: { size: 12 }, padding: 14 } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} orders` } },
          },
        },
      });
    }

    const weekdayCounts = WEEKDAY_FULL.map((day) =>
      orders.filter((o) => new Date(o.date).toLocaleDateString("en-US", { weekday: "long" }) === day).length
    );

    if (barRef.current) {
      chartsRef.current.bar = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: WEEKDAY_FULL.map((d) => d.slice(0, 3)),
          datasets: [{ label: "Orders", data: weekdayCounts, backgroundColor: "rgba(249,115,22,0.75)", borderRadius: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} orders` } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, stepSize: 1 } },
          },
        },
      });
    }

    const byDay = groupByWeekday(orders);
    const profits = WEEKDAY_FULL.map((d) => byDay[d].profit);
    const losses = WEEKDAY_FULL.map((d) => byDay[d].loss);

    if (stackRef.current) {
      chartsRef.current.stack = new Chart(stackRef.current, {
        type: "bar",
        data: {
          labels: WEEKDAY_FULL.map((d) => d.slice(0, 3)),
          datasets: [
            { label: "Profit", data: profits, backgroundColor: "rgba(34,197,94,0.8)", borderRadius: { topLeft: 6, topRight: 6 }, stack: "pl" },
            { label: "Loss", data: losses, backgroundColor: "rgba(239,68,68,0.8)", borderRadius: { bottomLeft: 6, bottomRight: 6 }, stack: "pl" },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: "top", labels: { color: tick, font: { size: 12 }, padding: 12, usePointStyle: true } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ₹${Math.abs(ctx.raw).toLocaleString("en-IN")}` } },
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: tick } },
            y: { stacked: true, grid: { color: grid }, ticks: { color: tick, callback: (v) => `₹${(v / 1000).toFixed(0)}k` } },
          },
        },
      });
    }

    return () => { Object.values(chartsRef.current).forEach((c) => c?.destroy()); };
  }, [orders, darkMode]);

  return (
    <div className="oa-charts-outer">
      <div className="oa-chart-card oa-chart-wide">
        <div className="oa-chart-header">
          <h3 className="oa-chart-title">Profit vs Loss per Day</h3>
          <p className="oa-chart-subtitle">Stacked by weekday</p>
        </div>
        <div className="oa-chart-wrap"><canvas ref={stackRef} /></div>
      </div>
      <div className="oa-chart-card">
        <div className="oa-chart-header">
          <h3 className="oa-chart-title">Net Profit Trend</h3>
          <p className="oa-chart-subtitle">Last 7 active days</p>
        </div>
        <div className="oa-chart-wrap"><canvas ref={lineRef} /></div>
      </div>
      <div className="oa-chart-card">
        <div className="oa-chart-header">
          <h3 className="oa-chart-title">Status Breakdown</h3>
          <p className="oa-chart-subtitle">Order distribution</p>
        </div>
        <div className="oa-chart-wrap"><canvas ref={donutRef} /></div>
      </div>
      <div className="oa-chart-card oa-chart-wide">
        <div className="oa-chart-header">
          <h3 className="oa-chart-title">Orders by Weekday</h3>
          <p className="oa-chart-subtitle">Busiest days</p>
        </div>
        <div className="oa-chart-wrap"><canvas ref={barRef} /></div>
      </div>
    </div>
  );
}

/* ─── Orders Table ─── */
function OrdersTable({ orders }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchSearch = o.product.toLowerCase().includes(searchQuery.toLowerCase());
      let matchDate = true;
      if (dateFilter === "7") matchDate = (TODAY - new Date(o.date)) / 86400000 <= 7;
      if (dateFilter === "30") matchDate = (TODAY - new Date(o.date)) / 86400000 <= 30;
      return matchStatus && matchSearch && matchDate;
    });
    result = [...result].sort((a, b) => {
      let va, vb;
      if (sortKey === "profit") { va = (a.revenue || 0) - (a.cost || 0); vb = (b.revenue || 0) - (b.cost || 0); }
      else if (sortKey === "date") { va = new Date(a.date); vb = new Date(b.date); }
      else if (sortKey === "status") { va = a.status; vb = b.status; }
      else if (sortKey === "revenue") { va = (a.revenue || 0); vb = (b.revenue || 0); }
      else { va = a[sortKey]; vb = b[sortKey]; }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return result;
  }, [orders, statusFilter, dateFilter, searchQuery, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }) => (
    <span style={{ marginLeft: 4, fontSize: "0.7rem", opacity: sortKey === k ? 1 : 0.4 }}>
      {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
    </span>
  );

  return (
    <div className="oa-section">
      <div className="oa-section-header">
        <h3 className="oa-section-title">All Orders</h3>
        <p className="oa-section-subtitle">Full order ledger with profit/loss per order</p>
      </div>

      <div className="oa-filter-bar">
        <div className="oa-search-wrap">
          <Search size={16} className="oa-search-icon" />
          <input
            type="text"
            className="oa-search-input"
            placeholder="Search product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="oa-select-wrap">
          <Filter size={14} color="#ea580c" />
          <select className="oa-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown size={14} className="oa-select-icon" />
        </div>
        <div className="oa-select-wrap">
          <Clock size={14} color="#ea580c" />
          <select className="oa-filter-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <ChevronDown size={14} className="oa-select-icon" />
        </div>
        <div className="oa-result-count">{filtered.length} results</div>
      </div>

      {filtered.length === 0 ? (
        <div className="oa-empty-state">
          <div className="oa-empty-icon">📦</div>
          <div className="oa-empty-title">No orders found</div>
          <div className="oa-empty-sub">Try adjusting your filters or search query</div>
        </div>
      ) : (
        <div className="oa-table-wrap">
          <table className="oa-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th className="oa-sort-th" onClick={() => toggleSort("date")}>Date <SortIcon k="date" /></th>
                <th className="oa-sort-th" onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></th>
                <th className="oa-sort-th" onClick={() => toggleSort("revenue")}>Revenue <SortIcon k="revenue" /></th>
                <th>Cost</th>
                <th className="oa-sort-th" onClick={() => toggleSort("profit")}>Profit / Loss <SortIcon k="profit" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const pl = (o.revenue || 0) - (o.cost || 0);
                const sc = STATUS_COLOR[o.status] || STATUS_COLOR.pending;
                return (
                  <tr key={o.id}>
                    <td className="oa-order-id">#{o.id}</td>
                    <td className="oa-product">{o.product}</td>
                    <td className="oa-date">{o.date}</td>
                    <td>
                      <span
                        className="oa-badge"
                        style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="oa-revenue">{fmt(o.revenue)}</td>
                    <td className="oa-cost">{fmt(o.cost)}</td>
                    <td className="oa-pl">
                      <span style={{ color: pl >= 0 ? "#16a34a" : "#ef4444" }}>
                        {pl >= 0 ? "+" : ""}{fmt(pl)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function TotalOrdersPage({ orders: propOrders, onBack }) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const allOrders = propOrders || SAMPLE_ORDERS;

  const orders = useMemo(() => {
    if (dateRange === "all") return allOrders;
    const days = parseInt(dateRange);
    return allOrders.filter((o) => (TODAY - new Date(o.date)) / 86400000 <= days);
  }, [allOrders, dateRange]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const kpis = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((s, o) => s + (o.revenue || 0), 0);
    const cost = orders.reduce((s, o) => s + (o.cost || 0), 0);
    const profits = orders.map((o) => (o.revenue || 0) - (o.cost || 0));
    const totalProfit = profits.filter((p) => p > 0).reduce((a, b) => a + b, 0);
    const totalLoss = profits.filter((p) => p < 0).reduce((a, b) => a + b, 0);
    const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const aov = total > 0 ? Math.round(revenue / total) : 0;
    return { total, revenue, cost, totalProfit, totalLoss, margin, deliveryRate, aov };
  }, [orders]);

  const insights = useMemo(() => {
    const byDay = groupByWeekday(orders);
    const dayNets = WEEKDAY_FULL.map((d) => ({
      day: d,
      net: byDay[d].profit - byDay[d].loss,
      orders: byDay[d].orders.length,
    }));
    const withData = dayNets.filter((d) => d.orders > 0);
    const bestDay = [...withData].sort((a, b) => b.net - a.net)[0];
    const worstDay = [...withData].sort((a, b) => a.net - b.net)[0];

    const byProduct = {};
    orders.forEach((o) => {
      if (!byProduct[o.product]) byProduct[o.product] = 0;
      byProduct[o.product] += (o.revenue || 0) - (o.cost || 0);
    });
    const bestProduct = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0];
    const oldPending = orders.filter(
      (o) => o.status === "pending" && (TODAY - new Date(o.date)) / 86400000 > 3
    ).length;

    return { bestDay, worstDay, bestProduct, oldPending };
  }, [orders]);

  if (loading) return <LoadingPage />;

  return (
    <div className={`orders-analytics-wrapper ${darkMode ? "dark" : ""}`}>
      <div className="oa-page">
        <div className="oa-container">
          {/* Header */}
          <div className="oa-page-header">
            {onBack && (
              <button className="oa-back-btn" onClick={onBack}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div className="oa-header-text">
              <h1 className="oa-page-title">Orders Analytics</h1>
              <p className="oa-page-subtitle">Profit, loss, and performance deep-dive</p>
            </div>
            <div className="oa-header-actions">
             
              <div className="oa-select-wrap">
               
                <select className="oa-filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
                <ChevronDown size={14} className="oa-select-icon" />
              </div>
              <div className="oa-overview-badge">{orders.length} Orders</div>
            </div>
          </div>

          {/* KPIs */}
          <div className="oa-kpi-grid">
            <KpiCard label="Total Orders" value={kpis.total} icon={ShoppingBag} color="#f97316" />
            <KpiCard label="Revenue" value={fmt(kpis.revenue)} icon={DollarSign} color="#22c55e" />
            <KpiCard label="Total Cost" value={fmt(kpis.cost)} icon={BarChart2} color="#ea580c" />
            <KpiCard label="Total Profit" value={fmt(kpis.totalProfit)} icon={TrendingUp} color="#16a34a" />
            <KpiCard
              label="Margin"
              value={`${kpis.margin}%`}
              icon={Star}
              color={kpis.margin > 0 ? "#22c55e" : "#ef4444"}
              sub={kpis.margin > 30 ? "Healthy ✓" : kpis.margin > 0 ? "Watch" : "At risk ⚠"}
            />
            <KpiCard
              label="Delivery Rate"
              value={`${kpis.deliveryRate}%`}
              icon={Truck}
              color={kpis.deliveryRate > 70 ? "#22c55e" : "#ef4444"}
            />
            <KpiCard
              label="Avg Order Value"
              value={fmt(kpis.aov)}
              icon={DollarSign}
              color="#f97316"
              sub={kpis.aov > 2000 ? "Strong ✓" : "Can improve"}
            />
          </div>

          {/* Charts */}
          <ChartsSection orders={orders} darkMode={darkMode} />

          {/* Heatmap */}
          <HeatmapSection orders={orders} />

          {/* Forecast */}
          <RevenueForecast orders={orders} />

          {/* Fulfillment */}
          <FulfillmentSpeed orders={orders} />

          {/* Product matrix */}
          <ProductMatrix orders={orders} />

          {/* Day list */}
          <DayListSection orders={orders} />

          {/* Top losses */}
          <TopLossOrders orders={orders} />

          {/* Insights */}
          <div className="oa-section">
            <div className="oa-section-header">
              <h3 className="oa-section-title">📊 Smart Insights</h3>
            </div>
            <div className="oa-insights-grid">
              {insights.bestDay && (
                <InsightCard
                  icon={<Award size={18} color="#f97316" />}
                  title="Best Day"
                  text={`${insights.bestDay.day} leads with ${fmt(insights.bestDay.net)} net profit`}
                  color={darkMode ? "#2c1a0c" : "#fff7ed"} border={darkMode ? "#7c2d12" : "#fed7aa"}
                />
              )}
              {insights.worstDay && (
                <InsightCard
                  icon={<TrendingDown size={18} color="#ef4444" />}
                  title="Worst Day"
                  text={`${insights.worstDay.day}: ${
                    insights.worstDay.net < 0
                    ? `-${fmt(Math.abs(insights.worstDay.net))} loss`
                      : `${fmt(insights.worstDay.net)} net`
                  }`}
                  color={insights.worstDay.net < 0 ? (darkMode ? "#450a0a" : "#fef2f2") : (darkMode ? "#2c1a0c" : "#fff7ed")}
                  border={insights.worstDay.net < 0 ? "#fecaca" : "#fed7aa"}
                />
              )}
              <InsightCard
                icon={<CheckCircle size={18} color="#22c55e" />}
                title="Delivery Rate"
                text={`${kpis.deliveryRate}% orders delivered successfully`}
                color={darkMode ? "#052e16" : "#f0fdf4"} border={darkMode ? "#065f46" : "#a7f3d0"}
              />
              {insights.bestProduct && (
                <InsightCard
                  icon={<Star size={18} color="#f97316" />}
                  title="Top Product"
                  text={`${insights.bestProduct[0]} earned ${fmt(insights.bestProduct[1])} total profit`}
                  color={darkMode ? "#2c1a0c" : "#fff7ed"} border={darkMode ? "#7c2d12" : "#fed7aa"}
                />
              )}
              {insights.oldPending > 0 && (
                <InsightCard
                  icon={<AlertTriangle size={18} color="#ef4444" />}
                  title="Stuck Orders"
                  text={`${insights.oldPending} orders pending for 3+ days — follow up now`}
                  color={darkMode ? "#450a0a" : "#fef2f2"} border="#fecaca"
                />
              )}
            </div>
          </div>

          {/* Orders Table */}
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}