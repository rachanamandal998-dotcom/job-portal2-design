import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Chart from "chart.js/auto";
import {
  Calendar, Video, MapPin, Search, ChevronDown, Filter, FileText, 
  Download, Printer, Bell, CheckCircle, Clock, AlertTriangle, 
  XCircle, Award, User, Briefcase, Mail, BarChart3, TrendingUp, 
  RefreshCw, Check, Eye, HelpCircle, ChevronLeft, ChevronRight
} from "lucide-react";

// ==========================================
// 1. GENERATE 100+ REALISTIC DUMMY DATA RECORDS
// ==========================================
const candidateNames = ["Aarav Sharma", "Rachana Thapa", "Siddharth Joshi", "Priya Adhikari", "Amit Shrestha", "Sneha Basnet", "Rohan Mahajan", "Kriti Karki", "Niranjan Chaudhary", "Deepika Rai"];
const companies = ["Tech Innovations", "Creative Studio Ltd", "Global Marketing Corp", "Fintech Solutions", "Talent Sync HR", "Apex Sales Group", "NLT Production", "SindhuliBazar App", "Kathmandu Digital", "Himalayan Tech"];
const positions = {
  Tech: ["Frontend Developer", "Backend Engineer", "Full Stack Architect", "DevOps Specialist", "React Developer"],
  Design: ["UI/UX Designer", "Product Designer", "Brand Identity Specialist", "Visual Mockup Artist"],
  Marketing: ["SEO Growth Hacker", "Digital Media Manager", "Content Specialist", "Brand Strategist"],
  Finance: ["Financial Analyst", "Risk Management Lead", "Accounts Ledger Executive", "Corporate Accountant"],
  HR: ["Technical Recruiter", "Talent Acquisition Partner", "HR Operations Generalist"],
  Sales: ["Enterprise Account Executive", "Inbound Sales Representative", "Business Development Manager"]
};
const interviewers = ["Sarah Jenkins (HR Lead)", "Alex Mercer (Engineering Principal)", "Nikita Shrestha (Design Director)", "Binod Dhakal (Product Manager)", "Elena Rostova (VP Finance)"];
const modes = ["Online", "Physical", "Hybrid"];
const statuses = ["Scheduled", "Completed", "Rescheduled", "Missed", "Cancelled"];
const categories = ["Tech", "Design", "Marketing", "Finance", "HR", "Sales"];

const generateDummyData = () => {
  const records = [];
  const baseDate = new Date(); // May 2026 current framework

  for (let i = 1; i <= 115; i++) {
    const category = categories[i % categories.length];
    const posList = positions[category];
    const position = posList[i % posList.length];
    
    // Distribute dates back over the last 12 months and slightly into future weeks
    const daysOffset = (i % 2 === 0 ? -(i * 2.5) : (i % 7)) + 2; 
    const interviewDate = new Date();
    interviewDate.setDate(baseDate.getDate() + daysOffset);

    const candName = candidateNames[i % candidateNames.length];
    const company = companies[i % companies.length];

    records.push({
      id: `INT-2026-${1000 + i}`,
      candidateName: candName,
      email: `${candName.toLowerCase().replace(" ", ".")}@example.com`,
      company: company,
      position: position,
      category: category,
      date: interviewDate,
      time: `${9 + (i % 8)}:${i % 2 === 0 ? "00" : "30"} AM`,
      mode: modes[i % modes.length],
      interviewer: interviewers[i % interviewers.length],
      status: statuses[i % statuses.length],
      notes: `Evaluation session step ${i % 3 + 1}. Focus on core tech stack frameworks and cultural index metrics.`,
      score: 65 + (i % 35) // Score out of 100
    });
  }
  return records;
};

const INITIAL_RECORDS = generateDummyData();

export default function InterviewCalls() {
  // App Core Pipeline States
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all"); // all | candidateName | company | position | id | email

  // Advanced Multi-Tiered Filtering states
  const [dateFilter, setDateFilter] = useState("AllTime"); // Today, Yesterday, Last7Days, Last30Days, Last3Months, Custom, etc.
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [weekFilter, setWeekFilter] = useState("AllWeeks"); // CurrentWeek, PreviousWeek, Week1..4
  const [monthFilter, setMonthFilter] = useState("AllMonths"); // Jan..Dec, CurrentMonth, PreviousMonth
  const [yearFilter, setYearFilter] = useState("AllYears"); // CurrentYear, PreviousYear
  const [dayFilter, setDayFilter] = useState("AllDays"); // Monday..Sunday
  const [typeFilter, setTypeFilter] = useState("AllModes"); // Online, Physical, Hybrid
  const [statusFilter, setStatusFilter] = useState("AllStatuses"); // Scheduled, Completed, etc.
  const [categoryFilter, setCategoryFilter] = useState("AllCategories"); // Tech, Design, etc.

  // UI States
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("analytics"); // analytics | table | timeline
  const itemsPerPage = 8;

  // Chart References
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const horizontalBarRef = useRef(null);
  const areaChartRef = useRef(null);
  const activeCharts = useRef({});

  // Reset page layout when filters update
  useEffect(() => { setCurrentPage(1); }, [searchQuery, searchField, dateFilter, customStartDate, customEndDate, weekFilter, monthFilter, yearFilter, dayFilter, typeFilter, statusFilter, categoryFilter]);

  // ==========================================
  // 2. COMPREHENSIVE FILTER LOGIC IMPLEMENTATION
  // ==========================================
  const filteredRecords = useMemo(() => {
    const today = new Date();
    
    return records.filter((item) => {
      const itemDate = new Date(item.date);
      
      // Global Search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        if (searchField === "all") {
          const matchAll = item.candidateName.toLowerCase().includes(query) ||
                           item.company.toLowerCase().includes(query) ||
                           item.position.toLowerCase().includes(query) ||
                           item.id.toLowerCase().includes(query) ||
                           item.email.toLowerCase().includes(query);
          if (!matchAll) return false;
        } else if (!item[searchField]?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 1. Date Filters
      if (dateFilter !== "AllTime") {
        const diffTime = today - itemDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "Today" && itemDate.toDateString() !== today.toDateString()) return false;
        if (dateFilter === "Yesterday") {
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          if (itemDate.toDateString() !== yesterday.toDateString()) return false;
        }
        if (dateFilter === "Last2Days" && (diffDays < 0 || diffDays > 2)) return false;
        if (dateFilter === "Last3Days" && (diffDays < 0 || diffDays > 3)) return false;
        if (dateFilter === "Last7Days" && (diffDays < 0 || diffDays > 7)) return false;
        if (dateFilter === "Last30Days" && (diffDays < 0 || diffDays > 30)) return false;
        if (dateFilter === "Last3Months" && (diffDays < 0 || diffDays > 90)) return false;
        if (dateFilter === "Last6Months" && (diffDays < 0 || diffDays > 180)) return false;
        if (dateFilter === "Last12Months" && (diffDays < 0 || diffDays > 365)) return false;
        if (dateFilter === "Custom") {
          if (customStartDate && itemDate < new Date(customStartDate)) return false;
          if (customEndDate && itemDate > new Date(customEndDate)) return false;
        }
      }

      // 2. Week Filters
      if (weekFilter !== "AllWeeks") {
        // Simple mock ISO week assignment rule base matching
        const dayOfMonth = itemDate.getDate();
        if (weekFilter === "Week1" && (dayOfMonth > 7)) return false;
        if (weekFilter === "Week2" && (dayOfMonth <= 7 || dayOfMonth > 14)) return false;
        if (weekFilter === "Week3" && (dayOfMonth <= 14 || dayOfMonth > 21)) return false;
        if (weekFilter === "Week4" && (dayOfMonth <= 21)) return false;
      }

      // 3. Month Filters
      if (monthFilter !== "AllMonths") {
        const itemMonth = itemDate.getMonth(); // 0-11
        if (monthFilter === "CurrentMonth" && itemMonth !== today.getMonth()) return false;
        if (monthFilter === "PreviousMonth" && itemMonth !== (today.getMonth() === 0 ? 11 : today.getMonth() - 1)) return false;
        if (!isNaN(monthFilter) && itemMonth !== parseInt(monthFilter)) return false;
      }

      // 4. Year Filters
      if (yearFilter !== "AllYears") {
        const itemYear = itemDate.getFullYear();
        if (yearFilter === "CurrentYear" && itemYear !== today.getFullYear()) return false;
        if (yearFilter === "PreviousYear" && itemYear !== today.getFullYear() - 1) return false;
      }

      // 5. Day Filters
      if (dayFilter !== "AllDays") {
        const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (daysMap[itemDate.getDay()] !== dayFilter) return false;
      }

      // 6. Categorical Context Filters
      if (typeFilter !== "AllModes" && item.mode !== typeFilter) return false;
      if (statusFilter !== "AllStatuses" && item.status !== statusFilter) return false;
      if (categoryFilter !== "AllCategories" && item.category !== categoryFilter) return false;

      return true;
    });
  }, [records, searchQuery, searchField, dateFilter, customStartDate, customEndDate, weekFilter, monthFilter, yearFilter, dayFilter, typeFilter, statusFilter, categoryFilter]);

  // ==========================================
  // 3. KPI & PERFORMANCE CALCULATION METRICS
  // ==========================================
  const metrics = useMemo(() => {
    const todayStr = new Date().toDateString();
    const count = filteredRecords.length;
    
    let scheduledToday = 0;
    let upcomingThisWeek = 0;
    let completed = 0;
    let missed = 0;
    let scoredTotal = 0;
    let totalOffers = 0;

    filteredRecords.forEach(r => {
      if (r.date.toDateString() === todayStr && r.status === "Scheduled") scheduledToday++;
      if (r.status === "Scheduled") upcomingThisWeek++; // Context matches un-fired items
      if (r.status === "Completed") completed++;
      if (r.status === "Missed") missed++;
      scoredTotal += r.score;
      if (r.score > 82) totalOffers++; // Arbitrary conversion logic base tracking
    });

    const successRate = count > 0 ? Math.round((completed / count) * 100) : 0;
    const avgScore = count > 0 ? Math.round(scoredTotal / count) : 0;
    const offerRate = count > 0 ? Math.round((totalOffers / count) * 100) : 0;

    return {
      total: count,
      scheduledToday,
      upcomingThisWeek,
      completed,
      missed,
      successRate,
      avgScore,
      offerRate,
      followUp: Math.ceil(count * 0.12)
    };
  }, [filteredRecords]);

  // Automatically fetch automated system dynamic notification alerts
  const systemNotifications = useMemo(() => {
    return [
      { id: 1, type: "reminder", text: `Reminder: You have ${metrics.scheduledToday} sessions waiting processing slots today.` },
      { id: 2, type: "missed", text: "Alert: 3 recent pipeline records logged status as 'Missed' over past interval." },
      { id: 3, type: "alert", text: "Update: Platform structural conversion metrics increased by 4.2% inside Tech verticals." }
    ];
  }, [metrics]);

  // Pagination slice computing boundary arrays
  const paginatedRecords = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(offset, offset + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;

  // ==========================================
  // 4. DATA VISUALIZATION ENGINE - CHART.JS RENDERS
  // ==========================================
  useEffect(() => {
    // Teardown pre-existing canvas initializations systematically
    Object.values(activeCharts.current).forEach(chart => chart?.destroy());

    const orangeTheme = "#f97316";
    const gridColor = "rgba(226, 232, 240, 0.6)";
    const textLabelColor = "#64748b";

    // Chart Data Preprocessors
    const statusCounts = { Scheduled: 0, Completed: 0, Rescheduled: 0, Missed: 0, Cancelled: 0 };
    const companyCounts = {};
    const categoryScores = { Tech: 0, Design: 0, Marketing: 0, Finance: 0, HR: 0, Sales: 0 };
    const categoryCounts = { Tech: 0, Design: 0, Marketing: 0, Finance: 0, HR: 0, Sales: 0 };

    filteredRecords.forEach(r => {
      if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
      companyCounts[r.company] = (companyCounts[r.company] || 0) + 1;
      if (categoryScores[r.category] !== undefined) {
        categoryScores[r.category] += r.score;
        categoryCounts[r.category]++;
      }
    });

    // Line & Area Growth Trends Mapping
    if (lineChartRef.current) {
      activeCharts.current.line = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: "Evaluations Requested",
            data: [15, 28, 42, 34, filteredRecords.length % 40 + 20, 55],
            borderColor: orangeTheme,
            tension: 0.4,
            borderWidth: 3,
            fill: false
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: gridColor } } } }
      });
    }

    if (barChartRef.current) {
      const topCompanies = Object.entries(companyCounts).slice(0, 5);
      activeCharts.current.bar = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: topCompanies.map(c => c[0]),
          datasets: [{
            label: "Volume",
            data: topCompanies.map(c => c[1]),
            backgroundColor: "rgba(249, 115, 22, 0.8)",
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (pieChartRef.current) {
      activeCharts.current.pie = new Chart(pieChartRef.current, {
        type: "doughnut",
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#64748b"]
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } }
      });
    }

    if (radarChartRef.current) {
      activeCharts.current.radar = new Chart(radarChartRef.current, {
        type: "radar",
        data: {
          labels: ["Architecture", "System Engine", "UI Fidelity", "Communication", "Team Index", "Agile Flow"],
          datasets: [{
            label: "Candidate Framework Matrix",
            data: [85, 78, 92, 70, 88, 80],
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            borderColor: orangeTheme,
            pointBackgroundColor: orangeTheme
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (horizontalBarRef.current) {
      const cats = Object.keys(categoryScores);
      const averages = cats.map(c => categoryCounts[c] > 0 ? Math.round(categoryScores[c] / categoryCounts[c]) : 0);

      activeCharts.current.horizontalBar = new Chart(horizontalBarRef.current, {
        type: "bar",
        indexAxis: "y",
        data: {
          labels: cats,
          datasets: [{
            label: "Avg Rating %",
            data: averages,
            backgroundColor: "rgba(249, 115, 22, 0.65)"
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (areaChartRef.current) {
      activeCharts.current.area = new Chart(areaChartRef.current, {
        type: "line",
        data: {
          labels: ["Q1-25", "Q2-25", "Q3-25", "Q4-25", "Q1-26", "Q2-26"],
          datasets: [{
            label: "Net Pipeline Volume Expansion",
            data: [40, 65, 90, 85, 120, filteredRecords.length],
            fill: true,
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            borderColor: orangeTheme,
            tension: 0.3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    return () => {
      Object.values(activeCharts.current).forEach(chart => chart?.destroy());
    };
  }, [filteredRecords]);

  // ==========================================
  // 5. DATA EXPORT ACTIONS SIMULATORS
  // ==========================================
  const exportData = (format) => {
    alert(`System Export Stream initiated successfully. Compiling pipeline manifest data format: ${format.toUpperCase()}.\nDownloading compiled package report for ${filteredRecords.length} records matching criteria metrics.`);
  };

  const printReport = () => {
    window.print();
  };

  const updateStatus = (id, newStatus) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedInterview?.id === id) {
      setSelectedInterview(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-12">
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-orange-100/70 to-transparent -z-10 pointer-events-none" />

      {/* TOP NOTIFICATION HEADER TOAST SYSTEM */}
      <div className="bg-orange-600 text-white py-2.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <Bell size={16} className="animate-bounce shrink-0" />
            <span className="font-medium truncate">{systemNotifications[0].text}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-semibold tracking-wide">
            <span>Server Target Year: 2026</span>
            <span className="bg-orange-700 px-2 py-0.5 rounded">Live Sync Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ==========================================
           DASHBOARD BANNER HEADER
           ========================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="text-orange-500" />
              Interview Hub Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Fidelity candidate analysis tracking terminal pipeline. Complete filter execution state.
            </p>
          </div>
          
          {/* EXPORT BUTTON CLUSTERS */}
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => exportData("csv")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition">
              <FileText size={14} /> CSV
            </button>
            <button onClick={() => exportData("excel")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition">
              <Download size={14} /> Excel
            </button>
            <button onClick={() => exportData("pdf")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition">
              <FileText size={14} /> PDF
            </button>
            <button onClick={printReport} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* ==========================================
           TOP ROW RE-USABLE METRIC KPI CARDS
           ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Invitations", value: metrics.total, desc: "Active criteria volume", icon: <Briefcase className="text-orange-500" /> },
            { label: "Scheduled Today", value: metrics.scheduledToday, desc: "Immediate assessment", icon: <Clock className="text-blue-500" /> },
            { label: "Upcoming Week", value: metrics.upcomingThisWeek, desc: "Pipeline queues", icon: <Calendar className="text-amber-500" /> },
            { label: "Completed Steps", value: metrics.completed, desc: "Processed files", icon: <CheckCircle className="text-green-500" /> },
            { label: "Missed Target", value: metrics.missed, desc: "Requires reschedule", icon: <AlertTriangle className="text-red-500" /> },
            { label: "Success Rate", value: `${metrics.successRate}%`, desc: "Conversion profile", icon: <TrendingUp className="text-emerald-500" /> }
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-500 block leading-tight">{card.label}</span>
                <div className="p-1 rounded-md bg-slate-50 border border-slate-100">{card.icon}</div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{card.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ==========================================
           MAIN LAYER INTERACTION FILTERS AND LOGIC
           ========================================== */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Filter size={16} className="text-orange-500" />
            <h2 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Advanced Engine Controls</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {/* Range selection parameters */}
            <div>
              <label className="font-medium text-slate-600 block mb-1">Timeline Baseline Range</label>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllTime">All Complete Records</option>
                <option value="Today">Today Only</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last2Days">Last 2 Days</option>
                <option value="Last3Days">Last 3 Days</option>
                <option value="Last7Days">Last 7 Days</option>
                <option value="Last30Days">Last 30 Days</option>
                <option value="Last3Months">Last 3 Months</option>
                <option value="Last6Months">Last 6 Months</option>
                <option value="Last12Months">Last 12 Months</option>
                <option value="Custom">Custom Specified Bound</option>
              </select>
            </div>

            {dateFilter === "Custom" && (
              <div className="col-span-1 flex gap-2">
                <div className="w-1/2">
                  <label className="font-medium text-slate-600 block mb-1">Start</label>
                  <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px]" />
                </div>
                <div className="w-1/2">
                  <label className="font-medium text-slate-600 block mb-1">End</label>
                  <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[11px]" />
                </div>
              </div>
            )}

            <div>
              <label className="font-medium text-slate-600 block mb-1">Monthly Segments</label>
              <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllMonths">All Months Breakdown</option>
                <option value="CurrentMonth">Current Month Context</option>
                <option value="PreviousMonth">Previous Month Context</option>
                <option value="0">January</option>
                <option value="1">February</option>
                <option value="2">March</option>
                <option value="3">April</option>
                <option value="4">May</option>
                <option value="5">June</option>
                <option value="6">July</option>
                <option value="7">August</option>
                <option value="8">September</option>
                <option value="9">October</option>
                <option value="10">November</option>
                <option value="11">December</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Weekly Target Grid</label>
              <select value={weekFilter} onChange={e => setWeekFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllWeeks">All Weeks Layer</option>
                <option value="Week1">Week Segment 1 (Days 1-7)</option>
                <option value="Week2">Week Segment 2 (Days 8-14)</option>
                <option value="Week3">Week Segment 3 (Days 15-21)</option>
                <option value="Week4">Week Segment 4 (Days 22-31)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Day Baseline Context</label>
              <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllDays">All Working Days</option>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Functional Mode</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllModes">All Platforms (Online/Physical)</option>
                <option value="Online">Online Streaming Rooms</option>
                <option value="Physical">Physical Corporate Complex</option>
                <option value="Hybrid">Hybrid Blended Architecture</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Status Phase Pipeline</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllStatuses">All Execution Statuses</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Vertical Categorization</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllCategories">All Job Verticals</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Fiscal Year Grid</label>
              <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-orange-500 outline-none">
                <option value="AllYears">All Operational Years</option>
                <option value="CurrentYear">Current Year (2026 Target)</option>
                <option value="PreviousYear">Previous Year Block</option>
              </select>
            </div>
          </div>

          {/* MASTER SEARCH DEEP TEXT ENGINE CONTROL */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-3">
            <div className="w-full md:w-1/4">
              <select value={searchField} onChange={e => setSearchField(e.target.value)} className="w-full h-10 bg-slate-100 text-xs border border-slate-200 rounded-lg px-2 text-slate-700 outline-none font-medium">
                <option value="all">Search Every Column Field</option>
                <option value="candidateName">Candidate Name Specifics</option>
                <option value="company">Corporate Entity Name</option>
                <option value="position">Position Assignment Title</option>
                <option value="id">Interview Serial Identifier ID</option>
                <option value="email">Electronic Email Address</option>
              </select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Query system core parameters string parsing..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-orange-500 transition shadow-inner"
              />
            </div>
            <button
              onClick={() => {
                setSearchQuery(""); setDateFilter("AllTime"); setWeekFilter("AllWeeks");
                setMonthFilter("AllMonths"); setYearFilter("AllYears"); setDayFilter("AllDays");
                setTypeFilter("AllModes"); setStatusFilter("AllStatuses"); setCategoryFilter("AllCategories");
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition shrink-0"
            >
              Reset Terminal Grid
            </button>
          </div>
        </div>

        {/* SECONDARY ROW CRITICAL EXTRA FUNCTIONAL DATA KPI POINTS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Conversion Index</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{Math.round(metrics.successRate * 0.85)}%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Net Offer Probability</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{metrics.offerRate}%</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Mean Score Metric</span>
            <span className="text-xl font-bold text-orange-600 block mt-1">{metrics.avgScore} / 100</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Follow Up Dispatches</span>
            <span className="text-xl font-bold text-slate-800 block mt-1">{metrics.followUp} Pending</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm col-span-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider text-left pl-1">Next Processing Matrix Node</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-1 justify-start pl-1">
              <Clock size={12} className="text-orange-500" />
              <span className="truncate">INT-2026-1044 — Frontend Stack Room</span>
            </div>
          </div>
        </div>

        {/* ==========================================
           TAB LAYER ROUTING NAVIGATION
           ========================================== */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6">
          <div className="flex gap-4">
            {[
              { id: "analytics", label: "Analytics Engines", icon: <BarChart3 size={16} /> },
              { id: "table", label: "Fidelity Registry Table", icon: <FileText size={16} /> },
              { id: "timeline", label: "Interactive Core Timeline", icon: <Clock size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition tracking-wide uppercase border-b-2 px-1 ${
                  activeTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full mb-2">
            Query Matches: {filteredRecords.length} Rows Available
          </div>
        </div>

        {/* ==========================================
           TAB VIEW CONTENT ROUTING MATRIX
           ========================================== */}
        <AnimatePresence mode="wait">
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Interview Calls Trend</span>
                <div className="w-full h-[90%]"><canvas ref={lineChartRef} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Interviews Per Top Company</span>
                <div className="w-full h-[90%]"><canvas ref={barChartRef} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Interview Status Distribution</span>
                <div className="w-full h-[90%]"><canvas ref={pieChartRef} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Candidate Skill Matching Radar</span>
                <div className="w-full h-[90%]"><canvas ref={radarChartRef} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Interview Success By Category</span>
                <div className="w-full h-[90%]"><canvas ref={horizontalBarRef} /></div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-64">
                <span className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-tight">Monthly Interview Volume Growth</span>
                <div className="w-full h-[90%]"><canvas ref={areaChartRef} /></div>
              </div>
            </motion.div>
          )}

          {activeTab === "table" && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* INTERACTIVE COMPACT DATA GRID TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold tracking-wide uppercase">
                      <th className="p-3.5 pl-5">Candidate profile</th>
                      <th className="p-3.5">Company Unit</th>
                      <th className="p-3.5">Target Position</th>
                      <th className="p-3.5">Timestamp Matrix</th>
                      <th className="p-3.5">Assigned Vector</th>
                      <th className="p-3.5">Interviewer Node</th>
                      <th className="p-3.5 text-center">Status Flag</th>
                      <th className="p-3.5 text-right pr-5">Execution Steps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRecords.map((row) => {
                      const badgeStyles = {
                        Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
                        Completed: "bg-green-50 text-green-700 border-green-200",
                        Rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
                        Missed: "bg-red-50 text-red-700 border-red-200",
                        Cancelled: "bg-slate-100 text-slate-600 border-slate-300"
                      }[row.status] || "bg-slate-50 text-slate-700";

                      return (
                        <motion.tr
                          key={row.id}
                          whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.015)" }}
                          className="transition"
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-700 uppercase shrink-0">
                                {row.candidateName.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block leading-tight">{row.candidateName}</span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{row.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">{row.company}</td>
                          <td className="p-3.5">
                            <div>
                              <span className="font-semibold text-slate-800 block leading-tight">{row.position}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-500 mt-0.5 inline-block font-mono">{row.category}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">
                            <span className="block leading-tight">{row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{row.time}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              {row.mode === "Online" ? <Video size={12} className="text-blue-500" /> : <MapPin size={12} className="text-orange-500" />}
                              {row.mode}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{row.interviewer.split(" ")[0]} {row.interviewer.split(" ")[1] || ""}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyles}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button onClick={() => setSelectedInterview(row)} className="p-1 text-slate-500 hover:text-orange-600 hover:bg-slate-50 rounded border border-slate-100 transition" title="Inspect Registry Info">
                                <Eye size={13} />
                              </button>
                              <button onClick={() => updateStatus(row.id, "Completed")} className="p-1 text-slate-500 hover:text-green-600 hover:bg-slate-50 rounded border border-slate-100 transition" title="Mark Component Phase Completed">
                                <Check size={13} />
                              </button>
                              <button onClick={() => { alert(`Communication dispatch array routed context to mailbox node: ${row.email}`); }} className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded border border-slate-100 transition" title="Dispatch Automated Sync Notification Email">
                                <Mail size={13} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* COMPACT CONTROL PAGINATION BAR FOOTER */}
              <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex items-center justify-between text-xs font-semibold text-slate-500 px-5">
                <span>Displaying Row Indices Node Range {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} matches</span>
                <div className="inline-flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3">Segment Grid Frame {currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl mx-auto"
            >
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase border-b pb-3 mb-6">Fidelity Candidate Pipeline Step Map Trace</h3>
              
              {/* ANIMATED PIPELINE SEQUENCE STEPPING MATRIX SCROLL TRACE */}
              <div className="relative pl-6 border-l-2 border-orange-500/30 space-y-6 ml-4">
                {[
                  { title: "Application Receipt Phase Pipeline Initialized", desc: "Core profile validation step checks index against open portfolio parameters", active: true, color: "bg-orange-500 text-white" },
                  { title: "Shortlisted Target Matrix Triggered", desc: "System evaluation parameters accepted user resume file vectors parsing modules", active: true, color: "bg-orange-500 text-white" },
                  { title: "Primary Screening Call Scheduled Session", desc: "Arrangement framework set calendar locks into validation date loops", active: true, color: "bg-orange-500 text-white" },
                  { title: "Technical Evaluation Round Component Matrix", desc: "Deep diving functional assessment protocols live sandboxed compiler engine tasks", active: false, color: "bg-slate-100 text-slate-400 border border-slate-200" },
                  { title: "HR Corporate Profile Alignment Sync Session", desc: "Cultural vector profiling metric parameters check tracking systems index parameters", active: false, color: "bg-slate-100 text-slate-400 border border-slate-200" },
                  { title: "System Formal Offer Package Generated Dispatch", desc: "Legal structure assignment generation compiling data arrays", active: false, color: "bg-slate-100 text-slate-400 border border-slate-200" },
                  { title: "Hired Status Flag Locked Production Active", desc: "Terminal node pipeline completion success tracking array close configuration", active: false, color: "bg-slate-100 text-slate-400 border border-slate-200" }
                ].map((step, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${step.color}`}>
                      {step.active ? "✓" : idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-none ${step.active ? "text-slate-800" : "text-slate-400"}`}>{step.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
           MODAL DRILLDOWN METRIC DETAIL OVERLAYS
           ========================================== */}
        <AnimatePresence>
          {selectedInterview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedInterview(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-slate-100"
                onClick={e => e.stopPropagation()}
              >
                {/* Header context card title panel layout overlay overlay */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5 text-white flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider bg-orange-700/50 px-2 py-0.5 rounded uppercase font-bold">{selectedInterview.id}</span>
                    <h3 className="text-lg font-bold mt-1 tracking-tight">{selectedInterview.candidateName}</h3>
                    <p className="text-xs text-orange-100 mt-0.5">{selectedInterview.position} @ {selectedInterview.company}</p>
                  </div>
                  <button onClick={() => setSelectedInterview(null)} className="p-1 hover:bg-white/10 rounded-lg transition text-white">
                    <XCircle size={20} />
                  </button>
                </div>

                <div className="p-5 text-xs text-slate-600 space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Date Time Vector</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{selectedInterview.date.toDateString()}</span>
                      <span className="text-[11px] text-slate-500 block">{selectedInterview.time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Streaming Location Model</span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{selectedInterview.mode} Platform</span>
                      <span className="text-[11px] text-slate-500 block truncate">{selectedInterview.interviewer}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">System Internal Assessment Evaluation Note Data</span>
                    <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 leading-relaxed font-mono text-[11px]">
                      {selectedInterview.notes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Fidelity Capability Rating Score Matrix</span>
                      <span className="text-lg font-extrabold text-orange-600 block mt-0.5">{selectedInterview.score} / 100 Value Index</span>
                    </div>
                    
                    {/* ACTION RE-ROUTING BUTTON PIPELINE MANIPULATIONS */}
                    <div className="flex gap-1.5">
                      <select
                        value={selectedInterview.status}
                        onChange={e => updateStatus(selectedInterview.id, e.target.value)}
                        className="bg-white border border-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 outline-none text-slate-700"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={() => { alert(`Pipeline instance tracking node reset scheduled parameters dispatched sequence.`); setSelectedInterview(null); }}
                        className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
                      >
                        Reschedule Pipe
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}