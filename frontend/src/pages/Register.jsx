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
    dob: null,
    email: "",
    phone: "",
    address: "",
    reference: "",
    group: "",
    eduType: "",
    standard: "",
    stream: "",
    schoolName: "",
    collegeName: "",
    branch: "",
    semester: "",
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

    // --- VALIDATIONS ---
    if (!photo) {
      toast.error("Please select a photo");
      return;
    }

    if (!formData.dob) {
      toast.error("Please select your Date of Birth");
      return;
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (!formData.reference || formData.reference.trim() === "") {
      toast.error("Please provide a reference");
      return;
    }

    if (!formData.group || formData.group === "") {
      toast.error("Please select a group");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "dob" && formData.dob) {
          formDataToSend.append(
            "dob",
            formData.dob.toISOString().split("T")[0]
          );
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append("photo", photo);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/register`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Registration successful! Your QR code has been generated."
        );
        navigate("/", { state: { userData: data.user } });
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
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
          {/* Photo Upload */}
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 180,
                    width: 120,
                    margin: "0 auto",
                  }}
                >
                  <FaRegImage size={64} color="#bbb" />
                </div>
              )}
            </div>

            {/* Hidden input for CAMERA (with capture) */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="photo-input"
              id="camera-input"
              style={{ display: "none" }}
            />

            {/* Hidden input for GALLERY (without capture) */}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
              id="gallery-input"
              style={{ display: "none" }}
            />

            <div className="flex item-center gap-4">
              {/* Button to open camera */}
              <label
                htmlFor="camera-input"
                className="photo-upload-btn btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <img
                  src="/camara.png"
                  alt="Click your photo"
                  accept="image/jpeg,image/jpg,image/png"
                  height={20}
                  width={20}
                />
                Camera
              </label>

              {/* Button to open gallery */}
              <label
                htmlFor="gallery-input"
                className="photo-upload-btn btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <img
                  src="/photos.png"
                  alt="Upload your photo"
                  accept="image/jpeg,image/jpg,image/png"
                  height={20}
                  width={20}
                />
                Gallery
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                className="input"
                placeholder="FIRST NAME *"
                required
              />

              <input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                className="input"
                placeholder="LAST NAME *"
                required
              />

              <div className="form-group dob-group">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="dob"
                    type="text"
                    value={
                      formData.dob
                        ? formData.dob.toLocaleDateString("en-GB")
                        : "DATE OF BIRTH *"
                    }
                    className="input"
                    readOnly
                    disabled
                    style={{
                      cursor: "not-allowed",
                      color: formData.dob ? "#222" : "#888",
                    }}
                  />
                  <button
                    type="button"
                    className="calendar-btn"
                    onClick={() => setDobPickerOpen((open) => !open)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
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

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                placeholder="EMAIL ADDRESS *"
                required
              />

              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="PHONE NUMBER *"
                required
              />

              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
                placeholder="ADDRESS *"
                rows="3"
                required
              />
            </div>
          </div>

          {/* Educational Details */}
          <div className="form-section">
            <h3 className="section-title">Education Details (Optional)</h3>
            <div className="form-grid">
              <select
                name="eduType"
                className="input"
                value={formData.eduType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eduType: e.target.value,
                    standard: "",
                    stream: "",
                    schoolName: "",
                    collegeName: "",
                    branch: "",
                    semester: "",
                  }))
                }
              >
                <option value="">Select School or College</option>
                <option value="school">School</option>
                <option value="college">College</option>
              </select>

              {formData.eduType === "school" && (
                <>
                  <select
                    name="standard"
                    className="input"
                    value={formData.standard}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        standard: e.target.value,
                        stream: "",
                      }))
                    }
                  >
                    <option value="">Select Standard</option>
                    <option value="8">8th</option>
                    <option value="9">9th</option>
                    <option value="10">10th</option>
                    <option value="11">11th</option>
                    <option value="12">12th</option>
                  </select>

                  {["11", "12"].includes(formData.standard) && (
                    <select
                      name="stream"
                      className="input"
                      value={formData.stream}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Stream</option>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                    </select>
                  )}

                  <input
                    type="text"
                    name="schoolName"
                    className="input"
                    placeholder="School Name"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                  />
                </>
              )}

              {formData.eduType === "college" && (
                <>
                  <input
                    type="text"
                    name="collegeName"
                    className="input"
                    placeholder="College Name"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="branch"
                    className="input"
                    placeholder="Branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                  />
                  <select
                    name="semester"
                    className="input"
                    value={formData.semester}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Semester</option>
                    {[...Array(8)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        Semester {i + 1}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="form-section">
            <div className="form-grid">
              <input
                name="reference"
                type="text"
                value={formData.reference}
                onChange={handleInputChange}
                className="input"
                placeholder="REFERENCE"
              />

              <select
                name="group"
                className="input"
                value={formData.group}
                onChange={(e) => {
                  console.log("Selected group:", e.target.value);
                  handleInputChange(e);
                }}
                required
              >
                <option value="">Select Group *</option>
                <option value="Param">Param</option>
                <option value="Pulkit">Pulkit</option>
                <option value="Pavitra">Pavitra</option>
                <option value="Parmanand">Parmanand</option>
                <option value="Samp Atmiya">Samp Atmiya</option>
                <option value="Suhradbhav Bhoolku">Suhradbhav Bhoolku</option>
                <option value="Saradata Dastva">Saradata Dastva</option>
                <option value="Swikar Ekta">Swikar Ekta</option>
                <option value="Sahaj (V. V. Nagar, Karamsad, Mogari)">
                  Sahaj (V. V. Nagar, Karamsad, Mogari)
                </option>
                <option value="Seva (Nadiad - city)">
                  Seva (Nadiad - city)
                </option>
                <option value="smruti (Nadiad - city)">
                  Smruti (Nadiad - city)
                </option>
                <option value="Suhradbhav (Nadiad - city)">
                  Suhradbhav (Nadiad - city)
                </option>
                <option value="swadharm (Nadiad - city)">
                  Swadharm (Nadiad - city)
                </option>
                <option value="Nadiad Gramya">Nadiad Gramya</option>
                <option value="Mahemdavad">Mahemdavad</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submiting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
