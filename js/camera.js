const CAMERA_ROTATION_SAMPLES = 10;

class Camera{
  constructor(_game){
    this.game = _game;

    // Transition
    this.transformation_speed = 2.;

    // Position
    this.lookingAt = null;
    this.from_position = new Vector();
    this.position = new Vector();
    this.translation_time = 0.0;

    // Rotation
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
    this.position = _entity.position;
    this.rotation = _entity.rotation;
  };

  // TODO Vec3(pos, angle)
  update(dt){

    // Traslate Camera
    let dv = this.lookingAt.position.subtract(this.from_position);
    let dvl = dv.length;
    if(dvl > EPSILON){
      this.translation_time += 0.1;
      let speed = dvl < 10.0 ? this.translation_time : this.transformation_speed;

      let t = this.translation_time / speed;
      // Camera Interpolation
      //t = t * t * (3 - 2 * t);

      this.position = this.from_position.mix(this.lookingAt.position, t);
    
      if(t >= 1.0){
        this.from_position = this.position;
        this.translation_time = 0.0;
      }
    }

    // Rotate Camerad
    let from = this.from_rotation;
    let to = this.lookingAt.rotation;
    // Check If there is a shortes path (from the other side)
    const dr = from - to;
    if(Math.abs(dr) > PI){
      to += Math.sign(dr) * TAU;
    }

    if(Math.abs(dr) > EPSILON){
      this.rotation_time += 0.1;

      let speed = Math.abs(from - to) < 0.1 ? this.rotation_time : this.transformation_speed;

      let t = this.rotation_time / speed;

      // Camera Interpolation
      t = t * t * (3 - 2 * t);

      this.current_rotation = positive_radians(mix(from, to, t));

      if(t >= 1.0){
        this.from_rotation = this.current_rotation;
        this.rotation_time = 0.0;
      }
    }
 
  };

  draw_gui(ctx){

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.font = "20px Verdana";
    ctx.fillText(`${this.game.fps.toFixed(1)}fps`, 10, 30);

  };

}
