const fs = require('fs');
let code = fs.readFileSync('js/script.js', 'utf8');

const oldFunc = `function adicionarBotaoLogout() {
  // Verificar se estamos na página principal
  if (document.getElementById('sidebar')) {
    // Verificar se o botão já existe
    if (!document.getElementById('logoutButton')) {
      // Criar link de logout
      const logoutLink = document.createElement('a');
      logoutLink.href = '#';
      logoutLink.id = 'logoutButton';
      logoutLink.className = 'nav-link';
      logoutLink.innerHTML = '<i class="fa-solid fa-sign-out-alt"></i><span>Sair</span>';
      logoutLink.addEventListener('click', logout);

      // Adicionar ao sidebar
      document.getElementById('sidebar').appendChild(logoutLink);
    }
  }
}`;

const newFunc = `function adicionarBotaoLogout() {
  // Esta função agora está vazia. O botão de Sair foi movido para dentro
  // do dropdown menu do usuário através da função exibirInfoUsuario() no Desktop
  // e do mobileUserDropdown no Mobile.
}`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('js/script.js', code);
console.log('Patch aplicado ao adicionarBotaoLogout!');
