// frontend/src/pages/ShowCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/showcard.css";

const ShowCard = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter a registered email");
    navigate(`/card?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="showcard-container">
      <h2>View Your 3D ID Card</h2>
      <form className="showcard-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <label>Enter your registered email</label>
        </div>
        <button type="submit">Show Card</button>
        <button type="button" onClick={() => navigate("/")}>
          Home
        </button>
      </form>
    </div>
  );
};

export default ShowCard;
