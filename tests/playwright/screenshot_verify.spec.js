const { test, expect } = require('@playwright/test');

test('Verifica layout e print', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:3000/index.html');

    // Inject Mock Data to render the table directly in the page context
    await page.evaluate(() => {
        const tbody = document.getElementById("todasDespesasBody");
        if(tbody) {
            tbody.innerHTML = `
              <tr>
                <td data-label="Descrição">Aluguel - Recorrente</td>
                <td data-label="Valor">R$ 900.00/mês</td>
                <td data-label="Data">
                  <span class="desktop-date">05/04/2026</span>
                  <span class="mobile-date" style="display:none;">05/04/2026 <span class="categoria-info">• Moradia</span> <span class="status-info">• <span class="badge bg-warning">Pendente</span></span></span>
                </td>
                <td data-label="Categoria">Moradia</td>
                <td data-label="Status"><span class="badge bg-warning">Pendente</span></td>
                <td data-label="Ações" class="desktop-actions">
                  <button class="btn-action btn-pay" onclick="console.log('pay')" title="Pagar">
                    <i class="fas fa-check-square"></i>
                  </button>
                  <button class="btn-action btn-edit" onclick="console.log('edit')" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" onclick="console.log('delete')" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `;
        }

        // Hide dashboard
        const dashboard = document.getElementById('dashboardSection');
        if(dashboard) dashboard.style.display = 'none';

        // Show Todas as Despesas Section
        const todasDespesas = document.getElementById('todasDespesasSection');
        if (todasDespesas) todasDespesas.style.display = 'block';
    });

    // Wait for the render
    await page.waitForTimeout(500);

    // Take screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'tests/playwright/screenshot_final.png' });
});
