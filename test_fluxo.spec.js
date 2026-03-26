const { test, expect } = require('@playwright/test');

test('Fluxo de Caixa Tab Load Data', async ({ page }) => {
  // Add init script BEFORE any navigation happens
  await page.addInitScript(() => {
    // Force user to be authenticated locally to bypass the redirect in index.html
    localStorage.setItem('authBypass', 'true');

    // We overwrite window.location.replace temporarily to intercept the initial login redirect
    const originalReplace = window.location.replace;
    window.location.replace = function(url) {
      if (url === '/login' || url === 'login.html') {
         console.log('Intercepted login redirect');
         return;
      }
      return originalReplace.apply(this, arguments);
    };

    // 1. Setup mock data
    const mockDb = {
      'despesas': {
        'd1': { userId: "test-user-123", descricao: "Mercado (Fake Real)", valor: 500, formaPagamento: 'avista', dataCompra: '2026-03-15', pago: false },
      },
      'pessoas': {
        'p1': {
            userId: "test-user-123",
            nome: "Salário (Fake Real)",
            saldoInicial: 0,
            pagamentos: [
                { dia: 5, valor: 3000 }
            ],
            pagamentosRecebidos: {
              "2026-2": [
                { dataRecebimento: '2026-03-05', valor: 3000 }
              ]
            }
        }
      },
      'nova_entradas': {}
    };

    // Intercept db ref calls directly since script.js initializes db = firebase.database()
    Object.defineProperty(window, 'db', {
      get: function() {
        return {
          ref: function(path) {
            return {
              orderByChild: function(field) {
                return {
                  equalTo: function(val) {
                    return {
                      once: function(eventType) {
                        return Promise.resolve({
                          exists: () => {
                            let data = mockDb[path];
                            for (let key in data) {
                              if (data[key][field] === val) return true;
                            }
                            return false;
                          },
                          forEach: (callback) => {
                            const data = mockDb[path];
                            for (let key in data) {
                              if (data[key][field] === val) {
                                callback({
                                  key: key,
                                  val: () => data[key]
                                });
                              }
                            }
                          }
                        });
                      }
                    }
                  }
                }
              }
            };
          }
        };
      },
      set: function(val) {} // Prevent script.js from overriding our mock
    });

    // Override currentUser global
    Object.defineProperty(window, 'currentUser', {
       get: () => ({ uid: "test-user-123", email: "test@example.com" }),
       set: () => {}
    });
  });

  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(1000);

  // Navigate to 'Relatórios & Previsões' Tab
  await page.click('a.nav-link[onclick="showSection(\'relatorios\')"]');

  // Navigate to 'Fluxo de Caixa' sub-tab
  await page.click('button[onclick="showRelatorioTab(\'fluxoCaixaTab\')"]');

  // Verify elements are visible
  await page.waitForTimeout(2000); // give it time to query mock DB and render

  const cards = await page.locator('.dashboard-card-value');
  await expect(cards.first()).toBeVisible();

  // Wait for the page to stabilize and grab a screenshot
  await page.screenshot({ path: '/home/jules/verification/verification.png', fullPage: true });
});
