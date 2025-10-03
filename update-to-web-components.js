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
    'projects.html',
    'landing.html',
    'register.html',
    'coupons.html'
];

// Patterns to replace
const patterns = {
    // Remove old header
    header: /<!-- Header Placeholder -->[\s\S]*?<div id="header-placeholder"><\/div>/g,
    
    // Remove old sidebar
    sidebar: /<!-- Sidebar Placeholder -->[\s\S]*?<div id="sidebar-placeholder"><\/div>/g,
    
    // Remove old component loader
    oldLoader: /<script src="components\/load-component\.js"><\/script>/g,
    
    // Remove old language switcher
    languageSwitcher: /<script src="language-switcher\.js"><\/script>/g
};

// New content to insert
const newContent = {
    header: '    <!-- Web Component Header -->\n    <sg-header></sg-header>',
    sidebar: '        <!-- Web Component Sidebar -->\n        <sg-sidebar></sg-sidebar>',
    webComponents: '    <script type="module" src="components/web-components/index.js"></script>'
};

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace header placeholder with Web Component
    if (content.includes('header-placeholder')) {
        content = content.replace(patterns.header, newContent.header);
        updated = true;
        console.log(`Updated header in ${filePath}`);
    }

    // Replace sidebar placeholder with Web Component
    if (content.includes('sidebar-placeholder')) {
        content = content.replace(patterns.sidebar, newContent.sidebar);
        updated = true;
        console.log(`Updated sidebar in ${filePath}`);
    }

    // Remove old component loader
    if (content.includes('components/load-component.js')) {
        content = content.replace(patterns.oldLoader, '');
        updated = true;
        console.log(`Removed old component loader from ${filePath}`);
    }

    // Remove old language switcher
    if (content.includes('language-switcher.js')) {
        content = content.replace(patterns.languageSwitcher, '');
        updated = true;
        console.log(`Removed old language switcher from ${filePath}`);
    }

    // Add Web Components module
    if (content.includes('<script src="app.js"></script>') && !content.includes('components/web-components/index.js')) {
        content = content.replace(
            /<script src="app\.js"><\/script>/,
            `${newContent.webComponents}\n    <script src="app.js"></script>`
        );
        updated = true;
        console.log(`Added Web Components module to ${filePath}`);
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
    } else {
        console.log(`⏭️  No changes needed for ${filePath}`);
    }
}

// Update all files
console.log('🔄 Updating HTML files to use Web Components...\n');

htmlFiles.forEach(updateFile);

console.log('\n✅ All files updated to use Web Components!');
console.log('\n📝 Web Components features:');
console.log('• 🎯 Shadow DOM isolation - no style conflicts');
console.log('• 🔄 Automatic updates - change component, update all pages');
console.log('• 📱 Mobile responsive - built-in mobile support');
console.log('• 🌙 Dark mode - automatic dark mode support');
console.log('• ⚡ Modern APIs - uses latest Web Components standards');
console.log('• 🎨 CSS Custom Properties - easy theming');
console.log('\n🚀 Ready to use! Components will load automatically.');
