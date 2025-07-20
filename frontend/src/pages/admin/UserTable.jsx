import React from "react";

const UserTable = ({ users }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Occupation</th>
            <th>Qualification</th>
            <th>Date of Birth</th>
            <th>Reference</th>
            <th>Group</th>
            <th>Registered On</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {user.photo ? (
                  <img
                    src={`/uploads/${user.photo}`}
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
              <td>{user._id}</td>
              <td>{user.first_name || "N/A"}</td>
              <td>{user.last_name || "N/A"}</td>
              <td>{user.email || "N/A"}</td>
              <td>{user.phone || "N/A"}</td>
              <td>{user.address || "N/A"}</td>
              <td>{user.occupation || "N/A"}</td>
              <td>{user.qualification || "N/A"}</td>
              <td>{formatDate(user.dob)}</td>
              <td>{user.reference || "N/A"}</td>
              <td>{user.group || "N/A"}</td>
              <td>{formatDate(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(UserTable); 