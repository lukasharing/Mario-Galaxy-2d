class Entity{

  constructor(_x, _y, _w, _h){
    this.box = (new Shape(_x, _y, 0.0, 0.0)).makeRectangle(_w, _h);
    this.velocity = new Vector();


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
    for(let i = 0; i < v2.length - 1; ++i){
      dl[i] = getDistanceSegment(v2[i], v2[i + 1], this.box.position);
    }
    dl[v2.length - 1] = getDistanceSegment(v2[v2.length - 1], v2[0], this.box.position);

    let k = 0;
    for(let i = 1; i < dl.length; ++i){
      if(dl[i].ds < dl[k].ds){
        k = i;
      }
    }
    let x = dl[k].vc.normalize().scale(-1);
    return [x, x.perpendicular()];
  }

  update(floor){
    let maxForce = 0.0, object = floor[0], num_in = 0;
    let velocity = this.velocity;
    this.box.position = this.box.position.add(velocity);

    let touching_floor = false;
    floor.forEach((e, i)=>{
      e.is = false;
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
    this.coordSystem = this.nearest_side(object);
    let friction = 0.90;
    if(touching_floor){
      --this.isJumping;
      friction = 0.80;

      if(object.angular_velocity != 0.0){
        // Pushing to rotation.
        let v = this.position.subtract(object.position);
        let w = v.subtract(v.rotate(object.angular_velocity));
        this.box.position = this.box.position.subtract(w);
      }
    }
    velocity = velocity.subtract(this.coordSystem[1]);
    velocity = velocity.scale(friction);
    this.velocity = velocity;

    // Rotation Angle

    let angle = Math.atan2(this.coordSystem[1].x, -this.coordSystem[1].y);
    this.box.rotate(angle - this.box.rotation);

    // Gravity
    //if(Math.abs(this.theta - angle) < 0.5){
    //}
  };

}
