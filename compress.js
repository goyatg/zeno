#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');
const gzipSize = require('gzip-size');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatPercentage(original, compressed) {
  const percent = ((1 - compressed / original) * 100).toFixed(1);
  return percent > 0 ? `-${percent}%` : `+${Math.abs(percent)}%`;
}

async function compressJS(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const result = await minifyJS(original, {
    compress: {
      drop_console: false, // Keep console logs, set to true to remove them
      drop_debugger: true,
      pure_funcs: [], // Functions that can be safely removed if return value is unused
    },
    mangle: true,
    format: {
      comments: false,
    },
  });
  
  if (result.error) {
    throw result.error;
  }
  
  const minified = result.code;
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  const gzippedSize = await gzipSize(minified);
  
  return {
    original: originalSize,
    minified: minifiedSize,
    gzipped: gzippedSize,
    content: minified,
  };
}

function compressCSS(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const cleanCSS = new CleanCSS({
    level: 2, // Aggressive optimization
    format: false, // Don't format output
  });
  
  const result = cleanCSS.minify(original);
  
  if (result.errors && result.errors.length > 0) {
    console.warn('CSS minification warnings:', result.errors);
  }
  
  const minified = result.styles;
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  
  // Calculate gzipped size
  const gzippedSize = gzipSize.sync(minified);
  
  return {
    original: originalSize,
    minified: minifiedSize,
    gzipped: gzippedSize,
    content: minified,
  };
}

function printResults(filename, results) {
  console.log(`\n${colors.bright}${colors.cyan}${filename}${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`Original:     ${colors.yellow}${formatBytes(results.original).padEnd(10)}${colors.reset}`);
  console.log(`Minified:     ${colors.green}${formatBytes(results.minified).padEnd(10)}${colors.reset} ${formatPercentage(results.original, results.minified)}`);
  console.log(`Gzipped:      ${colors.green}${formatBytes(results.gzipped).padEnd(10)}${colors.reset} ${formatPercentage(results.original, results.gzipped)}`);
  console.log(`Total saved:  ${colors.bright}${formatBytes(results.original - results.gzipped)}${colors.reset}`);
}

async function main() {
  const files = [
    { path: 'script.js', type: 'js' },
    { path: 'styles.css', type: 'css' },
  ];
  
  console.log(`${colors.bright}${colors.cyan}Compressing files for production...${colors.reset}\n`);
  
  const results = [];
  let totalOriginal = 0;
  let totalMinified = 0;
  let totalGzipped = 0;
  
  for (const file of files) {
    const filePath = path.join(__dirname, file.path);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`${colors.yellow}Warning: ${file.path} not found, skipping...${colors.reset}`);
      continue;
    }
    
    try {
      let result;
      if (file.type === 'js') {
        result = await compressJS(filePath);
      } else {
        result = compressCSS(filePath);
      }
      
      printResults(file.path, result);
      
      results.push({ file: file.path, ...result });
      totalOriginal += result.original;
      totalMinified += result.minified;
      totalGzipped += result.gzipped;
    } catch (error) {
      console.error(`${colors.red}Error compressing ${file.path}:${colors.reset}`, error.message);
    }
  }
  
  // Print totals
  console.log(`\n${colors.bright}${colors.cyan}Total${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`Original:     ${colors.yellow}${formatBytes(totalOriginal).padEnd(10)}${colors.reset}`);
  console.log(`Minified:     ${colors.green}${formatBytes(totalMinified).padEnd(10)}${colors.reset} ${formatPercentage(totalOriginal, totalMinified)}`);
  console.log(`Gzipped:      ${colors.green}${formatBytes(totalGzipped).padEnd(10)}${colors.reset} ${formatPercentage(totalOriginal, totalGzipped)}`);
  console.log(`Total saved:  ${colors.bright}${formatBytes(totalOriginal - totalGzipped)}${colors.reset}`);
  
  // Ask if user wants to save compressed files
  console.log(`\n${colors.cyan}💡 Tip: Gzipped size is what browsers actually download${colors.reset}`);
  console.log(`${colors.cyan}💡 Tip: Run 'npm run compress' to see these stats anytime${colors.reset}`);
}

main().catch(console.error);
