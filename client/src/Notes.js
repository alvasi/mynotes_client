import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Define sticky note colors
const noteColors = {
  Red: "#f28b82",
  Green: "#ccff90",
  Blue: "#a7ffeb",
  Yellow: "#fff475",
  Orange: "#fbbc04",
};

function Notes() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = () => {
    setLoading(true);
    setError('');
    fetch('/api/view_notes', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setNotes(data); // Assuming the API returns an array of notes directly
      setLoading(false);
    })
    .catch(error => {
      setError('Failed to load notes');
      setLoading(false);
      console.error('Error fetching notes:', error);
    });
  };
 

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
    setIsDrawerOpen(open);
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Notes
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
      >
        <List>
          <ListItem button onClick={handleNavigateToDashboard}>
            <DashboardIcon />
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/login')}>
            <LogoutIcon />
            <ListItemText primary="Log Out" />
          </ListItem>
        </List>
      </Drawer>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={3} sx={{ p: 3 }}>
          {notes.map((note) => (
            <Grid item key={note.note_id} xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: noteColors[note.color] || '#f0f0f0' }}>
                <CardContent>
                  <Typography variant="body2">{note.content}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Notes;
