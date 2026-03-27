const fs = require('fs');
let file = 'js/script.js';
let content = fs.readFileSync(file, 'utf8');

// The original problem was that there were NO specific classes, it was just the string inside `Detalhes`
// Let's replace what is currently in script.js (my last fix which didn't work because Bootstrap classes might be overridden or missing)
// with a very simple structure using our OWN explicit classes.

content = content.replace(/<td data-label="Data">\n\s*<span class="d-none d-md-inline">\$\{dataCompra\.toLocaleDateString\(\)\}<\/span>\n\s*<span class="d-md-none">\$\{dataCompra\.toLocaleDateString\(\)\} <span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusBadge\}<\/span><\/span>\n\s*<\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataCompra.toLocaleDateString()}</span><span class="mobile-date" style="display:none;">${dataCompra.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span></td>');

content = content.replace(/<td data-label="Data">\n\s*<span class="d-none d-md-inline">\$\{dataVencimento\.toLocaleDateString\(\)\}<\/span>\n\s*<span class="d-md-none">\$\{dataVencimento\.toLocaleDateString\(\)\} <span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusBadge\}<\/span><\/span>\n\s*<\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataVencimento.toLocaleDateString()}</span><span class="mobile-date" style="display:none;">${dataVencimento.toLocaleDateString()} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusBadge}</span></span></td>');

content = content.replace(/<td data-label="Data">\n\s*<span class="d-none d-md-inline">\$\{dataVencimentoStr\}<\/span>\n\s*<span class="d-md-none">\$\{dataVencimentoStr\} <span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusText\}<\/span><\/span>\n\s*<\/td>/g,
  '<td data-label="Data"><span class="desktop-date">${dataVencimentoStr}</span><span class="mobile-date" style="display:none;">${dataVencimentoStr} <span class="categoria-info">• ${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• ${statusText}</span></span></td>');

fs.writeFileSync(file, content);
