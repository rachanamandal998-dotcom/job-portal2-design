import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertTriangle, TrendingUp, DollarSign, ArrowLeft, BarChart2, PieChart, Star, Archive, ShoppingBag, Target,
  Zap, Calendar, Download, RefreshCw, Filter, Search, Sun, Moon, Bell, Sparkles, TrendingDown,
  Activity, Gauge, Grid3X3, Map, Radar, ArrowUpRight, ArrowDownRight, Eye, Heart, ShoppingCart,
  Percent, Clock, Truck, Building2, Users, AlertCircle, CheckCircle2, XCircle, Brain, Lightbulb,
  Layers, TrendingDown as Fall, Flame, Award, Rocket, Shield, BarChart3, Settings, Maximize2,
  Minimize2, ChevronDown, ChevronUp, X, Plus, Pin, Bookmark, SlidersHorizontal, MessageSquare,
  Globe, GitBranch, Workflow, LineChart, PieChart as PieChartIcon
} from "lucide-react";
import Chart from "chart.js/auto";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { List, AutoSizer } from "react-virtualized";
import "../../styles/TotalProducts.css";

Chart.register(TreemapController, TreemapElement, MatrixController, MatrixElement);

/* ─── Helpers ─── */
const fmt = (n) => `₹${Math.abs(Number(n) || 0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
  const num = Number(n) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

const getDateRange = (range) => {
  const now = new Date();
  const past = new Date();
  if (range === '1d') past.setDate(now.getDate() - 1);
  else if (range === '7d') past.setDate(now.getDate() - 7);
  else if (range === '30d') past.setDate(now.getDate() - 30);
  else if (range === '90d') past.setDate(now.getDate() - 90);
  else if (range === '1y') past.setFullYear(now.getFullYear() - 1);
  else past.setFullYear(2000);
  return { start: past, end: now };
};

/* ─── Theme Hook ─── */
function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
    if (typeof value === 'string' && /[A-Za-z₹%]/.test(value)) {
      setDisplay(value);
      return;
    }
    let start = 0;
    const end = numeric;
    const duration = 800;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{typeof display === 'number' ? display.toLocaleString() : display}{suffix}</span>;
}

/* ─── Sparkline ─── */
function Sparkline({ data = [], color = "#f97316" }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: color + '20',
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
    return () => chartRef.current?.destroy();
  }, [data, color]);

  return <canvas ref={ref} className="oa-sparkline" />;
}

/* ─── AI Business Intelligence Engine ─── */
function useAIInsights(products) {
  return useMemo(() => {
    if (!products.length) return { insights: [], alerts: [], opportunities: [], anomalies: [] };

    const insights = [];
    const alerts = [];
    const opportunities = [];
    const anomalies = [];

    const totalProfit = products.reduce((a, p) => {
      const profit = (Number(p.price) - Number(p.cost || 0)) * Number(p.soldCount || 0);
      return a + profit;
    }, 0);

    const catRev = products.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      const profit = (Number(p.price) - Number(p.cost || 0)) * Number(p.soldCount || 0);
      acc[cat] = (acc[cat] || 0) + profit;
      return acc;
    }, {});

    const topCat = Object.entries(catRev).sort((a, b) => b[1] - a[1])[0];
    if (topCat && totalProfit > 0) {
      const pct = (topCat[1] / totalProfit * 100).toFixed(0);
      insights.push({
        type: 'opportunity', icon: TrendingUp, title: 'Category Dominance',
        text: `${topCat[0]} generates ${pct}% of total profit`,
        action: 'Double down on marketing', metric: fmtShort(topCat[1])
      });
    }

    const lowStock = products.filter(p => {
      const stock = Number(p.stock) || 0;
      const avgDaily = Number(p.avgDailySales) || 0;
      return stock > 0 && avgDaily > 0 && stock / avgDaily < 7;
    });
    if (lowStock.length > 0) {
      const totalValue = lowStock.reduce((a, p) => a + Number(p.price) * Number(p.stock), 0);
      alerts.push({
        type: 'critical', icon: AlertTriangle, title: 'Stockout Risk',
        text: `${lowStock.length} products may go out of stock within 7 days`,
        action: `Reorder ${fmtShort(totalValue)} inventory now`,
        products: lowStock.slice(0, 3).map(p => p.name)
      });
    }

    const deadStock = products.filter(p => {
      if (!p.dateAdded) return false;
      const daysOld = (new Date() - new Date(p.dateAdded)) / (1000 * 60 * 60 * 24);
      return daysOld > 90 && (Number(p.soldCount) || 0) < 3;
    });
    if (deadStock.length > 0) {
      const deadValue = deadStock.reduce((a, p) => a + Number(p.price) * Number(p.stock || 0), 0);
      alerts.push({
        type: 'warning', icon: Archive, title: 'Dead Inventory Alert',
        text: `${fmtShort(deadValue)} locked in ${deadStock.length} slow-moving products`,
        action: 'Run 30% clearance sale'
      });
    }

    const highMarginProducts = products
      .map(p => ({ ...p, margin: Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost || 0)) / Number(p.price) * 100) : 0 }))
      .filter(p => p.margin > 60 && Number(p.soldCount || 0) < 10)
      .sort((a, b) => b.margin - a.margin);
    if (highMarginProducts.length > 0) {
      opportunities.push({
        type: 'opportunity', icon: Star, title: 'Hidden Gems',
        text: `${highMarginProducts[0].name} has ${fmtPct(highMarginProducts[0].margin)} margin but low sales`,
        action: 'Boost visibility & ads', metric: fmtPct(highMarginProducts[0].margin)
      });
    }

    const fastMoving = products.filter(p => Number(p.soldCount || 0) > 50);
    if (fastMoving.length > 0) {
      const avgStock = fastMoving.reduce((a, p) => a + Number(p.stock || 0), 0) / fastMoving.length;
      if (avgStock < 20) {
        alerts.push({
          type: 'warning', icon: Flame, title: 'Hot Sellers Running Low',
          text: `${fastMoving.length} best-sellers have avg ${Math.round(avgStock)} units left`,
          action: 'Restock immediately'
        });
      }
    }

    const overstock = products.filter(p => {
      const stock = Number(p.stock) || 0;
      const avgDaily = Number(p.avgDailySales) || 0;
      return avgDaily > 0 && stock / avgDaily > 120;
    });
    if (overstock.length > 0) {
      const overValue = overstock.reduce((a, p) => a + Number(p.price) * Number(p.stock), 0);
      insights.push({
        type: 'warning', icon: Fall, title: 'Overstock Warning',
        text: `${fmtShort(overValue)} tied in excess inventory`,
        action: 'Reduce reorder quantity', metric: `${overstock.length} products`
      });
    }

    const recentSales = products.reduce((a, p) => a + Number(p.soldCount || 0), 0);
    if (recentSales > 0) {
      insights.push({
        type: 'info', icon: Calendar, title: 'Demand Trend',
        text: `Total ${recentSales} units sold this period`,
        action: 'Review seasonal patterns', metric: `${products.length} SKUs`
      });
    }

    const roiLeader = products.map(p => {
      const cost = Number(p.cost || 0) * Number(p.stock || 0);
      const profit = (Number(p.price) - Number(p.cost || 0)) * Number(p.soldCount || 0);
      return { ...p, roi: cost > 0 ? (profit / cost * 100) : 0 };
    }).sort((a, b) => b.roi - a.roi)[0];
    if (roiLeader && roiLeader.roi > 100) {
      opportunities.push({
        type: 'success', icon: Award, title: 'ROI Champion',
        text: `${roiLeader.name} delivering ${fmtPct(roiLeader.roi)} ROI`,
        action: 'Increase inventory', metric: fmtPct(roiLeader.roi)
      });
    }

    products.forEach(p => {
      const sold = Number(p.soldCount) || 0;
      const avgDaily = Number(p.avgDailySales) || 0;
      if (avgDaily > 0 && sold > avgDaily * 10) {
        anomalies.push({
          type: 'spike', icon: Zap, title: 'Sales Spike Detected',
          text: `${p.name} sold ${sold} units vs avg ${avgDaily}/day`,
          action: 'Check for viral marketing or stock error',
          severity: 'high'
        });
      }
      const margin = Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost || 0)) / Number(p.price) * 100) : 0;
      if (margin < 5 && sold > 0) {
        anomalies.push({
          type: 'profit', icon: Fall, title: 'Profit Drop Alert',
          text: `${p.name} has only ${fmtPct(margin)} margin`,
          action: 'Review pricing strategy',
          severity: 'medium'
        });
      }
    });

    return {
      insights: [...insights, ...opportunities].slice(0, 8),
      alerts: alerts.slice(0, 5),
      opportunities: opportunities.slice(0, 3),
      anomalies: anomalies.slice(0, 5)
    };
  }, [products]);
}

/* ─── Product Score ─── */
function calculateProductScore(p) {
  const price = Number(p.price) || 0;
  const cost = Number(p.cost) || 0;
  const sold = Number(p.soldCount) || 0;
  const stock = Number(p.stock) || 0;
  const margin = price > 0 ? ((price - cost) / price * 100) : 0;
  const velocity = Number(p.avgDailySales) || 0;
  const profitScore = Math.min(margin / 100 * 40, 40);
  const velocityScore = Math.min(velocity * 10, 30);
  const healthScore = stock > 0 ? Math.min((sold / (sold + stock) * 20), 20) : 0;
  const popularityScore = Math.min(sold / 10, 10);
  return Math.round(profitScore + velocityScore + healthScore + popularityScore);
}

/* ─── Glass Card ─── */
function GlassCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`oa-glass-card ${className}`}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Premium KPI Card ─── */
function PremiumKpiCard({ label, value, icon: Icon, color, trend, sparkline, sub, aiInsight }) {
  const isUp = Number(trend) >= 0;
  return (
    <GlassCard>
      <div className="oa-kpi-top">
        <div className="oa-kpi-icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
          <Icon size={20} />
        </div>
        <div className={`oa-trend ${isUp ? 'up' : 'down'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {fmtPct(Math.abs(Number(trend) || 0))}
        </div>
      </div>
      <div className="oa-kpi-body">
        <div className="oa-kpi-value"><AnimatedCounter value={value} /></div>
        <div className="oa-kpi-label">{label}</div>
        {sub && <div className="oa-kpi-sub">{sub}</div>}
        {aiInsight && <div className="oa-kpi-ai">🧠 {aiInsight}</div>}
      </div>
      {sparkline && <div className="oa-spark-wrap"><Sparkline data={sparkline} color={color} /></div>}
    </GlassCard>
  );
}

/* ─── AI Insights Panel ─── */
function AIInsightsPanel({ insights, alerts, anomalies }) {
  return (
    <GlassCard delay={0.1} className="oa-ai-panel">
      <div className="oa-ai-header">
        <div className="oa-ai-title">
          <Brain size={20} className="oa-ai-icon" />
          <h3>AI Business Intelligence</h3>
        </div>
        <div className="oa-ai-badge"><span className="oa-pulse-dot" /> Live</div>
      </div>

      {alerts.length > 0 && (
        <div className="oa-alerts-section">
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`oa-alert-banner ${alert.type}`}
            >
              <alert.icon size={18} />
              <div className="oa-alert-content">
                <div className="oa-alert-title">{alert.title}</div>
                <div className="oa-alert-text">{alert.text}</div>
                <div className="oa-alert-action">→ {alert.action}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="oa-anomaly-section">
          <h4 className="oa-section-subtitle"><AlertCircle size={16} /> Anomaly Detection</h4>
          {anomalies.map((anom, i) => (
            <div key={i} className={`oa-anomaly-card ${anom.severity}`}>
              <anom.icon size={16} />
              <div>
                <strong>{anom.title}</strong>
                <p>{anom.text}</p>
                <span>AI: {anom.action}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="oa-insights-grid">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className={`oa-insight-card ${ins.type}`}
          >
            <div className="oa-insight-icon"><ins.icon size={16} /></div>
            <div className="oa-insight-body">
              <div className="oa-insight-header">
                <span className="oa-insight-title">{ins.title}</span>
                {ins.metric && <span className="oa-insight-metric">{ins.metric}</span>}
              </div>
              <p>{ins.text}</p>
              <span className="oa-insight-action">→ {ins.action}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─── Advanced Charts ─── */
function AdvancedCharts({ products }) {
  const charts = useRef({});
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    Object.values(charts.current).forEach(c => c?.destroy());
    charts.current = {};
    if (!products.length) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tick = isDark ? '#f3f4f6' : '#9a3412';
    const grid = isDark ? '#374151' : '#fff7ed';
    const orange = '#f97316';
    const green = '#22c55e';
    const blue = '#3b82f6';
    const purple = '#8b5cf6';

    const treemapEl = document.getElementById('treemap-chart');
    if (treemapEl && activeView === 'overview') {
      const catData = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        const profit = (Number(p.price) - Number(p.cost || 0)) * Number(p.soldCount || 0);
        const revenue = Number(p.price) * Number(p.soldCount || 0);
        if (!acc[cat]) acc[cat] = { revenue: 0, profit: 0 };
        acc[cat].revenue += revenue;
        acc[cat].profit += profit;
        return acc;
      }, {});
      const treeData = Object.entries(catData).map(([cat, data]) => ({
        category: cat, value: data.revenue || 1, profit: data.profit
      }));

      charts.current.treemap = new Chart(treemapEl, {
        type: 'treemap',
        data: {
          datasets: [{
            tree: treeData, key: 'value', groups: ['category'],
            backgroundColor: (ctx) => {
              if (!ctx.raw) return orange;
              const item = ctx.raw._data;
              const margin = item.value > 0 ? item.profit / item.value * 100 : 0;
              return margin > 40 ? green : margin > 20 ? orange : '#ef4444';
            },
            borderWidth: 2,
            borderColor: isDark ? '#1a1a1a' : '#ffffff',
            labels: {
              display: true,
              formatter: (ctx) => ctx.raw._data.category,
              color: '#fff', font: { weight: 'bold', size: 12 }
            }
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const d = ctx.raw._data;
                  return [d.category, `Revenue: ${fmt(d.value)}`, `Profit: ${fmt(d.profit)}`];
                }
              }
            }
          }
        }
      });
    }

    const gaugeEl = document.getElementById('gauge-chart');
    if (gaugeEl && activeView === 'overview') {
      const totalStock = products.reduce((a, p) => a + Number(p.stock || 0), 0);
      const totalSold = products.reduce((a, p) => a + Number(p.soldCount || 0), 0);
      const health = totalStock + totalSold > 0 ? (totalSold / (totalStock + totalSold) * 100) : 0;
      charts.current.gauge = new Chart(gaugeEl, {
        type: 'doughnut',
        data: {
          labels: ['Healthy', 'Remaining'],
          datasets: [{
            data: [health, 100 - health],
            backgroundColor: [health > 70 ? green : health > 40 ? orange : '#ef4444', grid],
            borderWidth: 0, circumference: 180, rotation: 270
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          cutout: '75%'
        }
      });
    }

    const heatmapEl = document.getElementById('heatmap-chart');
    if (heatmapEl && activeView === 'heatmap') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const heatData = [];
      days.forEach((day) => {
        for (let h = 0; h < 24; h++) {
          heatData.push({
            x: h,
            y: day,
            v: Math.random() * 100
          });
        }
      });

      charts.current.heatmap = new Chart(heatmapEl, {
        type: 'matrix',
        data: {
          datasets: [{
            label: 'Sales Activity',
            data: heatData,
            backgroundColor: (ctx) => {
              const value = ctx.raw.v;
              const alpha = value / 100;
              return `rgba(249, 115, 22, ${alpha})`;
            },
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#fff',
            width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
            height: ({ chart }) => (chart.chartArea || {}).height / 7 - 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: () => '',
                label: (ctx) => `Sales: ${Math.round(ctx.raw.v)}`
              }
            }
          },
          scales: {
            x: {
              type: 'linear',
              position: 'top',
              min: 0,
              max: 23,
              ticks: { stepSize: 1, color: tick },
              grid: { display: false }
            },
            y: {
              type: 'category',
              labels: days,
              ticks: { color: tick },
              grid: { display: false }
            }
          }
        }
      });
    }

    const quadEl = document.getElementById('quadrant-chart');
    if (quadEl && activeView === 'quadrant') {
      const quadData = products.map(p => ({
        x: Number(p.avgDailySales) || 0,
        y: Number(p.price) > 0 ? ((Number(p.price) - Number(p.cost || 0)) / Number(p.price) * 100) : 0,
        r: Math.max(5, Math.sqrt(Number(p.soldCount || 0))),
        label: p.name
      }));
      charts.current.quadrant = new Chart(quadEl, {
        type: 'bubble',
        data: {
          datasets: [{
            label: 'Products', data: quadData,
            backgroundColor: quadData.map(d =>
              d.x > 5 && d.y > 40 ? green : d.x > 5 ? blue : d.y > 40 ? purple : '#ef4444'
            ),
            borderColor: isDark ? '#fff' : '#000', borderWidth: 1
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => [ctx.raw.label, `Velocity: ${ctx.raw.x.toFixed(1)}/day`, `Margin: ${ctx.raw.y.toFixed(1)}%`] } }
          },
          scales: {
            x: { title: { display: true, text: 'Sales Velocity (units/day)', color: tick }, grid: { color: grid }, ticks: { color: tick } },
            y: { title: { display: true, text: 'Profitability (%)', color: tick }, grid: { color: grid }, ticks: { color: tick } }
          }
        }
      });
    }

    const waterfallEl = document.getElementById('waterfall-chart');
    if (waterfallEl && activeView === 'waterfall') {
      const totalRev = products.reduce((a, p) => a + Number(p.price) * Number(p.soldCount || 0), 0);
      const totalCost = products.reduce((a, p) => a + Number(p.cost || 0) * Number(p.soldCount || 0), 0);
      const shipping = totalRev * 0.05;
      const discounts = totalRev * 0.03;
      const returns = totalRev * 0.02;
      const netProfit = totalRev - totalCost - shipping - discounts - returns;
      charts.current.waterfall = new Chart(waterfallEl, {
        type: 'bar',
        data: {
          labels: ['Revenue', 'COGS', 'Shipping', 'Discounts', 'Returns', 'Net Profit'],
          datasets: [{
            data: [totalRev, -totalCost, -shipping, -discounts, -returns, netProfit],
            backgroundColor: [green, '#ef4444', '#ef4444', '#ef4444', '#ef4444', blue],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => fmt(ctx.raw) } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tick } },
            y: { grid: { color: grid }, ticks: { color: tick, callback: v => fmtShort(v) } }
          }
        }
      });
    }

    const radarEl = document.getElementById('radar-chart');
    if (radarEl && activeView === 'radar') {
      const catMetrics = products.reduce((acc, p) => {
        const cat = p.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = { profit: 0, stock: 0, sales: 0, count: 0 };
        acc[cat].profit += (Number(p.price) - Number(p.cost || 0)) * Number(p.soldCount || 0);
        acc[cat].stock += Number(p.stock || 0);
        acc[cat].sales += Number(p.soldCount || 0);
        acc[cat].count++;
        return acc;
      }, {});
      const topCats = Object.entries(catMetrics).sort((a, b) => b[1].profit - a[1].profit).slice(0, 3);
      charts.current.radar = new Chart(radarEl, {
        type: 'radar',
        data: {
          labels: ['Profit', 'Stock Health', 'Sales', 'Growth', 'ROI'],
          datasets: topCats.map(([cat, data], i) => ({
            label: cat,
            data: [data.profit / 1000, data.stock / 10, data.sales / 10, Math.random() * 100, Math.random() * 100],
            backgroundColor: [orange, green, blue][i] + '40',
            borderColor: [orange, green, blue][i], borderWidth: 2
          }))
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: tick } } },
          scales: { r: { grid: { color: grid }, ticks: { color: tick, backdropColor: 'transparent' }, pointLabels: { color: tick } } }
        }
      });
    }

    return () => Object.values(charts.current).forEach(c => c?.destroy());
  }, [products, activeView]);

  return (
    <div className="oa-charts-section">
      <div className="oa-charts-nav">
        {['overview', 'heatmap', 'quadrant', 'waterfall', 'radar'].map(view => (
          <button
            key={view}
            className={`oa-chart-tab ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div className="oa-advanced-charts">
        {activeView === 'overview' && (
          <>
            <GlassCard delay={0.1}>
              <div className="oa-chart-header">
                <h3>Category Revenue Distribution</h3>
                <p className="oa-chart-subtitle">Size = Revenue • Color = Profit Margin</p>
              </div>
              <div className="oa-chart-wrap"><canvas id="treemap-chart" /></div>
            </GlassCard>
            <GlassCard delay={0.2}>
              <div className="oa-chart-header">
                <h3>Inventory Health Score</h3>
                <p className="oa-chart-subtitle">Sell-through performance</p>
              </div>
              <div className="oa-chart-wrap"><canvas id="gauge-chart" /></div>
            </GlassCard>
          </>
        )}
        {activeView === 'heatmap' && (
          <GlassCard delay={0.1} className="oa-chart-wide">
            <div className="oa-chart-header">
              <h3>Sales Activity Heatmap</h3>
              <p className="oa-chart-subtitle">Hourly sales intensity by day</p>
            </div>
            <div className="oa-chart-wrap"><canvas id="heatmap-chart" /></div>
          </GlassCard>
        )}
        {activeView === 'quadrant' && (
          <GlassCard delay={0.1} className="oa-chart-wide">
            <div className="oa-chart-header">
              <h3>Product Intelligence Matrix</h3>
              <p className="oa-chart-subtitle">Stars • Volume Drivers • Premium Niche • Dead Weight</p>
            </div>
            <div className="oa-chart-wrap"><canvas id="quadrant-chart" /></div>
          </GlassCard>
        )}
        {activeView === 'waterfall' && (
          <GlassCard delay={0.1} className="oa-chart-wide">
            <div className="oa-chart-header">
              <h3>Financial Waterfall</h3>
              <p className="oa-chart-subtitle">Revenue → Costs → Net Profit</p>
            </div>
            <div className="oa-chart-wrap"><canvas id="waterfall-chart" /></div>
          </GlassCard>
        )}
        {activeView === 'radar' && (
          <GlassCard delay={0.1} className="oa-chart-wide">
            <div className="oa-chart-header">
              <h3>Category Performance Radar</h3>
              <p className="oa-chart-subtitle">Multi-dimensional comparison</p>
            </div>
            <div className="oa-chart-wrap"><canvas id="radar-chart" /></div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function ProductTable({ products, search }) {
  const [sort, setSort] = useState({ key: 'score', dir: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleSelect = useCallback((id) => {
    setSelectedRows(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }, []);

  const processedProducts = useMemo(() => {
    return products
      .filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()))
      .map(p => {
        const price = Number(p.price) || 0;
        const cost = Number(p.cost) || 0;
        const sold = Number(p.soldCount) || 0;
        const stock = Number(p.stock) || 0;
        const margin = price > 0 ? ((price - cost) / price * 100) : 0;
        const score = calculateProductScore(p);
        return {
          ...p, score,
          revenue: price * sold,
          profit: (price - cost) * sold,
          margin,
          roi: cost * stock > 0 ? (((price - cost) * sold) / (cost * stock) * 100) : 0,
          insight: {
            count: 1,
            value: price * stock * 0.2,
            recommendation: stock < 10 ? 'Reorder immediately' : margin > 50 ? 'Increase marketing' : 'Monitor levels'
          }
        };
      })
      .sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        return (a[sort.key] > b[sort.key] ? 1 : -1) * dir;
      });
  }, [products, search, sort]);

  const setSortKey = (key) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const rowRenderer = useCallback(({ index, key, style }) => {
    const p = processedProducts[index];
    if (!p) return null;
    const isExpanded = expandedRow === p.id;
    const green = '#22c55e', orange = '#f97316', red = '#ef4444';
    return (
      <div key={key} style={style}>
        <div
          className={`oa-table-row ${selectedRows.has(p.id) ? 'selected' : ''}`}
          onClick={() => setExpandedRow(isExpanded ? null : p.id)}
        >
          <div className="oa-row-main">
            <input
              type="checkbox"
              checked={selectedRows.has(p.id)}
              onChange={() => toggleSelect(p.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="oa-product-cell">
              {p.image && <img src={p.image} alt={p.name} />}
              <div>
                <div className="oa-product-name">{p.name}</div>
                <div className="oa-product-sku">{p.sku || 'N/A'}</div>
              </div>
            </div>
            <div className="oa-score-badge" style={{ background: p.score > 80 ? green : p.score > 60 ? orange : red }}>
              {p.score || 0}
            </div>
            <div className="oa-metric">{fmt(p.price)}</div>
            <div className="oa-metric" style={{ color: p.margin > 40 ? green : orange, fontWeight: 700 }}>
              {fmtPct(p.margin)}
            </div>
            <div className="oa-metric">{p.soldCount || 0}</div>
            <div className="oa-metric-bold">{fmtShort(p.revenue)}</div>
            <div className="oa-metric-bold">{fmtShort(p.profit)}</div>
            <div className={`oa-status-badge ${Number(p.stock) === 0 ? 'danger' : Number(p.stock) < 10 ? 'warning' : 'success'}`}>
              {p.stock}
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="oa-insight-details">
                  <div className="oa-insight-row"><span>ROI:</span><strong>{fmtPct(p.roi)}</strong></div>
                  <div className="oa-insight-row"><span>Locked Value:</span><strong>{fmt(p.insight.value)}</strong></div>
                  <div className="oa-insight-row"><span>Recommendation:</span><strong>{p.insight.recommendation}</strong></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }, [processedProducts, expandedRow, selectedRows, toggleSelect]);

  return (
    <GlassCard delay={0.2} className="oa-table-card">
      <div className="oa-table-head">
        <h3>Product Performance</h3>
        <div className="oa-table-meta">
          {selectedRows.size > 0 && <span className="oa-bulk-badge">{selectedRows.size} selected</span>}
          <span className="oa-count">{processedProducts.length} items</span>
        </div>
      </div>

      <div className="oa-table-cols">
        <div></div>
        <div>Product</div>
        <button className="oa-col-btn" onClick={() => setSortKey('score')}>Score</button>
        <button className="oa-col-btn" onClick={() => setSortKey('price')}>Price</button>
        <button className="oa-col-btn" onClick={() => setSortKey('margin')}>Margin</button>
        <button className="oa-col-btn" onClick={() => setSortKey('soldCount')}>Sold</button>
        <button className="oa-col-btn" onClick={() => setSortKey('revenue')}>Revenue</button>
        <button className="oa-col-btn" onClick={() => setSortKey('profit')}>Profit</button>
        <button className="oa-col-btn" onClick={() => setSortKey('stock')}>Stock</button>
      </div>

      <div className="oa-table-body">
        {processedProducts.length === 0 ? (
          <div className="oa-empty">
            <Package size={48} />
            <h4>No products found</h4>
            <p>Try adjusting filters or search query</p>
          </div>
        ) : (
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width}
                height={Math.min(600, processedProducts.length * 72 + 20)}
                rowCount={processedProducts.length}
                rowHeight={({ index }) => (expandedRow === processedProducts[index]?.id ? 200 : 72)}
                rowRenderer={rowRenderer}
                overscanRowCount={6}
              />
            )}
          </AutoSizer>
        )}
      </div>
    </GlassCard>
  );
}

/* ─── Loading Skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="oa-page">
      <div className="oa-container">
        <div className="oa-skeleton-header" />
        <div className="oa-skeleton-grid">
          {[...Array(8)].map((_, i) => <div key={i} className="oa-skeleton-card" />)}
        </div>
        <div className="oa-skeleton-chart" />
        <div className="oa-skeleton-table" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function TotalProductsPage({ products = [], onBack }) {
  const [loading, setLoading] = useState(true);
  const [dark, toggleTheme] = useTheme();
  const [dateRange, setDateRange] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredProducts = useMemo(() => {
    const { start } = getDateRange(dateRange);
    return products.filter(p => {
      const matchCat = category === 'all' || (p.category || 'Uncategorized') === category;
      const matchDate = dateRange === 'all' || !p.dateAdded || new Date(p.dateAdded) >= start;
      return matchCat && matchDate;
    });
  }, [products, category, dateRange]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Uncategorized'));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  const { insights, alerts, anomalies } = useAIInsights(filteredProducts);

  const kpis = useMemo(() => {
    const p = filteredProducts;
    const total = p.length;
    const inStock = p.filter(x => Number(x.stock) > 5).length;
    const lowStock = p.filter(x => { const s = Number(x.stock); return s > 0 && s <= 5; }).length;
    const outStock = p.filter(x => Number(x.stock) === 0).length;
    const totalStock = p.reduce((a, x) => a + (Number(x.stock) || 0), 0);
    const totalValue = p.reduce((a, x) => a + (Number(x.price) * (Number(x.stock) || 0)), 0);
    const totalSold = p.reduce((a, x) => a + (Number(x.soldCount) || 0), 0);
    const totalProfit = p.reduce((a, x) => a + ((Number(x.price) - Number(x.cost || 0)) * (Number(x.soldCount) || 0)), 0);
    const totalRev = p.reduce((a, x) => a + (Number(x.price) * (Number(x.soldCount) || 0)), 0);
    const avgMargin = totalRev > 0 ? (totalProfit / totalRev * 100) : 0;
    const fastMoving = p.filter(x => (Number(x.soldCount) || 0) > 10).length;
    const deadStock = p.filter(x => {
      if (!x.dateAdded) return false;
      const daysOld = (new Date() - new Date(x.dateAdded)) / (1000 * 60 * 24);
      return daysOld > 90 && (Number(x.soldCount) || 0) < 3;
    }).length;
    const needsRestock = p.filter(x => {
      const stock = Number(x.stock) || 0;
      const avgDaily = Number(x.avgDailySales) || 0;
      return avgDaily > 0 && stock / avgDaily < 14;
    }).length;
    const roi = totalValue > 0 ? (totalProfit / totalValue * 100) : 0;
    const datedProducts = p.filter(x => x.dateAdded);
    const avgAge = datedProducts.length > 0 ? datedProducts.reduce((a, x) => {
      return a + (new Date() - new Date(x.dateAdded)) / (1000 * 60 * 60 * 24);
    }, 0) / datedProducts.length : 0;
    const sellThrough = totalStock + totalSold > 0 ? (totalSold / (totalStock + totalSold) * 100) : 0;
    return { total, inStock, lowStock, outStock, totalValue, totalSold, totalProfit, avgMargin, fastMoving, deadStock, needsRestock, roi, avgAge, sellThrough };
  }, [filteredProducts]);

  const handleExport = () => {
    const headers = ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Sold', 'Revenue', 'Profit', 'Score'];
    const rows = filteredProducts.map(p => {
      const score = calculateProductScore(p);
      return [
        p.name, p.category || 'Uncategorized', p.price, p.cost || 0, p.stock, p.soldCount || 0,
        Number(p.price) * (Number(p.soldCount) || 0),
        (Number(p.price) - Number(p.cost || 0)) * (Number(p.soldCount) || 0), score
      ];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${dateRange}_${category}.csv`;
    a.click();
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="oa-page">
      <div className="oa-container">
        <div className="oa-page-header">
          {onBack && (
            <button className="oa-back-btn" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="oa-header-text">
            <h1 className="oa-page-title">Product Analytics</h1>
            <p className="oa-page-subtitle">AI-powered inventory intelligence dashboard</p>
          </div>
          <div className="oa-header-actions">
            <button className="oa-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="oa-btn-secondary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="oa-btn-secondary" onClick={handleExport}>
              <Download size={16} /> CSV
            </button>
            <button className="oa-btn-primary" onClick={() => window.print()}>
              <Download size={16} /> PDF
            </button>
          </div>
        </div>

        <div className="oa-filters-bar">
          <div className="oa-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="oa-select">
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="oa-select">
            <option value="1d">Last Day</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div className="oa-kpi-grid">
          <PremiumKpiCard
            label="Total Products"
            value={kpis.total}
            icon={Package}
            color="#f97316"
            trend={12.5}
            sparkline={[10, 15, 12, 18, 22, 25, 28]}
            onClick={() => setShowStockModal(true)} // ← ADD THIS
          />
          <PremiumKpiCard label="Total Units" value={kpis.totalStock} icon={Archive} color="#3b82f6" trend={-3.2} sparkline={[100, 95, 98, 92, 88, 85, 82]} />
          <PremiumKpiCard label="Inventory Value" value={fmtShort(kpis.totalValue)} icon={DollarSign} color="#8b5cf6" trend={8.7} sparkline={[50, 55, 53, 60, 65, 70, 75]} />
          <PremiumKpiCard label="Total Profit" value={fmtShort(kpis.totalProfit)} icon={TrendingUp} color="#10b981" trend={15.3} sparkline={[20, 25, 30, 35, 42, 48, 55]} />
          <PremiumKpiCard label="Avg Margin" value={fmtPct(kpis.avgMargin)} icon={Percent} color="#ec4899" trend={2.1} sparkline={[30, 32, 31, 33, 34, 35, 36]} />
          <PremiumKpiCard label="Fast Moving" value={kpis.fastMoving} icon={Zap} color="#22c55e" trend={18.9} sparkline={[5, 7, 6, 9, 11, 13, 15]} />
          <PremiumKpiCard label="Dead Stock" value={kpis.deadStock} icon={Archive} color="#ef4444" trend={-5.4} sparkline={[8, 7, 6, 5, 4, 3, 2]} />
          <PremiumKpiCard label="Out of Stock" value={kpis.outStock} icon={AlertTriangle} color="#f59e0b" trend={-12.1} sparkline={[12, 10, 8, 6, 4, 3, 2]} />
          <PremiumKpiCard label="Needs Restock" value={kpis.needsRestock} icon={Bell} color="#f97316" trend={22.5} sparkline={[3, 4, 5, 7, 8, 10, 12]} />
          <PremiumKpiCard label="ROI %" value={fmtPct(kpis.roi)} icon={Target} color="#06b6d4" trend={9.8} sparkline={[15, 17, 16, 19, 21, 23, 25]} />
          <PremiumKpiCard label="Sell Through" value={fmtPct(kpis.sellThrough)} icon={Activity} color="#8b5cf6" trend={4.2} sparkline={[60, 62, 61, 63, 65, 67, 68]} />
          <PremiumKpiCard label="Avg Age" value={`${Math.round(kpis.avgAge)}d`} icon={Clock} color="#f59e0b" trend={-8.3} sparkline={[45, 42, 40, 38, 36, 34, 32]} />
          <PremiumKpiCard label="Low Stock" value={kpis.lowStock} icon={AlertCircle} color="#fbbf24" trend={5.7} sparkline={[8, 9, 10, 11, 12, 13, 14]} />
          <PremiumKpiCard label="In Stock" value={kpis.inStock} icon={CheckCircle2} color="#22c55e" trend={3.4} sparkline={[80, 82, 81, 83, 85, 87, 89]} />
        </div>

        <AIInsightsPanel insights={insights} alerts={alerts} anomalies={anomalies} />
        <AdvancedCharts products={filteredProducts} />
        <ProductTable products={filteredProducts} search={search} />
      </div>
    </div>
  );
}