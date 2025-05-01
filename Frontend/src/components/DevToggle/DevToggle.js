import React, { useState } from 'react';
import { Box, Switch, Typography, Paper } from '@mui/material';
import { useDevMode } from './DevContext';
import { VERSIONS } from '../../version';

const DevToggle = () => {
  const { isDevMode, setIsDevMode } = useDevMode();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 1,
          borderRadius: 1,
          zIndex: 1000,
          opacity: isDevMode || isHovering ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
          '&:hover': {
            opacity: 1
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Typography variant="caption" sx={{ color: 'white' }}>
          Dev Mode {isDevMode ? 'ON' : 'OFF'}
        </Typography>
        <Switch
          size="small"
          checked={isDevMode}
          onChange={(e) => setIsDevMode(e.target.checked)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#00a0a0',
              '& + .MuiSwitch-track': {
                backgroundColor: '#00a0a0',
              },
            },
          }}
        />
      </Box>

      {/* Version info that shows in dev mode */}
      {isDevMode && (
        <Paper 
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            p: 2,
            bgcolor: '#ffeb3b',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            Working {VERSIONS.working}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit {VERSIONS.edit}
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default DevToggle; 