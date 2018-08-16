// Shapes should have at least 4 vertices to work properly.

class Shape{

  constructor(_x = 0.0, _y = 0.0, _r = 0.0){
    this.position = new Vector(_x, _y, 0.0);

    this.collision = null;
    this.normals = null;

    this.angular_velocity = _r;
    this.rotation = 0.0;
  };

  getEdges(){ return this.collision.map(e=>e.add(this.position)); };

  get mass(){ return this.collision[0].length; };

  draw(game){
    let edges = this.getEdges();
    game.ctx.beginPath();
    game.ctx.moveTo(edges[0].x, edges[0].y);
    for(let i = 1; i < edges.length; ++i){
      game.ctx.lineTo(edges[i].x, edges[i].y);
    }
    game.ctx.fillStyle = "#e6e6e6";
    game.ctx.closePath();
    game.ctx.fill();
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

  calculateNormals(){
    let edges = this.collision;
    this.normals = new Array(edges.length);
    for(let i = 0; i < edges.length - 1; ++i){
      this.normals[i] = edges[i].subtract(edges[i + 1]).perpendicular().normalize();
    }
    this.normals[edges.length - 1] = edges[edges.length - 1].subtract(edges[0]).perpendicular().normalize();
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

  rotate(angle){
    this.rotation += angle;
    let cs = Math.cos(angle), sn = Math.sin(angle);
    for(let i = 0; i < this.collision.length; ++i){
      let mrx = this.collision[i].x * cs - this.collision[i].y * sn;
      let mry = this.collision[i].x * sn + this.collision[i].y * cs;
      this.collision[i].x = mrx;
      this.collision[i].y = mry;
      let nrx = this.normals[i].x * cs - this.normals[i].y * sn;
      let nry = this.normals[i].x * sn + this.normals[i].y * cs;
      this.normals[i].x = nrx;
      this.normals[i].y = nry;
    }
    return this;
  };

  update(time){
    if(this.angular_velocity != 0.0){
      this.rotate(this.angular_velocity);
    }
  };

}
