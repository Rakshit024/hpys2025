import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Card,
  CardContent,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const GroupLeaderTables = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useParams();
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState([]);
  const [isStatusUpdating, setIsStatusUpdating] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Fetch data for group leader
  useEffect(() => {
    if (!email) {
      navigate("/hpys2025-group-leader-panel-369");
      return;
    }

    const fetchGroupData = async () => {
      setIsLoading(true);
      // await sleep(3000);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/leader/get-group-data/${email}`
        );
        if (response.status === 200 && response.data.data) {
          setFilteredRows(response.data.data);
          setAllRows(response.data.data); // store full list
        }
      } catch (error) {
        console.error("Axios error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [email, navigate]);

  // Filter by email
  useEffect(() => {
    if (searchEmail.trim() === "") {
      setFilteredRows(allRows); // restore all rows
    } else {
      setFilteredRows(
        allRows.filter((row) =>
          row.email.toLowerCase().includes(searchEmail.toLowerCase())
        )
      );
    }
  }, [searchEmail, allRows]);

  // Update payment_status in backend and frontend

  const updatePaymentStatus = async (id, payment_status) => {
    try {
      setIsStatusUpdating(id); // start spinner for this row

      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/leader/payment-done`,
        {
          id,
          payment_status,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        setFilteredRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, payment_status } : row
          )
        );
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleCheckboxChange = (id, currentStatus) => {
    if (currentStatus === true) {
      setSelectedRow({ id, payment_status: false });
      setConfirmOpen(true);
    } else {
      updatePaymentStatus(id, true);
    }
  };

  const groupName = filteredRows.length > 0 ? filteredRows[0].group : "N/A";
  const totalPaid = filteredRows.filter(
    (row) => row.payment_status === true
  ).length;

  return (
    <>
      {!isLoading && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Group Leader - Registered Participants
          </Typography>

          {/* Summary Card */}
          <Card elevation={3} sx={{ width: "100%", mb: 2 }}>
            <CardContent
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
              }}
            >
              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", fontSize: { xs: 14, sm: 16 } }}
                >
                  Group Name
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: 13, sm: 15 }, wordBreak: "break-word" }}
                >
                  {groupName}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", fontSize: { xs: 14, sm: 16 } }}
                >
                  Total Registered Users
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: 13, sm: 15 } }}
                >
                  {filteredRows.length}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", fontSize: { xs: 14, sm: 16 } }}
                >
                  Payment Done
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: 13, sm: 15 } }}
                >
                  {totalPaid}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Search Input */}
          <TextField
            label="Search by Email"
            variant="outlined"
            size="small"
            fullWidth
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              overflowX: "auto",
              maxHeight: "70vh",
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>First Name</TableCell>
                  <TableCell>Middle Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Paid?</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        backgroundColor: row.payment_status
                          ? "#f0f0f0"
                          : "inherit",
                      }}
                    >
                      <TableCell padding="checkbox">
                        {isStatusUpdating === row.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Checkbox
                            checked={row.payment_status}
                            onChange={() =>
                              handleCheckboxChange(row.id, row.payment_status)
                            }
                            color="primary"
                          />
                        )}
                      </TableCell>

                      <TableCell>{row.first_name || "N.A."}</TableCell>
                      <TableCell>{row.middle_name || "N.A."}</TableCell>
                      <TableCell>{row.last_name || "N.A."}</TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        {row.address}
                      </TableCell>
                      <TableCell>{row.group}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>{row.email}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.city}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color: row.payment_status ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {row.payment_status ? "Yes" : "No"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Loading */}
      <Backdrop
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress sx={{ color: "#8B0000" }} size={50} />{" "}
        {/* ⬅️ increase size here */}
      </Backdrop>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Uncheck</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this participant as{" "}
            <strong>unpaid</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              updatePaymentStatus(selectedRow.id, selectedRow.payment_status);
              setConfirmOpen(false);
              setSelectedRow(null);
            }}
            color="info"
            variant="contained"
          >
            Yes, Uncheck
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupLeaderTables;
