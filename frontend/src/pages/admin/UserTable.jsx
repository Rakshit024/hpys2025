import React from "react";

const UserTable = ({ users }) => {
  const formatDate = (dateString) => {
    if (!dateString) {return "N/A"};
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            {/* <th>Photo</th> */}
            {/* <th>ID</th> */}
            <th>First Name</th>
            <th>Middle Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>City</th>
            <th>Date of Birth</th>
            <th>Reference</th>
            <th>Group</th>
            <th>Edu Type</th>
            <th>Standard</th>
            <th>Stream</th>
            <th>School Name</th>
            <th>College Name</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>paid?</th>
            <th>Registered On</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={idx}>
              {/* <td>
                {user.photo ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user.photo}`}
                    alt="User"
                    className="user-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="no-photo">No Photo</div>
                )}
              </td> */}
              {/* <td>{user.id}</td> */}
              <td>{user.first_name || "N/A"}</td>
              <td>{user.middle_name || "N/A"}</td>
              <td>{user.last_name || "N/A"}</td>
              <td>{user.email || "N/A"}</td>
              <td>{user.phone || "N/A"}</td>
              <td>{user.address || "N/A"}</td>
              <td>{user.city || "N/A"}</td>
              <td>{formatDate(user.dob)}</td>
              <td>{user.reference || "N/A"}</td>
              <td>{user.group || "N/A"}</td>
              <td>{user.eduType || "N/A"}</td>
              <td>{user.standard || "N/A"}</td>
              <td>{user.stream || "N/A"}</td>
              <td>{user.schoolName || "N/A"}</td>
              <td>{user.collegeName || "N/A"}</td>
              <td>{user.branch || "N/A"}</td>
              <td>{user.semester || "N/A"}</td>
              <td>{user.payment_status ? "Yes" : "No"}</td>
              <td>{formatDate(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(UserTable);
