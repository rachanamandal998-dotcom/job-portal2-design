import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Download, Eye, Mail, Calendar, Filter, CheckCircle, XCircle,
  Clock, AlertTriangle, Star, FileText, Send, Trash2, Users, TrendingUp,
  RefreshCw, Save, Printer, MoreVertical, X, MessageSquare, UserPlus
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/PendingApplication.css";

// Generate 100-300 pending candidates
const generatePendingData = () => {
  const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown", "Emily Davis", "Chris Lee", "Anna Garcia", "David Martinez", "Lisa Anderson", "James Taylor", "Maria Rodriguez", "Robert Wilson", "Linda Brown", "Michael Davis"];
  const positions = ["Frontend Developer", "Backend Engineer", "UI/UX Designer", "Product Manager", "Data Analyst", "DevOps Engineer", "QA Engineer", "Marketing Manager", "Sales Executive", "HR Specialist"];
  const departments = ["IT", "HR", "Marketing", "Finance", "Sales", "Operations", "Design", "Customer Support"];
  const pendingStatuses = ["Not Reviewed", "Under Review", "Waiting for HR", "Waiting for Interview Setup", "Waiting for Manager Approval"];
  const priorities = ["High", "Medium", "Low"];
  const locations = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Butwal", "Chitwan", "Biratnagar"];
  const skills = ["React", "Node", "Python", "Java", "Flutter", "PHP", "UI/UX", "Marketing", "Finance", "Sales"];
  const recruiters = ["Rachana Sharma", "Admin User", "HR Team", "Manager A", "Manager B"];

  return Array.from({ length: 147 }, (_, i) => {
    const waitingDays = Math.floor(Math.random() * 15);
    const appliedDate = new Date(Date.now() - waitingDays * 24 * 60 * 60 * 1000);
    return {
      id: i + 1,
      photo: names[i % names.length].charAt(0),
      name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
      phone: `+977-98${Math.floor(Math.random() * 10000000)}`,
      position: positions[i % positions.length],
      department: departments[i % departments.length],
      location: locations[i % locations.length],
      experience: Math.floor(Math.random() * 10),
      education: "Bachelor",
      skills: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, j) => skills[(i + j) % skills.length]),
      expectedSalary: 20 + Math.floor(Math.random() * 80),
      appliedDate: appliedDate.toISOString().split('T')[0],
      waitingDays,
      matchScore: Math.floor(Math.random() * 40) + 60,
      resumeScore: Math.floor(Math.random() * 40) + 60,
      priority: waitingDays > 7? "High" : waitingDays > 3? "Medium" : "Low",
      status: pendingStatuses[Math.floor(Math.random() * pendingStatuses.length)],
      recruiter: recruiters[i % recruiters.length],
      bookmarked: Math.random() > 0.8,
      notes: [],
      timeline: [
        { action: "Applied", date: appliedDate.toISOString().split('T')[0], user: "System" },
        { action: "Screening", date: new Date(appliedDate.getTime() + 86400000).toISOString().split('T')[0], user: recruiters[i % recruiters.length] }
      ],
      interviewScore: {
        communication: Math.floor(Math.random() * 40) + 60,
        technical: Math.floor(Math.random() * 40) + 60,
        problemSolving: Math.floor(Math.random() * 40) + 60,
        leadership: Math.floor(Math.random() * 40) + 60,
        teamwork: Math.floor(Math.random() * 40) + 60,
        cultureFit: Math.floor(Math.random() * 40) + 60
      }
    };
  });
};

export default function PendingApplication() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState(generatePendingData);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'waitingDays', direction: 'desc' });
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const chartsRef = useRef({});

  // Filters
  const [filters, setFilters] = useState({
    dateRange: 'all',
    priority: 'all',
    department: 'all',
    status: 'all',
    experience: 'all',
    location: 'all',
    matchScoreMin: '',
    skills: [],
    customStart: '',
    customEnd: ''
  });

  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('pendingSearches') || '[]')
  );

  // Filtered data
  const filteredApps = useMemo(() => {
    let result = applications.filter(app => {
      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          app.name.toLowerCase().includes(searchLower) ||
          app.email.toLowerCase().includes(searchLower) ||
          app.phone.includes(search) ||
          app.skills.some(s => s.toLowerCase().includes(searchLower)) ||
          app.position.toLowerCase().includes(searchLower) ||
          app.department.toLowerCase().includes(searchLower) ||
          app.education.toLowerCase().includes(searchLower) ||
          app.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filters
      if (filters.status!== 'all' && app.status!== filters.status) return false;
      if (filters.department!== 'all' && app.department!== filters.department) return false;
      if (filters.location!== 'all' && app.location!== filters.location) return false;
      if (filters.priority!== 'all' && app.priority!== filters.priority) return false;
      if (filters.matchScoreMin && app.matchScore < parseInt(filters.matchScoreMin)) return false;

      if (filters.experience!== 'all') {
        const exp = app.experience;
        if (filters.experience === 'fresher' && exp > 0) return false;
        if (filters.experience === '1-2' && (exp < 1 || exp > 2)) return false;
        if (filters.experience === '2-5' && (exp < 2 || exp > 5)) return false;
        if (filters.experience === '5-10' && (exp < 5 || exp > 10)) return false;
        if (filters.experience === '10+' && exp < 10) return false;
      }

      if (filters.skills.length > 0 &&!filters.skills.some(s => app.skills.includes(s))) return false;
      if (bookmarkedOnly &&!app.bookmarked) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc'? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc'? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, search, filters, sortConfig, bookmarkedOnly]);

  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // KPIs
  const kpis = useMemo(() => ({
    total: applications.length,
    newToday: applications.filter(a => a.appliedDate === new Date().toISOString().split('T')[0]).length,
    highPriority: applications.filter(a => a.priority === 'High').length,
    overdue: applications.filter(a => a.waitingDays > 7).length,
    avgWaiting: Math.round(applications.reduce((sum, a) => sum + a.waitingDays, 0) / applications.length * 10) / 10,
    conversionRisk: Math.round((applications.filter(a => a.waitingDays > 5).length / applications.length) * 100)
  }), [applications]);

  // Charts
  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    const orange = "#f97316";
    const grid = '#fff7ed';

    // 1. Pending Trend Line Chart
    const trendCtx = document.getElementById('pendingTrend');
    if (trendCtx) {
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Pending',
            data: [45, 52, 48, 61, 55, 67, 63],
            borderColor: orange,
            backgroundColor: 'rgba(249,115,22,0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 5
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    // 2. Department Bar Chart
    const deptCtx = document.getElementById('deptPending');
    if (deptCtx) {
      const depts = ['IT', 'HR', 'Marketing', 'Finance', 'Sales', 'Operations', 'Design'];
      chartsRef.current.dept = new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [{
            label: 'Pending',
            data: depts.map(d => applications.filter(a => a.department === d).length),
            backgroundColor: orange,
            borderRadius: 8
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    // 3. Priority Doughnut
    const priorityCtx = document.getElementById('priorityChart');
    if (priorityCtx) {
      chartsRef.current.priority = new Chart(priorityCtx, {
        type: 'doughnut',
        data: {
          labels: ['High', 'Medium', 'Low'],
          datasets: [{
            data: [
              applications.filter(a => a.priority === 'High').length,
              applications.filter(a => a.priority === 'Medium').length,
              applications.filter(a => a.priority === 'Low').length
            ],
            backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
      });
    }

    // 4. Waiting Time Area Chart
    const waitCtx = document.getElementById('waitingChart');
    if (waitCtx) {
      chartsRef.current.wait = new Chart(waitCtx, {
        type: 'line',
        data: {
          labels: ['0-2 days', '3-5 days', '6-10 days', '10+ days'],
          datasets: [{
            label: 'Candidates',
            data: [
              applications.filter(a => a.waitingDays <= 2).length,
              applications.filter(a => a.waitingDays >= 3 && a.waitingDays <= 5).length,
              applications.filter(a => a.waitingDays >= 6 && a.waitingDays <= 10).length,
              applications.filter(a => a.waitingDays > 10).length
            ],
            borderColor: orange,
            backgroundColor: 'rgba(249,115,22,0.15)',
            fill: true
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [applications]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc'? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action) => {
    if (action === 'shortlist') {
      setApplications(prev => prev.map(a =>
        selectedIds.includes(a.id)? {...a, status: 'shortlisted' } : a
      ));
    } else if (action === 'reject') {
      setApplications(prev => prev.map(a =>
        selectedIds.includes(a.id)? {...a, status: 'rejected' } : a
      ));
    }
    setSelectedIds([]);
  };

  const toggleBookmark = (id) => {
    setApplications(prev => prev.map(a =>
      a.id === id? {...a, bookmarked:!a.bookmarked } : a
    ));
  };

  const addNote = (id, note) => {
    setApplications(prev => prev.map(a =>
      a.id === id? {
      ...a,
        notes: [...a.notes, { text: note, date: new Date().toISOString(), author: 'Recruiter' }]
      } : a
    ));
    setNewNote('');
    setShowNoteModal(false);
  };

  const exportCSV = () => {
    const data = filteredApps.map(a => ({
      Name: a.name, Email: a.email, Phone: a.phone, Position: a.position,
      Department: a.department, Experience: a.experience, Location: a.location,
      AppliedDate: a.appliedDate, WaitingDays: a.waitingDays, MatchScore: a.matchScore,
      Status: a.status, Priority: a.priority
    }));
    const csv = [Object.keys(data[0]).join(','),...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pending-applications.csv'; a.click();
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all', status: 'all', department: 'all', experience: 'all',
      location: 'all', education: 'all', skills: [], salaryMin: '', salaryMax: '',
      matchScoreMin: '', source: 'all', customStart: '', customEnd: ''
    });
    setSearch("");
  };

  return (
    <div className="pending-page">
      <div className="page-header glass">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div>
          <h1>Pending Applications</h1>
          <p>Candidates waiting for review and screening decisions</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon"><RefreshCw size={20} /></button>
          <button className="btn-premium" onClick={exportCSV}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: 'Total Pending', value: kpis.total, icon: Users, color: '#f97316', trend: '+5%' },
          { label: 'New Today', value: kpis.newToday, icon: TrendingUp, color: '#22c55e', trend: '+12%' },
          { label: 'High Priority', value: kpis.highPriority, icon: AlertTriangle, color: '#ef4444', trend: '-3%' },
          { label: 'Overdue (7+ days)', value: kpis.overdue, icon: Clock, color: '#f59e0b', trend: '+8%' },
          { label: 'Avg Waiting Time', value: `${kpis.avgWaiting} Days`, icon: Calendar, color: '#3b82f6', trend: '-5%' },
          { label: 'Conversion Risk', value: `${kpis.conversionRisk}%`, icon: AlertTriangle, color: '#ef4444', trend: '+2%' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: kpi.color }}>
                <kpi.icon size={24} color="white" />
              </div>
              <div className="kpi-trend">{kpi.trend}</div>
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card glass">
          <h3><TrendingUp size={20} /> Pending Trend</h3>
          <div className="chart-container"><canvas id="pendingTrend" /></div>
        </div>
        <div className="chart-card glass">
          <h3><BarChart3 size={20} /> By Department</h3>
          <div className="chart-container"><canvas id="deptPending" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Target size={20} /> Priority Distribution</h3>
          <div className="chart-container"><canvas id="priorityChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Clock size={20} /> Waiting Time Analysis</h3>
          <div className="chart-container"><canvas id="waitingChart" /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel glass">
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email, skills, position..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} /> Filters
          </button>
          <button className="btn-secondary" onClick={resetFilters}>Reset</button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="filters-grid"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <select value={filters.dateRange} onChange={e => setFilters({...filters, dateRange: e.target.value})}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="3days">Last 3 Days</option>
                <option value="7days">Last 7 Days</option>
                <option value="14days">Last 14 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="60days">Last 60 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>

              <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="Design">Design</option>
              </select>

              <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="all">All Status</option>
                <option value="Not Reviewed">Not Reviewed</option>
                <option value="Under Review">Under Review</option>
                <option value="Waiting for HR">Waiting for HR</option>
                <option value="Waiting for Interview Setup">Waiting Interview Setup</option>
                <option value="Waiting for Manager Approval">Waiting Manager</option>
              </select>

              <select value={filters.experience} onChange={e => setFilters({...filters, experience: e.target.value})}>
                <option value="all">All Experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-2">1-2 Years</option>
                <option value="2-5">2-5 Years</option>
                <option value="5-10">5-10 Years</option>
                <option value="10+">10+ Years</option>
              </select>

              <input
                type="number"
                placeholder="Min Match Score %"
                value={filters.matchScoreMin}
                onChange={e => setFilters({...filters, matchScoreMin: e.target.value})}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div className="bulk-actions glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span>{selectedIds.length} selected</span>
          <button onClick={() => handleBulkAction('shortlist')}><CheckCircle size={16} /> Bulk Shortlist</button>
          <button onClick={() => handleBulkAction('reject')}><XCircle size={16} /> Bulk Reject</button>
          <button onClick={() => setShowEmailModal(true)}><Mail size={16} /> Bulk Email</button>
          <button onClick={() => setShowScheduleModal(true)}><Calendar size={16} /> Bulk Schedule</button>
          <button onClick={() => setSelectedIds([])}><Trash2 size={16} /> Clear</button>
        </motion.div>
      )}

      {/* Candidates Table */}
      <div className="table-wrapper glass">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={e => setSelectedIds(e.target.checked? paginatedApps.map(a => a.id) : [])} /></th>
              <th>Photo</th>
              <th onClick={() => handleSort('name')}>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th onClick={() => handleSort('position')}>Position</th>
              <th>Department</th>
              <th onClick={() => handleSort('experience')}>Experience</th>
              <th>Skills</th>
              <th onClick={() => handleSort('appliedDate')}>Applied Date</th>
              <th>Waiting Days</th>
              <th onClick={() => handleSort('matchScore')}>Match Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApps.map(app => (
              <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <td><input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() =>
                  setSelectedIds(prev => prev.includes(app.id)? prev.filter(i => i!== app.id) : [...prev, app.id])} /></td>
                <td>
                  <div className="avatar">
                    {app.photo}
                    {app.bookmarked && <Star size={12} fill="#fbbf24" color="#fbbf24" />}
                  </div>
                </td>
                <td>{app.name}</td>
                <td>{app.email}</td>
                <td>{app.phone}</td>
                <td>{app.position}</td>
                <td>{app.department}</td>
                <td>{app.experience}y</td>
                <td>
                  <div className="skills-list">
                    {app.skills.slice(0, 2).map(s => <span key={s} className="skill-chip">{s}</span>)}
                  </div>
                </td>
                <td>{app.appliedDate}</td>
                <td>
                  <span className={`waiting-badge ${app.waitingDays > 7? 'danger' : app.waitingDays > 3? 'warning' : 'success'}`}>
                    {app.waitingDays}d
                  </span>
                </td>
                <td>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${app.matchScore}%` }} />
                    <span>{app.matchScore}%</span>
                  </div>
                </td>
                <td><span className={`status ${app.status}`}>{app.status}</span></td>
                <td>
                  <div className="actions">
                    <button onClick={() => setSelectedCandidate(app)}><Eye size={16} /></button>
                    <button><Mail size={16} /></button>
                    <button><Calendar size={16} /></button>
                    <button onClick={() => toggleBookmark(app.id)}>
                      <Star size={16} fill={app.bookmarked? '#fbbf24' : 'none'} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
        <span>Page {currentPage} of {totalPages} ({filteredApps.length} candidates)</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>

      {/* Candidate Drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCandidate(null)} />
            <motion.div className="drawer glass" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
              <div className="drawer-header">
                <h2>Candidate Profile</h2>
                <button onClick={() => setSelectedCandidate(null)}><X size={20} /></button>
              </div>
              <div className="drawer-content">
                <div className="profile-hero">
                  <div className="profile-avatar">{selectedCandidate.name.charAt(0)}</div>
                  <h3>{selectedCandidate.name}</h3>
                  <p>{selectedCandidate.position}</p>
                  <div className="profile-badges">
                    <span className="badge">{selectedCandidate.matchScore}% Match</span>
                    <span className={`badge priority-${selectedCandidate.priority.toLowerCase()}`}>{selectedCandidate.priority} Priority</span>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Contact Details</h4>
                  <div className="detail-item"><Mail size={16} /> {selectedCandidate.email}</div>
                  <div className="detail-item"><Phone size={16} /> {selectedCandidate.phone}</div>
                  <div className="detail-item"><MapPin size={16} /> {selectedCandidate.location}</div>
                </div>

                <div className="profile-section">
                  <h4>Skills</h4>
                  <div className="skills-grid">
                    {selectedCandidate.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Interview Scores</h4>
                  {Object.entries(selectedCandidate.interviewScore).map(([key, val]) => (
                    <div key={key} className="score-item">
                      <span>{key}</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${val}%` }} />
                        <span>{val}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="profile-section">
                  <h4>Timeline</h4>
                  {selectedCandidate.timeline.map((t, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div>
                        <strong>{t.action}</strong>
                        <p>{t.date} - {t.user}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="drawer-actions">
                  <button className="btn-premium success"><CheckCircle size={18} /> Shortlist</button>
                  <button className="btn-premium"><Calendar size={18} /> Schedule Interview</button>
                  <button className="btn-premium danger"><XCircle size={18} /> Reject</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}