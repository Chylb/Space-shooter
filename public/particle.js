class Particle {
  constructor(x, y, vx, vy, r, vr, fill, a, va, s, sw, vs, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.r = r;
    this.vr = vr;

    this.fill = fill;
    this.a = a; //alpha
    this.va = va; //alpha velocity

    this.stroke = s;
    this.strokeWeight = sw;
    this.vs = vs; //strokeWeigtht velocity

    this.life = life;
  }

  update(dt){
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.r += this.vr;
    this.a += this.va;
    this.fill.setAlpha(this.a);
    this.strokeWeight += this.vs;

    this.life--;
  }

  show() {
    graphics.strokeWeight(this.strokeWeight);
    graphics.stroke(this.stroke);
    graphics.fill(this.fill);

    graphics.ellipse(this.x, this.y, this.r, this.r);
  }
}