# YOUWARE.md - Sistema de Gerenciamento de Contas Pessoais

## Arquitetura do Sistema

### Estrutura Principal
- **Frontend**: Aplicação web responsiva em HTML/CSS/JavaScript vanilla
- **Backend**: Firebase Realtime Database para persistência de dados
- **Autenticação**: Firebase Auth para gerenciamento de usuários
- **PWA**: Manifesto e Service Worker para funcionalidade offline

### Organização de Arquivos
```
├── index.html          # Página principal da aplicação
├── login.html          # Página de autenticação
├── css/
│   ├── styles.css      # Estilos principais e responsivos
│   └── inteligencia_financeira.css
├── js/
│   ├── script.js       # Lógica principal unificada
│   ├── utils.js        # Utilitários compartilhados
│   └── inteligencia_financeira.js
├── manifest.json       # Configuração PWA
└── sw.js              # Service Worker
```

### Componentes-Chave

**Sistema de Autenticação**
- Usuários isolados por `currentUser.uid`
- Todos os dados são namespaceados por usuário
- Estrutura: `users/{userId}/data/{categorias|limites_categorias}`

**Gestão de Dados**
- **Pessoas/Rendas**: Fonte de receitas com pagamentos recorrentes
- **Despesas**: Suporte a 3 tipos: à vista, cartão (parcelado), recorrente
- **Categorias**: Configuráveis por usuário com limites opcionais
- **Cartões**: Gestão de limite, fechamento e vencimento

**Interface Responsiva**
- Desktop: Sidebar + conteúdo principal
- Mobile: Top bar + bottom navigation + modais otimizados
- Tema claro/escuro com preferências salvás no Firebase

### Funcionalidades Especiais

**Sistema de Swipe (Mobile)**
- Gestos de deslize em linhas da tabela
- Swipe direita: ações (editar/excluir)
- Swipe esquerda: pagamento rápido

**Modais Inteligentes**
- Botões "+" ao lado de selects para cadastro rápido
- Alternância entre tipos de operação com seletores visuais
- Validações em tempo real

**Dashboard Dinâmico**
- Seleção de período (mês/ano)
- Gráficos interativos (ApexCharts)
- Painéis alternáveis (despesas/receitas) no mobile

### Sistema de Temas
- Variáveis CSS customizadas (`--primary`, `--bg-color`, etc.)
- Sincronização automática localStorage ↔ Firebase
- Ícones adaptativos (sol/lua) baseados no tema ativo

### Padrões de Desenvolvimento

**Namespacing de Dados**
```javascript
// Sempre usar o userId nas referências
db.ref(`users/${currentUser.uid}/data/categorias`)
db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid)
```

**Gestão de Estados**
- `currentUser`: Estado global do usuário autenticado
- `novo_categoriasMap`: Cache global de categorias para performance
- Flags de carregamento para evitar execuções duplas

**Responsive Design**
- Mobile-first com breakpoint principal em 768px
- Containers específicos por resolução (.mobile-only, .desktop-only)
- Modais adaptáveis com classes especializadas

### Integrações Externas
- **Firebase**: Realtime Database + Auth
- **ApexCharts**: Gráficos interativos
- **Toastify**: Notificações
- **DateRangePicker**: Seleção de períodos
- **Font Awesome**: Iconografia

### Convenções de Nomenclatura
- Funções: camelCase (ex: `atualizarDashboard`)
- IDs HTML: camelCase (ex: `cadastroDespesaModal`)
- Classes CSS: kebab-case (ex: `mobile-top-bar`)
- Variáveis CSS: kebab-case com prefixo (ex: `--primary`)

Esta aplicação prioriza a experiência do usuário com interfaces responsivas, carregamento rápido e funcionalidades offline através do PWA.