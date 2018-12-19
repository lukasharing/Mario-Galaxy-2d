class Floor extends Shape{

  constructor(_x, _y, _vangular, _parent){
    super(_x, _y);
    this.parent = _parent;

    this.angular_velocity = _vangular;
    // TODO: Texture.
  }

  update(){
    if(this.angular_velocity != 0.0){
      this.shape.rotate(this.angular_velocity);
    }
  };
}
