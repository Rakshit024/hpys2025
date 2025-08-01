// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import ShowCard from "./pages/ShowCard";
import Card3D from "./pages/Card3D";
import AttendanceHome from "./pages/attendance/AttendanceHome";
import ScanQR from "./pages/attendance/ScanQR";
import Admin from "./pages/Admin";
import { Toaster } from "react-hot-toast";
import GroupLeader from "./pages/admin/group-leader-id-page";
import GroupLeaderTables from "./pages/admin/group-leader-tables";
import Navbar from "./components/navbar";
import GroupLeaderPanelTables from "./pages/admin/group-leader-panel-tables";
import GroupLeaderLoginPage from "./pages/admin/group-leader-login";
const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/show-card" element={<ShowCard />} />
          <Route path="/card" element={<Card3D />} />
          <Route path="/attendance" element={<AttendanceHome />} />
          <Route path="/hpys2025-admin-panel-369" element={<Admin />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route
            path="/hpys2025-group-leader-panel-369"
            element={
              <>
                <Navbar />
                <GroupLeader />
              </>
            }
          />
          <Route
            path="/hpys2025-group-leader-panel-369/:email"
            element={
              <>
                <Navbar />
                <GroupLeaderTables />
              </>
            }
          />
        <Route
          path="/hpys2025-group-leader-369/:group"
          element={
            <>
              <Navbar />
              <GroupLeaderPanelTables />
            </>
          }
          />
        <Route
          path="/hpys2025-group-leader-369"
          element={
            <>
              <Navbar />
              <GroupLeaderLoginPage />
            </>
          }
          />
          </Routes>
      </Router>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default App;
