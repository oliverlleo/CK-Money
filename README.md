# Sistema de Gerenciamento Financeiro

Sistema open source para gerenciamento financeiro pessoal desenvolvido em vanilla HTML, CSS e JavaScript.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visão geral com gráficos e cartões informativos
- **Gestão de Despesas**: Cadastro, edição e controle de gastos à vista e parcelados
- **Relatórios Avançados**: Análises financeiras e previsões de tendências
- **Inteligência Financeira**: Insights e recomendações personalizadas
- **Metas Financeiras**: Definição e acompanhamento de objetivos
- **Sistema de Alertas**: Notificações para vencimentos e limites
- **Multi-usuário**: Sistema seguro com autenticação Firebase

## 💻 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase (Authentication, Realtime Database)
- **Gráficos**: ApexCharts
- **Notificações**: Toastify
- **Datas**: DateRangePicker
- **Ícones**: Font Awesome

## 🛠️ Como executar

### Pré-requisitos
- Conta no Firebase
- Servidor HTTP (pode usar Python ou Node.js)

### Configuração

1. **Configure o Firebase**:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Email/Password)
   - Ative Realtime Database
   - Copie as credenciais para `js/script.js`

2. **Execute o servidor**:
   ```bash
   # Python
   python -m http.server 8000
   
   # ou Node.js
   npx serve .
   ```

3. **Acesse o sistema**:
   - Abra `http://localhost:8000` no navegador
   - Faça login ou crie uma conta

## 📁 Estrutura do Projeto

```
/
├── index.html                    # Página principal (SPA)
├── login.html                    # Autenticação

├── ver-codigo.html              # Visualizador de código-fonte
├── css/
│   ├── styles.css               # Estilos principais
│   └── inteligencia_financeira.css # Estilos da IA financeira
├── js/
│   ├── script.js                # Lógica principal
│   ├── inteligencia_financeira.js # Módulo de IA
│   └── utils.js                 # Utilitários
├── YOUWARE.md                   # Documentação técnica
└── todo.md                      # Lista de tarefas
```

## 🔒 Segurança

- Todas as consultas incluem filtro por usuário (userId)
- Autenticação obrigatória via Firebase
- Dados isolados por usuário
- Validação client-side antes de envio

## 📖 Documentação

Para informações técnicas detalhadas, consulte `YOUWARE.md`.

## 🌟 Open Source

Este projeto é totalmente open source. Sinta-se à vontade para:
- Fazer fork
- Contribuir com melhorias
- Reportar bugs
- Sugerir funcionalidades

## 📞 Suporte

Para dúvidas e suporte, entre em contato através do GitHub Issues.
