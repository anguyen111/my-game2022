// global variables
let canvas = null;
let ctx = null;

// Variables for game measurements
let TILESIZE = 64;
let TILESWIDE = 20;
let TILESHIGH = 9;
let WIDTH = TILESWIDE*TILESIZE;
let HEIGHT = TILESHIGH*TILESIZE;
let BGCOLOR = "blue";

let allSprites = [];
let allWalls = [];
let allCacti = [];

let keysDown = {};
let keysUp = {};

function drawText(r, g, b, a, font, align, base, text, x, y) {
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.fillText(text, x, y);
}

// Event listeners that wait for keyboard input
addEventListener("keydown", function (event) {
    // keysDown = {};
    keysDown[event.key] = true;
    console.log(event);
}, false);
// Event listeners that delete keyboard input
addEventListener("keyup", function (event) {
    keysUp[event.key] = true;
    delete keysDown[event.key];
    console.log("the key that was removed " + event);
}, false);

// String that olds value we can use to build level
let gamePlan = `
#.....................
......................
......................
.............|........
...........#####......
......................
.|................|...
####..################
####..################`;

// this is like a MOLD
class Sprite {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.speed = 3;
        allSprites.push(this);
    }
    create(x,y,w,h) {
        return new Sprite(x, y, w, h)
    }
    // snses if objects collide
    collideWith(obj){
        if (this.x + this.w >= obj.x &&
            this.x <= obj.x + obj.w &&
            this.y + this.h >= obj.y &&
            this.y <= obj.y + obj.h
        ) {
            return true;
        }

    }
    // update method
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

// the wall is like a sprite, so it is very similar
class Wall extends Sprite {
    constructor (x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = 'rgb(0, 200, 200)';
        allWalls.push(this);
    }
    create(x,y,w,h) {
        return new Wall(x, y, w, h)
    }
}

// same for cacti
class Cactus extends Sprite {
    constructor (x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = 'rgb(0, 255, 0)';
        allCacti.push(this);
    }
    create(x,y,w,h) {
        return new Cactus(x, y, w, h)
    }
}

// the player
class Player extends Sprite {
    constructor(x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 2;
        this.gravity = 9.8;
        this.coFriction = 1;
        this.w = w;
        this.h = h;
        this.color = color;
        this.health = 100;
        this.jumpPower = TILESIZE;
        this.canJump = true;
        allSprites.push(this);
    }
    // how friction is made
    frictionX(){
        if (this.vx > 0.5){
            this.vx -= this.coFriction;
        }
        else if (this.vx < -0.5){
            this.vx += this.coFriction;
        }
        else {
            this.vx = 0;
        }
    }
    // how to jump
    jump() {
        this.vy = -this.jumpPower;
        console.log(this.timesJumped);
        console.log(this.vy);
    }
    // creates the controls
    input() {
        if (" " in keysDown && this.canJump || "w" in keysDown && this.canJump) {
            // this.vy = -1;
            this.canJump = false;
            this.jump();
            console.log("trying to jump...");
        }
        if ("a" in keysDown) {
            this.vx-=this.speed;
        }
        if ("d" in keysDown) {
            this.vx+=this.speed;
        }
    }
    // adding updates....
    update() {
        console.log(this.x);
        this.vy += this.gravity;
        this.input();
        this.frictionX();
        this.x += Math.floor(this.vx);
        this.y += this.vy;
        if (this.x > WIDTH-this.w){
            this.x = WIDTH-this.w;
         }
        if (this.x < 0){
            this.x = 0;
         }
        if (this.y > HEIGHT - this.h){
            this.y = HEIGHT - this.h;
            this.canJump = true;
         }
        if (this.y < 0){
            this.y = 0;
         }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

// makes the level design
function makeGrid(plan, width) {
    let newGrid = [];
    let newRow = [];

    for (i of plan){
        if (i != "\n"){
            newRow.push(i);
        }
        if (newRow.length % width == 0 && newRow.length != 0) {
            newGrid.push(newRow);
            newRow = [];
        }
    }

    return newGrid;
}

// reads the level designs
function readLevel(grid) {
 let startActors = [];
    for (y in grid) {
        for (x in grid[y]) {

            let ch = grid[y][x];

            if (ch != "\n") {
                let type = levelChars[ch];
                if (typeof type == "string") {
                    startActors.push(type);
                } else {
                    let t = new type;
                    startActors.push(t.create(x*TILESIZE, y*TILESIZE, TILESIZE, TILESIZE))
                }
                // console.log(startActors);
            }
        }

    }

}
// les computer interpret the grid
const levelChars = {
    ".": "empty",
    "#": Wall,
    "|": Cactus
};

console.log(makeGrid(gamePlan, 22));
readLevel(makeGrid(gamePlan, 22));
console.log(allWalls);


// initialization function
// creates a div; sets attributes; appends body; creates canvas; puts canvas inside div
function init() {
    let gameDiv = document.createElement("div");
    gameDiv.setAttribute("style", "border: 1px solid;"
    + "width:" + WIDTH + "px; "
    + "height:" + HEIGHT + "px; "
    + "background-color: " + BGCOLOR);
    document.body.appendChild(gameDiv);

    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    
    try {
        gameDiv.appendChild(canvas);
        console.log("game initialized");
    } catch (e){
        alert(e.message);
    }
    gameLoop();
}



let player = new Player(WIDTH/2, HEIGHT/2, TILESIZE, TILESIZE, 'rgb(255, 255, 0)');
console.log(allSprites);
// let spongeBob = new Sprite(10, 10, 30, 30, 'rgb(255, 255, 0)');
// let patrick = new Sprite(10, 30, 65, 65, 'rgb(255, 150, 150)');
// let squidward = new Sprite(70, 90, 20, 20, 'rgb(0, 200, 200)');
// let sandy = new Circle(70, 200, 25, 40, 'rgb(150, 75, 0)');


function update() {
    player.update();
    // creates damage
    for (c of allCacti) {
        if (c.collideWith(player)) {
            console.log("ouch...");
            if (!player.invulnerable) {
                player.health-= 10;
                player.invulnerable = true;
                setTimeout(() => {player.invulnerable = false}, 2000);
            }
        }
    }
    // lets player collide with walls
    for (w of allWalls){
        if (w.collideWith(player)){
            console.log("ouch...");
            player.y = w.y - player.h;
            player.vy = 0;
            player.canJump = true;
        }
    }

}

// creates all the sprites
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (i of allSprites){
        i.draw();
    }
    drawText(0, 0, 0, 1, "20px Helvetica", "left", "top", "FPS: " + fps, TILESIZE / 2, TILESIZE / 2);
    drawText(255, 255, 255, 1, "20px Helvetica", "left", "top", player.health, TILESIZE / 2, 64);
    
}

let fps;
let then = performance.now();
function gameLoop(){
    // console.log('the game loop is alive!!!');
    now = performance.now();
    let delta = now - then;
    fps = (Math.ceil(1000 / delta));
    // totaltime = now - then;
    then = now;
    update();
    draw();
    window.requestAnimationFrame(gameLoop);
}