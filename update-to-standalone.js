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
    'register.html',
    'coupons.html'
];

// Patterns to replace
const patterns = {
    // Replace module script with standalone scripts
    moduleScript: /<script type="module" src="components\/web-components\/index\.js"><\/script>/g,
};

// New content to insert
const newContent = {
    standaloneScripts: `    <script src="components/web-components/header-standalone.js"></script>
    <script src="components/web-components/sidebar-standalone.js"></script>`
};

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Replace module script with standalone scripts
    if (content.includes('components/web-components/index.js')) {
        content = content.replace(patterns.moduleScript, newContent.standaloneScripts);
        updated = true;
        console.log(`Updated to standalone scripts in ${filePath}`);
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
    } else {
        console.log(`⏭️  No changes needed for ${filePath}`);
    }
}

// Update all files
console.log('🔄 Updating HTML files to use standalone Web Components...\n');

htmlFiles.forEach(updateFile);

console.log('\n✅ All files updated to use standalone Web Components!');
console.log('\n📝 Standalone features:');
console.log('• 🚀 No module dependencies - works on all hosting');
console.log('• 🎯 Shadow DOM isolation - no style conflicts');
console.log('• 🔄 Automatic updates - change component, update all pages');
console.log('• 📱 Mobile responsive - built-in mobile support');
console.log('• ⚡ Fast loading - no module resolution delays');
console.log('\n🚀 Ready to use! Components will load on Vercel.');
