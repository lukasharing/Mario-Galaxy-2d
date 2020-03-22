const CAMERA_ROTATION_SAMPLES = 10;

class Camera{
  constructor(_game){
    this.game = _game;

    this.lookingAt = null;

    // Transformation Vec3 ( Position[x,y] , Rotation )
    this.from_transformation = new Vector();
    this.transformation = new Vector();
    this.transformation_speed = 2.5;
    this.transformation_time = 0.0;
    
    this.camera_hsize = new Vector();
  };

  resize(){
    this.camera_hsize = new Vector(this.game.width >> 1, this.game.height >> 1);
  };

  get position(){ return this.transformation.xy; };
  get rotation(){ return this.transformation.z; };

  lookAt(_entity){
    this.lookingAt = _entity;
    this.transformation = new Vector(_entity.position.x, _entity.position.y, _entity.rotation);
  };

  update(dt){

    const ctransformation = new Vector(this.lookingAt.position.x, this.lookingAt.position.y, this.lookingAt.rotation);
    const dtransformation = ctransformation.subtract(this.from_transformation);
    
    // Check If there is a shortes path (from the other side)
    if(Math.abs(dtransformation.z) > PI){
      dtransformation.z -= Math.sign(dtransformation.z) * TAU;
    }

    let dvl = dtransformation.length;
    if(dvl > EPSILON){
      this.transformation_time += 0.1;

      let speed = dvl < 1.0 ? this.transformation_time : this.transformation_speed;

      let t = this.transformation_time / speed;
      // Camera Interpolation
      t = t * t * (3 - 2 * t);

      this.transformation = this.from_transformation.add(dtransformation.scale(t));
    
      if(t >= 1.0){
        this.from_transformation = this.transformation;
        this.transformation_time = 0.0;
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
