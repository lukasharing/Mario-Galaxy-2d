class Enemy extends Entity{

  constructor(_game, _x, _y, _w, _h){
    super(_game, _x, _y)
    super.rectangle(_w, _h);
    this.velocity = new Vector(0.01, 0.01);

    this.jump_factor = 0;
    this.jump_time = 0;
    this.jump_delay = 1e10;

  };

  damage(dealt_damage){

    this.life -= dealt_damage;
    if(this.life <= 0){
      // Something Happend

    }

  };

  draw(ctx){

    super.draw(ctx);
    
    // Draw Life
    let lratio = this.life / this.max_life;
    lratio = lratio * lratio * (3 - 2 * lratio);

    ctx.save();
      const c = mix(0, 255, lratio);
      ctx.fillStyle = `rgb(${255 - c}, ${c}, 0)`;
      ctx.beginPath();
      const w = mix(0, this.sprite.size.x, lratio);
      const h = this.sprite.size.y;
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.rotation);
      ctx.translate(-w>>1, -h);
      ctx.rect(0, 0, w, 10);
      ctx.fill();
    ctx.restore();

  };

  update(dt, game){
    super.update(dt, game);
    
    //this.damage(0.1);

  };

}
