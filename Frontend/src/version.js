// Working version - only updated when changes are confirmed working
export const WORKING_VERSION = "1.0.8";

// Edit version - increments with each edit, resets when working version updates
export const EDIT_VERSION = 33;

// Version details for changelog
export const versionDetails = {
  'v1.1.20': {
    title: 'Price Filter Debug Enhancement',
    details: [
      'Added detailed logging for price filtering process',
      'Added property-level price check logging',
      'Added summary statistics for filtered results',
      'Improved debugging capabilities for filter issues'
    ],
    date: '2024-04-12',
    time: '16:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.19': {
    title: 'Local Filter Enhancement',
    details: [
      'Added local filtering for price, beds, baths, and square footage',
      'Implemented fallback filtering when API filtering fails',
      'Improved filter reliability and consistency'
    ],
    date: '2024-04-12',
    time: '16:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.18': {
    title: 'Price Filter Fix',
    details: [
      'Fixed price filter not being properly included in API requests',
      'Modified request data structure to include filters at root level',
      'Improved filter handling for beds, baths, and square footage'
    ],
    date: '2024-04-12',
    time: '15:50 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.17': {
    title: 'Market Positioning Drag Behavior Fix',
    details: [
      'Fixed drag behavior to follow horizontal position regardless of vertical mouse movement',
      'Simplified position calculation logic',
      'Improved user experience for rate adjustment'
    ],
    date: '2024-04-12',
    time: '15:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.16': {
    title: 'Market Positioning Interaction Enhancement',
    details: [
      'Constrained drag movement to horizontal direction only',
      'Added touch support for mobile devices',
      'Improved drag precision and boundary handling',
      'Prevented default touch actions for better control'
    ],
    date: '2024-04-12',
    time: '15:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.15': {
    title: 'Market Positioning UI Enhancement',
    details: [
      'Increased visibility of rental rate numbers',
      'Added color coding for percentage differences',
      'Improved typography hierarchy for better readability',
      'Enhanced visual feedback for market rate comparison'
    ],
    date: '2024-04-12',
    time: '15:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.14': {
    title: 'Market Positioning Enhancement',
    details: [
      'Removed adjustable rental income slider',
      'Added draggable circle to market positioning bar',
      'Added percentage display for market rate comparison',
      'Added reset button to return to predicted rate'
    ],
    date: '2024-04-12',
    time: '15:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.13': {
    title: 'Rental Prediction Fallback Enhancement',
    details: [
      'Added fallback to local prediction when API returns "not found"',
      'Improved rental prediction reliability',
      'Enhanced user experience with consistent predictions'
    ],
    date: '2024-04-12',
    time: '14:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.12': {
    title: 'Enhanced Rental Prediction Fallback',
    details: [
      'Added sophisticated fallback calculation for rental predictions',
      'Base calculation on 1% of list price with property feature adjustments',
      'Added randomness and bounds to make predictions more realistic'
    ],
    date: '2024-04-12',
    time: '14:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
  'v1.1.11': {
    title: 'Property Card Predictions Enhancement',
    details: [
      'Made property predictions (sale and rent) only visible in dev mode',
      'Improved user experience by hiding development features in production'
    ],
    date: '2024-04-12',
    time: '14:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/2f2b075'
  },
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
  },
  'v1.1.21': {
    title: 'Price Filter Fix',
    details: [
      'Fixed price filter value handling',
      'Added proper number validation and bounds checking',
      'Improved price range validation',
      'Fixed race condition in price updates'
    ],
    date: '2024-04-12',
    time: '16:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/price-filter-fix'
  },
  'v1.1.22': {
    title: 'API Price Filter Format Fix',
    details: [
      'Fixed list_price filter format to match API specification',
      'Properly structured min/max values in API request',
      'Improved API filter reliability'
    ],
    date: '2024-04-12',
    time: '16:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/api-price-filter-fix'
  },
  'v1.1.23': {
    title: 'Local Filter Logic Fix',
    details: [
      'Fixed local filter checks to properly validate min/max values',
      'Improved filter condition checks for price, beds, baths, and sqft',
      'Enhanced filter reliability by checking actual filter values'
    ],
    date: '2024-04-12',
    time: '17:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/local-filter-fix'
  },
  'v1.1.24': {
    title: 'Price Sorting Feature',
    details: [
      'Added ability to sort properties by price',
      'Implemented ascending and descending price sorting',
      'Added sort parameter to API request'
    ],
    date: '2024-04-12',
    time: '17:15 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/price-sorting'
  },
  'v1.1.25': {
    title: 'Price Sort Toggle UI',
    details: [
      'Added SortToggle component for price sorting',
      'Implemented ascending/descending price sort buttons',
      'Added sort state management in Properties screen',
      'Integrated sort toggle with existing filter UI'
    ],
    date: '2024-04-12',
    time: '17:30 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/sort-toggle-ui'
  },
  'v1.1.26': {
    title: 'Duplicate Property Fix',
    details: [
      'Fixed React key warning by removing duplicate properties',
      'Added property_id uniqueness check',
      'Improved property list rendering reliability'
    ],
    date: '2024-04-12',
    time: '17:45 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/duplicate-property-fix'
  },
  'v1.1.27': {
    title: 'Sort Toggle Text Update',
    details: [
      'Updated sort toggle button text to be more concise',
      'Added dollar sign to price sort indicators',
      'Improved sort direction clarity'
    ],
    date: '2024-04-12',
    time: '18:00 EDT',
    commit: 'https://github.com/oliviervroom/realestate_predictor/commit/sort-toggle-text'
  },
  'v1.1.28': {
    title: 'Price Trend Data Enhancement',
    details: [
      'Modified price trend data to only show when 2+ real data points are available',
      'Added date-based sorting for price trend data points',
      'Improved accuracy by using actual dates from API response',
      'Removed estimated/projected data points'
    ],
    date: '2024-04-12',
    time: '18:15 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/price-trend-enhancement'
  },
  'v1.1.29': {
    title: 'Price Trend Data Update',
    details: [
      'Removed estimate from price trend data',
      'Added predicted price to price trend visualization',
      'Improved accuracy of price trend display'
    ],
    date: '2024-04-12',
    time: '18:30 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/price-trend-update'
  },
  'v1.1.30': {
    title: 'Price Trend Data Threshold Update',
    details: [
      'Increased minimum data points required for price trend display to 3',
      'Improved trend visualization accuracy',
      'Ensures more reliable price trend patterns'
    ],
    date: '2024-04-12',
    time: '18:45 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/price-trend-threshold'
  },
  'v1.1.31': {
    title: 'Price Trend Generation Enhancement',
    details: [
      'Added realistic price trend generation when MLS data is unavailable',
      'Implemented historical appreciation rate calculation',
      'Added intermediate data points for smooth trend visualization',
      'Improved prediction accuracy with conservative estimates'
    ],
    date: '2024-04-12',
    time: '19:00 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/price-trend-generation'
  },
  'v1.1.32': {
    title: '10-Year Price Trend Enhancement',
    details: [
      'Extended price trend visualization to show 10 years of data',
      'Added historical price calculations for years before last sale',
      'Improved trend accuracy with forward and backward calculations',
      'Enhanced visualization of long-term property value changes'
    ],
    date: '2024-04-12',
    time: '19:15 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/10-year-trend'
  },
  'v1.1.33': {
    title: '10-Year Price Trend Realism Update',
    details: [
      'Improved starting value for 10-year price trend by projecting backward from last sold or list price',
      'Used 3% annual appreciation rate for interpolation',
      'Ensured smooth, realistic trend from 10 years ago to present',
      'Eliminated unrealistic high starting values'
    ],
    date: '2024-04-12',
    time: '19:30 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/10-year-trend-realism'
  },
  'v1.1.34': {
    title: 'Price Trend Fluctuation & Dev Mode Display',
    details: [
      'Added realistic year-to-year fluctuations to 10-year price trend',
      'Wrapped Price Estimate Trend section in DevModeWrapper',
      'Price trend now only displays in dev mode',
      'Ensured final year uses predicted price if available'
    ],
    date: '2024-04-12',
    time: '19:45 EDT',
    commit: 'https://github.com/yourusername/realestate_predictor/commit/price-trend-fluctuation-devmode'
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