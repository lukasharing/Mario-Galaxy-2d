const MAX_ENTITIES = 128;
const MAX_GFXS = 256;
const MAX_FPS = 10.0;

// Vectors;
const VECTOR_L = new Vector(-1, 0);
const VECTOR_R = new Vector(1, 0);
const VECTOR_T = new Vector(0, -1);
const VECTOR_B = new Vector(0, 1);

const SINGLE_TOUCH_MS = 80.0;
const TOUCH_RADIUS_EFFECT = 50.0;

// KEYS
const KEYS = {
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32
}

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
    this.total_entities = 0;
    this.entities = new Array(MAX_ENTITIES); // Entity 0 = Player
    this.sprites = {};
    this.floor = new Array();

    // Time Variables
    this.stop = null;
    this.last_frame = 0;
    this.last_time = 0;
    this.frames = 0;
    this.max_frames = 1000 / 60;

    this.touch_origin = new Vector();
    this.touch_attack = -1;
  };

  get_gfx(id){ return this.cache_gfx[id]; };

  /* KEYS EVENTS */
  key_press(_key){ ++this.keys[_key]; };
  key_unpress(_key){ this.keys[_key] = 0; };

  key_controller(){
    if(this.entities[0].coordSystem[0] !== null){
      if(this.keys[KEYS.LEFT] > 0){ // Left
        ++this.keys[KEYS.LEFT];
        this.entities[0].move_left(10.);
      }

      if(this.keys[KEYS.RIGHT] > 0){
        ++this.keys[KEYS.RIGHT];
        this.entities[0].move_right(10.);
      }

      if(this.keys[38] > 0){
        ++this.keys[38];
        this.entities[0].jump(300.);
      }
      
      if(this.keys[KEYS.SPACE] > 0){
        ++this.keys[KEYS.SPACE];
        this.entities[0].shoot(20.);
        //this.entities[0].attack(20.);
      }
    }

    // TWO PLAYER
    if(true){
      if(this.keys[65] > 0){ // Left
        ++this.keys[65];
        this.entities[1].move_left(10.);
      }
      
      if(this.keys[68] > 0){
        ++this.keys[68];
        this.entities[1].move_right(10.);
      }

      if(this.keys[87] > 0){
        ++this.keys[87];
        this.entities[1].jump(300.);
      }
    }
  };

  /* TOUCH EVENTS */

  touch_start(touches){
    
    const tx = touches[0].clientX;
    const ty = touches[0].clientY;

    touchwheel.style.opacity = 1;
    touchwheel.style.left = `${tx}px`;
    touchwheel.style.top = `${ty}px`;
    wheel.style.transform = `translate(0, 0)`;

    const current_time = (new Date()).getTime();
    
    this.touch_origin = new Vector(tx, ty);

    if(touches.length > 1){
      this.touch_attack = current_time;
    }

  };

  touch_move(touches){

    const touch_coords = new Vector(touches[0].clientX, touches[0].clientY);
    
    const dtouch = touch_coords.subtract(this.touch_origin);

    const wheel_position = dtouch.clamp(40.0);
    wheel.style.transform = `translate(${wheel_position.x}px, ${wheel_position.y}px)`;

    this.id_touch = -1;
    if(dtouch.length > TOUCH_RADIUS_EFFECT){
      this.id_touch = Math.floor(positive_radians(dtouch.alpha + QPI) / HPI);
    }

  };

  touch_end(touches){
    
    touchwheel.style.opacity = 0;

    if(touches.length === 0){
      this.id_touch = -1;
    }

    const current_time = (new Date()).getTime();

    if(this.touch_attack >= 0 && (current_time - this.touch_attack) < SINGLE_TOUCH_MS){
      this.touch_attack = -1;
      //this.entities[0].attack(30.);
    }

  };

  touch_controller(){

    switch(this.id_touch){
      case 0: this.entities[0].move_right(10.);  break;
      case 1: this.entities[0].jump(300.);  break;
      case 2: this.entities[0].move_left(10.); break; 
    }

  };

  /* Controller */
  controller(){
    // Interrupts (Preference on touch)
    if(this.id_touch >= 0){
      this.touch_controller();
    }else{
      this.key_controller();
    }
  }
  
  update(dt){
    // 1º Update Floors.
    this.floor.forEach(e => e.update(dt));

    // 2º Update Entities.
    this.entities.forEach(e => {
      if(e.alive){
        e.update(dt, this);
      }
    });

    this.camera.update(dt);
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
      this.ctx.translate(-this.camera.position.x, -this.camera.position.y);

      //this.draw_gravitational_map();
      // Draw Everithing Else
      this.floor.forEach(e=>{ e.draw(this.ctx); });
      this.entities.forEach(e=>{
        if(e.alive){ 
          e.draw(this.ctx);
        }
      });

    this.ctx.restore();

    // Render GUI
    this.camera.draw_gui(this.ctx);
  };

  play(time){
    const now = window.performance.now();
    const delta = now - this.last_frame;
    if(delta > this.max_frames){

      this.last_frame = now - (delta % this.max_frames);
      const dt = (time - this.last_time);
      this.fps = 1000 / dt;
      this.last_time = time;

      this.controller();

      // Game Updates
      this.update(1./dt);
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
    this.camera.resize();
  };

  append_entity(entity_type, x, y, params){
    if(this.total_entities >= MAX_ENTITIES){
      return null;
    }

    const entity = this.entities[this.total_entities] = new entity_type(this, x, y)
    ++this.total_entities;
    return entity;
  };

  init(){
    // Initialize Canvas
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");

    // Initialize Camera
    this.camera = new Camera(this);

    // Resize
    this.resize();

    
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
        this.append_entity(Player, -300, -140);
        this.append_entity(Player, -300, -140);
        if(false){
          for(let i = 0; i < 10; ++i){
            this.append_entity(Slime, (Math.random() * 2 - 1) * 800, -140, 0);
          }
          for(let i = 0; i < 10; ++i){
            this.append_entity(Enemy1, (Math.random() * 2 - 1) * 800, -140, 0);
          }
        }
        this.camera.lookAt(this.entities[0]);
  
        // Play Game
        this.last_frame = window.performance.now();
        this.play();
      });
    });
  };

};

const game = new Game();
