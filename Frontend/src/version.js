// Working version - only updated when changes are confirmed working
export const WORKING_VERSION = "1.0.8";

// Edit version - increments with each edit, resets when working version updates
export const EDIT_VERSION = 9;

// Version details for changelog
export const versionDetails = {
  'v1.1.9': {
    title: 'Homepage Text and Search Improvements',
    details: [
      'Updated homepage title to "Properties in Manchester, NH"',
      'Changed subtitle to "Available properties for investment"',
      'Fixed filter functionality for default Manchester, NH location',
      'Improved search handling to properly include city and state'
    ],
    date: '2024-04-11',
    time: '13:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/0bdad03'
  },
  'v1.1.8': {
    title: 'Filter System Optimization',
    details: [
      'Removed season and month filters to focus on core property attributes',
      'Enhanced API debug information display in UI',
      'Improved filter state management and API request handling',
      'Updated property filtering to use correct API parameters',
      'Added detailed debug steps for filter operations'
    ],
    date: '2024-04-11',
    time: '13:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.7': {
    title: 'Price Filter Enhancement',
    details: [
      'Added modern price range selector with slider and input fields',
      'Implemented client-side price validation to ensure strict price range filtering',
      'Added support for one-sided price ranges (min-only or max-only)',
      'Updated price display formatting ($XXk, $X.XM)',
      'Fixed API integration to properly handle price range parameters',
      'Improved UX with dynamic slider behavior and clear input fields',
      'Added square footage filter with 5 sqft precision and 4,000+ sqft max range',
      'Updated API integration to handle square footage filtering'
    ],
    date: '2024-04-11',
    time: '12:40 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.6': {
    title: 'Navigation Enhancement',
    details: [
      'Made logo clickable in header',
      'Added homepage navigation when clicking logo',
      'Improved header component accessibility'
    ],
    date: '2024-04-11',
    time: '12:35 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/d5a674e'
  },
  'v1.1.5': {
    title: 'Image Quality Enhancement',
    details: [
      'Improved property image quality in PropertyInfo page',
      'Added high-resolution image support',
      'Enhanced image loading and fallback handling'
    ],
    date: '2024-04-11',
    time: '12:30 EDT',
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
  },
  'v1.1.10': {
    title: 'Search Navigation Enhancement',
    details: [
      'Modified search behavior to navigate to neighborhood level instead of specific address',
      'Improved user experience for address searches'
    ],
    date: '2024-04-12',
    time: '14:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  }
};

// Export both versions separately
export const VERSIONS = {
  working: '1.0.11',
  edit: '16',
  history: versionDetails,
  changelog: {
    '1.0.11': 'Hide raw MLS data button when dev mode is disabled',
    '1.0.10': 'Added consistent predictions across property cards and detail pages',
    '1.0.9': 'Development mode now enabled by default',
    '1.0.8': 'Consolidated version display into single yellow box',
    '1.0.7': 'Added dev mode toggle with hover functionality',
    '1.0.6': 'Added version display to property cards',
    '1.0.5': 'Added version display to search results',
    '1.0.4': 'Added version display to property info page',
    '1.0.3': 'Added version display to search page',
    '1.0.2': 'Added version display to home page',
    '1.0.1': 'Added version display to header',
    '1.0.0': 'Initial version'
  }
};

// For backward compatibility with existing code
export const VERSION = {
  working: '1.0.10',
  edit: '15',
  changelog: {
    '1.0.10': 'Added consistent predictions across property cards and detail pages',
    '1.0.9': 'Development mode now enabled by default',
    '1.0.8': 'Consolidated version display into single yellow box',
    '1.0.7': 'Added dev mode toggle with hover functionality',
    '1.0.6': 'Added version display to property cards',
    '1.0.5': 'Added version display to search results',
    '1.0.4': 'Added version display to property info page',
    '1.0.3': 'Added version display to search page',
    '1.0.2': 'Added version display to home page',
    '1.0.1': 'Added version display to header',
    '1.0.0': 'Initial version'
  }
};

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
  'v1.0.0 - Initial version with v3 API integration',
  {
    version: '1.0.1',
    date: '2024-04-30',
    changes: [
      'Added development mode toggle to hide version chips and API debug info',
      'Added version-chip class to all version chips',
      'Added CSS to hide development elements when dev mode is off'
    ]
  },
  {
    version: '1.0.2',
    date: '2024-04-30',
    changes: [
      'Fixed development mode toggle to properly hide API debug information',
      'Added api-debug-info class to all debug information sections'
    ]
  },
  {
    version: '1.0.3',
    date: '2024-04-30',
    changes: [
      'Improved development mode toggle using React Context',
      'Added DevModeWrapper component for conditional rendering',
      'Updated all components to use DevModeWrapper for dev-only elements'
    ]
  },
  {
    version: '1.0.8 (Edit 7)',
    date: '2024-04-30',
    changes: [
      'Consolidated version display into single dev mode component',
      'Removed duplicate version displays',
      'Standardized version numbering system'
    ]
  },
  {
    version: '1.0.9',
    date: '2024-04-30',
    changes: [
      'Made development mode enabled by default',
      'Updated version numbers to reflect changes'
    ]
  },
  {
    version: '1.0.10',
    date: '2024-04-30',
    changes: [
      'Added predicted rental price and monthly cashflow to property cards',
      'Implemented consistent predictions using property address hash',
      'Added visual indicators for positive/negative cashflow'
    ]
  },
  {
    version: '1.0.11',
    date: '2024-04-30',
    changes: [
      'Hide raw MLS data button and dialog when dev mode is disabled',
      'Wrapped MLS data section with DevModeWrapper component'
    ]
  },
  {
    version: '1.1.10',
    date: '2024-04-12',
    changes: [
      'Modified search behavior to navigate to neighborhood level instead of specific address',
      'Improved user experience for address searches'
    ]
  }
]; 