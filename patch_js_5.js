const fs = require('fs');
let file = 'css/styles.css';
let content = fs.readFileSync(file, 'utf8');

// The styling I added is what he probably hates "mexer com design da porra do botão"
content = content.replace(/\/\* Design moderno para os botões de ação na tabela de Todas as Despesas \*\/[\s\S]*?#todasDespesasTable \.btn-delete:hover \{\n  color: #dc3545;\n\}\n/g, '');

fs.writeFileSync(file, content);
