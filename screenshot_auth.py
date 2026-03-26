import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Route to bypass firebase auth and force logged-in state
        page.route("**/*", lambda route: route.continue_())

        page.goto("http://localhost:3000/index.html")

        # Inject script to override currentUser and show config section
        page.evaluate("""
            // Stop redirects
            window.location.replace = function() {};
            window.location.assign = function() {};

            // Mock auth state
            window.currentUser = { uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' };
            document.body.classList.remove('login-page');

            // Mock DB data
            window.exemploRendas = [
                {
                    key: 'r1',
                    nome: 'Salário Principal',
                    saldoInicial: 5000,
                    pagamentos: [
                        { dia: 5, valor: 5000 }
                    ]
                }
            ];

            // Render manually if needed, or just switch tabs
            setTimeout(() => {
                const configTab = document.querySelector('aside .nav-link:last-child');
                if(configTab) configTab.click();

                // Manually trigger the render for testing visual
                const rendaList = document.getElementById("usuariosListaPrincipal");
                if (rendaList) {
                    rendaList.innerHTML = '';
                    window.exemploRendas.forEach(pessoa => {
                        const div = document.createElement("div");
                        div.className = "renda-item";
                        let pagamentosInfo = "";
                        if (pessoa.pagamentos && pessoa.pagamentos.length > 0) {
                            pagamentosInfo = "<div class='renda-pagamentos'><strong>Pagamentos:</strong><br>";
                            pessoa.pagamentos.forEach((pag, index) => {
                                if (index > 0) pagamentosInfo += "<br>";
                                pagamentosInfo += `• Dia ${pag.dia}: R$ ${parseFloat(pag.valor).toFixed(2)}`;
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
                            <div class="renda-acoes">
                                <button class="btn-icon btn-danger">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `;
                        rendaList.appendChild(div);
                    });
                }

                const catList = document.getElementById("categoriasListaPrincipal");
                if (catList) {
                    catList.innerHTML = `
                        <div class="categoria-item">
                            <div class="categoria-info">
                                <div class="categoria-titulo">Alimentação</div>
                            </div>
                            <div class="categoria-acoes">
                                <button class="btn-icon btn-primary"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon btn-danger"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                }
            }, 500);
        """)

        page.wait_for_timeout(2000)
        page.screenshot(path="desktop_cards.png", full_page=True)
        browser.close()

if __name__ == "__main__":
    run()
