const CAMERA_ROTATION_SAMPLES = 10;

class Camera{
  constructor(_game){
    this.game = _game;
    this.lookingAt;
    this.position;

    // Rotation
    this.rotation_speed = 2.;
    this.rotation_time = 0.0;
    this.from_rotation = 0.0;
    this.current_rotation = 0.0;
    this.camera_hsize = new Vector();
  };

  resize(){
    this.camera_hsize = new Vector(this.game.width >> 1, this.game.height >> 1);
  };

  set rotation(a){ this.current_rotation = a; };
  get rotation(){ return this.current_rotation; };

  lookAt(_entity){
    this.lookingAt = _entity;
    this.position = this.camera_hsize;
    this.rotation = _entity.rotation;
  };

  update(dt){

    let from = this.from_rotation;
    let to = this.lookingAt.rotation;
    // Check If there is a shortes path (from the other side)
    const dr = from - to;
    if(Math.abs(dr) > PI){
      to += Math.sign(dr) * TAU;
    }

    if(Math.abs(dr) > EPSILON){
      this.rotation_time += 0.1;

      let speed = Math.abs(from - to) < 0.1 ? this.rotation_time : this.rotation_speed;

      let t = this.rotation_time / speed;

      // Camera Interpolation
      t = t * t * (3 - 2 * t);

      this.current_rotation = positive_radians(mix(from, to, t));

      if(t >= 1.0){
        this.from_rotation = this.current_rotation;
        this.rotation_time = 0.0;
      }
    }

    this.position = this.camera_hsize.subtract(this.lookingAt.position);
 
  };

  draw_gui(ctx){

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.font = "20px Verdana";
    ctx.fillText(`${this.game.fps.toFixed(1)}fps`, 10, 30);

  };

}
