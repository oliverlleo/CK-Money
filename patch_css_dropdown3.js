const fs = require('fs');
let file = 'css/styles.css';
let content = fs.readFileSync(file, 'utf8');

// Make sure the parent `user-info` has relative positioning.
if(!content.includes('.user-info {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  cursor: pointer;\n  padding: 0.5rem;\n  border-radius: var(--border-radius-md);\n  transition: background-color 0.2s;\n  position: relative;\n}')) {
    content = content.replace(/\.user-info \{[^}]*\}/,
`.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  transition: background-color 0.2s;
  position: relative;
}`);
}

// Ensure desktop-user-dropdown is styled to actually drop down!
if(!content.includes('.desktop-user-dropdown {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  width: 200px;\n  background: var(--card-color);\n  box-shadow: var(--shadow-lg);\n  border-radius: var(--border-radius-md);\n  padding: 0.5rem;\n  z-index: 1000;\n  border: 1px solid var(--border-color);\n  animation: fadeInDropdown 0.2s ease-out;\n}')) {
    // If it exists, replace it, otherwise append it
    if(content.match(/\.desktop-user-dropdown \{[^}]*\}/)) {
        content = content.replace(/\.desktop-user-dropdown \{[^}]*\}/,
`.desktop-user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: var(--card-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  z-index: 1000;
  border: 1px solid var(--border-color);
  animation: fadeInDropdown 0.2s ease-out;
}`);
    } else {
        content += `
.desktop-user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: var(--card-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  z-index: 1000;
  border: 1px solid var(--border-color);
  animation: fadeInDropdown 0.2s ease-out;
}
`;
    }
}

fs.writeFileSync(file, content);
