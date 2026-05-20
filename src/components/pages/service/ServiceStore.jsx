import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Filter, Star, ShoppingBag, TrendingUp, Award, 
  Eye, Heart, Share2, Zap, Package, DollarSign
} from "lucide-react";
import Chart from "chart.js/auto";
import "../../styles/ServiceStore.css";

export default function ServiceStore({ services, bookings, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const chartsRef = useRef({});

  const categories = ['all',...new Set(services.map(s => s.category).filter(Boolean))];
  const featured = services.filter(s => s.rating >= 4.7).slice(0, 3);
  const trending = [...services].sort((a, b) => b.bookings - a.bookings).slice(0, 3);
  const topRated = [...services].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalRevenue = services.reduce((a, s) => a + Number(s.price) * s.bookings, 0);
  const avgRating = (services.reduce((a, s) => a + s.rating, 0) / services.length).toFixed(1);

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id)? prev.filter(f => f !== id) : [...prev, id]);
  };

  useEffect(() => {
    Object.values(chartsRef.current).forEach(c => c?.destroy());

    // Service Demand - Doughnut
    const demandCtx = document.getElementById('demand-chart');
    if (demandCtx) {
      chartsRef.current.demand = new Chart(demandCtx, {
        type: 'doughnut',
        data: {
          labels: services.map(s => s.name),
          datasets: [{
            data: services.map(s => s.bookings),
            backgroundColor: ["#f97316", "#3b82f6", "#22c55e", "#fbbf24", "#8b5cf6"],
            borderWidth: 0,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%' }
      });
    }

    // Rating Trends - Line
    const ratingCtx = document.getElementById('rating-trend-chart');
    if (ratingCtx) {
      chartsRef.current.rating = new Chart(ratingCtx, {
        type: 'line',
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: 'Avg Rating',
            data: [4.2, 4.4, 4.5, 4.6, 4.7, avgRating],
            borderColor: "#fbbf24",
            backgroundColor: "rgba(251,191,36,0.1)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5 } } }
      });
    }

    // Popular Categories - Polar Area
    const catCtx = document.getElementById('category-chart');
    if (catCtx) {
      const catData = categories.slice(1).map(cat => 
        services.filter(s => s.category === cat).reduce((a, s) => a + s.bookings, 0)
      );
      chartsRef.current.category = new Chart(catCtx, {
        type: 'polarArea',
        data: {
          labels: categories.slice(1),
          datasets: [{
            data: catData,
            backgroundColor: ["#f97316", "#3b82f6", "#22c55e", "#fbbf24"].map(c => c + '80'),
            borderColor: ["#f97316", "#3b82f6", "#22c55e", "#fbbf24"],
            borderWidth: 2,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    // Revenue Overview - Bar
    const revCtx = document.getElementById('revenue-overview');
    if (revCtx) {
      chartsRef.current.revenue = new Chart(revCtx, {
        type: 'bar',
        data: {
          labels: services.map(s => s.name),
          datasets: [{
            label: 'Revenue',
            data: services.map(s => Number(s.price) * s.bookings),
            backgroundColor: "#f97316",
            borderRadius: 8,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    return () => Object.values(chartsRef.current).forEach(c => c?.destroy());
  }, [services, avgRating]);

  return (
    <motion.div className="store-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero Section */}
      <div className="store-hero">
        <motion.button className="back-btn" onClick={onBack} whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
          <ArrowLeft size={20} /> Back to Dashboard
        </motion.button>
        
        <motion.div className="hero-content" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1>Your Service Storefront</h1>
          <p>Showcase your premium services to the world</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">{services.length}</span>
              <span className="stat-text">Services</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">{bookings.length}</span>
              <span className="stat-text">Bookings</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">{avgRating}★</span>
              <span className="stat-text">Rating</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">₹{totalRevenue.toLocaleString()}</span>
              <span className="stat-text">Revenue</span>
            </div>
          </div>
        </motion.div>

        {/* Banner Carousel */}
        <div className="banner-carousel">
          <motion.div className="banner-slide" animate={{ x: [0, -100, 0] }} transition={{ repeat: Infinity, duration: 20 }}>
            <Package size={32} /> Premium Quality Services
          </motion.div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="store-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-pills">
          {categories.map(cat => (
            <motion.button
              key={cat}
              className={`pill ${selectedCategory === cat? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat === 'all'? 'All' : cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured Services */}
      {featured.length > 0 && (
        <div className="featured-section">
          <h2><Award size={24} /> Featured Services</h2>
          <div className="featured-grid">
            {featured.map((s, i) => (
              <motion.div
                key={s.id}
                className="featured-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(249,115,22,0.3)" }}
              >
                <div className="featured-badge">Featured</div>
                <img src={s.image} alt={s.name} />
                <div className="featured-info">
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="featured-meta">
                    <span className="price">Rs {s.price}</span>
                    <div className="rating">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      {s.rating}
                    </div>
                  </div>
                  <motion.button className="book-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <ShoppingBag size={16} /> Book Now
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Services */}
      <div className="trending-section">
        <h2><TrendingUp size={24} /> Trending Now</h2>
        <div className="trending-grid">
          {trending.map((s, i) => (
            <motion.div
              key={s.id}
              className="trending-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="trending-rank">#{i + 1}</div>
              <img src={s.image} alt={s.name} />
              <div className="trending-info">
                <h4>{s.name}</h4>
                <p>{s.bookings} bookings this month</p>
                <div className="trending-rating">
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {s.rating}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* All Services Grid */}
      <div className="all-services">
        <h2>All Services</h2>
        <div className="services-grid">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              className="service-card-store"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <div className="card-actions">
                <motion.button
                  className={`fav-btn ${favorites.includes(s.id)? 'active' : ''}`}
                  onClick={() => toggleFavorite(s.id)}
                  whileTap={{ scale: 0.8 }}
                >
                  <Heart size={18} fill={favorites.includes(s.id)? "#ef4444" : "none"} />
                </motion.button>
                <motion.button className="share-btn" whileTap={{ scale: 0.8 }}>
                  <Share2 size={18} />
                </motion.button>
              </div>
              <img src={s.image} alt={s.name} />
              <div className="card-body">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="card-footer">
                  <span className="price-tag">Rs {s.price}</span>
                  <div className="rating-tag">
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    {s.rating}
                  </div>
                </div>
                <motion.button className="book-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ShoppingBag size={16} /> Book Service
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="store-analytics">
        <h2><BarChart3 size={24} /> Store Analytics</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Service Demand</h3>
            <div className="chart-wrap"><canvas id="demand-chart" /></div>
          </div>
          <div className="chart-card">
            <h3>Rating Trends</h3>
            <div className="chart-wrap"><canvas id="rating-trend-chart" /></div>
          </div>
          <div className="chart-card">
            <h3>Popular Categories</h3>
            <div className="chart-wrap"><canvas id="category-chart" /></div>
          </div>
          <div className="chart-card">
            <h3>Revenue Overview</h3>
            <div className="chart-wrap"><canvas id="revenue-overview" /></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}