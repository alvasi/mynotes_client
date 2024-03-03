import React, { useState, useEffect } from 'react';
import { Box, Button, Drawer, List, ListItem, ListItemText, Typography, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleViewDeadlines = () => {
    fetch('/api/view_deadlines?type=all')
      .then(response => response.json())
      .then(data => {
        // Assuming you are using react-router-dom v5 or above
        navigate('/deadlines', { state: { deadlines: data.entries } });
      })
      .catch(error => {
        console.error('Error fetching deadlines:', error);
      });
  };
  
  useEffect(() => {
    // Your API call logic here
    fetch('/api/dashboard', {
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setUsername(data.name);
      } else {
        window.location.href = '/login';
      }
    })
    .catch((error) => {
      console.error('Error fetching dashboard data:', error);
      window.location.href = '/login';
    });
  }, [navigate]);

  const drawerWidth = 250;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#faedd2' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="h6" component="div" sx={{ marginRight: 2, color: 'rgba(0, 0, 0, 0.87)'}}>
            {username}
          </Typography>
          <Button color="inherit" onClick={() => window.location.href = '/login'} sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>Log out</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Drawer
        variant="permanent"
        sx={{
            width: drawerWidth,
            flexShrink: 0,
            display: 'flex', // Make the Drawer a flex container
            flexDirection: 'column', // Arrange children (like List) in a column
            justifyContent: 'center', // Center children vertically in the Drawer
            '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            bgcolor: '#f0f0f0',
            display: 'flex', // Make the Drawer's paper also a flex container
            flexDirection: 'column', // Arrange children (like List) in a column
            justifyContent: 'center', // Center children vertically in the Drawer's paper
            },
        }}
        >
        <List sx={{ width: '100%' }}> {/* Adjust width as needed */}
        <ListItem 
            button 
            onClick={handleViewDeadlines}
            sx={{ 
                justifyContent: 'center', 
                backgroundColor: 'grey', // Optional: to ensure there's space around the button
                '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Optional: hover effect
                }
            }}
            >
            <ListItemText primary="My Deadlines" />
        </ListItem>

            {/* More items... */}
        </List>
      </Drawer>


        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#fff', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom component="div">
            My Notes
            </Typography>
            <Typography variant="h6" gutterBottom component="div">
            Welcome to your Dashboard, {username}
            </Typography>
            {/* Content... */}
        </Box>
        </Box>
    </Box>
  </Box>
  );
}

export default Dashboard;
