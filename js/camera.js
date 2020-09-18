const CAMERA_ROTATION_SAMPLES = 10;

class Camera{
  constructor(_game){
    this.game = _game;

    this.lookingAt = null;

    this.position = new Vector();
    this.velocity = new Vector();

    this.rotation = 0;
    this.rotation_velocity = 0.0;
    
    this.camera_hsize = new Vector();
  };

  resize(){
    this.camera_hsize = new Vector(this.game.width >> 1, this.game.height >> 1);
  };

  lookAt(_entity){
    this.lookingAt = _entity;
  };

  update(dt){

    if(this.lookingAt !== null){
      this.velocity = this.lookingAt.position.subtract(this.position);
      let dr = this.lookingAt.rotation - this.rotation;
      //console.log(dr);
      if(Math.abs(dr) >= Math.PI){
        dr = dr - 2 * Math.PI;
      }
      this.rotation_velocity = dr * 0.80;
    }

    this.position = this.position.add(this.velocity.scale(dt));
    this.velocity = this.velocity.scale(0.98).scale(dt);
    this.rotation += this.rotation_velocity * dt;
    this.rotation_velocity = this.rotation_velocity * 0.98 * dt;
  };

  draw_gui(ctx){

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.font = "20px Verdana";
    ctx.fillText(`${this.game.fps.toFixed(1)}fps`, 10, 30);

  };

}
