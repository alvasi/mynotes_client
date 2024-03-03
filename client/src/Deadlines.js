import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Paper, Typography, CircularProgress, Drawer, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddDeadlineForm from './AddDeadlineForm'; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import FilterButtons from './FilterButtons';

function Deadlines() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 200;
  useEffect(() => {
    // If the location state has deadlines, use that instead of fetching
    if (location.state?.deadlines) {
      setDeadlines(location.state.deadlines);
    } else {
      fetchDeadlines('all'); // Fetch all deadlines initially
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

  // Mark deadliens as complete
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

   return (
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
      <Grid container spacing={2}>
        {deadlines.map((deadline) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={deadline.id}>
            <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography gutterBottom variant="subtitle1">
                {deadline.task}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {deadline.date}
              </Typography>
              {deadline.completed ? (
              <Button
                variant="outlined"
                startIcon={<CheckCircleOutlineIcon />}
                disabled
                sx={{ mt: 'auto' }} // Push the button to the bottom
              >
                Completed
              </Button>
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
  );
}

export default Deadlines;
