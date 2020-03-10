const CAMERA_ROTATION_SAMPLES = 10;

class Camera{
  constructor(_game){
    this.game = _game;
    this.lookingAt;
    this.position;
    this.rotation = 0.0;

    this.camera_hsize = new Vector(_game.width >> 1, _game.height >> 1);
  };

  lookAt(_entity){
    this.lookingAt = _entity;
    this.position = this.camera_hsize;
    this.rotation = _entity.rotation;
  };

  update(){
    this.position = this.camera_hsize.subtract(this.lookingAt.position);

    // Shortest difference between two angles (this.lookingAt.collision.rotation is negative)
    const da = this.lookingAt.rotation + this.rotation;
    const step = da / CAMERA_ROTATION_SAMPLES;
    console.log(this.lookingAt.rotation, this.rotation);
    
    //this.rotation = (this.rotation - step);
  };

}
