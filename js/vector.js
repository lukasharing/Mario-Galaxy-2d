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

  add(_v){ return new Vector(this.x + _v.x, this.y + _v.y, this.z + _v.z); };
  subtract(_v){ return new Vector(this.x - _v.x, this.y - _v.y, this.z - _v.z); };
  scale(_s){ return new Vector(this.x * _s, this.y * _s, this.z * _s); };
  projection(_v){ const a = this.dot(_v) / (v.length * v.length); return _v.scale(a); };
  normalize(){ return new Vector(this.x / this.length, this.y / this.length, this.z / this.length); };
  perpendicular(){ return new Vector(-this.y, this.x, this.z); return this; };
  mid(_v){ return new Vector((this.x + _v.x) / 2, (this.y + _v.y) / 2, (this.z + _v.z) / 2); };
  rotate(a){ let c = Math.cos(a), s = Math.sin(a); return new Vector(c * this.x - s * this.y, s * this.x + c * this.y, this.z); }
  draw(ctx){
    let a = Math.atan2(-this.y, this.x);
    ctx.save();
      ctx.beginPath();
      ctx.rotate(a);
      ctx.moveTo(0, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(10,-5);
      ctx.lineTo(15, 0);
      ctx.lineTo(10, 5);
      ctx.lineTo(10, 0);
      ctx.stroke();
    ctx.restore();
  };
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
  let segment = v2.subtract(v1);
  let sg2 = p.subtract(v1);
  let t = Math.max(0.0, Math.min(1.0,  sg2.dot(segment) / (segment.length * segment.length)));
  let proj = v1.add(segment.scale(t));
  return {ds: proj.subtract(p).length, vc: segment};
}
