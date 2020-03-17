

window.onload = ()=>{

  game.init();

  let timer = 0;
  window.addEventListener("keydown", e=>{
    game.key_press(e.keyCode);
  });
  window.addEventListener("keyup", e=>game.key_unpress(e.keyCode));
  window.addEventListener("click", e=>{
    game.entities[0].collision.position = game.entities[0].position.subtract(game.entities[0].coordSystem[1]);
  });
  window.addEventListener("resize", e=>game.resize());
  window.addEventListener("touchstart", e=>game.touch_start(e.targetTouches));
  window.addEventListener("touchmove", e=>game.touch_move(e.targetTouches));
  window.addEventListener("touchend", e=>game.touch_end(e.targetTouches));
}
