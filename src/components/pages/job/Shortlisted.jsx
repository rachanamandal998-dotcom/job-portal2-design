import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Download, Eye, Calendar, Filter, CheckCircle, XCircle,
  Star, FileText, Send, Clock, Users, TrendingUp, Target, Award, MessageSquare,
  UserPlus, Phone, Mail, MapPin, Briefcase, GraduationCap, Trash2, Edit3,
  MoreVertical, Sun, Moon, RefreshCw, Save, Printer, Move, X, AlertTriangle
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/Shortlisted.css";

// Generate pipeline data
const generatePipelineData = () => {
  const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown", "Emily Davis", "Chris Lee", "Anna Garcia", "David Martinez", "Lisa Anderson", "James Taylor", "Maria Rodriguez", "Robert Wilson", "Linda Brown", "Michael Davis"];
  const positions = ["Frontend Developer", "Backend Engineer", "UI/UX Designer", "Product Manager", "Data Analyst", "DevOps Engineer", "QA Engineer", "Marketing Manager", "Sales Executive", "HR Specialist"];
  const departments = ["IT", "HR", "Marketing", "Finance", "Sales", "Operations", "Design"];
  const priorities = ["High", "Medium", "Low"];
  const skills = ["React", "Node", "Python", "Java", "Flutter", "PHP", "UI/UX", "Marketing", "Finance", "Sales"];
  const locations = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Butwal", "Chitwan"];

  const createCandidates = (stage, count) => Array.from({ length: count }, (_, i) => {
    const id = `${stage}-${i + 1}`;
    return {
      id,
      name: names[(i * 3) % names.length],
      email: `${names[(i * 3) % names.length].toLowerCase().replace(' ', '.')}@email.com`,
      phone: `+977-98${Math.floor(Math.random() * 10000000)}`,
      position: positions[i % positions.length],
      department: departments[i % departments.length],
      location: locations[i % locations.length],
      experience: Math.floor(Math.random() * 10) + 1,
      skills: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, j) => skills[(i + j) % skills.length]),
      matchScore: Math.floor(Math.random() * 30) + 70,
      interviewDate: stage.includes('Interview')? new Date(Date.now() + Math.random() * 14 * 86400000).toISOString().split('T')[0] : '',
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      stage,
      appliedDate: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString().split('T')[0],
      bookmarked: Math.random() > 0.8,
      notes: [],
      interviewScore: {
        communication: Math.floor(Math.random() * 40) + 60,
        technical: Math.floor(Math.random() * 40) + 60,
        problemSolving: Math.floor(Math.random() * 40) + 60,
        leadership: Math.floor(Math.random() * 40) + 60,
        teamwork: Math.floor(Math.random() * 40) + 60,
        cultureFit: Math.floor(Math.random() * 40) + 60
      },
      education: [{ degree: "BS Computer Science", school: "TU", year: "2020" }],
      workExp: [{ role: positions[i % positions.length], company: "Tech Corp", duration: "2020-2023" }]
    };
  });

  return {
    shortlisted: createCandidates('shortlisted', 28),
    interview_scheduled: createCandidates('interview_scheduled', 18),
    interview_completed: createCandidates('interview_completed', 12),
    technical_round: createCandidates('technical_round', 8),
    hr_round: createCandidates('hr_round', 6),
    offer_sent: createCandidates('offer_sent', 4),
    hired: createCandidates('hired', 15),
    rejected: createCandidates('rejected', 9)
  };
};

export default function Shortlisted() {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState(generatePipelineData);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const chartsRef = useRef({});

  const [filters, setFilters] = useState({
    dateRange: 'all',
    department: 'all',
    stage: 'all',
    priority: 'all',
    experience: 'all',
    bookmarkedOnly: false
  });

  const columns = [
    { key: "shortlisted", title: "Shortlisted", color: "#3b82f6" },
    { key: "interview_scheduled", title: "Interview Scheduled", color: "#f97316" },
    { key: "interview_completed", title: "Interview Completed", color: "#8b5cf6" },
    { key: "technical_round", title: "Technical Round", color: "#06b6d4" },
    { key: "hr_round", title: "HR Round", color: "#f59e0b" },
    { key: "offer_sent", title: "Offer Sent", color: "#fbbf24" },
    { key: "hired", title: "Hired", color: "#22c55e" },
    { key: "rejected", title: "Rejected", color: "#ef4444" }
  ];

  // Filter pipeline
  const filteredPipeline = useMemo(() => {
    return Object.keys(pipeline).reduce((acc, stage) => {
      acc[stage] = pipeline[stage].filter(candidate => {
        if (search) {
          const s = search.toLowerCase();
          const matches = candidate.name.toLowerCase().includes(s) ||
                         candidate.position.toLowerCase().includes(s) ||
                         candidate.skills.some(sk => sk.toLowerCase().includes(s)) ||
                         candidate.email.toLowerCase().includes(s);
          if (!matches) return false;
        }
        if (filters.department!== 'all' && candidate.department!== filters.department) return false;
        if (filters.priority!== 'all' && candidate.priority!== filters.priority) return false;
        if (filters.stage!== 'all' && candidate.stage!== filters.stage) return false;
        if (filters.bookmarkedOnly &&!candidate.bookmarked) return false;

        if (filters.experience!== 'all') {
          const exp = candidate.experience;
          if (filters.experience === 'fresher' && exp > 0) return false;
          if (filters.experience === '1-2' && (exp < 1 || exp > 2)) return false;
          if (filters.experience === '2-5' && (exp < 2 || exp > 5)) return false;
          if (filters.experience === '5-10' && (exp < 5 || exp > 10)) return false;
          if (filters.experience === '10+' && exp < 10) return false;
        }
        return true;
      });
      return acc;
    }, {});
  }, [pipeline, search, filters]);

  // KPIs
  const kpis = useMemo(() => {
    const total = Object.values(pipeline).flat().length;
    const hired = pipeline.hired.length;
    const rejected = pipeline.rejected.length;
    const inProcess = total - hired - rejected;
    return {
      totalShortlisted: pipeline.shortlisted.length,
      inInterview: pipeline.interview_scheduled.length + pipeline.interview_completed.length + pipeline.technical_round.length + pipeline.hr_round.length,
      hired: pipeline.hired.length,
      rejected: pipeline.rejected.length,
      offerConversion: Math.round((pipeline.hired.length / (pipeline.offer_sent.length + pipeline.hired.length)) * 100) || 0,
      avgTimeToHire: 14,
      conversionRate: Math.round((hired / total) * 100) || 0
    };
  }, [pipeline]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Charts
  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    const orange = "#f97316";
    const grid = darkMode? '#374151' : '#fff7ed';

    // Funnel Chart
    const funnelCtx = document.getElementById('funnelChart');
    if (funnelCtx) {
      chartsRef.current.funnel = new Chart(funnelCtx, {
        type: 'bar',
        data: {
          labels: ['Shortlisted', 'Interview', 'Technical', 'HR Round', 'Offer', 'Hired'],
          datasets: [{
            label: 'Candidates',
            data: [
              pipeline.shortlisted.length,
              pipeline.interview_scheduled.length + pipeline.interview_completed.length,
              pipeline.technical_round.length,
              pipeline.hr_round.length,
              pipeline.offer_sent.length,
              pipeline.hired.length
            ],
            backgroundColor: orange,
            borderRadius: 8
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    // Stage Distribution Doughnut
    const stageCtx = document.getElementById('stageChart');
    if (stageCtx) {
      chartsRef.current.stage = new Chart(stageCtx, {
        type: 'doughnut',
        data: {
          labels: columns.map(c => c.title),
          datasets: [{
            data: columns.map(c => filteredPipeline[c.key].length),
            backgroundColor: columns.map(c => c.color)
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%' }
      });
    }

    // Hiring Trend Line
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [{
            label: 'Moved to Next Stage',
            data: [45, 52, 48, 61, 55, 67],
            borderColor: orange,
            backgroundColor: 'rgba(249,115,22,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Department Bar
    const deptCtx = document.getElementById('deptChart');
    if (deptCtx) {
      const depts = ['IT', 'HR', 'Marketing', 'Finance', 'Sales', 'Design'];
      chartsRef.current.dept = new Chart(deptCtx, {
        type: 'bar',
        data: {
          labels: depts,
          datasets: [{
            label: 'In Pipeline',
            data: depts.map(d => Object.values(filteredPipeline).flat().filter(c => c.department === d).length),
            backgroundColor: orange
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Offer Conversion Gauge
    const offerCtx = document.getElementById('offerChart');
    if (offerCtx) {
      chartsRef.current.offer = new Chart(offerCtx, {
        type: 'doughnut',
        data: {
          labels: ['Accepted', 'Declined'],
          datasets: [{
            data: [kpis.offerConversion, 100 - kpis.offerConversion],
            backgroundColor: ['#22c55e', '#e5e7eb']
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
      });
    }

    // Time in Stage
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx) {
      chartsRef.current.time = new Chart(timeCtx, {
        type: 'bar',
        data: {
          labels: columns.slice(0, 6).map(c => c.title),
          datasets: [{
            label: 'Avg Days',
            data: [2, 5, 3, 4, 2, 1],
            backgroundColor: orange
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [filteredPipeline, kpis, darkMode]);

  const handleDragStart = (e, candidate, sourceColumn) => {
    setDraggedItem({ candidate, sourceColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.sourceColumn === targetColumn) return;

    setPipeline(prev => {
      const newPipeline = {...prev };
      newPipeline[draggedItem.sourceColumn] = prev[draggedItem.sourceColumn].filter(c => c.id!== draggedItem.candidate.id);
      newPipeline[targetColumn] = [...prev[targetColumn], {...draggedItem.candidate, stage: targetColumn }];
      return newPipeline;
    });
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleAction = (action, candidateId, columnKey) => {
    if (action === 'view') {
      const candidate = pipeline[columnKey].find(c => c.id === candidateId);
      setSelectedCandidate(candidate);
    } else if (action === 'reject') {
      moveToStage(candidateId, columnKey, 'rejected');
    } else if (action === 'hire') {
      moveToStage(candidateId, columnKey, 'hired');
    }
  };

  const moveToStage = (candidateId, fromColumn, toColumn) => {
    setPipeline(prev => {
      const candidate = prev[fromColumn].find(c => c.id === candidateId);
      return {
     ...prev,
        [fromColumn]: prev[fromColumn].filter(c => c.id!== candidateId),
        [toColumn]: [...prev[toColumn], {...candidate, stage: toColumn }]
      };
    });
  };

  const toggleBookmark = (candidateId, columnKey) => {
    setPipeline(prev => ({
   ...prev,
      [columnKey]: prev[columnKey].map(c =>
        c.id === candidateId? {...c, bookmarked:!c.bookmarked } : c
      )
    }));
  };

  const addNote = (candidateId, columnKey, note) => {
    setPipeline(prev => ({
   ...prev,
      [columnKey]: prev[columnKey].map(c =>
        c.id === candidateId? {
       ...c,
          notes: [...c.notes, { text: note, date: new Date().toISOString(), author: 'Recruiter' }]
        } : c
      )
    }));
    setNewNote('');
    setShowNoteModal(false);
  };

  const exportCSV = () => {
    const data = Object.values(filteredPipeline).flat().map(c => ({
      Name: c.name, Email: c.email, Phone: c.phone, Position: c.position,
      Department: c.department, Experience: c.experience, Skills: c.skills.join(';'),
      MatchScore: c.matchScore, Stage: c.stage, Priority: c.priority
    }));
    const csv = [Object.keys(data[0]).join(','),...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shortlisted-pipeline.csv'; a.click();
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'all', department: 'all', stage: 'all', priority: 'all',
      experience: 'all', bookmarkedOnly: false
    });
    setSearch("");
  };

  return (
    <div className={`shortlisted-page ${darkMode? 'dark' : ''}`}>
      <div className="page-header glass">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div>
          <h1>Shortlisted Pipeline</h1>
          <p>Manage candidates across hiring stages with drag & drop workflow</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-icon"><RefreshCw size={20} /></button>
          <button className="btn-premium" onClick={exportCSV}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {[
          { label: 'Total Shortlisted', value: kpis.totalShortlisted, icon: Users, color: '#3b82f6', trend: '+8%' },
          { label: 'In Interview', value: kpis.inInterview, icon: Calendar, color: '#f97316', trend: '+12%' },
          { label: 'Hired', value: kpis.hired, icon: Award, color: '#22c55e', trend: '+15%' },
          { label: 'Rejected', value: kpis.rejected, icon: XCircle, color: '#ef4444', trend: '-5%' },
          { label: 'Offer Conversion', value: `${kpis.offerConversion}%`, icon: Target, color: '#8b5cf6', trend: '+3%' },
          { label: 'Avg Time to Hire', value: `${kpis.avgTimeToHire} Days`, icon: Clock, color: '#f59e0b', trend: '-8%' },
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

      {/* Filters */}
      <div className="filters-panel glass">
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, position, skills, email..."
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
                <option value="3days">Last 3 Days</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>

              <select value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
              </select>

              <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
                <option value="all">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              <select value={filters.experience} onChange={e => setFilters({...filters, experience: e.target.value})}>
                <option value="all">All Experience</option>
                <option value="fresher">Fresher</option>
                <option value="1-2">1-2 Years</option>
                <option value="2-5">2-5 Years</option>
                <option value="5-10">5-10 Years</option>
                <option value="10+">10+ Years</option>
              </select>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.bookmarkedOnly}
                  onChange={e => setFilters({...filters, bookmarkedOnly: e.target.checked})}
                />
                Bookmarked Only
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analytics Charts */}
      <div className="charts-grid">
        <div className="chart-card glass">
          <h3><TrendingUp size={20} /> Pipeline Funnel</h3>
          <div className="chart-container"><canvas id="funnelChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><BarChart3 size={20} /> Stage Distribution</h3>
          <div className="chart-container"><canvas id="stageChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Users size={20} /> Hiring Trend</h3>
          <div className="chart-container"><canvas id="trendChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Target size={20} /> Department Pipeline</h3>
          <div className="chart-container"><canvas id="deptChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Award size={20} /> Offer Conversion</h3>
          <div className="chart-container"><canvas id="offerChart" /></div>
        </div>
        <div className="chart-card glass">
          <h3><Clock size={20} /> Time in Stage</h3>
          <div className="chart-container"><canvas id="timeChart" /></div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="insights-panel glass">
        <h3><AlertTriangle size={24} /> AI Hiring Insights</h3>
        <div className="insights-grid">
          <div className="insight-card warning">
            <div className="insight-badge">High Risk</div>
            <p>🔥 38% candidates stuck at Technical Round for 7+ days</p>
          </div>
          <div className="insight-card danger">
            <div className="insight-badge">Alert</div>
            <p>⚠ HR Round has highest drop-off rate at 45%</p>
          </div>
          <div className="insight-card success">
            <div className="insight-badge">Trending</div>
            <p>🚀 IT department has fastest hiring cycle (8 days avg)</p>
          </div>
          <div className="insight-card info">
            <div className="insight-badge">Insight</div>
            <p>📉 18% candidates rejected due to interview delays</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="pipeline-board">
        {columns.map(col => (
          <div
            key={col.key}
            className={`pipeline-column glass ${dragOverColumn === col.key? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className="column-header" style={{ borderTop: `4px solid ${col.color}` }}>
              <h3>{col.title}</h3>
              <span className="count-badge">{filteredPipeline[col.key].length}</span>
            </div>
            <div className="candidate-cards">
              <AnimatePresence>
                {filteredPipeline[col.key].length === 0? (
                  <div className="empty-column">
                    <Users size={32} />
                    <p>No candidates</p>
                  </div>
                ) : filteredPipeline[col.key].map(candidate => (
                  <motion.div
                    key={candidate.id}
                    className="candidate-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate, col.key)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(249,115,22,0.25)' }}
                    whileDrag={{ scale: 1.05, rotate: 3 }}
                    layout
                  >
                    <div className="card-header">
                      <div className="card-avatar">{candidate.name.charAt(0)}</div>
                      <div className="card-badges">
                        <span className={`priority-badge ${candidate.priority.toLowerCase()}`}>
                          {candidate.priority}
                        </span>
                        {candidate.bookmarked && <Star size={16} fill="#fbbf24" color="#fbbf24" />}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-name">{candidate.name}</div>
                      <div className="card-role">{candidate.position}</div>
                      <div className="card-meta">
                        <span><Briefcase size={12} /> {candidate.experience}y</span>
                        <span><MapPin size={12} /> {candidate.location}</span>
                      </div>
                      <div className="card-skills">
                        {candidate.skills.slice(0, 3).map(s => (
                          <span key={s} className="skill-chip">{s}</span>
                        ))}
                      </div>
                      <div className="card-match">
                        <div className="match-bar">
                          <div className="match-fill" style={{ width: `${candidate.matchScore}%` }} />
                        </div>
                        <span>{candidate.matchScore}% Match</span>
                      </div>
                      {candidate.interviewDate && (
                        <div className="card-date">
                          <Calendar size={12} /> {candidate.interviewDate}
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      <button onClick={() => setSelectedCandidate(candidate)}><Eye size={16} /></button>
                      <button><Mail size={16} /></button>
                      <button onClick={() => toggleBookmark(candidate.id, col.key)}>
                        <Star size={16} fill={candidate.bookmarked? '#fbbf24' : 'none'} />
                      </button>
                      <button className="hire-btn" onClick={() => handleAction('hire', candidate.id, col.key)}>
                        Hire
                      </button>
                      <button className="reject-btn" onClick={() => handleAction('reject', candidate.id, col.key)}>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Detail Drawer */}
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
                    <span className="badge match">{selectedCandidate.matchScore}% Match</span>
                    <span className={`badge priority-${selectedCandidate.priority.toLowerCase()}`}>
                      {selectedCandidate.priority} Priority
                    </span>
                  </div>
                </div>

                <div className="profile-section">
                  <h4><Mail size={18} /> Contact Details</h4>
                  <div className="detail-item"><Mail size={16} /> {selectedCandidate.email}</div>
                  <div className="detail-item"><Phone size={16} /> {selectedCandidate.phone}</div>
                  <div className="detail-item"><MapPin size={16} /> {selectedCandidate.location}</div>
                </div>

                <div className="profile-section">
                  <h4><Award size={18} /> Skills</h4>
                  <div className="skills-grid">
                    {selectedCandidate.skills.map(s => <span key={s} className="skill-chip">{s}</span>)}
                  </div>
                </div>

                <div className="profile-section">
                  <h4><Target size={18} /> Interview Scores</h4>
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
                  <h4><FileText size={18} /> Timeline</h4>
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
                  <button className="btn-premium success" onClick={() => moveToStage(selectedCandidate.id, selectedCandidate.stage, 'hired')}>
                    <CheckCircle size={18} /> Hire
                  </button>
                  <button className="btn-premium" onClick={() => setShowScheduleModal(true)}>
                    <Calendar size={18} /> Schedule
                  </button>
                  <button className="btn-premium danger" onClick={() => moveToStage(selectedCandidate.id, selectedCandidate.stage, 'rejected')}>
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}