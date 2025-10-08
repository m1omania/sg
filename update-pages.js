#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of HTML files to update
const htmlFiles = [
    'index.html',
    'wallet.html', 
    'invest.html',
    'my-investments.html',
    'deposit.html',
    'checkout.html',
    'packages.html',
    'landing.html',
    'register.html'
];

// Header replacement pattern
const headerPattern = /<!-- Header -->[\s\S]*?<\/header>/g;
const headerReplacement = '    <!-- Header Placeholder -->\n    <div id="header-placeholder"></div>';

// Sidebar replacement pattern  
const sidebarPattern = /<!-- Sidebar Navigation -->[\s\S]*?<\/nav>/g;
const sidebarReplacement = '        <!-- Sidebar Placeholder -->\n        <div id="sidebar-placeholder"></div>';

// Script injection pattern
const scriptPattern = /<script src="app\.js"><\/script>/g;
const scriptReplacement = '    <script src="components/load-component.js"></script>\n    <script src="app.js"></script>';

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace header
    if (content.includes('<!-- Header -->')) {
        content = content.replace(headerPattern, headerReplacement);
        updated = true;
        console.log(`Updated header in ${filePath}`);
    }

    // Replace sidebar
    if (content.includes('<!-- Sidebar Navigation -->')) {
        content = content.replace(sidebarPattern, sidebarReplacement);
        updated = true;
        console.log(`Updated sidebar in ${filePath}`);
    }

    // Add component loader script
    if (content.includes('<script src="app.js"></script>') && !content.includes('components/load-component.js')) {
        content = content.replace(scriptPattern, scriptReplacement);
        updated = true;
        console.log(`Added component loader to ${filePath}`);
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
    } else {
        console.log(`⏭️  No changes needed for ${filePath}`);
    }
}

// Update all files
console.log('🔄 Updating HTML files to use components...\n');

htmlFiles.forEach(updateFile);

console.log('\n✅ All files updated!');
console.log('\n📝 Next steps:');
console.log('1. Test the pages to ensure components load correctly');
console.log('2. Make changes to components/header.html or components/sidebar.html');
console.log('3. Changes will automatically apply to all pages');
