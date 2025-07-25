// frontend/src/pages/Register.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { parse, isValid } from "date-fns";
import "../styles/register.css";
import { FaInfoCircle, FaRegCalendarAlt, FaRegImage } from "react-icons/fa";

const citySuggestions = [
  "Anand",
  "Nadiad",
  "Vadodara",
  "Ahmedabad",
  "Surat",
  "Vidhiya Nagar",
  "Morbi",
  "Jambusar",
  "Bharuch",
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: null,
    email: "",
    phone: "",
    address: "",
    city: "",
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
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  const cityBoxRef = useRef(null);
  const dobRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "city") {
      const filtered = citySuggestions.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCitySuggestions(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dobRef.current && !dobRef.current.contains(e.target)) {
        setDobPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    setFilteredCities([]);
    setShowCitySuggestions(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, or PNG images are allowed");
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

    if (photo && photo.size > 2 * 1024 * 1024) {
      toast.error("Photo size must be less than 2MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(photo.type)) {
      toast.error("Only JPG, JPEG, or PNG images are allowed");
      setPhoto(null);
      setPreview(null);
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
      console.log(formData.middle_name);

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
      // toast.error(error.message);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        <div
          style={{
            border: "2px dashed red",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "2rem",
            backgroundColor: "#fff0f0",
          }}
        >
          <h3
            style={{
              color: "red",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaInfoCircle style={{ color: "red", width: 30, height: 30 }} />
            Read this Instructions before Submitting the form
          </h3>
          <hr style={{ borderColor: "red", marginBottom: "1rem" }} />
          <ul
            style={{ paddingLeft: "1.5rem", color: "#a00", lineHeight: "1.6" }}
          >
            <li>
              - Upload a recent photo where your{" "}
              <strong>face is clearly visible and recognizable</strong>. Avoid
              full-body images. Make sure the image size is{" "}
              <strong>less than 2MB</strong>.
            </li>

            <li>
              - Enter your first name, father's name (middle name), and surname
              properly.
            </li>
            <li>
              - Date of birth must be in <strong>dd/MM/yyyy</strong> format
              only.
            </li>
            <li>
              - Email must be in a valid format, e.g.,{" "}
              <strong>xyz@gmail.com</strong>.
            </li>
            <li>
              - Phone number must be exactly <strong>10 digits</strong>.
            </li>
            <li>
              - If you are staying in a hostel, enter your address in this
              format:
              <br />
              <em>"room number, hostel name"</em> &nbsp; e.g.,{" "}
              <strong>104, AVD</strong>.
            </li>
            <li>
              - Those who are currently working or not pursuing education may
              leave the
              <strong> Educational Details</strong> section empty.
            </li>
            <li>
              - For <strong>Reference</strong>, you may enter your group
              leader's name.
            </li>
            {/* Add more points below if needed */}
          </ul>
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
              accept="image/jpg,image/jpeg,image/png"
              capture="environment"
              onChange={handlePhotoChange}
              className="photo-input"
              id="camera-input"
              style={{ display: "none" }}
            />

            {/* Hidden input for GALLERY (without capture) */}
            <input
              type="file"
              accept="image/jpg,image/jpeg,image/png"
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
                placeholder="FIRST NAME (YOUR NAME) *"
                required
              />
              <input
                name="middle_name"
                type="text"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="input"
                placeholder="MIDDLE NAME (FATHER's NAME) *"
                required
              />

              <input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                className="input"
                placeholder="LAST NAME (SURNAME) *"
                required
              />

              <div className="form-group dob-group">
                <div
                  ref={dobRef}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    name="dob"
                    type="text"
                    value={
                      formData.dob
                        ? formData.dob.toLocaleDateString("en-GB")
                        : "DATE OF BIRTH (eg: 17/08/1953) *"
                    }
                    className="input"
                    onClick={() => setDobPickerOpen(true)}
                    readOnly
                    style={{
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
              </div>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                placeholder="EMAIL ADDRESS (eg: abc@gmail.com) *"
                required
              />

              <input
                name="phone"
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
                placeholder="PHONE NUMBER (10 digits) *"
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
              <div ref={cityBoxRef} style={{ position: "relative" }}>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="CITY (eg: ANAND) *"
                  required
                  autoComplete="off"
                />

                {showCitySuggestions && filteredCities.length > 0 && (
                  <ul
                    className="suggestions-list"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxHeight: "350px",
                      overflowY: "auto",
                      zIndex: 1000,
                      padding: "0",
                      margin: "4px 0 0 0",
                      listStyleType: "none",
                    }}
                  >
                    {filteredCities.map((city, index) => (
                      <li
                        key={index}
                        onClick={() => handleCitySelect(city)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                placeholder="REFERENCE (eg: LEADER_NAME) *"
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
