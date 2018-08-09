window.onload = ()=>{

  const game = new Game();
  game.init();

  let timer = 0;
  window.addEventListener("keydown", e=>game.pressKey(e.keyCode));
  window.addEventListener("keyup", e=>game.unpressKey(e.keyCode));

}
