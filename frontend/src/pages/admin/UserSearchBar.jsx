import React from "react";

const UserSearchBar = ({ value, onChange }) => (
  <div className="search-box">
    <input
      id="admin-users-search"
      name="admin-users-search"
      type="text"
      placeholder="Search by name, last name, or address..."
      value={value}
      onChange={onChange}
      className="search-input"
      autoComplete="off"
    />
  </div>
);

export default React.memo(UserSearchBar); 