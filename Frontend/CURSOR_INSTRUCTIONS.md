# Cursor Collaboration Instructions

## Version Control Process
1. **Dual Version System**
   - `Working version X.X.X`: Only updates when changes are confirmed working
   - `Edit version N`: Increments with each edit attempt, resets when working version updates
   - When changes are confirmed working:
     - Increment working version
     - Reset edit version to 1
     - Update changelog
     - Commit changes

2. **Changelog Management**
   - Each working version update includes:
     - Version number
     - Title
     - Detailed list of changes
     - Timestamp in EDT (Boston time)

## Code Organization
1. **API Debug Information**
   - Displayed at the bottom of the page
   - Shows detailed API request/response data
   - Includes performance metrics

2. **Version Display**
   - Format: "Working X.X.X" (no redundant "version" text)
   - Edit version shown during changes
   - All timestamps in Eastern Time (Boston)

## Development Process
1. **Making Changes**
   - Increment edit version for each change attempt
   - Test changes thoroughly
   - Confirm functionality before updating working version

2. **Confirmation Process**
   - When user says "it works" or "update":
     - Update working version
     - Reset edit version
     - Update changelog
     - Commit changes to repository

3. **Error Handling**
   - Clear error messages
   - Detailed debug information
   - User-friendly error displays

## Best Practices
1. **Code Changes**
   - Always test functionality before confirming
   - Keep track of edit versions during development
   - Document all changes in changelog

2. **Communication**
   - Clear confirmation of changes working
   - Explicit version updates
   - Detailed changelog entries

## Quick Reference
- "update" command = confirm changes working + update versions + commit
- Always increment edit version for new changes
- Reset edit version after working version update
- Keep timestamps in EDT (Boston time)
- Place debug info at bottom of page
- Remove redundant "version" text in display 