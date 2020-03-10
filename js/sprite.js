class Sprite{
  constructor(_i, _w, _h, _f){
    this.image = _i;
    this.size = new Vector(_w, _h);
    this.frames = _f;
  };

  static load(object){

    return new Promise((resolve, reject) => {
      const gfx = new Image();
      gfx.onload = ()=>{
        resolve(new Sprite(gfx, object.width, object.height, object.frames));
      };

      gfx.onerror = ()=>{
        reject();
      };
      
      gfx.src = `./img/${object.src}`;
    });

  };

};
