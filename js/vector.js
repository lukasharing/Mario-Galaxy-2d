const PI = Math.PI;
const H_PI = PI / 2;

class Vector {
  constructor(_x = 0.0, _y = 0.0, _z = 0.0) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.length = Math.sqrt(this.dot(this));
  }

  dot(_v){ return (this.x * _v.x + this.y * _v.y + this.z * _v.z); };
  angle(_v){ return Math.acos(this.dot(_v) / (_v.length * this.length)); };

  add(_v){ this.x += _v.x; this.y += _v.y; this.z += _v.z; this.length = Math.sqrt(this.dot(this)); return this; };
  subtract(_v){ this.x -= _v.x; this.y -= _v.y; this.z -= _v.z; this.length = Math.sqrt(this.dot(this)); return this; };
  scale(_s){ this.x *= _s; this.y *= _s; this.z *= _s; this.length *= _s; return this; };
  projection(_v){ const a = this.dot(_v) / (v.length * v.length); return _v.clone().scale(a); };
  normalize(){ this.x /= this.length; this.y /= this.length; this.z /= this.length; this.length = 1.0; return this; };
  clone(){ return new Vector(this.x, this.y, this.z); };
  perpendicular(){ return new Vector(-this.y, this.x, this.z); return this; };
  mid(_v){ return new Vector((this.x + _v.x) / 2, (this.y + _v.y) / 2, (this.z + _v.z) / 2); };

  draw(ctx){
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(10,-5);
    ctx.lineTo(15, 0);
    ctx.lineTo(10, 5);
    ctx.lineTo(10, 0);
    ctx.stroke();
  };
}


function getEdgesVector(el){
  let fcs = Math.cos(el.theta);
  let fsn = Math.sin(el.theta);
  let csx = el.collision.x * fcs;
  let sny = el.collision.y * fsn;
  let snx = el.collision.x * fsn;
  let csy = el.collision.y * fcs;
  let mrx = csx - sny;
  let mry = snx + csy;
  let mix = csx + sny;
  let miy = snx - csy;
  let vectors = new Array(4);
  vectors[0] = new Vector(el.position.x + mrx, el.position.y + mry, 0.0);
  vectors[1] = new Vector(el.position.x + mix, el.position.y + miy, 0.0);
  vectors[2] = new Vector(el.position.x - mix, el.position.y - miy, 0.0);
  vectors[3] = new Vector(el.position.x - mrx, el.position.y - mry, 0.0);
  return vectors;
}

function getCoordSystem(v1, v2){
  return [
    (v1[0].clone().subtract(v1[1])).normalize(),
    (v1[0].clone().subtract(v1[2])).normalize(),
    (v2[0].clone().subtract(v2[1])).normalize(),
    (v2[0].clone().subtract(v2[2])).normalize()
  ];
}

function shortestAngle(a, b){
    if(Math.abs(b - a) < PI){
      return (b - a);
    }
    if(b > a){
      return (b - a - 2 * PI);
    }
    return (b - a +  2 * PI);
}

function getDistanceSegment(v1, v2, p){
  let segment = v2.clone().subtract(v1);
  let sg2 = p.clone().subtract(v1);
  let t = Math.max(0.0, Math.min(1.0,  sg2.dot(segment) / (segment.length * segment.length)));
  let proj = v1.clone().add(segment.clone().scale(t));
  return {ds: proj.subtract(p).length, vc: segment};
}
