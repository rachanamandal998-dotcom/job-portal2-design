import React, { useState, useMemo } from 'react';
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
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Search, Filter, Download, UserCheck, Mail, Eye, FileText, Archive,
  RefreshCw, TrendingUp, Percent, Calendar, AlertTriangle, Briefcase,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Users, BarChart3
} from 'lucide-react';
import '../../styles/Rejections.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// ==========================================
// MOCK DATA GENERATOR
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

    const status = i % 15 === 0? 'Reconsidered' : i % 22 === 0? 'Re-applied' : i % 18 === 0? 'Contacted' : 'Archived';

    data.push({
      id: `REJ-2026-${1000 + i}`,
      name,
      email,
      company,
      companyType: i % 4 === 0? 'Tech Companies' : i % 4 === 1? 'Startups' : i % 4 === 2? 'Enterprises' : 'Remote Companies',
      position: role,
      jobCategory: role.includes('Frontend')? 'Frontend' : role.includes('Backend')? 'Backend' : role.includes('Full Stack')? 'Full Stack' : role.includes('UI/UX')? 'UI/UX' : role.includes('Marketing')? 'Marketing' : role.includes('HR')? 'HR' : 'Sales',
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

export default function RejectionsPage() {
  const [rejections, setRejections] = useState(INITIAL_REJECTIONS);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    dateRange: 'All',
    month: 'All',
    year: 'All',
    day: 'All',
    reason: 'All',
    companyType: 'All',
    jobCategory: 'All'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const resetFilters = () => {
    setFilters({
      dateRange: 'All', month: 'All', year: 'All', day: 'All',
      reason: 'All', companyType: 'All', jobCategory: 'All'
    });
    setSearch('');
    setCurrentPage(1);
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
      if (filters.month!== 'All' && item.month!== filters.month) return false;
      if (filters.year!== 'All' && item.year!== filters.year) return false;
      if (filters.day!== 'All' && item.dayOfWeek!== filters.day) return false;
      if (filters.reason!== 'All' && item.reason!== filters.reason) return false;
      if (filters.companyType!== 'All' && item.companyType!== filters.companyType) return false;
      if (filters.jobCategory!== 'All' && item.jobCategory!== filters.jobCategory) return false;

      if (filters.dateRange!== 'All') {
        const itemDate = new Date(item.rejectionDate);
        const today = new Date();
        const diffTime = Math.abs(today - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch(filters.dateRange) {
          case 'Today': if (diffDays > 1) return false; break;
          case 'Yesterday': if (diffDays!== 2) return false; break;
          case 'Last 7 Days': if (diffDays > 7) return false; break;
          case 'Last 30 Days': if (diffDays > 30) return false; break;
          case 'Last 90 Days': if (diffDays > 90) return false; break;
          case 'Last Year': if (diffDays > 365) return false; break;
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
    const successRate = total > 0? ((recovered / total) * 100).toFixed(1) : 0;
    const thisMonth = filteredData.filter(i => i.month === 'May').length;
    const thisWeek = Math.ceil(thisMonth * 0.25);

    return {
      total,
      rate: total > 0? ((total / (total + 140)) * 100).toFixed(1) : 0,
      thisMonth,
      thisWeek,
      recovered,
      successRate
    };
  }, [filteredData]);

  const insights = useMemo(() => {
    if (filteredData.length === 0) return { reason: 'N/A', company: 'N/A', role: 'N/A', avgScore: 0 };

    const counts = { reasons: {}, companies: {}, roles: {}, totalScore: 0 };
    filteredData.forEach(item => {
      counts.reasons[item.reason] = (counts.reasons[item.reason] || 0) + 1;
      counts.companies[item.company] = (counts.companies[item.company] || 0) + 1;
      counts.roles[item.position] = (counts.roles[item.position] || 0) + 1;
      counts.totalScore += item.skillsMatch;
    });

    const getTop = (obj) => Object.entries(obj).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      reason: getTop(counts.reasons),
      company: getTop(counts.companies),
      role: getTop(counts.roles),
      avgScore: (counts.totalScore / filteredData.length).toFixed(1)
    };
  }, [filteredData]);

  const handleUpdateStatus = (id, newStatus) => {
    setRejections(prev => prev.map(item => item.id === id? {...item, status: newStatus } : item));
  };

  const handleExport = (type) => {
    alert(`Exporting ${filteredData.length} records as ${type.toUpperCase()}`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id)? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked? new Set(paginatedData.map(a => a.id)) : new Set());
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#475569', font: { family: 'Inter' } } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } }
    }
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Rejection Volume Trend',
      data: [35, 42, 28, 50, metrics.thisMonth, 30, 40, 45, 38, 52, 60, 48],
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
      data: [24, 18, 32, 15, 29, 21],
      backgroundColor: '#fdba74',
      hoverBackgroundColor: '#f97316',
      borderRadius: 6
    }]
  };

  const pieChartData = {
    labels: REASONS,
    datasets: [{
      data: REASONS.map(r => filteredData.filter(i => i.reason === r).length),
      backgroundColor: ['#ffedd5', '#fed7aa', '#fdb674', '#fda4af', '#f97316', '#ea580c', '#c2410c'],
      borderWidth: 1
    }]
  };

  const radarChartData = {
    labels: ['React/Frontend', 'Node/Backend', 'System Design', 'UI/UX Alignment', 'Communication', 'Problem Solving'],
    datasets: [
      {
        label: 'Rejected Threshold Profiles',
        data: [75, 60, 80, 55, 70, 65],
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: '#f97316',
      },
      {
        label: 'Accepted Standard Criteria',
        data: [85, 80, 85, 80, 85, 90],
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        borderColor: '#0f172a',
      }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rejections-page"
    >
      {/* HEADER */}
      <header className="page-header">
        <div className="header-left">
          <h1>
            <span className="header-icon"><AlertTriangle size={24} /></span>
            Rejection Operations Hub
          </h1>
          <p>Systematize, evaluate, and rehabilitate talent acquisition fallout funnels.</p>
        </div>
        <div className="header-actions">
          {['csv', 'excel', 'pdf'].map(type => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              className="export-btn"
            >
              <Download size={15} />
              <span>{type}</span>
            </button>
          ))}
        </div>
      </header>

      {/* KPI GRID */}
      <section className="kpi-grid">
        {[
          { label: 'Total Rejections', val: metrics.total, icon: <XCircle className="icon-rose" /> },
          { label: 'Rejection Rate', val: `${metrics.rate}%`, icon: <Percent className="icon-orange" /> },
          { label: 'This Month', val: metrics.thisMonth, icon: <Calendar className="icon-amber" /> },
          { label: 'This Week', val: metrics.thisWeek, icon: <TrendingUp className="icon-blue" /> },
          { label: 'Recovered Talent', val: metrics.recovered, icon: <UserCheck className="icon-emerald" /> },
          { label: 'Success Velocity', val: `${metrics.successRate}%`, icon: <CheckCircle className="icon-teal" /> },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            className="kpi-card"
          >
            <div className="kpi-header">
              <span className="kpi-label">{card.label}</span>
              {card.icon}
            </div>
            <div className="kpi-value">{card.val}</div>
          </motion.div>
        ))}
      </section>

      {/* SEARCH & FILTERS */}
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
                { label: 'Timeframe', key: 'dateRange', options: ['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year'] },
                { label: 'Month', key: 'month', options: ['All', 'January','February','March','April','May','June','July','August','September','October','November','December'] },
                { label: 'Day Matrix', key: 'day', options: ['All', 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
                { label: 'Primary Fault', key: 'reason', options: ['All',...REASONS] },
                { label: 'Company Class', key: 'companyType', options: ['All', 'Tech Companies', 'Startups', 'Enterprises', 'Remote Companies'] },
                { label: 'Engineering Track', key: 'jobCategory', options: ['All', 'Frontend', 'Backend', 'Full Stack', 'UI/UX', 'Marketing', 'HR', 'Sales'] },
                { label: 'Target Year', key: 'year', options: ['All', '2026', '2025'] },
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
          <h3><BarChart3 size={16} /> Longitudinal Rejection Trend</h3>
          <div className="chart-wrapper"><Line data={lineChartData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><BarChart3 size={16} /> Rejections by Domain Ecosystem</h3>
          <div className="chart-wrapper"><Bar data={barChartData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <h3><BarChart3 size={16} /> Breakdown of Attrition Factors</h3>
          <div className="chart-wrapper"><Pie data={pieChartData} options={{...chartOptions, maintainAspectRatio: false}} /></div>
        </div>
        <div className="chart-card chart-card-wide">
          <h3><BarChart3 size={16} /> Candidate Competency vs. Hiring Target</h3>
          <div className="chart-wrapper"><Radar data={radarChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </section>

      {/* INSIGHTS PANEL */}
      <section className="insights-panel">
        <h3>⚡ Algorithmic Sourcing Insights</h3>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-label">Top Vulnerability Trigger</span>
            <div className="insight-value">{insights.reason}</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">Strict Screening Entity</span>
            <div className="insight-value">{insights.company}</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">High Risk Stream</span>
            <div className="insight-value">{insights.role}</div>
          </div>
          <div className="insight-item">
            <span className="insight-label">Mean Capability Index</span>
            <div className="insight-value">{insights.avgScore}% Match</div>
          </div>
        </div>
      </section>

      {/* DATA TABLE */}
      <section className="table-section">
        <div className="table-header">
          <div>
            <h2>Talent Redirection Logs</h2>
            <p>Total matched evaluation profiles: {filteredData.length}</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={paginatedData.length > 0 && paginatedData.every((a) => selectedIds.has(a.id))}
                  />
                </th>
                <th>Applicant</th>
                <th>Pipeline Position</th>
                <th>Company</th>
                <th>Timeline Context</th>
                <th>Rejection Factor</th>
                <th>Score Profile</th>
                <th>Status Class</th>
                <th>Interventions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record) => (
                <tr key={record.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </td>
                  <td data-label="Applicant">
                    <div className="candidate-cell">
                      <div className="avatar">{record.name.charAt(0)}</div>
                      <div>
                        <div className="name">{record.name}</div>
                        <div className="email"><Mail size={12}/>{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Position">
                    <div className="position">{record.position}</div>
                    <span className="category-tag">{record.jobCategory}</span>
                  </td>
                  <td data-label="Company">
                    <div className="company">{record.company}</div>
                    <span className="company-type">{record.companyType}</span>
                  </td>
                  <td data-label="Timeline">
                    <div className="timeline">
                      <div>App: <span>{record.appliedDate}</span></div>
                      <div>Rej: <span>{record.rejectionDate}</span></div>
                    </div>
                  </td>
                  <td data-label="Reason">
                    <span className="reason-badge">
                      <AlertTriangle size={12}/> {record.reason}
                    </span>
                  </td>
                  <td data-label="Score">
                    <div className="score-display">
                      <div className="score-text">{record.experience} exp</div>
                      <div className="score-bar">
                        <div style={{width: `${record.skillsMatch}%`}} className="score-fill" />
                      </div>
                      <span className="score-percent">{record.skillsMatch}% Match</span>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge status-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="actions">
                      <button title="View Dossier" className="action-btn"><Eye size={15}/></button>
                      <button title="Examine CV" className="action-btn"><FileText size={15}/></button>
                      <button title="Initiate Contact" onClick={() => handleUpdateStatus(record.id, 'Contacted')} className="action-btn action-purple"><Mail size={15}/></button>
                      <button title="Activate Reconsideration" onClick={() => handleUpdateStatus(record.id, 'Reconsidered')} className="action-btn action-emerald"><UserCheck size={15}/></button>
                      <button title="Commit Archive" onClick={() => handleUpdateStatus(record.id, 'Archived')} className="action-btn action-rose"><Archive size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <span>Viewing {paginatedData.length} records out of {filteredData.length} filtered items</span>
          <div className="pagination-btns">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page? 'active' : ''}
                >
                  {page}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}