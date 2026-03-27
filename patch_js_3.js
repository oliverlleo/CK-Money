const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// The original content in HEAD had these exact lines that were causing issues
// Let's replace ONLY what's inside the <td data-label="Data"> ... </td> for all 3 occurrences
// to ensure we strip out the mobile-only info from the desktop view entirely.
// We will use the exact same span structure but correctly class them.

content = content.replace(/<td data-label="Detalhes">\$\{dataCompra\.toLocaleDateString\(\)\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusBadge\}<\/span><\/td>/g,
  '<td data-label="Data">\n            <span class="d-none d-md-inline">${dataCompra.toLocaleDateString()}</span>\n            <span class="d-md-none">${dataCompra.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span>\n          </td>');

content = content.replace(/<td data-label="Detalhes">\$\{dataVencimento\.toLocaleDateString\(\)\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusBadge\}<\/span><\/td>/g,
  '<td data-label="Data">\n              <span class="d-none d-md-inline">${dataVencimento.toLocaleDateString()}</span>\n              <span class="d-md-none">${dataVencimento.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span>\n            </td>');

content = content.replace(/<td data-label="Detalhes">\$\{dataVencimentoStr\} \n\s*<span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> \n\s*<span class="status-info">• \$\{statusText\}<\/span><\/td>/g,
  '<td data-label="Data">\n            <span class="d-none d-md-inline">${dataVencimentoStr}</span>\n            <span class="d-md-none">${dataVencimentoStr} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusText}</span></span>\n          </td>');

fs.writeFileSync(file, content);
