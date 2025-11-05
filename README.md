# Kanji Decomposition Manager

An interactive web application for managing kanji component decompositions. This tool allows users to view, edit, and contribute to a database of kanji characters and their component parts.

## Features

- **Interactive Table**: Browse kanji components in a paginated table
- **Edit Functionality**: Modify the parts array for each kanji component
- **Pull Request Workflow**: Submit changes directly as GitHub Pull Requests
- **Responsive Design**: Works on desktop and mobile devices

## Usage

Visit the GitHub Pages site: [https://ceno.github.io/kanji-decomposition/](https://ceno.github.io/kanji-decomposition/)

### How to Edit

1. **Login**: Click "Login with GitHub" to authenticate (no Personal Access Token needed!)
2. **Browse the table**: View all kanji components and their parts
3. **Click Edit**: Click the "Edit" button for any component you want to modify
4. **Modify parts**: Enter the new parts as comma-separated values (e.g., `豸, 皃, 人`)
5. **Save changes**: Click "Save" to apply your changes
6. **Submit PR**: After making all desired changes, click "Submit Pull Request"
7. **Provide details**: Enter a title and description for your changes
8. **Create PR**: Click "Create Pull Request" to submit your changes

**Note**: The GitHub authentication requires a backend service to securely exchange tokens. See [OAUTH_SETUP.md](OAUTH_SETUP.md) for deployment instructions.

## Data Format

The `kanji-parts.json` file contains a JSON object where:
- **Keys**: Kanji components (characters)
- **Values**: Arrays of parts that make up the component

Example:
```json
{
  "貌": ["豸", "皃"],
  "舷": ["舟", "玄"]
}
```

## Contributing

Contributions are welcome! You can contribute by:
1. Using the web interface to submit Pull Requests
2. Forking this repository and submitting PRs directly
3. Opening issues for bugs or feature requests

## Development

To run locally:
```bash
# Clone the repository
git clone https://github.com/ceno/kanji-decomposition.git
cd kanji-decomposition

# Start a local web server
python3 -m http.server 8080

# Visit http://localhost:8080 in your browser
```

## License

This project is open source and available under the MIT License.