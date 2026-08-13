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
  }, { threshold:0, rootMargin:'0px 0px -40px 0px' });

  itens.forEach(item => observador.observe(item));
}else{
  itens.forEach(revelarElemento);
}

function definirEstadoMenu(aberto){
  if(!menu || !botaoMenu) return;
  menu.classList.toggle('aberto', aberto);
  botaoMenu.classList.toggle('ativo', aberto);
  botaoMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

function alternarMenu(){
  const aberto = menu.classList.toggle('aberto');
  definirEstadoMenu(aberto);
}

if(botaoMenu && menu){
  botaoMenu.addEventListener('click', alternarMenu);

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      definirEstadoMenu(false);
    });
  });

  document.addEventListener('click', evento => {
    if(menu.classList.contains('aberto') && !evento.target.closest('.topo')){
      definirEstadoMenu(false);
    }
  });

  window.addEventListener('keydown', evento => {
    if(evento.key === 'Escape' && menu.classList.contains('aberto')){
      definirEstadoMenu(false);
      botaoMenu.focus();
    }
  });

  window.addEventListener('resize', () => {
    if(window.innerWidth > 900) definirEstadoMenu(false);
  }, { passive:true });
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
const trilhaCarrossel = document.querySelector('.carrossel-trilha');
let slideAtual = 0;
let intervaloCarrossel;
let toqueCarrosselX = null;

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

  trilhaCarrossel?.addEventListener('touchstart', evento => {
    toqueCarrosselX = evento.changedTouches[0]?.clientX ?? null;
  }, { passive:true });

  trilhaCarrossel?.addEventListener('touchend', evento => {
    if(toqueCarrosselX === null) return;
    const deslocamento = (evento.changedTouches[0]?.clientX ?? toqueCarrosselX) - toqueCarrosselX;
    if(Math.abs(deslocamento) > 45){
      mostrarSlide(slideAtual + (deslocamento < 0 ? 1 : -1));
      iniciarCarrossel();
    }
    toqueCarrosselX = null;
  }, { passive:true });
}

const lightbox = document.querySelector('.lightbox');
const lightboxImagem = lightbox?.querySelector('img');
const lightboxLegenda = lightbox?.querySelector('p');
const lightboxFechar = lightbox?.querySelector('.lightbox-fechar');
const lightboxAnterior = lightbox?.querySelector('.lightbox-anterior');
const lightboxProximo = lightbox?.querySelector('.lightbox-proximo');
const lightboxContador = lightbox?.querySelector('.lightbox-contador');
const lightboxMiniaturas = lightbox?.querySelector('.lightbox-miniaturas');
let ultimoFoco = null;
let imagensAbertas = [];
let imagemAtual = 0;
let toqueInicialX = null;

const galeriasProdutos = {
  'livro-colorir': [
    { src:'img/galeria/bobzinho.jpeg', alt:'Capa do Livrinho de Colorir Bobzinho', legenda:'Capa do Livrinho de Colorir Bobzinho' },
    { src:'img/galeria/bobzinho-praia.jpeg', alt:'Livrinho de colorir com Bobzinho na praia', legenda:'Bobzinho na Praia' },
    { src:'img/galeria/bobzinho-aniversario.jpeg', alt:'Livrinho de colorir com a festa do Bobzinho', legenda:'Festa do Bobzinho' },
    { src:'img/galeria/bobzinho-arte.jpeg', alt:'Livrinho de colorir com Bobzinho fazendo arte', legenda:'Bobzinho Criativo' }
  ],
  'festas-eventos': [
    { src:'img/personalizados-festas-eventos.png', alt:'Arte de Personalizados para Festas e Eventos', legenda:'Personalizados para Festas e Eventos' },
    { src:'img/galeria/festas-eventos-caixas-milk.jpeg', alt:'Caixas Milk e personalizados para festa neon', legenda:'Caixas Milk e Personalizados' },
    { src:'img/galeria/festas-eventos-kits-adesivos.jpeg', alt:'Kit de caixas, adesivos e rótulos personalizados para festa neon', legenda:'Kit Completo com Adesivos e Rótulos' },
    { src:'img/galeria/festas-eventos-kit-completo.jpeg', alt:'Kit completo de personalizados para festa neon', legenda:'Kit Completo para Festa' }
  ],
  'cadernetas-pet': [
    { src:'img/cadernetas-pet.jpeg', alt:'Modelos de cadernetas de saúde e vacinação para pets', legenda:'Modelos de Cadernetas Pet' },
    { src:'img/galeria/caderneta-pet-cachorro-macho.jpeg', alt:'Caderneta de vacinação para cachorro macho', legenda:'Caderneta para Cachorro — Macho' },
    { src:'img/galeria/caderneta-pet-cachorro-femea.jpeg', alt:'Caderneta de vacinação para cachorro fêmea', legenda:'Caderneta para Cachorro — Fêmea' },
    { src:'img/galeria/caderneta-pet-passaro.jpeg', alt:'Caderneta de saúde e cuidados para pássaro', legenda:'Caderneta para Pássaro' },
    { src:'img/galeria/caderneta-pet-gato-macho.jpeg', alt:'Caderneta de saúde para gato macho', legenda:'Caderneta para Gato — Macho' },
    { src:'img/galeria/caderneta-pet-gato-femea.jpeg', alt:'Caderneta de saúde para gato fêmea', legenda:'Caderneta para Gato — Fêmea' }
  ],
  'cadernos-personalizados': [
    { src:'img/galeria/cadernos-personalizados-modelos.jpeg', alt:'Coleção com vários modelos de cadernos personalizados', legenda:'Modelos de Cadernos Personalizados' },
    { src:'img/galeria/caderno-personalizado-professora.jpeg', alt:'Caderno floral roxo personalizado para professora', legenda:'Caderno Personalizado para Professora' },
    { src:'img/galeria/cadernos-personalizados-anuncio.jpeg', alt:'Anúncio de cadernos personalizados ART Brother', legenda:'Cadernos Personalizados do Seu Jeito' }
  ],
  'fotografias-polaroids': [
    { src:'img/galeria/impressao-fotografias.png', alt:'Impressão de fotografias em vários tamanhos e molduras até A3', legenda:'Impressão de Fotografias' },
    { src:'img/galeria/impressao-polaroids.png', alt:'Impressão de Polaroids em vários tamanhos', legenda:'Impressão de Polaroids' }
  ]
};

function mostrarImagemLightbox(indice){
  if(!imagensAbertas.length || !lightboxImagem || !lightboxLegenda) return;
  imagemAtual = (indice + imagensAbertas.length) % imagensAbertas.length;
  const imagem = imagensAbertas[imagemAtual];
  lightboxImagem.src = imagem.src;
  lightboxImagem.alt = imagem.alt;
  lightboxLegenda.textContent = imagem.legenda;
  if(lightboxContador){
    lightboxContador.textContent = imagensAbertas.length > 1 ? `${imagemAtual + 1} de ${imagensAbertas.length}` : '';
  }
  lightboxMiniaturas?.querySelectorAll('button').forEach((botao, i) => {
    botao.classList.toggle('ativo', i === imagemAtual);
    botao.setAttribute('aria-current', i === imagemAtual ? 'true' : 'false');
  });
}

function montarMiniaturas(){
  if(!lightboxMiniaturas) return;
  lightboxMiniaturas.replaceChildren();
  imagensAbertas.forEach((imagem, i) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.setAttribute('aria-label', `Mostrar foto ${i + 1}: ${imagem.legenda}`);
    const miniatura = document.createElement('img');
    miniatura.src = imagem.src;
    miniatura.alt = '';
    botao.appendChild(miniatura);
    botao.addEventListener('click', () => mostrarImagemLightbox(i));
    lightboxMiniaturas.appendChild(botao);
  });
}

function abrirGaleria(imagens, focoOrigem){
  if(!lightbox || !imagens?.length) return;
  ultimoFoco = focoOrigem || document.activeElement;
  imagensAbertas = imagens;
  imagemAtual = 0;
  montarMiniaturas();
  mostrarImagemLightbox(0);
  const temVarias = imagens.length > 1;
  lightboxAnterior?.toggleAttribute('hidden', !temVarias);
  lightboxProximo?.toggleAttribute('hidden', !temVarias);
  if(lightboxMiniaturas) lightboxMiniaturas.hidden = !temVarias;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxFechar?.focus();
}

function abrirLightbox(botao){
  const imagem = botao.querySelector('img');
  const legenda = botao.querySelector('figcaption')?.textContent || imagem?.alt || 'Imagem ampliada';
  if(!imagem) return;
  abrirGaleria([{ src:imagem.src, alt:imagem.alt, legenda }], botao);
}

function fecharLightbox(){
  if(!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
  if(lightboxImagem) lightboxImagem.src = '';
  imagensAbertas = [];
  ultimoFoco?.focus?.();
}

document.querySelectorAll('.abrir-lightbox').forEach(botao => {
  botao.addEventListener('click', () => abrirLightbox(botao));
});
document.querySelectorAll('.abrir-galeria-produto').forEach(botao => {
  botao.addEventListener('click', () => abrirGaleria(galeriasProdutos[botao.dataset.galeria], botao));
});
lightboxAnterior?.addEventListener('click', () => mostrarImagemLightbox(imagemAtual - 1));
lightboxProximo?.addEventListener('click', () => mostrarImagemLightbox(imagemAtual + 1));
lightboxFechar?.addEventListener('click', fecharLightbox);
lightbox?.addEventListener('click', evento => {
  if(evento.target === lightbox) fecharLightbox();
});
window.addEventListener('keydown', evento => {
  if(!lightbox || lightbox.hidden) return;
  if(evento.key === 'Escape') fecharLightbox();
  if(evento.key === 'ArrowLeft' && imagensAbertas.length > 1) mostrarImagemLightbox(imagemAtual - 1);
  if(evento.key === 'ArrowRight' && imagensAbertas.length > 1) mostrarImagemLightbox(imagemAtual + 1);
});
lightbox?.addEventListener('touchstart', evento => {
  toqueInicialX = evento.changedTouches[0]?.clientX ?? null;
}, { passive:true });
lightbox?.addEventListener('touchend', evento => {
  if(toqueInicialX === null || imagensAbertas.length < 2) return;
  const deslocamento = (evento.changedTouches[0]?.clientX ?? toqueInicialX) - toqueInicialX;
  if(Math.abs(deslocamento) > 45) mostrarImagemLightbox(imagemAtual + (deslocamento < 0 ? 1 : -1));
  toqueInicialX = null;
}, { passive:true });

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


// ===== PWA: registro do service worker e botão instalar aplicativo =====
const botaoInstalarApp = document.querySelector('.botao-instalar-app');
let eventoInstalacaoPWA = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', evento => {
  evento.preventDefault();
  eventoInstalacaoPWA = evento;
  if (botaoInstalarApp) botaoInstalarApp.hidden = false;
});

botaoInstalarApp?.addEventListener('click', async () => {
  if (!eventoInstalacaoPWA) {
    mostrarAviso('No celular, abra o menu do navegador e escolha “Adicionar à tela inicial” para instalar o app da ART Brother.');
    return;
  }
  eventoInstalacaoPWA.prompt();
  await eventoInstalacaoPWA.userChoice.catch(() => null);
  eventoInstalacaoPWA = null;
  botaoInstalarApp.hidden = true;
});

window.addEventListener('appinstalled', () => {
  eventoInstalacaoPWA = null;
  if (botaoInstalarApp) botaoInstalarApp.hidden = true;
  mostrarAviso('App da ART Brother instalado com sucesso!');
});
