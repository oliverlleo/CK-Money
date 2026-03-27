const fs = require('fs');
let js = fs.readFileSync('js/script.js', 'utf8');

// For avista
js = js.replace(
  /<td data-label="Data">\$\{dataCompra\.toLocaleDateString\(\)\} <span class="mobile-only-details"><span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusBadge\}<\/span><\/span><\/td>/g,
  `<td data-label="Data">\${dataCompra.toLocaleDateString()} <span class="mobile-only-details d-block d-md-none"><span class="categoria-info">• \${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• \${statusBadge}</span></span></td>`
);

// For cartao
js = js.replace(
  /<td data-label="Data">\$\{dataVencimento\.toLocaleDateString\(\)\} <span class="mobile-only-details"><span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusBadge\}<\/span><\/span><\/td>/g,
  `<td data-label="Data">\${dataVencimento.toLocaleDateString()} <span class="mobile-only-details d-block d-md-none"><span class="categoria-info">• \${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• \${statusBadge}</span></span></td>`
);

// For recorrente - the one in the image!
js = js.replace(
  /<td data-label="Data">\$\{dataVencimentoStr\} <span class="mobile-only-details"><span class="categoria-info">• \$\{getCategoriaName\(despesa\.categoria\)\}<\/span> <span class="status-info">• \$\{statusText\}<\/span><\/span><\/td>/g,
  `<td data-label="Data">\${dataVencimentoStr} <span class="mobile-only-details d-block d-md-none"><span class="categoria-info">• \${getCategoriaName(despesa.categoria)}</span> <span class="status-info">• \${statusText}</span></span></td>`
);

fs.writeFileSync('js/script.js', js, 'utf8');
