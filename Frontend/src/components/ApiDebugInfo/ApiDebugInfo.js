import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ApiDebugInfo = ({ debugInfo }) => {
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopy = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${section} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Accordion sx={{ mt: 4 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>API Debug Information</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {debugInfo && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                API Call:
                <Tooltip title={copySuccess || "Copy request"} placement="top">
                  <IconButton 
                    size="small" 
                    sx={{ ml: 1 }}
                    onClick={() => handleCopy(
                      `POST https://realty-in-us.p.rapidapi.com/properties/v3/list\n` +
                      `Headers: ${JSON.stringify({
                        'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com',
                        'Content-Type': 'application/json'
                      }, null, 2)}\n` +
                      `Request Body: ${JSON.stringify(debugInfo.requestData, null, 2)}`,
                      'Request'
                    )}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  POST https://realty-in-us.p.rapidapi.com/properties/v3/list
                  {'\n'}
                  Headers: {JSON.stringify({
                    'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com',
                    'Content-Type': 'application/json'
                  }, null, 2)}
                  {'\n'}
                  Request Body: {JSON.stringify(debugInfo.requestData, null, 2)}
                </pre>
              </Box>
              <Typography variant="subtitle2" gutterBottom>Debug Steps:</Typography>
              {debugInfo.debugSteps?.map((step, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="primary">{step.step}</Typography>
                  <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </Box>
                </Box>
              ))}
              <Typography variant="subtitle2" gutterBottom>
                Response Data:
                <Tooltip title={copySuccess || "Copy response"} placement="top">
                  <IconButton 
                    size="small" 
                    sx={{ ml: 1 }}
                    onClick={() => handleCopy(JSON.stringify(debugInfo.responseData, null, 2), 'Response')}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(debugInfo.responseData, null, 2)}
                </pre>
              </Box>
              {debugInfo.error && (
                <>
                  <Typography variant="subtitle2" color="error" gutterBottom>Error:</Typography>
                  <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
                    <pre style={{ margin: 0, color: 'white', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(debugInfo.error, null, 2)}
                    </pre>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ApiDebugInfo; 