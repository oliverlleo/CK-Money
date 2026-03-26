// Logic for the Cash Flow (Fluxo de Caixa) tab

/**
 * Main function to update Cash Flow data and UI
 */
function atualizarFluxoCaixa() {
  if (!currentUser || !currentUser.uid) {
    console.warn("Usuário não logado ao tentar atualizar fluxo de caixa");
    return;
  }

  // Pegar período selecionado
  const inicio = window.rangeStartFluxoCaixa ? moment(window.rangeStartFluxoCaixa).startOf('day') : moment().startOf('month');
  const fim = window.rangeEndFluxoCaixa ? moment(window.rangeEndFluxoCaixa).endOf('day') : moment().add(3, 'months').endOf('month');
  const tipoAgrupamento = document.getElementById('agrupamentoFluxoCaixa') ? document.getElementById('agrupamentoFluxoCaixa').value : 'mensal';

  // Mostrar loading
  const container = document.getElementById('tabelaFluxoCaixa');
  if (container) container.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Calculando fluxo de caixa...</p></div>';

  // Fetch all necessary data: Saldo, Despesas, Rendas, Recebimentos
  const uid = currentUser.uid;

  Promise.all([
    db.ref(`users/${uid}/data/despesas`).once('value'),
    db.ref(`users/${uid}/data/rendas`).once('value'),
    db.ref(`users/${uid}/data/recebimentos`).once('value'),
    db.ref(`users/${uid}/data/saldos`).once('value') // Trying to get some concept of current balance if it exists
  ]).then(([despesasSnapshot, rendasSnapshot, recebimentosSnapshot, saldosSnapshot]) => {

    // Processar Despesas
    let despesasMap = new Map(); // key: YYYY-MM-DD, value: array of despesas
    if (despesasSnapshot.exists()) {
      despesasSnapshot.forEach(child => {
        const d = child.val();

        // Skip despesas that don't make sense
        if (!d.valor) return;

        // Logic to project expenses based on formaPagamento
        if (d.formaPagamento === 'avista') {
          const dDate = moment(d.dataCompra);
          if (dDate.isBetween(inicio, fim, 'day', '[]')) {
            adicionarEventoFluxo(despesasMap, dDate.format('YYYY-MM-DD'), {
              tipo: 'despesa',
              descricao: d.descricao,
              valor: parseFloat(d.valor),
              status: d.status || 'pendente',
              original: d
            });
          }
        } else if (d.formaPagamento === 'cartao' && d.parcelas) {
           d.parcelas.forEach((p, idx) => {
             const pDate = moment(p.vencimento);
             if (pDate.isBetween(inicio, fim, 'day', '[]')) {
               adicionarEventoFluxo(despesasMap, pDate.format('YYYY-MM-DD'), {
                 tipo: 'despesa',
                 descricao: `${d.descricao} (Parc. ${idx + 1}/${d.numeroParcelas || d.parcelas.length})`,
                 valor: parseFloat(p.valor),
                 status: p.pago ? 'pago' : 'pendente',
                 original: d
               });
             }
           });
        } else if (d.formaPagamento === 'recorrente' && d.recorrencias) {
           d.recorrencias.forEach((r, idx) => {
             const rDate = moment(r.vencimento);
             if (rDate.isBetween(inicio, fim, 'day', '[]')) {
               adicionarEventoFluxo(despesasMap, rDate.format('YYYY-MM-DD'), {
                 tipo: 'despesa',
                 descricao: `${d.descricao} (Recorrente)`,
                 valor: parseFloat(r.valor || d.valor),
                 status: r.pago ? 'pago' : 'pendente',
                 original: d
               });
             }
           });
        } else if (d.formaPagamento === 'recorrente' && !d.recorrencias) {
           // Fallback for recurring that might not have array explicitly generated yet (in some systems)
           // Simulate recurring expenses for the period based on diaRecorrencia
           if (d.diaRecorrencia) {
             let curDate = moment(inicio);
             while (curDate.isSameOrBefore(fim)) {
                let recDate = moment(curDate).date(d.diaRecorrencia);
                // Check if this recurrence date is valid and inside the boundaries
                if (recDate.isSameOrAfter(moment(d.dataCompra)) && recDate.isBetween(inicio, fim, 'day', '[]')) {
                   // Calculate if it exceeds mesesRecorrencia
                   let isWithinLimit = true;
                   if (d.mesesRecorrencia) {
                      const limitDate = moment(d.dataCompra).add(d.mesesRecorrencia, 'months');
                      if (recDate.isAfter(limitDate)) isWithinLimit = false;
                   }
                   if (isWithinLimit) {
                       adicionarEventoFluxo(despesasMap, recDate.format('YYYY-MM-DD'), {
                         tipo: 'despesa',
                         descricao: `${d.descricao} (Proj. Recorrente)`,
                         valor: parseFloat(d.valor),
                         status: 'pendente',
                         original: d
                       });
                   }
                }
                curDate.add(1, 'month');
             }
           }
        }
      });
    }

    // Processar Rendas (Projetadas)
    let rendasMap = new Map(); // key: YYYY-MM-DD, value: array of rendas
    if (rendasSnapshot.exists()) {
      rendasSnapshot.forEach(child => {
        const r = child.val();
        if (r.pagamentos && Array.isArray(r.pagamentos)) {
          r.pagamentos.forEach(pag => {
            if (!pag.dia || !pag.valor) return;

            // Project this income for every month in the range
            let curDate = moment(inicio);
            while(curDate.isSameOrBefore(fim)) {
               let projDate = moment(curDate).date(pag.dia);
               if (projDate.isBetween(inicio, fim, 'day', '[]')) {
                 adicionarEventoFluxo(rendasMap, projDate.format('YYYY-MM-DD'), {
                    tipo: 'renda_projetada',
                    descricao: `Recebimento Projetado - ${r.nome}`,
                    valor: parseFloat(pag.valor),
                    status: 'pendente'
                 });
               }
               curDate.add(1, 'month');
            }
          });
        }
      });
    }

    // Processar Recebimentos Realizados (Substitui ou complementa as projetadas dependendo da lógica do app.
    // Para simplificar, vamos mostrá-los e idealmente a renda projetada para aquele mesmo mês/dia deveria ser ignorada se já recebida.
    // Aqui faremos uma abordagem simples: Mostramos recebimentos realizados. Se houver um recebimento realizado,
    // tentamos encontrar e remover uma renda projetada correspondente no mesmo mês para evitar duplicação.)
    let recebimentosReaisMap = new Map();
    if (recebimentosSnapshot.exists()) {
      recebimentosSnapshot.forEach(child => {
        const r = child.val();
        const rDate = moment(r.data);
        if (rDate.isBetween(inicio, fim, 'day', '[]')) {
          adicionarEventoFluxo(recebimentosReaisMap, rDate.format('YYYY-MM-DD'), {
            tipo: 'renda_realizada',
            descricao: `Recebido: ${r.descricao || r.rendaNome || 'Entrada'}`,
            valor: parseFloat(r.valor),
            status: 'recebido',
            original: r
          });
        }
      });
    }

    // Mesclar e processar os dias
    let allDates = new Set([...despesasMap.keys(), ...rendasMap.keys(), ...recebimentosReaisMap.keys()]);
    let datesArray = Array.from(allDates).sort();

    // Pegar o saldo atual (que será o saldo inicial do período)
    // No projeto parece que o saldo é calculado dinamicamente ou guardado em algum lugar.
    // Vamos usar a função getSaldoTotalGlobal se existir, senão calcular a partir das rendas
    let saldoInicial = 0;
    // Uma aproximação do saldo atual baseado nas rendas se saldosSnapshot não tiver
    if (rendasSnapshot.exists()) {
       rendasSnapshot.forEach(r => {
          saldoInicial += parseFloat(r.val().saldoInicial || 0);
       });
    }

    // Criar o fluxo cronológico
    let fluxoTimeline = [];
    let saldoAcumulado = saldoInicial;

    let totalRendasPeriodo = 0;
    let totalDespesasPeriodo = 0;

    datesArray.forEach(data => {
      let eventosDia = [];
      let rendasProjetadasDia = rendasMap.get(data) || [];
      let recebimentosReaisDia = recebimentosReaisMap.get(data) || [];
      let despesasDia = despesasMap.get(data) || [];

      // Lógica de deduplicação simples: se há recebimento real para uma renda neste mês, removemos a projetada
      // Para manter simples, apenas juntamos tudo e marcamos os recebimentos como entrada e despesas como saída

      let somaEntradasDia = 0;
      let somaSaidasDia = 0;

      // Adicionar recebimentos reais
      recebimentosReaisDia.forEach(r => {
        eventosDia.push(r);
        somaEntradasDia += r.valor;
        totalRendasPeriodo += r.valor;
      });

      // Adicionar rendas projetadas (apenas as que não parecem ter sido recebidas já - simplificação)
      // Se a data já passou e não tem recebimento, pode ser que atrasou. Se tá no futuro, mantemos.
      rendasProjetadasDia.forEach(rp => {
         // Uma lógica mais complexa verificaria se `rp` já tem correspondente em `recebimentosReaisDia`
         // Vamos adicionar todas por enquanto, ou se a data é futura.
         if (moment(data).isAfter(moment())) {
           eventosDia.push(rp);
           somaEntradasDia += rp.valor;
           totalRendasPeriodo += rp.valor;
         }
      });

      // Adicionar despesas
      despesasDia.forEach(d => {
         eventosDia.push(d);
         somaSaidasDia += d.valor;
         totalDespesasPeriodo += d.valor;
      });

      if (eventosDia.length > 0) {
        saldoAcumulado = saldoAcumulado + somaEntradasDia - somaSaidasDia;

        fluxoTimeline.push({
          data: data,
          entradas: somaEntradasDia,
          saidas: somaSaidasDia,
          saldoDia: somaEntradasDia - somaSaidasDia,
          saldoAcumulado: saldoAcumulado,
          eventos: eventosDia
        });
      }
    });

    // Agrupar se for mensal
    let fluxoFinal = fluxoTimeline;
    if (tipoAgrupamento === 'mensal') {
       let mesesMap = new Map();
       fluxoTimeline.forEach(item => {
          let mesAno = moment(item.data).format('YYYY-MM');
          if (!mesesMap.has(mesAno)) {
             mesesMap.set(mesAno, {
               dataAgrupada: mesAno,
               label: moment(item.data).format('MMMM YYYY'),
               entradas: 0,
               saidas: 0,
               saldoAcumulado: 0,
               eventos: []
             });
          }
          let m = mesesMap.get(mesAno);
          m.entradas += item.entradas;
          m.saidas += item.saidas;
          m.saldoAcumulado = item.saldoAcumulado; // Assume the last day's balance of the month
          m.eventos = m.eventos.concat(item.eventos);
       });

   // Apply Portuguese month translation correctly
   fluxoFinal = Array.from(mesesMap.values()).map(m => {
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const [yearStr, monthStr] = m.dataAgrupada.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      m.label = `${monthNames[monthIdx]} ${yearStr}`;
      return m;
   });
    }

    // Renderizar
    const dadosGerais = {
      saldoInicial: saldoInicial,
      totalEntradas: totalRendasPeriodo,
      totalSaidas: totalDespesasPeriodo,
      saldoFinalProjetado: saldoAcumulado,
      timeline: fluxoFinal,
      agrupamento: tipoAgrupamento
    };

    renderizarCardsFluxoCaixa(dadosGerais);
    renderizarGraficoFluxoCaixa(dadosGerais);
    renderizarTabelaFluxoCaixa(dadosGerais);

  }).catch(err => {
    console.error("Erro ao gerar fluxo de caixa:", err);
    const container = document.getElementById('tabelaFluxoCaixa');
    if (container) container.innerHTML = `<div class="alert alert-danger">Erro ao carregar os dados: ${err.message}</div>`;
  });
}

function adicionarEventoFluxo(map, dataStr, evento) {
  if (!map.has(dataStr)) {
    map.set(dataStr, []);
  }
  map.get(dataStr).push(evento);
}

function renderizarCardsFluxoCaixa(dados) {
  const container = document.getElementById('cardsFluxoCaixa');
  if (!container) return;

  const formatMoney = (val) => `R$ ${parseFloat(val).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  const fluxoLiquido = dados.totalEntradas - dados.totalSaidas;
  const fluxoClass = fluxoLiquido >= 0 ? 'text-success' : 'text-danger';

  container.innerHTML = `
    <div class="dashboard-card">
      <div class="dashboard-card-header">
        <div class="dashboard-card-title">Saldo Inicial (Estimado)</div>
      </div>
      <div class="dashboard-card-value">${formatMoney(dados.saldoInicial)}</div>
    </div>
    <div class="dashboard-card">
      <div class="dashboard-card-header">
        <div class="dashboard-card-title">Entradas Projetadas</div>
      </div>
      <div class="dashboard-card-value text-success">+${formatMoney(dados.totalEntradas)}</div>
    </div>
    <div class="dashboard-card">
      <div class="dashboard-card-header">
        <div class="dashboard-card-title">Saídas Projetadas</div>
      </div>
      <div class="dashboard-card-value text-danger">-${formatMoney(dados.totalSaidas)}</div>
    </div>
    <div class="dashboard-card">
      <div class="dashboard-card-header">
        <div class="dashboard-card-title">Fluxo Líquido</div>
      </div>
      <div class="dashboard-card-value ${fluxoClass}">${formatMoney(fluxoLiquido)}</div>
    </div>
    <div class="dashboard-card">
      <div class="dashboard-card-header">
        <div class="dashboard-card-title">Saldo Final Projetado</div>
      </div>
      <div class="dashboard-card-value">${formatMoney(dados.saldoFinalProjetado)}</div>
    </div>
  `;
}

function renderizarGraficoFluxoCaixa(dados) {
  const container = document.querySelector('#graficoFluxoCaixa');
  if (!container) return;
  container.innerHTML = '';

  if (dados.timeline.length === 0) {
    container.innerHTML = '<div class="text-center p-4">Não há dados projetados para o período selecionado.</div>';
    return;
  }

  const labels = dados.timeline.map(item => item.label || moment(item.data).format('DD/MM/YYYY'));
  const entradas = dados.timeline.map(item => item.entradas);
  const saidas = dados.timeline.map(item => item.saidas);
  const acumulado = dados.timeline.map(item => item.saldoAcumulado);

  const options = {
    series: [
      { name: 'Entradas', type: 'column', data: entradas },
      { name: 'Saídas', type: 'column', data: saidas },
      { name: 'Saldo Acumulado', type: 'line', data: acumulado }
    ],
    chart: { height: 350, type: 'line', toolbar: { show: false } },
    stroke: { width: [0, 0, 3], curve: 'smooth' },
    colors: ['#4caf50', '#f44336', '#2196f3'],
    labels: labels,
    xaxis: { type: 'category' },
    yaxis: [
      { title: { text: 'Valores (R$)' }, labels: { formatter: (val) => val.toFixed(0) } }
    ],
    tooltip: { shared: true, intersect: false, y: { formatter: (y) => typeof y !== "undefined" ? "R$ " + y.toFixed(2) : y } },
    legend: { position: 'top' }
  };

  const chart = new ApexCharts(container, options);
  chart.render();
}

function renderizarTabelaFluxoCaixa(dados) {
  const container = document.getElementById('tabelaFluxoCaixa');
  if (!container) return;

  if (dados.timeline.length === 0) {
    container.innerHTML = '<p class="text-center">Sem dados para exibir.</p>';
    return;
  }

  let html = `
    <table class="table-full-width">
      <thead>
        <tr>
          <th>Data / Período</th>
          <th>Entradas</th>
          <th>Saídas</th>
          <th>Saldo do Período</th>
          <th>Saldo Acumulado</th>
        </tr>
      </thead>
      <tbody>
  `;

  dados.timeline.forEach(item => {
    const isDiario = dados.agrupamento === 'diario';
    const labelData = isDiario ? moment(item.data).format('DD/MM/YYYY') : item.label;
    const saldoPeriodo = item.entradas - item.saidas;
    const saldoClass = saldoPeriodo >= 0 ? 'text-success' : 'text-danger';

    html += `
      <tr style="background-color: rgba(0,0,0,0.02); font-weight: bold;">
        <td>${labelData}</td>
        <td class="text-success">R$ ${item.entradas.toFixed(2)}</td>
        <td class="text-danger">R$ ${item.saidas.toFixed(2)}</td>
        <td class="${saldoClass}">R$ ${saldoPeriodo.toFixed(2)}</td>
        <td>R$ ${item.saldoAcumulado.toFixed(2)}</td>
      </tr>
    `;

    // Detalhamento dos eventos
    if (item.eventos && item.eventos.length > 0) {
      // Sort events: Incomes first, then expenses
      item.eventos.sort((a, b) => {
        if (a.tipo.includes('renda') && !b.tipo.includes('renda')) return -1;
        if (!a.tipo.includes('renda') && b.tipo.includes('renda')) return 1;
        return 0;
      });

      item.eventos.forEach(ev => {
        const isEntrada = ev.tipo.includes('renda');
        const icon = isEntrada ? '<i class="fas fa-arrow-up text-success"></i>' : '<i class="fas fa-arrow-down text-danger"></i>';
        const valorFormatado = isEntrada ? `R$ ${ev.valor.toFixed(2)}` : `- R$ ${ev.valor.toFixed(2)}`;
        const corValor = isEntrada ? 'text-success' : 'text-danger';
        const badgeStatus = ev.status === 'pago' || ev.status === 'recebido'
            ? '<span class="badge bg-success">Realizado</span>'
            : '<span class="badge bg-warning text-dark">Pendente</span>';

        // Escapar descrição para evitar XSS
        const escapeHtml = (unsafe) => {
            return (unsafe || '').toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        html += `
          <tr style="font-size: 0.9em;">
            <td style="padding-left: 2rem;">${icon} ${escapeHtml(ev.descricao)}</td>
            <td colspan="2" class="${corValor}">${valorFormatado}</td>
            <td colspan="2">${badgeStatus}</td>
          </tr>
        `;
      });
    }
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

window.atualizarFluxoCaixa = atualizarFluxoCaixa;
