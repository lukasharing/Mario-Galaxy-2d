window.onload = ()=>{

  const game = new Game();
  game.init();

  ["keyup", "keydown"].forEach(_e=>window.addEventListener(_e, e=>game.setKey(e.keyCode, _e=="keydown")));
}
