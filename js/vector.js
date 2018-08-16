const PI = Math.PI;
const H_PI = PI / 2;

class Vector {
  constructor(_x = 0.0, _y = 0.0, _z = 0.0) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
  }

  // GETTER / SETTER
  get length(){ return Math.sqrt(this.dot(this)); };

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
  draw(ctx, x = 0.0, y = 0.0){
    let a = Math.atan2(this.y, this.x);
    let l = this.length;
    ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.moveTo(0, 0);
      ctx.lineTo(l, 0);
      ctx.lineTo(l,- 10);
      ctx.lineTo(l + 10, 0);
      ctx.lineTo(l, 10);
      ctx.lineTo(l, 0);
      ctx.stroke();
    ctx.restore();
  };
}

function getDistanceSegment(v1, v2, p){
  let segment = v2.subtract(v1);
  let sg2 = p.subtract(v1);
  let t = sg2.dot(segment) / (segment.length * segment.length);

  if(t < 0 || t > 1){ return 1e10; }
  let proj = v1.add(segment.scale(t));
  return proj.subtract(p).length;
}
