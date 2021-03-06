class Bullet {
  constructor(angle, x, y, shooter, id) {
    this.pos = createVector(x,y);
    this.vel = createVector(0,400);
    this.vel.rotate(-angle);
    //this.vel.add(shooter.vel);

    this.shooter = shooter;
    this.id = id;

    this.usePseudoPos = false;
    this.pPos = this.pos.copy();
    this.pVel = this.vel.copy();
    this.timeToCompensationEnd = 0;
  }

  update() {
    if(this.pos.x > WIDTH) return true;
    if(this.pos.x < 0) return true;
    if(this.pos.y > HEIGHT) return true;
    if(this.pos.y < 0) return true;

    for(let a of session.asteroids) {
      if( (a.x - this.pos.x)**2 + (a.y - this.pos.y)**2 > a.maxR*a.maxR) continue;

      noiseSeed( a.seed);
      let v = this.pos.copy();
      v.sub(a.x, a.y);

      let d = v.mag();

      v.normalize();

      let xoff = map(v.x,-1,1,0,1.5);
      let yoff = map(v.y,-1,1,0,1.5);
      let r = map(noise(xoff, yoff), 0,1,20,100);

      if(d <= r){
        return true;
      }
    }

    for(let c of session.getComets()) {
      let d = (this.pos.x - c.x)*(this.pos.x - c.x) + (this.pos.y - c.y)*(this.pos.y - c.y);
      if(d < c.r*c.r){
        return true;
      }
    }
    return false;
  }

  move(dt) {
    let ds = this.vel.copy();
    ds.mult(dt);
    this.pos.add(ds);

    if(this.usePseudoPos && this.timeToCompensationEnd > 0) {
      if(this.timeToCompensationEnd <= dt){
        this.timeToCompensationEnd = 0;
      }
      else{
        let dps = this.pVel.copy();
        dps.mult(dt);
        this.pPos.add(ds);
        this.pPos.add(dps);
        this.timeToCompensationEnd -= dt;
      }
    }
  }

  show() {
    if(this.usePseudoPos && this.timeToCompensationEnd > 0) {
      graphics.strokeWeight(4);
      graphics.stroke(255,255,0);
      graphics.point(this.pPos.x, this.pPos.y);
    }
    else {
      graphics.strokeWeight(4);
      graphics.stroke(255,255,0);
      graphics.point(this.pos.x, this.pos.y);
    } 
  }

  onHit() {
    let p = new Particle(this.pos.x, this.pos.y, 0, 0, 0, 2, color(255,255,0,255), 255, -20, color(255,255,0,255), 2.5, -2.5/10, 10);
    session.particles.push(p);
  }


}