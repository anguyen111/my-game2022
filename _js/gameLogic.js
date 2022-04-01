// global variables
let canvas = null;
let ctx = null;

// Variables for game measurements
let WIDTH = 704;
let HEIGHT = 288;
let TILESIZE = 32;
let BGCOLOR = "blue";

let allSprites = [];
let allWalls = [];
let allCacti = [];

let keysDown = {};
let keysUp = {};

// Event listeners that wait for keyboard input
addEventListener("keydown", function (event) {
    // keysDown = {};
    keysDown[event.key] = true;
    console.log(event);
}, false);

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
    collideWith(obj) {
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

class Wall extends Sprite {
    constructor(x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = "rgb(0, 200, 200)";
        allWalls.push(this);
    }
    create(x,y,w,h) {
        return new Wall(x, y, w, h)
    }
    // update method
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Cactus extends Sprite {
    constructor(x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = "rgb(0, 255, 0)";
        allCacti.push(this);
    }
    create(x,y,w,h, color) {
        return new Cactus(x, y, w, h, color)
    }
    // update method
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Player extends Sprite {
    constructor(x, y, w, h, color) {
        super(x, y, w, h, color);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.speed = 10;
        allSprites.push(this);
    }
    input() {
        if ("w" in keysDown) {
            this.y-=this.speed;
        }
        if ("a" in keysDown) {
            this.x-=this.speed;
        }
        if ("s" in keysDown) {
            this.y+=this.speed;
        }
        if ("d" in keysDown) {
            this.x+=this.speed;
        }
    }
    // adding updates....
    update() {
        this.input();
        if (this.x > WIDTH-this.w){
            this.x = WIDTH-this.w;
         }
        if (this.x < 0){
            this.x = 0;
         }
        if (this.y > HEIGHT - this.h){
            this.y = HEIGHT - this.h;
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

class Circle {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.speed = 2;
    }
    update() {
        this.x += this.speed*Math.random()*5;
        this.y += this.speed*Math.random()*5;
        if (this.x > WIDTH || this.x < 0 || this.y < 0 || this.y > HEIGHT){
               this.speed*=-1; 
            }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.w, 0, 2 * Math.PI);
        ctx.stroke();;
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

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

const levelChars = {
    ".": "empty",
    "#": Wall,
    "|": Cactus,
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



let player = new Player(WIDTH/2, HEIGHT/2, 64, 64, 'rgb(255, 255, 0)');
console.log(allSprites)
// let spongeBob = new Sprite(10, 10, 30, 30, 'rgb(255, 255, 0)');
// let patrick = new Sprite(10, 30, 65, 65, 'rgb(255, 150, 150)');
// let squidward = new Sprite(70, 90, 20, 20, 'rgb(0, 200, 200)');
// let sandy = new Circle(70, 200, 25, 40, 'rgb(150, 75, 0)');


function input(){

}

function update() {
    player.update();
    for (i of allCacti){
        if (i.collideWith(player)){
            console.log("ouch")
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    for (i of allSprites){
        i.draw();
    }
}


function gameLoop(){
    // console.log('the game loop is alive!!!');
    update();
    draw();
    window.requestAnimationFrame(gameLoop);
}
