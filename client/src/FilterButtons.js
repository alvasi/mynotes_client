import React from 'react';
import { ButtonGroup, Button } from '@mui/material';

function FilterButtons({ onFilterChange }) {
  return (
    <ButtonGroup variant="contained" aria-label="outlined primary button group">
      <Button onClick={() => onFilterChange('all')}>All</Button>
      <Button onClick={() => onFilterChange('past')}>Past</Button>
      <Button onClick={() => onFilterChange('current')}>Current</Button>
    </ButtonGroup>
  );
}

export default FilterButtons;
