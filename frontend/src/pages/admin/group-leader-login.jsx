import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
  MenuItem,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Group names list
const groupNames = [
  "All",
  "Param",
  "Pavitra",
  "Pulkit",
  "Paramanand",
  "Samp",
  "Atmiya",
  "Suhradbhav",
  "Bhulku",
  "Saradta",
  "Dasatva",
  "Swikar",
  "Ekta",
  "Sahaj",
  "Seva Nadiad",
  "Smruti Nadiad",
  "Suhradbhav Nadiad",
  "Swadharma Nadiad",
  "Bhakti Zone",
  "Parabhakti Zone",
  "Anuvrutti Zone",
  "Mahemdavad",
];

const GroupLeaderLoginPage = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGroup) {
      setError("Please select a group");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (groupNames.includes(selectedGroup)) {
        navigate(`/hpys2025-group-leader-369/${selectedGroup}`);
      } else {
        toast.error("Invalid group selected");
      }
    } catch (error) {
      console.error("Navigation error:", error);
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
            Group Leader Login
          </Typography>

          <TextField
            select
            fullWidth
            label="Select Your Group"
            variant="filled"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            error={!!error}
            helperText={error}
          >
            <MenuItem value="">-- Select Group --</MenuItem>
            {groupNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

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

      {/* Loading Spinner */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default GroupLeaderLoginPage;
