// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/register.css";
import { FaRegCalendarAlt, FaRegImage } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: null, // store as Date object
    email: "",
    phone: "",
    occupation: "",
    qualification: "",
    address: "",
    reference: "",
    group: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size should be less than 5MB");
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, dob: date }));
    setDobPickerOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      toast.error("Please select a photo");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "dob" && formData.dob) {
          formDataToSend.append("dob", formData.dob.toISOString().split("T")[0]);
        } else {
          formDataToSend.append(key, formData[key]);
    }
      });

      // Append photo
      formDataToSend.append("photo", photo);

      const response = await fetch("/api/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Registration successful! Your QR code has been generated."
        );
        navigate("/card", { state: { userData: data.user } });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card glass-card fade-in">
        <div className="register-header">
          <h1 className="register-title">
            <span className="gradient-text">Create Your</span>
            <br />
            Digital Identity
          </h1>
          <p className="register-subtitle">
            Join our community with a modern digital ID card featuring QR
            technology
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {/* Photo Upload Section */}
          <div className="photo-upload-section">
            <div className="photo-preview-container">
              {preview ? (
                <div className="photo-preview-rect-wrapper">
                  <img
                    src={preview}
                    alt="Preview"
                    className="photo-preview-rect"
                  />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 180, width: 120, margin: "0 auto" }}>
                  <FaRegImage size={64} color="#bbb" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
              id="photo-input"
            />
            <label
              htmlFor="photo-input"
              className="photo-upload-btn btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              Choose Photo
            </label>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
        <div className="form-group">
          <input
                  id="first_name"
            name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="FIRST NAME *"
            required
          />
        </div>

        <div className="form-group">
                {/* <label htmlFor="last_name">Last Name *</label> */}
          <input
                  id="last_name"
            name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="LAST NAME *"
            required
          />
        </div>

              <div className="form-group dob-group">
                {/* <label htmlFor="dob">Date of Birth *</label> */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
                    id="dob"
            name="dob"
                    type="text"
                    value={formData.dob ? formData.dob.toLocaleDateString("en-GB") : "DATE OF BIRTH *"}
                    className="input"
                    readOnly
                    disabled
                    style={{ background: "#f5f5f5", cursor: "not-allowed", color: formData.dob ? "#222" : "#888" }}
                  />
                  <button
                    type="button"
                    className="calendar-btn"
                    onClick={() => setDobPickerOpen((open) => !open)}
                    tabIndex={0}
                    aria-label="Select date of birth"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <FaRegCalendarAlt size={24} />
                  </button>
                </div>
                {dobPickerOpen && (
                  <div style={{ position: "absolute", zIndex: 10 }}>
                    <DatePicker
                      selected={formData.dob}
                      onChange={handleDateChange}
                      inline
                      maxDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      dateFormat="dd-MM-yyyy"
                    />
                  </div>
                )}
        </div>

        <div className="form-group">
                {/* <label>Email Address *</label> */}
          <input
                  id="email"
            name="email"
            type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="EMAIL ADDRESS *"
            required
          />
        </div>

        <div className="form-group">
                {/* <label htmlFor="phone">Phone Number *</label> */}
          <input
                  id="phone"
            name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="PHONE NUMBER *"
                  required
                />
              </div>

              <div className="form-group">
                {/* <label htmlFor="address">Address *</label> */}
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="ADDRESS *"
            required
                  rows="3"
          />
              </div>
            </div>
        </div>

          {/* Professional Information */}
          <div className="form-section">
            <h3 className="section-title">Professional Information</h3>
            <div className="form-grid">
        <div className="form-group">
                {/* <label htmlFor="occupation">Occupation</label> */}
          <input
                  id="occupation"
            name="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="OCCUPATION"
                />
        </div>

        <div className="form-group">
                {/* <label htmlFor="qualification">Qualification</label> */}
          <input
                  id="qualification"
            name="qualification"
                  type="text"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="QUALIFICATION"
                />
        </div>

        <div className="form-group">
                {/* <label htmlFor="reference">Reference</label> */}
                <input
                  id="reference"
                  name="reference"
                  type="text"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="REFERENCE"
                />
        </div>

        <div className="form-group">
                {/* <label htmlFor="group">Group</label> */}
                <input
                  id="group"
                  name="group"
                  type="text"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="GROUP"
                />
        </div>
        </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
        </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Digital ID"}
        </button>
          </div>
      </form>
      </div>
    </div>
  );
};

export default Register;
