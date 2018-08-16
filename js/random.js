class Random extends Entity{

  constructor(_x, _y, _w, _h){
    super(_x, _y, _w, _h);

    this.last_position = new Vector(_x, _y);
  }

  update(floor){
    let v = this.velocity;

    let rnd = Math.random();
    if(rnd < 0.1){
      v = v.subtract(this.coordSystem[0].scale(4));
    }

    let df = this.box.position.subtract(this.last_position).length;
    if(df <= 0.001 || rnd < 0.01){
      v = v.add(this.jump(30.0));
    }

    this.last_position = this.position;

    this.velocity = v;
    super.update(floor);
  }

}
