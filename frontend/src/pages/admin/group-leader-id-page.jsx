import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const GroupLeader = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/leader/leader-id`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (response.status === 200 && response.data.data) {
        navigate(
          `/hpys2025-group-leader-panel-369/${response.data.data.email}`
        );
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.status === 401) {
          toast.error("Please Enter the valid email");
        }
        if (error.status === 500) {
          toast.error("Please Enter the valid email");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Typography variant="h6" align="center" color="primary">
            Group Leader Email
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="filled"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.2 }}
          >
            Submit
          </Button>
        </form>
      </div>

      {/* Overlay Spinner */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default GroupLeader;
