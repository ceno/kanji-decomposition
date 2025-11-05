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

1. **Browse the table**: View all kanji components and their parts
2. **Click Edit**: Click the "Edit" button for any component you want to modify
3. **Modify parts**: Enter the new parts as comma-separated values (e.g., `豸, 皃, 人`)
4. **Save changes**: Click "Save" to apply your changes
5. **Submit PR**: After making all desired changes, click "Submit Pull Request"
6. **Provide details**: 
   - Enter a title and description for your changes
   - Provide a GitHub Personal Access Token with `repo` scope ([create one here](https://github.com/settings/tokens/new?scopes=repo&description=Kanji%20Decomposition%20Editor))
7. **Create PR**: Click "Create Pull Request" to submit your changes

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