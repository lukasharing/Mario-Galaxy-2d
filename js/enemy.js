class Enemy extends Entity{

  constructor(_x, _y, _w, _h, _damage){
    super(_x, _y,)
    super.rectangle(_w, _h);
    this.velocity = new Vector(0.01, 0.01);
    this.damage = _damage;

    this.life = 1e10;
    this.healing_time = 0;
    
    this.attack_queue = [];
    this.attack_time = 0;
    this.attack_delay = 1e10;

    this.jump_factor = 0;
    this.jump_time = 0;
    this.jump_delay = 1e10;

  };

  attack(dt){
    this.attack_time += 0.1; // dt
    if(this.attack.length > 0 && this.attack_time > this.attack_delay){
      this.attack_time = 0;
      this.attack.pop()();
    }
  };


  update(dt, game){
    super.update(dt, game);

  };

}
