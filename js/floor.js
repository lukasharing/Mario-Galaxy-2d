class Floor extends Shape{

  constructor(_x, _y, _vangular, _parent){
    super(_x, _y);
    this.parent = _parent;
    this.angular_velocity = _vangular;

    this.texture = null;
  };

  init(){
    this.generate_texture();
  };
  
  /*  
    Triangle:
      v1: (0, 0, 0)
      v2: (a1, a2, a3)
      v3: (b1, b2, b3)
  */
  texture_triangle(ctx, v1, v2){

    const sprite = game.sprites["tiles"];

    const v1v2 = v2.subtract(v1);

    ctx.save();
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);

      ctx.clip();

      ctx.translate(v1.x, v1.y);
      ctx.rotate(v1v2.alpha);

      const ds = v1v2.length;
      for(let i = 0; i < ds; i += sprite.size.x){
        ctx.drawImage(
          sprite.image,
          0,
          0,
          32,
          32,
          -sprite.size.x >> 1,
          0,
          32,
          32
        );
        ctx.translate(sprite.size.x, 0);
      }
    ctx.restore();

    /*ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.rect(-this.texture.width >> 1, -this.texture.height >> 1, this.texture.width, this.texture.height);
      ctx.fill();
    ctx.restore();*/
  };

  generate_texture(){

    const canvas = this.texture = document.createElement("canvas");
    const xs = this.collision.map(e => e.x);
    const ys = this.collision.map(e => e.y);
    const dw = Math.max(...xs) - Math.min(...xs);
    const dh = Math.max(...ys) - Math.min(...ys);
    canvas.width = dw;
    canvas.height = dh;

    const ctx = canvas.getContext("2d");

    ctx.save();

      ctx.translate(dw >> 1, dh >> 1);

      // Create Dark Area
      ctx.save();
        const fix_factor = 0.98;
        ctx.scale(fix_factor, fix_factor);
        ctx.fillStyle = "#182c3b";
        ctx.beginPath();
          ctx.moveTo(this.collision[0].x, this.collision[0].y);
          for(let i = 1; i < this.collision.length; ++i){
            ctx.lineTo(this.collision[i].x, this.collision[i].y);
          }
        ctx.closePath();
        ctx.fill();
      ctx.restore();

      for(let i = 0; i < this.collision.length - 1; ++i){
        this.texture_triangle(ctx, this.collision[i], this.collision[i + 1]);
      }
      
      this.texture_triangle(ctx, this.collision[this.collision.length - 1], this.collision[0]);
    ctx.restore();
  };

  // Override Position
  get position(){
    if(this.parent instanceof Shape){
      const dif = this.parent.position.subtract(super.position).rotate(this.parent.rotation);
      return this.parent.position.add(dif);
    }
    return super.position;
  };

  set position(p){
    super.position = p;
  };

  draw(ctx){
    ctx.save();
      ctx.translate(this.p.x, this.p.y);
      ctx.translate(-this.texture.width >> 1, -this.texture.height >> 1);
      ctx.drawImage(this.texture, 0., 0.);
    ctx.restore();
  };

  update(){
    let angular = this.angular_velocity;

    if(this.parent instanceof Shape){
      angular += this.parent.angular_velocity;
    }

    if(angular != 0.0){
      this.rotate(angular);
    }
  };
}