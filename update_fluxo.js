const fs = require('fs');

const code = `
function atualizarFluxoCaixa() {
  const dateRangeStr = document.getElementById('fluxoDataRange').value;
  const tipoAgrupamento = document.getElementById('agrupamentoTempo').value;

  if (!dateRangeStr) return;

  const [startStr, endStr] = dateRangeStr.split(' - ');
  const inicio = moment(startStr, 'DD/MM/YYYY');
  const fim = moment(endStr, 'DD/MM/YYYY');

  if (!inicio.isValid() || !fim.isValid()) {
    console.error("Datas inválidas");
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
                    descricao: \`Recebimento: \${r.nome}\`,
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
                    descricao: \`Projetado: \${r.nome}\`,
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
                 descricao: \`\${d.descricao} (Parc. \${idx + 1}/\${d.numeroParcelas || d.parcelas.length})\`,
                 valor: parseFloat(p.valor),
                 status: p.pago ? 'pago' : 'pendente'
               });
             }
           });
        } else if (d.formaPagamento === 'recorrente' && d.recorrencias) {
           d.recorrencias.forEach((r, idx) => {
             if (r.data) {
               eventos.push({
                 data: moment(r.data).format('YYYY-MM-DD'),
                 tipo: 'despesa',
                 descricao: \`\${d.descricao} (Recorrente)\`,
                 valor: parseFloat(r.valor),
                 status: r.pago ? 'pago' : 'pendente'
               });
             }
           });

           // Projetar recorrentes para o futuro
           let lastRecorrencia = d.recorrencias[d.recorrencias.length - 1];
           if (lastRecorrencia && lastRecorrencia.data) {
             let curDate = moment(lastRecorrencia.data).add(1, 'month');
             while(curDate.isSameOrBefore(fim)) {
               if (curDate.isSameOrAfter(inicio)) {
                 eventos.push({
                   data: curDate.format('YYYY-MM-DD'),
                   tipo: 'despesa_projetada',
                   descricao: \`\${d.descricao} (Projetado)\`,
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

      if (eventosDia.length > 0 || agrupamentoTempo === 'mensal') {
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
          m.label = \`\${monthNames[monthIdx]} \${yearStr}\`;
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
    if (container) container.innerHTML = \`<div class="alert alert-danger">Erro ao carregar os dados: \${err.message}</div>\`;
  });
}
`;

let content = fs.readFileSync('js/fluxo_caixa.js', 'utf8');
content = content.replace(/function atualizarFluxoCaixa\(\) \{[\s\S]*?function renderizarCardsFluxoCaixa/g, code + '\nfunction renderizarCardsFluxoCaixa');
fs.writeFileSync('js/fluxo_caixa.js', content);
console.log('Updated fluxo_caixa.js successfully');
