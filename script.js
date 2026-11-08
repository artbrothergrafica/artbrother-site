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
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
let carrosselPausado = movimentoReduzido.matches;
const pausaCarrossel = document.querySelector('.carrossel-pausa');
let toqueCarrosselX = null;

function mostrarSlide(indice){
  if(!slides.length) return;
  slideAtual = (indice + slides.length) % slides.length;
  slides.forEach((slide, i) => { slide.classList.toggle('ativo', i === slideAtual); slide.setAttribute('aria-hidden', i === slideAtual ? 'false' : 'true'); });
  document.querySelectorAll('.carrossel-pontos button').forEach((ponto, i) => {
    ponto.classList.toggle('ativo', i === slideAtual);
    ponto.setAttribute('aria-pressed', i === slideAtual ? 'true' : 'false');
  });
}

function iniciarCarrossel(){
  clearInterval(intervaloCarrossel);
  if(carrosselPausado || document.hidden || trilhaCarrossel?.closest('.carrossel-produtos')?.contains(document.activeElement)) return;
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
  'blocos-de-notas': [{src:'img/blocos-de-notas.webp',alt:'Blocos de notas personalizados Art Brother com capa kraft',legenda:'Blocos de Notas Personalizados'}],
  'livros-cadernos-wire-o': [
    {src:'img/livros-cadernos-wire-o-1.webp',alt:'Detalhes dos livros e cadernos personalizados Wire-O',legenda:'Livros e Cadernos Personalizados Wire-O — Detalhes'},
    {src:'img/livros-cadernos-wire-o-2.webp',alt:'Livros e cadernos personalizados expostos na Art Brother',legenda:'Livros e Cadernos Personalizados Wire-O — Produção Art Brother'}
  ],
  'agenda-2027': [{ src:'img/agenda-2027.webp', alt:'Agenda 2027 personalizada Art Brother', legenda:'Agendas 2027 Personalizadas' }],
  'livro-colorir': [
    { src:'img/galeria/bobzinho.webp', alt:'Capa do Livrinho de Colorir Bobzinho', legenda:'Capa do Livrinho de Colorir Bobzinho' },
    { src:'img/galeria/bobzinho-praia.webp', alt:'Livrinho de colorir com Bobzinho na praia', legenda:'Bobzinho na Praia' },
    { src:'img/galeria/bobzinho-aniversario.webp', alt:'Livrinho de colorir com a festa do Bobzinho', legenda:'Festa do Bobzinho' },
    { src:'img/galeria/bobzinho-arte.webp', alt:'Livrinho de colorir com Bobzinho fazendo arte', legenda:'Bobzinho Criativo' }
  ],
  'festas-eventos': [
    { src:'img/personalizados-festas-eventos.webp', alt:'Arte de Personalizados para Festas e Eventos', legenda:'Personalizados para Festas e Eventos' },
    { src:'img/galeria/festas-eventos-caixas-milk.webp', alt:'Caixas Milk e personalizados para festa neon', legenda:'Caixas Milk e Personalizados' },
    { src:'img/galeria/festas-eventos-kits-adesivos.webp', alt:'Kit de caixas, adesivos e rótulos personalizados para festa neon', legenda:'Kit Completo com Adesivos e Rótulos' },
    { src:'img/galeria/festas-eventos-kit-completo.webp', alt:'Kit completo de personalizados para festa neon', legenda:'Kit Completo para Festa' },
    { src:'img/galeria/caixas-festa-personalizadas-1.webp', alt:'Caixas personalizadas para festa com tema de ursinho e mel', legenda:'Caixas Personalizadas para Festa — Detalhes' },
    { src:'img/galeria/caixas-festa-personalizadas-2.webp', alt:'Conjunto de caixas personalizadas para festa produzido pela Art Brother', legenda:'Caixas Personalizadas para Festa — Conjunto' }
  ],
  'cadernetas-pet': [
    { src:'img/cadernetas-pet.webp', alt:'Modelos de cadernetas de saúde e vacinação para pets', legenda:'Modelos de Cadernetas Pet' },
    { src:'img/galeria/caderneta-pet-cachorro-macho.webp', alt:'Caderneta de vacinação para cachorro macho', legenda:'Caderneta para Cachorro — Macho' },
    { src:'img/galeria/caderneta-pet-cachorro-femea.webp', alt:'Caderneta de vacinação para cachorro fêmea', legenda:'Caderneta para Cachorro — Fêmea' },
    { src:'img/galeria/caderneta-pet-passaro.webp', alt:'Caderneta de saúde e cuidados para pássaro', legenda:'Caderneta para Pássaro' },
    { src:'img/galeria/caderneta-pet-gato-macho.webp', alt:'Caderneta de saúde para gato macho', legenda:'Caderneta para Gato — Macho' },
    { src:'img/galeria/caderneta-pet-gato-femea.webp', alt:'Caderneta de saúde para gato fêmea', legenda:'Caderneta para Gato — Fêmea' }
  ],
  'cadernos-personalizados': [
    { src:'img/galeria/cadernos-personalizados-modelos.webp', alt:'Coleção com vários modelos de cadernos personalizados', legenda:'Modelos de Cadernos Personalizados' },
    { src:'img/galeria/caderno-personalizado-professora.webp', alt:'Caderno floral roxo personalizado para professora', legenda:'Caderno Personalizado para Professora' },
    { src:'img/galeria/cadernos-personalizados-anuncio.webp', alt:'Anúncio de cadernos personalizados ART Brother', legenda:'Cadernos Personalizados do Seu Jeito' }
  ],
  'fotografias-polaroids': [
    { src:'img/galeria/impressao-fotografias.webp', alt:'Impressão de fotografias em vários tamanhos e molduras até A3', legenda:'Impressão de Fotografias' },
    { src:'img/galeria/impressao-polaroids.webp', alt:'Impressão de Polaroids em vários tamanhos', legenda:'Impressão de Polaroids' }
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
  document.querySelectorAll('body > header, body > main, body > footer, body > a, body > button').forEach(el => el.inert = true);
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
  document.querySelectorAll('[inert]').forEach(el => el.inert = false);
  if(lightboxImagem) lightboxImagem.removeAttribute('src');
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
  if(evento.key === 'Tab'){
    const controles = [...lightbox.querySelectorAll('button')].filter(el => !el.hidden && el.getClientRects().length);
    const primeiro = controles[0], ultimo = controles.at(-1);
    if(evento.shiftKey && document.activeElement === primeiro){evento.preventDefault();ultimo?.focus();}
    else if(!evento.shiftKey && document.activeElement === ultimo){evento.preventDefault();primeiro?.focus();}
  }
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
  const url = 'https://artbrother.com.br/';

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
    navigator.serviceWorker.register('./service-worker.js', {updateViaCache:'none'}).catch(error => console.warn('Não foi possível ativar o modo offline.', error));
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

// Atendimento: escolha entre os dois números, preservando a mensagem do produto.
const seletorWhatsApp = document.createElement('dialog');
seletorWhatsApp.className = 'whatsapp-dialog';
seletorWhatsApp.setAttribute('aria-labelledby','titulo-whatsapp');
seletorWhatsApp.innerHTML = `<button class="dialog-fechar" type="button" aria-label="Fechar escolha de atendimento">×</button><h2 id="titulo-whatsapp">Fale com nossas vendas</h2><p>Os dois números atendem orçamentos e encomendas. Escolha onde deseja conversar.</p><a class="whatsapp-opcao" data-numero="5531987167190" target="_blank" rel="noopener"><strong>Vendas 1</strong><span>(31) 98716-7190</span></a><a class="whatsapp-opcao" data-numero="5531985093019" target="_blank" rel="noopener"><strong>Vendas 2</strong><span>(31) 98509-3019</span></a>`;
document.body.appendChild(seletorWhatsApp);
seletorWhatsApp.querySelector('button').addEventListener('click',()=>seletorWhatsApp.close());
seletorWhatsApp.addEventListener('click',event=>{if(event.target===seletorWhatsApp){const r=seletorWhatsApp.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)seletorWhatsApp.close();}});
document.querySelectorAll('a[href^="https://wa.me/5531987167190"]:not([data-whatsapp-direto])').forEach(link=>{
 link.addEventListener('click',event=>{
  if(typeof seletorWhatsApp.showModal!=='function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
  event.preventDefault();
  const mensagem=new URL(link.href).searchParams.get('text') || 'Olá! Gostaria de um orçamento.';
  seletorWhatsApp.querySelectorAll('[data-numero]').forEach(opcao=>{opcao.href='https://wa.me/'+opcao.dataset.numero+'?text='+encodeURIComponent(mensagem);});
  seletorWhatsApp.showModal();
 });
});
function atualizarPausa(){if(!pausaCarrossel)return;pausaCarrossel.textContent=carrosselPausado?'Reproduzir carrossel':'Pausar carrossel';pausaCarrossel.setAttribute('aria-pressed',String(carrosselPausado));}
pausaCarrossel?.addEventListener('click',()=>{carrosselPausado=!carrosselPausado;atualizarPausa();iniciarCarrossel();});
const secaoCarrossel=document.querySelector('.carrossel-produtos');
secaoCarrossel?.addEventListener('mouseenter',()=>clearInterval(intervaloCarrossel));
secaoCarrossel?.addEventListener('mouseleave',iniciarCarrossel);
secaoCarrossel?.addEventListener('focusin',()=>clearInterval(intervaloCarrossel));
secaoCarrossel?.addEventListener('focusout',()=>setTimeout(iniciarCarrossel,0));
document.addEventListener('visibilitychange',iniciarCarrossel);
movimentoReduzido.addEventListener('change',()=>{carrosselPausado=movimentoReduzido.matches;atualizarPausa();iniciarCarrossel();});
atualizarPausa();
botaoTopo?.addEventListener('click',()=>window.scrollTo({top:0,behavior:movimentoReduzido.matches?'auto':'smooth'}));
