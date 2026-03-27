// ===================== PWA INSTALAÇÃO =====================
let deferredPrompt;

// Cria o banner do PWA dinamicamente para funcionar em todas as páginas
function createPwaBanner() {
    const bannerHtml = `
    <div id="pwaInstallBanner" class="pwa-install-banner" style="display: none; position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--bg-card); color: var(--text-color); padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9999; flex-direction: column; align-items: center; gap: 10px; width: 90%; max-width: 400px; border: 1px solid var(--border-color);">
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

// Injeta o HTML
document.addEventListener('DOMContentLoaded', createPwaBanner);

window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o mini-infobar padrão de aparecer em dispositivos móveis
  e.preventDefault();
  // Guarda o evento para ser chamado depois.
  deferredPrompt = e;

  // Verifica se o usuário já dispensou o banner antes
  const pwaBannerDismissed = localStorage.getItem('pwaBannerDismissed');

  // Exibe apenas para mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (!pwaBannerDismissed && isMobile) {
    // Atualiza a interface para notificar o usuário que ele pode instalar o PWA
    const installBanner = document.getElementById('pwaInstallBanner');
    if (installBanner) {
      installBanner.style.display = 'flex';

      const btnAccept = document.getElementById('pwaInstallAccept');
      const btnDecline = document.getElementById('pwaInstallDecline');

      if (btnAccept) {
        btnAccept.addEventListener('click', async () => {
          // Oculta o banner fornecido pelo app
          installBanner.style.display = 'none';
          // Mostra o prompt de instalação padrão
          deferredPrompt.prompt();
          // Aguarda o usuário responder ao prompt
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          // Nós o usamos uma vez, não podemos usá-lo novamente, descarta
          deferredPrompt = null;
        });
      }

      if (btnDecline) {
        btnDecline.addEventListener('click', () => {
          installBanner.style.display = 'none';
          localStorage.setItem('pwaBannerDismissed', 'true');
        });
      }
    }
  }
});
