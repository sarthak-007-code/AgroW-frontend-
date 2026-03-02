const fs = require('fs');
const path = require('path');

const replacements = [
    { regex: /background:\s*white;?/gi, replacement: 'background: var(--color-surface);' },
    { regex: /background-color:\s*white;?/gi, replacement: 'background-color: var(--color-surface);' },
    { regex: /background:\s*#FFFFFF;?/gi, replacement: 'background: var(--color-surface);' },
    { regex: /background:\s*#F9FAFB;?/gi, replacement: 'background: var(--color-bg);' },
    { regex: /background:\s*#F3F4F6;?/gi, replacement: 'background: var(--color-bg);' },
    { regex: /background-color:\s*#F9FAFB;?/gi, replacement: 'background-color: var(--color-bg);' },
    { regex: /color:\s*#111;?/gi, replacement: 'color: var(--color-text-primary);' },
    { regex: /color:\s*#1F2937;?/gi, replacement: 'color: var(--color-text-primary);' },
    { regex: /color:\s*#4B5563;?/gi, replacement: 'color: var(--color-text-secondary);' },
    { regex: /color:\s*#6B7280;?/gi, replacement: 'color: var(--color-text-secondary);' },
    { regex: /border:\s*1px\s+solid\s+#E5E7EB;?/gi, replacement: 'border: 1px solid var(--color-border);' },
    { regex: /border-bottom:\s*1px\s+solid\s+#E5E7EB;?/gi, replacement: 'border-bottom: 1px solid var(--color-border);' },
    { regex: /border-top:\s*1px\s+solid\s+#E5E7EB;?/gi, replacement: 'border-top: 1px solid var(--color-border);' },
    { regex: /border-color:\s*#E5E7EB;?/gi, replacement: 'border-color: var(--color-border);' }
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.css') && !file.endsWith('index.css')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Done. Updated ${changedFiles} files.`);
