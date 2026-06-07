import { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, Star, MessageSquare, Users, Zap, Award, AlertTriangle,
  Search, Download, BarChart3, PieChart, Activity, Target, CheckCircle, ThumbsUp, ThumbsDown
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/Ratinganalytics.css";

export default function RatingAnalytics({ ratings = [], reviews = [], onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const chartsRef = useRef({});

  // Mock data if none passed - replace with your API
  const mockRatings = [
    { id: 1, userName: "John Doe", service: "Hair Styling", rating: 5, comment: "Amazing service!", date: "2026-05-15", sentiment: "positive" },
    { id: 2, userName: "Jane Smith", service: "Deep Cleaning", rating: 4, comment: "Good job", date: "2026-05-20", sentiment: "positive" },
    { id: 3, userName: "Mike Johnson", service: "Personal Training", rating: 5, comment: "Best trainer ever", date: "2026-05-22", sentiment: "positive" },
    { id: 4, userName: "Sarah Lee", service: "Makeup Artist", rating: 3, comment: "It was okay", date: "2026-05-25", sentiment: "neutral" },
    { id: 5, userName: "Tom Brown", service: "Plumbing", rating: 2, comment: "Late and messy", date: "2026-05-28", sentiment: "negative" },
    { id: 6, userName: "Emma Wilson", service: "Yoga Classes", rating: 5, comment: "Love it!", date: "2026-06-01", sentiment: "positive" },
  ];

  const safeRatings = useMemo(() => (ratings.length? ratings : mockRatings).map(r => ({
  ...r,
    rating: Number(r.rating) || 0,
    service: r.service || 'Unknown',
    sentiment: r.sentiment || (r.rating >= 4? 'positive' : r.rating >= 3? 'neutral' : 'negative')
  })), [ratings]);

  // KPI Calculations
  const totalReviews = safeRatings.length;

  const avgRating = useMemo(() =>
    totalReviews > 0? (safeRatings.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1) : "0.0"
 , [safeRatings, totalReviews]);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    safeRatings.forEach(r => { dist[Math.floor(r.rating)]++; });
    return dist;
  }, [safeRatings]);

  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    safeRatings.forEach(r => { counts[r.sentiment]++; });
    return counts;
  }, [safeRatings]);

  const topRatedService = useMemo(() => {
    const serviceRatings = {};
    safeRatings.forEach(r => {
      if (!serviceRatings[r.service]) serviceRatings[r.service] = { total: 0, count: 0 };
      serviceRatings[r.service].total += r.rating;
      serviceRatings[r.service].count++;
    });
    let top = { name: 'N/A', avg: 0 };
    Object.entries(serviceRatings).forEach(([name, data]) => {
      const avg = data.total / data.count;
      if (avg > top.avg) top = { name, avg: avg.toFixed(1) };
    });
    return top;
  }, [safeRatings]);

  const positiveRate = useMemo(() =>
    totalReviews > 0? ((sentimentData.positive / totalReviews) * 100).toFixed(1) : "0"
 , [sentimentData, totalReviews]);

  // Filter
  const filteredRatings = useMemo(() => safeRatings.filter(r => {
    const matchSearch = r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       r.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRating = filterRating === "all" || Math.floor(r.rating) === Number(filterRating);
    return matchSearch && matchRating;
  }), [safeRatings, searchTerm, filterRating]);

  // Charts
  useEffect(() => {
    const colors = ["#22c55e", "#3b82f6", "#fbbf24", "#f97316", "#ef4444"];

    Object.values(chartsRef.current).forEach(c => c?.destroy());
    chartsRef.current = {};

    // 1. Rating Distribution - Bar Chart
    const distCtx = document.getElementById('rating-distribution-chart');
    if (distCtx) {
      chartsRef.current.dist = new Chart(distCtx, {
        type: 'bar',
        data: {
          labels: ['5★', '4★', '3★', '2★', '1★'],
          datasets: [{
            label: 'Number of Reviews',
            data: [5,4,3,2,1].map(star => ratingDistribution[star]),
            backgroundColor: ['#22c55e', '#3b82f6', '#fbbf24', '#f97316', '#ef4444'],
            borderRadius: 8,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Sentiment Analysis - Doughnut
    const sentCtx = document.getElementById('sentiment-chart');
    if (sentCtx) {
      chartsRef.current.sentiment = new Chart(sentCtx, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
            backgroundColor: ['#22c55e', '#fbbf24', '#ef4444'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 3. Rating Trend - Line Chart
    const trendCtx = document.getElementById('rating-trend-chart');
    if (trendCtx) {
      const monthlyAvg = [4.2, 4.3, 4.5, 4.6, 4.7, parseFloat(avgRating)];
      chartsRef.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: 'Avg Rating',
            data: monthlyAvg,
            borderColor: "#f97316",
            backgroundColor: "rgba(249,115,22,0.2)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#f97316",
            pointRadius: 5,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } }
        }
      });
    }

    // 4. Service Ratings - Horizontal Bar
    const serviceCtx = document.getElementById('service-ratings-chart');
    if (serviceCtx) {
      const serviceAvgs = {};
      safeRatings.forEach(r => {
        if (!serviceAvgs[r.service]) serviceAvgs[r.service] = { total: 0, count: 0 };
        serviceAvgs[r.service].total += r.rating;
        serviceAvgs[r.service].count++;
      });
      const serviceData = Object.entries(serviceAvgs).map(([name, data]) => ({
        name,
        avg: (data.total / data.count).toFixed(1)
      })).sort((a, b) => b.avg - a.avg).slice(0, 6);

      chartsRef.current.service = new Chart(serviceCtx, {
        type: 'bar',
        data: {
          labels: serviceData.map(s => s.name),
          datasets: [{
            label: 'Avg Rating',
            data: serviceData.map(s => s.avg),
            backgroundColor: "#fbbf24",
            borderRadius: 8,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { min: 0, max: 5 } }
        }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [safeRatings, ratingDistribution, sentimentData, avgRating]);

  const exportCSV = () => {
    const headers = ['User', 'Service', 'Rating', 'Comment', 'Date', 'Sentiment'];
    const rows = filteredRatings.map(r => [r.userName, r.service, r.rating, r.comment, r.date, r.sentiment]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rating_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (safeRatings.length === 0) {
    return (
      <motion.div className="analytics-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="analytics-header">
          <motion.button className="analytics-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={20} /> Back
          </motion.button>
          <div>
            <h1>Rating Analytics</h1>
            <p>No ratings found</p>
          </div>
          </div>
        <div className="analytics-empty-state">
          <Star size={64} color="#fed7aa" />
          <h2>No Ratings Yet</h2>
          <p>Customer ratings will appear here once they start reviewing services</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="analytics-page" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="analytics-header">
        <motion.button className="analytics-back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <ArrowLeft size={20} /> Back
        </motion.button>
        <div>
          <h1>Rating Analytics</h1>
          <p>Customer satisfaction and review insights</p>
        </div>
        <motion.button className="analytics-export-btn" onClick={exportCSV} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Download size={18} /> Export CSV
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <AnalyticsKpiCard icon={Star} label="Average Rating" value={avgRating} sub="out of 5.0" color="#fbbf24" />
        <AnalyticsKpiCard icon={MessageSquare} label="Total Reviews" value={totalReviews} trend={12.5} color="#3b82f6" />
        <AnalyticsKpiCard icon={ThumbsUp} label="Positive Rate" value={`${positiveRate}%`} trend={8.3} color="#22c55e" />
        <AnalyticsKpiCard icon={Award} label="Top Rated" value={topRatedService.name} sub={`${topRatedService.avg}★ avg`} color="#f97316" />
      </div>

      {/* Filters */}
      <div className="analytics-filters-bar">
        <div className="analytics-search-box">
          <Search size={18} />
          <input type="text" placeholder="Search by user or service..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)}>
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        <div className="analytics-chart-card wide">
          <div className="analytics-chart-header">
            <BarChart3 size={20} color="#f97316" />
            <h3>Rating Distribution</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="rating-distribution-chart" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <PieChart size={20} color="#f97316" />
            <h3>Sentiment Analysis</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="sentiment-chart" /></div>
        </div>

        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <Activity size={20} color="#f97316" />
            <h3>Rating Trend</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="rating-trend-chart" /></div>
        </div>

        <div className="analytics-chart-card wide">
          <div className="analytics-chart-header">
            <Target size={20} color="#f97316" />
            <h3>Service Ratings Comparison</h3>
          </div>
          <div className="analytics-chart-wrap"><canvas id="service-ratings-chart" /></div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="analytics-insights-section">
        <h2><Zap size={24} /> AI-Powered Insights</h2>
        <div className="analytics-insight-cards">
          <motion.div className="analytics-insight-card success" whileHover={{ y: -5 }}>
            <TrendingUp size={24} />
            <div>
              <h4>Excellent Performance</h4>
              <p><strong>{topRatedService.name}</strong> maintains {topRatedService.avg}★ average. Customer satisfaction is {positiveRate}% positive.</p>
              <span className="analytics-insight-action">View testimonials →</span>
            </div>
          </motion.div>

          <motion.div className="analytics-insight-card warning" whileHover={{ y: -5 }}>
            <AlertTriangle size={24} />
            <div>
              <h4>Attention Needed</h4>
              <p>{sentimentData.negative} negative reviews detected. {((sentimentData.negative/totalReviews)*100).toFixed(1)}% of customers unsatisfied.</p>
              <span className="analytics-insight-action">Review feedback →</span>
            </div>
          </motion.div>

          <motion.div className="analytics-insight-card info" whileHover={{ y: -5 }}>
            <Star size={24} />
            <div>
              <h4>Rating Trend</h4>
              <p>Average rating improved by 0.3★ this month. Keep up the quality service!</p>
              <span className="analytics-insight-action">See details →</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="analytics-reviews-table">
        <h3>Recent Reviews</h3>
        <div className="analytics-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Service</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRatings.slice(0, 10).map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <td className="analytics-user-cell">{r.userName}</td>
                  <td><span className="analytics-badge">{r.service}</span></td>
                  <td>
                    <div className="analytics-rating-cell">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {r.rating}
                    </div>
                  </td>
                  <td className="analytics-comment-cell">{r.comment}</td>
                  <td>{r.date}</td>
                  <td>
                    <span className={`analytics-sentiment-badge ${r.sentiment}`}>
                      {r.sentiment === 'positive'? <ThumbsUp size={14} /> : r.sentiment === 'negative'? <ThumbsDown size={14} /> : <Activity size={14} />}
                      {r.sentiment}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsKpiCard({ icon: Icon, label, value, sub, trend, color }) {
  const isUp = (trend || 0) >= 0;
  return (
    <motion.div className="analytics-kpi-card" whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(249,115,22,0.15)" }} transition={{ type: "spring", stiffness: 300 }}>
      <div className="analytics-kpi-top">
        <div className="analytics-kpi-icon" style={{ background: color }}>
          <Icon size={24} color="white" />
        </div>
        {trend!== undefined && (
          <div className={`analytics-kpi-trend ${isUp? 'up' : 'down'}`}>
            {isUp? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="analytics-kpi-value">{value}</div>
      <div className="analytics-kpi-label">{label}</div>
      {sub && <div className="analytics-kpi-sub">{sub}</div>}
    </motion.div>
  );
}