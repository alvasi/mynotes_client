import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Typography, CircularProgress, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddDeadlineForm from './AddDeadlineForm'; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import FilterButtons from './FilterButtons';

function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hoveredDeadlineId, setHoveredDeadlineId] = useState(null); // To handle hover effect for 'Mark as Incomplete' button
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteDialogDeadlineId, setDeleteDialogDeadlineId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 200;

  // Ensure that data is updated when browser refreshes
  useEffect(() => {
    fetchDeadlines('all'); 
  }, []); //ensures this effect runs once on mount
  
  useEffect(() => {
    if (location.state?.deadlines) {
      setDeadlines(location.state.deadlines);
    }
  }, [location.state]);
  

  // Toggle the sidebar
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };


  // Function to navigate back to the dashboard
  const handleNavigateToDashboard = () => {
    navigate('/dashboard'); 
  };


  // Fetch deadlines
  const fetchDeadlines = (filterType) => {
    setLoading(true);
    setError('');
    fetch(`/api/view_deadlines?type=${filterType}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setDeadlines(data.entries);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load deadlines');
        setLoading(false);
        console.error('Error fetching deadlines:', error);
      });
  };


  // Mark deadlines as complete
  const markDeadlineComplete = (deadlineId) => {
    const formData = new FormData();
    formData.append('deadline_id', deadlineId);

    fetch('/api/mark_deadline_complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deadline_id: deadlineId }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if(data.success) {
        // Optimistically update the deadline to 'completed'
        setDeadlines(deadlines.map(dl => {
          if (dl.id === deadlineId) {
            return { ...dl, completed: true };
          }
          return dl;
        }));
      } else {
        // Handle any error messages from the server
        setError(data.error || 'Failed to mark deadline as completed');
      }
    })
    .catch((error) => {
      setError('Failed to mark deadline as completed');
      console.error('Error:', error);
    });
  };


  // Mark deadlines as incomplete
const markDeadlineIncomplete = (deadlineId) => {
  fetch('/api/mark_deadline_incomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deadline_id: deadlineId }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if(data.success) {
      // Optimistically update the deadline to 'incomplete'
      setDeadlines(deadlines.map(dl => {
        if (dl.id === deadlineId) {
          return { ...dl, completed: false };
        }
        return dl;
      }));
    } else {
      // Handle any error messages from the server
      setError(data.error || 'Failed to mark deadline as incomplete');
    }
  })
  .catch((error) => {
    setError('Failed to mark deadline as incomplete');
    console.error('Error:', error);
  });
};


  // Add a deadline
  const handleAddDeadline = (newDeadline) => {
    fetch('/api/add_deadline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDeadline),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // If the deadline was successfully added, refresh the list
        fetchDeadlines('all'); 
      } else {
        setError(data.error || 'Failed to add deadline');
      }
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      setError('Failed to add deadline');
      console.error('Error adding deadline:', error);
    });
  };


  // Delete a deadline
  const deleteDeadline = (deadlineId) => {
    fetch('/api/delete_deadline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deadline_id: deadlineId }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Remove the deleted deadline from the state
        setDeadlines(deadlines.filter(dl => dl.id !== deadlineId));
      } else {
        console.error('Failed to delete the deadline');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleOpenDeleteDialog = (deadlineId) => {
    setDeleteDialogDeadlineId(deadlineId);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const confirmDeleteDeadline = () => {
    if (deleteDialogDeadlineId) {
      deleteDeadline(deleteDialogDeadlineId);
      setDeleteDialogDeadlineId(null);
      handleCloseDeleteDialog();
    }
  };
  

  // Filter deadlines
  const handleFilterChange = (filterType) => {
    fetchDeadlines(filterType);
  };
  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }


  // Update a deadline
  const handleUpdateDeadline = (deadlineId, newTask, newDeadline) => {
    fetch('/api/update_deadline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deadline_id: deadlineId,
        task: newTask,
        deadline: newDeadline,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        setDeadlines(deadlines.map(dl => {
          if (dl.id === deadlineId) {
            return { ...dl, task: newTask, date: newDeadline };
          }
          return dl;
        }));
        setOpenEditDialog(false); // Close the dialog
        updateDeadlineInState(deadlineId, newTask, newDeadline);
      }
    })
    .catch(error => {
      console.error('Error updating deadline:', error);
    });
  };
  

  // Called after successfully updating the deadline
  // Format the date to 'DD/MM/YYYY' before setting it. 
const updateDeadlineInState = (updatedDeadlineId, updatedTask, updatedDate) => {
  setDeadlines(deadlines.map(dl => {
    if (dl.id === updatedDeadlineId) {
      const formattedDate = new Date(updatedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return { ...dl, task: updatedTask, date: formattedDate };
    }
    return dl;
  }));
};


   return (
    <>
    <Box sx={{ p: 4, flexGrow: 1 }}>
      <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          width: drawerWidth, 
          '& .MuiDrawer-paper': { width: drawerWidth }, // to ensure the Drawer's paper also has the same width
        }}
      >
        <List>
          <ListItem button onClick={handleNavigateToDashboard}>
            <DashboardIcon />
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => window.location.href = '/login'}>
            <LogoutIcon />
            <ListItemText primary="Log Out" />
          </ListItem>
        </List>
      </Drawer>
      <FilterButtons onFilterChange={handleFilterChange} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: 2 }}>
        <Button variant="contained" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add a Deadline'}
        </Button>
      </Box>
      {showAddForm && (
        <AddDeadlineForm onAddDeadline={handleAddDeadline} />
      )}

      {/* Dialog for confirming delete */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this deadline?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteDeadline} color="primary" autoFocus>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grid containing cards of deadlines */}
      <Grid container spacing={2}>
        {deadlines.map((deadline) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={deadline.id}>
            <Paper sx={{ position: 'relative', padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => handleOpenDeleteDialog(deadline.id)}
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 40 }}
                onClick={() => {
                  setEditingDeadline({ id: deadline.id, task: deadline.task, date: deadline.date });
                  setOpenEditDialog(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <Typography gutterBottom variant="subtitle1">
                {deadline.task}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {deadline.date}
              </Typography>
              {deadline.completed ? (
               <div
               onMouseEnter={() => setHoveredDeadlineId(deadline.id)}
               onMouseLeave={() => setHoveredDeadlineId(null)}
                >
                <Button
                  variant={hoveredDeadlineId === deadline.id ? "contained" : "outlined"}
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => hoveredDeadlineId === deadline.id && markDeadlineIncomplete(deadline.id)}
                  sx={{ mt: 'auto' }} // Push the button to the bottom
                  disabled={hoveredDeadlineId !== deadline.id}
                >
                  {hoveredDeadlineId === deadline.id ? "Mark as Incomplete" : "Completed"}
                </Button>
             </div>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => markDeadlineComplete(deadline.id)}
                sx={{ mt: 'auto' }} // Push the button to the bottom
              >
                Mark as Completed
              </Button>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
    </Box>
    
     {/* Dialog for updating deadlines */}
    <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}> 
    <DialogTitle>Edit Deadline</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        id="task"
        label="Task"
        type="text"
        fullWidth
        variant="standard"
        value={editingDeadline ? editingDeadline.task : ''}
        onChange={(e) => setEditingDeadline({ ...editingDeadline, task: e.target.value })}
      />
      <TextField
        margin="dense"
        id="deadline"
        label="Deadline Date"
        type="date"
        fullWidthf
        variant="standard"
        InputLabelProps={{
          shrink: true,
        }}
        value={editingDeadline ? editingDeadline.date : ''}
        onChange={(e) => setEditingDeadline({ ...editingDeadline, date: e.target.value })}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
      <Button onClick={() => handleUpdateDeadline(editingDeadline.id, editingDeadline.task, editingDeadline.date)}>Update</Button>
    </DialogActions>
    </Dialog>
    </>
      
  );
}

export default Deadlines;
