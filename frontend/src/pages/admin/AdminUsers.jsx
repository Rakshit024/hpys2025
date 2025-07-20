import React, { useState, useEffect } from "react";
import "../../styles/admin.css";
import UserSearchBar from "./UserSearchBar";
import UserTable from "./UserTable";

const AdminUsers = () => {
  console.log("AdminUsers mounted");
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all users once
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users`);
        const data = await response.json();
        if (data.success) {
          setAllUsers(data.data);
          setUsers(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Filter users locally
    if (!searchTerm) {
      setUsers(allUsers);
    } else {
      const lower = searchTerm.toLowerCase();
      setUsers(
        allUsers.filter(
          (u) =>
            (u.first_name && u.first_name.toLowerCase().includes(lower)) ||
            (u.last_name && u.last_name.toLowerCase().includes(lower)) ||
            (u.address && u.address.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchTerm, allUsers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-users">
      <div className="search-section">
        <h2>All Registered Users ({users.length})</h2>
        <UserSearchBar value={searchTerm} onChange={handleSearch} />
      </div>
      <UserTable users={users} />
    </div>
  );
};

export default React.memo(AdminUsers); 