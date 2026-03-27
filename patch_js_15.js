const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// Verify that the dropdown code has `position: absolute; right: 0;` and works with the JS toggle
// Wait, the `style="display: none;"` is already there. Why would it be appearing constantly?
// Oh! Did I replace the user-info element earlier or did something break the display toggle?
// Let's check `toggleUserDropdown` or the render code.
content = content.replace(/<div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none;">[\s\S]*?<\/div>/,
`<div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none; position: absolute; right: 0; top: 100%; min-width: 200px;">
        <div class="desktop-menu-item" onclick="toggleTheme(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:var(--text-color);">
          <i class="fas \${themeIconClass}" id="themeIcon"></i>
          Alternar tema
        </div>
        <div class="desktop-dropdown-divider"></div>
        <div class="desktop-menu-item logout" onclick="logout(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:#dc3545;">
          <i class="fa-solid fa-sign-out-alt"></i>
          Sair da conta
        </div>
      </div>`);

// Check if `toggleUserDropdown` exists
// The original code probably toggles display 'block' vs 'none'.

fs.writeFileSync(file, content);
