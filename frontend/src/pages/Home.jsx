// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const [stats, setStats] = useState({ users: 0, attendance: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersResponse, attendanceResponse] = await Promise.all([
        fetch("/api/getAllUsers"),
        fetch("/api/attendance/"),
      ]);
      const usersData = await usersResponse.json();
      const attendanceData = await attendanceResponse.json();
      setStats({
        users: usersData.count || 0,
        attendance: attendanceData.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section glass-card fade-in">
        <div className="hero-content">
          <div className="logo-container">
            <img src="/assets/h.png" alt="H Logo" className="logo-image" />
            <img src="/assets/p.png" alt="P Logo" className="logo-image" />
          </div>
          <h1 className="hero-title">
            Hari Prabodham Yuva Shibir - 2025
          </h1>
          <p className="hero-subtitle">
            Streamline your attendance tracking with modern QR technology and real-time analytics
          </p>
        </div>
        
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.users}</div>
              <div className="stat-label">Registered Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.attendance}</div>
              <div className="stat-label">Attendance Records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="actions-grid">
        <div className="action-card glass-card scale-in" onClick={() => handleNavigation("/register")}>
          <div className="action-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="m22 21-2-2"/>
              <path d="M16 16h6"/>
            </svg>
          </div>
          <h3>Register New User</h3>
          <p>Add new participants to the system with complete profile information</p>
          <div className="action-arrow">→</div>
        </div>

        <div className="action-card glass-card scale-in" onClick={() => handleNavigation("/attendance")}>
          <div className="action-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>Take Attendance</h3>
          <p>Scan QR codes to mark attendance for different sessions and days</p>
          <div className="action-arrow">→</div>
        </div>

        <div className="action-card glass-card scale-in" onClick={() => handleNavigation("/admin")}>
          <div className="action-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>Admin Panel</h3>
          <p>Manage users, view attendance records, and access detailed analytics</p>
          <div className="action-arrow">→</div>
        </div>

        <div className="action-card glass-card scale-in" onClick={() => handleNavigation("/show-card")}>
          <div className="action-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
          <h3>View Cards</h3>
          <p>Browse and search through all registered user cards and profiles</p>
          <div className="action-arrow">→</div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section glass-card fade-in">
        <h2 className="section-title">Why Choose Our System?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h4>Fast & Efficient</h4>
            <p>Quick QR code scanning for instant attendance marking</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h4>Secure & Reliable</h4>
            <p>Advanced security measures to protect your data</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h4>Mobile Friendly</h4>
            <p>Works seamlessly across all devices and screen sizes</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <h4>Real-time Analytics</h4>
            <p>Get instant insights into attendance patterns and trends</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
