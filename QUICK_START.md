# Quick Start Commands

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Build Optimized Files
```bash
npm run build
```
This creates the `dist/` folder with minified files.

## Step 3: Check Version Sync (Optional)
```bash
npm run release:dry-run
```
This shows if everything is in sync without making changes.

## Step 4: Commit Everything
```bash
git add .
git commit -m "Setup CDN build pipeline with versioning"
```

## Step 5: Push to GitHub
```bash
# If you haven't set up remote yet:
git remote add origin YOUR_GITHUB_REPO_URL

# Push to GitHub:
git push -u origin master
```

## Step 6: Create Your First Release (Build Locally)
```bash
# This will build, sync versions, and create the git tag
npm run release

# Then commit and push:
git add .
git commit -m "Release v1.0.0"
git push
git push origin v1.0.0
```

## Step 7: Use jsDelivr CDN
After pushing the tag, use these URLs (replace YOUR_USERNAME and YOUR_REPO):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@v1.0.0/dist/styles.min.css">
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@v1.0.0/dist/script.min.js"></script>
```

---

## For Future Releases

1. Update version in `package.json`
2. Run: `npm run release`
3. Commit, push, and push tag:
   ```bash
   git add .
   git commit -m "Release vX.Y.Z"
   git push
   git push origin vX.Y.Z
   ```
