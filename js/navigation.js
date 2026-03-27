/**
 * Redireciona de forma inteligente com base no ambiente de hospedagem.
 * @param {string} page - A página para onde deseja ir (ex: 'login', 'index').
 */
function redirecionarPara(page) {
  const isGithub = window.location.hostname.includes('github.io');
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isGithub) {
    // No GitHub Pages, precisamos incluir o nome do repositório no caminho, ou simplesmente usar caminho relativo
    // Como a pessoa falou "redireciona sem o https://oliverlleo.github.io/CK-Money", significa
    // que quando a gente fez window.location.href = '/', ele foi pra raiz do domínio "github.io"
    // e perdeu o "CK-Money".
    // Então, pra GitHub Pages, é melhor usar caminhos relativos:
    window.location.href = page + '.html';
  } else if (isLocal) {
    // Localhost, usamos .html também pra funcionar com o npx serve padrão
    window.location.href = page + '.html';
  } else {
    // Cloudflare Pages ou domínio customizado (carteirafacil.pages.dev) - PWA Clean URLs
    if (page === 'index') {
      window.location.href = '/';
    } else {
      window.location.href = '/' + page;
    }
  }
}
