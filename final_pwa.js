const fs = require('fs');

let code = fs.readFileSync('js/pwa.js', 'utf8');

// The user is furious that the fallback modal shows up.
// Remove the fallback modal HTML completely.
code = code.replace(/<!-- Modal de Instrução iOS [\s\S]*?<\/div>\n    <\/div>/, '');

// Ensure the banner is hidden by default. (It is already 'display: none' from previous steps)
if (!'display: none'.includes(code)) {
    code = code.replace(/style="position: fixed;/, 'style="display: none; position: fixed;');
}

// Remove the fallback modal logic in the click handler
code = code.replace(/} else {[\s\S]*?\/\/ Mostramos um modal com instruções manuais[\s\S]*?const iosModal = document.getElementById\('pwaIOSModal'\);[\s\S]*?if \(iosModal\) {[\s\S]*?iosModal.style.display = 'flex';[\s\S]*?}[\s\S]*?}/, '}');

fs.writeFileSync('js/pwa.js', code);
console.log('pwa.js patched to remove iOS fallback completely');
