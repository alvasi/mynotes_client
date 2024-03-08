import React, { useState, useEffect } from 'react';
import { Box, Button,  Typography, AppBar, Toolbar, Card, CardContent, IconButton } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CachedIcon from '@mui/icons-material/Cached';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [username, setUsername] = useState('');
  const [encouragingText, setEncouragingText] = useState("You can do it!");
  const navigate = useNavigate();

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
        <Typography variant="h6" component="div" sx={{ marginRight: 2}}>
          {username}     
        </Typography>
        <Button color="inherit" onClick={() => navigate('/login')}>Log out</Button>
      </Toolbar>
    </AppBar>

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
      {/* My Deadlines and My Notebooks Buttons */}
      <Box sx={{ display: 'flex', flexDirection: 'row',  gap: 10, mb: 4 }}>
        <Button
          variant="contained"
          sx={{
            borderRadius: 16, // Rounded edges
            width: '200px', // Set width of the button
            height: '60px', // Set height of the button
            fontSize: '1rem', // Increase font size inside the button
            mr: 2, // Add margin to the right
          }}
          onClick={handleViewDeadlines}
        >
          My Deadlines
        </Button>

        {/* Placeholder for My Notebooks Button */}
        <Button
          variant="contained"
          sx={{
            borderRadius: 16, // Rounded edges
            width: '200px', // Set width of the button
            height: '60px', // Set height of the button
            fontSize: '1rem', // Increase font size inside the button
            ml: 2, // Add margin to the left
          }}
          onClick={handleViewNotes} 
        >
          My Notes
        </Button>
      </Box>

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