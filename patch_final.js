const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Restore Dropdown
content = content.replace(/<div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none;">[\s\S]*?<\/div>/,
'<div id="desktopUserDropdown" class="desktop-user-dropdown" style="display: none;">\n        <div class="desktop-menu-item" onclick="toggleTheme(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:var(--text-color);">\n          <i class="fas ${themeIconClass}" id="themeIcon"></i>\n          Alternar tema\n        </div>\n        <div class="desktop-dropdown-divider"></div>\n        <div class="desktop-menu-item logout" onclick="logout(); event.stopPropagation();" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer; color:#dc3545;">\n          <i class="fa-solid fa-sign-out-alt"></i>\n          Sair da conta\n        </div>\n      </div>');

// 2. Action buttons
const actionAvista = '<div class="action-buttons" style="display: flex; gap: 4px;">\n              <button class="action-btn" onclick="pagarDespesaDirectly(\\\'${key}\\\', \\\'avista\\\')" title="Pagar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-square-check"></i>\n              </button>\n              <button class="action-btn" onclick="editarDespesa(\\\'${key}\\\')" title="Editar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-pen-to-square"></i>\n              </button>\n              <button class="action-btn" onclick="confirmarExclusaoDespesa(\\\'${key}\\\')" title="Excluir" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-trash-can"></i>\n              </button>\n            </div>';
content = content.replace(/<button class="btn-action btn-pay" onclick="pagarDespesaDirectly\('\$\{key\}', 'avista'\)" title="Pagar">\s*<i class="fa-solid fa-check"><\/i>\s*<\/button>\s*<button class="btn-action btn-edit" onclick="editarDespesa\('\$\{key\}'\)" title="Editar">\s*<i class="fa-solid fa-pen"><\/i>\s*<\/button>\s*<button class="btn-action btn-delete" onclick="confirmarExclusaoDespesa\('\$\{key\}'\)" title="Excluir">\s*<i class="fa-solid fa-trash-can"><\/i>\s*<\/button>/g, actionAvista.replace(/\\'/g, "'"));

const actionCartao = '<div class="action-buttons" style="display: flex; gap: 4px;">\n                <button class="action-btn" onclick="pagarDespesaDirectly(\\\'${key}\\\', \\\'cartao\\\', ${index})" title="Pagar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                  <i class="fa-regular fa-square-check"></i>\n                </button>\n                <button class="action-btn" onclick="editarDespesa(\\\'${key}\\\')" title="Editar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                  <i class="fa-regular fa-pen-to-square"></i>\n                </button>\n                <button class="action-btn" onclick="confirmarExclusaoDespesa(\\\'${key}\\\')" title="Excluir" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                  <i class="fa-regular fa-trash-can"></i>\n                </button>\n              </div>';
content = content.replace(/<button class="btn-action btn-pay" onclick="pagarDespesaDirectly\('\$\{key\}', 'cartao', \$\{index\}\)" title="Pagar">\s*<i class="fa-solid fa-check"><\/i>\s*<\/button>\s*<button class="btn-action btn-edit" onclick="editarDespesa\('\$\{key\}'\)" title="Editar">\s*<i class="fa-solid fa-pen"><\/i>\s*<\/button>\s*<button class="btn-action btn-delete" onclick="confirmarExclusaoDespesa\('\$\{key\}'\)" title="Excluir">\s*<i class="fa-solid fa-trash-can"><\/i>\s*<\/button>/g, actionCartao.replace(/\\'/g, "'"));

const actionRecorrente = '<div class="action-buttons" style="display: flex; gap: 4px;">\n              <button class="action-btn" onclick="pagarDespesaDirectly(\\\'${key}\\\', \\\'recorrente\\\')" title="Pagar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-square-check"></i>\n              </button>\n              <button class="action-btn" onclick="editarDespesa(\\\'${key}\\\')" title="Editar" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-pen-to-square"></i>\n              </button>\n              <button class="action-btn" onclick="confirmarExclusaoDespesa(\\\'${key}\\\')" title="Excluir" style="background: none; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center;">\n                <i class="fa-regular fa-trash-can"></i>\n              </button>\n            </div>';
content = content.replace(/<button class="btn-action btn-pay" onclick="pagarDespesaDirectly\('\$\{key\}', 'recorrente'\)" title="Pagar">\s*<i class="fa-solid fa-check"><\/i>\s*<\/button>\s*<button class="btn-action btn-edit" onclick="editarDespesa\('\$\{key\}'\)" title="Editar">\s*<i class="fa-solid fa-pen"><\/i>\s*<\/button>\s*<button class="btn-action btn-delete" onclick="confirmarExclusaoDespesa\('\$\{key\}'\)" title="Excluir">\s*<i class="fa-solid fa-trash-can"><\/i>\s*<\/button>/g, actionRecorrente.replace(/\\'/g, "'"));

// Data fix
content = content.replace(/<td data-label="Detalhes">\$\{dataCompra\.toLocaleDateString\(\)\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusBadge\}<\/span><\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataCompra.toLocaleDateString()}</span><span class="mobile-date" style="display:none;">${dataCompra.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span></td>');

content = content.replace(/<td data-label="Detalhes">\$\{dataVencimento\.toLocaleDateString\(\)\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusBadge\}<\/span><\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataVencimento.toLocaleDateString()}</span><span class="mobile-date" style="display:none;">${dataVencimento.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span></td>');

content = content.replace(/<td data-label="Detalhes">\$\{dataVencimentoStr\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusText\}<\/span><\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataVencimentoStr}</span><span class="mobile-date" style="display:none;">${dataVencimentoStr} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusText}</span></span></td>');


fs.writeFileSync(file, content);

let cssFile = 'css/styles.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');
cssContent += `
/* Correção para a tabela de Todas as Despesas no Desktop */
@media (min-width: 769px) {
  #todasDespesasTable td[data-label="Data"] .mobile-date {
    display: none !important;
  }
  #todasDespesasTable td[data-label="Data"] .desktop-date {
    display: inline !important;
  }
}

/* Correção para a tabela de Todas as Despesas no Mobile */
@media (max-width: 768px) {
  #todasDespesasTable td[data-label="Data"] .mobile-date {
    display: inline !important;
  }
  #todasDespesasTable td[data-label="Data"] .desktop-date {
    display: none !important;
  }
}

.desktop-menu-item:hover {
  background-color: var(--hover-color, rgba(0,0,0,0.05));
  border-radius: 4px;
}
.desktop-menu-item.logout:hover {
  background-color: rgba(220, 53, 69, 0.1);
}
`;
fs.writeFileSync(cssFile, cssContent);
