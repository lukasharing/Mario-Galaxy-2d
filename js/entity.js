class Entity{

  constructor(_x, _y, _w, _h){
    this.box = (new Shape(_x, _y, 0.0, 0.0)).makeRectangle(_w, _h);
    this.velocity = new Vector();

    this.k = new Vector();

    this.coordSystem = [new Vector(0.0, 0.0, 0.0), new Vector(0.0, 0.0, 0.0)];
    this.isJumping = false;
  };

  get position(){ return this.box.position; };

  jump(){
    if(this.isJumping < 0){
      this.isJumping = 10;
      return this.velocity.add(this.coordSystem[1].scale(30.0));
    }
    return this.velocity;
  }

  draw(ctx){
    this.box.draw(ctx);
    this.velocity.draw(ctx, this.position.x, this.position.y);
  };

  intersect(floor){
    let v1 = this.box.getEdges();
    let v2 = floor.getEdges();

    let axies = [...this.box.normals, ...floor.normals];
    let total_shadow = 0;
    let idx = -1, min_distance = 1000000;
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

      if(pj1min <= pj2max && pj2min <= pj1max){
        ++total_shadow;
        let distance = (pj2min < pj1min) ? (pj1min - pj2max) : (pj1max - pj2min);
        if(distance * distance < min_distance * min_distance && Math.abs(distance) > distance){
          idx = i;
          min_distance = distance;
        }
      }
    }
    if(total_shadow == axies.length){
      this.box.position = this.box.position.add(axies[idx].scale(Math.abs(min_distance)));
    }
    return total_shadow;
  };

  nearest_side(floor){
    let v2 = floor.getEdges();
    let dl = new Array(v2.length);
    for(let i = 0; i < v2.length; ++i){
      let ps = new Vector(this.position.x - v2[i].x, this.position.y - v2[i].y);
      let nr = floor.normals[i];
      let ap = nr.dot(ps) / ps.length;
      dl[i] = ap < 0.0 ? 1e10 : getDistanceSegment(v2[i], v2[(i + 1) % v2.length], this.box.position);
    }

    let k = 0;
    for(let i = 1; i < dl.length; ++i){
      if(dl[i] < dl[k]){
        k = i;
      }
    }
    if(dl[k] >= 1e10){ return []; }
    return [floor.normals[k].perpendicular(), floor.normals[k].scale(-1)];
  }

  update(floor){
    let maxForce = 0.0, object = floor[0], num_in = 0;
    let velocity = this.velocity;
    this.box.position = this.box.position.add(velocity);

    let touching_floor = false;
    floor.forEach((e, i)=>{
      e.is = false;

      // Finding the most "attractive" body.
      const dx = e.position.x - this.position.x;
      const dy = e.position.y - this.position.y;
      const ds = dx * dx + dy * dy;
      const forceG = e.mass / (ds * ds);

      let num_intersection = this.intersect(e);
      if(forceG > maxForce && num_intersection > 0){ // vc = -G * m1 / d^2
        maxForce = forceG;
        object = e;
      }
      touching_floor |= num_intersection == (e.collision.length + 4);
    });
    // Changing Coord System
    let new_coord = this.nearest_side(object);
    if(new_coord.length < 2){
      // If we dont find any near segment.
      const vy = new Vector(this.position.x - object.position.x, this.position.y - object.position.y).normalize();
      const vx = vy.perpendicular().scale(-1);
      this.coordSystem[0] = vx;
      this.coordSystem[1] = vy;
    }else{
      this.coordSystem = new_coord;
    }

    let friction = 0.95;
    if(touching_floor){
      --this.isJumping;
      friction = 0.80;

      if(object.angular_velocity != 0.0){
        // Pushing to rotation.
        let vb = this.coordSystem[1];
        let vr = vb.rotate(object.angular_velocity);
        let prp = vr.subtract(vb);
        this.box.position = this.box.position.add(prp.scale(300));

      }
    }

    // Gravity
    //velocity = velocity.subtract(this.coordSystem[1]);

    // Set the new Velocity after friction.
    this.velocity = velocity.scale(friction);

    // Rotation Angle
    let angle = Math.atan2(this.coordSystem[1].x, -this.coordSystem[1].y);
    this.box.rotate(angle - this.box.rotation);
  };

}
