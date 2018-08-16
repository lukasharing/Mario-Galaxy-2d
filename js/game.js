const MAX_ENTITIES = 128;
const MAX_GFXS = 256;
const MAX_FPS = 10.0;

// Vectors;
const VECTOR_L = new Vector(-1, 0);
const VECTOR_R = new Vector(1, 0);
const VECTOR_T = new Vector(0, -1);
const VECTOR_B = new Vector(0, 1);


class Game{
  constructor(){
    this.keys = new Array(256).fill(0);

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

    // Gfxs
    this.total_gfx = 0;
    this.cache_gfx = new Array(MAX_GFXS);

    this.DEBUG = false;
  };

  // "CACHE" functions
  load_gfx(path){
    return new Promise((resolve, reject) => {
      const gfx = new Image();
      gfx.onload = ()=>{
        this.cache_gfx[this.total_gfx++] = gfx;
        resolve();
      };

      gfx.onerror = ()=>{
        reject();
      };
      gfx.src = path;
    });
  };

  get_gfx(id){ return this.cache_gfx[id]; };

  pressKey(_key){ ++this.keys[_key]; };
  unpressKey(_key){ this.keys[_key] = 0; };

  keycontroller(){
    if(this.entities[0].coordSystem[0] !== null){

      let v = this.entities[0].velocity;
      if(this.DEBUG){
        if(this.keys[37] > 0){
          v = v.add(VECTOR_L);
        }

        if(this.keys[39] > 0){
          v = v.subtract(VECTOR_L);
        }

        if(this.keys[38] > 0){
          v = v.add(VECTOR_T);
        }

        if(this.keys[40] > 0){
          v = v.subtract(VECTOR_T);
        }
      }else{
        if(this.keys[37] > 0){
          ++this.keys[37];
          v = v.add(this.entities[0].coordSystem[0].scale(0.6));
        }

        if(this.keys[39] > 0){
          ++this.keys[39];
          v = v.subtract(this.entities[0].coordSystem[0].scale(0.6));
        }

        if(this.keys[32] > 0){
          ++this.keys[32];
          v = v.add(this.entities[0].jump(20.0));
        }
      }
      this.entities[0].velocity = v;
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
    //this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.floor.forEach(e=>{ e.draw(this); });
    this.entities.forEach(e=>{ e.draw(this); });
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

    /*this.floor.push(
      //new Shape(100, 300, 0.01).makeRegularPolygon(4, 100).rotate(Math.PI / 2),
      new Shape(400, 300, 0.0).makeRegularPolygon(5, 200),
      new Shape(this.width / 2, this.height / 2, 0.0).makeRegularPolygon(8, 300)
    );*/

    // Player
    this.entities[0] = new Entity(0, hm, 10, 15);

    let total = 2;
    for(let i = 0; i < total; ++i){
      let d = Math.PI * 2 / total * i;
      let dx = this.width / 2 + Math.cos(d) * 200;
      let dy = this.height / 2 + Math.sin(d) * 200;
      this.floor.push(new Shape(dx, dy, 0.01).makeRegularPolygon((i>>1) + 4, 150));
    }

    Promise.all([
      this.load_gfx("./img/player.png")
    ]).then(e=>{
      this.play(this.last_tick = performance.now());
    });
  };

};
