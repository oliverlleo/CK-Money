const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    recordVideo: {
      dir: 'video/'
    }
  });
  const page = await context.newPage();

  // Bloquear redirecionamento para login
  await page.route('**/*', async route => {
    if (route.request().url().includes('login.html')) {
        await route.fulfill({
            status: 200,
            body: '<html><body>Blocked login redirect</body></html>'
        });
    } else {
        await route.continue();
    }
  });

  await page.goto('http://localhost:3000/');

  // Forçar o estado da página sem redirect para login
  await page.evaluate(() => {
      // Mock auth state changed
      window.handleAuthStateChanged = function() {};

      const user = {
          uid: '12345',
          displayName: 'Usuario Teste',
          email: 'teste@example.com',
          photoURL: ''
      };

      // Inject the UI elements manually since firebase isn't firing
      if (typeof window.exibirInfoUsuario === 'function') {
        window.exibirInfoUsuario(user);
      }

      // Stop body class from causing issues
      document.body.classList.remove('login-page');
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification_before.png' });

  // Click on the user info area to toggle the dropdown
  await page.evaluate(() => {
     const userInfo = document.getElementById('userInfo');
     if (userInfo) {
         userInfo.click();
     } else {
         const drop = document.getElementById('desktopUserDropdown');
         if(drop) {
             drop.style.display = 'block';
             drop.classList.add('active');
         }
     }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification.png' });

  await context.close();
  await browser.close();

  const files = fs.readdirSync('video');
  console.log("Screenshots and video captured successfully. Video file: ", files[0]);
})();
