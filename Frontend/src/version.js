// Working version - only updated when changes are confirmed working
export const WORKING_VERSION = '1.1.7';

// Edit version - increments with each edit, resets when working version updates
export const EDIT_VERSION = 1;

// Version details for changelog
export const versionDetails = {
  'v1.1.7': {
    title: 'Bath Filter Enhancement',
    details: [
      'Fixed bathroom filter in API calls to use correct parameter names (baths_min and baths_max)',
      'Ensured proper filtering of properties based on minimum number of bathrooms',
      'Updated beds/baths interface for consistent range selection'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.6': {
    title: 'Navigation Enhancement',
    details: [
      'Made logo clickable in header',
      'Added homepage navigation when clicking logo',
      'Improved header component accessibility'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.5': {
    title: 'Image Quality Enhancement',
    details: [
      'Improved property image quality in PropertyInfo page',
      'Added high-resolution image support',
      'Enhanced image loading and fallback handling'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.4': {
    title: 'UI Enhancements',
    details: [
      'Fixed dynamic location-based heading updates',
      'Improved search functionality feedback',
      'Enhanced user interface responsiveness'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/e701d89'
  },
  'v1.1.3': {
    title: 'UI Improvements',
    details: [
      'Moved API debug info below location heading',
      'Added dynamic location-based headings',
      'Improved homepage layout organization'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/e701d89'
  },
  'v1.1.2': {
    title: 'Changelog Enhancement',
    details: [
      'Added explicit timezone indication (Eastern Time/Boston)',
      'Improved timestamp display in version history',
      'Enhanced version tracking with time information'
    ],
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/e701d89'
  },
  'v1.1.1': { 
    date: '2025-04-12', 
    time: '12:10 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.0': { 
    date: '2025-04-12', 
    time: '11:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.9': { 
    date: '2024-04-12', 
    time: '11:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.8': { 
    date: '2024-04-12', 
    time: '11:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.7': { 
    date: '2024-04-12', 
    time: '11:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.6': { 
    date: '2024-04-12', 
    time: '10:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.5': { 
    date: '2024-04-12', 
    time: '10:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.4': { 
    date: '2024-04-12', 
    time: '10:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.3': { 
    date: '2024-04-12', 
    time: '10:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.2': { 
    date: '2024-04-12', 
    time: '09:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.0.1': { 
    date: '2025-04-12', 
    time: '11:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/25c70b2'
  },
  'v1.0.0': { 
    date: '2025-04-12', 
    time: '11:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/25c70b2'
  }
};

export const VERSION_HISTORY = {
  'v1.1.7': { date: '2025-04-12', time: '12:40 EDT' },
  'v1.1.6': { date: '2025-04-12', time: '12:35 EDT' },
  'v1.1.5': { date: '2025-04-12', time: '12:30 EDT' },
  'v1.1.4': { date: '2025-04-12', time: '12:25 EDT' },
  'v1.1.3': { date: '2025-04-12', time: '12:20 EDT' },
  'v1.1.2': { date: '2025-04-12', time: '12:16 EDT' },
  'v1.1.1': { date: '2025-04-12', time: '12:10 EDT' },
  'v1.1.0': { date: '2025-04-12', time: '11:45 EDT' },
  'v1.0.9': { date: '2024-04-12', time: '11:30 EDT' },
  'v1.0.8': { date: '2024-04-12', time: '11:15 EDT' },
  'v1.0.7': { date: '2024-04-12', time: '11:00 EDT' },
  'v1.0.6': { date: '2024-04-12', time: '10:45 EDT' },
  'v1.0.5': { date: '2024-04-12', time: '10:30 EDT' },
  'v1.0.4': { date: '2024-04-12', time: '10:15 EDT' },
  'v1.0.3': { date: '2024-04-12', time: '10:00 EDT' },
  'v1.0.2': { date: '2024-04-12', time: '09:45 EDT' },
  'v1.0.1': { date: '2025-04-12', time: '11:30 EDT' },
  'v1.0.0': { date: '2025-04-12', time: '11:15 EDT' }
};

// Format version strings for display
export const formatWorkingVersion = () => `Working ${WORKING_VERSION}`;
export const formatEditVersion = () => `Edit ${EDIT_VERSION}`;

// Export both versions separately instead of combining them
export const VERSIONS = {
  working: `Working ${WORKING_VERSION}`,
  edit: `Edit ${EDIT_VERSION}`,
  history: VERSION_HISTORY
};

// For backward compatibility with existing code
export const VERSION = WORKING_VERSION;

export const CHANGELOG = [
  {
    version: '1.1.7',
    changes: [
      'Fixed bathroom filter in API calls to use correct parameter names (baths_min and baths_max)',
      'Ensured proper filtering of properties based on minimum number of bathrooms'
    ]
  },
  {
    version: '1.1.6',
    changes: [
      'Fixed beds and baths filters in API calls',
      'Added support for range selection in beds and baths filters',
      'Updated API request to properly handle both beds and baths parameters'
    ]
  },
  'v1.1.6 - Added clickable logo navigation to homepage',
  'v1.1.5 - Enhanced property image quality and added high-resolution support',
  'v1.1.4 - Fixed dynamic location-based heading updates',
  `Edit ${EDIT_VERSION} - Moved API debug info to bottom of page and fixed heading updates`,
  'v1.1.3 - Improved homepage layout and dynamic location-based headings',
  'v1.1.2 - Added timezone clarification to Changelog component',
  'v1.1.1 - Added copy buttons for API debug info and improved error handling',
  'v1.1.0 - Switched from local data to live RealtyAPI integration',
  'v1.0.9 - Fixed ESLint warnings and cleaned up unused code',
  'v1.0.8 - Updated RapidAPI key to fix rate limiting',
  'v1.0.7 - Fixed React hooks order in PropertyInfo component',
  'v1.0.6 - Added comprehensive error handling and data validation',
  'v1.0.5 - Added error handling and ErrorMessage component',
  'v1.0.4 - Added version chips to Frame and PropertyInfo pages',
  'v1.0.3 - Fixed ESLint warnings in Frame and SearchBar components',
  'v1.0.2 - Fixed data fetching in Frame component',
  'v1.0.1 - Updated Frame component to handle v3 API data format',
  'v1.0.0 - Initial version with v3 API integration'
]; 