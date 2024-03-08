import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Toolbar,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Fab,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';


// Define sticky note colors
const noteColors = {
  Yellow: "#fff475",
  Red: "#f28b82",
  Green: "#ccff90",
  Blue: "#a7ffeb",
  Orange: "#fbbc04",
};

function Notes() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteColor, setNewNoteColor] = useState('Yellow');
  const [newNoteContent, setNewNoteContent] = useState('');
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


  const handleAddNote = () => {
    setIsAddingNote(true);
  };


  const handleNewNoteChange = (event) => {
    setNewNoteContent(event.target.value);
  };


  const handleColorChange = (event) => {
    setNewNoteColor(event.target.value);
  };


  const handleCancelNewNote = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
  };


  const submitNewNote = () => {
    const noteData = {
      color: newNoteColor,
      content: newNoteContent,
    };

    fetch('/api/add_note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    })
    .then(response => response.json())
    .then(data => {
      setIsAddingNote(false);
      setNewNoteContent('');
      fetchNotes();
    })
    .catch(error => console.error('Error adding note:', error));
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
    <Box sx={{ display: 'flex', flexDirection: 'column'}}>
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
        <Grid container spacing={4} sx={{ p: 4 }}>
          {notes.map((note) => (
            <Grid item key={note.note_id} xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: noteColors[note.color] || '#f0f0f0', maxWidth: '40vw' }}>
                <CardContent>
                  <Typography variant="body2">{note.content}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Box sx={{ margin: 2 }}>
            <Fab color="primary" aria-label="add" onClick={handleAddNote}>
            <AddIcon />
            </Fab>
          </Box>
        </Grid>
      )}
      {isAddingNote && (
        <Card sx={{ margin: 'auto', maxWidth: '50vw', minHeight: '400', backgroundColor: '#ebedf0'}}>
            <CardContent>
                <Box sx={{ marginBottom: 2}}>
                    <RadioGroup row value={newNoteColor} onChange={handleColorChange}>
                    {Object.entries(noteColors).map(([color, hex]) => (
                        <FormControlLabel variant="contained" key={color} value={color} control={<Radio />} label="" sx={{ '& .MuiSvgIcon-root': { fill: hex } }} />
                    ))}
                    </RadioGroup>
                </Box>
                <Card sx={{ bgcolor: noteColors[newNoteColor], marginBottom: 2 }}>
                    <CardContent>
                    <TextField
                        fullWidth
                        multiline
                        variant="outlined"
                        placeholder="Type your note here..."
                        value={newNoteContent}
                        onChange={handleNewNoteChange}
                    />
                    </CardContent>
                    <Typography>&nbsp;</Typography>
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<CancelIcon />} // Assuming you've imported CancelIcon
                    onClick={handleCancelNewNote}
                    sx={{ mt: 3 }} 
                >
                    Cancel
                </Button>
                    <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={submitNewNote}
                    sx={{ mt: 3 }} // This adds margin-top to lift the button from the bottom edge
                    >
                    Confirm
                    </Button>
                </Box>
                {/* <CardActions>
                    <Button
                        startIcon={<SendIcon />} 
                        onClick={submitNewNote}>Confirm</Button>
                </CardActions> */}
            </CardContent>
        </Card>
        )}
    </Box>
  );
}

export default Notes;
