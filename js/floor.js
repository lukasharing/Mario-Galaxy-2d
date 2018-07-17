class Floor{

  constructor(_x = 0.0, _y = 0.0, _w = 100, _h = 100, _t = 0.0, _r = false){
    this.position = new Vector(_x, _y, 0.0);
    this.collision = new Vector(_w, _h, 0);
    this.theta = _t;
    this.is = false;
    this.rotate = _r;
  };

  get mass(){ return this.collision.x * this.collision.y; };

  draw(ctx){
    ctx.save();
      ctx.beginPath();

      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.theta);
      ctx.translate(-this.collision.x, -this.collision.y);


      ctx.rect(0, 0, 2 * this.collision.x, 2 * this.collision.y);
      ctx.strokeStyle = this.is ? "red" : "green";
      ctx.stroke();
    ctx.restore();
  };

  update(time){
    this.theta = this.rotate * (time * 0.01);
  };

}
