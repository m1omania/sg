#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon sizes for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Shortcut icons
const shortcutIcons = [
  { name: 'shortcut-dashboard.png', size: 96 },
  { name: 'shortcut-investments.png', size: 96 },
  { name: 'shortcut-wallet.png', size: 96 },
  { name: 'shortcut-projects.png', size: 96 }
];

// Badge icons
const badgeIcons = [
  { name: 'badge-72x72.png', size: 72 }
];

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Generate icons using ImageMagick
function generateIcons() {
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick is not installed. Please install it first:');
    console.error('   macOS: brew install imagemagick');
    console.error('   Ubuntu: sudo apt-get install imagemagick');
    console.error('   Windows: Download from https://imagemagick.org/script/download.php');
    process.exit(1);
  }

  const iconsDir = path.join(__dirname, '../icons');
  const sourceIcon = path.join(__dirname, '../src/icon-source.png');

  // Create icons directory
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Source icon not found: ${sourceIcon}`);
    console.error('Please create a 512x512 PNG icon and save it as src/icon-source.png');
    process.exit(1);
  }

  console.log('🎨 Generating PWA icons...');

  // Generate main icons
  iconSizes.forEach(({ size, name }) => {
    const outputPath = path.join(iconsDir, name);
    try {
      execSync(`convert "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'pipe' });
      console.log(`✅ Generated ${name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  });

  // Generate shortcut icons (simplified versions)
  shortcutIcons.forEach(({ name, size }) => {
    const outputPath = path.join(iconsDir, name);
    try {
      // Create a simple colored square for shortcuts
      const colors = ['#2563eb', '#059669', '#f59e0b', '#ef4444'];
      const colorIndex = shortcutIcons.indexOf({ name, size }) % colors.length;
      const color = colors[colorIndex];
      
      execSync(`convert -size ${size}x${size} xc:"${color}" "${outputPath}"`, { stdio: 'pipe' });
      console.log(`✅ Generated ${name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  });

  // Generate badge icons
  badgeIcons.forEach(({ name, size }) => {
    const outputPath = path.join(iconsDir, name);
    try {
      execSync(`convert "${sourceIcon}" -resize ${size}x${size} -background white -gravity center -extent ${size}x${size} "${outputPath}"`, { stdio: 'pipe' });
      console.log(`✅ Generated ${name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  });

  console.log('🎉 All icons generated successfully!');
}

// Generate favicon
function generateFavicon() {
  const iconsDir = path.join(__dirname, '../icons');
  const sourceIcon = path.join(__dirname, '../src/icon-source.png');
  const faviconSizes = [16, 32, 48, 64];

  console.log('🎨 Generating favicon...');

  faviconSizes.forEach(size => {
    const outputPath = path.join(__dirname, `../favicon-${size}x${size}.png`);
    try {
      execSync(`convert "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'pipe' });
      console.log(`✅ Generated favicon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate favicon-${size}x${size}.png:`, error.message);
    }
  });

  // Generate ICO file
  try {
    const icoPath = path.join(__dirname, '../favicon.ico');
    execSync(`convert "${sourceIcon}" -resize 32x32 "${icoPath}"`, { stdio: 'pipe' });
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Failed to generate favicon.ico:', error.message);
  }
}

// Generate Apple Touch Icons
function generateAppleTouchIcons() {
  const iconsDir = path.join(__dirname, '../icons');
  const sourceIcon = path.join(__dirname, '../src/icon-source.png');
  const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];

  console.log('🍎 Generating Apple Touch Icons...');

  appleSizes.forEach(size => {
    const outputPath = path.join(__dirname, `../apple-touch-icon-${size}x${size}.png`);
    try {
      execSync(`convert "${sourceIcon}" -resize ${size}x${size} -background white -gravity center -extent ${size}x${size} "${outputPath}"`, { stdio: 'pipe' });
      console.log(`✅ Generated apple-touch-icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate apple-touch-icon-${size}x${size}.png:`, error.message);
    }
  });
}

// Main function
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'icons':
      generateIcons();
      break;
    case 'favicon':
      generateFavicon();
      break;
    case 'apple':
      generateAppleTouchIcons();
      break;
    case 'all':
      generateIcons();
      generateFavicon();
      generateAppleTouchIcons();
      break;
    case 'help':
    default:
      console.log(`
🎨 Icon Generator

Usage: node scripts/generate-icons.js <command>

Commands:
  icons      Generate PWA icons
  favicon    Generate favicon files
  apple      Generate Apple Touch Icons
  all        Generate all icon types
  help       Show this help message

Requirements:
  - ImageMagick must be installed
  - Source icon at src/icon-source.png (512x512 PNG)

Examples:
  node scripts/generate-icons.js icons
  node scripts/generate-icons.js all
      `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateIcons,
  generateFavicon,
  generateAppleTouchIcons
};
