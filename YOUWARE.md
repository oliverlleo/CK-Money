# Sistema de Gerenciamento de Contas Pessoais

## Arquitetura do Projeto

Este é um sistema web de gerenciamento financeiro pessoal desenvolvido em vanilla HTML, CSS e JavaScript, com Firebase como backend.

### Estrutura Principal

**Arquivo de Entrada:** `index.html` - Único ponto de entrada da aplicação
**Arquitetura:** Single Page Application (SPA) com seções alternadas via JavaScript

### Estrutura de Arquivos

```
src/
├── index.html              # Página principal (único ponto de entrada)
├── login.html              # Página de autenticação

├── css/
│   ├── styles.css          # Estilos principais
│   └── inteligencia_financeira.css # Estilos específicos para IA financeira
├── js/
│   ├── script.js           # Lógica principal unificada
│   ├── inteligencia_financeira.js # Módulo de IA financeira
│   └── utils.js            # Utilitários compartilhados
└── [arquivos .backup]      # Versões mobile removidas
```

### Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Backend:** Firebase (Authentication, Realtime Database)
- **Gráficos:** ApexCharts
- **Notificações:** Toastify
- **Datas:** DateRangePicker
- **Ícones:** Font Awesome

### Funcionalidades Principais

1. **Dashboard:** Visão geral financeira com cartões informativos e gráficos
2. **Despesas:** Cadastro, edição e acompanhamento de despesas
3. **Relatórios:** Análises financeiras e previsões
4. **Inteligência Financeira:** Insights e recomendações baseadas em padrões
5. **Metas Financeiras:** Definição e acompanhamento de objetivos
6. **Configurações:** Gestão de categorias, cartões e rendas
7. **Alertas:** Sistema de notificações para vencimentos e limites

### Padrões de Desenvolvimento

#### Navegação SPA
- Todas as seções são div containers no index.html
- Navegação através da função `showSection(sectionId)`
- Estados ativos controlados via classes CSS

#### Estrutura de Dados Firebase
```
/pessoas         # Dados de usuários e rendas
/despesas        # Todas as despesas (à vista e parceladas)
  ├── userId     # OBRIGATÓRIO: ID do usuário proprietário
/categorias      # Categorias de despesas
/cartoes         # Cartões de crédito
/metas           # Metas financeiras
  ├── userId     # OBRIGATÓRIO: ID do usuário proprietário
/limites         # Limites por categoria
```

#### Convenções de Código
- Prefixo `novo_` para funções/elementos da versão mais recente
- Funções assíncronas com Firebase usam promises
- Validação de dados em client-side antes de enviar ao Firebase
- Feedback visual através de toasts para todas as operações

#### IMPORTANTE: Segurança e Filtros por Usuário
- **TODAS** as consultas Firebase DEVEM incluir filtro por `userId`
- Usar `orderByChild("userId").equalTo(currentUser.uid)` para buscar dados
- **SEMPRE** adicionar `userId: currentUser.uid` ao salvar novos dados
- Verificar autenticação antes de qualquer operação de banco

### Comandos de Desenvolvimento

#### Execução Local
```bash
# Servir arquivos estáticos (qualquer servidor HTTP simples)
python -m http.server 8000
# ou
npx serve .
```

#### Depuração
- Console do navegador para logs e erros
- Firebase Console para dados do backend
- Toasts para feedback do usuário

### Configuração Firebase

Configure as credenciais no arquivo `js/script.js`:
```javascript
const firebaseConfig = {
  // Suas credenciais Firebase aqui
};
```

### Particularidades do Sistema

#### Gestão de Despesas
- Suporte a pagamentos à vista e parcelados
- Parcelas são armazenadas como array dentro da despesa
- Status de pagamento individual por parcela
- **CRÍTICO:** Todas as despesas devem ter userId do proprietário

#### Sistema de Autenticação
- Login via Firebase Auth
- Redirecionamento automático para login se não autenticado
- Dados SEMPRE separados por usuário (uid)
- Verificação de currentUser antes de operações críticas

#### Responsividade
- CSS responsivo para diferentes tamanhos de tela
- Menu colapsível para dispositivos menores
- Versão mobile foi removida - mantém apenas versão desktop responsiva

### Arquitetura de Módulos

#### Script Principal (script.js)
- Configuração Firebase
- Funções de autenticação
- Gerenciamento de despesas e categorias
- Sistema de navegação SPA
- Relatórios e gráficos
- **ATENÇÃO:** Implementa filtros de segurança por usuário

#### Inteligência Financeira (inteligencia_financeira.js)
- Análise de padrões de gastos
- Geração de insights
- Cálculo de métricas financeiras
- Recomendações personalizadas
- **ATENÇÃO:** Metas financeiras com filtros de segurança

#### Utilitários (utils.js)
- Funções auxiliares compartilhadas
- Formatação de dados
- Validações comuns

### Problemas de Segurança Corrigidos

1. **Metas Financeiras:** Implementado filtro por userId em carregarMetas()
2. **Despesas:** Adicionado userId em todas as consultas de despesas
3. **Operações CRUD:** Verificação de propriedade antes de editar/excluir
4. **Exportação:** Filtro por usuário nos dados exportados

### Padrão de Consultas Seguras

```javascript
// ✅ CORRETO - com filtro por usuário
db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value")

// ❌ INCORRETO - sem filtro (acessa dados de todos os usuários)
db.ref("despesas").once("value")

// ✅ CORRETO - salvar com userId
const novaDespesa = {
  // ... outros campos
  userId: currentUser.uid
};
```