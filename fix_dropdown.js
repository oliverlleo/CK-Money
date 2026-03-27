const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// Look for where userInfoElement.innerHTML is being set, which is around line 4500
// It's generating duplicated and broken HTML for the dropdown

const regex = /userInfoElement\.innerHTML\s*=\s*`[\s\S]*?<div id="desktopUserDropdown"[^>]*>[\s\S]*?<\/div>[\s\S]*?`;/g;

const newHTML = `userInfoElement.innerHTML = \`
      <div class="user-avatar">
        <img src="\${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" alt="Avatar">
      </div>
      <div class="user-details" style="flex: 1;">
        <div class="user-name">\${user.displayName || 'Usuário'}</div>
        <div class="user-email">\${user.email}</div>
      </div>
      <i class="fas fa-chevron-down" style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;"></i>

      <div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none; position: absolute; right: 0; top: calc(100% + 5px); width: 200px; background: var(--card-color); box-shadow: var(--shadow-lg); border-radius: var(--border-radius-md); padding: 0.5rem; z-index: 1000; border: 1px solid var(--border-color);">
        <div class="desktop-menu-item" onclick="toggleTheme(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:var(--text-color); border-radius: 4px;">
          <i class="fas \${themeIconClass}" id="themeIcon"></i>
          Alternar tema
        </div>
        <div style="height: 1px; background-color: var(--border-color); margin: 0.25rem 0;"></div>
        <div class="desktop-menu-item logout" onclick="logout(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:#dc3545; border-radius: 4px;">
          <i class="fa-solid fa-sign-out-alt"></i>
          Sair da conta
        </div>
      </div>
    \`;`;

// Find where this block actually is
content = content.replace(regex, newHTML);

fs.writeFileSync(file, content);
