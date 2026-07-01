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
