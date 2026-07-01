const itens = document.querySelectorAll('.reveal');
const menu = document.querySelector('.menu');
const botaoMenu = document.querySelector('.menu-toggle');
const botaoTopo = document.querySelector('.voltar-topo');

function revelarElemento(item){
  item.classList.add('ativo');
}

if('IntersectionObserver' in window){
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if(entrada.isIntersecting){
        revelarElemento(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -80px 0px' });

  itens.forEach(item => observador.observe(item));
}else{
  itens.forEach(revelarElemento);
}

function alternarMenu(){
  const aberto = menu.classList.toggle('aberto');
  botaoMenu.classList.toggle('ativo', aberto);
  botaoMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
}

if(botaoMenu && menu){
  botaoMenu.addEventListener('click', alternarMenu);

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('aberto');
      botaoMenu.classList.remove('ativo');
      botaoMenu.setAttribute('aria-expanded', 'false');
    });
  });
}

function controlarBotaoTopo(){
  if(!botaoTopo) return;
  botaoTopo.classList.toggle('visivel', window.scrollY > 500);
}

window.addEventListener('scroll', controlarBotaoTopo, { passive:true });
window.addEventListener('load', controlarBotaoTopo);

// ===== Versão 2.0: carrossel, lightbox e profundidade do banner =====
const slides = Array.from(document.querySelectorAll('.slide'));
const pontosContainer = document.querySelector('.carrossel-pontos');
const botaoAnterior = document.querySelector('.carrossel-controle.anterior');
const botaoProximo = document.querySelector('.carrossel-controle.proximo');
let slideAtual = 0;
let intervaloCarrossel;

function mostrarSlide(indice){
  if(!slides.length) return;
  slideAtual = (indice + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('ativo', i === slideAtual));
  document.querySelectorAll('.carrossel-pontos button').forEach((ponto, i) => {
    ponto.classList.toggle('ativo', i === slideAtual);
    ponto.setAttribute('aria-pressed', i === slideAtual ? 'true' : 'false');
  });
}

function iniciarCarrossel(){
  clearInterval(intervaloCarrossel);
  intervaloCarrossel = setInterval(() => mostrarSlide(slideAtual + 1), 4500);
}

if(slides.length && pontosContainer){
  slides.forEach((_, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.setAttribute('aria-label', `Mostrar produto ${i + 1}`);
    ponto.addEventListener('click', () => {
      mostrarSlide(i);
      iniciarCarrossel();
    });
    pontosContainer.appendChild(ponto);
  });
  botaoAnterior?.addEventListener('click', () => { mostrarSlide(slideAtual - 1); iniciarCarrossel(); });
  botaoProximo?.addEventListener('click', () => { mostrarSlide(slideAtual + 1); iniciarCarrossel(); });
  mostrarSlide(0);
  iniciarCarrossel();
}

const lightbox = document.querySelector('.lightbox');
const lightboxImagem = lightbox?.querySelector('img');
const lightboxLegenda = lightbox?.querySelector('p');
const lightboxFechar = lightbox?.querySelector('.lightbox-fechar');
let ultimoFoco = null;

function abrirLightbox(botao){
  if(!lightbox || !lightboxImagem || !lightboxLegenda) return;
  const imagem = botao.querySelector('img');
  const legenda = botao.querySelector('figcaption')?.textContent || imagem?.alt || 'Imagem ampliada';
  if(!imagem) return;
  ultimoFoco = document.activeElement;
  lightboxImagem.src = imagem.src;
  lightboxImagem.alt = imagem.alt;
  lightboxLegenda.textContent = legenda;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxFechar?.focus();
}

function fecharLightbox(){
  if(!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
  if(lightboxImagem) lightboxImagem.src = '';
  ultimoFoco?.focus?.();
}

document.querySelectorAll('.abrir-lightbox').forEach(botao => {
  botao.addEventListener('click', () => abrirLightbox(botao));
});
lightboxFechar?.addEventListener('click', fecharLightbox);
lightbox?.addEventListener('click', evento => {
  if(evento.target === lightbox) fecharLightbox();
});
window.addEventListener('keydown', evento => {
  if(evento.key === 'Escape' && lightbox && !lightbox.hidden) fecharLightbox();
});

const bannerProfundidade = document.querySelector('.banner-profundidade');
if(bannerProfundidade && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  bannerProfundidade.addEventListener('pointermove', evento => {
    const rect = bannerProfundidade.getBoundingClientRect();
    const mx = ((evento.clientX - rect.left) / rect.width - .5).toFixed(3);
    const my = ((evento.clientY - rect.top) / rect.height - .5).toFixed(3);
    bannerProfundidade.style.setProperty('--mx', mx);
    bannerProfundidade.style.setProperty('--my', my);
  }, { passive:true });
}


// ===== Versão 3.0: compartilhar no WhatsApp e orientar favorito =====
const botaoCompartilhar = document.querySelector('.botao-compartilhar');
const botaoFavorito = document.querySelector('.botao-favorito');

function mostrarAviso(mensagem){
  let aviso = document.querySelector('.aviso-site');
  if(!aviso){
    aviso = document.createElement('div');
    aviso.className = 'aviso-site';
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('aria-live', 'polite');
    document.body.appendChild(aviso);
  }
  aviso.textContent = mensagem;
  aviso.classList.add('visivel');
  clearTimeout(mostrarAviso.tempo);
  mostrarAviso.tempo = setTimeout(() => aviso.classList.remove('visivel'), 5200);
}

function compartilharSite(){
  const titulo = 'ART Brother Soluções Gráficas';
  const texto = 'Conheça a ART Brother: impressões, cadernos personalizados, placas Pix, chaveiros, fotos e personalizados em Betim-MG.';
  const url = window.location.href.split('#')[0];

  if(navigator.share){
    navigator.share({ title:titulo, text:texto, url }).catch(() => {});
    return;
  }

  const mensagem = encodeURIComponent(`${texto}\n${url}`);
  window.open(`https://wa.me/?text=${mensagem}`, '_blank', 'noopener');
}

function orientarFavorito(){
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const atalho = isMac ? 'Command + D' : 'Ctrl + D';
  mostrarAviso(`Para adicionar este site aos favoritos, pressione ${atalho}. No celular, toque no menu do navegador e escolha “Adicionar à tela inicial” ou “Adicionar aos favoritos”.`);
}

botaoCompartilhar?.addEventListener('click', compartilharSite);
botaoFavorito?.addEventListener('click', orientarFavorito);
