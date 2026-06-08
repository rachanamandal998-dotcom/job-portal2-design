import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, TrendingUp, Target, Award, Send, CheckCircle, XCircle, 
  BarChart3, Users, Calendar, Filter, RefreshCw, Clock, Save, Printer, 
  TrendingDown, AlertTriangle, Zap, Search, Sun, Moon, X, ChevronDown, DollarSign
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/SuccessRate.css";

// Mock data generator - 1000+ applications
const generateApplications = () => {
  const names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Tom Brown", "Emily Davis", "Chris Lee", "Anna Garcia", "David Martinez", "Lisa Anderson", "James Taylor", "Maria Rodriguez", "Robert Wilson", "Linda Brown", "Michael Davis"];
  const positions = ["Frontend Developer", "Backend Engineer", "UI/UX Designer", "Product Manager", "Data Analyst", "DevOps Engineer", "QA Engineer", "Marketing Manager", "Sales Executive", "HR Specialist"];
  const departments = ["IT", "HR", "Marketing", "Finance", "Sales", "Operations", "Design", "Customer Support"];
  const statuses = ["applied", "screening", "assessment", "shortlisted", "interview", "selected", "offer_sent", "joined", "rejected", "withdrawn"];
  const sources = ["LinkedIn", "Website", "Facebook", "Instagram", "Referral", "Indeed", "Naukri", "Internal Database"];
  const locations = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Butwal", "Chitwan", "Biratnagar"];
  const recruiters = ["Rachana Sharma", "Admin User", "HR Team", "Manager A", "Manager B"];
  const skills = ["React", "Node", "Python", "Java", "Flutter", "UI/UX", "Marketing", "Finance", "Data Science", "Cybersecurity"];
  const jobTypes = ["Full Time", "Part Time", "Remote", "Contract", "Internship", "Freelance"];

  return Array.from({ length: 1247 }, (_, i) => {
    const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    return {
      id: i + 1,
      name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
      position: positions[i % positions.length],
      department: departments[i % departments.length],
      location: locations[i % locations.length],
      jobType: jobTypes[i % jobTypes.length],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[i % sources.length],
      recruiter: recruiters[i % recruiters.length],
      experience: Math.floor(Math.random() * 12),
      salary: `${20 + Math.floor(Math.random() * 80)}K-${30 + Math.floor(Math.random() * 80)}K`,
      expectedSalary: 20 + Math.floor(Math.random() * 100),
      offeredSalary: 20 + Math.floor(Math.random() * 100),
      acceptedSalary: 20 + Math.floor(Math.random() * 100),
      appliedDate: date.toISOString().split('T')[0],
      skills: skills.slice(0, Math.floor(Math.random() * 5) + 2),
      education: "BS Computer Science",
      matchScore: Math.floor(Math.random() * 40) + 60,
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

const INITIAL_APPLICATIONS = generateApplications();

export default function SuccessRate() {
  const navigate = useNavigate();
  const [applications] = useState(() => INITIAL_APPLICATIONS);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [showFilters, setShowFilters] = useState(false);
  const chartsRef = useRef({});
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("30days");
  const [deptFilter, setDeptFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [expFilter, setExpFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [matchScoreFilter, setMatchScoreFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState([]);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // Date filter logic
  const getDateFilteredApps = (apps) => {
    const now = new Date();
    const getDaysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return apps.filter(app => {
      const appDate = new Date(app.appliedDate);
      switch(dateFilter) {
        case "today": return appDate.toDateString() === now.toDateString();
        case "yesterday": return appDate.toDateString() === new Date(now.getTime() - 86400000).toDateString();
        case "3days": return appDate >= getDaysAgo(3);
        case "7days": return appDate >= getDaysAgo(7);
        case "14days": return appDate >= getDaysAgo(14);
        case "30days": return appDate >= getDaysAgo(30);
        case "60days": return appDate >= getDaysAgo(60);
        case "90days": return appDate >= getDaysAgo(90);
        case "6months": return appDate >= getDaysAgo(180);
        case "1year": return appDate >= getDaysAgo(365);
        case "custom": 
          if (customDateRange.start && customDateRange.end) {
            return appDate >= new Date(customDateRange.start) && appDate <= new Date(customDateRange.end);
          }
          return true;
        default: return true;
      }
    });
  };

  // Filtered data
  const filteredApps = useMemo(() => {
    let result = getDateFilteredApps(applications);
    
    return result.filter(app => {
      if (searchQuery && !app.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !app.position.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !app.department.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !app.recruiter.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !app.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      
      if (deptFilter !== "all" && app.department !== deptFilter) return false;
      if (locationFilter !== "all" && app.location !== locationFilter) return false;
      if (jobTypeFilter !== "all" && app.jobType !== jobTypeFilter) return false;
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (sourceFilter !== "all" && app.source !== sourceFilter) return false;
      
      if (expFilter !== "all") {
        const exp = app.experience;
        if (expFilter === "fresher" && exp > 0) return false;
        if (expFilter === "1-2" && (exp < 1 || exp > 2)) return false;
        if (expFilter === "2-5" && (exp < 2 || exp > 5)) return false;
        if (expFilter === "5-10" && (exp < 5 || exp > 10)) return false;
        if (expFilter === "10+" && exp < 10) return false;
      }
      
      if (salaryFilter !== "all") {
        const sal = app.expectedSalary;
        if (salaryFilter === "under20" && sal >= 20) return false;
        if (salaryFilter === "20-50" && (sal < 20 || sal > 50)) return false;
        if (salaryFilter === "50-100" && (sal < 50 || sal > 100)) return false;
        if (salaryFilter === "100-200" && (sal < 100 || sal > 200)) return false;
        if (salaryFilter === "200+" && sal < 200) return false;
      }

      if (matchScoreFilter !== "all") {
        const score = app.matchScore;
        if (matchScoreFilter === "0-20" && score > 20) return false;
        if (matchScoreFilter === "20-40" && (score < 20 || score > 40)) return false;
        if (matchScoreFilter === "40-60" && (score < 40 || score > 60)) return false;
        if (matchScoreFilter === "60-80" && (score < 60 || score > 80)) return false;
        if (matchScoreFilter === "80-100" && score < 80) return false;
      }

      if (skillFilter.length > 0 && !skillFilter.some(s => app.skills.includes(s))) return false;
      
      return true;
    });
  }, [applications, searchQuery, dateFilter, deptFilter, locationFilter, jobTypeFilter, statusFilter, sourceFilter, expFilter, salaryFilter, matchScoreFilter, skillFilter, customDateRange]);

  // Metrics
  const metrics = useMemo(() => {
    const total = filteredApps.length;
    const joined = filteredApps.filter(a => a.status === "joined").length;
    const offerSent = filteredApps.filter(a => a.status === "offer_sent").length;
    const interview = filteredApps.filter(a => a.status === "interview").length;
    const selected = filteredApps.filter(a => a.status === "selected").length;
    
    return {
      total,
      shortlisted: filteredApps.filter(a => a.status === "shortlisted").length,
      interview,
      selected,
      offer: offerSent,
      joined,
      rejected: filteredApps.filter(a => a.status === "rejected").length,
      withdrawn: filteredApps.filter(a => a.status === "withdrawn").length,
      avgHiringTime: 12,
      successRate: total > 0 ? Math.round((joined / total) * 100) : 0,
      acceptanceRate: offerSent > 0 ? Math.round((joined / offerSent) * 100) : 0,
      interviewPassRate: interview > 0 ? Math.round((selected / interview) * 100) : 0,
    };
  }, [filteredApps]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());
    const orange = "#f97316";
    const grid = darkMode ? '#374151' : '#f1f5f9';
    const textColor = darkMode ? '#9ca3af' : '#475569';

    const createChart = (id, config) => {
      const ctx = document.getElementById(id);
      if (ctx) chartsRef.current[id] = new Chart(ctx, config);
    };

    // 1. Line Chart - Application Trend
    createChart('trendChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Applications',
          data: [65, 78, 90, 81, 95, 110, 125, 118, 132, 145, 138, 156],
          borderColor: orange,
          backgroundColor: 'rgba(249,115,22,0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: orange,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: textColor } },
          x: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });

    // 2. Doughnut Chart - Status Distribution
    createChart('statusChart', {
      type: 'doughnut',
      data: {
        labels: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Joined', 'Rejected'],
        datasets: [{
          data: [metrics.total, metrics.shortlisted, metrics.interview, metrics.selected, metrics.joined, metrics.rejected],
          backgroundColor: ['#f97316', '#fb923c', '#22c55e', '#10b981', '#059669', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, color: textColor } } }
      }
    });

    // 3. Bar Chart - Department Performance
    const deptData = ['IT', 'HR', 'Marketing', 'Finance', 'Sales', 'Operations', 'Design'].map(dept => ({
      dept,
      apps: filteredApps.filter(a => a.department === dept).length,
      hires: filteredApps.filter(a => a.department === dept && a.status === 'joined').length
    }));

    createChart('deptChart', {
      type: 'bar',
      data: {
        labels: deptData.map(d => d.dept),
        datasets: [
          { label: 'Applications', data: deptData.map(d => d.apps), backgroundColor: '#fb923c', borderRadius: 8 },
          { label: 'Hires', data: deptData.map(d => d.hires), backgroundColor: '#22c55e', borderRadius: 8 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          y: { beginAtZero: true, grid: { color: grid }, ticks: { color: textColor } },
          x: { grid: { display: false }, ticks: { color: textColor } }
        }
      }
    });

    // 4. Radar Chart - Recruitment Performance
    createChart('radarChart', {
      type: 'radar',
      data: {
        labels: ['Communication', 'Technical', 'Problem Solving', 'Leadership', 'Teamwork', 'Culture Fit'],
        datasets: [{
          label: 'Avg Score',
          data: [85, 88, 82, 78, 90, 87],
          borderColor: orange,
          backgroundColor: 'rgba(249,115,22,0.2)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: { color: grid },
            ticks: { color: textColor }
          }
        },
        plugins: { legend: { labels: { color: textColor } } }
      }
    });

    // 5. Polar Area - Department Comparison
    createChart('polarChart', {
      type: 'polarArea',
      data: {
        labels: ['IT', 'HR', 'Marketing', 'Sales', 'Finance'],
        datasets: [{
          data: [45, 12, 18, 22, 8],
          backgroundColor: ['#f97316', '#fb923c', '#22c55e', '#3b82f6', '#8b5cf6']
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } }
      }
    });

    // 6. Area Chart - Monthly Growth
    createChart('areaChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Hiring Growth',
          data: [20, 35, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180],
          borderColor: orange,
          backgroundColor: 'rgba(249,115,22,0.15)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: grid }, ticks: { color: textColor } }, x: { ticks: { color: textColor } } }
      }
    });

    // 7. Stacked Bar - Hiring Funnel
    createChart('funnelChart', {
      type: 'bar',
      data: {
        labels: ['Applied', 'Screened', 'Assessment', 'Shortlisted', 'Interview', 'Selected', 'Joined'],
        datasets: [{
          data: [300, 240, 180, 100, 50, 30, 25],
          backgroundColor: orange,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { 
          x: { grid: { color: grid }, ticks: { color: textColor } }, 
          y: { ticks: { color: textColor } } 
        }
      }
    });

    // 8. Pie Chart - Candidate Sources
    createChart('sourceChart', {
      type: 'pie',
      data: {
        labels: ['LinkedIn', 'Website', 'Facebook', 'Instagram', 'Referral', 'Indeed', 'Naukri', 'Internal'],
        datasets: [{
          data: [145, 89, 67, 45, 98, 76, 54, 23],
          backgroundColor: ['#0a66c2', '#f97316', '#1877f2', '#e4405f', '#22c55e', '#003A9B', '#2563eb', '#8b5cf6']
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { position: 'right', labels: { color: textColor } } }
      }
    });

    // 9. Bubble Chart - Skills Demand
    createChart('skillsChart', {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Skills Demand',
          data: [
            { x: 1, y: 85, r: 25 }, { x: 2, y: 72, r: 20 }, { x: 3, y: 68, r: 18 },
            { x: 4, y: 75, r: 22 }, { x: 5, y: 60, r: 15 }, { x: 6, y: 55, r: 12 },
            { x: 7, y: 48, r: 10 }, { x: 8, y: 42, r: 8 }, { x: 9, y: 38, r: 7 }, { x: 10, y: 35, r: 6 }
          ],
          backgroundColor: 'rgba(249,115,22,0.6)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false } }
      }
    });

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [filteredApps, darkMode, metrics]);

  const exportCSV = () => {
    const csv = [
      ['Name', 'Email', 'Position', 'Department', 'Status', 'Applied Date', 'Experience', 'Salary', 'Job Type', 'Match Score'],
    ...filteredApps.map(a => [a.name, a.email, a.position, a.department, a.status, a.appliedDate, a.experience, a.expectedSalary, a.jobType, a.matchScore])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'recruitment-analytics.csv'; a.click();
  };

  const resetFilters = () => {
    setDateFilter("30days");
    setDeptFilter("all");
    setLocationFilter("all");
    setJobTypeFilter("all");
    setStatusFilter("all");
    setSourceFilter("all");
    setExpFilter("all");
    setSalaryFilter("all");
    setMatchScoreFilter("all");
    setSkillFilter([]);
    setSearchQuery("");
    setCustomDateRange({ start: '', end: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`offers-page ${darkMode ? 'dark' : ''}`}
    >
      {/* HEADER - Formatted perfectly with absolute text centering rules */}
      <header className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => window.history.back()}>
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h1>
              <span className="header-icon"><Target size={24} /></span>
              Recruitment Analytics
            </h1>
            <p>Complete hiring performance dashboard</p>
          </div>
        </div>
        <div className="header-right">
        
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="back-btn" onClick={exportCSV} style={{ width: 'auto' }}>
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      {/* STATS CARDS / KPI GRID */}
      <section className="stats-grid">
        {[
          { label: 'Total Applications', value: metrics.total, icon: <Users />, color: '#f97316' },
          { label: 'Shortlisted', value: metrics.shortlisted, icon: <CheckCircle />, color: '#22c55e' },
          { label: 'Interviews', value: metrics.interview, icon: <Calendar />, color: '#3b82f6' },
          { label: 'Selected', value: metrics.selected, icon: <Award />, color: '#10b981' },
          { label: 'Offers Sent', value: metrics.offer, icon: <Send />, color: '#fbbf24' },
          { label: 'Hired', value: metrics.joined, icon: <Users />, color: '#059669' },
          { label: 'Rejected', value: metrics.rejected, icon: <XCircle />, color: '#ef4444' },
          { label: 'Success Rate', value: `${metrics.successRate}%`, icon: <Target />, color: '#8b5cf6' },
          { label: 'Avg Hiring Time', value: '12 Days', icon: <Clock />, color: '#fb923c' },
          { label: 'Acceptance Rate', value: `${metrics.acceptanceRate}%`, icon: <TrendingUp />, color: '#14b8a6' },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            className="stat-card"
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

      {/* FILTERS SECTION */}
      <section className="filters-section">
        <div className="filter-row-top">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search candidates, positions, departments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-btn ${showFilters ? 'active' : ''}`}
            >
              <Filter size={16} />
              Advanced Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button onClick={resetFilters} className="reset-btn">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="filter-grid"
            >
              <div className="filter-item">
                <label>Timeframe</label>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="3days">Last 3 Days</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="14days">Last 14 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="60days">Last 60 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div className="filter-item">
                    <label>Start Date</label>
                    <input type="date" value={customDateRange.start} onChange={e => setCustomDateRange({...customDateRange, start: e.target.value})} />
                  </div>
                  <div className="filter-item">
                    <label>End Date</label>
                    <input type="date" value={customDateRange.end} onChange={e => setCustomDateRange({...customDateRange, end: e.target.value})} />
                  </div>
                </>
              )}

              <div className="filter-item">
                <label>Department</label>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Location</label>
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                  <option value="all">All Locations</option>
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Pokhara">Pokhara</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Butwal">Butwal</option>
                  <option value="Chitwan">Chitwan</option>
                  <option value="Biratnagar">Biratnagar</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Job Type</label>
                <select value={jobTypeFilter} onChange={e => setJobTypeFilter(e.target.value)}>
                  <option value="all">All Job Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Experience</label>
                <select value={expFilter} onChange={e => setExpFilter(e.target.value)}>
                  <option value="all">All Experience</option>
                  <option value="fresher">Fresher</option>
                  <option value="1-2">1-2 Years</option>
                  <option value="2-5">2-5 Years</option>
                  <option value="5-10">5-10 Years</option>
                  <option value="10+">10+ Years</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="assessment">Assessment</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="selected">Selected</option>
                  <option value="offer_sent">Offer Sent</option>
                  <option value="joined">Joined</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Source</label>
                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                  <option value="all">All Sources</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Website">Website</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Naukri">Naukri</option>
                  <option value="Internal Database">Internal Database</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Salary Range</label>
                <select value={salaryFilter} onChange={e => setSalaryFilter(e.target.value)}>
                  <option value="all">All Salaries</option>
                  <option value="under20">Under 20K</option>
                  <option value="20-50">20K-50K</option>
                  <option value="50-100">50K-100K</option>
                  <option value="100-200">100K-200K</option>
                  <option value="200+">200K+</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Match Score</label>
                <select value={matchScoreFilter} onChange={e => setMatchScoreFilter(e.target.value)}>
                  <option value="all">All Match Scores</option>
                  <option value="0-20">0-20%</option>
                  <option value="20-40">20-40%</option>
                  <option value="40-60">40-60%</option>
                  <option value="60-80">60-80%</option>
                  <option value="80-100">80-100%</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* CHARTS GRID */}
      <section className="charts-grid">
        <div className="chart-card chart-card-wide">
          <h3><TrendingUp size={16} /> Application Trend</h3>
          <div className="chart-wrapper"><canvas id="trendChart" /></div>
        </div>
        <div className="chart-card">
          <h3><BarChart3 size={16} /> Status Distribution</h3>
          <div className="chart-wrapper"><canvas id="statusChart" /></div>
        </div>
        <div className="chart-card">
          <h3><Users size={16} /> Department Performance</h3>
          <div className="chart-wrapper"><canvas id="deptChart" /></div>
        </div>
        <div className="chart-card">
          <h3><Target size={16} /> Recruitment Performance</h3>
          <div className="chart-wrapper"><canvas id="radarChart" /></div>
        </div>
        <div className="chart-card">
          <h3><Award size={16} /> Department Comparison</h3>
          <div className="chart-wrapper"><canvas id="polarChart" /></div>
        </div>
        <div className="chart-card">
          <h3><TrendingUp size={16} /> Monthly Growth</h3>
          <div className="chart-wrapper"><canvas id="areaChart" /></div>
        </div>
        <div className="chart-card chart-card-wide">
          <h3><Filter size={16} /> Hiring Funnel</h3>
          <div className="chart-wrapper"><canvas id="funnelChart" /></div>
        </div>
        <div className="chart-card">
          <h3><Users size={16} /> Candidate Sources</h3>
          <div className="chart-wrapper"><canvas id="sourceChart" /></div>
        </div>
        <div className="chart-card">
          <h3><Award size={16} /> Skills Demand</h3>
          <div className="chart-wrapper"><canvas id="skillsChart" /></div>
        </div>
      </section>

      {/* AI INSIGHTS PANEL */}
      <section className="insights-panel">
        <h3><Zap size={18} /> AI Hiring Insights</h3>
        <div className="insights-grid">
          <div className="insight-item-box success">
            <span className="insight-badge-tag">High Performance</span>
            <p>Marketing department has highest conversion rate at 34%</p>
          </div>
          <div className="insight-item-box info">
            <span className="insight-badge-tag">Trending</span>
            <p>React Developers receive 45% more interviews this quarter</p>
          </div>
          <div className="insight-item-box warning">
            <span className="insight-badge-tag">Alert</span>
            <p>Interview stage taking 12 days avg, 3 days above target</p>
          </div>
          <div className="insight-item-box info">
            <span className="insight-badge-tag">Forecast</span>
            <p>Projected 28% increase in applications next 30 days</p>
          </div>
        </div>
      </section>

      {/* BOTTLENECK DETECTION */}
      <section className="bottleneck-section">
        <h3><AlertTriangle size={18} /> Bottleneck Detection</h3>
        <div className="bottleneck-list-container">
          <div className="bottleneck-item-row warning">
            <AlertTriangle size={18} />
            <div className="bottleneck-text-info">
              <strong>Slow Review Stage</strong>
              <p>Applications taking 8+ days in screening phase</p>
            </div>
          </div>
          <div className="bottleneck-item-row danger">
            <AlertTriangle size={18} />
            <div className="bottleneck-text-info">
              <strong>High Rejection Rate</strong>
              <p>Technical round rejection at 67% - review criteria</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}