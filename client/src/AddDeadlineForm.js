import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

function AddDeadlineForm({ onAddDeadline }) {
  const [task, setTask] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onAddDeadline({ task, deadline });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        required
        label="Task"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <TextField
        required
        label="Deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
        Add Deadline
      </Button>
    </Box>
  );
}

export default AddDeadlineForm;
