// ===================== PWA INSTALAÇÃO =====================
let deferredPrompt;

// Cria o banner do PWA dinamicamente para funcionar em todas as páginas
function createPwaBanner() {
    // Verifica se já foi dispensado ou se já está instalado
    const pwaBannerDismissed = localStorage.getItem('pwaBannerDismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    // Se o usuário dispensou ou já instalou, nem injetamos o HTML para não pesar o DOM
    if (pwaBannerDismissed || isStandalone) return;

    // Criamos o banner. O controle se ele aparece ou não (Mobile vs Desktop)
    // será feito exclusivamente via CSS (classe .pwa-install-banner) para não falhar
    // na detecção inicial de tela via JS que as vezes atrasa.
    const bannerHtml = `
    <!-- Banner de Instalação PWA -->
    <div id="pwaInstallBanner" class="pwa-install-banner" style="display: none; position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--card-color); color: var(--text-color); padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999; flex-direction: column; align-items: center; gap: 10px; width: 90%; max-width: 400px; border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <img src="icon-192x192.png" alt="App Icon" style="width: 40px; height: 40px; border-radius: 8px;">
            <div>
                <h4 style="margin: 0; font-size: 16px;">Instalar App</h4>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Acesse o Gestão Financeira mais rápido e offline.</p>
            </div>
        </div>
        <div style="display: flex; gap: 10px; width: 100%; justify-content: flex-end;">
            <button id="pwaInstallDecline" class="btn btn-outline" style="padding: 6px 12px; font-size: 14px;">Agora Não</button>
            <button id="pwaInstallAccept" class="btn btn-primary" style="padding: 6px 12px; font-size: 14px;">Instalar</button>
        </div>
    </div>


    `;

    document.body.insertAdjacentHTML('beforeend', bannerHtml);
}

// Inicializa a lógica dos botões do PWA
function initPwaLogic() {
    const installBanner = document.getElementById('pwaInstallBanner');
    if (installBanner) {
      const btnAccept = document.getElementById('pwaInstallAccept');
      const btnDecline = document.getElementById('pwaInstallDecline');

      if (btnAccept) {
        btnAccept.addEventListener('click', async () => {
          // Oculta o banner
          installBanner.style.setProperty('display', 'none', 'important');

          if (deferredPrompt) {
            // Android Chrome - Suporta o evento automático
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`PWA install prompt outcome: ${outcome}`);
            deferredPrompt = null;
          }
        });
      }

      if (btnDecline) {
        btnDecline.addEventListener('click', () => {
          installBanner.style.setProperty('display', 'none', 'important');
          localStorage.setItem('pwaBannerDismissed', 'true');
        });
      }
    }
}

// Escuta o evento (Android/Chrome) para armazená-lo se estiver disponível
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); // Previne a barra automática
  deferredPrompt = e; // Salva o evento para quando o usuário clicar no nosso botão

  // Como o usuário quer que instale direto, só mostramos o banner quando for possível instalar nativamente
  const installBanner = document.getElementById('pwaInstallBanner');
  if (installBanner) {
    // Usar flexbox pois o banner tem 'flex-direction: column' no seu estilo
    installBanner.style.setProperty('display', 'flex', 'important');
  }
});

// Quando o DOM estiver pronto, cria o HTML e roda a lógica
document.addEventListener('DOMContentLoaded', () => {
    createPwaBanner();

    // Pequeno delay para garantir que a renderização inicial não seja interrompida
    setTimeout(initPwaLogic, 1000);
});
