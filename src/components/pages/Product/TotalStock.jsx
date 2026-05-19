// src/components/pages/Product/TotalStock.jsx
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Package, TrendingUp, AlertTriangle, DollarSign, Archive, Search, Download, Star, Zap, Filter } from 'lucide-react';
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

  // ── FIX 1: CATEGORIES (now works for Bags, Kitchen, etc.) ──
  const categories = useMemo(() => {
    const cats = products
      .map(p => (p.category || '').trim())
      .filter(Boolean);
    return ['all', ...Array.from(new Set(cats)).sort()];
  }, [products]);

  // ── FIX 2: TOP 5 BY VALUE (always shows, not filtered) ──
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
    return products
      .filter(p => { const s = Number(p.stock); return s > 0 && s <= 5; })
      .sort((a, b) => Number(a.stock) - Number(b.stock))
      .slice(0, 5);
  }, [products]);

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
        <div className={`ts-row ${status}`}>
          <div className="ts-product">
            {p.image && <img src={p.image} alt={p.name} />}
            <div>
              <div className="ts-name">{p.name}</div>
              <div className="ts-sku">{p.sku || `ID: ${p.id}`} • {p.category || 'Uncategorized'}</div>
            </div>
          </div>
          <div className="ts-stock">
            <span className={`ts-badge ${status}`}>{fmtInt(p.stock)}</span>
          </div>
          <div className="ts-price">{fmt(p.price)}</div>
          <div className="ts-value">{fmt(p.stockValue)}</div>
          <div className="ts-bar">
            <div 
              className="ts-bar-fill" 
              style={{ 
                width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                background: status === 'out' ? '#ef4444' : status === 'low' ? '#f59e0b' : '#22c55e'
              }} 
            />
          </div>
        </div>
      </div>
    );
  };

  const exportCSV = () => {
    const headers = ['Product', 'SKU', 'Category', 'Stock', 'Price', 'Stock Value', 'Status'];
    const rows = filtered.map(p => [
      p.name,
      p.sku || '',
      p.category || '',
      p.stock,
      p.price,
      p.stockValue,
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
      <div className="ts-page">
        {/* Header */}
        <div className="ts-page-header">
          <button className="ts-back" onClick={onBack}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="ts-title-wrap">
            <h1>Inventory Stock</h1>
            <p>{stats.totalProducts} products • {fmtInt(stats.totalUnits)} units • {fmt(stats.totalValue)}</p>
          </div>
          <button className="ts-export" onClick={exportCSV}>
            <Download size={16} /> Export
          </button>
        </div>

        {/* Stats */}
        <div className="ts-stats">
          <button className={`ts-stat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            <Package size={20} />
            <div><div className="ts-stat-v">{fmtInt(stats.totalProducts)}</div><div className="ts-stat-l">Products</div></div>
          </button>
          <button className="ts-stat highlight">
            <DollarSign size={20} />
            <div><div className="ts-stat-v">{fmt(stats.totalValue)}</div><div className="ts-stat-l">Total Value</div></div>
          </button>
          <button className={`ts-stat ${filter === 'instock' ? 'active' : ''}`} onClick={() => setFilter('instock')}>
            <Archive size={20} />
            <div><div className="ts-stat-v">{fmtInt(stats.totalUnits)}</div><div className="ts-stat-l">Units</div></div>
          </button>
          <button className="ts-stat">
            <TrendingUp size={20} />
            <div><div className="ts-stat-v">{fmt(stats.avgPrice)}</div><div className="ts-stat-l">Avg Price</div></div>
          </button>
          <button className={`ts-stat warning ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>
            <AlertTriangle size={20} />
            <div><div className="ts-stat-v">{fmtInt(stats.lowStock)}</div><div className="ts-stat-l">Low</div></div>
          </button>
          <button className={`ts-stat danger ${filter === 'out' ? 'active' : ''}`} onClick={() => setFilter('out')}>
            <Package size={20} />
            <div><div className="ts-stat-v">{fmtInt(stats.outStock)}</div><div className="ts-stat-l">Out</div></div>
          </button>
        </div>

        {/* Insights */}
        <div className="ts-insights">
          <div className="ts-insight-card">
            <div className="ts-insight-head"><Star size={14} /> Top 5 by Value</div>
            {topByValue.map(p => (
              <div key={p.id} className="ts-insight-item">
                <span>{p.name}</span>
                <strong>{fmt(p.stockValue)}</strong>
              </div>
            ))}
          </div>
          <div className="ts-insight-card">
            <div className="ts-insight-head"><Zap size={14} /> Restock Soon</div>
            {restockSoon.length > 0 ? restockSoon.map(p => (
              <div key={p.id} className="ts-insight-item">
                <span>{p.name}</span>
                <strong className="low">{p.stock} left</strong>
              </div>
            )) : <div className="ts-insight-empty">All stocked well</div>}
          </div>
          <div className="ts-insight-card">
            <div className="ts-insight-head"><Filter size={14} /> Categories</div>
            {categories.slice(1, 6).map(cat => {
              const count = products.filter(p => (p.category || '').trim() === cat).length;
              return (
                <div key={cat} className="ts-insight-item">
                  <span>{cat}</span>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="ts-toolbar">
          <div className="ts-search">
            <Search size={16} />
            <input 
              placeholder="Search products..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="ts-select"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.slice(1).map(cat => (
              <option key={cat} value={cat}>
                {cat} ({products.filter(p => (p.category || '').trim() === cat).length})
              </option>
            ))}
          </select>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="ts-select">
            <option value="value">Sort by Value</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        {/* Table */}
        <div className="ts-table">
          <div className="ts-thead">
            <div>Product</div>
            <div>Stock</div>
            <div>Price</div>
            <div>Value</div>
            <div>Level</div>
          </div>
          <div className="ts-tbody">
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  width={width}
                  height={400}
                  rowCount={filtered.length}
                  rowHeight={68}
                  rowRenderer={rowRenderer}
                  overscanRowCount={5}
                />
              )}
            </AutoSizer>
          </div>
        </div>

        <div className="ts-footer">
          Showing {filtered.length} of {products.length} products
          {categoryFilter !== 'all' && ` in ${categoryFilter}`}
        </div>
      </div>
    </DashboardShell>
  );
}