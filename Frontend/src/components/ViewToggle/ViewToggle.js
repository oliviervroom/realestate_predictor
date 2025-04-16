import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ViewListIcon from '@mui/icons-material/ViewList';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import MapIcon from '@mui/icons-material/Map';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  '& .MuiToggleButton-root': {
    border: `1px solid ${theme.palette.divider}`,
    '&.Mui-selected': {
      backgroundColor: '#00a0a0',
      color: 'white',
      '&:hover': {
        backgroundColor: '#008080',
      },
    },
  },
}));

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <StyledToggleButtonGroup
      value={view}
      exclusive
      onChange={(event, newView) => {
        if (newView !== null) {
          onViewChange(newView);
        }
      }}
      aria-label="view mode"
    >
      <ToggleButton value="list" aria-label="list view">
        <ViewListIcon /> List
      </ToggleButton>
      <ToggleButton value="split" aria-label="split view">
        <SplitscreenIcon /> Split
      </ToggleButton>
      <ToggleButton value="map" aria-label="map view">
        <MapIcon /> Map
      </ToggleButton>
    </StyledToggleButtonGroup>
  );
};

export default ViewToggle; 