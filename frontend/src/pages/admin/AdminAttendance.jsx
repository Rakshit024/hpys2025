import React, { useState, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";
import "../../styles/admin.css";

const AdminAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [sortBy, setSortBy] = useState("timestamp");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = async (search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedDay) params.append("day", selectedDay);
      if (selectedSession) params.append("session", selectedSession);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/attendance?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setAttendanceRecords(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch attendance records");
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(debouncedSearch);
  }, [debouncedSearch, selectedDay, selectedSession, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-attendance">
      <div className="search-section">
        <h2>Attendance Records ({attendanceRecords.length})</h2>

        <div className="filters">
          <div className="search-box">
            <input
              id="admin-attendance-search"
              name="admin-attendance-search"
              type="text"
              placeholder="Search by name, email, or address..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="filter-group">
            <select
              value={selectedDay}
              onChange={handleDayChange}
              className="filter-select"
            >
              <option value="">All Days</option>
              <option value="Aug 1">Aug 1</option>
              <option value="Aug 2">Aug 2</option>
              <option value="Aug 3">Aug 3</option>
            </select>

            <select
              value={selectedSession}
              onChange={handleSessionChange}
              className="filter-select"
            >
              <option value="">All Sessions</option>
              <option value="Session 1">Session 1</option>
              <option value="Session 2">Session 2</option>
              <option value="Session 3">Session 3</option>
            </select>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="day">Sort by Day</option>
              <option value="session">Sort by Session</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Day</th>
              <th>Session</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td>

                  No data found
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td>
                    {record.user?.photo ? (
                      <img
                        src={`/uploads/${record.user.photo}`}
                        alt="User"
                        className="user-photo"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="no-photo">No Photo</div>
                    )}
                  </td>
                  <td>{record.user?._id || "N/A"}</td>
                  <td>
                    {record.user
                      ? `${record.user.first_name || ""} ${
                          record.user.last_name || ""
                        }`.trim() || "N/A"
                      : "N/A"}
                  </td>
                  <td>{record.email || "N/A"}</td>
                  <td>{record.user?.address || "N/A"}</td>
                  <td>{record.day || "N/A"}</td>
                  <td>{record.session || "N/A"}</td>
                  <td>{formatDate(record.timestamp)}</td>
                  <td>{formatTime(record.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(AdminAttendance);
