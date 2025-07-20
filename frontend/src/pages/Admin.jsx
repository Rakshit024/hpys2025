import React, { useState } from "react";
import AdminUsers from "./admin/AdminUsers";
import AdminAttendance from "./admin/AdminAttendance";
import "../styles/admin.css";

const Admin = () => {
  console.log("Admin rendered");
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            See All Registered Users
          </button>
          <button 
            className={`nav-btn ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            See Attendance
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        <div style={{ display: activeTab === "users" ? "block" : "none" }}>
          <AdminUsers />
        </div>
        <div style={{ display: activeTab === "attendance" ? "block" : "none" }}>
          <AdminAttendance />
        </div>
      </div>
    </div>
  );
};

export default Admin; 