# Setup Guide

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Build optimized files**:

   ```bash
   npm run build
   ```

3. **Test the build**:
   The `dist/` folder should now contain:

   - `script.min.js` - Minified JavaScript
   - `styles.min.css` - Minified and auto-prefixed CSS
   - `version.json` - Version information

4. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Initial setup with build pipeline"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin master
   ```

5. **Create your first release**:

   ```bash
   # Update version in package.json if needed
   npm run release  # This builds, syncs versions, and creates the tag
   git add .
   git commit -m "Release v1.0.0"
   git push origin master
   git push origin v1.0.0
   ```

   The `release` script ensures:
   - package.json version matches version.json
   - Git tag matches package.json version
   - No duplicate tags are created

6. **Use jsDelivr CDN**:
   Replace `YOUR_USERNAME` and `YOUR_REPO` in the README examples with your actual GitHub username and repository name.

## What's Included

- ✅ **Build Script** (`build.js`) - Minifies JS/CSS, adds auto-prefixing
- ✅ **Release Script** (`release.js`) - Validates versions and creates git tags
- ✅ **Version Management** - Uses package.json version
- ✅ **Optimizations** - Minification, auto-prefixing, compression

## Dependencies Added

- `postcss` - CSS processing
- `autoprefixer` - Automatic vendor prefixes
- `terser` - JavaScript minification (already had)
- `clean-css` - CSS minification (already had)
- `gzip-size` - Compression stats (already had)
