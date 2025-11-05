# GitHub Copilot Instructions for Kanji Decomposition Manager

## Project Overview
This is a static web application for managing kanji component decompositions. The app allows users to view, edit, and contribute to a database of kanji characters and their component parts through a GitHub Pull Request workflow.

## Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data**: JSON file (`kanji-parts.json`)
- **Deployment**: GitHub Pages (static hosting)
- **No build process**: All files are served directly

## Code Style & Standards

### JavaScript
- Use modern ES6+ syntax (arrow functions, async/await, const/let)
- Use `const` by default; only use `let` when reassignment is necessary
- Never use `var`
- Use template literals for string interpolation
- Prefer arrow functions for callbacks
- Use async/await over promise chains
- Add semicolons at the end of statements
- Use camelCase for variables and functions

### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Maintain clean indentation (4 spaces)
- Use meaningful IDs and classes

### CSS
- Follow existing naming conventions in `styles.css`
- Use class selectors over ID selectors for styling
- Keep specificity low
- Group related properties together
- Use CSS custom properties (variables) for repeated values

## File Organization
- `index.html`: Main HTML structure
- `app.js`: All JavaScript application logic
- `styles.css`: All styling
- `kanji-parts.json`: Data file (key: kanji component, value: array of parts)

## Security Best Practices
- Never commit GitHub Personal Access Tokens or any secrets
- Validate all user input before processing
- Use HTTPS for all external requests
- Sanitize any user-generated content before displaying
- Implement Content Security Policy headers where applicable

## Error Handling
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors to console for debugging
- Display error states in the UI when operations fail
- Always handle fetch/network errors gracefully

## Data Format
The `kanji-parts.json` file contains:
```json
{
  "kanji_component": ["part1", "part2", ...]
}
```
- Keys are kanji characters/components
- Values are arrays of strings representing component parts
- Maintain consistent formatting when modifying

## UI/UX Guidelines
- Keep the interface simple and intuitive
- Provide clear feedback for user actions (success, error, loading states)
- Use modals for edit and PR submission workflows
- Maintain responsive design for mobile and desktop
- Show pagination information clearly
- Display changes count before PR submission

## Git Workflow
- Users submit changes via Pull Requests through the web interface
- The app creates a branch, commits changes, and opens a PR automatically
- All user changes are tracked in `modifiedData` before PR submission
- PRs should include clear titles and descriptions

## Testing
- Since this is a static web app with no test framework, manual testing is required
- Test all user flows: viewing, editing, saving changes, submitting PRs
- Test pagination functionality
- Verify responsive design on different screen sizes
- Test error scenarios (network failures, invalid tokens, etc.)

## Documentation
- Update README.md if adding new features
- Use clear comments for complex logic
- Document function purposes when not obvious
- Keep inline comments minimal and focused on "why" not "what"

## Common Tasks
- **Adding features**: Maintain the single-page app structure
- **Modifying data structure**: Update both load and save logic
- **Styling changes**: Follow existing CSS patterns and class naming
- **API changes**: Remember this uses GitHub REST API v3

## Constraints
- No build step or bundler (webpack, rollup, etc.)
- No package manager or dependencies
- Pure vanilla JavaScript only (no frameworks)
- All code must work in modern browsers (last 2 versions)
- Keep the app lightweight and fast
