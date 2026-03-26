// Logic for the Cash Flow (Fluxo de Caixa) tab

/**
 * Main function to update Cash Flow data and UI
 */

function atualizarFluxoCaixa() {
  const dateRangeStr = document.getElementById('dataRangeFluxoCaixa').value;
  const tipoAgrupamento = document.getElementById('agrupamentoFluxoCaixa').value;

  // Use the global window variables set by script.js daterangepicker config
  let inicio, fim;

  if (window.rangeStartFluxoCaixa && window.rangeEndFluxoCaixa) {
    inicio = moment(window.rangeStartFluxoCaixa, 'YYYY-MM-DD');
    fim = moment(window.rangeEndFluxoCaixa, 'YYYY-MM-DD');
  } else if (dateRangeStr === 'Todo Período' || !dateRangeStr) {
    // If not set or "Todo Período", default to a large range starting today
    inicio = moment();
    fim = moment().add(5, 'years');
  } else {
    // Attempt fallback parse of the input string if it has the "DD/MM/YYYY - DD/MM/YYYY" format
    if (dateRangeStr.includes(' - ')) {
      const [startStr, endStr] = dateRangeStr.split(' - ');
      inicio = moment(startStr, 'DD/MM/YYYY');
      fim = moment(endStr, 'DD/MM/YYYY');
    } else {
      // Fallback for named presets like "Próximos 3 Meses" if window vars failed to set
      inicio = moment();
      fim = moment().add(3, 'months');
    }
  }

  if (!inicio.isValid() || !fim.isValid()) {
    console.error("Datas inválidas:", dateRangeStr);
    return;
  }


  // Fetch all necessary data
  const uid = currentUser.uid;

  Promise.all([
    db.ref('despesas').orderByChild('userId').equalTo(uid).once('value'),
    db.ref('pessoas').orderByChild('userId').equalTo(uid).once('value'),
    db.ref('nova_entradas').orderByChild('userId').equalTo(uid).once('value')
  ]).then(([despesasSnapshot, rendasSnapshot, entradasSnapshot]) => {

    let eventos = [];
    let saldoInicialBase = 0;

    // 1. Processar Rendas (Pessoas) e Recebimentos
    if (rendasSnapshot.exists()) {
      rendasSnapshot.forEach(child => {
        const r = child.val();
        saldoInicialBase += parseFloat(r.saldoInicial || 0);

        // Recebimentos reais
        if (r.pagamentosRecebidos) {
          Object.keys(r.pagamentosRecebidos).forEach(monthKey => {
            const recebimentos = r.pagamentosRecebidos[monthKey];
            if (Array.isArray(recebimentos)) {
              recebimentos.forEach(rec => {
                if (rec.dataRecebimento && rec.valor) {
                  eventos.push({
                    data: moment(rec.dataRecebimento).format('YYYY-MM-DD'),
                    tipo: 'renda_real',
                    descricao: `Recebimento: ${r.nome}`,
                    valor: parseFloat(rec.valor),
                    status: 'recebido'
                  });
                }
              });
            }
          });
        }

        // Rendas Projetadas (apenas para o futuro)
        if (r.pagamentos && Array.isArray(r.pagamentos)) {
          r.pagamentos.forEach((pag) => {
            if (!pag.dia || !pag.valor) return;
            // Projetar de hoje até o fim do período (ou do inicio se for no futuro)
            let curDate = moment.max(moment(), inicio).clone();
            while(curDate.isSameOrBefore(fim)) {
               let projDate = moment(curDate).date(pag.dia);
               if (projDate.isSameOrBefore(fim) && projDate.isSameOrAfter(inicio) && projDate.isAfter(moment())) {
                 eventos.push({
                    data: projDate.format('YYYY-MM-DD'),
                    tipo: 'renda_projetada',
                    descricao: `Projetado: ${r.nome}`,
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

    // 2. Processar Entradas Extras
    if (entradasSnapshot.exists()) {
      entradasSnapshot.forEach(child => {
        const e = child.val();
        if (e.valor && e.dataEntrada) {
          eventos.push({
            data: moment(e.dataEntrada).format('YYYY-MM-DD'),
            tipo: 'renda_extra',
            descricao: e.descricao || 'Entrada Extra',
            valor: parseFloat(e.valor),
            status: 'recebido'
          });
        }
      });
    }

    // 3. Processar Despesas
    if (despesasSnapshot.exists()) {
      despesasSnapshot.forEach(child => {
        const d = child.val();
        if (!d.valor) return;

        if (d.formaPagamento === 'avista' && d.dataCompra) {
          eventos.push({
            data: moment(d.dataCompra).format('YYYY-MM-DD'),
            tipo: 'despesa',
            descricao: d.descricao,
            valor: parseFloat(d.valor),
            status: d.pago ? 'pago' : 'pendente'
          });
        } else if (d.formaPagamento === 'cartao' && d.parcelas) {
           d.parcelas.forEach((p, idx) => {
             if (p.vencimento) {
               eventos.push({
                 data: moment(p.vencimento).format('YYYY-MM-DD'),
                 tipo: 'despesa',
                 descricao: `${d.descricao} (Parc. ${idx + 1}/${d.numeroParcelas || d.parcelas.length})`,
                 valor: parseFloat(p.valor),
                 status: p.pago ? 'pago' : 'pendente'
               });
             }
           });
        } else if (d.formaPagamento === 'recorrente' && d.recorrencias) {
           d.recorrencias.forEach((r, idx) => {
             if (r.vencimento) {
               eventos.push({
                 data: moment(r.vencimento).format('YYYY-MM-DD'),
                 tipo: 'despesa',
                 descricao: `${d.descricao} (Recorrente)`,
                 valor: parseFloat(r.valor) || parseFloat(d.valor) || 0,
                 status: r.pago ? 'pago' : 'pendente'
               });
             }
           });

           // Projetar recorrentes para o futuro
           let lastRecorrencia = d.recorrencias[d.recorrencias.length - 1];
           if (lastRecorrencia && lastRecorrencia.vencimento) {
             let curDate = moment(lastRecorrencia.vencimento).add(1, 'month');
             while(curDate.isSameOrBefore(fim)) {
               if (curDate.isSameOrAfter(inicio)) {
                 eventos.push({
                   data: curDate.format('YYYY-MM-DD'),
                   tipo: 'despesa_projetada',
                   descricao: `${d.descricao} (Projetado)`,
                   valor: parseFloat(d.valor),
                   status: 'pendente'
                 });
               }
               curDate.add(1, 'month');
             }
           }
        }
      });
    }

    // 4. Separar Eventos e Calcular Saldo Inicial do Período
    let saldoAcumulado = saldoInicialBase;
    let eventosPeriodo = [];

    let totalEntradasPeriodo = 0;
    let totalSaidasPeriodo = 0;

    eventos.forEach(ev => {
      const evDate = moment(ev.data);
      const isEntrada = ev.tipo.includes('renda');

      if (evDate.isBefore(inicio, 'day')) {
        // Passado: afeta o saldo inicial do período
        if (isEntrada) {
          saldoAcumulado += ev.valor;
        } else {
          saldoAcumulado -= ev.valor;
        }
      } else if (evDate.isBetween(inicio, fim, 'day', '[]')) {
        // Dentro do período
        eventosPeriodo.push(ev);
        if (isEntrada) {
          totalEntradasPeriodo += ev.valor;
        } else {
          totalSaidasPeriodo += ev.valor;
        }
      }
    });

    const saldoInicialPeriodo = saldoAcumulado;

    // 5. Ordenar Eventos do Período por Data
    eventosPeriodo.sort((a, b) => moment(a.data).diff(moment(b.data)));

    // 6. Agrupar por Dia
    let fluxoTimeline = [];
    let eventosPorDia = new Map();

    eventosPeriodo.forEach(ev => {
      if (!eventosPorDia.has(ev.data)) {
        eventosPorDia.set(ev.data, []);
      }
      eventosPorDia.get(ev.data).push(ev);
    });

    // Construir Timeline
    let curDateObj = inicio.clone();
    while (curDateObj.isSameOrBefore(fim)) {
      const dataStr = curDateObj.format('YYYY-MM-DD');
      const eventosDia = eventosPorDia.get(dataStr) || [];

      let entradasDia = 0;
      let saidasDia = 0;

      eventosDia.forEach(ev => {
        if (ev.tipo.includes('renda')) entradasDia += ev.valor;
        else saidasDia += ev.valor;
      });

      if (eventosDia.length > 0 || tipoAgrupamento === 'mensal') {
        saldoAcumulado += (entradasDia - saidasDia);
        fluxoTimeline.push({
          data: dataStr,
          entradas: entradasDia,
          saidas: saidasDia,
          saldoDia: entradasDia - saidasDia,
          saldoAcumulado: saldoAcumulado,
          eventos: eventosDia
        });
      }
      curDateObj.add(1, 'day');
    }

    // 7. Agrupamento
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
          m.saldoAcumulado = item.saldoAcumulado; // Pega o último saldo do mês
          m.eventos = m.eventos.concat(item.eventos);
       });

       const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
       fluxoFinal = Array.from(mesesMap.values()).map(m => {
          const [yearStr, monthStr] = m.dataAgrupada.split('-');
          const monthIdx = parseInt(monthStr, 10) - 1;
          m.label = `${monthNames[monthIdx]} ${yearStr}`;
          return m;
       });
    }

    // Renderizar
    const dadosGerais = {
      saldoInicial: saldoInicialPeriodo,
      totalEntradas: totalEntradasPeriodo,
      totalSaidas: totalSaidasPeriodo,
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
