var socket;

var WIDTH = 600;
var HEIGHT = 400;
var gi = 0;

var date = new Date();

var verticalInput = 0;
var horizontalInput = 0;

var ships = new Map();
var bullets = new Map();
var particles = [];
var comets = [];
var asteroids = [];

var myShip;
var myId;

var currTime;
var prevTime = new Date().getTime();
var dt;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  frameRate(60);

  // Start a socket connection to the server
  socket = io.connect(window.location.origin);

  socket.on('p', //position
    function(data) {
      let sh = ships.get(data.id);
      if(typeof sh === 'undefined'){
        sh = new Ship(data.x,data.y);
        sh.usePseudoPos = true;
        ships.set(data.id, sh);
      }
      
      let timeDif = (currTime-data.time)/1000;

      sh.pPos = sh.pos.copy();

      sh.serverUpdate(data);
      sh.move(timeDif);

      sh.pVel = sh.pos.copy();
      sh.pVel.sub(sh.pPos);
      sh.pVel.div(0.1);
      sh.timeToCompensationEnd = 0.1;
    }
  );

  socket.on('b', //bullet
    function(data) {
      let b = new Bullet(data.a, data.x, data.y, data.s, data.id);
      let timeDif = (currTime-data.t)/1000;
      b.move(timeDif);

      b.usePseudoPos = true;   
      b.pPos = ships.get(data.s).pos.copy();
      b.pVel = b.pos.copy();
      b.pVel.sub(b.pPos);
      b.pVel.div(0.1);
      b.timeToCompensationEnd = 0.1;

      bullets.set(data.s + data.id, b);
    }
  );

  socket.on('h', //hit
    function(data) {
      let sh = ships.get(data.h);
      sh.hit();
      bullets.delete(data.s + data.id);    
    }
  );

  socket.on('d', //destroyed
    function(data) {
      let sh = ships.get(data.id);
      if(typeof sh !== 'undefined'){
        sh.pos.x = data.x;
        sh.pos.y = data.y;
        sh.destroyed(false);
      }
    }
  );

  socket.on('c', //comet
    function(data) {
      let timeDif = (currTime-data.t)/1000;
      let c = new Comet(data.x, data.y, data.vx, data.vy, data.r);
      c.move(timeDif);
      comets.push(c);
    }
  );

  //called once we connect
  socket.on('connected',
    function(data) {
      myId = data.id;
      myShip = new Ship(data.x,data.y);

      for(let i = 0; i < data.xs.length; i++){
        print("aste");
        let a = new Asteroid(data.xs[i], data.ys[i], data.s[i]);
        asteroids.push(a);
      }
    }
  );
}

function draw() {
  currTime = new Date().getTime();
  dt = (currTime - prevTime)/1000;

  background(0);
  verticalInput = 0;
  horizontalInput = 0;

  for(let a of asteroids){
    a.show();
  }

  for(let b of bullets.values()) {
    if(b.update()){
      bullets.delete(b.shooter + b.id);
    }
    else {
      b.move(dt);
      b.show();
    }
  }

  if(typeof myShip !== "undefined") {
    let changed = myShip.input();
    myShip.update();
    myShip.move(dt);
    
    gi++;
    if(gi%10 == 0 || changed) {
     myShip.sendData();
    }
    
    fill(255);
    myShip.show();
  }

  for(sh of ships.values()) {
    sh.move(dt);
    fill(0,255,255,255);
    sh.show();
  }

  for(let i = comets.length - 1; i >= 0; i--){
    let c = comets[i];
    if(c.update()){
      comets.splice(i, 1);
    }
    else {
      c.move(dt);
      c.show();
    }
  }

  for(let i = particles.length - 1; i >= 0; i--){
    let p = particles[i];
    p.update(dt);
    p.show();
    if(p.life == 0) {
      particles.splice(i, 1);
    }
  }

  prevTime = currTime;
}

