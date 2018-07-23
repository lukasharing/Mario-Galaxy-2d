class Shape{

  constructor(_x = 0.0, _y = 0.0, _t = 0.0, _a = 0.0){
    this.position = new Vector(_x, _y, 0.0);

    this.collision = null;
    this.normals = null;

    this.theta = _a;
    this.is = false;
  };

  makeRectangle(_w, _h){
    this.collision = new Array(4);
    this.collision[0] = new Vector(+_w, +_h);
    this.collision[1] = new Vector(-_w, +_h);
    this.collision[2] = new Vector(-_w, -_h);
    this.collision[3] = new Vector(+_w, -_h);

    this.calculateNormals();
    return this;
  };

  getEdgesVector(){
    let cs = Math.cos(this.theta), sn = Math.sin(this.theta);
    let vectors = new Array(this.collision.length);
    for(let i = 0; i < this.collision.length; ++i){
      let mrx = this.collision[i].x * cs - this.collision[i].y * sn;
      let mry = this.collision[i].x * sn + this.collision[i].y * cs;
      vectors[i] = new Vector(this.position.x + mrx, this.position.y + mry, 0.0);
    }
    return vectors;
  }

  calculateNormals(){
    let edges = this.getEdgesVector();
    this.normals = new Array(edges.length);
    for(let i = 0; i < edges.length - 1; ++i){
      this.normals[i] = edges[i].clone().subtract(edges[i + 1]).perpendicular().normalize();
    }
    this.normals[edges.length - 1] = edges[edges.length - 1].clone().subtract(edges[0]).perpendicular().normalize();
  };

  makeRegularPolygon(_n, _l){
    let angle = 2 * Math.PI / _n;
    this.collision = new Array(_n);

    for(let i = 0; i < _n; ++i){
      let theta = angle * i;
      this.collision[i] = new Vector(Math.cos(theta) * _l, Math.sin(theta) * _l);
    }
    this.calculateNormals();
    return this;
  };

  get mass(){ return this.collision[0].length; };

  draw(ctx){
    ctx.save();
      ctx.beginPath();

      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.theta);
      ctx.translate(-this.collision.x, -this.collision.y);

      ctx.moveTo(this.collision[0].x, this.collision[0].y);
      for(let i = 1; i < this.collision.length; ++i){
        ctx.lineTo(this.collision[i].x, this.collision[i].y);
      }
      ctx.strokeStyle = this.is ? "red" : "green";
      ctx.closePath();
      ctx.stroke();
    ctx.restore();
  };

  update(time){
    //this.theta = (time * 0.01);
  };

}
