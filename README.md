# Zeno UI

A beautiful, responsive UI library built with vanilla CSS, HTML, and JavaScript. Works great on mobile and desktop. Zero dependencies, no build tools required.

## Features

- 🎨 **40+ UI Components** - Buttons, forms, modals, tables, and more
- 📱 **Mobile-First Design** - Responsive components that work on any device
- 🚀 **Zero Dependencies** - Pure vanilla JavaScript, CSS, and HTML
- 🎯 **Easy to Use** - Just include the CSS and JS files
- 🎨 **Customizable** - Built with CSS custom properties for easy theming
- ⚡ **Lightweight** - Optimized and minified for production

## Installation

### Via CDN (jsDelivr)

Include the CSS and JavaScript files in your HTML:

```html
<!-- CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/goyatg/zeno@v1.0.0/dist/styles.min.css"
/>

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/goyatg/zeno@v1.0.0/dist/script.min.js"></script>
```

**Note:** Replace `v1.0.0` with the version you want to use. For the latest version, you can use:

- `@latest` - Latest release
- `@master` - Latest commit from master branch

### Example: Using Latest Version

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/goyatg/zeno@latest/dist/styles.min.css"
/>
<script src="https://cdn.jsdelivr.net/gh/goyatg/zeno@latest/dist/script.min.js"></script>
```

## Quick Start

1. **Include the files** in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/goyatg/zeno@v1.0.0/dist/styles.min.css"
    />
  </head>
  <body>
    <!-- Your content here -->
    <button class="btn btn-primary">Click Me</button>

    <script src="https://cdn.jsdelivr.net/gh/goyatg/zeno@v1.0.0/dist/script.min.js"></script>
  </body>
</html>
```

2. **Components auto-initialize** when the DOM is ready. No additional setup needed!

## Available Components

### Basic Components

- **Buttons** - Primary, secondary, outline, and more variants
- **Cards** - Container components for content
- **Badges** - Status indicators and labels
- **Avatars** - User profile images
- **Chips** - Tag-like components
- **Dividers** - Visual separators

### Form Components

- **Form Inputs** - Text, email, number, textarea, etc.
- **Select** - Dropdown select menus
- **Multiselect** - Multiple selection dropdowns
- **Autocomplete** - Searchable input with suggestions
- **Toggles** - Checkboxes, radio buttons, switches
- **Password Input** - Password field with show/hide toggle
- **Range Sliders** - Single and dual range sliders
- **File Upload** - Drag and drop file upload zone

### Pickers

- **Date Picker** - Calendar date selection
- **Time Picker** - Time selection component

### Data Display

- **Lists** - Various list styles and layouts
- **Data Tables** - Sortable, filterable tables with pagination
- **Stats** - Statistical display cards
- **Empty State** - Placeholder for empty content

### Navigation & Layout

- **Tabs** - Tabbed content navigation
- **Accordion** - Collapsible content sections
- **Breadcrumbs** - Navigation path indicators
- **Pagination** - Page navigation controls
- **Steps/Wizard** - Multi-step process indicators
- **Segmented Control** - Button group selection
- **Tabbar** - Bottom navigation bar

### Overlays & Modals

- **Modals** - Dialog boxes and popups
- **Action Sheets** - Mobile-style bottom sheets
- **Drawer** - Slide-out side panels
- **Tooltips** - Contextual help text
- **Popovers** - Rich content popups
- **Menu Dropdown** - Dropdown menus

### Feedback & Status

- **Alerts** - Notification messages
- **Progress Bars** - Loading and progress indicators
- **Loaders** - Spinner animations
- **Toast Notifications** - Temporary messages
- **Rating** - Star rating component

### Utilities

- **Searchbar** - Search input component
- **FAB (Floating Action Button)** - Quick action button
- **Back to Top** - Scroll to top button
- **Copy to Clipboard** - Copy functionality
- **Share** - Social sharing component
- **Screenshot** - Capture screen functionality

## Usage Examples

### Buttons

```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-outline">Outline Button</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Forms

```html
<div class="form-group">
  <label class="label">Email</label>
  <input type="email" class="input" placeholder="Enter your email" />
</div>

<div class="form-group">
  <label class="label">Message</label>
  <textarea class="input" rows="4" placeholder="Enter your message"></textarea>
</div>
```

### Modals

```html
<!-- Trigger button -->
<button class="btn btn-primary" onclick="ZenoModal.open('my-modal')">
  Open Modal
</button>

<!-- Modal -->
<div class="modal" id="my-modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Modal Title</h3>
      <button class="modal-close" onclick="ZenoModal.close('my-modal')">
        ×
      </button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="ZenoModal.close('my-modal')">
        Cancel
      </button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Tabs

```html
<div class="tabs">
  <div class="tabs-header">
    <button class="tab active">Tab 1</button>
    <button class="tab">Tab 2</button>
    <button class="tab">Tab 3</button>
  </div>
  <div class="tab-content active">
    <p>Content for Tab 1</p>
  </div>
  <div class="tab-content">
    <p>Content for Tab 2</p>
  </div>
  <div class="tab-content">
    <p>Content for Tab 3</p>
  </div>
</div>
```

## JavaScript API

All components are automatically initialized when the DOM loads. The library exposes a global `ZenoUI` object and individual component objects for programmatic control:

```javascript
// Initialize all components (auto-called on DOM ready)
ZenoUI.init();

// Open a modal programmatically
ZenoModal.open("modal-id");

// Close a modal
ZenoModal.close("modal-id");

// Show a toast notification
ZenoToast.show("Message", "success");

// Open an action sheet
ZenoActionSheet.open("sheet-id");
```

## Customization

Zeno UI uses CSS custom properties (variables) for easy theming. You can override these variables to customize the appearance:

```css
:root {
  --primary: #2d4a3e;
  --secondary: #8b7355;
  --success: #4caf50;
  --danger: #f44336;
  --warning: #ff9800;
  --info: #2196f3;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

## Layout System

Zeno UI includes a flexible grid system that doesn't require row wrappers:

```html
<!-- Two columns -->
<div class="grid-2">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Three columns -->
<div class="grid-3">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Responsive columns -->
<div class="grid-2 grid-md-3 grid-lg-4">
  <div>Responsive item</div>
  <div>Responsive item</div>
  <div>Responsive item</div>
</div>
```

## Browser Support

Zeno UI works in all modern browsers that support:

- CSS Custom Properties (CSS Variables)
- CSS `:has()` selector
- ES6 JavaScript

## Documentation

For detailed component documentation and examples, visit the [demo page](https://goyatg.github.io/zeno/) or check the `index.html` file in this repository.

## Development

If you want to build from source:

```bash
# Install dependencies
npm install

# Build optimized files
npm run build

# Create a release
npm run release
```

## License

Free to use in personal and commercial projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for developers who value simplicity and elegance.**
