// frontend/src/pages/ShowCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/showcard.css";
import toast from "react-hot-toast";

const ShowCard = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {return toast.error("Please enter a registered email")};
    navigate(`/card?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="showcard-container">
      <h2>View Your 3D ID Card</h2>
      <form className="showcard-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            className="input"
            placeholder="Enter the email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        
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
