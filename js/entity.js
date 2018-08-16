// ENTITIES SHOULD HAVE ALL THE SAME PATTERN
const SPRITE = {  };

class Entity{

  constructor(_x, _y, _w, _h){
    this.collision = (new Shape(_x, _y, 0.0)).makeRectangle(_w, _h);
    this.velocity = new Vector();

    // Gfx
    this.sprite = new Vector(16, 26);
    this.gfx_id = 0;
    this.gfx_frame = 0;

    // Physics
    this.coordSystem = [new Vector(0.0, 0.0, 0.0), new Vector(0.0, 0.0, 0.0)];
    this.isJumping = false;
  };

  get position(){ return this.collision.position; };

  jump(factor){
    if(this.isJumping < 0){
      this.isJumping = 10;
      return this.coordSystem[1].scale(factor);
    }
    return new Vector();
  }

  draw(game){
    game.ctx.save();
      game.ctx.translate(this.position.x, this.position.y);
      game.ctx.rotate(this.collision.rotation);
      game.ctx.drawImage(game.get_gfx(0),
                         this.gfx_id * this.sprite.x,
                         this.gfx_id * this.sprite.y,
                         this.sprite.x,
                         this.sprite.y,
                         -(this.sprite.x >> 1),
                         -(this.sprite.y >> 1),
                         this.sprite.x,
                         this.sprite.y
                       );
    game.ctx.restore();
  };

  intersect(floor){
    let v1 = this.collision.getEdges();
    let v2 = floor.getEdges();

    let axies = [...this.collision.normals, ...floor.normals];
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
      this.collision.position = this.collision.position.add(axies[idx].scale(Math.abs(min_distance)));
    }
    return total_shadow;
  };

  // TODO: GET RID OF MODULUS INSIDE FOR LOOP
  nearest_side(floor){
    let v2 = floor.getEdges();
    let k = -1, last = 1e10;
    for(let i = 0; i < v2.length; ++i){
      let ps = new Vector(this.position.x - v2[i].x, this.position.y - v2[i].y);
      let nr = floor.normals[i];
      /*
        let normal be n
        let vertex be v
        let position be p
        n . (p - v) = ||n||||p - v||sin(alpha),
        sin(aplha) >= 0 => 0 <= aplha <= PI / 2
        because sin(alpha) >= 0 => n . (p - v) / (||n||||p - v||) >= 0
        ||n|| = 1
        || p - v || > 0
        then it can be optimized => n . (p - v) >= 0
      */
      let ds = nr.dot(ps) < 0.0 ? 1e10 : getDistanceSegment(v2[i], v2[(i + 1) % v2.length], this.collision.position);
      if(ds < last){
        k = i;
      }
    }
    return k;
  }

  update(floor){
    let maxForce = 0.0, object = floor[0], num_in = 0;
    let velocity = this.velocity;
    this.collision.position = this.collision.position.add(velocity);

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

    let friction = 0.95;
    if(touching_floor){
      --this.isJumping;
      friction = 0.80;
    }

    // Gravity
    velocity = velocity.subtract(this.coordSystem[1]);

    if(new_coord >= 0){
      // If we find
      this.coordSystem[0] = object.normals[new_coord].perpendicular().scale(-1);
      this.coordSystem[1] = object.normals[new_coord];

      if(touching_floor && floor.angular_velocity != 0.0){
        // Pushing to rotation.
        let vb = object.collision[new_coord];
        let vc = object.collision[(new_coord + 1) % object.collision.length];
        let cs = vc.subtract(vb).normalize().scale(-Math.sin(object.angular_velocity) * vb.length);
        this.collision.position = this.collision.position.add(cs);
      }
    }else{
      // If we dont find any near segment.
      const vy = new Vector(this.position.x - object.position.x, this.position.y - object.position.y).normalize();
      const vx = vy.perpendicular().scale(-1);
      this.coordSystem[0] = vx;
      this.coordSystem[1] = vy;
    }

    // Set the new Velocity after friction.
    this.velocity = velocity.scale(friction);

    // Rotation Angle
    let angle = Math.atan2(this.coordSystem[1].x, -this.coordSystem[1].y);
    let df = angle - this.collision.rotation;
    if(df != 0.0){
      this.collision.rotate(df);
    }
  };

}
