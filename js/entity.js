class Entity{

  constructor(x, y, w, h){
    this.position = new Vector(x, y, 0.0);
    this.velocity = new Vector();
    this.collision = new Vector(w, h, 0);
    this.theta = 0;


    this.coordSystem = new Array(2);
    this.isJumping = false;
  };

  jump(){
    if(!this.isJumping){
      this.isJumping = true;
      this.velocity.add(this.coordSystem[1].clone().scale(30.0));
    }
  }

  draw(ctx){

    ctx.save();
      ctx.beginPath();

      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.theta);
      ctx.translate(-this.collision.x, -this.collision.y);

      ctx.rect(0, 0, this.collision.x * 0.5, this.collision.y * 0.5);
      ctx.rect(this.collision.x, 0, this.collision.x * 0.5, this.collision.y * 0.5);

      ctx.rect(0, 0, 2 * this.collision.x, 2 * this.collision.y);
      ctx.strokeStyle = "red";
      ctx.stroke();
    ctx.restore();
  };

  intersect(floor){
    // Vector 1
    let v1 = getEdgesVector(this);
    let v2 = getEdgesVector(floor);

    let axies = getCoordSystem(v2, v1);

    let total_shadow = 0;
    let idx = -1, minforce = 1000000;
    for(let i = 0; i < axies.length; ++i){
      let pj1 = new Array(4);
      let pj2 = new Array(4);
      for(let j = 0; j < 4; ++j){
        pj1[j] = axies[i].dot(v2[j]);
        pj2[j] = axies[i].dot(v1[j]);
      }
      let pj1min = Math.min(...pj1), pj1max = Math.max(...pj1);
      let pj2min = Math.min(...pj2), pj2max = Math.max(...pj2);

      if(pj2min <= pj1max && pj2max >= pj1min){
        ++total_shadow;
        let force = (pj2min < pj1min) ? (pj1min - pj2max) : (pj1max - pj2min);
        if(force * force < minforce * minforce){
          idx = i;
          minforce = force;
        }
      }
    }
    if(total_shadow >> 2){ // iff t = 4 <=> t >> 2 == 1 cuz t <= 4
      floor.is = true;
      this.position.add(axies[idx].clone().scale(minforce));
    }
    return total_shadow;
  };

  nearest_side(floor){
    let v2 = getEdgesVector(floor);
    let dl = [
      getDistanceSegment(v2[0], v2[1], this.position), // Left
      getDistanceSegment(v2[3], v2[2], this.position), // Right
      getDistanceSegment(v2[1], v2[3], this.position), // Bottom
      getDistanceSegment(v2[2], v2[0], this.position), // Top
    ];
    let bg = 0;
    for(let i = 1; i < dl.length; ++i){
      if(dl[bg].ds > dl[i].ds){
        bg = i;
      }
    }
    let base_vector = dl[bg].vc.normalize();
    return [base_vector, base_vector.perpendicular()];
  }

  update(floor){
    this.position.add(this.velocity);

    let maxForce = 0.0, object = floor[0], num_in = 0;

    let touching_floor = false;
    floor.forEach((e, i)=>{
      const dx = e.position.x - this.position.x;
      const dy = e.position.y - this.position.y;
      const ds = dx * dx + dy * dy;
      const forceG = e.mass / (ds * ds);

      let num_intersection = this.intersect(e);
      if(forceG > maxForce && num_intersection > 0){ // vc = -G * m1 / d^2
        maxForce = forceG;
        object = e;
      }

      touching_floor |= num_intersection >> 2;
      e.is = false;
    });

    this.coordSystem = this.nearest_side(object);

    // angle
    let angle = Math.atan2(this.coordSystem[1].x, -this.coordSystem[1].y);
    this.theta += shortestAngle(this.theta, angle) * 0.10;
    this.velocity.subtract(this.coordSystem[1].clone());

    let friction = 0.93;
    if(touching_floor){
      this.isJumping = false;
      friction = 0.80;
    }

    this.velocity.scale(friction);

    object.is = true;
  };

}
