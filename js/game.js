const MAX_ENTITIES = 20;
const MAX_FPS = 10.0;

// Vectors;
const VECTOR_L = new Vector(-1, 0);
const VECTOR_R = new Vector(1, 0);
const VECTOR_T = new Vector(0, -1);
const VECTOR_B = new Vector(0, 1);


class Game{
  constructor(){
    this.keys = new Array(256).fill(false);

    // Game size
    this.width = 0;
    this.height = 0;

    // Drawing Variables
    this.ctx = null;
    this.entities = new Array(MAX_ENTITIES); // Entity 0 = Player
    this.floor = new Array();

    // Time Variables
    this.time = 0;
    this.stop = null;
    this.last_tick = 0;

    this.DEBUG = false;
  };

  setKey(_key, _status){ this.keys[_key] = _status; };

  keycontroller(){
    if(this.entities[0].coordSystem[0] !== null){

      if(this.DEBUG){
        if(this.keys[37]){
          this.entities[0].velocity.add(VECTOR_L);
        }

        if(this.keys[39]){
          this.entities[0].velocity.subtract(VECTOR_L);
        }

        if(this.keys[38]){
          this.entities[0].velocity.add(VECTOR_T);
        }

        if(this.keys[40]){
          this.entities[0].velocity.subtract(VECTOR_T);
        }
      }else{
        if(this.keys[37]){
          this.entities[0].velocity.add(this.entities[0].coordSystem[0]);
        }

        if(this.keys[39]){
          this.entities[0].velocity.subtract(this.entities[0].coordSystem[0]);
        }

        if(this.keys[32]){
          this.entities[0].jump();
        }
      }
    }
  }

  update(delay){
    this.floor.forEach(e=>{ e.update(this.time); });

    for(let i = 0; i < delay; ++i){
      this.entities.forEach(e=>{ e.update(this.floor, this.time); });
    }
    this.last_tick += delay * MAX_FPS;
  };

  render(){
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.entities.forEach(e=>{ e.draw(ctx); });
    this.floor.forEach(e=>{ e.draw(ctx); });
  };

  play(time){
    ++this.time;
    this.stop = window.requestAnimationFrame((t)=>{ this.play(t); });
    const next_tick = this.last_tick + MAX_FPS;

    let penalty = 0;
    if(time > next_tick){
      penalty = Math.floor((time - next_tick) / MAX_FPS);
    }
    this.keycontroller();
    this.update(penalty);
    this.render();
  };

  init(){
    const canvas = document.getElementById("game");
    canvas.width = this.width = window.innerWidth;
    canvas.height = this.height = window.innerHeight;
    this.ctx = canvas.getContext("2d");

    const wm = this.width >> 1, hm = this.height >> 1;

    this.floor.push((new Shape(100, 300, 0, Math.PI / 4)).makeRegularPolygon(4, 50));
    this.floor.push((new Shape(400, 300, 0, 0)).makeRegularPolygon(5, 200));
    this.floor.push((new Shape(1000, 300, 0, 0)).makeRegularPolygon(16, 300));


    this.entities[0] = new Entity(0, hm, 10, 15);

    this.play(this.last_tick = performance.now());
  };

};
