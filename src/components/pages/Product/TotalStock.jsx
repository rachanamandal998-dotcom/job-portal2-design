import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, TrendingUp, AlertTriangle, DollarSign, 
  Archive, Search, Download, Star, Zap, Filter, ChevronDown, Sun, Moon, RefreshCw, XCircle 
} from 'lucide-react';
import { DashboardShell } from "../../shared/DashboardShell";
import { AutoSizer, List } from 'react-virtualized';
import '../../styles/TotalStock.css';

const fmt = (n) => `Rs ${Number(n || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtInt = (n) => Number(n || 0).toLocaleString('en-NP');

export default function TotalStock({ products = [], onBack }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | instock | low | out
  const [sortKey, setSortKey] = useState('value');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── STATS ──
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((a, p) => a + (Number(p.stock) || 0), 0);
    const totalValue = products.reduce((a, p) => a + (Number(p.price) * Number(p.stock || 0)), 0);
    const avgPrice = totalUnits > 0 ? totalValue / totalUnits : 0;
    const lowStock = products.filter(p => { const s = Number(p.stock); return s > 0 && s <= 5; }).length;
    const outStock = products.filter(p => Number(p.stock) === 0).length;
    return { totalProducts, totalUnits, totalValue, avgPrice, lowStock, outStock };
  }, [products]);

  // ── CATEGORIES ──
  const categories = useMemo(() => {
    const cats = products
      .map(p => (p.category || '').trim())
      .filter(Boolean);
    return ['all', ...Array.from(new Set(cats)).sort()];
  }, [products]);

  // ── TOP 5 BY VALUE ──
  const topByValue = useMemo(() => {
    return [...products]
      .map(p => ({
        ...p,
        stockValue: Number(p.price) * Number(p.stock || 0)
      }))
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 5);
  }, [products]);

  const restockSoon = useMemo(() => {
    return [...products]
      .filter(p => { const s = Number(p.stock); return s > 0 && s <= 5; })
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);
  }, [products]);

  // ── FILTER RESET HANDLER (Fixed Missing Reference) ──
  const resetFilters = () => {
    setSearch('');
    setFilter('all');
    setSortKey('value');
    setCategoryFilter('all');
    setIsFilterOpen(false);
  };

  // ── FILTERED LIST ──
  const filtered = useMemo(() => {
    return products
      .filter(p => {
        const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
                           (p.sku || '').toLowerCase().includes(search.toLowerCase());
        
        const stock = Number(p.stock) || 0;
        const matchFilter = filter === 'all' ||
                           (filter === 'instock' && stock > 5) ||
                           (filter === 'low' && stock > 0 && stock <= 5) ||
                           (filter === 'out' && stock === 0);
        
        const matchCategory = categoryFilter === 'all' || 
                             (p.category || '').trim() === categoryFilter;
        
        return matchSearch && matchFilter && matchCategory;
      })
      .map(p => ({
        ...p,
        stockValue: Number(p.price) * Number(p.stock || 0),
        stock: Number(p.stock) || 0
      }))
      .sort((a, b) => {
        if (sortKey === 'value') return b.stockValue - a.stockValue;
        if (sortKey === 'stock') return b.stock - a.stock;
        if (sortKey === 'price') return Number(b.price) - Number(a.price);
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, search, filter, sortKey, categoryFilter]);

  const rowRenderer = ({ index, key, style }) => {
    const p = filtered[index];
    const status = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'good';
    
    return (
      <div key={key} style={style} className="ts-row-wrap">
        <div className={`ts-row status-${status}`}>
          <div className="ts-col-product">
            {p.image ? (
              <img src={p.image} alt={p.name} className="ts-img" />
            ) : (
              <div className="ts-avatar">{p.name.charAt(0)}</div>
            )}
            <div>
              <div className="ts-name">{p.name}</div>
              <div className="ts-sku">{p.sku || `ID: ${p.id}`} • <span className="ts-cat-label">{p.category || 'Uncategorized'}</span></div>
            </div>
          </div>
          <div className="ts-col-stock">
            <span className={`status-badge status-${status}`}>{fmtInt(p.stock)} Units</span>
          </div>
          <div className="ts-col-price">{fmt(p.price)}</div>
          <div className="ts-col-value">{fmt(p.stockValue)}</div>
          <div className="ts-col-level">
            <div className="ts-progressbar">
              <div 
                className="ts-progress-fill" 
                style={{ 
                  width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                  background: status === 'out' ? '#ef4444' : status === 'low' ? '#f59e0b' : '#22c55e'
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Stock', 'Price', 'Stock Value', 'Status'];
    const rows = filtered.map(p => [
      p.name, p.sku || '', p.category || '', p.stock, p.price, p.stockValue,
      p.stock === 0 ? 'Out' : p.stock <= 5 ? 'Low' : 'Good'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardShell>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className={`offers-page ${darkMode ? 'dark' : ''}`}
      >
        {/* HEADER */}
        <header className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={20} /> Back
            </button>
            <div>
              <h1>
                <span className="header-icon"><Package size={24} /></span>
                Inventory Stock
              </h1>
              <p>{stats.totalProducts} items • {fmtInt(stats.totalUnits)} units tracked</p>
            </div>
          </div>
          <div className="header-right">
         
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="back-btn" onClick={exportCSV} style={{ width: 'auto', gap: '0.4rem' }}>
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        {/* STATS CARDS */}
        <section className="stats-grid">
          {[
            { label: 'Total Products', value: fmtInt(stats.totalProducts), icon: <Package />, color: '#f97316', active: filter === 'all', onClick: () => setFilter('all') },
            { label: 'Stock Valuation', value: fmt(stats.totalValue), icon: <DollarSign />, color: '#10b981', active: false, onClick: null },
            { label: 'Total Stock Units', value: fmtInt(stats.totalUnits), icon: <Archive />, color: '#3b82f6', active: filter === 'instock', onClick: () => setFilter('instock') },
            { label: 'Average Price', value: fmt(stats.avgPrice), icon: <TrendingUp />, color: '#8b5cf6', active: false, onClick: null },
            { label: 'Low Stock Alarms', value: fmtInt(stats.lowStock), icon: <AlertTriangle />, color: '#f59e0b', active: filter === 'low', onClick: () => setFilter('low') },
            { label: 'Out of Stock', value: fmtInt(stats.outStock), icon: <XCircle />, color: '#ef4444', active: filter === 'out', onClick: () => setFilter('out') }
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`stat-card ${card.active ? 'active-filter-card' : ''}`}
              onClick={card.onClick}
              style={{ cursor: card.onClick ? 'pointer' : 'default' }}
            >
              <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* INSIGHTS */}
        <section className="insights-panel">
          <h3>⚡ Smart Stock Insights</h3>
          <div className="insights-grid">
            <div className="ts-insight-card">
              <div className="insight-label"><Star size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Top 5 Holdings (Value)</div>
              <div className="ts-insight-list">
                {topByValue.map(p => (
                  <div key={p.id} className="ts-insight-item">
                    <span>{p.name}</span>
                    <strong>{fmt(p.stockValue)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="ts-insight-card">
              <div className="insight-label"><Zap size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Urgent Restock Priorities</div>
              <div className="ts-insight-list">
                {restockSoon.length > 0 ? restockSoon.map(p => (
                  <div key={p.id} className="ts-insight-item">
                    <span>{p.name}</span>
                    <strong className="ts-alert-text">{p.stock} left</strong>
                  </div>
                )) : <div className="ts-empty-state">All item layers stable</div>}
              </div>
            </div>
            <div className="ts-insight-card">
              <div className="insight-label"><Filter size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Stock Density by Category</div>
              <div className="ts-insight-list">
                {categories.slice(1, 6).map(cat => {
                  const count = products.filter(p => (p.category || '').trim() === cat).length;
                  return (
                    <div key={cat} className="ts-insight-item">
                      <span>{cat}</span>
                      <strong>{count} Items</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="filters-section">
          <div className="filter-row-top">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text"
                placeholder="Search by product name, SKU..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <div className="filter-actions">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`filter-btn ${isFilterOpen ? 'active' : ''}`}
              >
                <Filter size={16} /> Advanced Filters <ChevronDown size={16} />
              </button>
              <button onClick={resetFilters} className="reset-btn">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="filter-grid"
                style={{ paddingTop: '1.5rem', marginTop: '1rem' }}
              >
                <div className="filter-item">
                  <label>Filter Category</label>
                  <select 
                    value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>
                        {cat} ({products.filter(p => (p.category || '').trim() === cat).length})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-item">
                  <label>Order Metrics</label>
                  <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                    <option value="value">Sort by Value</option>
                    <option value="stock">Sort by Stock Level</option>
                    <option value="price">Sort by Unit Price</option>
                    <option value="name">Sort by Alphabetical Title</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* VIRTUALIZED TABLE CONTAINER */}
        <section className="offers-section">
          <div className="section-header">
            <div className="header-info1">
              <h2>Inventory Level Metrics</h2>
              <p>Displaying {filtered.length} matching entities</p>
            </div>
          </div>

          <div className="table-wrapper">
            <div className="ts-table-container">
              <div className="ts-thead-sticky">
                <div className="ts-col-product">Product Profile</div>
                <div className="ts-col-stock">Current Stock</div>
                <div className="ts-col-price">Unit Price</div>
                <div className="ts-col-value">Asset Value</div>
                <div className="ts-col-level">Safety Threshold</div>
              </div>
              
              <div className="ts-virtual-body">
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      height={420}
                      rowCount={filtered.length}
                      rowHeight={72}
                      rowRenderer={rowRenderer}
                      overscanRowCount={8}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          </div>
          
          <div className="ts-table-footer">
            Showing {filtered.length} of {products.length} catalog elements records
          </div>
        </section>
      </motion.div>
    </DashboardShell>
  );
}