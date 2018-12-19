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

    // Camera
    this.camera;

    // Drawing Variables
    this.ctx = null;
    this.entities = new Array(MAX_ENTITIES); // Entity 0 = Player
    this.floor = new Array();

    // Time Variables
    this.stop = null;
    this.time = 0;
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
          v = v.add(this.entities[0].coordSystem[0].scale(1.0));
        }

        if(this.keys[39] > 0){
          ++this.keys[39];
          v = v.subtract(this.entities[0].coordSystem[0].scale(1.0));
        }

        if(this.keys[32] > 0){
          ++this.keys[32];
          v = v.add(this.entities[0].jump(20.0));
        }
      }
      this.entities[0].velocity = v;
    }
  }

  update(){
    // 1º Update Floors.
    this.floor.forEach(e=>{ e.update(this.time); });

    // 2º Update Entities.
    this.entities.forEach(e=>{ e.update(this); });


    this.camera.update();
  };

  render(){
    //this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
      // Translate Camera
      this.ctx.translate(this.width / 2, this.height / 2);
      this.ctx.rotate(this.camera.rotation);
      this.ctx.translate(-this.width / 2, -this.height / 2);
      this.ctx.translate(this.camera.position.x, this.camera.position.y);

      this.draw_gravitational_map();
      // Draw Everithing Else
      this.floor.forEach(e=>{ e.draw(this); });
      this.entities.forEach(e=>{ e.draw(this); });

    this.ctx.restore();
  };

  play(){
    // Update Game Time
    this.time++;
    this.keycontroller();

    this.update();
    this.render();

    this.stop = window.requestAnimationFrame( e => this.play() );
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
    let v2 = floor.getEdges();
    let k = -1, last = 1e10;
    let last_element = v2.length - 1;
    for(let i = 0; i < last_element; ++i){
      let ps = new Vector(vector.x - v2[i].x, vector.y - v2[i].y);
      let nr = floor.normals[i];
      let ds = nr.dot(ps) < 0.0 ? 1e10 : getDistanceSegment(v2[i], v2[i + 1], vector);
      if(ds < last){
        k = i;
      }
    }

    let ps = new Vector(vector.x - v2[last_element].x, vector.y - v2[last_element].y);
    let nr = floor.normals[last_element];
    let ds = nr.dot(ps) < 0.0 ? 1e10 : getDistanceSegment(v2[last_element], v2[0], vector);
    return ds < last ? last_element : k;
  };


  draw_gravitational_map(){
    const division = 20;
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
        let fc = this.getForceInPoint(vector);
        let new_coord = this.nearest_side(vector, fc.body); // Get the ID.
        if(new_coord >= 0){
          let vc = fc.body.normals[new_coord];
          this.ctx.beginPath();
          this.ctx.moveTo(vector.x, vector.y);
          this.ctx.lineTo(vector.x - vc.x * 10, vector.y - vc.y * 10);
          this.ctx.stroke();
        }else{
          // Find Nearest Vertice
          let nearest_edge = fc.body.getEdges().map(e => e.subtract(vector)).sort((a, b) => (a.length - b.length))[0].normalize();
          this.ctx.beginPath();
          this.ctx.moveTo(vector.x, vector.y);
          this.ctx.lineTo(vector.x + nearest_edge.x * 10, vector.y + nearest_edge.y * 10);
          this.ctx.stroke();
        }
      }
    }
  };


  getForceInPoint(entity){
    let gravitational_element = {body: null, force: new Vector(), length: 0.0};

    for(let i = 0; i < this.floor.length; ++i){
      // Finding the most "attractive" body.
      const floor = this.floor[i];
      if(floor.parent === null){
        const dv = floor.position.subtract(entity);
        const attractive_force = (floor.mass ** 2)  / dv.dot(dv);
        if(attractive_force > gravitational_element.length){ // vc = -G * m1 / d^2
          gravitational_element.body = floor;
          gravitational_element.force = dv.normalize();
          gravitational_element.length = attractive_force;
        }
      }
    }
    return gravitational_element;
  }

  init(){
    const canvas = document.getElementById("game");
    canvas.width = this.width = 700;
    canvas.height = this.height = 500;
    this.ctx = canvas.getContext("2d");

    fetch("./levels/levels.json").then(e => {
      e.json().then(json => {
        let lvl = json["lvl1"];

          // Create Camera
          this.camera = new Camera(this);

          // Add Player
          this.entities[0] = new Entity(200, 0, 10, 14);
          this.camera.lookAt(this.entities[0]);

          let allFloors = new Array();
          // Adding all floors into queue.
          lvl.floors.forEach(first_layer => {
            let first_layer_floor = new Floor(first_layer.x, first_layer.y, first_layer.rotation, null);
            allFloors.push({
                floor: first_layer_floor,
                descriptor: first_layer,
              }
            );

            // Add children to floor buffer.
            first_layer.children.forEach(second_layer => {
              allFloors.push({
                floor: new Floor(first_layer.x + second_layer.x, first_layer.y + second_layer.y, second_layer.rotation, first_layer_floor),
                descriptor: second_layer,
              });
            });
          });

          // Create each shape for its floor.
          allFloors.forEach(floor_descriptor => {
            let info = floor_descriptor.descriptor;
            switch(info.type){
              case "rectangle":
                floor_descriptor.floor.makeRectangle(info.width, info.height);
              break;
              case "shape":
                floor_descriptor.floor.makeRegularPolygon(info.sides, info.radius);
              break;
            }
            this.floor.push(floor_descriptor.floor);
          });

          Promise.all([
            this.load_gfx("./img/player.png")
          ]).then(e=>{
            this.play();
          });
      });
    });
  };

};
