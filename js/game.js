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

    // Game
    this.canvas = null;
    this.width = 0;
    this.height = 0;

    // Camera
    this.camera;

    // Drawing Variables
    this.ctx = null;
    this.entities = new Array(MAX_ENTITIES); // Entity 0 = Player
    this.sprites = {};
    this.floor = new Array();

    // Time Variables
    this.stop = null;
    this.last_frame = 0;
    this.last_time = 0;
    this.frames = 0;
    this.max_frames = 1000 / 60;
  };

  get_gfx(id){ return this.cache_gfx[id]; };

  pressKey(_key){ ++this.keys[_key]; };
  unpressKey(_key){ this.keys[_key] = 0; };

  keycontroller(){
    if(this.entities[0].coordSystem[0] !== null){
      if(this.keys[37] > 0){ // Left
        ++this.keys[37];
        this.entities[0].move_left(1.0);
      }

      if(this.keys[39] > 0){
        ++this.keys[39];
        this.entities[0].move_right(1.0);
      }

      if(this.keys[38] > 0){
        ++this.keys[38];
        this.entities[0].jump(30.);
      }
      
      if(this.keys[32] > 0){
        ++this.keys[32];
        //this.entities[0].attack(20.);
      }
    }
  }

  update(dt){
    // 1º Update Floors.
    this.floor.forEach(e => e.update(dt));

    // 2º Update Entities.
    this.entities.forEach(e => e.update(dt, this));

    this.camera.update();
  };

  render(){
    //this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = "#50ceff";
    this.ctx.rect(0, 0, this.width, this.height);
    this.ctx.fill();

    // Render Main Graphics
    this.ctx.save();
      // Translate Camera
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate(-this.camera.rotation);
      this.ctx.translate(-this.width / 2, -this.height / 2);
      this.ctx.translate(this.camera.position.x, this.camera.position.y);

      //this.draw_gravitational_map();
      // Draw Everithing Else
      this.floor.forEach(e=>{ e.draw(this.ctx); });
      this.entities.forEach(e=>{ e.draw(this.ctx); });

    this.ctx.restore();

    // Render GUI
    this.camera.draw_gui(this.ctx);
  };

  play(time){
    const now = window.performance.now();
    const delta = now - this.last_frame;
    if(delta > this.max_frames){

      this.last_frame = now - (delta % this.max_frames);
      this.fps = 1000 / (time - this.last_time);
      this.last_time = time;

      const dt = this.fps / 1000;
      // Interrupts
      this.keycontroller();

      // Game Updates
      this.update(dt);
      this.render();

    }

    this.stop = window.requestAnimationFrame((e) => this.play(e));
  };

  /*
    let normal be n
    let vertex be v
    let position be p
    n . (p - v) = ||n||||p - v||sin(alpha),
    sin(aplha) >= 0 => 0 <= aplha <= PI / 2
    because sin(alpha) >= 0 => n . (p - v) / (||n||||p - v||) >= 0
    ||n|| = 1
    || p - v || > 0
    then it can be optimized => n . (p - v) >= 0
  */
  nearest_side(vector, floor){
    let v2 = floor.edges();
    let k = -1, last = 1e10;
    let last_element = v2.length - 1;
    for(let i = 0; i < last_element; ++i){
      let ps = new Vector(vector.x - v2[i].x, vector.y - v2[i].y);
      let nr = floor.normals[i];
      let ds = nr.dot(ps) < EPSILON ? 1e10 : getDistanceSegment(v2[i], v2[i + 1], vector);
      if(ds < last){
        k = i;
      }
    }

    let ps = new Vector(vector.x - v2[last_element].x, vector.y - v2[last_element].y);
    let nr = floor.normals[last_element];
    let ds = nr.dot(ps) < EPSILON ? 1e10 : getDistanceSegment(v2[last_element], v2[0], vector);
    return ds < last ? last_element : k;
  };


  draw_gravitational_map(){
    const division = 50;
    let angle_space = this.camera.rotation;
    let cs = Math.cos(angle_space), sn = Math.sin(angle_space);

    let hw = this.width / 2;
    let hg = this.height / 2;

    let rw = Math.max(hw, Math.abs(hw * cs - hg * sn));
    let rh = Math.max(hg, Math.abs(hg * cs + hw * sn));

    let vector_space = this.camera.position.subtract(new Vector(hw, hg));

    let px = 2 * rw / division;
    let py = 2 * rh / division;

    this.ctx.strokeStyle = "red";

    for(let j = -rh; j <= rh; j += py){
      for(let i = -rw; i <= rw; i += px){
        let vector = new Vector(i, j, 0.0).subtract(vector_space);
        let fc = this.force_in_point(vector);
        let new_coord = this.nearest_side(vector, fc.body); // Get the ID.
        if(new_coord >= 0){
          let vc = fc.body.normals[new_coord];
          this.ctx.beginPath();
          this.ctx.moveTo(vector.x, vector.y);
          this.ctx.lineTo(vector.x - vc.x * 5, vector.y - vc.y * 5);
          this.ctx.stroke();
        }else{
          // Find Nearest Vertice
          let nearest_edge = fc.body.edges().map(e => e.subtract(vector)).sort((a, b) => (a.length - b.length))[0].normalize();
          this.ctx.beginPath();
          this.ctx.moveTo(vector.x, vector.y);
          this.ctx.lineTo(vector.x + nearest_edge.x * 10, vector.y + nearest_edge.y * 10);
          this.ctx.stroke();
        }
      }
    }
  };


  force_in_point(entity){
    let gravitational_element = {body: null, force: new Vector(), length: 0.0};
    
    for(let i = 0; i < this.floor.length; ++i){
      // Finding the most "attractive" body.
      const floor = this.floor[i];
      if(floor.parent === null){
        const dv = floor.position.subtract(entity);
        const attractive_force = floor.mass / dv.dot(dv);
        if(attractive_force > gravitational_element.length){ // vc = -G * m1 / d^2
          gravitational_element.body = floor;
          gravitational_element.force = dv.normalize();
          gravitational_element.length = attractive_force;
        }
      }
    }
    return gravitational_element;
  }

  load_level(i){
    
  };

  resize(){
    this.canvas.width = this.width = window.innerWidth;
    this.canvas.height = this.height = window.innerHeight;
  };

  init(){
    // Initialize Canvas
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.resize();

    // Initialize Camera
    this.camera = new Camera(this);

    
    // Initialize Sprites
    const sprites_queue = new Promise((ok, bad) => {
      fetch("./json/sprites.json").then(e => {
        e.json().then(json => {
          Promise.all(Object.keys(json).map(e => Sprite.load(json[e]))).then(e => {
            // Set pair key -> sprite
            Object.keys(json).forEach((k, i) => this.sprites[k] = e[i]);
            ok();
          });
        });
      });
    });
    // Initialize Levels
    sprites_queue.then( _ => {
      const levels_queue = new Promise((ok, bad) => {
        fetch("./json/levels.json").then(e => {
          e.json().then(json => {
            let lvl = json["lvl1"];

            let allFloors = new Array();
            // Adding all floors into queue.
            lvl.floors.forEach(first_layer => {

              let x_floor = first_layer.position[0];
              let y_floor = first_layer.position[1];

              let first_layer_floor = new Floor(x_floor, y_floor, first_layer.rotation, null);
              allFloors.push({
                  floor: first_layer_floor,
                  descriptor: first_layer,
                }
              );

              // Add children to floor buffer.
              first_layer.children.forEach(second_layer => {

                let x_child = x_floor - second_layer.position[0];
                let y_child = y_floor - second_layer.position[1];

                allFloors.push({
                  floor: new Floor(x_child, y_child, second_layer.rotation, first_layer_floor),
                  descriptor: second_layer,
                });
              });
            });

            // Create each shape for its floor.
            allFloors.forEach(floor_descriptor => {
              let info = floor_descriptor.descriptor;
              switch(info.type){
                case "rectangle":
                  floor_descriptor.floor.rectangle(info.width, info.height);
                break;
                case "shape":
                  floor_descriptor.floor.regular_polygon(info.sides, info.radius);
                break;
              }
              floor_descriptor.floor.init();
              this.floor.push(floor_descriptor.floor);
            });

            ok();
          });
        });
      });

      levels_queue.then(e => {
        // Initialize player
        this.entities[0] = new Player(-300, -140, this);
        /*for(let i = 1; i < 10; ++i){
          this.entities[i] = new Slime(
            (Math.random() * 2 - 1) * 800, 
            (Math.random() * 2 - 1) * 800, 
            this);
        }
        for(let i = 10; i < 20; ++i){
          this.entities[i] = new Enemy1(
            (Math.random() * 2 - 1) * 800, 
            (Math.random() * 2 - 1) * 800, 
            this);
        }*/
        this.camera.lookAt(this.entities[0]);
  
        // Play Game
        this.last_frame = window.performance.now();
        this.play();
      });
    });
  };

};

const game = new Game();
