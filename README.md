# Sistema de Gerenciamento Financeiro

Sistema open source para gerenciamento financeiro pessoal desenvolvido em vanilla HTML, CSS e JavaScript.

## 🚀 Funcionalidades

- **Dashboard Completo**: Visão geral com gráficos e cartões informativos
- **Gestão de Despesas**: Cadastro, edição e controle de gastos à vista, parcelados e recorrentes
- **Relatórios Avançados**: Análises financeiras, previsões de tendências e análise por categoria
- **Inteligência Financeira**: Insights e recomendações personalizadas com IA
- **Metas Financeiras**: Definição e acompanhamento de objetivos
- **Sistema de Alertas**: Notificações para vencimentos e limites
- **Multi-usuário**: Sistema seguro com autenticação Firebase
- **Categorização**: Sistema de categorias para organizar despesas
- **PWA Support**: Funciona offline com Service Worker
- **Sistema de Swipe**: Gestos touch para ações rápidas no mobile

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
   - Copie as credenciais para `js/script.js` e `login.html`

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
├── index.html                       # Página principal (SPA)
├── login.html                       # Autenticação
├── ver-codigo.html                  # Visualizador de código-fonte
├── manifest.json                    # Configuração PWA
├── sw.js                           # Service Worker para offline
├── README.md                        # Documentação principal
├── YOUWARE.md                       # Documentação técnica
├── css/
│   ├── styles.css                   # Estilos principais (mobile + desktop)
│   └── inteligencia_financeira.css  # Estilos da IA financeira
├── js/
│   ├── script.js                    # Lógica principal + sistema de swipe
│   ├── inteligencia_financeira.js   # Módulo de IA financeira
│   └── utils.js                     # Utilitários
├── icon-192x192.png                 # Ícone PWA (pequeno)
├── icon-512x512.png                 # Ícone PWA (grande)
├── screenshot-mobile-1.png          # Screenshot mobile para store
├── screenshot-mobile-2.png          # Screenshot mobile para store
├── 3v3hr6hq4s.png                   # Asset do sistema
├── rfj60irn8h.png                   # Asset do sistema
├── lonke15mw0.png                   # Asset do sistema
└── z79xq0rbzx.png                   # Asset do sistema
```

## 🔒 Segurança

- Todas as consultas incluem filtro por usuário (userId)
- Autenticação obrigatória via Firebase
- Dados isolados por usuário
- Validação client-side antes de envio

## 📊 Estatísticas do Projeto

- **Arquivos**: 17 arquivos principais
- **Linhas de código**: ~11.200 linhas
- **Tecnologias**: 8 principais
- **Funcionalidades**: 25+ módulos

## 📱 Recursos Mobile e Desktop

- Interface totalmente responsiva
- Navegação otimizada para touch (mobile) e mouse (desktop)
- Modais adaptados para todas as telas
- **Sistema de Swipe (Mobile)**: Deslize para editar/excluir (direita) ou pagar (esquerda)
- **Botões de Ação (Desktop)**: Botões de pagar, editar e excluir na tabela
- Suporte a gestos touch avançados no mobile

## 🎨 Design

- Sistema de cores personalizável
- Tema claro/escuro
- Animações CSS suaves
- Interface intuitiva
- **Interações por Gestos**: Sistema completo de swipe para ações rápidas

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
