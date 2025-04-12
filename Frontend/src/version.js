// Working version - only updated when changes are confirmed working
export const WORKING_VERSION = '1.1.5';

// Edit version - increments with each edit, resets when working version updates
export const EDIT_VERSION = 1;

// Version details for changelog
export const versionDetails = {
  'v1.1.5': {
    title: 'Image Quality Enhancement',
    details: [
      'Improved property image quality in PropertyInfo page',
      'Added high-resolution image support',
      'Enhanced image loading and fallback handling'
    ]
  },
  'v1.1.4': {
    title: 'UI Enhancements',
    details: [
      'Fixed dynamic location-based heading updates',
      'Improved search functionality feedback',
      'Enhanced user interface responsiveness'
    ]
  },
  'v1.1.3': {
    title: 'UI Improvements',
    details: [
      'Moved API debug info below location heading',
      'Added dynamic location-based headings',
      'Improved homepage layout organization'
    ]
  },
  'v1.1.2': {
    title: 'Changelog Enhancement',
    details: [
      'Added explicit timezone indication (Eastern Time/Boston)',
      'Improved timestamp display in version history',
      'Enhanced version tracking with time information'
    ]
  },
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

export const VERSION_HISTORY = {
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

export const CHANGES = [
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