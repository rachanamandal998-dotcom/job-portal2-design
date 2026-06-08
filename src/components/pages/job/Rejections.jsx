import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Search, Filter, Download, UserCheck, Mail, Archive, Eye,
  RefreshCw, TrendingUp, Percent, Calendar, AlertTriangle, Briefcase,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Users, BarChart3, ArrowLeft, Sun, Moon, MapPin,
  PieChart
} from 'lucide-react';
import '../../styles/Rejections.css'; 

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// ==========================================
// MOCK DATA 
// ==========================================
const COMPANIES = [
  'TechVantage', 'InnoSys', 'CloudScale', 'Apex Digital', 'Quantum Labs',
  'AlphaStream', 'ByteWorks', 'DevCore', 'Zeta Global', 'Stellar UI',
  'Nexus AI', 'CoreStack', 'PixelPerfect', 'DataPulse', 'LaunchPad Inc'
];

const REASONS = [
  'Lack of Experience', 'Skill Gap', 'Overqualified',
  'Salary Expectations', 'Cultural Fit', 'Position Closed', 'Other'
];

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Marketing Specialist', 'HR Manager', 'Sales Executive'];
const NAMES = ['Alex Ross', 'Jordan Lee', 'Taylor Smith', 'Morgan Freeman', 'Sam Wilson', 'Chris Evans', 'Emma Watson', 'Liam Neeson', 'Olivia Wilde', 'Noah Centineo'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me', 'icloud.com'];

const generateMockData = () => {
  const data = [];
  const now = new Date();

  for (let i = 1; i <= 200; i++) {
    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    const reason = REASONS[Math.floor(Math.random() * REASONS.length)];
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const name = NAMES[Math.floor(Math.random() * NAMES.length)] + ` ${i}`;
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${DOMAINS[Math.floor(Math.random() * DOMAINS.length)]}`;

    const daysAgo = Math.floor(Math.random() * 365);
    const rejectionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const appliedDaysAgo = daysAgo + Math.floor(Math.random() * 20) + 5;
    const appliedDate = new Date(now.getTime() - appliedDaysAgo * 24 * 60 * 60 * 1000);

    const status = i % 15 === 0 ? 'Reconsidered' : i % 22 === 0 ? 'Re-applied' : i % 18 === 0 ? 'Contacted' : 'Archived';

    data.push({
      id: `REJ-2026-${1000 + i}`,
      name,
      email,
      company,
      companyType: i % 4 === 0 ? 'Tech Companies' : i % 4 === 1 ? 'Startups' : i % 4 === 2 ? 'Enterprises' : 'Remote Companies',
      position: role,
      jobCategory: role.includes('Frontend') ? 'Frontend' : role.includes('Backend') ? 'Backend' : role.includes('Full Stack') ? 'Full Stack' : role.includes('UI/UX') ? 'UI/UX' : role.includes('Marketing') ? 'Marketing' : role.includes('HR') ? 'HR' : 'Sales',
      appliedDate: appliedDate.toISOString().split('T')[0],
      rejectionDate: rejectionDate.toISOString().split('T')[0],
      reason,
      experience: `${Math.floor(Math.random() * 8) + 1} Years`,
      skillsMatch: Math.floor(Math.random() * 45) + 45,
      status,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rejectionDate.getDay()],
      month: rejectionDate.toLocaleString('default', { month: 'long' }),
      year: rejectionDate.getFullYear().toString()
    });
  }
  return data;
};

const INITIAL_REJECTIONS = generateMockData();

export default function Rejection({ onBack }) {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [rejections, setRejections] = useState(INITIAL_REJECTIONS);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    dateRange: 'All', month: 'All', year: 'All', day: 'All',
    reason: 'All', companyType: 'All', jobCategory: 'All'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const resetFilters = () => {
    setFilters({
      dateRange: 'All', month: 'All', year: 'All', day: 'All',
      reason: 'All', companyType: 'All', jobCategory: 'All'
    });
    setSearch('');
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const filteredData = useMemo(() => {
    return rejections.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.position.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filters.month !== 'All' && item.month !== filters.month) return false;
      if (filters.year !== 'All' && item.year !== filters.year) return false;
      if (filters.day !== 'All' && item.dayOfWeek !== filters.day) return false;
      if (filters.reason !== 'All' && item.reason !== filters.reason) return false;
      if (filters.companyType !== 'All' && item.companyType !== filters.companyType) return false;
      if (filters.jobCategory !== 'All' && item.jobCategory !== filters.jobCategory) return false;

      if (filters.dateRange !== 'All') {
        const itemDate = new Date(item.rejectionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        itemDate.setHours(0, 0, 0, 0);
        const diffTime = today - itemDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'Today': if (diffDays !== 0) return false; break;
          case 'Yesterday': if (diffDays !== 1) return false; break;
          case 'Last 7 Days': if (diffDays >= 7) return false; break;
          case 'Last 30 Days': if (diffDays >= 30) return false; break;
          case 'Last 90 Days': if (diffDays >= 90) return false; break;
          case 'Last Year': if (diffDays >= 365) return false; break;
          default: break;
        }
      }
      return true;
    });
  }, [rejections, search, filters]);

  const paginatedData = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(offset, offset + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const metrics = useMemo(() => {
    const total = filteredData.length;
    const recovered = filteredData.filter(i => i.status === 'Reconsidered' || i.status === 'Re-applied').length;
    const successRate = total > 0 ? ((recovered / total) * 100).toFixed(1) : 0;
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const thisMonth = filteredData.filter(i => i.month === currentMonth).length;
    const thisWeek = filteredData.filter(i => {
      const itemDate = new Date(i.rejectionDate);
      const now = new Date();
      const diffTime = now - itemDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    }).length;

    return { total, rate: total > 0 ? ((total / rejections.length) * 100).toFixed(1) : 0, thisMonth, thisWeek, recovered, successRate };
  }, [filteredData, rejections.length]);

  const insights = useMemo(() => {
    if (filteredData.length === 0) return { reason: 'N/A', company: 'N/A', role: 'N/A', avgScore: 0 };
    const counts = { reasons: {}, companies: {}, roles: {}, totalScore: 0 };
    filteredData.forEach(item => {
      counts.reasons[item.reason] = (counts.reasons[item.reason] || 0) + 1;
      counts.companies[item.company] = (counts.companies[item.company] || 0) + 1;
      counts.roles[item.position] = (counts.roles[item.position] || 0) + 1;
      counts.totalScore += item.skillsMatch;
    });

    const getTop = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return {
      reason: getTop(counts.reasons),
      company: getTop(counts.companies),
      role: getTop(counts.roles),
      avgScore: (counts.totalScore / filteredData.length).toFixed(1)
    };
  }, [filteredData]);

  const handleUpdateStatus = (id, newStatus) => {
    setRejections(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleExport = (type) => {
    alert(`Exporting ${filteredData.length} records as ${type.toUpperCase()}`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map(item => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Chart configs
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: darkMode ? '#9ca3af' : '#475569', font: { family: 'Inter' } } },
      tooltip: { backgroundColor: darkMode ? '#1f2937' : '#fff', titleColor: darkMode ? '#fff' : '#1f2937', bodyColor: darkMode ? '#d1d5db' : '#475569' }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: darkMode ? '#9ca3af' : '#64748b' } },
      y: { grid: { color: darkMode ? '#374151' : '#f1f5f9' }, ticks: { color: darkMode ? '#9ca3af' : '#64748b' } }
    }
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Rejection Volume Trend',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => filteredData.filter(i => i.month.startsWith(month)).length),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const barChartData = {
    labels: COMPANIES.slice(0, 6),
    datasets: [{
      label: 'Rejections By Corporate Entity',
      data: COMPANIES.slice(0, 6).map(c => filteredData.filter(i => i.company === c).length),
      backgroundColor: darkMode ? 'rgba(249, 115, 22, 0.7)' : '#fdba74',
      hoverBackgroundColor: '#f97316',
      borderRadius: 6
    }]
  };

  const pieChartData = {
    labels: REASONS,
    datasets: [{
      data: REASONS.map(r => filteredData.filter(i => i.reason === r).length),
      backgroundColor: ['#ffedd5', '#fed7aa', '#fdba74', '#fda4af', '#f97316', '#ea580c', '#c2410c'],
      borderWidth: 1,
      borderColor: darkMode ? '#1e1e1e' : '#ffffff'
    }]
  };

  const radarChartData = {
    labels: ['React/Frontend', 'Node/Backend', 'System Design', 'UI/UX Alignment', 'Communication', 'Problem Solving'],
    datasets: [
      {
        label: 'Rejected Profiles',
        data: [75, 60, 80, 55, 70, 65],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: '#f97316',
      },
      {
        label: 'Accepted Standard',
        data: [85, 80, 85, 80, 85, 90],
        backgroundColor: darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)',
        borderColor: darkMode ? '#94a3b8' : '#0f172a',
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`offers-page ${darkMode ? 'dark' : ''}`}
    >
      {/* HEADER */}
      <header className="page-header">
        <div className="header-left">
          {onBack ? (
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={20} /> Back
            </button>
          ) : (
            <button className="back-btn" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1>
              <span className="header-icon"><AlertTriangle size={24} /></span>
              Rejection Operations
            </h1>
            <p>Systematize, evaluate, and rehabilitate talent acquisition fallout</p>
          </div>
        </div>
        <div className="header-right">
         
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => handleExport("csv")} className="back-btn" style={{ marginLeft: '10px' }}>
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {/* STATS CARDS */}
      <section className="stats-grid">
        {[
          { label: 'Total Rejections', value: metrics.total, icon: <XCircle />, color: '#ef4444' },
          { label: 'Rejection Rate', value: `${metrics.rate}%`, icon: <Percent />, color: '#f97316' },
          { label: 'This Month', value: metrics.thisMonth, icon: <Calendar />, color: '#fbbf24' },
          { label: 'This Week', value: metrics.thisWeek, icon: <TrendingUp />, color: '#3b82f6' },
          { label: 'Recovered Talent', value: metrics.recovered, icon: <UserCheck />, color: '#10b981' },
          { label: 'Success Velocity', value: `${metrics.successRate}%`, icon: <CheckCircle />, color: '#14b8a6' },
        ].map((card, i) => (
          <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} className="stat-card">
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
              placeholder="Search by ID, candidate, email, pipeline role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`filter-btn ${isFilterOpen ? 'active' : ''}`}>
              <Filter size={16} /> Advanced Filters {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button onClick={resetFilters} className="reset-btn"><RefreshCw size={18} /></button>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="filter-grid"
            >
              {[
                { label: 'Timeframe', key: 'dateRange', options: ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'] },
                { label: 'Month', key: 'month', options: ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
                { label: 'Day Matrix', key: 'day', options: ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
                { label: 'Primary Fault', key: 'reason', options: ['All', ...REASONS] },
                { label: 'Company Class', key: 'companyType', options: ['All', 'Tech Companies', 'Startups', 'Enterprises', 'Remote Companies'] },
                { label: 'Engineering Track', key: 'jobCategory', options: ['All', 'Frontend', 'Backend', 'Full Stack', 'UI/UX', 'Marketing', 'HR', 'Sales'] },
                { label: 'Target Year', key: 'year', options: ['All', '2026', '2025'] },
              ].map(filter => (
                <div key={filter.key} className="filter-item">
                  <label>{filter.label}</label>
                  <select value={filters[filter.key]} onChange={e => setFilters({ ...filters, [filter.key]: e.target.value })}>
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
          <h3><TrendingUp size={16} /> Longitudinal Trend</h3>
          <div className="chart-wrapper"><Line data={lineChartData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><Briefcase size={16} /> Domain Ecosystem</h3>
          <div className="chart-wrapper"><Bar data={barChartData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><PieChart size={16} /> Attrition Factors</h3>
          <div className="chart-wrapper"><Pie data={pieChartData} options={{ ...chartOptions, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>
        <div className="chart-card chart-card-wide">
          <h3><UserCheck size={16} /> Competency vs Target</h3>
          <div className="chart-wrapper"><Radar data={radarChartData} options={{ ...chartOptions, maintainAspectRatio: false }} /></div>
        </div>
      </section>

      {/* INSIGHTS */}
      <section className="insights-panel">
        <h3>⚡ Algorithmic Sourcing Insights</h3>
        <div className="insights-grid">
          <div className="insight-item"><span className="insight-label">Top Vulnerability Trigger</span><div className="insight-value">{insights.reason}</div></div>
          <div className="insight-item"><span className="insight-label">Strict Screening Entity</span><div className="insight-value">{insights.company}</div></div>
          <div className="insight-item"><span className="insight-label">High Risk Stream</span><div className="insight-value">{insights.role}</div></div>
          <div className="insight-item"><span className="insight-label">Mean Capability Index</span><div className="insight-value">{insights.avgScore}% Match</div></div>
        </div>
      </section>

      {/* TABLE SECTION */}
      <section className="offers-section">
        <div className="section-header">
          <div className="header-info1">
            <h2>Talent Redirection Logs ({filteredData.length})</h2>
            <p>Showing {paginatedData.length} of {filteredData.length} records</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="rejections-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id))}
                  />
                </th>
                <th>Candidate</th>
                <th>Position</th>
                <th>Company</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <Users size={48} style={{ opacity: 0.5, marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
                    <h3 style={{ margin: 0 }}>No records match your filters</h3>
                  </td>
                </tr>
              ) : paginatedData.map((record) => (
                <tr key={record.id} className={selectedIds.has(record.id) ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(record.id)} 
                      onChange={() => toggleSelect(record.id)} 
                    />
                  </td>
                  <td>
                    <div className="td-candidate">
                      <div className="td-avatar">{record.name.charAt(0)}</div>
                      <div>
                        <div className="td-name">{record.name}</div>
                        <div className="td-email">{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="td-primary">{record.position}</div>
                    <div className="td-secondary">{record.jobCategory}</div>
                  </td>
                  <td>
                    <div className="td-primary">{record.company}</div>
                    <div className="td-secondary">{record.companyType}</div>
                  </td>
                  <td>
                    <div className="td-secondary">App: {record.appliedDate}</div>
                    <div className="td-secondary">Rej: {record.rejectionDate}</div>
                  </td>
                  <td>
                    <span className="td-reason">
                      <AlertTriangle size={12} /> {record.reason}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${record.status.toLowerCase().replace('-', '')}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button title="Contact" onClick={() => handleUpdateStatus(record.id, 'Contacted')} className="action-icon btn-negotiate">
                        <Mail size={14} />
                      </button>
                      <button title="Reconsider" onClick={() => handleUpdateStatus(record.id, 'Reconsidered')} className="action-icon btn-accept">
                        <UserCheck size={14} />
                      </button>
                      <button title="Archive" onClick={() => handleUpdateStatus(record.id, 'Archived')} className="action-icon btn-reject">
                        <Archive size={14} />
                      </button>
                      <button title="Details" onClick={() => setSelectedRecord(record)} className="action-icon btn-view">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="pagination-btns">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={currentPage === page ? 'active' : ''}>
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </section>

      {/* RECORD DETAIL MODAL */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="modal-content" onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Rejection Record Details</h2>
                <button onClick={() => setSelectedRecord(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Candidate Information</h3>
                  <div className="detail-grid">
                    <div><strong>Name:</strong> {selectedRecord.name}</div>
                    <div><strong>Email:</strong> {selectedRecord.email}</div>
                    <div><strong>Experience:</strong> {selectedRecord.experience}</div>
                    <div><strong>Skill Match:</strong> {selectedRecord.skillsMatch}%</div>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Pipeline Context</h3>
                  <div className="detail-grid">
                    <div><strong>Company:</strong> {selectedRecord.company}</div>
                    <div><strong>Type:</strong> {selectedRecord.companyType}</div>
                    <div><strong>Position:</strong> {selectedRecord.position}</div>
                    <div><strong>Category:</strong> {selectedRecord.jobCategory}</div>
                    <div><strong>Applied:</strong> {selectedRecord.appliedDate}</div>
                    <div><strong>Rejected:</strong> {selectedRecord.rejectionDate}</div>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Actionable Insights</h3>
                  <div className="recruiter-info">
                    <div><AlertTriangle size={16} /> <strong>Primary Reason:</strong> {selectedRecord.reason}</div>
                    <div><MapPin size={16} /> <strong>Current Status:</strong> {selectedRecord.status}</div>
                    <div><Calendar size={16} /> <strong>Logged:</strong> {selectedRecord.dayOfWeek}, {selectedRecord.month} {selectedRecord.year}</div>
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