import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/attendancehome.css";

const AttendanceHome = () => {
  const [day, setDay] = useState("");
  const [session, setSession] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!day || !session) {return alert("Select both fields")};
    navigate(`/scan?day=${day}&session=${session}`);
  };

  return (
    <div className="attendancehome-container">
      <h2>Take Attendance</h2>
      <form className="attendancehome-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <select value={day} onChange={(e) => setDay(e.target.value)} required>
            <option value="" disabled hidden></option>
            <option value="Aug 1">Aug 1</option>
            <option value="Aug 2">Aug 2</option>
            <option value="Aug 3">Aug 3</option>
          </select>
          <label>Day</label>
        </div>
        <div className="form-group">
          <select value={session} onChange={(e) => setSession(e.target.value)} required>
            <option value="" disabled hidden></option>
            <option value="Session 1">Session 1</option>
            <option value="Session 2">Session 2</option>
            <option value="Session 3">Session 3</option>
          </select>
          <label>Session</label>
        </div>
        <button type="submit">Start Scanning</button>
      </form>
    </div>
  );
};

export default AttendanceHome;
