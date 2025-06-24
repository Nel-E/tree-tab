# Tree Tabs Extension

Tree Tabs is a browser extension designed to enhance tab management by providing a hierarchical tree structure for tabs. This extension integrates seamlessly into the browser's sidebar, offering advanced features for organizing, navigating, and customizing tabs.

## Features

### Sidebar Integration
- **Tree Structure**: Organize tabs in a hierarchical tree format for better visualization and management.
- **Groups and Folders**: Create groups and folders to categorize tabs.
- **Pin List**: Manage pinned tabs separately with multi-row support.

### Toolbar Customization
- **Toolbar Buttons**: Includes buttons for creating new tabs, pinning/unpinning tabs, undoing closed tabs, searching tabs, and more.
- **Shelf Toggles**: Toggle between different toolbar shelves such as tools, groups, and backup options.
- **Customizable Appearance**: Modify toolbar colors, icons, and layout via the options page.

### Theme Management
- **Custom Themes**: Create, rename, delete, import, and export themes to personalize the appearance of tabs and the sidebar.
- **Color and Size Presets**: Apply predefined color schemes and size presets for tabs and toolbar elements.
- **Blinking Effects**: Enable blinking effects for attention-grabbing elements like pinned tabs or audio indicators.

### Advanced Tab Actions
- **Tab Operations**: Duplicate, detach, reload, unload, and close tabs or entire trees.
- **Search and Filter**: Search tabs by title or URL and navigate through search results.
- **Drag-and-Drop**: Rearrange tabs, groups, and folders using drag-and-drop functionality.

### Backup and Restore
- **Session Management**: Save and load sessions, including tabs and their hierarchy.
- **Backup Options**: Export and import backups for tabs, groups, and folders.

### Options Page
- **Settings**: Configure tab behavior, toolbar layout, theme presets, and more.
- **Presets**: Apply predefined settings for tabs, groups, and folders.
- **Debugging Tools**: Export and print debug information for troubleshooting.

### Localization
- **Multi-language Support**: Includes translations for multiple languages, with tools for contributing new translations.

## Installation

1. Clone or download the repository.
2. Open your browser's extensions page.
3. Enable developer mode.
4. Load the extension as an unpacked package.

## File Structure

### Key Files
- **manifest.json**: Defines the extension's metadata, permissions, and entry points.
- **sidebar.html**: The main HTML file for the sidebar interface.
- **options/options.html**: The HTML file for the options page.
- **scripts/**: Contains JavaScript files for core functionality:
  - `toolbar.js`: Handles toolbar events and customization.
  - `theme.js`: Manages themes and appearance settings.
  - `tabs.js`: Implements tab-related operations.
  - `manager.js`: Handles session and backup management.
  - `bookmark.js`: Integrates with the browser's bookmark system.

### Themes
- **theme/**: Contains CSS files for themes, size presets, and blinking effects.

### Localization
- **_locales/**: Includes translations for supported languages.

### Debugging and Testing
- **..TODO/TODO.txt**: Lists pending tasks and features under development.

## Permissions

The extension requires the following permissions:
- **Tabs**: Access and manage browser tabs.
- **Storage**: Save and retrieve settings and session data.
- **Bookmarks**: Integrate with the browser's bookmark system.
- **Sessions**: Manage browser sessions for backup and restore functionality.
- **TabHide**: Hide and show tabs.

## Commands

### Keyboard Shortcuts
- **Alt+W**: Close the current tab tree.

## Version

Current version: **1.9.2**

## License

This project is licensed under the Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0). See the [LICENSE.txt](LICENSE.txt) file for details.

## Support

- [Forum](https://forum.vivaldi.net/topic/15332/tree-tabs)
- [Bug Reports](https://gitlab.com/kroppy/TreeTabs/issues)
- [Email Support](mailto:karol@jagiello.it)

## Contributing

If your language is not supported, you can contribute translations using the built-in translation tool. Visit the `translator/translator.html` page for more details.
