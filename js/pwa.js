// ===================== PWA INSTALAÇÃO =====================
let deferredPrompt = null;

function isMobileDevice() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isSafariIOS() {
  const ua = navigator.userAgent;
  return isIOS() && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
}

function wasBannerDismissed() {
  return localStorage.getItem('pwaBannerDismissed') === 'true';
}

function canShowBanner() {
  return isMobileDevice() && !isStandaloneMode() && !wasBannerDismissed();
}

function createPwaBanner() {
  if (document.getElementById('pwaInstallBanner')) return;

  const bannerHtml = `
    <div id="pwaInstallBanner" style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--card-color); color: var(--text-color); padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 9999; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 90%; max-width: 400px; border: 1px solid var(--border-color);">
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

    <div id="pwaIOSModal" class="modal" style="display: none; z-index: 10000;">
      <div class="modal-content" style="text-align: center; max-width: 350px; padding: 20px;">
        <h2 style="margin-bottom: 15px; font-size: 1.2rem;">Adicionar à Tela de Início</h2>
        <img src="icon-192x192.png" alt="App Icon" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 15px;">
        <p style="margin-bottom: 10px; font-size: 0.95rem; color: var(--text-color);">
          Para instalar o aplicativo:
        </p>
        <ol style="text-align: left; margin-bottom: 20px; font-size: 0.9rem; padding-left: 20px; color: var(--text-color);">
          <li style="margin-bottom: 8px;">Toque em <strong>Compartilhar</strong>.</li>
          <li>Depois em <strong>Adicionar à Tela de Início</strong>.</li>
        </ol>
        <button class="btn btn-primary btn-block" onclick="document.getElementById('pwaIOSModal').style.display='none'">Entendi</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', bannerHtml);

  const installBanner = document.getElementById('pwaInstallBanner');
  const btnAccept = document.getElementById('pwaInstallAccept');
  const btnDecline = document.getElementById('pwaInstallDecline');
  const iosModal = document.getElementById('pwaIOSModal');

  btnAccept.addEventListener('click', async () => {
    if (deferredPrompt) {
      installBanner.style.setProperty('display', 'none', 'important');
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      return;
    }

    if (isSafariIOS() && iosModal) {
      installBanner.style.setProperty('display', 'none', 'important');
      iosModal.style.display = 'flex';
    }
  });

  btnDecline.addEventListener('click', () => {
    installBanner.style.setProperty('display', 'none', 'important');
    localStorage.setItem('pwaBannerDismissed', 'true');
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (canShowBanner()) {
    createPwaBanner();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!canShowBanner()) return;

  // iPhone/Safari mobile: mostra banner manual
  if (isSafariIOS()) {
    createPwaBanner();
  }

  // Android/Chrome mobile:
  // não cria aqui; espera o beforeinstallprompt
});
