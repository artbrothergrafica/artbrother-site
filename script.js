const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');
const topoBtn = document.querySelector('.topo-btn');

if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('ativo');
  });

  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => menu.classList.remove('ativo'));
  });
}

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll('.animar').forEach(el => observador.observe(el));

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    topoBtn.classList.add('mostrar');
  } else {
    topoBtn.classList.remove('mostrar');
  }
});

if (topoBtn) {
  topoBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
