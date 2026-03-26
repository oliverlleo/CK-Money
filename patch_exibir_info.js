const fs = require('fs');
let code = fs.readFileSync('js/script.js', 'utf8');

const oldFunc = `function exibirInfoUsuario(user) {
  // Verificar se estamos na página principal
  if (document.getElementById('sidebar')) {
    // Criar ou atualizar elemento de informações do usuário
    let userInfoElement = document.getElementById('userInfo');

    if (!userInfoElement) {
      userInfoElement = document.createElement('div');
      userInfoElement.id = 'userInfo';
      userInfoElement.className = 'user-info';

      // Inserir antes do primeiro link no sidebar
      const sidebar = document.getElementById('sidebar');
      const sidebarNav = document.getElementById('sidebar-nav');

      if (sidebarNav) {
        // Se sidebar-nav existe, inserir antes dele
        sidebar.insertBefore(userInfoElement, sidebarNav);
      } else {
        // Se não, apenas adicionar ao início do sidebar
        sidebar.prepend(userInfoElement);
      }
    }

    // Atualizar conteúdo
    userInfoElement.innerHTML = \`
      <div class="user-avatar">
        <img src="\${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" alt="Avatar">
      </div>
      <div class="user-details">
        <div class="user-name">\${user.displayName || 'Usuário'}</div>
        <div class="user-email">\${user.email}</div>
      </div>
    \`;
  }
}`;

const newFunc = `function exibirInfoUsuario(user) {
  // Verificar se estamos na página principal
  if (document.getElementById('sidebar')) {
    // Criar ou atualizar elemento de informações do usuário
    let userInfoElement = document.getElementById('userInfo');

    if (!userInfoElement) {
      userInfoElement = document.createElement('div');
      userInfoElement.id = 'userInfo';
      userInfoElement.className = 'user-info';
      userInfoElement.style.cursor = 'pointer'; // Make it clickable
      userInfoElement.onclick = toggleDesktopUserDropdown;

      // Inserir antes do primeiro link no sidebar
      const sidebar = document.getElementById('sidebar');
      const sidebarNav = document.getElementById('sidebar-nav');

      if (sidebarNav) {
        // Se sidebar-nav existe, inserir antes dele
        sidebar.insertBefore(userInfoElement, sidebarNav);
      } else {
        // Se não, apenas adicionar ao início do sidebar
        sidebar.prepend(userInfoElement);
      }
    }

    const themeIconClass = document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-moon' : 'fa-sun';

    // Atualizar conteúdo
    userInfoElement.innerHTML = \`
      <div class="user-avatar">
        <img src="\${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" alt="Avatar">
      </div>
      <div class="user-details" style="flex: 1;">
        <div class="user-name">\${user.displayName || 'Usuário'}</div>
        <div class="user-email">\${user.email}</div>
      </div>
      <i class="fas fa-chevron-down" style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;"></i>

      <div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none;">
        <button class="desktop-menu-btn" onclick="toggleTheme(); event.stopPropagation();">
          <i class="fas \${themeIconClass}" id="themeIcon"></i>
          Alternar tema
        </button>
        <div class="desktop-dropdown-divider"></div>
        <button class="desktop-logout-btn" onclick="logout(); event.stopPropagation();">
          <i class="fa-solid fa-sign-out-alt"></i>
          Sair da conta
        </button>
      </div>
    \`;
  }
}

/**
 * Toggle do dropdown desktop do usuário
 */
function toggleDesktopUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('desktopUserDropdown');
  if (dropdown) {
    const isActive = dropdown.classList.contains('active');

    if (isActive) {
      // Fechar dropdown
      dropdown.classList.remove('active');
      dropdown.style.display = 'none';
      document.removeEventListener('click', closeDesktopDropdownOnClickOutside);
    } else {
      // Abrir dropdown
      dropdown.classList.add('active');
      dropdown.style.display = 'block';
      setTimeout(() => {
        document.addEventListener('click', closeDesktopDropdownOnClickOutside);
      }, 100);
    }
  }
}

/**
 * Fecha dropdown desktop ao clicar fora
 */
function closeDesktopDropdownOnClickOutside(event) {
  const dropdown = document.getElementById('desktopUserDropdown');
  const userInfo = document.getElementById('userInfo');

  if (dropdown && !dropdown.contains(event.target) && (!userInfo || !userInfo.contains(event.target))) {
    dropdown.classList.remove('active');
    dropdown.style.display = 'none';
    document.removeEventListener('click', closeDesktopDropdownOnClickOutside);
  }
}`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('js/script.js', code);
console.log('Patch aplicado!');
