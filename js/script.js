'use strict';

/**
 * Sistema de Gerenciamento de Contas Pessoais - Versão Unificada
 * Todos os módulos JavaScript unificados em um único arquivo
 */

// ===================== VARIÁVEIS GLOBAIS =====================
let rendaVisivel = false;
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let rangeStart = null;
let rangeEnd = null;
let currentUser = null;

// Mapa de categorias para uso global
window.novo_categoriasMap = {};

/**
 * Obtém o nome da categoria pelo ID
 * @param {string} categoriaId - ID da categoria
 * @returns {string} Nome da categoria ou "Sem categoria"
 */
function getCategoriaName(categoriaId) {
  if (!categoriaId) return "Sem categoria";
  
  // Verificar no mapa de categorias
  if (window.novo_categoriasMap[categoriaId]) {
    return window.novo_categoriasMap[categoriaId];
  }
  
  // Buscar no Firebase se não estiver no mapa
  if (currentUser) {
    db.ref(`users/${currentUser.uid}/data/categorias/${categoriaId}`).once("value").then(snapshot => {
      if (snapshot.exists()) {
        const categoria = snapshot.val();
        window.novo_categoriasMap[categoriaId] = categoria.nome;
        return categoria.nome;
      }
    });
  }
  
  return "Categoria não encontrada";
}

// ===================== CONFIGURAÇÃO DO FIREBASE =====================
const firebaseConfig = {
  apiKey: "AIzaSyAG6LktPXGe6F-vSTHV2Y3n95vSwhpXch8",
  authDomain: "controlegasto-df3f1.firebaseapp.com",
  databaseURL: "https://controlegasto-df3f1-default-rtdb.firebaseio.com",
  projectId: "controlegasto-df3f1",
  storageBucket: "controlegasto-df3f1.firebasestorage.app",
  messagingSenderId: "1034936676414",
  appId: "1:1034936676414:web:61c67ce39c3ab71a07a16f",
  measurementId: "G-PTN43GZHGR"
};

// Inicialização do Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}
// Definindo db como variável global para ser acessível em todas as funções
var db = firebase.database();

// ===================== SISTEMA DE TEMA ESCURO =====================

// Função para alternar tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Aplicar o tema
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Salvar preferência localmente
  localStorage.setItem('theme', newTheme);
  
  // Salvar preferência no Firebase se o usuário estiver logado
  if (currentUser) {
    saveThemeToFirebase(newTheme);
  }
  
  // Atualizar ícones
  updateThemeIcons(newTheme);
  
  // Mostrar feedback
  exibirToast(
    newTheme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado',
    'info'
  );
}

// Função para atualizar ícones do tema
function updateThemeIcons(theme) {
  const desktopIcon = document.getElementById('themeIcon');
  const mobileIcon = document.getElementById('themeMobileIcon');
  
  if (theme === 'dark') {
    // Modo escuro ativo - mostrar ícone da lua
    if (desktopIcon) {
      desktopIcon.className = 'fas fa-moon';
    }
    if (mobileIcon) {
      mobileIcon.className = 'fas fa-moon';
    }
  } else {
    // Modo claro ativo - mostrar ícone do sol
    if (desktopIcon) {
      desktopIcon.className = 'fas fa-sun';
    }
    if (mobileIcon) {
      mobileIcon.className = 'fas fa-sun';
    }
  }
}

// Função para salvar tema no Firebase
function saveThemeToFirebase(theme) {
  if (!currentUser) return;
  
  try {
    db.ref(`users/${currentUser.uid}/preferences`).update({
      theme: theme,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.log('Erro ao salvar tema no Firebase:', error);
  }
}

// Função para carregar tema do Firebase
function loadThemeFromFirebase() {
  if (!currentUser) {
    loadSavedTheme();
    return;
  }
  
  db.ref(`users/${currentUser.uid}/preferences/theme`).once('value')
    .then((snapshot) => {
      const firebaseTheme = snapshot.val();
      const localTheme = localStorage.getItem('theme');
      
      // Priorizar tema do Firebase se existir
      const theme = firebaseTheme || localTheme || 'light';
      
      // Aplicar tema
      document.documentElement.setAttribute('data-theme', theme);
      updateThemeIcons(theme);
      
      // Sincronizar localStorage
      localStorage.setItem('theme', theme);
    })
    .catch((error) => {
      console.log('Erro ao carregar tema do Firebase:', error);
      loadSavedTheme(); // Fallback para localStorage
    });
}

// Função para carregar tema salvo (fallback)
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);
}

// Carregar tema ao inicializar a página
document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
});

// ===================== INICIALIZAÇÃO DO DATERANGEPICKER =====================

/**
 * Inicializa o DateRangePicker para o campo de data dos relatórios
 */
function initDateRangePicker() {
  // Aguardar um pouco para garantir que o jQuery e o DateRangePicker estejam disponíveis
  setTimeout(() => {
    if (typeof $ !== 'undefined' && $.fn.daterangepicker) {
      const dataRangeInput = $('#dataRange');
      
      if (dataRangeInput.length) {
        dataRangeInput.daterangepicker({
          locale: {
            format: 'DD/MM/YYYY',
            separator: ' - ',
            applyLabel: 'Aplicar',
            cancelLabel: 'Cancelar',
            fromLabel: 'De',
            toLabel: 'Até',
            customRangeLabel: 'Personalizado',
            weekLabel: 'S',
            daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            firstDay: 0
          },
          ranges: {
            'Todo Período': [moment().subtract(10, 'years'), moment().add(10, 'years')],
            'Hoje': [moment(), moment()],
            'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Últimos 7 dias': [moment().subtract(6, 'days'), moment()],
            'Últimos 30 dias': [moment().subtract(29, 'days'), moment()],
            'Este mês': [moment().startOf('month'), moment().endOf('month')],
            'Mês passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            'Este ano': [moment().startOf('year'), moment().endOf('year')],
            'Ano passado': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
          },
          startDate: moment().subtract(10, 'years'),
          endDate: moment().add(10, 'years'),
          opens: 'left',
          autoUpdateInput: false
        });

        // Definir "Todo Período" como padrão
        dataRangeInput.val('Todo Período');
        rangeStart = null;
        rangeEnd = null;

        // Event listener para aplicar o filtro
        dataRangeInput.on('apply.daterangepicker', function(ev, picker) {
          const label = picker.chosenLabel;
          
          if (label === 'Todo Período') {
            $(this).val('Todo Período');
            rangeStart = null;
            rangeEnd = null;
          } else {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            rangeStart = picker.startDate.format('YYYY-MM-DD');
            rangeEnd = picker.endDate.format('YYYY-MM-DD');
          }
          
          // Atualizar relatórios
          atualizarRelatorios();
        });

        // Event listener para cancelar
        dataRangeInput.on('cancel.daterangepicker', function(ev, picker) {
          // Manter "Todo Período" como padrão quando cancelar
          $(this).val('Todo Período');
          rangeStart = null;
          rangeEnd = null;
          atualizarRelatorios();
        });
      }
    } else {
      // Tentar novamente após mais um tempo se as dependências não estiverem prontas
      setTimeout(initDateRangePicker, 500);
    }
  }, 100);
}

// ===================== FUNÇÕES DE UTILIDADE =====================

/**
 * Atualiza o dashboard através do modal mobile
 */
function atualizarDashboardMobile() {
  const mobileMonth = document.getElementById('mobileMonth').value;
  const mobileYear = document.getElementById('mobileYear').value;
  
  // Sincronizar com os seletores desktop
  document.getElementById('dashboardMonth').value = mobileMonth;
  document.getElementById('dashboardYear').value = mobileYear;
  
  // Atualizar texto do botão mobile
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const mobileDateText = document.getElementById('mobileDateText');
  if (mobileDateText) {
    mobileDateText.textContent = `${meses[mobileMonth]} ${mobileYear}`;
  }
  
  // Executar atualização do dashboard
  atualizarDashboard();
  
  // Fechar modal
  fecharModal('mobileDataModal');
  
  // Mostrar toast de confirmação
  showToast('Dashboard atualizado com sucesso!', 'success');
}

/**
 * Inicializa dispositivos móveis e otimizações mobile
 */
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  
  // Detectar se é dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  // Inicializar valores do modal mobile com os valores atuais
  const initMobileModal = () => {
    const dashboardMonth = document.getElementById('dashboardMonth');
    const dashboardYear = document.getElementById('dashboardYear');
    const mobileMonth = document.getElementById('mobileMonth');
    const mobileYear = document.getElementById('mobileYear');
    const mobileDateText = document.getElementById('mobileDateText');
    
    if (dashboardMonth && mobileMonth) {
      mobileMonth.value = dashboardMonth.value;
    }
    if (dashboardYear && mobileYear) {
      mobileYear.value = dashboardYear.value;
    }
    
    // Atualizar texto do botão mobile
    if (mobileDateText && dashboardMonth && dashboardYear) {
      const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                     'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      mobileDateText.textContent = `${meses[dashboardMonth.value]} ${dashboardYear.value}`;
    }
  };
  
  // Executar inicialização após carregamento
  setTimeout(initMobileModal, 100);
  
  if (sidebar) {
    // Fechar menu ao clicar em um link do menu em dispositivos móveis
    const navLinks = document.querySelectorAll('#sidebar-nav .nav-link, aside .nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
        }
      });
    });
    
    // Ajustar menu ao redimensionar a janela
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
      }
    });
    
    // Gestos touch para fechar menu (swipe down)
    if (isMobile) {
      let startY = 0;
      let endY = 0;
      
      sidebar.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
      });
      
      sidebar.addEventListener('touchend', function(e) {
        endY = e.changedTouches[0].clientY;
        const deltaY = endY - startY;
        
        // Se fez swipe para baixo por mais de 100px, fechar menu
        if (deltaY > 100) {
          sidebar.classList.remove('active');
        }
      });
    }
  }
  
  // Otimizações mobile adicionais
  if (isMobile) {
    // Adicionar classes mobile ao body
    document.body.classList.add('mobile-device');
    
    // Melhorar performance de scroll
    document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'touch');
    
    // Evitar zoom em inputs (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type !== 'range') {
        input.style.fontSize = '16px';
      }
    });
    
    // Adicionar feedback haptic para botões importantes (se suportado)
    const importantButtons = document.querySelectorAll('.btn-primary, .btn-danger');
    importantButtons.forEach(button => {
      button.addEventListener('click', function() {
        if (navigator.vibrate) {
          navigator.vibrate(50); // Vibração sutil
        }
      });
    });
  }
  
  // Inicializar a seção de configurações com a aba de rendas ativa
  if (document.getElementById('configuracoesSection')) {
    showConfigTab('rendaTab');
  }
  
  // Adicionar event listener para o botão "Adicionar Pagamento"
  const adicionarPagamentoBtn = document.getElementById('adicionarPagamento');
  if (adicionarPagamentoBtn) {
    adicionarPagamentoBtn.addEventListener('click', adicionarCampoPagamento);
  }
  
  // Adicionar event listener para botões de remover pagamento (delegação de eventos)
  const pagamentosContainer = document.getElementById('pagamentosContainer');
  if (pagamentosContainer) {
    pagamentosContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('remover-pagamento') || 
          e.target.closest('.remover-pagamento')) {
        const botao = e.target.classList.contains('remover-pagamento') ? 
                      e.target : e.target.closest('.remover-pagamento');
        removerCampoPagamento(botao);
      }
    });
  }
});

// ===================== FUNÇÕES DE GERENCIAMENTO DE PAGAMENTOS =====================

/**
 * Adiciona um novo campo de pagamento ao modal de cadastro de renda
 */
function adicionarCampoPagamento() {
  const container = document.getElementById('pagamentosContainer');
  if (!container) {
    console.error('Container de pagamentos não encontrado');
    return;
  }
  
  // Criar novo item de pagamento
  const novoPagamento = document.createElement('div');
  novoPagamento.className = 'pagamento-item';
  novoPagamento.innerHTML = `
    <div class="form-group">
      <label class="form-label">Dia do Mês:</label>
      <input type="number" class="form-control pagamento-dia" placeholder="Dia" min="1" max="31" required>
    </div>
    <div class="form-group">
      <label class="form-label">Valor (R$):</label>
      <input type="number" class="form-control pagamento-valor" placeholder="Valor" step="0.01" required pattern="[0-9]*" inputmode="decimal">
    </div>
    <button type="button" class="remover-pagamento">
      <i class="fas fa-trash"></i>
    </button>
  `;
  
  container.appendChild(novoPagamento);
  
  // Focar no primeiro campo do novo pagamento
  const novoDiaInput = novoPagamento.querySelector('.pagamento-dia');
  if (novoDiaInput) {
    novoDiaInput.focus();
  }
  
  exibirToast('Campo de pagamento adicionado!', 'success');
}

/**
 * Remove um campo de pagamento
 * @param {Element} botaoRemover - Botão de remover clicado
 */
function removerCampoPagamento(botaoRemover) {
  const container = document.getElementById('pagamentosContainer');
  if (!container) return;
  
  const pagamentoItem = botaoRemover.closest('.pagamento-item');
  if (!pagamentoItem) return;
  
  // Verificar se há pelo menos um pagamento restante
  const totalPagamentos = container.querySelectorAll('.pagamento-item').length;
  
  if (totalPagamentos <= 1) {
    exibirToast('Deve haver pelo menos um pagamento recorrente!', 'warning');
    return;
  }
  
  // Remover o item
  pagamentoItem.remove();
  exibirToast('Campo de pagamento removido!', 'success');
}

/**
 * A função exibirToast foi movida para utils.js
 * Esta referência é mantida para compatibilidade com código existente
 */
function exibirToast(mensagem, tipo = 'primary') {
  // Chama a função unificada com o estilo 'desktop'
  if (typeof window.utilsExibirToast === 'function') {
    window.utilsExibirToast(mensagem, tipo, 'desktop');
  } else {
    // Fallback para caso a função unificada não esteja disponível
    Toastify({
      text: mensagem,
      duration: 3000,
      close: true,
      gravity: "bottom",
      position: "right",
      backgroundColor: tipo === 'success' ? 'var(--success)' : 
                      tipo === 'danger' ? 'var(--danger)' : 
                      tipo === 'warning' ? 'var(--warning)' : 
                      'var(--primary)',
      stopOnFocus: true,
      className: `toast-${tipo}`
    }).showToast();
  }
}

/**
 * Mostra uma seção específica e esconde as demais
 * @param {string} sectionId - ID da seção a ser mostrada
 */
function showSection(sectionId) {
  const sections = document.querySelectorAll('main > section');
  sections.forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
  
  // Atualizar navegação desktop
  document.querySelectorAll('#sidebar .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Encontrar e ativar o link correspondente no desktop
  const links = document.querySelectorAll('#sidebar .nav-link');
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute('onclick') && links[i].getAttribute('onclick').includes(sectionId)) {
      links[i].classList.add('active');
      break;
    }
  }
  
  // Inicializar componentes específicos da seção
  if (sectionId === 'previsaoSection') {
    novo_calcularPrevisoes();
  } else if (sectionId === 'alertasSection') {
    novo_verificarAlertas();
  } else if (sectionId === 'configuracoesSection') {
    // Carregar dados para as abas de configurações
    loadRendas();
    loadCategorias();
    loadCartoes();
  } else if (sectionId === 'despesasSection') {
    // Carregar despesas quando esta seção for mostrada
    filtrarTodasDespesas();
  }
}

/**
 * Gerencia a navegação ativa da barra inferior mobile
 * @param {Element} clickedItem - Elemento clicado na barra inferior
 */
function setActiveBottomNav(clickedItem) {
  // Remove active de todos os itens da barra inferior
  document.querySelectorAll('.mobile-bottom-nav .nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Adiciona active ao item clicado
  clickedItem.classList.add('active');
}

/**
 * Mostra uma aba específica na seção de configurações
 * @param {string} tabId - ID da aba a ser mostrada
 */
function showConfigTab(tabId) {
  // Esconder todas as abas
  const tabPanes = document.querySelectorAll('.config-tab-pane');
  tabPanes.forEach(pane => pane.style.display = 'none');
  
  // Mostrar a aba selecionada
  document.getElementById(tabId).style.display = 'block';
  
  // Atualizar botões de navegação
  const tabButtons = document.querySelectorAll('.config-tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Encontrar e ativar o botão correspondente
  const buttons = document.querySelectorAll('.config-tab-btn');
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].getAttribute('onclick') && buttons[i].getAttribute('onclick').includes(tabId)) {
      buttons[i].classList.add('active');
      break;
    }
  }
  
  // Carregar dados específicos da aba
  if (tabId === "configCategoriasTab") {
    loadCategorias();
  } else if (tabId === 'rendaTab') {
    loadRendas();
  } else if (tabId === 'cartoesTab') {
    loadCartoes();
  }
}

/**
 * Abre um modal
 * @param {string} id - ID do modal a ser aberto
 */
window.abrirModal = function(id) {
  // Otimizações mobile para modais
  const isMobile = window.innerWidth <= 768;
  const modal = document.getElementById(id);
  
  if (isMobile && modal) {
    // Adicionar classe mobile ao modal
    modal.classList.add('mobile-modal');
    
    // Adicionar animação de entrada
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.add('slide-up-mobile');
    }
    
    // Prevenir scroll do body em mobile
    document.body.style.overflow = 'hidden';
    
    // Auto-scroll para o topo do modal
    setTimeout(() => {
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
  }
  
  // Resetar formulários e elementos específicos por modal
  if (id === "cadastroDespesaModal") {
    // Verificar se não estamos abrindo o modal para edição (chamado pela função editarDespesa)
    if (!document.getElementById("despesaIdEditar").value) {
      // Limpar os campos individualmente
      document.getElementById("despesaDescricao").value = "";
      document.getElementById("despesaValor").value = "";
      document.getElementById("dataCompra").value = "";
      document.getElementById("categoriaDespesa").value = "";
      document.getElementById("formaPagamento").value = "avista";
      document.getElementById("tipoPagamento").value = "manual";
      
      // Limpar campo oculto de ID da despesa
      document.getElementById("despesaIdEditar").value = "";
      
      // Limpar campos de parcelamento
      const parcelamentoDespesaDiv = document.getElementById("parcelamentoDespesaDiv");
      if (parcelamentoDespesaDiv) {
        parcelamentoDespesaDiv.style.display = "none";
      }
      
      const parcelasDespesa = document.getElementById("parcelasDespesa");
      if (parcelasDespesa) {
        parcelasDespesa.value = "";
      }
      
      // Limpar campos de recorrência
      const recorrenciaDespesaDiv = document.getElementById("recorrenciaDespesaDiv");
      if (recorrenciaDespesaDiv) {
        recorrenciaDespesaDiv.style.display = "none";
      }
      
      const diaVencimentoRecorrente = document.getElementById("diaVencimentoRecorrente");
      if (diaVencimentoRecorrente) {
        diaVencimentoRecorrente.value = "";
      }
      
      const duracaoRecorrente = document.getElementById("duracaoRecorrente");
      if (duracaoRecorrente) {
        duracaoRecorrente.value = "";
      }
      
      // Resetar título e botões para cadastro
      document.querySelector("#cadastroDespesaModal .modal-title").textContent = "Cadastrar Despesa";
      
      // Mostrar botão de cadastrar, esconder botão de editar
      const btnCadastrar = document.getElementById("btnCadastrarDespesa");
      const btnEditar = document.getElementById("btnEditarDespesa");
      if (btnCadastrar) {
        btnCadastrar.style.display = "inline-block";
      }
      if (btnEditar) {
        btnEditar.style.display = "none";
      }
    }
  }
  
  document.getElementById(id).style.display = "flex";
  
  // Inicializar componentes específicos do modal
  if (id === "fonteModal") loadUsuarios();
  if (id === "categoriasModal") loadCategorias();
  if (id === "cartaoModal") loadCartoes();
  if (id === "calendarModal") {
    document.getElementById("calendarTitulo").innerText = "Calendário de Despesas";
    renderCalendar();
  }
  if (id === "pagarDespesaModal") filtrarDespesas();
  if (id === "novo_limitesModal") novo_carregarLimites();
  if (id === "receberPagamentoModal") {
    carregarRendasParaRecebimento();
    // Definir data atual
    const hoje = new Date();
    document.getElementById("dataRecebimento").value = hoje.toISOString().split('T')[0];
  }
};

/**
 * Filtra as despesas não pagas para o modal de pagamento
 */
function filtrarDespesas() {
  const despesaSelect = document.getElementById("despesaSelect");
  despesaSelect.innerHTML = "<option value=''>Selecione a Despesa</option>";
  document.getElementById("parcelasDiv").classList.add("hidden");
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const key = child.key;
      const despesa = child.val();
      
      if (despesa.formaPagamento === "avista" && !despesa.pago) {
        const option = document.createElement("option");
        option.value = key;
        option.text = `${despesa.descricao} - R$ ${parseFloat(despesa.valor).toFixed(2)} - ${new Date(despesa.dataCompra).toLocaleDateString()}`;
        despesaSelect.appendChild(option);
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        // Verificar se há parcelas não pagas
        let temParcelaNaoPaga = false;
        despesa.parcelas.forEach(parcela => {
          if (!parcela.pago) temParcelaNaoPaga = true;
        });
        
        if (temParcelaNaoPaga) {
          const option = document.createElement("option");
          option.value = key;
          option.text = `${despesa.descricao} - Cartão`;
          despesaSelect.appendChild(option);
        }
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        // Verificar se há recorrências não pagas
        let temRecorrenciaNaoPaga = false;
        despesa.recorrencias.forEach(recorrencia => {
          if (!recorrencia.pago) temRecorrenciaNaoPaga = true;
        });
        
        if (temRecorrenciaNaoPaga) {
          const option = document.createElement("option");
          option.value = key;
          option.text = `${despesa.descricao} - Recorrente`;
          despesaSelect.appendChild(option);
        }
      }
    });
  }).catch(error => {
    console.error("Erro ao filtrar despesas:", error);
    exibirToast("Erro ao carregar despesas. Tente novamente.", "danger");
  });
}

/**
 * Fecha um modal
 * @param {string} id - ID do modal a ser fechado
 */
window.fecharModal = function(id) {
  const modal = document.getElementById(id);
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile && modal) {
    // Restaurar scroll do body
    document.body.style.overflow = '';
    
    // Adicionar animação de saída
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.animation = 'slideDownMobile 0.2s ease-in';
      
      // Aguardar animação antes de fechar
      setTimeout(() => {
        modal.style.display = "none";
        modalContent.style.animation = '';
        modal.classList.remove('mobile-modal');
      }, 200);
    } else {
      modal.style.display = "none";
    }
  } else {
    modal.style.display = "none";
  }
  
  // Reset específico para modal de despesas
  if (id === "cadastroDespesaModal") {
    // Sempre resetar para modo cadastro quando fechar
    document.getElementById("despesaIdEditar").value = "";
    document.querySelector("#cadastroDespesaModal .modal-title").textContent = "Cadastrar Despesa";
    
    // Mostrar botão cadastrar, esconder botão editar
    const btnCadastrar = document.getElementById("btnCadastrarDespesa");
    const btnEditar = document.getElementById("btnEditarDespesa");
    if (btnCadastrar) {
      btnCadastrar.style.display = "inline-block";
    }
    if (btnEditar) {
      btnEditar.style.display = "none";
    }
  }
};

/**
 * Exporta os dados para um arquivo CSV
 */
function exportData() {
  // Exportar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    let csv = "Descrição,Valor,Data,Forma de Pagamento\n";
    snapshot.forEach(child => {
      const despesa = child.val();
      if (despesa.formaPagamento === "avista") {
        csv += `${despesa.descricao},${despesa.valor},${despesa.dataCompra},${despesa.formaPagamento}\n`;
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach((parcela, index) => {
          csv += `${despesa.descricao} - Parcela ${index+1},${parcela.valor},${parcela.vencimento},${despesa.formaPagamento}\n`;
        });
      }
    });
    
    let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "despesas.csv";
    a.click();
    
    exibirToast("Dados exportados com sucesso!", "success");
  }).catch(error => {
    console.error("Erro ao exportar dados:", error);
    exibirToast("Erro ao exportar dados. Tente novamente.", "danger");
  });
}

// ===================== MÓDULO PRINCIPAL =====================

/**
 * Preenche o select de ano do dashboard
 */
function preencherDashboardAno() {
  const selectAno = document.getElementById("dashboardYear");
  selectAno.innerHTML = "";
  const currentYear = new Date().getFullYear();
  
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    let option = document.createElement("option");
    option.value = y;
    option.text = y;
    if (y === currentYear) option.selected = true;
    selectAno.appendChild(option);
  }
}

/**
 * Atualiza o dashboard com os dados atuais
 */
function atualizarDashboard() {
  const dashboardMonth = parseInt(document.getElementById("dashboardMonth").value);
  const dashboardYear = parseInt(document.getElementById("dashboardYear").value);
  let saldo = 0;
  let hoje = new Date();
  
  // Zerar e mostrar valores iniciais - importante para não mostrar dados de outros usuários
  document.getElementById("saldoAtual").textContent = "R$ 0.00";
  document.getElementById("despesasMes").textContent = "R$ 0.00";
  document.getElementById("proximosVencimentos").textContent = "0";
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    console.log("Usuário não autenticado, mostrando valores zerados");
    return;
  }
  
  // Processar pagamentos automáticos antes de calcular o saldo
  processarPagamentosAutomaticos();
  
  // Buscar apenas as rendas do usuário atual
  db.ref("pessoas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    snapshot.forEach(child => {
      let pessoa = child.val();
      saldo += parseFloat(pessoa.saldoInicial) || 0;
      
      // Verificar se existe histórico de pagamentos recebidos para este mês/ano
      if (pessoa.pagamentosRecebidos) {
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const chaveMonthYear = `${anoAtual}-${mesAtual}`;
        
        if (pessoa.pagamentosRecebidos[chaveMonthYear]) {
          // Somar apenas pagamentos que já foram marcados como recebidos
          pessoa.pagamentosRecebidos[chaveMonthYear].forEach(pagRecebido => {
            saldo += parseFloat(pagRecebido.valor) || 0;
          });
        }
      }
    });
    
    // Buscar apenas despesas do usuário atual que foram pagas
    db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot2 => {
      snapshot2.forEach(child => {
        let despesa = child.val();
        let despesaId = child.key;
        
        // Gerar novas recorrências se necessário para despesas infinitas
        if (despesa.formaPagamento === "recorrente" && despesa.recorrenteInfinita) {
          gerarNovasRecorrencias(despesaId, despesa);
        }
        if (despesa.pago) {
          if (despesa.formaPagamento === "avista") {
            saldo -= parseFloat(despesa.valor) || 0;
          } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
            despesa.parcelas.forEach(parcela => {
              if (parcela.pago) {
                saldo -= parseFloat(parcela.valor) || 0;
              }
            });
          }
        }
      });
      
      document.getElementById("saldoAtual").innerText = "R$ " + saldo.toFixed(2);
      atualizarDespesasMes();
      currentCalendarMonth = dashboardMonth;
      currentCalendarYear = dashboardYear;
      atualizarGrafico();
      updateProximosVencimentos();
    });
  });
}

/**
 * Atualiza os próximos vencimentos
 */
function updateProximosVencimentos() {
  const hoje = new Date();
  let proximoVencimento = null;
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    snapshot.forEach(child => {
      let despesa = child.val();
      if (despesa.formaPagamento === "avista" && !despesa.pago && despesa.dataCompra) {
        let dataCompra = new Date(despesa.dataCompra);
        if (dataCompra >= hoje) {
          if (proximoVencimento === null || dataCompra < proximoVencimento) {
            proximoVencimento = dataCompra;
          }
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach(parcela => {
          if (!parcela.pago) {
            let venc = new Date(parcela.vencimento);
            if (venc >= hoje) {
              if (proximoVencimento === null || venc < proximoVencimento) {
                proximoVencimento = venc;
              }
            }
          }
        });
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        despesa.recorrencias.forEach(recorrencia => {
          if (!recorrencia.pago) {
            let venc = new Date(recorrencia.vencimento);
            if (venc >= hoje) {
              if (proximoVencimento === null || venc < proximoVencimento) {
                proximoVencimento = venc;
              }
            }
          }
        });
      }
    });
    
    if (proximoVencimento) {
      const diffTime = proximoVencimento - hoje;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      document.getElementById("proximosVencimentos").innerText = diffDays;
    } else {
      document.getElementById("proximosVencimentos").innerText = 0;
    }
  });
}

/**
 * Atualiza as despesas do mês
 */
function atualizarDespesasMes() {
  const dashboardMonth = parseInt(document.getElementById("dashboardMonth").value);
  const dashboardYear = parseInt(document.getElementById("dashboardYear").value);
  let despesasMes = 0;
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    snapshot.forEach(child => {
      let despesa = child.val();
      if (despesa.pago) return;
      
      if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
        let dt = new Date(despesa.dataCompra);
        if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
          despesasMes += parseFloat(despesa.valor) || 0;
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach(parcela => {
          let dt = new Date(parcela.vencimento);
          if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
            despesasMes += parseFloat(parcela.valor) || 0;
          }
        });
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        despesa.recorrencias.forEach(recorrencia => {
          let dt = new Date(recorrencia.vencimento);
          if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
            despesasMes += parseFloat(recorrencia.valor) || 0;
          }
        });
      }
    });
    
    document.getElementById("despesasMes").innerText = "R$ " + despesasMes.toFixed(2);
    document.getElementById("despesasMesTitle").innerText = new Date(dashboardYear, dashboardMonth, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  });
}

/**
 * Carrega o painel de despesas do mês
 */
function carregarPainelDespesasMes() {
  const dashboardMonth = parseInt(document.getElementById("dashboardMonth").value);
  const dashboardYear = parseInt(document.getElementById("dashboardYear").value);
  const listaContainer = document.getElementById("listaDespesasMes");
  listaContainer.innerHTML = "";
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    snapshot.forEach(child => {
      let despesa = child.val();
      if (despesa.pago) return;
      
      if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
        let dt = new Date(despesa.dataCompra);
        if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
          let divDespesa = document.createElement("div");
          divDespesa.className = "despesa-item";
          divDespesa.innerHTML = `
            <div class="despesa-info">
              <div class="despesa-titulo">${despesa.descricao}</div>
              <div class="despesa-detalhe">À Vista - ${dt.toLocaleDateString()}</div>
            </div>
            <div class="despesa-valor">R$ ${parseFloat(despesa.valor).toFixed(2)}</div>
          `;
          listaContainer.appendChild(divDespesa);
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        let totalParcelas = despesa.parcelas.length;
        despesa.parcelas.forEach((parcela, index) => {
          let dt = new Date(parcela.vencimento);
          if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
            let divDespesa = document.createElement("div");
            divDespesa.className = "despesa-item";
            divDespesa.innerHTML = `
              <div class="despesa-info">
                <div class="despesa-titulo">${despesa.descricao}</div>
                <div class="despesa-detalhe">Parcela ${index+1}/${totalParcelas}\n${dt.toLocaleDateString()}</div>
              </div>
              <div class="despesa-valor">R$ ${parseFloat(parcela.valor).toFixed(2)}</div>
            `;
            listaContainer.appendChild(divDespesa);
          }
        });
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        despesa.recorrencias.forEach((recorrencia, index) => {
          let dt = new Date(recorrencia.vencimento);
          if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
            let divDespesa = document.createElement("div");
            divDespesa.className = "despesa-item";
            const mesAno = dt.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            divDespesa.innerHTML = `
              <div class="despesa-info">
                <div class="despesa-titulo">${despesa.descricao}</div>
                <div class="despesa-detalhe">Recorrente ${mesAno}\n${dt.toLocaleDateString()}</div>
              </div>
              <div class="despesa-valor">R$ ${parseFloat(recorrencia.valor).toFixed(2)}</div>
            `;
            listaContainer.appendChild(divDespesa);
          }
        });
      }
    });
    
    // Verificar despesas vencidas
    novo_verificarDespesasVencidas();
  });
}

/**
 * Atualiza o gráfico de despesas
 */
function atualizarGrafico() {
  const dashboardMonth = parseInt(document.getElementById("dashboardMonth").value);
  const dashboardYear = parseInt(document.getElementById("dashboardYear").value);
  
  // Obter despesas por categoria - apenas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    let despesasPorCategoria = {};
    let categorias = [];
    
    // Primeiro, obter todas as categorias
    db.ref("categorias").once("value").then(catSnapshot => {
      catSnapshot.forEach(catChild => {
        const categoria = catChild.val();
        categorias.push({
          id: catChild.key,
          nome: categoria.nome
        });
        despesasPorCategoria[catChild.key] = 0;
      });
      
      // Depois, calcular despesas por categoria
      snapshot.forEach(child => {
        const despesa = child.val();
        if (despesa.pago) return;
        
        const categoriaId = despesa.categoria;
        if (!categoriaId) return;
        
        if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
          let dt = new Date(despesa.dataCompra);
          if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
            despesasPorCategoria[categoriaId] = (despesasPorCategoria[categoriaId] || 0) + parseFloat(despesa.valor);
          }
        } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
          despesa.parcelas.forEach(parcela => {
            let dt = new Date(parcela.vencimento);
            if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
              despesasPorCategoria[categoriaId] = (despesasPorCategoria[categoriaId] || 0) + parseFloat(parcela.valor);
            }
          });
        } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
          despesa.recorrencias.forEach(recorrencia => {
            let dt = new Date(recorrencia.vencimento);
            if (dt.getMonth() === dashboardMonth && dt.getFullYear() === dashboardYear) {
              despesasPorCategoria[categoriaId] = (despesasPorCategoria[categoriaId] || 0) + parseFloat(recorrencia.valor);
            }
          });
        }
      });
      
      // Preparar dados para o gráfico
      let series = [];
      let labels = [];
      
      categorias.forEach(cat => {
        if (despesasPorCategoria[cat.id] > 0) {
          series.push(despesasPorCategoria[cat.id]);
          labels.push(cat.nome);
        }
      });
      
      // Criar gráfico
      const options = {
        series: series,
        chart: {
          type: 'donut',
          height: 300
        },
        labels: labels,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 250
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        colors: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#795548'],
        tooltip: {
          y: {
            formatter: function(value) {
              return value !== null && value !== undefined ? "R$ " + value.toFixed(2) : "R$ 0.00";
            }
          }
        }
      };
      
      // Destruir gráfico anterior se existir
      if (window.despesasChart) {
        window.despesasChart.destroy();
      }
      
      // Criar novo gráfico
      window.despesasChart = new ApexCharts(document.getElementById("graficoDespesas"), options);
      window.despesasChart.render();
      
      // Carregar painel de despesas do mês
      carregarPainelDespesasMes();
    });
  });
}

/**
 * Verifica se uma despesa é do mês atual
 * @param {Object} despesa - Objeto da despesa
 * @returns {boolean} Verdadeiro se a despesa for do mês atual
 */
function isDespesaDoMesAtual(despesa) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
    const dataCompra = new Date(despesa.dataCompra);
    return dataCompra.getMonth() === mesAtual && dataCompra.getFullYear() === anoAtual;
  } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
    for (let i = 0; i < despesa.parcelas.length; i++) {
      const parcela = despesa.parcelas[i];
      if (!parcela.pago) {
        const dataVencimento = new Date(parcela.vencimento);
        if (dataVencimento.getMonth() === mesAtual && dataVencimento.getFullYear() === anoAtual) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Avança para o próximo mês no dashboard
 */
function nextDashboardMonth() {
  const selectMes = document.getElementById("dashboardMonth");
  const selectAno = document.getElementById("dashboardYear");
  
  let mes = parseInt(selectMes.value);
  let ano = parseInt(selectAno.value);
  
  mes++;
  if (mes > 11) {
    mes = 0;
    ano++;
  }
  
  selectMes.value = mes;
  selectAno.value = ano;
  
  atualizarDashboard();
}

/**
 * Volta para o mês anterior no dashboard
 */
function prevDashboardMonth() {
  const selectMes = document.getElementById("dashboardMonth");
  const selectAno = document.getElementById("dashboardYear");
  
  let mes = parseInt(selectMes.value);
  let ano = parseInt(selectAno.value);
  
  mes--;
  if (mes < 0) {
    mes = 11;
    ano--;
  }
  
  selectMes.value = mes;
  selectAno.value = ano;
  
  atualizarDashboard();
}

/**
 * Alterna a exibição do parcelamento e recorrência
 */
function toggleParcelamento() {
  const formaPagamento = document.getElementById("formaPagamento").value;
  const parcelamentoDiv = document.getElementById("parcelamentoDiv");
  const recorrenteDiv = document.getElementById("recorrenteDiv");
  
  // Ocultar todas as opções primeiro
  parcelamentoDiv.classList.add("hidden");
  recorrenteDiv.classList.add("hidden");
  
  // Mostrar a opção apropriada
  if (formaPagamento === "cartao") {
    parcelamentoDiv.classList.remove("hidden");
  } else if (formaPagamento === "recorrente") {
    recorrenteDiv.classList.remove("hidden");
    // Definir dia atual como padrão
    const hoje = new Date();
    const diaRecorrenciaInput = document.getElementById("diaRecorrencia");
    if (diaRecorrenciaInput && !diaRecorrenciaInput.value) {
      diaRecorrenciaInput.value = hoje.getDate();
    }
  }
}

/**
 * Cadastra uma nova despesa
 */
function cadastrarDespesa() {
  const descricao = document.getElementById("despesaDescricao").value;
  const valor = parseFloat(document.getElementById("despesaValor").value);
  const dataCompra = document.getElementById("dataCompra").value;
  const categoria = document.getElementById("categoriaDespesa").value;
  const formaPagamento = document.getElementById("formaPagamento").value;
  
  if (!descricao || isNaN(valor) || valor <= 0 || !dataCompra) {
    exibirToast("Preencha todos os campos obrigatórios.", "warning");
    return;
  }
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    exibirToast("Usuário não autenticado. Faça login novamente.", "danger");
    return;
  }
  
  // Capturar tipo de pagamento
  const tipoPagamento = document.getElementById("tipoPagamento").value;
  
  const novaDespesa = {
    descricao: descricao,
    valor: valor,
    dataCompra: dataCompra,
    categoria: categoria,
    formaPagamento: formaPagamento,
    tipoPagamento: tipoPagamento, // Adicionar tipo de pagamento
    pago: false,
    userId: currentUser.uid // Adicionar ID do usuário
  };
  
  if (formaPagamento === "cartao") {
    const cartaoElement = document.getElementById("cartaoDespesa");
    // Validação para evitar erro de elemento null
    if (!cartaoElement) {
      console.error("Elemento cartaoDespesa não encontrado");
      exibirToast("Erro ao processar formulário. Tente novamente.", "danger");
      return;
    }
    const cartao = cartaoElement.value;
    
    // Correção: usando o ID correto "numeroParcelas" em vez de "numParcelasDespesa"
    const numeroParcelasElement = document.getElementById("numeroParcelas");
    // Validação para evitar erro de elemento null
    if (!numeroParcelasElement) {
      console.error("Elemento numeroParcelas não encontrado");
      exibirToast("Erro ao processar formulário. Tente novamente.", "danger");
      return;
    }
    const numParcelas = parseInt(numeroParcelasElement.value);
    
    if (!cartao || isNaN(numParcelas) || numParcelas <= 0) {
      exibirToast("Preencha os dados do cartão e parcelas.", "warning");
      return;
    }
    
    novaDespesa.cartao = cartao;
    novaDespesa.parcelas = [];
    
    // Buscar dados do cartão para obter fechamento e vencimento
    db.ref("cartoes").child(cartao).once("value").then(cartaoSnapshot => {
      const dadosCartao = cartaoSnapshot.val();
      
      if (!dadosCartao) {
        exibirToast("Dados do cartão não encontrados.", "danger");
        return;
      }
      
      const diaFechamento = parseInt(dadosCartao.fechamento) || 1;
      const diaVencimento = parseInt(dadosCartao.vencimento) || 10;
      
      // Calcular parcelas baseado na lógica do cartão
      const valorParcela = valor / numParcelas;
      const dataCompraObj = new Date(dataCompra);
      
      // Determinar se a compra entra na fatura atual ou próxima
      let mesInicialParcela = dataCompraObj.getMonth();
      let anoInicialParcela = dataCompraObj.getFullYear();
      
      // Se a compra foi feita após o fechamento do mês, vai para o próximo mês
      if (dataCompraObj.getDate() > diaFechamento) {
        mesInicialParcela += 1;
        if (mesInicialParcela > 11) {
          mesInicialParcela = 0;
          anoInicialParcela += 1;
        }
      }
      
      for (let i = 0; i < numParcelas; i++) {
        const mesVencimento = mesInicialParcela + i;
        const anoVencimento = anoInicialParcela + Math.floor(mesVencimento / 12);
        const mesAjustado = mesVencimento % 12;
        
        // Criar data de vencimento no dia especificado do cartão
        const dataVencimento = new Date(anoVencimento, mesAjustado, diaVencimento);
        
        // Ajustar se o dia não existir no mês (ex: 31 de fevereiro vira 28/29)
        if (dataVencimento.getDate() !== diaVencimento) {
          dataVencimento.setDate(0); // Vai para o último dia do mês anterior
        }
        
        novaDespesa.parcelas.push({
          valor: valorParcela,
          vencimento: dataVencimento.toISOString().split("T")[0],
          pago: false
        });
      }
      
      // Salvar despesa após calcular parcelas
      db.ref("despesas").push(novaDespesa)
        .then(() => {
          exibirToast("Despesa cadastrada com sucesso!", "success");
          fecharModal("cadastroDespesaModal");
          atualizarDashboard();
          filtrarTodasDespesas();
        })
        .catch(error => {
          console.error("Erro ao cadastrar despesa:", error);
          exibirToast("Erro ao cadastrar despesa. Tente novamente.", "danger");
        });
      
    }).catch(error => {
      console.error("Erro ao buscar dados do cartão:", error);
      exibirToast("Erro ao buscar dados do cartão. Tente novamente.", "danger");
    });
    
    // Retornar aqui para evitar que o código continue executando
    return;
  } else if (formaPagamento === "recorrente") {
    const diaRecorrenciaElement = document.getElementById("diaRecorrencia");
    const mesesRecorrenciaElement = document.getElementById("mesesRecorrencia");
    
    if (!diaRecorrenciaElement) {
      console.error("Elemento diaRecorrencia não encontrado");
      exibirToast("Erro ao processar formulário. Tente novamente.", "danger");
      return;
    }
    
    const diaRecorrencia = parseInt(diaRecorrenciaElement.value);
    const mesesRecorrencia = mesesRecorrenciaElement && mesesRecorrenciaElement.value.trim() !== "" ? parseInt(mesesRecorrenciaElement.value) : 0;
    
    if (isNaN(diaRecorrencia) || diaRecorrencia < 1 || diaRecorrencia > 31) {
      exibirToast("Digite um dia válido (1-31) para a recorrência.", "warning");
      return;
    }
    
    novaDespesa.diaRecorrencia = diaRecorrencia;
    novaDespesa.mesesRecorrencia = mesesRecorrencia;
    novaDespesa.recorrencias = [];
    novaDespesa.recorrenteInfinita = mesesRecorrencia === 0; // Marca se é recorrente infinita
    
    // Gerar recorrências - só criar algumas iniciais se for infinita
    const dataBase = new Date(dataCompra);
    const diaAtual = dataBase.getDate();
    const quantidadeMeses = mesesRecorrencia > 0 ? mesesRecorrencia : 6; // Se infinita, criar apenas 6 iniciais
    
    // Determinar o mês inicial baseado na data atual vs dia de recorrência
    let mesInicial = dataBase.getMonth();
    if (diaAtual > diaRecorrencia) {
      mesInicial += 1; // Começar do próximo mês se o dia já passou
    }
    
    for (let i = 0; i < quantidadeMeses; i++) {
      const dataRecorrencia = new Date(dataBase);
      dataRecorrencia.setMonth(mesInicial + i);
      dataRecorrencia.setDate(Math.min(diaRecorrencia, new Date(dataRecorrencia.getFullYear(), dataRecorrencia.getMonth() + 1, 0).getDate()));
      
      novaDespesa.recorrencias.push({
        valor: valor,
        vencimento: dataRecorrencia.toISOString().split("T")[0],
        pago: false,
        mes: dataRecorrencia.getMonth(),
        ano: dataRecorrencia.getFullYear()
      });
    }
  }
  
  // Para pagamentos à vista e recorrentes, salvar normalmente
  db.ref("despesas").push(novaDespesa)
    .then(() => {
      exibirToast("Despesa cadastrada com sucesso!", "success");
      fecharModal("cadastroDespesaModal");
      atualizarDashboard();
      filtrarTodasDespesas();
    })
    .catch(error => {
      console.error("Erro ao cadastrar despesa:", error);
      exibirToast("Erro ao cadastrar despesa. Tente novamente.", "danger");
    });
}

/**
 * Processa pagamentos automáticos para despesas vencidas
 */
function processarPagamentosAutomaticos() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zero as horas para comparação apenas de data
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    snapshot.forEach(child => {
      const despesaId = child.key;
      const despesa = child.val();
      
      // Processar apenas despesas com pagamento automático
      if (despesa.tipoPagamento !== "automatico") return;
      
      if (despesa.formaPagamento === "avista" && !despesa.pago) {
        const dataVencimento = new Date(despesa.dataCompra);
        dataVencimento.setHours(0, 0, 0, 0);
        
        if (dataVencimento <= hoje) {
          // Marcar como pago automaticamente
          db.ref("despesas").child(despesaId).update({
            pago: true,
            pagoAutomaticamente: true,
            dataPagamentoAutomatico: hoje.toISOString().split('T')[0]
          });
          console.log(`Despesa ${despesa.descricao} paga automaticamente`);
          exibirToast(`Despesa "${despesa.descricao}" foi paga automaticamente!`, "info");
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        let houveAtualizacao = false;
        const parcelasAtualizadas = despesa.parcelas.map(parcela => {
          if (!parcela.pago) {
            const dataVencimento = new Date(parcela.vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            
            if (dataVencimento <= hoje) {
              houveAtualizacao = true;
              return {
                ...parcela,
                pago: true,
                pagoAutomaticamente: true,
                dataPagamentoAutomatico: hoje.toISOString().split('T')[0]
              };
            }
          }
          return parcela;
        });
        
        if (houveAtualizacao) {
          db.ref("despesas").child(despesaId).update({
            parcelas: parcelasAtualizadas
          });
          console.log(`Parcelas de ${despesa.descricao} pagas automaticamente`);
          exibirToast(`Parcelas de "${despesa.descricao}" foram pagas automaticamente!`, "info");
        }
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        let houveAtualizacao = false;
        const recorrenciasAtualizadas = despesa.recorrencias.map(recorrencia => {
          if (!recorrencia.pago) {
            const dataVencimento = new Date(recorrencia.vencimento);
            dataVencimento.setHours(0, 0, 0, 0);
            
            if (dataVencimento <= hoje) {
              houveAtualizacao = true;
              return {
                ...recorrencia,
                pago: true,
                pagoAutomaticamente: true,
                dataPagamentoAutomatico: hoje.toISOString().split('T')[0]
              };
            }
          }
          return recorrencia;
        });
        
        if (houveAtualizacao) {
          db.ref("despesas").child(despesaId).update({
            recorrencias: recorrenciasAtualizadas
          });
          console.log(`Recorrências de ${despesa.descricao} pagas automaticamente`);
          exibirToast(`Recorrências de "${despesa.descricao}" foram pagas automaticamente!`, "info");
        }
      }
    });
  });
}

/**
 * Gera novas recorrências para despesas infinitas quando necessário
 */
function gerarNovasRecorrencias(despesaId, despesa) {
  if (!despesa.recorrenteInfinita) return;
  
  const hoje = new Date();
  const ultimaRecorrencia = despesa.recorrencias[despesa.recorrencias.length - 1];
  const ultimaData = new Date(ultimaRecorrencia.vencimento);
  
  // Se a última recorrência está dentro de 2 meses do presente, gerar mais
  const diferenciaMeses = (hoje.getFullYear() - ultimaData.getFullYear()) * 12 + (hoje.getMonth() - ultimaData.getMonth());
  
  if (diferenciaMeses >= -2) {
    const novasRecorrencias = [];
    const quantidadeGerar = 6; // Gerar mais 6 meses
    
    for (let i = 1; i <= quantidadeGerar; i++) {
      const novaData = new Date(ultimaData);
      novaData.setMonth(ultimaData.getMonth() + i);
      novaData.setDate(Math.min(despesa.diaRecorrencia, new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0).getDate()));
      
      novasRecorrencias.push({
        valor: despesa.valor,
        vencimento: novaData.toISOString().split('T')[0],
        pago: false,
        mes: novaData.getMonth(),
        ano: novaData.getFullYear()
      });
    }
    
    if (novasRecorrencias.length > 0) {
      const recorrenciasAtualizadas = [...despesa.recorrencias, ...novasRecorrencias];
      db.ref("despesas").child(despesaId).update({
        recorrencias: recorrenciasAtualizadas
      });
    }
  }
}

/**
 * Paga uma despesa selecionada
 */
function pagarDespesa() {
  const despesaId = document.getElementById("despesaSelect").value;
  
  if (!despesaId) {
    exibirToast("Selecione uma despesa para pagar.", "warning");
    return;
  }
  
  db.ref("despesas").child(despesaId).once("value").then(snapshot => {
    const despesa = snapshot.val();
    
    if (despesa.formaPagamento === "avista") {
      db.ref("despesas").child(despesaId).update({
        pago: true
      }).then(() => {
        exibirToast("Despesa paga com sucesso!", "success");
        fecharModal("pagarDespesaModal");
        atualizarDashboard();
        filtrarTodasDespesas();
      });
    } else if (despesa.formaPagamento === "cartao") {
      const parcelaIndex = parseInt(document.getElementById("parcelaSelect").value);
      
      if (isNaN(parcelaIndex)) {
        exibirToast("Selecione uma parcela para pagar.", "warning");
        return;
      }
      
      db.ref(`despesas/${despesaId}/parcelas/${parcelaIndex}`).update({
        pago: true
      }).then(() => {
        exibirToast("Parcela paga com sucesso!", "success");
        fecharModal("pagarDespesaModal");
        atualizarDashboard();
        filtrarTodasDespesas();
      });
    } else if (despesa.formaPagamento === "recorrente") {
      const parcelaIndex = parseInt(document.getElementById("parcelaSelect").value);
      
      if (isNaN(parcelaIndex)) {
        exibirToast("Selecione uma recorrência para pagar.", "warning");
        return;
      }
      
      db.ref(`despesas/${despesaId}/recorrencias/${parcelaIndex}`).update({
        pago: true
      }).then(() => {
        // Gerar novas recorrências se necessário para despesas infinitas
        gerarNovasRecorrencias(despesaId, despesa);
        
        exibirToast("Recorrência paga com sucesso!", "success");
        fecharModal("pagarDespesaModal");
        atualizarDashboard();
        filtrarTodasDespesas();
      });
    }
  });
}

/**
 * Carrega as parcelas de uma despesa
 */
function carregarParcelas() {
  const despesaId = document.getElementById("despesaSelect").value;
  const parcelaSelect = document.getElementById("parcelaSelect");
  parcelaSelect.innerHTML = "";
  
  if (!despesaId) return;
  
  db.ref("despesas").child(despesaId).once("value").then(snapshot => {
    const despesa = snapshot.val();
    
    if (despesa.formaPagamento === "avista") {
      document.getElementById("parcelasDiv").classList.add("hidden");
    } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
      document.getElementById("parcelasDiv").classList.remove("hidden");
      
      despesa.parcelas.forEach((parcela, index) => {
        if (!parcela.pago) {
          const option = document.createElement("option");
          option.value = index;
          option.text = `Parcela ${index+1} - Venc: ${parcela.vencimento} - R$ ${parseFloat(parcela.valor).toFixed(2)}`;
          parcelaSelect.appendChild(option);
        }
      });
    } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
      document.getElementById("parcelasDiv").classList.remove("hidden");
      
      despesa.recorrencias.forEach((recorrencia, index) => {
        if (!recorrencia.pago) {
          const option = document.createElement("option");
          option.value = index;
          const dataVenc = new Date(recorrencia.vencimento);
          option.text = `${dataVenc.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} - Venc: ${recorrencia.vencimento} - R$ ${parseFloat(recorrencia.valor).toFixed(2)}`;
          parcelaSelect.appendChild(option);
        }
      });
    }
  });
}

/**
 * Filtra todas as despesas
 */
function filtrarTodasDespesas() {
  const filtroDescricao = document.getElementById("filtroDescricao").value.toLowerCase();
  const tbody = document.getElementById("todasDespesasBody");
  tbody.innerHTML = "";
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const key = child.key;
      const despesa = child.val();
      
      if (filtroDescricao && !despesa.descricao.toLowerCase().includes(filtroDescricao)) {
        return;
      }
      
      if (despesa.formaPagamento === "avista") {
        const tr = document.createElement("tr");
        const dataCompra = new Date(despesa.dataCompra);
        
        tr.innerHTML = `
          <td data-label="Descrição">${despesa.descricao}</td>
          <td data-label="Valor">R$ ${parseFloat(despesa.valor).toFixed(2)}</td>
          <td data-label="Detalhes">${dataCompra.toLocaleDateString()} • ${getCategoriaName(despesa.categoria)} • ${despesa.pago ? 
            (despesa.pagoAutomaticamente ? 
              '<span class="badge bg-info">Pago Auto</span>' : 
              '<span class="badge bg-success">Pago</span>') : 
            '<span class="badge bg-warning">Pendente</span>'}</td>
          <td data-label="Categoria" style="display: none;">${getCategoriaName(despesa.categoria)}</td>
          <td data-label="Status" style="display: none;">${despesa.pago ? 
            (despesa.pagoAutomaticamente ? 
              '<span class="badge bg-info">Pago Automaticamente</span>' : 
              '<span class="badge bg-success">Pago</span>') : 
            '<span class="badge bg-warning">Pendente</span>'}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" onclick="editarDespesa('${key}')" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" onclick="excluirDespesa('${key}')" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        
        tbody.appendChild(tr);
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach((parcela, index) => {
          const tr = document.createElement("tr");
          const dataVencimento = new Date(parcela.vencimento);
          
          tr.innerHTML = `
            <td data-label="Descrição">${despesa.descricao} - Parcela ${index+1}/${despesa.parcelas.length}</td>
            <td data-label="Valor">R$ ${parseFloat(parcela.valor).toFixed(2)}</td>
            <td data-label="Detalhes">${dataVencimento.toLocaleDateString()} • ${getCategoriaName(despesa.categoria)} • ${parcela.pago ? 
              (parcela.pagoAutomaticamente ? 
                '<span class="badge bg-info">Pago Auto</span>' : 
                '<span class="badge bg-success">Pago</span>') : 
              '<span class="badge bg-warning">Pendente</span>'}</td>
            <td data-label="Categoria" style="display: none;">${getCategoriaName(despesa.categoria)}</td>
            <td data-label="Status" style="display: none;">${parcela.pago ? 
              (parcela.pagoAutomaticamente ? 
                '<span class="badge bg-info">Pago Automaticamente</span>' : 
                '<span class="badge bg-success">Pago</span>') : 
              '<span class="badge bg-warning">Pendente</span>'}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" onclick="editarDespesa('${key}')" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="excluirDespesa('${key}')" title="Excluir">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          `;
          
          tbody.appendChild(tr);
        });
      } else if (despesa.formaPagamento === "recorrente" && despesa.recorrencias) {
        // Para despesas recorrentes, mostramos apenas uma linha na tabela
        const tr = document.createElement("tr");
        
        // Para despesas recorrentes infinitas, não contamos as pendentes
        let recorrenciasPendentes = 0;
        let valorTotal = 0;
        
        if (!despesa.recorrenteInfinita) {
          despesa.recorrencias.forEach(recorrencia => {
            if (!recorrencia.pago) {
              recorrenciasPendentes++;
              valorTotal += parseFloat(recorrencia.valor);
            }
          });
        }
        
        // Obtemos a próxima data de vencimento (a mais próxima que está pendente)
        let proximaData = null;
        for (let i = 0; i < despesa.recorrencias.length; i++) {
          const recorrencia = despesa.recorrencias[i];
          if (!recorrencia.pago) {
            const dataVencimento = new Date(recorrencia.vencimento);
            if (!proximaData || dataVencimento < proximaData) {
              proximaData = dataVencimento;
            }
          }
        }
        
        // Se não houver próxima data pendente, usamos a última data da recorrência
        if (!proximaData && despesa.recorrencias.length > 0) {
          const ultimaRecorrencia = despesa.recorrencias[despesa.recorrencias.length - 1];
          proximaData = new Date(ultimaRecorrencia.vencimento);
          
          // Calculamos a próxima data com base no dia de recorrência
          if (despesa.diaRecorrencia) {
            const hoje = new Date();
            proximaData = new Date(hoje.getFullYear(), hoje.getMonth() + 1, Math.min(despesa.diaRecorrencia, 28));
          }
        }
        
        const dataVencimentoStr = proximaData ? proximaData.toLocaleDateString() : "N/A";
        
        // Status: Para recorrentes infinitas sempre "Ativa", para outras mostra pendentes
        let statusText;
        if (despesa.recorrenteInfinita) {
          statusText = '<span class="badge bg-info">Ativa (Recorrente)</span>';
        } else {
          statusText = recorrenciasPendentes > 0 ? 
                     `<span class="badge bg-warning">Pendente (${recorrenciasPendentes})</span>` : 
                     '<span class="badge bg-success">Concluída</span>';
        }
        
        tr.innerHTML = `
          <td data-label="Descrição">${despesa.descricao} - Recorrente</td>
          <td data-label="Valor">R$ ${parseFloat(despesa.valor).toFixed(2)}/mês</td>
          <td data-label="Detalhes">${dataVencimentoStr} • ${getCategoriaName(despesa.categoria)} • ${statusText}</td>
          <td data-label="Categoria" style="display: none;">${getCategoriaName(despesa.categoria)}</td>
          <td data-label="Status" style="display: none;">${statusText}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" onclick="editarDespesa('${key}')" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" onclick="excluirDespesa('${key}')" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        
        tbody.appendChild(tr);
      }
    });
  });
}

/**
 * Obtém o nome da categoria pelo ID
 * @param {string} categoriaId - ID da categoria
 * @returns {string} Nome da categoria ou "Sem categoria"
 */
function getCategoriaName(categoriaId) {
  if (!categoriaId) return "Sem categoria";
  return window.novo_categoriasMap[categoriaId] || "Categoria não encontrada";
}

/**
 * Carrega dados de uma despesa para edição
 * @param {string} despesaId - ID da despesa
 */
function editarDespesa(despesaId) {
  // Salvar ID para uso na atualização
  document.getElementById("despesaIdEditar").value = despesaId;
  
  // Buscar dados da despesa
  db.ref("despesas").child(despesaId).once("value").then(snapshot => {
    const despesa = snapshot.val();
    if (!despesa) {
      exibirToast("Despesa não encontrada.", "danger");
      return;
    }
    
    // Preencher formulário com dados da despesa
    document.getElementById("despesaDescricao").value = despesa.descricao;
    document.getElementById("despesaValor").value = despesa.valor;
    document.getElementById("dataCompra").value = despesa.dataCompra;
    document.getElementById("categoriaDespesa").value = despesa.categoria || "";
    document.getElementById("formaPagamento").value = despesa.formaPagamento;
    document.getElementById("tipoPagamento").value = despesa.tipoPagamento || "manual";
    
    // Exibir campos específicos de acordo com a forma de pagamento
    toggleParcelamento();
    
    // Preencher campos específicos para cada forma de pagamento
    if (despesa.formaPagamento === "cartao") {
      document.getElementById("cartaoDespesa").value = despesa.cartao || "";
      document.getElementById("numeroParcelas").value = despesa.parcelas ? despesa.parcelas.length : 1;
    } else if (despesa.formaPagamento === "recorrente") {
      document.getElementById("diaRecorrencia").value = despesa.diaRecorrencia || "";
      document.getElementById("mesesRecorrencia").value = despesa.mesesRecorrencia || "";
    }
    
    // Mudar título do modal e botões
    document.querySelector("#cadastroDespesaModal .modal-title").textContent = "Editar Despesa";
    
    // Esconder botão de cadastrar, mostrar botão de editar
    const btnCadastrar = document.getElementById("btnCadastrarDespesa");
    const btnEditar = document.getElementById("btnEditarDespesa");
    if (btnCadastrar) {
      btnCadastrar.style.display = "none";
    }
    if (btnEditar) {
      btnEditar.style.display = "inline-block";
    }
    
    // Abrir modal
    abrirModal("cadastroDespesaModal");
  });
}

/**
 * Exclui uma despesa
 * @param {string} despesaId - ID da despesa
 */
function excluirDespesa(despesaId) {
  if (confirm("Tem certeza que deseja excluir esta despesa?")) {
    db.ref("despesas").child(despesaId).remove()
      .then(() => {
        exibirToast("Despesa excluída com sucesso!", "success");
        atualizarDashboard();
        filtrarTodasDespesas();
      })
      .catch(error => {
        console.error("Erro ao excluir despesa:", error);
        exibirToast("Erro ao excluir despesa. Tente novamente.", "danger");
      });
  }
}

/**
 * Renderiza o calendário
 */
function renderCalendar() {
  const calendarContainer = document.getElementById("calendarContainer");
  calendarContainer.innerHTML = "";
  
  const monthYearElem = document.getElementById("calendarMonthYear");
  const date = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
  const firstDayOfMonth = date.getDay();
  
  monthYearElem.innerText = `${date.toLocaleString('pt-BR', { month: 'long' })} ${currentCalendarYear}`;
  
  // Criar grid do calendário
  const calendarGrid = document.createElement("div");
  calendarGrid.className = "calendar-grid";
  
  // Adicionar cabeçalhos dos dias da semana
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-day-header";
    dayHeader.textContent = day;
    calendarGrid.appendChild(dayHeader);
  });
  
  // Adicionar espaços vazios para os dias antes do primeiro dia do mês
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day";
    calendarGrid.appendChild(emptyDay);
  }
  
  // Buscar apenas despesas do usuário atual para o mês
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    let despesasPorDia = {};
    
    snapshot.forEach(child => {
      const despesa = child.val();
      
      // Despesas à vista
      if (despesa.formaPagamento === "avista" && !despesa.pago && despesa.dataCompra) {
        const data = new Date(despesa.dataCompra);
        if (data.getMonth() === currentCalendarMonth && data.getFullYear() === currentCalendarYear) {
          const dia = data.getDate();
          if (!despesasPorDia[dia]) despesasPorDia[dia] = [];
          despesasPorDia[dia].push(despesa);
        }
      }
      // Parcelas de cartão
      else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach((parcela, index) => {
          if (!parcela.pago && parcela.vencimento) {
            const data = new Date(parcela.vencimento);
            if (data.getMonth() === currentCalendarMonth && data.getFullYear() === currentCalendarYear) {
              const dia = data.getDate();
              if (!despesasPorDia[dia]) despesasPorDia[dia] = [];
              despesasPorDia[dia].push({
                ...despesa,
                parcela: index + 1,
                totalParcelas: despesa.parcelas.length,
                valorParcela: parcela.valor
              });
            }
          }
        });
      }
    });
    
    // Adicionar dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;
      
      // Verificar se há despesas neste dia
      if (despesasPorDia[day] && despesasPorDia[day].length > 0) {
        dayElement.classList.add("has-events");
        dayElement.addEventListener("click", () => showDayDetails(day, despesasPorDia[day]));
      }
      
      calendarGrid.appendChild(dayElement);
    }
    
    calendarContainer.appendChild(calendarGrid);
  });
}

/**
 * Mostra detalhes das despesas de um dia
 * @param {number} day - Dia do mês
 * @param {Array} despesas - Lista de despesas do dia
 */
function showDayDetails(day, despesas) {
  const date = new Date(currentCalendarYear, currentCalendarMonth, day);
  document.getElementById("calendarTitulo").innerText = `Despesas de ${date.toLocaleDateString()}`;
  
  const calendarContainer = document.getElementById("calendarContainer");
  calendarContainer.innerHTML = "";
  
  const backButton = document.createElement("button");
  backButton.className = "btn btn-outline mb-3";
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar ao Calendário';
  backButton.addEventListener("click", renderCalendar);
  calendarContainer.appendChild(backButton);
  
  const totalElement = document.createElement("div");
  totalElement.className = "mb-3";
  let totalDia = 0;
  despesas.forEach(d => {
    if (d.formaPagamento === "avista") {
      totalDia += parseFloat(d.valor) || 0;
    } else if (d.valorParcela) {
      totalDia += parseFloat(d.valorParcela) || 0;
    }
  });
  totalElement.innerHTML = `<strong>Total do dia:</strong> R$ ${totalDia.toFixed(2)}`;
  calendarContainer.appendChild(totalElement);
  
  const listElement = document.createElement("div");
  listElement.className = "despesas-lista";
  
  despesas.forEach(despesa => {
    const despesaElement = document.createElement("div");
    despesaElement.className = "despesa-item";
    
    if (despesa.formaPagamento === "avista") {
      despesaElement.innerHTML = `
        <div class="despesa-info">
          <div class="despesa-titulo">${despesa.descricao}</div>
          <div class="despesa-detalhe">À Vista - ${getCategoriaName(despesa.categoria)}</div>
        </div>
        <div class="despesa-valor">R$ ${parseFloat(despesa.valor).toFixed(2)}</div>
      `;
    } else {
      despesaElement.innerHTML = `
        <div class="despesa-info">
          <div class="despesa-titulo">${despesa.descricao}</div>
          <div class="despesa-detalhe">Parcela ${despesa.parcela}/${despesa.totalParcelas}\n${getCategoriaName(despesa.categoria)}</div>
        </div>
        <div class="despesa-valor">R$ ${parseFloat(despesa.valorParcela).toFixed(2)}</div>
      `;
    }
    
    listElement.appendChild(despesaElement);
  });
  
  calendarContainer.appendChild(listElement);
}

/**
 * Navega para o mês anterior no calendário
 */
function prevMonth() {
  currentCalendarMonth--;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderCalendar();
}

/**
 * Navega para o próximo mês no calendário
 */
function nextMonth() {
  currentCalendarMonth++;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderCalendar();
}

// ===================== MÓDULO DE AUTENTICAÇÃO =====================

/**
 * Faz logout do usuário
 */
function fazerLogout() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = 'login.html';
    })
    .catch((error) => {
      console.error('Erro ao fazer logout:', error);
      exibirToast("Erro ao fazer logout. Tente novamente.", "danger");
    });
}

/**
 * Carrega os dados do usuário
 */
function carregarDadosUsuario() {
  if (!currentUser) return;
  
  // Verificar se o usuário tem dados
  db.ref(`users/${currentUser.uid}/data`).once("value")
    .then((snapshot) => {
      if (!snapshot.exists()) {
        // Criar estrutura inicial de dados
        criarDadosIniciais();
      } else {
        // Carregar categorias primeiro
        carregarCategoriasNoMapa();
        
        // Carregar categorias
        loadCategorias();
        
        // Carregar dados do dashboard
        atualizarDashboard();
        
        // Carregar filtros
        loadCategoriasFiltro();
        
        // Atualizar select de cartões
        updateCartaoSelect();
      }
    })
    .catch((error) => {
      console.error('Erro ao verificar dados do usuário:', error);
      exibirToast("Erro ao carregar dados. Tente novamente.", "danger");
    });
}

/**
 * Carrega todas as categorias no mapa global
 */
function carregarCategoriasNoMapa() {
  if (!currentUser) return;
  
  db.ref(`users/${currentUser.uid}/data/categorias`).once("value").then(snapshot => {
    if (snapshot.exists()) {
      window.novo_categoriasMap = {};
      snapshot.forEach(child => {
        const categoriaId = child.key;
        const categoria = child.val();
        window.novo_categoriasMap[categoriaId] = categoria.nome;
      });
    }
  }).catch(error => {
    console.error('Erro ao carregar categorias:', error);
  });
}

/**
 * Cria dados iniciais para o usuário
 */
function criarDadosIniciais() {
  // Criar categorias padrão
  const categoriasIniciais = {
    "cat1": { nome: "Alimentação" },
    "cat2": { nome: "Transporte" },
    "cat3": { nome: "Moradia" },
    "cat4": { nome: "Saúde" },
    "cat5": { nome: "Educação" },
    "cat6": { nome: "Lazer" },
    "cat7": { nome: "Outros" }
  };
  
  db.ref(`users/${currentUser.uid}/data/categorias`).set(categoriasIniciais)
    .then(() => {
      // Criar limites padrão
      const limitesIniciais = {
        "cat1": { limite: 1000 },
        "cat2": { limite: 500 },
        "cat3": { limite: 2000 },
        "cat4": { limite: 500 },
        "cat5": { limite: 500 },
        "cat6": { limite: 300 },
        "cat7": { limite: 200 }
      };
      
      return db.ref(`users/${currentUser.uid}/data/limites_categorias`).set(limitesIniciais);
    })
    .then(() => {
      exibirToast("Dados iniciais criados com sucesso!", "success");
      loadCategorias();
      loadCategoriasFiltro();
    })
    .catch((error) => {
      console.error('Erro ao criar categorias padrão:', error);
      exibirToast("Erro ao criar dados iniciais. Tente novamente.", "danger");
    });
}

/**
 * Obtém o ID do usuário atual
 * @returns {string|null} ID do usuário atual ou null se não estiver autenticado
 */
function obterUsuarioId() {
  return currentUser ? currentUser.uid : null;
}

/**
 * Obtém o nome do usuário atual
 * @returns {string} Nome do usuário atual ou 'Usuário' se não tiver nome
 */
function obterUsuarioNome() {
  return currentUser ? (currentUser.displayName || 'Usuário') : 'Usuário';
}

/**
 * Obtém o email do usuário atual
 * @returns {string|null} Email do usuário atual ou null se não estiver autenticado
 */
function obterUsuarioEmail() {
  return currentUser ? currentUser.email : null;
}

/**
 * Obtém a foto do usuário atual
 * @returns {string} URL da foto do usuário ou URL de avatar gerado
 */
function obterUsuarioFoto() {
  if (!currentUser) return null;
  
  return currentUser.photoURL || 
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || currentUser.email);
}

// Função duplicada removida - mantendo apenas a versão completa acima

/**
 * Atualiza os relatórios com base no período selecionado
 */
function atualizarRelatorios() {
  let inicio, fim;
  
  // Se rangeStart e rangeEnd são null, significa "Todo Período"
  if (!rangeStart || !rangeEnd) {
    // Todo período - usar datas amplas
    inicio = new Date('2020-01-01');
    fim = new Date('2030-12-31');
  } else {
    inicio = new Date(rangeStart);
    fim = new Date(rangeEnd);
  }
  
  // Atualizar relatório mensal
  atualizarRelatorioMensal(inicio, fim);
  
  // Atualizar gráfico de categorias
  atualizarGraficoCategorias(inicio, fim);
}

/**
 * Atualiza o relatório mensal
 * @param {Date} inicio - Data de início
 * @param {Date} fim - Data de fim
 */
function atualizarRelatorioMensal(inicio, fim) {
  const container = document.getElementById("relatorioMensalContainer");
  container.innerHTML = "";
  
  // Buscar apenas despesas do usuário atual no período
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    let despesasPorMes = {};
    
    snapshot.forEach(child => {
      const despesa = child.val();
      
      if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
        const data = new Date(despesa.dataCompra);
        if (data >= inicio && data <= fim) {
          const mesAno = `${data.getFullYear()}-${data.getMonth() + 1}`;
          if (!despesasPorMes[mesAno]) {
            despesasPorMes[mesAno] = {
              total: 0,
              pagas: 0,
              pendentes: 0
            };
          }
          
          const valor = parseFloat(despesa.valor) || 0;
          despesasPorMes[mesAno].total += valor;
          
          if (despesa.pago) {
            despesasPorMes[mesAno].pagas += valor;
          } else {
            despesasPorMes[mesAno].pendentes += valor;
          }
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach(parcela => {
          const data = new Date(parcela.vencimento);
          if (data >= inicio && data <= fim) {
            const mesAno = `${data.getFullYear()}-${data.getMonth() + 1}`;
            if (!despesasPorMes[mesAno]) {
              despesasPorMes[mesAno] = {
                total: 0,
                pagas: 0,
                pendentes: 0
              };
            }
            
            const valor = parseFloat(parcela.valor) || 0;
            despesasPorMes[mesAno].total += valor;
            
            if (parcela.pago) {
              despesasPorMes[mesAno].pagas += valor;
            } else {
              despesasPorMes[mesAno].pendentes += valor;
            }
          }
        });
      }
    });
    
    // Criar tabela de relatório
    const table = document.createElement("table");
    table.className = "table";
    
    // Cabeçalho
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    const thMes = document.createElement("th");
    thMes.textContent = "Mês";
    headerRow.appendChild(thMes);
    
    const thTotal = document.createElement("th");
    thTotal.textContent = "Total";
    headerRow.appendChild(thTotal);
    
    const thPagas = document.createElement("th");
    thPagas.textContent = "Pagas";
    headerRow.appendChild(thPagas);
    
    const thPendentes = document.createElement("th");
    thPendentes.textContent = "Pendentes";
    headerRow.appendChild(thPendentes);
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Corpo da tabela
    const tbody = document.createElement("tbody");
    
    // Ordenar meses
    const meses = Object.keys(despesasPorMes).sort();
    
    meses.forEach(mesAno => {
      const [ano, mes] = mesAno.split('-');
      const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const mesFormatado = data.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      
      const row = document.createElement("tr");
      
      const tdMes = document.createElement("td");
      tdMes.textContent = mesFormatado;
      row.appendChild(tdMes);
      
      const tdTotal = document.createElement("td");
      tdTotal.textContent = `R$ ${despesasPorMes[mesAno].total.toFixed(2)}`;
      row.appendChild(tdTotal);
      
      const tdPagas = document.createElement("td");
      tdPagas.textContent = `R$ ${despesasPorMes[mesAno].pagas.toFixed(2)}`;
      row.appendChild(tdPagas);
      
      const tdPendentes = document.createElement("td");
      tdPendentes.textContent = `R$ ${despesasPorMes[mesAno].pendentes.toFixed(2)}`;
      row.appendChild(tdPendentes);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
  });
}

/**
 * Atualiza o gráfico de categorias
 * @param {Date} inicio - Data de início
 * @param {Date} fim - Data de fim
 */
/**
 * Calcula previsões de gastos para os próximos meses
 */
function novo_calcularPrevisoes() {
  console.log('Calculando previsões com período:', rangeStart, 'até', rangeEnd);
  
  const graficoContainer = document.getElementById("novo_graficoPrevisao");
  const tabelaContainer = document.getElementById("novo_tabelaPrevisao");
  
  if (!graficoContainer && !tabelaContainer) {
    console.log('Containers de previsão não encontrados');
    return;
  }
  
  // Definir período para análise das previsões
  let inicio, fim;
  if (!rangeStart || !rangeEnd) {
    // Todo período - usar últimos 6 meses para calcular previsões
    inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 6);
    fim = new Date();
  } else {
    inicio = new Date(rangeStart);
    fim = new Date(rangeEnd);
  }
  
  console.log('Período para cálculo de previsões:', inicio, 'até', fim);
  
  if (graficoContainer) {
    graficoContainer.innerHTML = '<div class="alert alert-info"><i class="fas fa-calculator"></i> Calculando previsões baseadas no período selecionado...</div>';
  }
  
  if (tabelaContainer) {
    tabelaContainer.innerHTML = '<div class="alert alert-info">Gerando tabela de previsões...</div>';
  }
  
  // Simular cálculos (aqui você pode implementar a lógica real de previsões)
  setTimeout(() => {
    if (graficoContainer) {
      graficoContainer.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-chart-line"></i> 
          Previsões calculadas para o período: ${inicio.toLocaleDateString()} - ${fim.toLocaleDateString()}
        </div>
      `;
    }
    
    if (tabelaContainer) {
      tabelaContainer.innerHTML = `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Previsão de Gastos</th>
                <th>Tendência</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Próximo mês</td>
                <td>R$ 2.500,00</td>
                <td><i class="fas fa-arrow-up text-danger"></i> +5%</td>
              </tr>
              <tr>
                <td>Segundo mês</td>
                <td>R$ 2.300,00</td>
                <td><i class="fas fa-arrow-down text-success"></i> -8%</td>
              </tr>
              <tr>
                <td>Terceiro mês</td>
                <td>R$ 2.400,00</td>
                <td><i class="fas fa-arrow-up text-warning"></i> +4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
  }, 1000);
}

/**
 * Atualiza o gráfico de categorias
 * @param {Date} inicio - Data de início
 * @param {Date} fim - Data de fim
 */
function atualizarGraficoCategorias(inicio, fim) {
  // Buscar apenas despesas do usuário atual no período
  db.ref("despesas").orderByChild("userId").equalTo(currentUser ? currentUser.uid : "").once("value").then(snapshot => {
    let despesasPorCategoria = {};
    
    snapshot.forEach(child => {
      const despesa = child.val();
      const categoriaId = despesa.categoria;
      
      if (!categoriaId) return;
      
      if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
        const data = new Date(despesa.dataCompra);
        if (data >= inicio && data <= fim) {
          if (!despesasPorCategoria[categoriaId]) {
            despesasPorCategoria[categoriaId] = 0;
          }
          despesasPorCategoria[categoriaId] += parseFloat(despesa.valor) || 0;
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach(parcela => {
          const data = new Date(parcela.vencimento);
          if (data >= inicio && data <= fim) {
            if (!despesasPorCategoria[categoriaId]) {
              despesasPorCategoria[categoriaId] = 0;
            }
            despesasPorCategoria[categoriaId] += parseFloat(parcela.valor) || 0;
          }
        });
      }
    });
    
    // Buscar nomes das categorias
    db.ref("categorias").once("value").then(snapshot => {
      let categorias = {};
      
      snapshot.forEach(child => {
        categorias[child.key] = child.val().nome;
      });
      
      // Preparar dados para o gráfico
      let series = [];
      let labels = [];
      
      // Debug para verificar todas as categorias e valores
      console.log("Despesas por Categoria:", despesasPorCategoria);
      console.log("Categorias Disponíveis:", categorias);
      
      // Usar todas as categorias do sistema, mesmo sem despesas
      snapshot.forEach(child => {
        const categoriaId = child.key;
        const valor = despesasPorCategoria[categoriaId] || 0;
        
        // Incluir todas as categorias, não apenas as que têm despesas
        series.push(valor);
        labels.push(categorias[categoriaId] || "Categoria Desconhecida");
      });
      
      // Criar gráfico
      const options = {
        series: series,
        chart: {
          type: 'pie',
          height: 350
        },
        labels: labels,
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        colors: ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#795548'],
        tooltip: {
          y: {
            formatter: function(value) {
              return value !== null && value !== undefined ? "R$ " + value.toFixed(2) : "R$ 0.00";
            }
          }
        }
      };
      
      // Destruir gráfico anterior se existir
      if (window.categoriasChart) {
        window.categoriasChart.destroy();
      }
      
      // Criar novo gráfico
      window.categoriasChart = new ApexCharts(document.getElementById("graficoCategorias"), options);
      window.categoriasChart.render();
    });
  });
}

/**
 * Carrega as categorias
 */
function loadCategorias() {
  const categoriasLista = document.getElementById("categoriasLista");
  const categoriasListaPrincipal = document.getElementById("categoriasListaPrincipal");
  
  if (categoriasLista) categoriasLista.innerHTML = "";
  if (categoriasListaPrincipal) categoriasListaPrincipal.innerHTML = "";
  
  // Limpar mapa de categorias
  window.novo_categoriasMap = {};
  
  db.ref("categorias").once("value").then(snapshot => {
    if (categoriasLista) {
      snapshot.forEach(child => {
        const key = child.key;
        const categoria = child.val();
        const div = document.createElement("div");
        div.className = "categoria-item";
        
        div.innerHTML = `
          <div class="categoria-info">
            <div class="categoria-titulo">${categoria.nome}</div>
          </div>
          <div class="categoria-acoes">
            <button class="btn-icon btn-primary" onclick="prepararEditarCategoria('${key}', '${categoria.nome}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-danger" onclick="excluirCategoria('${key}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        categoriasLista.appendChild(div);
        
        // Adicionar ao mapa de categorias
        window.novo_categoriasMap[key] = categoria.nome;
      });
    }
    
    if (categoriasListaPrincipal) {
      let html = "<h3>Categorias Cadastradas</h3>";
      
      if (snapshot.exists()) {
        html += "<div class='table-container'><table><thead><tr><th>Nome</th></tr></thead><tbody>";
        
        snapshot.forEach(child => {
          const categoria = child.val();
          html += `
            <tr>
              <td>${categoria.nome}</td>
            </tr>
          `;
          
          // Adicionar ao mapa de categorias
          window.novo_categoriasMap[child.key] = categoria.nome;
        });
        
        html += "</tbody></table></div>";
      } else {
        html += "<p>Nenhuma categoria cadastrada.</p>";
      }
      
      categoriasListaPrincipal.innerHTML = html;
    }
    
    // Atualizar select de categorias
    updateCategoriaSelect();
  });
}

/**
 * Carrega as categorias para o filtro
 */
function loadCategoriasFiltro() {
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  if (!categoriaFiltro) return;
  
  categoriaFiltro.innerHTML = "<option value=''>Todas as Categorias</option>";
  
  db.ref("categorias").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const categoria = child.val();
      const option = document.createElement("option");
      option.value = child.key;
      option.text = categoria.nome;
      categoriaFiltro.appendChild(option);
    });
  });
}

/**
 * Atualiza o select de categorias
 */
function updateCategoriaSelect() {
  const categoriaSelect = document.getElementById("categoriaDespesa");
  if (!categoriaSelect) return;
  
  categoriaSelect.innerHTML = "<option value=''>Selecione a Categoria</option>";
  
  db.ref("categorias").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const categoria = child.val();
      const option = document.createElement("option");
      option.value = child.key;
      option.text = categoria.nome;
      categoriaSelect.appendChild(option);
    });
  });
}

/**
 * Adiciona uma categoria
 */
function adicionarCategoria() {
  const novaCategoria = document.getElementById("novaCategoria").value;
  
  if (!novaCategoria) {
    exibirToast("Digite o nome da categoria.", "warning");
    return;
  }
  
  db.ref("categorias").push({
    nome: novaCategoria
  }).then(() => {
    exibirToast("Categoria adicionada com sucesso!", "success");
    document.getElementById("novaCategoria").value = "";
    loadCategorias();
    loadCategoriasFiltro();
  }).catch(err => {
    console.error("Erro ao adicionar categoria:", err);
    exibirToast("Erro ao adicionar categoria: " + err.message, "danger");
  });
}

/**
 * Exclui uma categoria
 */
function excluirCategoria(categoriaId) {
  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    db.ref("categorias").child(categoriaId).remove()
      .then(() => {
        exibirToast("Categoria excluída com sucesso!", "success");
        loadCategorias();
        loadCategoriasFiltro();
      })
      .catch(err => {
        console.error("Erro ao excluir categoria:", err);
        exibirToast("Erro ao excluir categoria: " + err.message, "danger");
      });
  }
}

/**
 * Adiciona um cartão
 */
function adicionarCartao() {
  const nomeCartao = document.getElementById("nomeCartao").value;
  const limiteCartao = parseFloat(document.getElementById("limiteCartao").value);
  const fechamentoCartao = parseInt(document.getElementById("fechamentoCartao").value);
  const vencimentoCartao = parseInt(document.getElementById("vencimentoCartao").value);
  
  if (!nomeCartao) {
    exibirToast("Digite o nome do cartão.", "warning");
    return;
  }
  
  if (isNaN(limiteCartao) || limiteCartao <= 0) {
    exibirToast("O limite do cartão deve ser um número maior que zero.", "warning");
    return;
  }
  
  if (isNaN(fechamentoCartao) || fechamentoCartao < 1 || fechamentoCartao > 31) {
    exibirToast("O dia de fechamento deve ser um número entre 1 e 31.", "warning");
    return;
  }
  
  if (isNaN(vencimentoCartao) || vencimentoCartao < 1 || vencimentoCartao > 31) {
    exibirToast("O dia de vencimento deve ser um número entre 1 e 31.", "warning");
    return;
  }
  
  db.ref("cartoes").push({
    nome: nomeCartao,
    limite: limiteCartao,
    diaFechamento: fechamentoCartao,
    diaVencimento: vencimentoCartao
  }).then(() => {
    exibirToast("Cartão adicionado com sucesso!", "success");
    document.getElementById("nomeCartao").value = "";
    document.getElementById("limiteCartao").value = "";
    document.getElementById("fechamentoCartao").value = "";
    document.getElementById("vencimentoCartao").value = "";
    loadCartoes();
    updateCartaoSelect();
  }).catch(err => {
    console.error("Erro ao adicionar cartão:", err);
    exibirToast("Erro ao adicionar cartão: " + err.message, "danger");
  });
}

/**
 * Carrega os cartões cadastrados
 */
function loadCartoes() {
  const cartoesList = document.getElementById("cartoesLista");
  const cartoesListaPrincipal = document.getElementById("cartoesListaPrincipal");
  
  if (cartoesList) cartoesList.innerHTML = "";
  if (cartoesListaPrincipal) cartoesListaPrincipal.innerHTML = "";
  
  db.ref("cartoes").once("value").then(snapshot => {
    if (cartoesList) {
      snapshot.forEach(child => {
        const key = child.key;
        const cartao = child.val();
        const div = document.createElement("div");
        div.className = "cartao-item";
        
        div.innerHTML = `
          <div class="cartao-info">
            <div class="cartao-titulo">${cartao.nome}</div>
            <div class="cartao-detalhe">
              <strong>Limite:</strong> R$ ${parseFloat(cartao.limite).toFixed(2)} | 
              <strong>Dia de Fechamento:</strong> ${cartao.diaFechamento} | 
              <strong>Dia de Vencimento:</strong> ${cartao.diaVencimento}
            </div>
          </div>
          <button class="btn-icon btn-danger" onclick="excluirCartao('${key}')">
            <i class="fas fa-trash"></i>
          </button>
        `;
        
        cartoesList.appendChild(div);
      });
    }
    
    if (cartoesListaPrincipal) {
      let html = "<h3>Cartões Cadastrados</h3>";
      
      if (snapshot.exists()) {
        html += "<div class='table-container'><table><thead><tr><th>Nome</th><th>Limite</th><th>Dia de Fechamento</th><th>Dia de Vencimento</th></tr></thead><tbody>";
        
        snapshot.forEach(child => {
          const cartao = child.val();
          html += `
            <tr>
              <td>${cartao.nome}</td>
              <td>R$ ${parseFloat(cartao.limite).toFixed(2)}</td>
              <td>${cartao.diaFechamento}</td>
              <td>${cartao.diaVencimento}</td>
            </tr>
          `;
        });
        
        html += "</tbody></table></div>";
      } else {
        html += "<p>Nenhum cartão cadastrado.</p>";
      }
      
      cartoesListaPrincipal.innerHTML = html;
    }
  });
}

/**
 * Atualiza o select de cartões
 */
function updateCartaoSelect() {
  const cartaoSelect = document.getElementById("cartaoDespesa");
  if (!cartaoSelect) return;
  
  cartaoSelect.innerHTML = "<option value=''>Selecione o Cartão</option>";
  
  db.ref("cartoes").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const cartao = child.val();
      const option = document.createElement("option");
      option.value = child.key;
      option.text = cartao.nome;
      cartaoSelect.appendChild(option);
    });
  });
}

/**
 * Exclui um cartão
 */
function excluirCartao(cartaoId) {
  if (confirm("Tem certeza que deseja excluir este cartão?")) {
    db.ref("cartoes").child(cartaoId).remove()
      .then(() => {
        exibirToast("Cartão excluído com sucesso!", "success");
        loadCartoes();
        updateCartaoSelect();
      })
      .catch(err => {
        console.error("Erro ao excluir cartão:", err);
        exibirToast("Erro ao excluir cartão: " + err.message, "danger");
      });
  }
}

/**
 * Salva um novo cartão (função chamada pelo botão Salvar Cartão)
 */
function salvarCartao() {
  // Reutilizando a função adicionarCartao para não duplicar código
  adicionarCartao();
}

/**
 * Adiciona um pagamento
 */
function adicionarPagamento() {
  const container = document.getElementById("pagamentosContainer");
  const div = document.createElement("div");
  div.className = "pagamento-item d-flex gap-2 mb-2";
  
  div.innerHTML = `
    <div class="form-group mb-0" style="flex: 1;">
      <input type="number" class="form-control pagamento-dia" placeholder="Dia" min="1" max="31">
    </div>
    <div class="form-group mb-0" style="flex: 2;">
      <input type="number" class="form-control pagamento-valor" placeholder="Valor" step="0.01">
    </div>
    <button class="btn-icon" onclick="removerPagamento(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;
  
  container.appendChild(div);
}

/**
 * Remove um pagamento
 */
function removerPagamento(button) {
  const pagamentoItem = button.parentElement;
  pagamentoItem.remove();
}

/**
 * Cadastra uma pessoa
 */
function cadastrarPessoa() {
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    exibirToast("Você precisa estar logado para cadastrar uma renda.", "warning");
    return;
  }

  // Correção: usando o ID correto "nome" em vez de "nomePessoa"
  const nomeElement = document.getElementById("nome");
  // Validação para evitar erro de elemento null
  if (!nomeElement) {
    console.error("Elemento nome não encontrado");
    exibirToast("Erro ao processar formulário. Tente novamente.", "danger");
    return;
  }
  const nome = nomeElement.value;
  
  const saldoInicialElement = document.getElementById("saldoInicial");
  // Validação para evitar erro de elemento null
  if (!saldoInicialElement) {
    console.error("Elemento saldoInicial não encontrado");
    exibirToast("Erro ao processar formulário. Tente novamente.", "danger");
    return;
  }
  const saldoInicial = parseFloat(saldoInicialElement.value) || 0;
  
  if (!nome) {
    exibirToast("Digite o nome da pessoa.", "warning");
    return;
  }
  
  // Obter pagamentos
  const pagamentos = [];
  const pagamentoDias = document.querySelectorAll(".pagamento-dia");
  const pagamentoValores = document.querySelectorAll(".pagamento-valor");
  
  for (let i = 0; i < pagamentoDias.length; i++) {
    const dia = parseInt(pagamentoDias[i].value);
    const valor = parseFloat(pagamentoValores[i].value);
    
    if (!isNaN(dia) && !isNaN(valor) && dia >= 1 && dia <= 31 && valor > 0) {
      pagamentos.push({
        dia: dia,
        valor: valor
      });
    }
  }
  
  // Adicionar userId para associar a renda ao usuário atual
  db.ref("pessoas").push({
    nome: nome,
    saldoInicial: saldoInicial,
    pagamentos: pagamentos,
    userId: currentUser.uid // Adicionar ID do usuário
  }).then(() => {
    exibirToast("Renda cadastrada com sucesso!", "success");
    fecharModal("cadastroModal");
    loadRendas();
    atualizarDashboard();
  }).catch(err => {
    console.error("Erro ao cadastrar renda:", err);
    exibirToast("Erro ao cadastrar renda: " + err.message, "danger");
  });
}

/**
 * Carrega as rendas
 */
function loadRendas() {
  const rendaList = document.getElementById("usuariosListaPrincipal");
  rendaList.innerHTML = "";
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    rendaList.innerHTML = "<p>Você precisa estar logado para ver suas rendas.</p>";
    return;
  }
  
  // Buscar apenas as rendas do usuário atual
  db.ref("pessoas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    if (!snapshot.exists()) {
      rendaList.innerHTML = "<p>Nenhuma renda cadastrada.</p>";
      return;
    }
    
    snapshot.forEach(child => {
      const key = child.key;
      const pessoa = child.val();
      const div = document.createElement("div");
      div.className = "renda-item";
      
      let pagamentosInfo = "";
      if (pessoa.pagamentos && pessoa.pagamentos.length > 0) {
        pagamentosInfo = "<div class='renda-pagamentos'><strong>Pagamentos:</strong> ";
        pessoa.pagamentos.forEach(pag => {
          pagamentosInfo += `Dia: ${pag.dia}, Valor: R$ ${parseFloat(pag.valor).toFixed(2)}; `;
        });
        pagamentosInfo += "</div>";
      }
      
      div.innerHTML = `
        <div class="renda-info">
          <div class="renda-titulo">${pessoa.nome}</div>
          <div class="renda-detalhe">
            <strong>Saldo Inicial:</strong> R$ ${parseFloat(pessoa.saldoInicial).toFixed(2)}
          </div>
          ${pagamentosInfo}
        </div>
        <button class="btn-icon btn-danger" onclick="deleteRenda('${key}')">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      rendaList.appendChild(div);
    });
  });
}

/**
 * Exclui uma renda
 */
function deleteRenda(key) {
  if (!currentUser || !currentUser.uid) {
    exibirToast("Você precisa estar logado para excluir uma renda.", "warning");
    return;
  }
  
  if (confirm("Tem certeza que deseja excluir esta renda?")) {
    // Verificar primeiro se a renda pertence ao usuário atual
    db.ref("pessoas").child(key).once("value")
      .then(snapshot => {
        if (!snapshot.exists()) {
          throw new Error("Renda não encontrada");
        }
        
        const renda = snapshot.val();
        if (renda.userId !== currentUser.uid) {
          throw new Error("Você não tem permissão para excluir esta renda");
        }
        
        // Se chegou aqui, pode excluir
        return db.ref("pessoas").child(key).remove();
      })
      .then(() => {
        exibirToast("Renda excluída com sucesso!", "success");
        loadRendas();
        atualizarDashboard();
      })
      .catch(err => {
        console.error("Erro ao excluir renda:", err);
        exibirToast("Erro ao excluir renda: " + err.message, "danger");
      });
  }
}

/**
 * Atualiza a referência do banco de dados para o usuário atual
 */
function atualizarReferenciaDB(userId) {
  // Criar referência para o banco de dados do usuário
  window.userDB = firebase.database().ref(`users/${userId}/data`);
  
  // Não substituir a variável global db, apenas criar uma referência adicional
  // para manter a compatibilidade com o código existente
}

/**
 * Exibe informações do usuário logado
 */
function exibirInfoUsuario(user) {
  // Verificar se estamos na página principal
  if (document.getElementById('sidebar')) {
    // Criar ou atualizar elemento de informações do usuário
    let userInfoElement = document.getElementById('userInfo');
    
    if (!userInfoElement) {
      userInfoElement = document.createElement('div');
      userInfoElement.id = 'userInfo';
      userInfoElement.className = 'user-info';
      
      // Inserir antes do primeiro link no sidebar
      const sidebar = document.getElementById('sidebar');
      const sidebarNav = document.getElementById('sidebar-nav');
      
      if (sidebarNav) {
        // Se sidebar-nav existe, inserir antes dele
        sidebar.insertBefore(userInfoElement, sidebarNav);
      } else {
        // Se não, apenas adicionar ao início do sidebar
        sidebar.prepend(userInfoElement);
      }
    }
    
    // Atualizar conteúdo
    userInfoElement.innerHTML = `
      <div class="user-avatar">
        <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" alt="Avatar">
      </div>
      <div class="user-details">
        <div class="user-name">${user.displayName || 'Usuário'}</div>
        <div class="user-email">${user.email}</div>
      </div>
    `;
  }
}

/**
 * Adiciona botão de logout ao menu
 */
function adicionarBotaoLogout() {
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
}

/**
 * Realiza logout do usuário
 */
function logout() {
  firebase.auth().signOut().then(() => {
    // Limpar dados do usuário
    currentUser = null;
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Erro ao fazer logout:', error);
    exibirToast('Erro ao fazer logout', 'danger');
  });
}

/**
 * Toggle do dropdown mobile do usuário
 */
function toggleMobileUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('mobileUserDropdown');
  if (dropdown) {
    const isActive = dropdown.classList.contains('active');
    
    if (isActive) {
      // Fechar dropdown
      dropdown.classList.remove('active');
      document.removeEventListener('click', closeMobileDropdownOnClickOutside);
    } else {
      // Abrir dropdown
      dropdown.classList.add('active');
      setTimeout(() => {
        document.addEventListener('click', closeMobileDropdownOnClickOutside);
      }, 100);
    }
  }
}

/**
 * Fecha dropdown mobile ao clicar fora
 */
function closeMobileDropdownOnClickOutside(event) {
  const dropdown = document.getElementById('mobileUserDropdown');
  const logo = document.querySelector('.logo');
  
  if (dropdown && !dropdown.contains(event.target) && !logo.contains(event.target)) {
    dropdown.classList.remove('active');
    document.removeEventListener('click', closeMobileDropdownOnClickOutside);
  }
}

/**
 * Atualiza informações do usuário no dropdown mobile
 */
function atualizarInfoUsuarioMobile(user) {
  // Aguardar um pouco para garantir que os elementos estejam no DOM
  setTimeout(() => {
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const mobileUserAvatar = document.getElementById('mobileUserAvatar');
    
    if (mobileUserName && mobileUserEmail && mobileUserAvatar) {
      mobileUserName.textContent = user.displayName || 'Usuário';
      mobileUserEmail.textContent = user.email || '';
      
      // Atualizar avatar
      if (user.photoURL) {
        mobileUserAvatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        // Usar iniciais do nome ou ícone padrão
        const iniciais = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : user.email[0].toUpperCase();
        mobileUserAvatar.innerHTML = iniciais;
      }
    }
  }, 500);
}

/**
 * Manipula mudanças no estado de autenticação
 */
function handleAuthStateChanged(user) {
  if (user) {
    // Usuário está logado
    currentUser = user;
    
    // Carregar tema do Firebase
    loadThemeFromFirebase();
    
    // Atualizar referência do banco de dados para o usuário atual
    atualizarReferenciaDB(user.uid);
    
    // Exibir informações do usuário (desktop)
    exibirInfoUsuario(user);
    
    // Atualizar informações do usuário (mobile)
    atualizarInfoUsuarioMobile(user);
    
    // Adicionar botão de logout
    adicionarBotaoLogout();
    
    // Carregar dados do usuário
    carregarDadosUsuario();
  } else {
    // Usuário não está logado, redirecionar para a página de login
    if (!window.location.href.includes('login.html')) {
      window.location.href = 'login.html';
    }
  }
}



// ===================== MÓDULO DE ALERTAS =====================

/**
 * Verifica alertas
 */
function novo_verificarAlertas() {
  const container = document.getElementById("novo_listaAlertas");
  if (!container) return;
  
  container.innerHTML = "";
  
  const hoje = new Date();
  
  // Verificar se usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    container.innerHTML = "<p>Você precisa estar logado para ver seus alertas.</p>";
    return;
  }

  // Verificar despesas vencidas
  novo_verificarDespesasVencidas(hoje, container);
  
  // Verificar despesas próximas do vencimento
  verificarDespesasProximasVencimento(hoje, container);
  
  // Verificar limites de categorias
  verificarLimitesCategorias(container);
}

/**
 * Verifica despesas vencidas
 * @param {Date} hoje - Data atual
 * @param {HTMLElement} container - Container para adicionar os alertas
 */
function novo_verificarDespesasVencidas(hoje = new Date(), container = null) {
  if (!container) {
    container = document.getElementById("novo_listaAlertas");
    if (!container) return;
  }
  
  // Verificar se usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    return;
  }
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    let alertasVencidos = [];
    
    snapshot.forEach(child => {
      let despesa = child.val();
      
      // Verificar despesas à vista
      if (despesa.formaPagamento === "avista" && !despesa.pago && despesa.dataCompra) {
        let dataCompra = new Date(despesa.dataCompra);
        if (dataCompra < hoje) {
          let diffDays = Math.ceil((hoje - dataCompra) / (1000 * 60 * 60 * 24));
          
          alertasVencidos.push({
            tipo: "vencida",
            mensagem: `Despesa "${despesa.descricao}" está vencida há ${diffDays} dias.`,
            data: dataCompra,
            dias: diffDays,
            valor: parseFloat(despesa.valor) || 0
          });
        }
      } 
      // Verificar parcelas de cartão
      else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach((parcela, index) => {
          if (!parcela.pago) {
            let venc = new Date(parcela.vencimento);
            if (venc < hoje) {
              let diffDays = Math.ceil((hoje - venc) / (1000 * 60 * 60 * 24));
              
              alertasVencidos.push({
                tipo: "vencida",
                mensagem: `Parcela ${index+1} de "${despesa.descricao}" está vencida há ${diffDays} dias.`,
                data: venc,
                dias: diffDays,
                valor: parseFloat(parcela.valor) || 0
              });
            }
          }
        });
      }
    });
    
    // Ordenar alertas por dias de atraso (decrescente)
    alertasVencidos.sort((a, b) => b.dias - a.dias);
    
    // Adicionar alertas ao container
    if (alertasVencidos.length > 0) {
      const section = document.createElement("div");
      section.className = "alertas-section";
      
      const header = document.createElement("h3");
      header.className = "alertas-header";
      header.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Despesas Vencidas';
      section.appendChild(header);
      
      alertasVencidos.forEach(alerta => {
        const alertaEl = document.createElement("div");
        alertaEl.className = "alerta-item alerta-vencida";
        
        alertaEl.innerHTML = `
          <div class="alerta-icon"><i class="fas fa-exclamation-circle"></i></div>
          <div class="alerta-content">
            <div class="alerta-title">${alerta.mensagem}</div>
            <div class="alerta-details">
              <span>Vencimento: ${alerta.data.toLocaleDateString()}</span>
              <span>Valor: R$ ${alerta.valor.toFixed(2)}</span>
            </div>
          </div>
        `;
        
        section.appendChild(alertaEl);
      });
      
      container.appendChild(section);
    }
  });
}

/**
 * Verifica despesas próximas do vencimento
 * @param {Date} hoje - Data atual
 * @param {HTMLElement} container - Container para adicionar os alertas
 */
function verificarDespesasProximasVencimento(hoje = new Date(), container = null) {
  if (!container) {
    container = document.getElementById("novo_listaAlertas");
    if (!container) return;
  }
  
  // Verificar se usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    return;
  }
  
  // Buscar apenas despesas do usuário atual
  db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    let alertasProximos = [];
    
    snapshot.forEach(child => {
      let despesa = child.val();
      
      // Verificar despesas à vista
      if (despesa.formaPagamento === "avista" && !despesa.pago && despesa.dataCompra) {
        let dataCompra = new Date(despesa.dataCompra);
        if (dataCompra >= hoje) {
          let diffDays = Math.ceil((dataCompra - hoje) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 7) {
            alertasProximos.push({
              tipo: "proxima",
              mensagem: `Despesa "${despesa.descricao}" vence em ${diffDays} dias.`,
              data: dataCompra,
              dias: diffDays,
              valor: parseFloat(despesa.valor) || 0
            });
          }
        }
      } 
      // Verificar parcelas de cartão
      else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach((parcela, index) => {
          if (!parcela.pago) {
            let venc = new Date(parcela.vencimento);
            if (venc >= hoje) {
              let diffDays = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
              
              if (diffDays <= 7) {
                alertasProximos.push({
                  tipo: "proxima",
                  mensagem: `Parcela ${index+1} de "${despesa.descricao}" vence em ${diffDays} dias.`,
                  data: venc,
                  dias: diffDays,
                  valor: parseFloat(parcela.valor) || 0
                });
              }
            }
          }
        });
      }
    });
    
    // Ordenar alertas por dias até vencimento (crescente)
    alertasProximos.sort((a, b) => a.dias - b.dias);
    
    // Adicionar alertas ao container
    if (alertasProximos.length > 0) {
      const section = document.createElement("div");
      section.className = "alertas-section";
      
      const header = document.createElement("h3");
      header.className = "alertas-header";
      header.innerHTML = '<i class="fas fa-clock"></i> Próximos Vencimentos';
      section.appendChild(header);
      
      alertasProximos.forEach(alerta => {
        const alertaEl = document.createElement("div");
        alertaEl.className = "alerta-item alerta-vencimento";
        
        alertaEl.innerHTML = `
          <div class="alerta-icon"><i class="fas fa-clock"></i></div>
          <div class="alerta-content">
            <div class="alerta-title">${alerta.mensagem}</div>
            <div class="alerta-details">
              <span>Vencimento: ${alerta.data.toLocaleDateString()}</span>
              <span>Valor: R$ ${alerta.valor.toFixed(2)}</span>
            </div>
          </div>
        `;
        
        section.appendChild(alertaEl);
      });
      
      container.appendChild(section);
    }
  });
}

/**
 * Verifica limites de categorias
 * @param {HTMLElement} container - Container para adicionar os alertas
 */
function verificarLimitesCategorias(container = null) {
  if (!container) {
    container = document.getElementById("novo_listaAlertas");
    if (!container) return;
  }
  
  // Verificar se usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    return;
  }
  
  // Obter limites de categorias
  db.ref("limites_categorias").once("value").then(limSnapshot => {
    if (!limSnapshot.exists()) return;
    
    const limites = {};
    limSnapshot.forEach(child => {
      limites[child.key] = child.val().limite;
    });
    
    // Obter despesas do mês atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Buscar apenas despesas do usuário atual
    db.ref("despesas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
      const gastosPorCategoria = {};
      
      snapshot.forEach(child => {
        const despesa = child.val();
        const categoriaId = despesa.categoria;
        
        if (!categoriaId || !limites[categoriaId]) return;
        
        if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
          const data = new Date(despesa.dataCompra);
          if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
            if (!gastosPorCategoria[categoriaId]) gastosPorCategoria[categoriaId] = 0;
            gastosPorCategoria[categoriaId] += parseFloat(despesa.valor) || 0;
          }
        } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
          despesa.parcelas.forEach(parcela => {
            const data = new Date(parcela.vencimento);
            if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
              if (!gastosPorCategoria[categoriaId]) gastosPorCategoria[categoriaId] = 0;
              gastosPorCategoria[categoriaId] += parseFloat(parcela.valor) || 0;
            }
          });
        }
      });
      
      // Verificar categorias que ultrapassaram o limite
      const alertasLimite = [];
      
      Object.keys(limites).forEach(categoriaId => {
        const limite = parseFloat(limites[categoriaId]);
        const gasto = parseFloat(gastosPorCategoria[categoriaId] || 0);
        
        if (gasto > 0) {
          const percentual = (gasto / limite) * 100;
          
          if (percentual >= 80) {
            alertasLimite.push({
              categoriaId: categoriaId,
              limite: limite,
              gasto: gasto,
              percentual: percentual,
              tipo: percentual >= 100 ? "critico" : "alto"
            });
          }
        }
      });
      
      // Ordenar alertas por percentual (decrescente)
      alertasLimite.sort((a, b) => b.percentual - a.percentual);
      
      // Adicionar alertas ao container
      if (alertasLimite.length > 0) {
        const section = document.createElement("div");
        section.className = "alertas-section";
        
        const header = document.createElement("h3");
        header.className = "alertas-header";
        header.innerHTML = '<i class="fas fa-chart-pie"></i> Limites de Categorias';
        section.appendChild(header);
        
        alertasLimite.forEach(alerta => {
          const alertaEl = document.createElement("div");
          alertaEl.className = `alerta-item alerta-limite alerta-${alerta.tipo}`;
          
          const categoriaNome = window.novo_categoriasMap[alerta.categoriaId] || "Categoria";
          
          alertaEl.innerHTML = `
            <div class="alerta-icon"><i class="fas fa-chart-pie"></i></div>
            <div class="alerta-content">
              <div class="alerta-title">
                ${alerta.percentual >= 100 
                  ? `Limite de ${categoriaNome} ultrapassado!` 
                  : `${categoriaNome} próximo do limite!`}
              </div>
              <div class="alerta-details">
                <span>Gasto: R$ ${alerta.gasto.toFixed(2)} de R$ ${alerta.limite.toFixed(2)}</span>
                <span>${alerta.percentual.toFixed(0)}% do limite</span>
              </div>
              <div class="alerta-progress">
                <div class="progress-bar" style="width: ${Math.min(100, alerta.percentual)}%"></div>
              </div>
            </div>
          `;
          
          section.appendChild(alertaEl);
        });
        
        container.appendChild(section);
      }
    });
  });
}

/**
 * Carrega os limites de categorias
 */
function novo_carregarLimites() {
  const container = document.getElementById("novo_limitesContainer");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Obter categorias
  db.ref("categorias").once("value").then(snapshot => {
    if (!snapshot.exists()) {
      container.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
      return;
    }
    
    // Obter limites atuais
    db.ref("limites_categorias").once("value").then(limSnapshot => {
      const limites = {};
      
      if (limSnapshot.exists()) {
        limSnapshot.forEach(child => {
          limites[child.key] = child.val().limite;
        });
      }
      
      // Criar formulário de limites
      snapshot.forEach(child => {
        const categoriaId = child.key;
        const categoria = child.val();
        const limite = limites[categoriaId] || 0;
        
        const div = document.createElement("div");
        div.className = "form-group";
        
        div.innerHTML = `
          <label class="form-label">${categoria.nome}:</label>
          <input type="number" class="form-control limite-categoria" 
                 data-categoria="${categoriaId}" 
                 value="${limite}" 
                 step="0.01" min="0">
        `;
        
        container.appendChild(div);
      });
    });
  });
}

/**
 * Salva os limites de categorias
 */
function novo_salvarLimites() {
  const inputs = document.querySelectorAll(".limite-categoria");
  const limites = {};
  
  inputs.forEach(input => {
    const categoriaId = input.getAttribute("data-categoria");
    const valor = parseFloat(input.value) || 0;
    
    limites[categoriaId] = {
      limite: valor
    };
  });
  
  db.ref("limites_categorias").set(limites)
    .then(() => {
      exibirToast("Limites salvos com sucesso!", "success");
      fecharModal("novo_limitesModal");
      novo_verificarAlertas();
    })
    .catch(err => {
      console.error("Erro ao salvar limites:", err);
      exibirToast("Erro ao salvar limites: " + err.message, "danger");
    });
}

/**
 * Calcula previsões de gastos
 */
function novo_calcularPrevisoes() {
  const graficoContainer = document.getElementById("novo_graficoPrevisao");
  const tabelaContainer = document.getElementById("novo_tabelaPrevisao");
  
  if (!graficoContainer || !tabelaContainer) return;
  
  graficoContainer.innerHTML = "";
  tabelaContainer.innerHTML = "";
  
  // Obter despesas dos últimos 6 meses
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Criar array com os últimos 6 meses
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    let mes = mesAtual - i;
    let ano = anoAtual;
    
    if (mes < 0) {
      mes += 12;
      ano--;
    }
    
    meses.push({
      mes: mes,
      ano: ano,
      nome: new Date(ano, mes, 1).toLocaleString('pt-BR', { month: 'long' }),
      total: 0
    });
  }
  
  // Obter despesas
  db.ref("despesas").once("value").then(snapshot => {
    snapshot.forEach(child => {
      const despesa = child.val();
      
      if (despesa.formaPagamento === "avista" && despesa.dataCompra) {
        const data = new Date(despesa.dataCompra);
        const mes = data.getMonth();
        const ano = data.getFullYear();
        
        // Verificar se a data está nos últimos 6 meses
        for (let i = 0; i < meses.length; i++) {
          if (meses[i].mes === mes && meses[i].ano === ano) {
            meses[i].total += parseFloat(despesa.valor) || 0;
            break;
          }
        }
      } else if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
        despesa.parcelas.forEach(parcela => {
          const data = new Date(parcela.vencimento);
          const mes = data.getMonth();
          const ano = data.getFullYear();
          
          // Verificar se a data está nos últimos 6 meses
          for (let i = 0; i < meses.length; i++) {
            if (meses[i].mes === mes && meses[i].ano === ano) {
              meses[i].total += parseFloat(parcela.valor) || 0;
              break;
            }
          }
        });
      }
    });
    
    // Calcular média e tendência
    const valores = meses.map(m => m.total);
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    
    // Calcular tendência linear simples
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    
    for (let i = 0; i < valores.length; i++) {
      sumX += i;
      sumY += valores[i];
      sumXY += i * valores[i];
      sumX2 += i * i;
    }
    
    const n = valores.length;
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calcular previsões para os próximos 3 meses
    const previsoes = [];
    for (let i = 1; i <= 3; i++) {
      const previsao = intercept + slope * (n - 1 + i);
      
      let mes = (mesAtual + i) % 12;
      let ano = anoAtual + Math.floor((mesAtual + i) / 12);
      
      previsoes.push({
        mes: mes,
        ano: ano,
        nome: new Date(ano, mes, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        valor: Math.max(0, previsao)
      });
    }
    
    // Criar gráfico
    const options = {
      series: [{
        name: 'Despesas',
        data: meses.map(m => m.total.toFixed(2))
      }, {
        name: 'Previsão',
        data: [...Array(meses.length - 1).fill(null), meses[meses.length - 1].total.toFixed(2), ...previsoes.map(p => p.valor.toFixed(2))]
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight',
        width: [3, 3],
        dashArray: [0, 5]
      },
      title: {
        text: 'Tendência de Gastos',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
      },
      xaxis: {
        categories: [...meses.map(m => `${m.nome} ${m.ano}`), ...previsoes.map(p => p.nome)],
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return "R$ " + val.toFixed(2);
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return "R$ " + parseFloat(val).toFixed(2);
          }
        }
      },
      colors: ['#4361ee', '#f72585']
    };
    
    // Criar gráfico
    const chart = new ApexCharts(graficoContainer, options);
    chart.render();
    
    // Criar tabela de previsões
    let html = `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              <th>Previsão</th>
              <th>Variação</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    const ultimoMes = meses[meses.length - 1];
    
    previsoes.forEach(previsao => {
      const variacao = ((previsao.valor - ultimoMes.total) / ultimoMes.total) * 100;
      
      html += `
        <tr>
          <td>${previsao.nome}</td>
          <td>R$ ${previsao.valor.toFixed(2)}</td>
          <td class="${variacao > 0 ? 'text-danger' : 'text-success'}">
            ${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
      <div class="previsao-info mt-3">
        <p><strong>Nota:</strong> Estas previsões são baseadas na tendência dos últimos 6 meses e podem variar conforme seus hábitos de consumo.</p>
      </div>
    `;
    
    tabelaContainer.innerHTML = html;
  });
}

// ===================== INICIALIZAÇÃO =====================

// Verificar estado de autenticação
if (typeof firebase !== 'undefined' && firebase.auth) {
  firebase.auth().onAuthStateChanged(handleAuthStateChanged);
}

// Inicializar DateRangePicker quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar DateRangePicker
  initDateRangePicker();
  
  // Preencher select de ano do dashboard
  preencherDashboardAno();
  
  // Definir mês e ano atual no dashboard
  const hoje = new Date();
  document.getElementById("dashboardMonth").value = hoje.getMonth();
  document.getElementById("dashboardYear").value = hoje.getFullYear();
  
  // Atualizar dashboard
  atualizarDashboard();
  
  // Inicializar data de compra com a data atual
  const dataCompraInput = document.getElementById("dataCompra");
  if (dataCompraInput) {
    dataCompraInput.valueAsDate = hoje;
  }
  
  // Filtrar despesas
  filtrarTodasDespesas();
});

/**
 * Verifica se a despesa selecionada tem parcelas e exibe o seletor de parcelas
 */
function verificarParcelas() {
  const despesaId = document.getElementById("despesaSelect").value;
  const parcelasDiv = document.getElementById("parcelasDiv");
  const parcelaSelect = document.getElementById("parcelaSelect");
  
  // Limpar o select de parcelas
  parcelaSelect.innerHTML = "<option value=''>Selecione a Parcela</option>";
  
  // Esconder o div de parcelas por padrão
  parcelasDiv.classList.add("hidden");
  
  if (!despesaId) return;
  
  // Buscar a despesa selecionada
  db.ref("despesas").child(despesaId).once("value").then(snapshot => {
    const despesa = snapshot.val();
    
    // Verificar se é uma despesa parcelada
    if (despesa.formaPagamento === "cartao" && despesa.parcelas) {
      // Mostrar o div de parcelas
      parcelasDiv.classList.remove("hidden");
      
      // Adicionar as parcelas não pagas ao select
      despesa.parcelas.forEach((parcela, index) => {
        if (!parcela.pago) {
          const option = document.createElement("option");
          option.value = index;
          option.text = `Parcela ${index+1} - Venc: ${new Date(parcela.vencimento).toLocaleDateString()} - R$ ${parseFloat(parcela.valor).toFixed(2)}`;
          parcelaSelect.appendChild(option);
        }
      });
    }
  }).catch(error => {
    console.error("Erro ao verificar parcelas:", error);
    exibirToast("Erro ao carregar parcelas. Tente novamente.", "danger");
  });
}

/**
 * Prepara o formulário para editar uma categoria
 * @param {string} categoriaId - ID da categoria a ser editada
 * @param {string} categoriaNome - Nome atual da categoria
 */
function prepararEditarCategoria(categoriaId, categoriaNome) {
  // Ocultar formulário de adição
  document.getElementById('formAdicionarCategoria').style.display = 'none';
  
  // Mostrar formulário de edição
  document.getElementById('formEditarCategoria').style.display = 'block';
  
  // Preencher campos
  document.getElementById('editarCategoriaId').value = categoriaId;
  document.getElementById('editarCategoriaNome').value = categoriaNome;
  
  // Focar no campo de nome
  document.getElementById('editarCategoriaNome').focus();
}

/**
 * Salva a edição de uma categoria
 */
function salvarEdicaoCategoria() {
  const categoriaId = document.getElementById('editarCategoriaId').value;
  const categoriaNome = document.getElementById('editarCategoriaNome').value;
  
  if (!categoriaNome) {
    exibirToast("Digite o nome da categoria.", "warning");
    return;
  }
  
  db.ref(`categorias/${categoriaId}`).update({
    nome: categoriaNome
  }).then(() => {
    exibirToast("Categoria atualizada com sucesso!", "success");
    cancelarEdicaoCategoria();
    loadCategorias();
    loadCategoriasFiltro();
  }).catch(err => {
    console.error("Erro ao atualizar categoria:", err);
    exibirToast("Erro ao atualizar categoria: " + err.message, "danger");
  });
}

/**
 * Cancela a edição de uma categoria
 */
function cancelarEdicaoCategoria() {
  // Limpar campos
  document.getElementById('editarCategoriaId').value = '';
  document.getElementById('editarCategoriaNome').value = '';
  
  // Ocultar formulário de edição
  document.getElementById('formEditarCategoria').style.display = 'none';
  
  // Mostrar formulário de adição
  document.getElementById('formAdicionarCategoria').style.display = 'block';
}

/**
 * Função principal para salvar despesa - verifica se é criação ou edição
 */
function salvarDespesa() {
  const despesaIdEditar = document.getElementById("despesaIdEditar").value;
  
  if (despesaIdEditar && despesaIdEditar.trim() !== "") {
    // Se há ID, é uma edição
    atualizarDespesa();
  } else {
    // Se não há ID, é uma nova despesa
    cadastrarDespesa();
  }
}

/**
 * Atualiza uma despesa existente
 */
function atualizarDespesa() {
  const despesaId = document.getElementById("despesaIdEditar").value;
  
  if (!despesaId) {
    exibirToast("ID da despesa não encontrado.", "danger");
    return;
  }
  
  const descricao = document.getElementById("despesaDescricao").value;
  const valor = parseFloat(document.getElementById("despesaValor").value);
  const dataCompra = document.getElementById("dataCompra").value;
  const categoria = document.getElementById("categoriaDespesa").value;
  const formaPagamento = document.getElementById("formaPagamento").value;
  const tipoPagamento = document.getElementById("tipoPagamento").value;
  
  if (!descricao || isNaN(valor) || valor <= 0 || !dataCompra) {
    exibirToast("Preencha todos os campos obrigatórios.", "warning");
    return;
  }
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    exibirToast("Usuário não autenticado. Faça login novamente.", "danger");
    return;
  }
  
  // Buscar despesa original para preservar dados que não devem ser alterados
  db.ref("despesas").child(despesaId).once("value").then(snapshot => {
    const despesaOriginal = snapshot.val();
    
    if (!despesaOriginal) {
      exibirToast("Despesa não encontrada.", "danger");
      return;
    }
    
    // Verificar se a despesa pertence ao usuário atual
    if (despesaOriginal.userId !== currentUser.uid) {
      exibirToast("Você não tem permissão para editar esta despesa.", "danger");
      return;
    }
    
    // Preparar objeto de atualização
    const despesaAtualizada = {
      descricao: descricao,
      valor: valor,
      dataCompra: dataCompra,
      categoria: categoria,
      formaPagamento: formaPagamento,
      tipoPagamento: tipoPagamento,
      userId: currentUser.uid
    };
    
    // Manter status de pagamento existente
    despesaAtualizada.pago = despesaOriginal.pago || false;
    
    // Tratar campos específicos para cada tipo de pagamento
    if (formaPagamento === "cartao") {
      const cartao = document.getElementById("cartaoDespesa").value;
      const numParcelas = parseInt(document.getElementById("numeroParcelas").value);
      
      if (!cartao || isNaN(numParcelas) || numParcelas <= 0) {
        exibirToast("Preencha os dados do cartão e parcelas.", "warning");
        return;
      }
      
      despesaAtualizada.cartao = cartao;
      
      // Verificar se as parcelas foram alteradas
      if (!despesaOriginal.parcelas || despesaOriginal.parcelas.length !== numParcelas || despesaOriginal.cartao !== cartao) {
        // Buscar dados do cartão para recalcular parcelas
        db.ref("cartoes").child(cartao).once("value").then(cartaoSnapshot => {
          const dadosCartao = cartaoSnapshot.val();
          
          if (!dadosCartao) {
            exibirToast("Dados do cartão não encontrados.", "danger");
            return;
          }
          
          const diaFechamento = parseInt(dadosCartao.fechamento) || 1;
          const diaVencimento = parseInt(dadosCartao.vencimento) || 10;
          
          // Recalcular parcelas com nova lógica
          despesaAtualizada.parcelas = [];
          const valorParcela = valor / numParcelas;
          const dataCompraObj = new Date(dataCompra);
          
          // Determinar se a compra entra na fatura atual ou próxima
          let mesInicialParcela = dataCompraObj.getMonth();
          let anoInicialParcela = dataCompraObj.getFullYear();
          
          // Se a compra foi feita após o fechamento do mês, vai para o próximo mês
          if (dataCompraObj.getDate() > diaFechamento) {
            mesInicialParcela += 1;
            if (mesInicialParcela > 11) {
              mesInicialParcela = 0;
              anoInicialParcela += 1;
            }
          }
          
          for (let i = 0; i < numParcelas; i++) {
            const mesVencimento = mesInicialParcela + i;
            const anoVencimento = anoInicialParcela + Math.floor(mesVencimento / 12);
            const mesAjustado = mesVencimento % 12;
            
            // Criar data de vencimento no dia especificado do cartão
            const dataVencimento = new Date(anoVencimento, mesAjustado, diaVencimento);
            
            // Ajustar se o dia não existir no mês
            if (dataVencimento.getDate() !== diaVencimento) {
              dataVencimento.setDate(0);
            }
            
            despesaAtualizada.parcelas.push({
              valor: valorParcela,
              vencimento: dataVencimento.toISOString().split("T")[0],
              pago: false
            });
          }
          
          // Atualizar no Firebase
          db.ref("despesas").child(despesaId).update(despesaAtualizada)
            .then(() => {
              exibirToast("Despesa atualizada com sucesso!", "success");
              fecharModal("cadastroDespesaModal");
              atualizarDashboard();
              filtrarTodasDespesas();
            })
            .catch(error => {
              console.error("Erro ao atualizar despesa:", error);
              exibirToast("Erro ao atualizar despesa. Tente novamente.", "danger");
            });
        });
        
        // Retornar aqui para aguardar o callback do Firebase
        return;
      } else {
        // Manter parcelas existentes, atualizando valores se necessário
        despesaAtualizada.parcelas = despesaOriginal.parcelas.map(parcela => ({
          ...parcela,
          valor: valor / numParcelas
        }));
      }
    } else if (formaPagamento === "recorrente") {
      const diaRecorrencia = parseInt(document.getElementById("diaRecorrencia").value);
      const mesesRecorrencia = document.getElementById("mesesRecorrencia").value.trim() !== "" ? 
                               parseInt(document.getElementById("mesesRecorrencia").value) : 0;
      
      if (isNaN(diaRecorrencia) || diaRecorrencia < 1 || diaRecorrencia > 31) {
        exibirToast("Digite um dia válido (1-31) para a recorrência.", "warning");
        return;
      }
      
      despesaAtualizada.diaRecorrencia = diaRecorrencia;
      despesaAtualizada.mesesRecorrencia = mesesRecorrencia;
      despesaAtualizada.recorrenteInfinita = mesesRecorrencia === 0;
      
      // Verificar se as recorrências foram alteradas
      if (!despesaOriginal.recorrencias || despesaOriginal.diaRecorrencia !== diaRecorrencia) {
        // Recalcular recorrências se algo mudou
        despesaAtualizada.recorrencias = [];
        
        // Determinar o mês inicial baseado na data atual vs dia de recorrência
        const dataBase = new Date(dataCompra);
        const diaAtual = dataBase.getDate();
        let mesInicial = dataBase.getMonth();
        
        if (diaAtual > diaRecorrencia) {
          mesInicial += 1; // Começar do próximo mês se o dia já passou
        }
        
        const quantidadeMeses = mesesRecorrencia > 0 ? mesesRecorrencia : 6; // Se infinita, criar apenas 6 iniciais
        
        for (let i = 0; i < quantidadeMeses; i++) {
          const dataRecorrencia = new Date(dataBase);
          dataRecorrencia.setMonth(mesInicial + i);
          dataRecorrencia.setDate(Math.min(diaRecorrencia, new Date(dataRecorrencia.getFullYear(), dataRecorrencia.getMonth() + 1, 0).getDate()));
          
          despesaAtualizada.recorrencias.push({
            valor: valor,
            vencimento: dataRecorrencia.toISOString().split("T")[0],
            pago: false,
            mes: dataRecorrencia.getMonth(),
            ano: dataRecorrencia.getFullYear()
          });
        }
      } else {
        // Manter recorrências existentes
        despesaAtualizada.recorrencias = despesaOriginal.recorrencias;
      }
    }
    
    // Atualizar no Firebase
    db.ref("despesas").child(despesaId).update(despesaAtualizada)
      .then(() => {
        exibirToast("Despesa atualizada com sucesso!", "success");
        fecharModal("cadastroDespesaModal");
        atualizarDashboard();
        filtrarTodasDespesas();
      })
      .catch(error => {
        console.error("Erro ao atualizar despesa:", error);
        exibirToast("Erro ao atualizar despesa. Tente novamente.", "danger");
      });
  });
}

/**
 * Salva uma renda (alias para cadastrarPessoa)
 * Esta função serve como um alias para manter compatibilidade com o botão no modal
 */
function salvarRenda() {
  // Chama a função cadastrarPessoa que já implementa toda a lógica necessária
  cadastrarPessoa();
}

/**
 * Carrega as rendas para o modal de recebimento de pagamento
 */
function carregarRendasParaRecebimento() {
  const rendaSelect = document.getElementById("rendaSelect");
  if (!rendaSelect) return;
  
  rendaSelect.innerHTML = "<option value=''>Selecione a Renda</option>";
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    return;
  }
  
  // Buscar apenas as rendas do usuário atual
  db.ref("pessoas").orderByChild("userId").equalTo(currentUser.uid).once("value").then(snapshot => {
    snapshot.forEach(child => {
      const key = child.key;
      const pessoa = child.val();
      
      // Só adicionar rendas que tenham pagamentos configurados
      if (pessoa.pagamentos && pessoa.pagamentos.length > 0) {
        const option = document.createElement("option");
        option.value = key;
        option.text = pessoa.nome;
        rendaSelect.appendChild(option);
      }
    });
  }).catch(error => {
    console.error("Erro ao carregar rendas:", error);
    exibirToast("Erro ao carregar rendas. Tente novamente.", "danger");
  });
}

/**
 * Carrega os pagamentos de uma renda selecionada
 */
function carregarPagamentosRenda() {
  const rendaId = document.getElementById("rendaSelect").value;
  const pagamentoSelect = document.getElementById("pagamentoSelect");
  const valorRecebidoInput = document.getElementById("valorRecebido");
  
  if (!pagamentoSelect || !valorRecebidoInput) return;
  
  // Limpar select de pagamentos
  pagamentoSelect.innerHTML = "<option value=''>Selecione o Pagamento</option>";
  valorRecebidoInput.value = "";
  
  if (!rendaId) return;
  
  // Buscar dados da renda selecionada
  db.ref("pessoas").child(rendaId).once("value").then(snapshot => {
    const pessoa = snapshot.val();
    
    if (!pessoa || !pessoa.pagamentos) {
      exibirToast("Esta renda não possui pagamentos configurados.", "warning");
      return;
    }
    
    // Obter mês e ano atual
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const chaveMonthYear = `${anoAtual}-${mesAtual}`;
    
    // Verificar quais pagamentos já foram recebidos neste mês
    const pagamentosRecebidos = pessoa.pagamentosRecebidos?.[chaveMonthYear] || [];
    const diasRecebidos = new Set(pagamentosRecebidos.map(p => p.dia));
    
    // Adicionar pagamentos não recebidos ao select
    pessoa.pagamentos.forEach((pagamento, index) => {
      const dia = parseInt(pagamento.dia);
      
      // Só mostrar pagamentos que ainda não foram recebidos neste mês
      if (!diasRecebidos.has(dia)) {
        const option = document.createElement("option");
        option.value = index;
        option.text = `Dia ${dia} - R$ ${parseFloat(pagamento.valor).toFixed(2)}`;
        option.setAttribute('data-valor', pagamento.valor);
        option.setAttribute('data-dia', pagamento.dia);
        pagamentoSelect.appendChild(option);
      }
    });
    
    // Se não há pagamentos pendentes
    if (pagamentoSelect.children.length === 1) {
      exibirToast("Todos os pagamentos deste mês já foram recebidos.", "info");
    }
  }).catch(error => {
    console.error("Erro ao carregar pagamentos:", error);
    exibirToast("Erro ao carregar pagamentos. Tente novamente.", "danger");
  });
  
  // Atualizar valor quando selecionar um pagamento
  pagamentoSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption && selectedOption.getAttribute('data-valor')) {
      valorRecebidoInput.value = selectedOption.getAttribute('data-valor');
    }
  });
}

/**
 * Confirma o recebimento de um pagamento
 */
function confirmarRecebimentoPagamento() {
  const rendaId = document.getElementById("rendaSelect").value;
  const pagamentoIndex = document.getElementById("pagamentoSelect").value;
  const valorRecebido = parseFloat(document.getElementById("valorRecebido").value);
  const dataRecebimento = document.getElementById("dataRecebimento").value;
  
  // Validações
  if (!rendaId) {
    exibirToast("Selecione uma renda.", "warning");
    return;
  }
  
  if (!pagamentoIndex && pagamentoIndex !== "0") {
    exibirToast("Selecione um pagamento.", "warning");
    return;
  }
  
  if (isNaN(valorRecebido) || valorRecebido <= 0) {
    exibirToast("Digite um valor válido.", "warning");
    return;
  }
  
  if (!dataRecebimento) {
    exibirToast("Selecione a data de recebimento.", "warning");
    return;
  }
  
  // Verificar se o usuário está autenticado
  if (!currentUser || !currentUser.uid) {
    exibirToast("Usuário não autenticado. Faça login novamente.", "danger");
    return;
  }
  
  // Obter dados do pagamento
  db.ref("pessoas").child(rendaId).once("value").then(snapshot => {
    const pessoa = snapshot.val();
    
    // Verificar se a renda pertence ao usuário
    if (pessoa.userId !== currentUser.uid) {
      exibirToast("Você não tem permissão para modificar esta renda.", "danger");
      return;
    }
    
    const pagamento = pessoa.pagamentos[parseInt(pagamentoIndex)];
    if (!pagamento) {
      exibirToast("Pagamento não encontrado.", "danger");
      return;
    }
    
    // Criar estrutura do pagamento recebido
    const dataRec = new Date(dataRecebimento);
    const mesAno = dataRec.getMonth();
    const ano = dataRec.getFullYear();
    const chaveMonthYear = `${ano}-${mesAno}`;
    
    const pagamentoRecebido = {
      dia: parseInt(pagamento.dia),
      valor: valorRecebido,
      dataRecebimento: dataRecebimento,
      dataRegistro: new Date().toISOString()
    };
    
    // Atualizar no Firebase
    const pagamentosRecebidosRef = db.ref(`pessoas/${rendaId}/pagamentosRecebidos/${chaveMonthYear}`);
    
    // Buscar pagamentos já recebidos para este mês
    pagamentosRecebidosRef.once("value").then(recebidosSnapshot => {
      let pagamentosExistentes = [];
      
      if (recebidosSnapshot.exists()) {
        pagamentosExistentes = recebidosSnapshot.val();
      }
      
      // Adicionar o novo pagamento
      pagamentosExistentes.push(pagamentoRecebido);
      
      // Salvar de volta
      return pagamentosRecebidosRef.set(pagamentosExistentes);
    }).then(() => {
      exibirToast("Pagamento registrado com sucesso!", "success");
      fecharModal("receberPagamentoModal");
      atualizarDashboard(); // Atualizar o saldo
      
      // Limpar campos
      document.getElementById("rendaSelect").value = "";
      document.getElementById("pagamentoSelect").innerHTML = "<option value=''>Selecione o Pagamento</option>";
      document.getElementById("valorRecebido").value = "";
    }).catch(error => {
      console.error("Erro ao registrar pagamento:", error);
      exibirToast("Erro ao registrar pagamento: " + error.message, "danger");
    });
  }).catch(error => {
    console.error("Erro ao buscar dados da renda:", error);
    exibirToast("Erro ao buscar dados da renda. Tente novamente.", "danger");
  });
}

/**
 * Prepara o formulário para editar uma categoria
 * @param {string} categoriaId - ID da categoria a ser editada
 * @param {string} categoriaNome - Nome atual da categoria
 */
function prepararEditarCategoria(categoriaId, categoriaNome) {
  // Ocultar formulário de adição
  document.getElementById('formAdicionarCategoria').style.display = 'none';
  
  // Mostrar formulário de edição
  document.getElementById('formEditarCategoria').style.display = 'block';
  
  // Preencher campos
  document.getElementById('editarCategoriaId').value = categoriaId;
  document.getElementById('editarCategoriaNome').value = categoriaNome;
  
  // Focar no campo de nome
  document.getElementById('editarCategoriaNome').focus();
}

/**
 * Salva a edição de uma categoria
 */
function salvarEdicaoCategoria() {
  const categoriaId = document.getElementById('editarCategoriaId').value;
  const categoriaNome = document.getElementById('editarCategoriaNome').value;
  
  if (!categoriaNome) {
    exibirToast("Digite o nome da categoria.", "warning");
    return;
  }
  
  db.ref(`categorias/${categoriaId}`).update({
    nome: categoriaNome
  }).then(() => {
    exibirToast("Categoria atualizada com sucesso!", "success");
    cancelarEdicaoCategoria();
    loadCategorias();
    loadCategoriasFiltro();
  }).catch(err => {
    console.error("Erro ao atualizar categoria:", err);
    exibirToast("Erro ao atualizar categoria: " + err.message, "danger");
  });
}

/**
 * Cancela a edição de uma categoria
 */
function cancelarEdicaoCategoria() {
  // Limpar campos
  document.getElementById('editarCategoriaId').value = '';
  document.getElementById('editarCategoriaNome').value = '';
  
  // Ocultar formulário de edição
  document.getElementById('formEditarCategoria').style.display = 'none';
  
  // Mostrar formulário de adição
  document.getElementById('formAdicionarCategoria').style.display = 'block';
}

/**
 * Exclui uma categoria
 * @param {string} categoriaId - ID da categoria a ser excluída
 */
function excluirCategoria(categoriaId) {
  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    db.ref("categorias").child(categoriaId).remove()
      .then(() => {
        exibirToast("Categoria excluída com sucesso!", "success");
        loadCategorias();
        loadCategoriasFiltro();
      })
      .catch(err => {
        console.error("Erro ao excluir categoria:", err);
        exibirToast("Erro ao excluir categoria: " + err.message, "danger");
      });
  }
}

/**
 * Renderiza o calendário de despesas
 */
function renderCalendar() {
  const calendarContainer = document.getElementById('calendarContainer');
  if (!calendarContainer) return;
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Atualizar título do calendário
  const calendarTitle = document.getElementById('calendarMonthYear');
  if (calendarTitle) {
    calendarTitle.textContent = `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
  }
  
  // Criar grid do calendário
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
  const lastDay = new Date(currentCalendarYear, currentCalendarMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  let calendarHTML = '<div class="calendar-grid">';
  
  // Headers dos dias da semana
  dayNames.forEach(day => {
    calendarHTML += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Dias do calendário
  const currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    const isCurrentMonth = currentDate.getMonth() === currentCalendarMonth;
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    calendarHTML += `
      <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''}" 
           data-date="${currentDate.toISOString().split('T')[0]}">
        <span class="day-number">${currentDate.getDate()}</span>
      </div>
    `;
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  calendarHTML += '</div>';
  calendarContainer.innerHTML = calendarHTML;
}

/**
 * Navega para o mês anterior no calendário
 */
function prevMonth() {
  currentCalendarMonth--;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  }
  renderCalendar();
}

/**
 * Navega para o próximo mês no calendário
 */
function nextMonth() {
  currentCalendarMonth++;
  if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderCalendar();
}
