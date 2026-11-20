/* Natal de 2026: horário de Brasília (UTC-03:00), ativo a partir de 20/11 até o fim de dezembro. */
(() => {
  'use strict';

  const banner = document.getElementById('inicio');
  const imagem = banner && banner.querySelector('.abertura-mascote img');
  if (!imagem) return;

  const inicio = Date.parse('2026-11-20T00:00:00-03:00');
  const fim = Date.parse('2027-01-01T00:00:00-03:00');
  const normal = {
    src: imagem.getAttribute('src'),
    alt: imagem.getAttribute('alt')
  };
  const natal = {
    src: 'img/brotherzinho-natal-2026.webp',
    alt: 'Brotherzinho de Natal da Art Brother, com gorro, cachecol e presente'
  };
  let estadoAtual;
  let falhaNatal = false;

  function atualizarBanner() {
    const agora = Date.now();
    const exibirNatal = agora >= inicio && agora < fim && !falhaNatal;
    if (exibirNatal === estadoAtual) return;
    estadoAtual = exibirNatal;
    const versao = exibirNatal ? natal : normal;
    banner.classList.toggle('abertura-natal', exibirNatal);
    imagem.setAttribute('alt', versao.alt);
    if (imagem.getAttribute('src') !== versao.src) {
      imagem.setAttribute('src', versao.src);
    }
  }

  imagem.addEventListener('error', () => {
    if (estadoAtual) {
      falhaNatal = true;
      atualizarBanner();
    }
  });

  atualizarBanner();
  // Atualiza também abas já abertas e o aplicativo ao voltar do segundo plano.
  window.addEventListener('pageshow', atualizarBanner);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) atualizarBanner();
  });
  window.setInterval(atualizarBanner, 60000);
})();
