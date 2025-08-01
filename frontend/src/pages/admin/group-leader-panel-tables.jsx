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
  IconButton,
  MenuItem,
} from "@mui/material";
// import { DeleteOutline } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import RegisterUserDialog from "./RegisterUserDialog"; // Adjust path if needed

import axios from "axios";

const GroupLeaderPanelTables = () => {
  const [searchName, setSearchName] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { group } = useParams();
  const navigate = useNavigate();
  const [allRows, setAllRows] = useState([]);
  const [isStatusUpdating, setIsStatusUpdating] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const allowedSessions = ["s1", "s2", "s3", "s4", "s5"];
  const [selectedSession, setSelectedSession] = useState("s1"); // new state

  const fetchGroupData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/leader/get-data/${group}`,
        {
          params: {
            session: selectedSession, // <-- pass session here
          },
        }
      );

      console.log(response);
      if (response.status === 200 && response.data.user) {
        setFilteredRows(response.data.user);
        setAllRows(response.data.user);
      }
    } catch (error) {
      console.error("Axios error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log(group);
    if (!group) {
      navigate("/hpys2025-group-leader-panel-369");
      return;
    }
    fetchGroupData();
  }, [group, navigate, selectedSession]);

  useEffect(() => {
    if (searchName.trim() === "") {
      setFilteredRows(allRows);
    } else {
      setFilteredRows(
        allRows.filter((row) =>
          `${row.full_name}`.toLowerCase().includes(searchName.toLowerCase())
        )
      );
    }
  }, [searchName, allRows]);

  const updateAttendance = async (id, value, session) => {
    try {
      console.log(value, id, session);
      setIsStatusUpdating(id);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/leader/take-attendance`,
        { id, session, value },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200) {
        setFilteredRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, [session]: value } : row
          )
        );

        setAllRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, [session]: value } : row
          )
        );
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleCheckboxChange = (id, session, value) => {
    if (value === true) {
      setSelectedRow({ id, value: false, session });
      setConfirmOpen(true);
    } else {
      updateAttendance(id, true, session);
    }
  };

  // const handleDeleteClick = (row) => {
  //   setDeleteRow(row);
  //   setDeleteOpen(true);
  // };

  //   const groupName = filteredRows.length > 0 ? filteredRows[0].group : "N/A";

  return (
    <>
      {!isLoading && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Group Leader - Attendance Participants
          </Typography>
          <Button
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => setRegisterOpen(true)}
          >
            + New Register
          </Button>

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
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Group Name
                </Typography>
                <Typography variant="body2">{group}</Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Total Registered Users
                </Typography>
                <Typography variant="body2">{allRows.length}</Typography>
              </Box>
            </CardContent>
          </Card>

          <TextField
            label="Search by Name"
            variant="outlined"
            size="small"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Filter by Session"
            select
            size="small"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">All Sessions</MenuItem>
            {allowedSessions.map((session) => (
              <MenuItem key={session} value={session}>
                Session {session.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TableContainer component={Paper} sx={{ maxHeight: "70vh" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Group</TableCell>
                  {/* <TableCell>Delete</TableCell> */}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
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
                            checked={row[selectedSession] === true}
                            onChange={() =>
                              handleCheckboxChange(
                                row.id,
                                selectedSession,
                                row[selectedSession]
                              )
                            }
                            color="primary"
                          />
                        )}
                      </TableCell>
                      <TableCell>{row.full_name || "N.A."}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.reference}</TableCell>
                      <TableCell>{row.group}</TableCell>

                      {/* <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(row)}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Backdrop
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
        open={isLoading}
      >
        <CircularProgress sx={{ color: "#8B0000" }} size={50} />
      </Backdrop>

      {/* Confirm Uncheck Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Uncheck</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this participant as{" "}
            <strong>unpaid</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              updateAttendance(
                selectedRow.id,
                selectedRow.value,
                selectedRow.session
              );
              setConfirmOpen(false);
              setSelectedRow(null);
            }}
            variant="contained"
            color="info"
          >
            Yes, Uncheck
          </Button>
        </DialogActions>
      </Dialog>

      <RegisterUserDialog
        open={registerOpen}
        handleClose={() => setRegisterOpen(false)}
        fetchGroupData={fetchGroupData}
        onUserRegistered={() => {
          // Refresh current session data
          setSelectedSession((prev) => prev); // trigger useEffect
        }}
      />
    </>
  );
};

export default GroupLeaderPanelTables;
