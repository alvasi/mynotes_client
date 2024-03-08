import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from 'axios';
import { AppBar, Box, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

const localizer = momentLocalizer(moment);

const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents(); 
  }, []);

  const fetchEvents = () => {
    axios.get('/api/events')
      .then(response => {
        setEvents(response.data); // This will update the state and should trigger a re-render
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  };


  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };


  const handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      const newEvent = {
        start,
        end,
        title,
      };

      axios.post('/api/events', newEvent, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(() => {
          // After successfully adding a new event, fetch all events again
          fetchEvents();
        })
        .catch(error => {
          console.error('Error saving event:', error);
        });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setIsDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Calendar
          </Typography>
        </Toolbar>
      </AppBar>
  
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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
  
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          height: 'calc(100vh - 64px)', // Adjust the height based on AppBar height
        }}
      >
        <Calendar
          selectable
          onSelectSlot={handleSelect}
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          events={events}
          style={{ height: '100%' }} // Use 100% of the container height
        />
      </Box>
    </Box>
  );
      };
  

export default SchedulePage;
