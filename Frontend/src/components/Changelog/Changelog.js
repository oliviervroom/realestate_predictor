import React from 'react';
import { Box, Container, Typography, Paper, Chip, Divider } from '@mui/material';
import { versionDetails } from '../../version';
import Header from '../Header';

const Changelog = () => {
  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Changelog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track the evolution of our real estate prediction tool.
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Version History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {Object.entries(versionDetails).map(([version, details]) => (
            <Box key={version} sx={{ mb: 2 }}>
              <Typography variant="h6">
                {version} - {details.title || 'Update'} 
                {details.date && ` (${details.date}${details.time ? ` ${details.time}` : ''})`}
              </Typography>
              {details.details && (
                <Box component="ul" sx={{ mt: 1, mb: 2 }}>
                  {details.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </Box>
              )}
              {details.commit && (
                <Typography variant="body2" color="text.secondary">
                  <a href={details.commit} target="_blank" rel="noopener noreferrer">
                    View changes
                  </a>
                </Typography>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default Changelog; 