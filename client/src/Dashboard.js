import React, { useState, useEffect } from 'react';
import { Box, Button,  Typography, AppBar, Toolbar, Card, CardContent, IconButton } from '@mui/material';
import {  Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CachedIcon from '@mui/icons-material/Cached';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WaterDropIcon from '@mui/icons-material/WaterDrop';



function Dashboard() {
  const [username, setUsername] = useState('');
  const [encouragingText, setEncouragingText] = useState("You can do it!");
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState({ temperature: '', description: '' });

  const [anchorEl, setAnchorEl] = useState(null); // For user menu
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // For initial delete confirmation dialog
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false); // For final delete confirmation dialog

  // View deadlines
  const handleViewDeadlines = () => {
    fetch('/api/view_deadlines?type=all')
      .then(response => response.json())
      .then(data => {
        navigate('/deadlines', { state: { deadlines: data.entries } });
      })
      .catch(error => {
        console.error('Error fetching deadlines:', error);
      });
  };
  
  // View notebooks
  const handleViewNotes = () => {
    fetch('/api/view_notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      navigate('/notes', { state: { notes: data } }); 
    })
    .catch(error => {
      console.error('Error fetching notes:', error);
    });
  };


  // View calendar
  const handleViewCalendar = () => {
    navigate('/calendar'); 
  };


  // Get motivational text
  const refreshEncouragingText = () => {
    fetch('/greeting')  // Endpoint for your Flask greeting function
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          setEncouragingText(data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching encouraging text:', error);
      });
  };

  const getWeatherIcon = (description) => {
    const weatherConditions = {
      'Sunny': <WbSunnyIcon />,
      'Clear': <WbSunnyIcon />, 
      'Partly cloudy': <CloudIcon />, 
      'Cloudy': <CloudIcon />,
      'Overcast': <CloudIcon />,
      'Patchy snow possible': <AcUnitIcon />,
      'Patchy freezing drizzle possible': <AcUnitIcon />,
      'Thundery outbreaks possible': <ThunderstormIcon />,
      'Blowing snow': <AcUnitIcon />,
      'Blizzard': <AcUnitIcon />,
      'Fog': <CloudIcon />,
      'Freezing fog': <AcUnitIcon />,

    };
  
    return description ? weatherConditions[description] || <WaterDropIcon /> : null;
  };

  const handleCheckWeather = (event) => {
    event.preventDefault(); // Prevents the default form submit action
  
    fetch(`/api/current_weather?city=${encodeURIComponent(city)}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Could not retrieve weather data');
        }
      })
      .then(data => {
        console.log(data); // Log the data to see what you're receiving
        if (!data.error) {
          setWeatherData({
            temperature: data.temperature,
            description: data.weather_description // Make sure this matches the key in the response
          });
        } else {
          // Handle any error messages from your API here
          setWeatherData({ temperature: '', description: data.error });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setWeatherData({ temperature: '', description: 'Oops! Try entering another place' });
      });
  };
  
  
  // Delete an account -- Don't try it for fun

  // Handler to open user menu
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler to close user menu
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Handlers for delete dialog
  const handleDeleteAccountClick = () => {
    handleUserMenuClose(); // Close the user menu when delete is clicked
    setOpenDeleteDialog(true); // Open initial delete confirmation dialog
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenConfirmDeleteDialog = () => {
    setOpenDeleteDialog(false); // Close the initial dialog
    setOpenConfirmDeleteDialog(true); // Open the final confirmation dialog
  };

  const handleCloseConfirmDeleteDialog = () => {
    setOpenConfirmDeleteDialog(false); // Close the final confirmation dialog
  };

  const handleFinalDeleteConfirmation = () => {
    // API call to delete account
    fetch('/api/delete_account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirect to login page or handle account deletion success
        window.location.href = '/login';
      } else {
        // Handle account deletion failure
        console.error('Failed to delete account:', data.error);
      }
    })
    .catch(error => console.error('Error deleting account:', error));

    setOpenConfirmDeleteDialog(false); // Close the final confirmation dialog
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


return (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh',  backgroundColor: '#f8f9fa' }}>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Notes
        </Typography>
        <Button color="inherit" onClick={handleUserMenuClick}>
          {username}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
        >
          <MenuItem onClick={handleDeleteAccountClick} sx={{ color: 'error.main' }}>Delete Account</MenuItem>
        </Menu>
        <Button color="inherit" onClick={() =>  window.location.href = '/login'}>Log out</Button>
      </Toolbar>
    </AppBar>

    {/* Dialog for initial deletion confirmation */}
    <Dialog
      open={openDeleteDialog}
      onClose={handleCloseDeleteDialog}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">{"Delete Account?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete your account? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteDialog} color="primary">Cancel</Button>
        <Button onClick={handleOpenConfirmDeleteDialog} color="primary" autoFocus>Delete</Button>
      </DialogActions>
    </Dialog>

    {/* Dialog for final confirmation of account deletion */}
    <Dialog
      open={openConfirmDeleteDialog}
      onClose={handleCloseConfirmDeleteDialog}
      aria-labelledby="confirm-delete-dialog-title"
      aria-describedby="confirm-delete-dialog-description"
    >
      <DialogTitle id="confirm-delete-dialog-title">{"100% Sure?"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-delete-dialog-description">
          This action cannot be undone. Are you absolutely sure?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseConfirmDeleteDialog} color="primary">Cancel</Button>
        <Button onClick={handleFinalDeleteConfirmation} color="primary" autoFocus>Confirm Delete</Button>
      </DialogActions>
    </Dialog>

    {/* Welcome message */}
    <Typography variant="h3" sx={{ my: 4, textAlign: 'center' }}>
      <br/><br/>
      Welcome to your Dashboard, {username}
    </Typography>

    <Box
      sx={{
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column', // Stack items vertically
        alignItems: 'center', // Center items horizontally
        justifyContent: 'flex-start', // Align items to the start vertically
      }}
    >
      {/* My Deadlines, My Notes, and My Calendar Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'row',  gap: 10, mb: 4 }}>
        <Button
          variant="contained"
          sx={{
            borderRadius: 16, // Rounded edges
            width: '200px', // Set width of the button
            height: '60px', // Set height of the button
            fontSize: '1rem', // Increase font size inside the button
          }}
          onClick={handleViewDeadlines}
        >
          My Deadlines
        </Button>

        <Button
          variant="contained"
          sx={{
            borderRadius: 16, // Rounded edges
            width: '200px', // Set width of the button
            height: '60px', // Set height of the button
            fontSize: '1rem', // Increase font size inside the button
          }}
          onClick={handleViewNotes} 
        >
          My Notes
        </Button>

        <Button
          variant="contained"
          sx={{
            borderRadius: 16, // Rounded edges
            width: '200px', // Set width of the button
            height: '60px', // Set height of the button
            fontSize: '1rem', // Increase font size inside the button
          }}
          onClick={handleViewCalendar}
        >
          My Calendar
        </Button>
      </Box>

      {/* Weather Check Form */}
      <Box component="form" onSubmit={handleCheckWeather} sx={{ mb: 2 }}>
        <TextField
          label="Check Weather"
          variant="outlined"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button type="submit" variant="outlined" color="primary" disabled={!city.trim()}>
          Check
        </Button>
      </Box>

     {/* Weather Data Display */}
      {weatherData.temperature ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 4,
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '16px',
            boxShadow: 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <Typography variant="h6" sx={{ mr: 1 }}>
            {`${weatherData.temperature}°C`}
          </Typography>
          {getWeatherIcon(weatherData.description)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {weatherData.description}
          </Typography>
        </Box>
        ) : weatherData.description !== '' ? (
          // <Typography sx={{ mt: 4, textAlign: 'center', color: 'grey' }}>
          <Typography variant="subtitle1" style={{ color: 'grey' }}>
            {weatherData.description}
          </Typography>
        ) : null}

      <br/><br/>
      {/* Encouraging text Card */}
      <Card sx={{ 
        minWidth: 500, 
        maxWidth: '70vw',
        textAlign: 'center', 
        position: 'relative', 
        '&:hover': {
            backgroundColor: '#f0f0f0', // Lighter grey on hover
          }, 
      }}>
        <CardContent>
          <Typography sx={{ fontSize: 20, mb: 1.5 }}>
            <InsertEmoticonIcon sx={{ verticalAlign: 'middle', fontSize: 50 }} />
          </Typography>
          <Typography variant="h5" component="div">
            {encouragingText}
          </Typography>
          <IconButton
            sx={{ position: 'absolute', top: 16, right: 16 }}
            onClick={refreshEncouragingText}
          >
            <CachedIcon />
          </IconButton>
        </CardContent>
      </Card>
    </Box>
  </Box>
);
}

export default Dashboard;