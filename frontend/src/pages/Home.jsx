// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section glass-card fade-in">
        <div className="hero-content">
          {/* HPYS Symbol/Icon */}
          <div
            className="hpys-symbol"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "1.2rem",
            }}
          >
            <img
              src="/assets/HPYSicon/HPYS.png"
              alt="HPYS Icon"
              style={{ height: 60, width: "auto", maxWidth: 120 }}
            />
          </div>
          {/* Prabodham and Hariprasadam side by side */}
          <div
            className="prabodham-hariprasadam-row"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: "1.2rem",
            }}
          >
            <img
              src="/assets/hariprasadam.png"
              alt="Hariprasadam"
              style={{ height: 175, width: "auto", maxWidth: 300 }}
              loading="eager"
            />
            <img
              src="/assets/prabodham.png"
              alt="prabodham"
              style={{ height: 175, width: "auto", maxWidth: 300 }}
              loading="eager"
            />
          </div>

          <div>
            <h1 className="heading-font">Hari Prabodham</h1>
            <h1 className="heading-font"> Youth Shibir</h1>
          </div>

          <p className="hero-subtitle">With Us, Within Us, Surrounding Us</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="actions-grid">
        <div
          className="action-card glass-card scale-in"
          onClick={() => handleNavigation("/register")}
        >
          <div className="action-icon">
            <img
              src="/regiration_icon.png"
              alt="registration icon"
              height={40}
              width={40}
            />
          </div>
          <h3>Not Registered Yet?</h3>
          <p>Register Now</p>
          <div className="action-arrow">→</div>
        </div>

        <div
          className="action-card glass-card scale-in"
          // onClick={() => handleNavigation("/show-card")}
        >
          <div className="coming-soon-badge">Coming Soon</div> {/* New badge */}
          <div className="action-icon">
            <img
              src="/gallary.png"
              alt="registration icon"
              height={40}
              width={40}
            />
          </div>
          <h3>View Cards</h3>
          <p>
            Browse and search through all registered user cards and profiles
          </p>
          <div className="action-arrow">→</div>
        </div>
        <div
          className="action-card glass-card scale-in"
          // onClick={() => handleNavigation("/show-card")}
        >
          <div className="coming-soon-badge">Coming Soon</div> {/* New badge */}
          <div className="action-icon">
            <img
              src="/schedule.png"
              alt="registration icon"
              height={40}
              width={40}
            />
          </div>
          <h3>Event Schedule Walk Through</h3>
          <p>Take a guided tour of the complete event schedule and sessions.</p>
          <div className="action-arrow">→</div>
        </div>
      </div>

      {/* Telegram Channel Box */}
      <div
        className="telegram-box glass-card fade-in"
        onClick={() => window.open("https://t.me/+mp04cL9iHRczNWQ9", "_blank")}
        style={{
          padding: "0.7rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          backgroundColor: "#229ED9",
          color: "#fff",
          cursor: "pointer",
          borderRadius: "10px",
          justifyContent: "center",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <img
          src="/assets/Logo2.png"
          alt="Telegram"
          style={{
            width: "35px",
            height: "35px",
            filter: "invert(100%) brightness(200%)",
          }}
        />
        <div>
          {/* <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
           HPYS 2025 Channel
          </p> */}
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            Stay updated with all important announcements
          </p>
        </div>
      </div>

      {/* Features Section */}
      {/* <div className="features-section glass-card fade-in">
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
      </div> */}
    </div>
  );
};

export default Home;
