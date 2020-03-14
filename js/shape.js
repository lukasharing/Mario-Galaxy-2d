// Shapes should have at least 4 vertices to work properly.

class Shape{

  constructor(_x = 0.0, _y = 0.0){
    this.p = new Vector(_x, _y, 0.0);
    this.collision = null;
    this.normals = null;
    this.rotation = 0.0;
  };

  get position(){
    return this.p;
  };

  set position(p){
    this.p = p;
  };

  edges(){ return this.collision.map(e=>e.add(this.position)); };

  get mass(){ return this.collision[0].length; };

  draw(ctx){
    ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.beginPath();
      ctx.moveTo(this.collision[0].x, this.collision[0].y);
      for(let i = 1; i < this.collision.length; ++i){
        ctx.lineTo(this.collision[i].x, this.collision[i].y);
      }
      ctx.fillStyle = "#e6e6e6";
      ctx.closePath();
      ctx.fill();
    ctx.restore();
  };

  rectangle(_w, _h){
    this.collision = new Array(4);
    this.collision[0] = new Vector(+_w, +_h);
    this.collision[1] = new Vector(-_w, +_h);
    this.collision[2] = new Vector(-_w, -_h);
    this.collision[3] = new Vector(+_w, -_h);

    this.generate_normals();
    return this;
  };

  generate_normals(){
    let edges = this.collision;
    this.normals = new Array(edges.length);
    for(let i = 0; i < edges.length - 1; ++i){
      this.normals[i] = edges[i].subtract(edges[i + 1]).perpendicular().normalize();
    }
    this.normals[edges.length - 1] = edges[edges.length - 1].subtract(edges[0]).perpendicular().normalize();
  };

  regular_polygon(_n, _l){
    let angle = 2 * Math.PI / _n;
    this.collision = new Array(_n);
    for(let i = 0; i < _n; ++i){
      let theta = angle * i;
      this.collision[i] = new Vector(Math.cos(theta) * _l, Math.sin(theta) * _l);
    }
    this.generate_normals();
    return this;
  };

  rotate(angle){
    this.rotation = positive_radians(this.rotation + angle);

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

  intersect_shapes(shapes){
    let repulsive_forces = new Array();
    shapes.forEach(shape => {
      let v1 = this.edges();
      let v2 = shape.edges();

      let axies = [...this.normals, ...shape.normals];

      let minimum_penetration = new Array();
      for(let i = 0; i < axies.length; ++i){
        let pj1 = new Array(v1.length), pj2 = new Array(v2.length);
        for(let j = 0; j < v1.length; ++j){
          pj1[j] = axies[i].dot(v1[j]);
        }
        for(let j = 0; j < v2.length; ++j){
          pj2[j] = axies[i].dot(v2[j]);
        }

        let pj1min = Math.min(...pj1), pj1max = Math.max(...pj1);
        let pj2min = Math.min(...pj2), pj2max = Math.max(...pj2);
        // Check if shadow overlaps
        if(pj1min <= pj2max && pj2min <= pj1max){
          let penetration = pj1max > pj2max ? (pj2max - pj1min) : (pj2min - pj1max);
          minimum_penetration.push(axies[i].scale(penetration));
        }
      }

      if(minimum_penetration.length == axies.length){
        minimum_penetration.sort((a, b) => a.length - b.length);
        // Add to force to the repulsive force list.
        repulsive_forces.push({
          body: shape,
          repulsive_force: minimum_penetration[0]
        });
      }
    });
    return repulsive_forces;
  };

};
