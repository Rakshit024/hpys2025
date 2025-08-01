import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast"; // ✅ Import toast

const groupNames = [
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

const RegisterUserDialog = ({
  open,
  handleClose,
  onUserRegistered,
  fetchGroupData,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    reference: "",
    group: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = "Full name is required";
    if (!formData.phone.match(/^\d{10}$/))
      errs.phone = "Enter a valid 10-digit phone number";
    if (!formData.reference.trim()) errs.reference = "Reference is required";
    if (!formData.group) errs.group = "Group selection is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/leader/register-user`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success("Participant registered successfully 🎉");
        onUserRegistered(); // Refresh list
        handleClose(); // Close dialog
        setFormData({ full_name: "", phone: "", reference: "", group: "" });
        fetchGroupData();
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Register New Participant</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={!!errors.full_name}
            helperText={errors.full_name}
            fullWidth
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
          />
          <TextField
            label="Reference"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            error={!!errors.reference}
            helperText={errors.reference}
            fullWidth
          />
          <TextField
            label="Select Group"
            name="group"
            select
            value={formData.group}
            onChange={handleChange}
            error={!!errors.group}
            helperText={errors.group}
            fullWidth
          >
            {groupNames.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterUserDialog;
