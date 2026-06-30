const itens = document.querySelectorAll('.reveal');

function revelarAoRolar(){
  const alturaTela = window.innerHeight * 0.88;

  itens.forEach(item => {
    const topoItem = item.getBoundingClientRect().top;
    if(topoItem < alturaTela){
      item.classList.add('ativo');
    }
  });
}

window.addEventListener('scroll', revelarAoRolar);
window.addEventListener('load', revelarAoRolar);
