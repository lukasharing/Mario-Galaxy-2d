window.onload = ()=>{

  const game = new Game();
  game.init();

  let timer = 0;
  window.addEventListener("keydown", e=>{
    game.pressKey(e.keyCode);
  });
  window.addEventListener("keyup", e=>game.unpressKey(e.keyCode));
  window.addEventListener("click", e=>{
    game.entities[0].collision.position = game.entities[0].position.subtract(game.entities[0].coordSystem[1]);
  });
}
