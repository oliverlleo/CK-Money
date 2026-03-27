const fs = require('fs');
let file = 'css/styles.css';
let content = fs.readFileSync(file, 'utf8');

// Guarantee that .user-info has position: relative
if (!content.includes('position: relative;') && content.includes('.user-info {')) {
  content = content.replace(/\.user-info \{/, '.user-info {\n  position: relative;');
} else if (!content.includes('.user-info {')) {
  content += '\n.user-info {\n  position: relative;\n}\n';
}

fs.writeFileSync(file, content);
