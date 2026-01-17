#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify: minifyJS } = require('terser');
const CleanCSS = require('clean-css');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const packageJson = require('./package.json');

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

async function buildJS(inputPath, outputPath) {
  const original = fs.readFileSync(inputPath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const result = await minifyJS(original, {
    compress: {
      drop_console: false,
      drop_debugger: true,
      pure_funcs: [],
      passes: 2, // Multiple passes for better compression
    },
    mangle: {
      toplevel: false, // Keep top-level names for better compatibility
    },
    format: {
      comments: false,
    },
  });
  
  if (result.error) {
    throw result.error;
  }
  
  const minified = result.code;
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, minified, 'utf8');
  
  return {
    original: originalSize,
    minified: minifiedSize,
    content: minified,
  };
}

async function buildCSS(inputPath, outputPath) {
  const original = fs.readFileSync(inputPath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  // Process with PostCSS and Autoprefixer
  const postcssResult = await postcss([autoprefixer({
    overrideBrowserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  })]).process(original, { from: inputPath, to: outputPath });
  
  const prefixed = postcssResult.css;
  
  // Minify with CleanCSS
  const cleanCSS = new CleanCSS({
    level: 2, // Aggressive optimization
    format: false,
    compatibility: '*', // Maximum compatibility
  });
  
  const result = cleanCSS.minify(prefixed);
  
  if (result.errors && result.errors.length > 0) {
    console.warn('CSS minification warnings:', result.errors);
  }
  
  const minified = result.styles;
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, minified, 'utf8');
  
  return {
    original: originalSize,
    minified: minifiedSize,
    content: minified,
  };
}

function printResults(filename, results) {
  console.log(`\n${colors.bright}${colors.cyan}${filename}${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`Original:     ${colors.yellow}${formatBytes(results.original).padEnd(10)}${colors.reset}`);
  console.log(`Minified:     ${colors.green}${formatBytes(results.minified).padEnd(10)}${colors.reset} ${formatPercentage(results.original, results.minified)}`);
}

async function main() {
  const version = packageJson.version;
  const distDir = path.join(__dirname, 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  const files = [
    { 
      input: 'script.js', 
      output: 'dist/script.min.js',
      type: 'js' 
    },
    { 
      input: 'styles.css', 
      output: 'dist/styles.min.css',
      type: 'css' 
    },
  ];
  
  console.log(`${colors.bright}${colors.cyan}Building optimized files for v${version}...${colors.reset}\n`);
  
  const results = [];
  let totalOriginal = 0;
  let totalMinified = 0;
  
  for (const file of files) {
    const inputPath = path.join(__dirname, file.input);
    const outputPath = path.join(__dirname, file.output);
    
    if (!fs.existsSync(inputPath)) {
      console.warn(`${colors.yellow}Warning: ${file.input} not found, skipping...${colors.reset}`);
      continue;
    }
    
    try {
      let result;
      if (file.type === 'js') {
        result = await buildJS(inputPath, outputPath);
      } else {
        result = await buildCSS(inputPath, outputPath);
      }
      
      printResults(file.input, result);
      
      results.push({ file: file.input, ...result });
      totalOriginal += result.original;
      totalMinified += result.minified;
    } catch (error) {
      console.error(`${colors.red}Error building ${file.input}:${colors.reset}`, error.message);
      process.exit(1);
    }
  }
  
  // Print totals
  console.log(`\n${colors.bright}${colors.cyan}Total${colors.reset}`);
  console.log('─'.repeat(60));
  console.log(`Original:     ${colors.yellow}${formatBytes(totalOriginal).padEnd(10)}${colors.reset}`);
  console.log(`Minified:     ${colors.green}${formatBytes(totalMinified).padEnd(10)}${colors.reset} ${formatPercentage(totalOriginal, totalMinified)}`);
  
  // Create version info file
  const versionInfo = {
    version: version,
    buildDate: new Date().toISOString(),
    files: files.map(f => ({
      input: f.input,
      output: f.output,
      type: f.type
    }))
  };
  
  fs.writeFileSync(
    path.join(distDir, 'version.json'),
    JSON.stringify(versionInfo, null, 2),
    'utf8'
  );
  
  console.log(`\n${colors.green}✓ Build complete! Files written to dist/${colors.reset}`);
  console.log(`${colors.cyan}Version: ${version}${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}Build failed:${colors.reset}`, error);
  process.exit(1);
});
