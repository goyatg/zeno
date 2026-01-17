#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    // Handle null or undefined results
    if (result === null || result === undefined) {
      return '';
    }
    // Only call trim if result is a string
    return typeof result === 'string' ? result.trim() : String(result).trim();
  } catch (error) {
    if (!options.silent) {
      console.error(`${colors.red}Error:${colors.reset}`, error.message);
    }
    throw error;
  }
}

function getPackageVersion() {
  const packageJson = require('./package.json');
  return packageJson.version;
}

function getVersionFromJson() {
  const versionPath = path.join(__dirname, 'dist', 'version.json');
  if (!fs.existsSync(versionPath)) {
    return null;
  }
  const versionJson = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  return versionJson.version;
}

function getLatestGitTag() {
  try {
    const tags = exec('git tag --sort=-version:refname', { silent: true });
    if (!tags) return null;
    const latestTag = tags.split('\n')[0];
    // Remove 'v' prefix if present
    return latestTag.replace(/^v/, '');
  } catch (error) {
    return null;
  }
}

function checkGitTagExists(version) {
  try {
    exec(`git rev-parse v${version}`, { silent: true });
    return true;
  } catch (error) {
    return false;
  }
}

function checkGitStatus() {
  try {
    const status = exec('git status --porcelain', { silent: true });
    return status;
  } catch (error) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipBuild = args.includes('--skip-build');
  const skipTag = args.includes('--skip-tag');

  console.log(`${colors.bright}${colors.cyan}Release Version Checker${colors.reset}\n`);

  // Get versions from different sources
  const packageVersion = getPackageVersion();
  const versionJsonVersion = getVersionFromJson();
  const gitTagVersion = getLatestGitTag();

  console.log(`${colors.cyan}Version Sources:${colors.reset}`);
  console.log(`  package.json:     ${colors.yellow}${packageVersion}${colors.reset}`);
  console.log(`  version.json:     ${versionJsonVersion ? colors.yellow + versionJsonVersion : colors.red + 'not found' + colors.reset}`);
  console.log(`  Latest git tag:   ${gitTagVersion ? colors.yellow + gitTagVersion : colors.cyan + 'none' + colors.reset}`);

  // Check if tag already exists
  const tagExists = checkGitTagExists(packageVersion);
  if (tagExists) {
    console.log(`\n${colors.red}⚠️  Warning: Git tag v${packageVersion} already exists!${colors.reset}`);
    console.log(`${colors.yellow}If you want to release this version, you need to:${colors.reset}`);
    console.log(`  1. Update version in package.json`);
    console.log(`  2. Run this script again`);
    process.exit(1);
  }

  // Check if versions are in sync
  const versionsMatch = versionJsonVersion === packageVersion;
  if (!versionsMatch && versionJsonVersion) {
    console.log(`\n${colors.yellow}⚠️  Warning: version.json (${versionJsonVersion}) doesn't match package.json (${packageVersion})${colors.reset}`);
    console.log(`${colors.cyan}This will be fixed when you run the build.${colors.reset}`);
  }

  // Check git status
  const gitStatus = checkGitStatus();
  if (gitStatus) {
    console.log(`\n${colors.yellow}⚠️  Warning: You have uncommitted changes:${colors.reset}`);
    console.log(gitStatus);
    if (!dryRun) {
      console.log(`\n${colors.cyan}Continuing anyway...${colors.reset}`);
    }
  }

  console.log(`\n${colors.bright}${colors.cyan}Release Plan:${colors.reset}`);
  console.log(`  1. Build optimized files ${skipBuild ? colors.yellow + '(skipped)' : colors.green + '✓' + colors.reset}`);
  console.log(`  2. Create git tag v${packageVersion} ${skipTag ? colors.yellow + '(skipped)' : colors.green + '✓' + colors.reset}`);

  if (dryRun) {
    console.log(`\n${colors.cyan}Dry run mode - no changes will be made${colors.reset}`);
    return;
  }

  // Step 1: Build
  if (!skipBuild) {
    console.log(`\n${colors.cyan}Step 1: Building optimized files...${colors.reset}`);
    try {
      exec('npm run build');
      console.log(`${colors.green}✓ Build complete${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Build failed${colors.reset}`);
      process.exit(1);
    }

    // Verify version.json was created correctly
    const newVersionJson = getVersionFromJson();
    if (newVersionJson !== packageVersion) {
      console.error(`${colors.red}Error: version.json (${newVersionJson}) doesn't match package.json (${packageVersion})${colors.reset}`);
      process.exit(1);
    }
    console.log(`${colors.green}✓ Version sync verified${colors.reset}`);
  }

  // Step 2: Create git tag
  if (!skipTag) {
    console.log(`\n${colors.cyan}Step 2: Creating git tag v${packageVersion}...${colors.reset}`);
    try {
      exec(`git tag -a v${packageVersion} -m "Release v${packageVersion}"`);
      console.log(`${colors.green}✓ Git tag created${colors.reset}`);
      console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
      console.log(`  1. Review your changes: ${colors.yellow}git diff${colors.reset}`);
      console.log(`  2. Commit your changes: ${colors.yellow}git add . && git commit -m "Release v${packageVersion}"${colors.reset}`);
      console.log(`  3. Push commits: ${colors.yellow}git push${colors.reset}`);
      console.log(`  4. Push tag: ${colors.yellow}git push origin v${packageVersion}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to create git tag${colors.reset}`);
      process.exit(1);
    }
  }

  // Get repository info for CDN URLs
  let repoInfo = 'goyatg/zeno'; // Default fallback
  try {
    const remoteUrl = exec('git remote get-url origin', { silent: true });
    const match = remoteUrl.match(/(?:github\.com[:/]|@github\.com[:/])([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      repoInfo = `${match[1]}/${match[2]}`;
    }
  } catch (error) {
    // Use default if git command fails
  }

  console.log(`\n${colors.green}✓ Release preparation complete!${colors.reset}`);
  console.log(`\n${colors.cyan}CDN URLs (after pushing tag):${colors.reset}`);
  console.log(`  CSS: https://cdn.jsdelivr.net/gh/${repoInfo}@v${packageVersion}/dist/styles.min.css`);
  console.log(`  JS:  https://cdn.jsdelivr.net/gh/${repoInfo}@v${packageVersion}/dist/script.min.js`);
}

main().catch(error => {
  console.error(`${colors.red}Release script failed:${colors.reset}`, error);
  process.exit(1);
});
