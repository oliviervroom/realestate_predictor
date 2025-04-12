# Cursor Collaboration Instructions

## Version Management

### Working Version (WORKING_VERSION)
- Only update when changes are confirmed working by the user
- Never update automatically or without explicit user confirmation
- This is the stable version number that represents verified working code

### Edit Version (EDIT_VERSION)
- Increments with each edit attempt
- Resets when working version updates
- Used to track iterations of changes before they are confirmed working

### Version Update Process
1. Make code changes
2. Test changes
3. Wait for user confirmation that changes work as expected
4. Only after user confirmation:
   - Update WORKING_VERSION
   - Reset EDIT_VERSION to 1
   - Update changelog

### Changelog Management
- Add new entries at the top
- Include clear descriptions of changes
- Add commit links when available
- Use consistent formatting

## Code Editing Guidelines

### Making Changes
1. Always read existing code before making changes
2. Use semantic search to understand the codebase
3. Make minimal necessary changes
4. Add proper error handling
5. Update comments as needed

### Testing
1. Test changes before committing
2. Verify API integrations
3. Check for side effects
4. Ensure backward compatibility

### Error Handling
1. Add appropriate error messages
2. Include proper validation
3. Handle edge cases
4. Log errors for debugging

## API Integration

### API Calls
1. Use proper error handling
2. Include timeout handling
3. Validate responses
4. Log request/response for debugging

### Data Processing
1. Validate data structure
2. Handle missing or null values
3. Transform data consistently
4. Maintain data types

## Best Practices

### Code Style
1. Follow existing patterns
2. Use consistent formatting
3. Add meaningful comments
4. Use descriptive variable names

### Component Structure
1. Keep components focused
2. Reuse existing components
3. Maintain proper hierarchy
4. Follow React best practices

### State Management
1. Use appropriate state location
2. Handle side effects properly
3. Maintain data consistency
4. Consider performance implications

## Version Control Process
1. **Dual Version System**
   - `Working version X.X.X`: Only updates when changes are confirmed working
   - `Edit version N`: Increments with each edit attempt, resets when working version updates
   - When user says "update and push":
     - Increment working version
     - Reset edit version to 1
     - Update changelog
     - Commit changes
     - Push to repository

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
   - When user says "it works":
     - Confirm functionality is working
     - Continue with next changes
   - When user says "update and push":
     - Update working version
     - Reset edit version
     - Update changelog
     - Commit all changes
     - Push to repository

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
- "it works" = confirm functionality only
- "update and push" = update versions + changelog + commit + push
- Always increment edit version for new changes
- Reset edit version after working version update
- Keep timestamps in EDT (Boston time)
- Place debug info at bottom of page
- Remove redundant "version" text in display 