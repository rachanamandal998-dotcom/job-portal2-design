import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import {
  Search, Filter, Download, Mail, Eye, FileText, Archive,
  RefreshCw, TrendingUp, Percent, Calendar, AlertTriangle, Briefcase,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Users, BarChart3,
  ArrowLeft, Clock, DollarSign, MapPin, Building2, User, Star,
  GitCompare, Printer, Moon, Sun, Bookmark, MessageSquare, Phone
} from 'lucide-react';
import '../../styles/OffersReceived.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// ==========================================
// MOCK DATA GENERATOR
// ==========================================
const COMPANIES = [
  { name: 'Google', logo: '🔍' }, { name: 'Amazon', logo: '📦' }, { name: 'Microsoft', logo: '🪟' },
  { name: 'Meta', logo: '👥' }, { name: 'Netflix', logo: '🎬' }, { name: 'Adobe', logo: '🎨' },
  { name: 'Oracle', logo: '🗄️' }, { name: 'Apple', logo: '🍎' }, { name: 'Tesla', logo: '⚡' }
];

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Product Manager', 'DevOps Engineer', 'Data Scientist'];
const LOCATIONS = ['Remote', 'Kathmandu', 'Delhi', 'Bangalore', 'Mumbai', 'Singapore', 'Dubai'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Negotiation', 'Expired'];
const SOURCES = ['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Naukri', 'Glassdoor'];
const RECRUITERS = ['Sarah Johnson', 'Michael Chen', 'Priya Sharma', 'David Kumar', 'Emily Davis'];

const generateOffers = () => {
  const offers = [];
  const now = new Date();

  for (let i = 1; i <= 12; i++) {
    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const offerDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const expiryDays = Math.floor(Math.random() * 14) + 7;
    const expiryDate = new Date(offerDate.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    const joiningDays = Math.floor(Math.random() * 30) + 15;
    const joiningDate = new Date(offerDate.getTime() + joiningDays * 24 * 60 * 60 * 1000);

    const baseSalary = Math.floor(Math.random() * 15) + 5;
    const status = i <= 4? 'Accepted' : i <= 7? 'Rejected' : i <= 9? 'Negotiation' : 'Pending';

    offers.push({
      id: `OFF-2026-${1000 + i}`,
      company: company.name,
      logo: company.logo,
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      department: 'Engineering',
      salary: baseSalary,
      salaryDisplay: `₹${baseSalary} LPA`,
      bonus: Math.floor(Math.random() * 3) + 1,
      stocks: Math.floor(Math.random() * 5),
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      workMode: WORK_MODES[Math.floor(Math.random() * WORK_MODES.length)],
      offerDate: offerDate.toISOString().split('T')[0],
      joiningDate: joiningDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      expiryDays: Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))),
      recruiter: RECRUITERS[Math.floor(Math.random() * RECRUITERS.length)],
      recruiterEmail: `recruiter@company.com`,
      recruiterPhone: '+91 98765 43210',
      status,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      probation: '3 Months',
      benefits: ['Health Insurance', 'Bonus', 'Stock Options', 'Paid Leaves', 'Flexible Hours', 'Work From Home'].slice(0, Math.floor(Math.random() * 4) + 3),
      leavePolicy: '24 days annual + 12 sick leaves',
      notes: '',
      bookmarked: Math.random() > 0.7,
      dayOfWeek: offerDate.toLocaleDateString('en', { weekday: 'long' }),
      month: offerDate.toLocaleDateString('en', { month: 'long' }),
      quarter: `Q${Math.ceil((offerDate.getMonth() + 1) / 3)}`,
      year: offerDate.getFullYear().toString()
    });
  }
  return offers;
};

const INITIAL_OFFERS = generateOffers();

export default function OffersReceived() {
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [filters, setFilters] = useState({
    dateRange: 'All',
    month: 'All',
    year: 'All',
    day: 'All',
    salary: 'All',
    workMode: 'All',
    company: 'All',
    status: 'All',
    quarter: 'All'
  });

  const [activeStatusFilter, setActiveStatusFilter] = useState('All');

  const resetFilters = () => {
    setFilters({
      dateRange: 'All', month: 'All', year: 'All', day: 'All',
      salary: 'All', workMode: 'All', company: 'All', status: 'All', quarter: 'All'
    });
    setSearch('');
    setActiveStatusFilter('All');
    setCurrentPage(1);
  };

  // FILTERING LOGIC
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch =
        offer.company.toLowerCase().includes(search.toLowerCase()) ||
        offer.role.toLowerCase().includes(search.toLowerCase()) ||
        offer.recruiter.toLowerCase().includes(search.toLowerCase()) ||
        offer.location.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (activeStatusFilter!== 'All' && offer.status!== activeStatusFilter) return false;
      if (filters.status!== 'All' && offer.status!== filters.status) return false;
      if (filters.month!== 'All' && offer.month!== filters.month) return false;
      if (filters.year!== 'All' && offer.year!== filters.year) return false;
      if (filters.day!== 'All' && offer.dayOfWeek!== filters.day) return false;
      if (filters.workMode!== 'All' && offer.workMode!== filters.workMode) return false;
      if (filters.company!== 'All' && offer.company!== filters.company) return false;
      if (filters.quarter!== 'All' && offer.quarter!== filters.quarter) return false;

      if (filters.salary!== 'All') {
        const s = offer.salary;
        if (filters.salary === 'Below ₹3 LPA' && s >= 3) return false;
        if (filters.salary === '₹3L–₹5L' && (s < 3 || s > 5)) return false;
        if (filters.salary === '₹5L–₹10L' && (s < 5 || s > 10)) return false;
        if (filters.salary === '₹10L–₹15L' && (s < 10 || s > 15)) return false;
        if (filters.salary === '₹15L+' && s < 15) return false;
      }

      if (filters.dateRange!== 'All') {
        const offerDate = new Date(offer.offerDate);
        const today = new Date();
        const diffDays = Math.ceil((today - offerDate) / (1000 * 60 * 60 * 24));
        switch(filters.dateRange) {
          case 'Today': if (diffDays > 1) return false; break;
          case 'Yesterday': if (diffDays!== 2) return false; break;
          case 'Last 7 Days': if (diffDays > 7) return false; break;
          case 'Last 30 Days': if (diffDays > 30) return false; break;
          case 'Last 90 Days': if (diffDays > 90) return false; break;
          case 'Last Year': if (diffDays > 365) return false; break;
        }
      }
      return true;
    });
  }, [offers, search, filters, activeStatusFilter]);

  const paginatedOffers = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredOffers.slice(offset, offset + itemsPerPage);
  }, [filteredOffers, currentPage]);

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  // METRICS
  const metrics = useMemo(() => {
    const total = offers.length;
    const accepted = offers.filter(o => o.status === 'Accepted').length;
    const rejected = offers.filter(o => o.status === 'Rejected').length;
    const pending = offers.filter(o => o.status === 'Pending').length;
    const negotiation = offers.filter(o => o.status === 'Negotiation').length;
    const maxSalary = Math.max(...offers.map(o => o.salary));
    const uniqueCompanies = new Set(offers.map(o => o.company)).size;
    const avgSalary = (offers.reduce((sum, o) => sum + o.salary, 0) / total).toFixed(1);
    const acceptanceRate = total > 0? ((accepted / total) * 100).toFixed(0) : 0;

    return { total, accepted, rejected, pending, negotiation, maxSalary, uniqueCompanies, avgSalary, acceptanceRate };
  }, [offers]);

  // CHART DATA
  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Offers Received',
      data: [2, 3, 1, 4, 2, 1, 3, 2, 4, 3, 2, 1],
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const statusBreakdownData = {
    labels: ['Accepted', 'Rejected', 'Pending', 'Negotiation'],
    datasets: [{
      data: [metrics.accepted, metrics.rejected, metrics.pending, metrics.negotiation],
      backgroundColor: ['#22c55e', '#ef4444', '#fbbf24', '#3b82f6'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const salaryComparisonData = {
    labels: COMPANIES.slice(0, 5).map(c => c.name),
    datasets: [{
      label: 'Salary (LPA)',
      data: [18, 16, 15, 17, 14],
      backgroundColor: ['rgba(249,115,22,0.8)', 'rgba(249,115,22,0.6)', 'rgba(249,115,22,0.4)', 'rgba(249,115,22,0.3)', 'rgba(249,115,22,0.2)'],
      borderRadius: 6
    }]
  };

  const sourceAnalyticsData = {
    labels: SOURCES,
    datasets: [{
      data: [4, 3, 2, 1, 1, 1],
      backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#fbbf24'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const locationDistributionData = {
    labels: ['Remote', 'Kathmandu', 'Delhi', 'Bangalore', 'Mumbai', 'Singapore'],
    datasets: [{
      label: 'Offers by Location',
      data: [5, 2, 1, 1, 1],
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
      borderColor: '#f97316',
      pointBackgroundColor: '#f97316'
    }]
  };

  const acceptanceRateData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Acceptance Rate %',
      data: [60, 65, 70, 67, 72, 68],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: darkMode? '#9ca3af' : '#475569', font: { family: 'Inter' } } },
      tooltip: { backgroundColor: darkMode? '#1f2937' : '#fff', titleColor: darkMode? '#fff' : '#1f2937', bodyColor: darkMode? '#d1d5db' : '#475569' }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: darkMode? '#9ca3af' : '#64748b' } },
      y: { grid: { color: darkMode? '#374151' : '#f1f5f9' }, ticks: { color: darkMode? '#9ca3af' : '#64748b' } }
    }
  };

  // HANDLERS
  const handleStatusChange = (id, newStatus) => {
    setOffers(prev => prev.map(o => o.id === id? {...o, status: newStatus} : o));
  };

  const toggleBookmark = (id) => {
    setOffers(prev => prev.map(o => o.id === id? {...o, bookmarked:!o.bookmarked} : o));
  };

  const toggleCompare = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id)? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExport = (type) => {
    alert(`Exporting ${filteredOffers.length} offers as ${type.toUpperCase()}`);
  };

  const selectedOffers = offers.filter(o => selectedIds.has(o.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`offers-page ${darkMode? 'dark' : ''}`}
    >
      {/* HEADER */}
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>
              <span className="header-icon"><Briefcase size={24} /></span>
              Offers Received
            </h1>
            <p>Compare salary packages and offer details</p>
          </div>
        </div>
        <div className="header-right">
          <span className="offers-badge">{metrics.total} Offers</span>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* STATS CARDS */}
      <section className="stats-grid">
        {[
          { label: 'Total Offers', value: metrics.total, icon: <FileText />, color: '#f97316', filter: 'All' },
          { label: 'Accepted', value: metrics.accepted, icon: <CheckCircle />, color: '#22c55e', filter: 'Accepted' },
          { label: 'Rejected', value: metrics.rejected, icon: <XCircle />, color: '#ef4444', filter: 'Rejected' },
          { label: 'Pending', value: metrics.pending, icon: <Clock />, color: '#fbbf24', filter: 'Pending' },
          { label: 'Highest Package', value: `₹${metrics.maxSalary} LPA`, icon: <DollarSign />, color: '#10b981' },
          { label: 'Companies', value: metrics.uniqueCompanies, icon: <Building2 />, color: '#3b82f6' },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            className="stat-card"
            onClick={() => card.filter && setActiveStatusFilter(card.filter)}
            style={{ cursor: card.filter? 'pointer' : 'default' }}
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

      {/* FILTERS */}
      <section className="filters-section">
        <div className="filter-row-top">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by company, role, recruiter, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`filter-btn ${isFilterOpen? 'active' : ''}`}
            >
              <Filter size={16} />
              Advanced Filters
              {isFilterOpen? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
            >
              {[
                { label: 'Date Range', key: 'dateRange', options: ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'] },
                { label: 'Month', key: 'month', options: ['All', 'January','February','March','April','May','June','July','August','September','October','November','December'] },
                { label: 'Day', key: 'day', options: ['All', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
                { label: 'Salary', key: 'salary', options: ['All', 'Below ₹3 LPA', '₹3L–₹5L', '₹5L–₹10L', '₹10L–₹15L', '₹15L+'] },
                { label: 'Work Mode', key: 'workMode', options: ['All', 'Remote', 'Hybrid', 'On-site'] },
                { label: 'Company', key: 'company', options: ['All',...COMPANIES.map(c => c.name)] },
                { label: 'Status', key: 'status', options: ['All',...STATUSES] },
                { label: 'Year', key: 'year', options: ['All', '2026', '2025', '2024'] },
                { label: 'Quarter', key: 'quarter', options: ['All', 'Q1', 'Q2', 'Q3', 'Q4'] },
              ].map(filter => (
                <div key={filter.key} className="filter-item">
                  <label>{filter.label}</label>
                  <select
                    value={filters[filter.key]}
                    onChange={e => setFilters({...filters, [filter.key]: e.target.value})}
                  >
                    {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* CHARTS */}
      <section className="charts-grid">
        <div className="chart-card">
          <h3><TrendingUp size={16} /> Monthly Offers Trend</h3>
          <div className="chart-wrapper"><Line data={monthlyTrendData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><BarChart3 size={16} /> Offer Status Breakdown</h3>
          <div className="chart-wrapper"><Doughnut data={statusBreakdownData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: { position: 'bottom' }}}} /></div>
        </div>
        <div className="chart-card">
          <h3><DollarSign size={16} /> Salary Comparison</h3>
          <div className="chart-wrapper"><Bar data={salaryComparisonData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><Users size={16} /> Offer Source Analytics</h3>
          <div className="chart-wrapper"><Pie data={sourceAnalyticsData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: { position: 'bottom' }}}} /></div>
        </div>
        <div className="chart-card chart-card-wide">
          <h3><MapPin size={16} /> Location Distribution</h3>
          <div className="chart-wrapper"><Radar data={locationDistributionData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
        <div className="chart-card">
          <h3><Percent size={16} /> Offer Acceptance Rate</h3>
          <div className="chart-wrapper"><Line data={acceptanceRateData} options={chartOptions} /></div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="insights-panel">
        <h3>⚡ Smart Insights</h3>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-label">Highest Package</span>
            <div className="insight-value">Google - ₹18 LPA</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">Fastest Offer</span>
            <div className="insight-value">Adobe - 2 Days</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">Most Common Mode</span>
            <div className="insight-value">Remote</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">Average Salary</span>
            <div className="insight-value">₹{metrics.avgSalary} LPA</div>
          </div>
        </div>
      </section>

      {/* COMPARISON MODE */}
      {compareMode && selectedOffers.length > 0 && (
        <section className="compare-section">
          <div className="compare-header">
            <h3><GitCompare size={18} /> Compare Offers ({selectedOffers.length})</h3>
            <button onClick={() => { setCompareMode(false); setSelectedIds(new Set()); }}>Close</button>
          </div>
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  {selectedOffers.map(o => <th key={o.id}>{o.company}</th>)}
                </tr>
              </thead>
              <tbody>
                {['Role', 'Salary', 'Bonus', 'Stocks', 'Location', 'Work Mode', 'Joining Date', 'Benefits'].map(attr => (
                  <tr key={attr}>
                    <td className="attr-name">{attr}</td>
                    {selectedOffers.map(o => (
                      <td key={o.id}>
                        {attr === 'Role'? o.role :
                         attr === 'Salary'? o.salaryDisplay :
                         attr === 'Bonus'? `₹${o.bonus}L` :
                         attr === 'Stocks'? `${o.stocks}%` :
                         attr === 'Location'? o.location :
                         attr === 'Work Mode'? o.workMode :
                         attr === 'Joining Date'? o.joiningDate :
                         attr === 'Benefits'? o.benefits.join(', ') : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* OFFERS GRID */}
      <section className="offers-section">
        <div className="section-header">
          <div>
            <h2>All Offers ({filteredOffers.length})</h2>
            <p>Showing {paginatedOffers.length} of {filteredOffers.length} offers</p>
          </div>
          <div className="header-actions">
            {selectedIds.size > 0 && (
              <button onClick={() => setCompareMode(true)} className="compare-btn">
                <GitCompare size={16} /> Compare ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        <div className="offers-grid">
          {paginatedOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="offer-card"
            >
              <div className="offer-header">
                <div className="company-info">
                  <div className="company-logo">{offer.logo}</div>
                  <div>
                    <h3>{offer.company}</h3>
                    <p className="role">{offer.role}</p>
                  </div>
                <div className="offer-actions-top">
                  <button onClick={() => toggleBookmark(offer.id)} className={`bookmark-btn ${offer.bookmarked? 'active' : ''}`}>
                    <Bookmark size={16} fill={offer.bookmarked? 'currentColor' : 'none'} />
                  </button>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(offer.id)}
                    onChange={() => toggleCompare(offer.id)}
                  />
                </div>
              </div>
              </div>

              <div className="offer-details">
                <div className="detail-row">
                  <DollarSign size={14} />
                  <span className="salary">{offer.salaryDisplay}</span>
                  <span className="badge">{offer.workMode}</span>
                </div>
                <div className="detail-row">
                  <MapPin size={14} />
                  <span>{offer.location}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={14} />
                  <span>Join: {offer.joiningDate}</span>
                </div>
                <div className="detail-row">
                  <Clock size={14} />
                  <span className={offer.expiryDays <= 3? 'expiring' : ''}>
                    Expires: {offer.expiryDate} ({offer.expiryDays}d)
                  </span>
                </div>
                <div className="detail-row">
                  <User size={14} />
                  <span>{offer.recruiter}</span>
                </div>
              </div>

              <div className={`status-badge status-${offer.status.toLowerCase()}`}>
                {offer.status}
              </div>

              <div className="offer-actions">
                {offer.status === 'Pending' && (
                  <>
                    <button onClick={() => handleStatusChange(offer.id, 'Accepted')} className="btn-accept">
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button onClick={() => handleStatusChange(offer.id, 'Negotiation')} className="btn-negotiate">
                      <MessageSquare size={14} /> Negotiate
                    </button>
                    <button onClick={() => handleStatusChange(offer.id, 'Rejected')} className="btn-reject">
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedOffer(offer)} className="btn-view">
                  <Eye size={14} /> Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="pagination-btns">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page? 'active' : ''}
              >
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </section>

      {/* OFFER DETAIL MODAL */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedOffer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Offer Details</h2>
                <button onClick={() => setSelectedOffer(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Offer Information</h3>
                  <div className="detail-grid">
                    <div><strong>Role:</strong> {selectedOffer.role}</div>
                    <div><strong>Department:</strong> {selectedOffer.department}</div>
                    <div><strong>Salary:</strong> {selectedOffer.salaryDisplay}</div>
                    <div><strong>Bonus:</strong> ₹{selectedOffer.bonus}L</div>
                    <div><strong>Stocks:</strong> {selectedOffer.stocks}%</div>
                    <div><strong>Joining:</strong> {selectedOffer.joiningDate}</div>
                    <div><strong>Probation:</strong> {selectedOffer.probation}</div>
                  </div>
                </div>
                </div>
                <div className="detail-section">
                  <h3>Benefits</h3>
                  <div className="benefits-list">
                    {selectedOffer.benefits.map((b, i) => (
                      <span key={i} className="benefit-tag">{b}</span>
                    ))}
                  </div>
                <div className="detail-section">
                  <h3>Recruiter Information</h3>
                  <div className="recruiter-info">
                    <div><User size={16} /> {selectedOffer.recruiter}</div>
                    <div><Mail size={16} /> {selectedOffer.recruiterEmail}</div>
                    <div><Phone size={16} /> {selectedOffer.recruiterPhone}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}